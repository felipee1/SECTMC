import { 
  GlobalState, 
  DailyMissionResult, 
  EngineRecipe, 
  RawInventoryItem 
} from "../../types/engine";

/**
 * MODULE 1: "What to Cook Today?" Algorithm (FEFO Prioritization)
 */

export function generateDailyMission(state: GlobalState): DailyMissionResult | null {
  if (state.recipes.length === 0) return null;
 
  // 1. Step 1: Identify the Bottleneck (Critical Category)
  const categories: ("PROTEIN" | "CARB" | "VEGGIE")[] = ["PROTEIN", "CARB", "VEGGIE"];
  
  // Initialize counts with 0 for all categories
  const counts: Record<string, number> = { PROTEIN: 0, CARB: 0, VEGGIE: 0 };
  state.inventory.forEach(item => {
    if (counts[item.category] !== undefined) {
      counts[item.category] += item.qty;
    }
  });
 
  // Find the category with fewer containers (in case of a tie, take the first one)
  const criticalCategory = categories.reduce((min, cat) => 
    counts[cat] < counts[min] ? cat : min, categories[0]
  );
 
  // 2. Step 2: Recipe Filtering
  const filteredRecipes = state.recipes.filter(r => r.category.toUpperCase() === criticalCategory);
  
  if (filteredRecipes.length === 0) {
    // If there are no recipes in the critical category, try all recipes
    return scoreAndSelect(state.recipes, criticalCategory, state.raw_inventory);
  }

  return scoreAndSelect(filteredRecipes, criticalCategory, state.raw_inventory);
}

function scoreAndSelect(
  recipes: EngineRecipe[], 
  criticalCategory: string, 
  rawInventory: RawInventoryItem[]
): DailyMissionResult | null {
  const now = new Date();
  
  const scoredRecipes = recipes.map(recipe => {
    let score = 0;
    let savedIngredients: string[] = [];
    let urgentItemsCount = 0;

    recipe.ingredients.forEach(ing => {
      // Search for ingredient in raw inventory
      const invItem = rawInventory.find(ri => ri.ingredient_id === ing.ingredient_id && ri.qty_available > 0);
      
      if (invItem) {
        const expiresAt = new Date(invItem.expires_at);
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 2) {
          score += 100;
          urgentItemsCount++;
          savedIngredients.push(ing.ingredient_id); // Simplified: would ideally look up name
        } else if (diffDays <= 5) {
          score += 50;
          savedIngredients.push(ing.ingredient_id);
        } else {
          score += 10;
        }
      }
    });

    return { recipe, score, urgentItemsCount, savedIngredients };
  });

  // Sort by highest score
  scoredRecipes.sort((a, b) => b.score - a.score);
  
  const top = scoredRecipes[0];
  if (!top) return null;
 
  // Structured justification for i18n
  const justification = `engineJustification|recipe:${top.recipe.name},category:${criticalCategory}`;

  return {
    recipe: top.recipe,
    criticalCategory,
    score: top.score,
    justification
  };
}
