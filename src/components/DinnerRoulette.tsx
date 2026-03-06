import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { InventoryItem, Category, CATEGORY_EMOJIS, DayHistory } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface DinnerRouletteProps {
  open: boolean;
  onClose: () => void;
  getItemsByCategory: (cat: Category) => InventoryItem[];
  onConsume: (uuid: string) => void;
  history: Record<string, DayHistory>;
}

type MealSlot = "main" | "side" | "flavor";

interface MealPlan {
  main: InventoryItem | null;
  side: InventoryItem | null;
  flavor: InventoryItem | null;
  freshLabel: string | null;
  message: string;
}

export function DinnerRoulette({ open, onClose, getItemsByCategory, onConsume, history }: DinnerRouletteProps) {
  const { t } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [slotItems, setSlotItems] = useState<string[]>([]);
  const [currentSlot, setCurrentSlot] = useState(0);

  const mealCategories: Category[] = ["protein", "carb", "veggie"];

  // Get oldest ready_meal item (FIFO) from a category
  const getOldest = useCallback((cat: Category): InventoryItem | null => {
    const items = getItemsByCategory(cat)
      .filter((i) => i.type === "ready_meal" && i.quantity > 0)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    return items.length > 0 ? items[0] : null;
  }, [getItemsByCategory]);

  // Detect what category was produced today
  const getCookedTodayCategory = useCallback((): Category | null => {
    const today = new Date().toISOString().split("T")[0];
    const dayData = history[today];
    if (!dayData?.produced || !dayData.details) return null;
    
    // Check details for category hints
    for (const detail of dayData.details) {
      const lower = detail.toLowerCase();
      if (lower.includes("proteína") || lower.includes("protein")) return "protein";
      if (lower.includes("carboidrato") || lower.includes("carb")) return "carb";
      if (lower.includes("legume") || lower.includes("veggie")) return "veggie";
      if (lower.includes("molho") || lower.includes("conserva") || lower.includes("flavor")) return "flavor";
    }
    return null;
  }, [history]);

  const allReadyMeals = mealCategories.flatMap((cat) =>
    getItemsByCategory(cat).filter((i) => i.type === "ready_meal" && i.quantity > 0)
  );
  const flavorItems = getItemsByCategory("flavor").filter((i) => i.quantity > 0);
  const hasAnyItems = allReadyMeals.length > 0;
  const allNames = [...allReadyMeals.map((i) => i.name), ...flavorItems.map((i) => i.name)];

  const generatePlan = useCallback((): MealPlan => {
    const cookedCategory = getCookedTodayCategory();

    if (cookedCategory && mealCategories.includes(cookedCategory)) {
      // Smart pairing: fresh dish + oldest from other categories
      const otherCategories = mealCategories.filter((c) => c !== cookedCategory);
      const side = otherCategories.reduce<InventoryItem | null>((best, cat) => {
        const item = getOldest(cat);
        if (!item) return best;
        if (!best) return item;
        return item.created_at < best.created_at ? item : best;
      }, null);

      return {
        main: cookedCategory === "protein" ? null : getOldest("protein"),
        side: cookedCategory === "protein" ? side : (cookedCategory === "carb" || cookedCategory === "veggie" ? null : side),
        flavor: getOldest("flavor"),
        freshLabel: `${CATEGORY_EMOJIS[cookedCategory]} ${t("freshlyCooked")}`,
        message: t("smartPairingMsg") as string,
      };
    }

    // Lazy day: FIFO everything
    return {
      main: getOldest("protein"),
      side: getOldest("veggie") || getOldest("carb"),
      flavor: getOldest("flavor"),
      freshLabel: null,
      message: t("lazyDayMsg") as string,
    };
  }, [getCookedTodayCategory, getOldest, t]);

  const spin = useCallback(() => {
    if (!hasAnyItems) return;
    setSpinning(true);
    setPlan(null);
    const shuffled = allNames.length > 0 ? [...allNames].sort(() => Math.random() - 0.5) : ["..."];
    setSlotItems(shuffled);
    setCurrentSlot(0);
    let tick = 0;
    const interval = setInterval(() => {
      setCurrentSlot((prev) => (prev + 1) % Math.max(shuffled.length, 1));
      tick++;
      if (tick > 15) {
        clearInterval(interval);
        setSpinning(false);
        setPlan(generatePlan());
      }
    }, 100);
  }, [hasAnyItems, allNames, generatePlan]);

  useEffect(() => { if (open) { setPlan(null); setSpinning(false); } }, [open]);

  const accept = () => {
    if (plan) {
      if (plan.main) onConsume(plan.main.uuid);
      if (plan.side) onConsume(plan.side.uuid);
      if (plan.flavor) onConsume(plan.flavor.uuid);
    }
    onClose();
  };

  const hasPlanItems = plan && (plan.main || plan.side || plan.flavor || plan.freshLabel);

  const renderSlot = (label: string, item: InventoryItem | null, fresh: boolean = false) => {
    if (!item && !fresh) return null;
    return (
      <div className="bg-card rounded-xl px-3 py-2">
        <span className="text-[10px] text-muted-foreground uppercase font-bold">{label}</span>
        {fresh && plan?.freshLabel ? (
          <p className="text-base font-bold font-fredoka text-primary">{plan.freshLabel}</p>
        ) : item ? (
          <>
            <p className="text-base font-bold font-fredoka">
              {CATEGORY_EMOJIS[item.category]} {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("madeOn")} {item.created_at}
            </p>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-[calc(100vw-2rem)] sm:max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-2xl text-center">{t("rouletteTitle")}</DialogTitle>
          <DialogDescription className="text-center">
            {!hasAnyItems ? t("emptyStock") : t("spinToAssemble")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-muted rounded-2xl p-4 min-h-[140px] flex items-center justify-center">
            {spinning ? (
              <motion.div key={currentSlot} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-fredoka font-bold text-center">
                {slotItems[currentSlot] || "..."}
              </motion.div>
            ) : plan ? (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3 w-full">
                {plan.freshLabel && (
                  <div className="bg-primary/10 rounded-xl px-3 py-2 border border-primary/20">
                    <span className="text-[10px] text-primary uppercase font-bold">✨ {t("freshlyCooked")}</span>
                    <p className="text-base font-bold font-fredoka text-primary">{plan.freshLabel}</p>
                  </div>
                )}
                {renderSlot(t("protein") as string, plan.main, false)}
                {renderSlot(t("veggie") as string, plan.side, false)}
                {renderSlot(t("flavor") as string, plan.flavor, false)}
                {!hasPlanItems && <p className="text-muted-foreground">{t("emptyStockShort")}</p>}
                <p className="text-xs text-muted-foreground italic mt-2">{plan.message}</p>
              </motion.div>
            ) : (
              <p className="text-4xl">🍽️</p>
            )}
          </div>
          <div className="space-y-2">
            {!plan ? (
              <Button className="w-full h-14 text-lg font-bold rounded-xl" onClick={spin} disabled={!hasAnyItems || spinning}>
                {spinning ? t("spinning") : t("spin")}
              </Button>
            ) : (
              <>
                <Button className="w-full h-12 font-bold rounded-xl bg-semaphore-green hover:bg-semaphore-green/90 text-white" onClick={accept}>
                  {t("accept")}
                </Button>
                <Button variant="outline" className="w-full h-12 font-bold rounded-xl" onClick={spin}>
                  {t("spinAgain")}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
