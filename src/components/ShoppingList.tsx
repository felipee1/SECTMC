import { useMemo } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Recipe } from "@/types/recipe";
import { Ingredient } from "@/types/ingredient";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShoppingListProps {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  ingredients: Ingredient[];
}

interface ParsedIngredient {
  raw: string;
  inStock: boolean;
}

import { parseIngredientLine } from "@/lib/engine/utils";
import { SmartPlannerEngine } from "@/lib/engine/plannerEngine";
import { GlobalState } from "@/types/engine";

export function ShoppingList({ open, onClose, recipes, ingredients }: ShoppingListProps) {
  const { t } = useLanguage();

  const smartShoppingList = useMemo(() => {
    if (recipes.length === 0) return null;

    const engineState: GlobalState = {
      recipes: recipes.map(r => ({
        ...r,
        id: r.uuid,
        ingredients: r.ingredients.split("\n").filter(Boolean).map(line => {
          const parsed = parseIngredientLine(line);
          return {
            ingredient_id: parsed.name,
            qty_numeric: parsed.qty,
            unit: parsed.unit,
            is_pantry: false
          };
        })
      })) as any,
      ingredients: [], // Could be populated if we had a master catalogue
      raw_inventory: ingredients.map(i => ({
        id: i.uuid,
        ingredient_id: i.name,
        qty_available: i.quantity,
        unit: i.unit,
        expires_at: i.expires_at
      })),
      inventory: [] // Not needed for shopping list
    };

    // Treat name as ID for matching
    engineState.ingredients = Array.from(new Set(engineState.recipes.flatMap(r => r.ingredients.map(i => i.ingredient_id)))).map(name => ({
      id: name,
      name: name,
      section: t("generalSection") as string, // Default
      is_staple: false
    }));

    return SmartPlannerEngine.generateSmartShoppingList(recipes.map(r => r.uuid), engineState);
  }, [recipes, ingredients, t]);

  const hasItems = smartShoppingList && Object.keys(smartShoppingList.sections).length > 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] px-4 sm:px-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-fredoka text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> {t("shoppingTitle")}
          </SheetTitle>
          <SheetDescription>{t("basedOnRecipes")}</SheetDescription>
        </SheetHeader>

        {recipes.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">{t("registerRecipes")}</p>
        ) : !hasItems ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-semibold text-sm">{t("allIngredientsOk")}</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {Object.entries(smartShoppingList.sections).map(([section, items]) => (
              <div key={section} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary ml-1">{t(section)}</h4>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-xl p-3 flex justify-between items-center group">
                      <div className="flex flex-col">
                        <p className="font-bold text-sm">{item.name}</p>
                        {item.note && (
                          <p className="text-[10px] text-muted-foreground italic font-medium">
                            💡 {t(item.note)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          {item.qty_to_buy} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {smartShoppingList.check_pantry.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">⚠️ Checar Despensa</p>
                <div className="flex flex-wrap gap-2">
                  {smartShoppingList.check_pantry.map(item => (
                    <span key={item} className="text-xs px-2 py-1 bg-white dark:bg-black/20 rounded-lg shadow-sm border border-black/5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
