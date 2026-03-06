import { useState } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { CalendarIcon, Copy, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Category, ItemType, Subtype, InventoryItem, CATEGORY_EMOJIS, SUBTYPE_LABELS, generateLabel,
  Location, LOCATION_EXPIRY_DAYS, LOCATION_EMOJIS,
} from "@/types/inventory";
import { Recipe } from "@/types/recipe";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductionSheetProps {
  category: Category | null;
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
  recipes: Recipe[];
}

export function ProductionSheet({ category, onClose, onAdd, recipes }: ProductionSheetProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? ptBR : enUS;
  const [step, setStep] = useState<"type" | "details" | "done">("type");
  const [itemType, setItemType] = useState<ItemType | null>(null);
  const [subtype, setSubtype] = useState<Subtype | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(4);
  const [date, setDate] = useState<Date>(new Date());
  const [createdItem, setCreatedItem] = useState<InventoryItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [location, setLocation] = useState<Location>("freezer");

  const reset = () => {
    setStep("type"); setItemType(null); setSubtype(null); setName(""); setQuantity(4);
    setDate(new Date()); setCreatedItem(null); setCopied(false); setSelectedRecipeId(null); setLocation("freezer");
  };
  const handleClose = () => { reset(); onClose(); };

  const selectBase = (sub: Subtype) => { setItemType("base"); setSubtype(sub); setName(SUBTYPE_LABELS[sub]); setStep("details"); };
  const selectReadyMeal = () => { setItemType("ready_meal"); setSubtype(null); setStep("details"); };
  const selectRecipe = (recipe: Recipe) => { setItemType("ready_meal"); setSubtype(null); setName(recipe.name); setSelectedRecipeId(recipe.uuid); setStep("details"); };

  const handleSubmit = () => {
    if (!category) return;
    const dateStr = date.toISOString().split("T")[0];
    const expiresDate = new Date(date);
    expiresDate.setDate(expiresDate.getDate() + LOCATION_EXPIRY_DAYS[location]);
    const item: InventoryItem = {
      uuid: crypto.randomUUID(), category, type: itemType!, subtype,
      name: name || "Sem nome", quantity, location,
      created_at: dateStr,
      expires_at: expiresDate.toISOString().split("T")[0],
    };
    onAdd(item); setCreatedItem(item); setStep("done");
  };

  const copyLabel = () => {
    if (createdItem) { navigator.clipboard.writeText(generateLabel(createdItem)); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!category) return null;

  const categoryRecipes = recipes.filter((r) => r.category === category);

  const categoryConfig: Record<Category, { baseLabel: string; subtypes: Subtype[]; readyLabel: string }> = {
    protein: { baseLabel: t("neutralBase") as string, subtypes: ["beef", "chicken", "pork", "fish"], readyLabel: t("readyProtein") as string },
    carb: { baseLabel: t("neutralBaseCarb") as string, subtypes: [], readyLabel: t("readyCarb") as string },
    veggie: { baseLabel: t("neutralBaseVeggie") as string, subtypes: [], readyLabel: t("readyVeggie") as string },
    flavor: { baseLabel: t("neutralBaseFlavor") as string, subtypes: [], readyLabel: t("readyFlavor") as string },
  };
  const config = categoryConfig[category];

  return (
    <Sheet open={!!category} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] px-4 sm:px-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-fredoka text-xl flex items-center gap-2">
            {CATEGORY_EMOJIS[category]} {t("add")} {t(category)}
          </SheetTitle>
          <SheetDescription>
            {step === "type" && t("chooseType")}
            {step === "details" && t("defineQty")}
            {step === "done" && t("itemAdded")}
          </SheetDescription>
        </SheetHeader>

        {step === "type" && (
          <div className="space-y-3">
            {category === "protein" && (
              <>
                <p className="text-sm font-semibold text-muted-foreground">{config.baseLabel}</p>
                <div className="grid grid-cols-2 gap-2">
                  {config.subtypes.map((sub) => (
                    <Button key={sub} variant="outline" className="h-14 text-base font-semibold rounded-xl" onClick={() => selectBase(sub)}>
                      {t(sub)}
                    </Button>
                  ))}
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t("or")}</span></div>
                </div>
              </>
            )}
            {category !== "protein" && (
              <>
                <Button variant="outline" className="w-full h-14 text-base font-semibold rounded-xl" onClick={() => { setItemType("base"); setSubtype(null); setName(""); setStep("details"); }}>
                  📦 {config.baseLabel}
                </Button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t("or")}</span></div>
                </div>
              </>
            )}
            <Button variant="secondary" className="w-full h-14 text-base font-semibold rounded-xl" onClick={selectReadyMeal}>
              {config.readyLabel}
            </Button>
            {categoryRecipes.length > 0 && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t("fromRecipeBank")}</span></div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                  {categoryRecipes.map((recipe) => (
                    <Button key={recipe.uuid} variant="outline" className="h-12 text-sm font-semibold rounded-xl justify-start text-left" onClick={() => selectRecipe(recipe)}>
                      📖 {recipe.name}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            {itemType === "ready_meal" && !selectedRecipeId && (
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("recipeDishName")}</label>
                <Input placeholder="Ex: Strogonoff" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12 text-base" autoFocus />
              </div>
            )}
            {itemType === "base" && category !== "protein" && (
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("itemName")}</label>
                <Input placeholder={category === "carb" ? "Ex: Arroz, Batata..." : "Ex: Brócolis, Cenoura..."} value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12 text-base" autoFocus />
              </div>
            )}
            {selectedRecipeId && (
              <div className="bg-muted rounded-xl px-3 py-2">
                <p className="text-xs text-muted-foreground">{t("selectedRecipe")}</p>
                <p className="font-semibold">📖 {name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold mb-1 block">{t("portionQty")}</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Button>
                <span className="text-3xl font-bold font-fredoka w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-xl" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">{t("productionDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-12", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, lang === "pt" ? "dd 'de' MMMM, yyyy" : "MMMM dd, yyyy", { locale })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">{t("storageLocation")}</label>
              <div className="flex gap-2">
                {(["freezer", "fridge"] as Location[]).map((loc) => (
                  <Button key={loc} variant={location === loc ? "default" : "outline"} className="flex-1 rounded-xl h-10 text-xs font-semibold" onClick={() => setLocation(loc)}>
                    {LOCATION_EMOJIS[loc]} {t(loc)}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {location === "freezer" ? `⏱️ ${LOCATION_EXPIRY_DAYS.freezer} dias` : `⏱️ ${LOCATION_EXPIRY_DAYS.fridge} dias`}
              </p>
            </div>
            <Button className="w-full h-14 text-lg font-bold rounded-xl mt-2" onClick={handleSubmit}
              disabled={(itemType === "ready_meal" && !selectedRecipeId && !name.trim()) || (itemType === "base" && category !== "protein" && !name.trim())}>
              {t("addToStockBtn")}
            </Button>
          </div>
        )}

        {step === "done" && createdItem && (
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce-in">🎉</div>
            <p className="text-lg font-semibold">{createdItem.quantity}x {createdItem.name} {t("added")}</p>
            <div className="bg-muted rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("writeLabel")}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-fredoka font-bold tracking-wider">{generateLabel(createdItem)}</span>
                <Button variant="ghost" size="icon" onClick={copyLabel} className="h-8 w-8">
                  {copied ? <Check className="w-4 h-4 text-semaphore-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl h-12" onClick={handleClose}>{t("close")}</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
