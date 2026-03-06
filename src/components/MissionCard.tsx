import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ingredient } from "@/types/ingredient";
import {
  AppSettings,
  CATEGORY_EMOJIS,
  Category,
  InventoryItem,
  getSemaphoreColor,
} from "@/types/inventory";
import {
  Recipe,
  StorageOption,
  StorageType,
  getRecipeStorageOptions,
} from "@/types/recipe";
import { Check, Dices, Eye, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface MissionCardProps {
  getCategoryTotal: (cat: Category) => number;
  settings: AppSettings;
  getRecipesByCategory: (cat: Category) => Recipe[];
  onAddToStock: (item: InventoryItem) => void;
  ingredients: Ingredient[];
  onUpdateIngredient: (uuid: string, updates: Partial<Ingredient>) => void;
  onRemoveIngredient: (uuid: string) => void;
}

interface ParsedIngredient {
  raw: string;
  ingredientName: string;
  requiredQty: number;
  requiredUnit: string;
  availableQty: number;
  inStock: boolean;
  partial: boolean;
  missingQty: number;
}

function parseIngredientLine(line: string): {
  name: string;
  qty: number;
  unit: string;
} {
  const match = line.match(
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|un|unidade|unidades|pacote|lata|dúzia|duzia|units?)$/i,
  );
  if (match) {
    return {
      name: match[1].trim(),
      qty: parseFloat(match[2].replace(",", ".")),
      unit: match[3].toLowerCase(),
    };
  }
  return { name: line.trim(), qty: 0, unit: "" };
}

function normalizeToBaseUnit(
  qty: number,
  unit: string,
): { qty: number; baseUnit: string } {
  const u = unit.toLowerCase();
  if (u === "kg") return { qty: qty * 1000, baseUnit: "g" };
  if (u === "l") return { qty: qty * 1000, baseUnit: "ml" };
  return { qty, baseUnit: u };
}

function formatQty(qty: number, unit: string): string {
  const u = unit.toLowerCase();
  if ((u === "g" || u === "kg") && qty >= 1000)
    return `${(qty / 1000).toFixed(1).replace(/\.0$/, "")}kg`;
  if ((u === "g" || u === "kg") && qty < 1000) return `${Math.round(qty)}g`;
  if ((u === "ml" || u === "l") && qty >= 1000)
    return `${(qty / 1000).toFixed(1).replace(/\.0$/, "")}L`;
  if ((u === "ml" || u === "l") && qty < 1000) return `${Math.round(qty)}ml`;
  return `${qty}${unit}`;
}

function parseRecipeIngredients(
  recipe: Recipe,
  stock: Ingredient[],
  multiplier: number = 1,
): ParsedIngredient[] {
  if (!recipe.ingredients || !recipe.ingredients.trim()) return [];
  const lines = recipe.ingredients
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const today = new Date().toISOString().split("T")[0];

  return lines.map((line) => {
    const parsed = parseIngredientLine(line);
    const matching = stock.filter(
      (s) =>
        parsed.name &&
        s.name.toLowerCase().includes(parsed.name.toLowerCase()) &&
        s.quantity > 0 &&
        s.expires_at >= today,
    );

    if (parsed.qty > 0) {
      // Apply multiplier to required quantity
      const scaledQty = parsed.qty * multiplier;
      const required = normalizeToBaseUnit(scaledQty, parsed.unit);
      const availableBase = matching.reduce((sum, s) => {
        const norm = normalizeToBaseUnit(s.quantity, s.unit);
        if (norm.baseUnit === required.baseUnit) return sum + norm.qty;
        return sum + s.quantity;
      }, 0);

      const missingBase = Math.max(0, required.qty - availableBase);

      return {
        raw: line,
        ingredientName: parsed.name,
        requiredQty: scaledQty,
        requiredUnit: parsed.unit,
        availableQty: availableBase,
        inStock: missingBase === 0,
        partial: availableBase > 0 && missingBase > 0,
        missingQty: missingBase,
      };
    }
    const inStock = matching.length > 0;
    return {
      raw: line,
      ingredientName: parsed.name,
      requiredQty: 0,
      requiredUnit: "",
      availableQty: 0,
      inStock,
      partial: false,
      missingQty: 0,
    };
  });
}

function countAvailableIngredients(
  recipe: Recipe,
  stock: Ingredient[],
  multiplier: number = 1,
): number {
  const parsed = parseRecipeIngredients(recipe, stock, multiplier);
  if (parsed.length === 0) return 0;
  return parsed.filter((p) => p.inStock).length;
}

function getPortionMultiplier(
  recipePortions: number,
  householdSize: number,
): number {
  const portionsPerPerson = recipePortions / householdSize;
  if (portionsPerPerson >= 4) return 1;
  const targetPortions = householdSize * 4;
  return Math.ceil(targetPortions / recipePortions);
}

const STORAGE_EMOJIS: Record<StorageType, string> = {
  freezer: "❄️",
  fridge: "🧊",
  natura: "🌡️",
};

export function MissionCard({
  getCategoryTotal,
  settings,
  getRecipesByCategory,
  onAddToStock,
  ingredients,
  onUpdateIngredient,
  onRemoveIngredient,
}: MissionCardProps) {
  const { t } = useLanguage();
  const [generated, setGenerated] = useState<{
    category: Category;
    name: string;
    recipe: Recipe | null;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stockQty, setStockQty] = useState(4);
  const [selectedStorageOption, setSelectedStorageOption] =
    useState<StorageOption | null>(null);

  const categories: Category[] = ["protein", "carb", "veggie", "flavor"];
  const sorted = categories
    .map((cat) => ({ cat, total: getCategoryTotal(cat) }))
    .sort((a, b) => a.total - b.total);
  const mostCritical = sorted[0];
  const criticalColor = getSemaphoreColor(mostCritical.total, settings);

  const catLabel = (cat: Category) => t(cat) as string;
  const householdSize = settings.household_size ?? 2;

  const [noRecipesError, setNoRecipesError] = useState(false);
  const [lastRecipeId, setLastRecipeId] = useState<string | null>(null);

  const generateRecipe = () => {
    for (const { cat } of sorted) {
      const userRecipes = getRecipesByCategory(cat);
      if (userRecipes.length > 0) {
        setNoRecipesError(false);
        const scored = userRecipes.map((r) => ({
          recipe: r,
          available: countAvailableIngredients(r, ingredients),
        }));
        scored.sort((a, b) => b.available - a.available);
        const maxAvailable = scored[0].available;
        let topRecipes = scored.filter((s) => s.available === maxAvailable);
        if (topRecipes.length > 1 && lastRecipeId) {
          topRecipes = topRecipes.filter((s) => s.recipe.uuid !== lastRecipeId);
        }
        const chosen =
          topRecipes[Math.floor(Math.random() * topRecipes.length)].recipe;
        const multiplier = getPortionMultiplier(
          chosen.portions || 4,
          householdSize,
        );
        const scaledPortions = (chosen.portions || 4) * multiplier;
        const opts = getRecipeStorageOptions(chosen);
        setGenerated({ category: cat, name: chosen.name, recipe: chosen });
        setLastRecipeId(chosen.uuid);
        setStockQty(scaledPortions);
        setSelectedStorageOption(opts[0]);
        setShowDetails(true);
        return;
      }
    }
    setNoRecipesError(true);
  };

  const consumeIngredients = () => {
    if (!generated?.recipe) return;
    const parsed = parseRecipeIngredients(
      generated.recipe,
      ingredients,
      multiplier,
    );
    const today = new Date().toISOString().split("T")[0];

    for (const item of parsed) {
      if (item.requiredQty <= 0 || !item.ingredientName) continue;
      const required = normalizeToBaseUnit(item.requiredQty, item.requiredUnit);
      let remaining = required.qty;

      const matching = ingredients
        .filter(
          (s) =>
            s.name.toLowerCase().includes(item.ingredientName.toLowerCase()) &&
            s.quantity > 0 &&
            s.expires_at >= today,
        )
        .sort((a, b) => a.expires_at.localeCompare(b.expires_at));

      for (const stock of matching) {
        if (remaining <= 0) break;
        const stockNorm = normalizeToBaseUnit(stock.quantity, stock.unit);
        if (stockNorm.qty <= remaining) {
          remaining -= stockNorm.qty;
          onRemoveIngredient(stock.uuid);
        } else {
          const leftoverBase = stockNorm.qty - remaining;
          const leftover =
            stock.unit.toLowerCase() === "kg"
              ? leftoverBase / 1000
              : stock.unit.toLowerCase() === "l"
                ? leftoverBase / 1000
                : leftoverBase;
          onUpdateIngredient(stock.uuid, {
            quantity: Math.round(leftover * 100) / 100,
          });
          remaining = 0;
        }
      }
    }
  };

  const handleAddToStock = () => {
    if (!generated || !selectedStorageOption) return;
    const today = new Date().toISOString().split("T")[0];
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + selectedStorageOption.expiryDays);
    const location =
      selectedStorageOption.type === "natura"
        ? "fridge"
        : selectedStorageOption.type;
    const item: InventoryItem = {
      uuid: crypto.randomUUID(),
      category: generated.category,
      type: "ready_meal",
      subtype: null,
      name: generated.name,
      quantity: stockQty,
      location,
      created_at: today,
      expires_at: expDate.toISOString().split("T")[0],
    };
    consumeIngredients();
    onAddToStock(item);
  };

  const multiplier = generated?.recipe
    ? getPortionMultiplier(generated.recipe.portions || 4, householdSize)
    : 1;
  const parsedIngredients = generated?.recipe
    ? parseRecipeIngredients(generated.recipe, ingredients, multiplier)
    : [];
  const availableStorageOptions = generated?.recipe
    ? getRecipeStorageOptions(generated.recipe)
    : [];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-fredoka font-semibold text-sm">
          {t("missionTitle")}
        </h2>
        {criticalColor === "red" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-semaphore-red/15 text-semaphore-red font-bold">
            {t("urgent")}
          </span>
        )}
      </div>

      {generated ? (
        <div className="mb-3">
          <p className="text-sm leading-relaxed">
            {t("stockOf")}{" "}
            <strong>
              {CATEGORY_EMOJIS[generated.category]}{" "}
              {catLabel(generated.category)}
            </strong>{" "}
            {criticalColor === "red"
              ? t("isCritical")
              : criticalColor === "yellow"
                ? t("isLow")
                : t("isOk")}
            .
          </p>
          <p className="text-lg font-fredoka font-bold mt-1 text-primary">
            {generated.name} 🔥
          </p>
          {multiplier > 1 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              💡 {t("suggestedMultiplier")}: {multiplier}x →{" "}
              {(generated.recipe?.portions || 4) * multiplier}{" "}
              {t("portionsForPeople")} {householdSize} {t("people")}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs gap-1.5 text-primary"
            onClick={() => setShowDetails(true)}
          >
            <Eye className="w-3.5 h-3.5" /> {t("viewRecipe")}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-3">
          {t("clickToDiscover")}
        </p>
      )}

      {noRecipesError && (
        <p className="text-sm text-semaphore-red font-semibold mb-3">
          ⚠️ {t("noRecipesRegistered")}
        </p>
      )}

      <Button
        variant="outline"
        className="w-full rounded-xl h-10 font-semibold gap-2"
        onClick={generateRecipe}
      >
        <Dices className="w-4 h-4" />
        {generated ? t("generateAnother") : t("generateRecipe")}
      </Button>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="rounded-2xl max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-lg">
              {generated?.name}
            </DialogTitle>
            <DialogDescription>
              {CATEGORY_EMOJIS[generated?.category ?? "protein"]}{" "}
              {catLabel(generated?.category ?? "protein")}
              {" · "}
              {criticalColor === "red"
                ? t("isCritical")
                : criticalColor === "yellow"
                  ? t("isLow")
                  : t("isOk")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {parsedIngredients.length > 0 ? (
              <div>
                <p className="text-sm font-semibold mb-1">
                  📝 {t("ingredients")}
                </p>
                <ul className="space-y-1">
                  {parsedIngredients.map((item, idx) => (
                    <li
                      key={idx}
                      className={`text-sm flex items-start gap-2 ${item.inStock ? "text-muted-foreground" : "font-medium"}`}
                    >
                      {item.inStock ? (
                        <Check className="w-3.5 h-3.5 mt-0.5 text-semaphore-green flex-shrink-0" />
                      ) : (
                        <ShoppingCart className="w-3.5 h-3.5 mt-0.5 text-semaphore-red flex-shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className={item.inStock ? "line-through" : ""}>
                          {item.ingredientName}{" "}
                          {item.requiredQty > 0
                            ? `${item.requiredQty} ${item.requiredUnit}`
                            : ""}
                          {multiplier > 1 && item.requiredQty > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              (x{multiplier})
                            </span>
                          )}
                        </span>
                        {item.requiredQty > 0 && (
                          <span
                            className={`text-xs ${item.inStock ? "text-semaphore-green" : "text-semaphore-red"}`}
                          >
                            {item.inStock
                              ? `✅ ${t("inStock")} (${formatQty(item.availableQty, item.requiredUnit)})`
                              : item.partial
                                ? `⚠️ ${t("has")} ${formatQty(item.availableQty, item.requiredUnit)}, ${t("missing")} ${formatQty(item.missingQty, item.requiredUnit)}`
                                : `🛒 ${t("toBuy")} ${formatQty(item.missingQty || item.requiredQty * (item.requiredUnit.toLowerCase() === "kg" ? 1000 : item.requiredUnit.toLowerCase() === "l" ? 1000 : 1), item.requiredUnit)}`}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t("noDetails")}
              </p>
            )}
            {generated?.recipe?.instructions && (
              <div>
                <p className="text-sm font-semibold mb-1">
                  👨‍🍳 {t("howToMake")}
                </p>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {generated.recipe.instructions}
                </p>
              </div>
            )}
            {generated?.recipe?.portions && generated.recipe.portions > 0 && (
              <p className="text-sm font-semibold text-primary">
                🍽️ {t("yield")}: {generated.recipe.portions} {t("portions")}
                {multiplier > 1 && (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (x{multiplier} = {generated.recipe.portions * multiplier})
                  </span>
                )}
              </p>
            )}

            {/* Storage selection - only recipe's allowed options */}
            <div>
              <p className="text-sm font-semibold mb-1">{t("storageType")}</p>
              <div className="flex gap-2">
                {availableStorageOptions.map((opt) => (
                  <Button
                    key={opt.type}
                    variant={
                      selectedStorageOption?.type === opt.type
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="flex-1 rounded-xl text-xs"
                    onClick={() => setSelectedStorageOption(opt)}
                  >
                    {STORAGE_EMOJIS[opt.type]} {t(opt.type)}
                  </Button>
                ))}
              </div>
              {selectedStorageOption && (
                <p className="text-xs text-muted-foreground mt-1">
                  ⏱️ {selectedStorageOption.expiryDays} {t("days")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 border rounded-xl px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setStockQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="w-8 text-center font-bold text-sm">
                {stockQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setStockQty((q) => q + 1)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button
              className="flex-1 rounded-xl h-10 font-bold gap-2"
              onClick={() => {
                handleAddToStock();
                setShowDetails(false);
              }}
            >
              <Plus className="w-4 h-4" /> {t("addToStock")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
