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

function parseRecipeIngredients(recipe: Recipe, stock: Ingredient[]): ParsedIngredient[] {
  if (!recipe.ingredients || !recipe.ingredients.trim()) return [];
  const lines = recipe.ingredients.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const lower = line.toLowerCase();
    const inStock = stock.some((s) => lower.includes(s.name.toLowerCase()) && s.quantity > 0 && s.expires_at >= new Date().toISOString().split("T")[0]);
    return { raw: line, inStock };
  });
}

export function ShoppingList({ open, onClose, recipes, ingredients }: ShoppingListProps) {
  const { t } = useLanguage();
  const shoppingData = useMemo(() => recipes.map((recipe) => ({ recipe, items: parseRecipeIngredients(recipe, ingredients) })), [recipes, ingredients]);
  const recipesWithMissing = shoppingData.filter((d) => d.items.some((i) => !i.inStock));

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
        ) : recipesWithMissing.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-semibold text-sm">{t("allIngredientsOk")}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {recipesWithMissing.map(({ recipe, items }) => (
              <div key={recipe.uuid} className="bg-muted/50 rounded-xl p-3">
                <p className="font-semibold text-sm mb-2">📖 {recipe.name}</p>
                <ul className="space-y-1">
                  {items.map((item, idx) => (
                    <li key={idx} className={`text-xs flex items-start gap-2 ${item.inStock ? "text-muted-foreground line-through" : "font-medium"}`}>
                      {item.inStock ? <Check className="w-3 h-3 mt-0.5 text-semaphore-green flex-shrink-0" /> : <ShoppingCart className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />}
                      {item.raw}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
