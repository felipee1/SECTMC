import { useState } from "react";
import { Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InventoryItem, Category, CATEGORY_EMOJIS, LOCATION_EMOJIS } from "@/types/inventory";
import { useLanguage } from "@/contexts/LanguageContext";

interface StockViewerProps {
  open: boolean;
  onClose: () => void;
  getItemsByCategory: (cat: Category) => InventoryItem[];
  onConsume: (uuid: string) => void;
}

const categories: Category[] = ["protein", "carb", "veggie", "flavor"];

export function StockViewer({ open, onClose, getItemsByCategory, onConsume }: StockViewerProps) {
  const { t } = useLanguage();
  const today = new Date().toISOString().split("T")[0];

  const allItems = categories.flatMap((cat) => getItemsByCategory(cat).filter((i) => i.quantity > 0));
  const expired = allItems.filter((i) => i.expires_at < today);
  const valid = allItems.filter((i) => i.expires_at >= today);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-lg">{t("stockViewerTitle")}</DialogTitle>
          <DialogDescription>{t("stockViewerDesc")}</DialogDescription>
        </DialogHeader>

        {expired.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-semaphore-red">⚠️ {t("expiredItems")} ({expired.length})</p>
            {expired.map((item) => (
              <div key={item.uuid} className="flex items-center justify-between bg-semaphore-red/10 border border-semaphore-red/20 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {CATEGORY_EMOJIS[item.category]} {item.name}
                  </p>
                  <p className="text-[10px] text-semaphore-red font-bold">
                    {t("expired")} · {item.expires_at} · {LOCATION_EMOJIS[item.location]} {t(item.location)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-bold">{item.quantity}x</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-semaphore-red hover:bg-semaphore-red/20"
                    onClick={() => onConsume(item.uuid)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {valid.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold">{t("validItems")} ({valid.length})</p>
            {valid.map((item) => {
              const daysLeft = Math.ceil((new Date(item.expires_at).getTime() - new Date(today).getTime()) / 86400000);
              return (
                <div key={item.uuid} className="flex items-center justify-between bg-card border rounded-xl px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {CATEGORY_EMOJIS[item.category]} {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {LOCATION_EMOJIS[item.location]} {t(item.location)} · {t("expiresOn")} {item.expires_at}
                      {daysLeft <= 3 && <span className="text-semaphore-yellow font-bold ml-1">({daysLeft}d)</span>}
                    </p>
                  </div>
                  <span className="text-sm font-bold ml-2">{item.quantity}x</span>
                </div>
              );
            })}
          </div>
        ) : expired.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("emptyAddFirst")}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
