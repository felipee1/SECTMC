import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryItem, Category, CATEGORY_EMOJIS } from "@/types/inventory";
import { Ingredient } from "@/types/ingredient";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExpiredAlertsProps {
  getItemsByCategory: (cat: Category) => InventoryItem[];
  ingredients: Ingredient[];
  onConsumeItem: (uuid: string) => void;
  onRemoveIngredient: (uuid: string) => void;
}

const categories: Category[] = ["protein", "carb", "veggie", "flavor"];

export function ExpiredAlerts({ getItemsByCategory, ingredients, onConsumeItem, onRemoveIngredient }: ExpiredAlertsProps) {
  const { t } = useLanguage();
  const today = new Date().toISOString().split("T")[0];

  const expiredItems = categories
    .flatMap((cat) => getItemsByCategory(cat))
    .filter((i) => i.quantity > 0 && i.expires_at < today);

  const expiredIngredients = ingredients.filter((i) => i.quantity > 0 && i.expires_at < today);

  if (expiredItems.length === 0 && expiredIngredients.length === 0) return null;

  return (
    <div className="bg-semaphore-red/10 border border-semaphore-red/20 rounded-2xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-semaphore-red" />
        <h3 className="text-sm font-bold text-semaphore-red">{t("expiredAlert")}</h3>
      </div>
      {expiredItems.map((item) => (
        <div key={item.uuid} className="flex items-center justify-between">
          <span className="text-xs truncate flex-1">
            {CATEGORY_EMOJIS[item.category]} {item.name} ({item.quantity}x) — {item.expires_at}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-semaphore-red" onClick={() => onConsumeItem(item.uuid)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {expiredIngredients.map((ing) => (
        <div key={ing.uuid} className="flex items-center justify-between">
          <span className="text-xs truncate flex-1">
            🧅 {ing.name} ({ing.quantity}{ing.unit}) — {ing.expires_at}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-semaphore-red" onClick={() => onRemoveIngredient(ing.uuid)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
