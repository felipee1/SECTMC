import { Category, InventoryItem, CATEGORY_EMOJIS } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface ManualConsumeProps {
  open: boolean;
  onClose: () => void;
  getItemsByCategory: (cat: Category) => InventoryItem[];
  onConsume: (uuid: string) => void;
}

export function ManualConsume({ open, onClose, getItemsByCategory, onConsume }: ManualConsumeProps) {
  const { t } = useLanguage();
  const categories: Category[] = ["protein", "carb", "veggie", "flavor"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-xl">{t("manualTitle")}</DialogTitle>
          <DialogDescription>{t("selectConsumed")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {categories.map((cat) => {
            const items = getItemsByCategory(cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                  {CATEGORY_EMOJIS[cat]} {t(cat)}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.uuid} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.quantity} {t("portions")} · {item.created_at}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={() => onConsume(item.uuid)}>
                        -1
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {categories.every((cat) => getItemsByCategory(cat).length === 0) && (
            <p className="text-center text-muted-foreground text-sm py-8">{t("emptyAddFirst")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
