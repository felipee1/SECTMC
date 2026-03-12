import { 
  GlobalState, 
  EngineRecipe, 
  SmartShoppingList, 
  ShoppingListSection,
  MasterIngredient
} from "../../types/engine";

/**
 * MODULE 2: Smart Shopping Assistant (Anchor and Subtraction Strategy)
 */

export const SmartPlannerEngine = {
  /**
   * Function A: findOverlappingRecipes
   * Suggests satellite recipes based on common fresh ingredients.
   */
  findOverlappingRecipes(anchorRecipeId: string, state: GlobalState): EngineRecipe[] {
    const anchor = state.recipes.find(r => r.id === anchorRecipeId);
    if (!anchor) return [];
 
    // Get fresh ingredients (not pantry) from the anchor
    const freshIngredients = anchor.ingredients
      .filter(ing => !ing.is_pantry)
      .map(ing => ing.ingredient_id);

    if (freshIngredients.length === 0) return [];

    const overlapping = state.recipes
      .filter(r => r.id !== anchorRecipeId)
      .map(recipe => {
        const intersection = recipe.ingredients.filter(ing => 
          !ing.is_pantry && freshIngredients.includes(ing.ingredient_id)
        ).length;
        
        return { recipe, intersection };
      })
      .filter(item => item.intersection > 0)
      .sort((a, b) => b.intersection - a.intersection)
      .map(item => item.recipe);

    return overlapping;
  },

  /**
   * Function B: generateSmartShoppingList
   * Generates consolidated shopping list subtracted from stock.
   */
  generateSmartShoppingList(selectedRecipeIds: string[], state: GlobalState): SmartShoppingList {
    const grossNeeds: Record<string, { qty: number, unit: string }> = {};
    const checkPantry: Set<string> = new Set();
 
    // 1. Step 1: Gross Needs
    selectedRecipeIds.forEach(id => {
      const recipe = state.recipes.find(r => r.id === id);
      if (!recipe) return;

      recipe.ingredients.forEach(ing => {
        const master = state.ingredients.find(m => m.id === ing.ingredient_id);
        
        if (master?.is_staple || ing.is_pantry) {
          if (master) checkPantry.add(master.name);
          return;
        }

        const key = `${ing.ingredient_id}_${ing.unit}`;
        if (!grossNeeds[key]) {
          grossNeeds[key] = { qty: 0, unit: ing.unit };
        }
        grossNeeds[key].qty += ing.qty_numeric;
      });
    });
 
    // 2. Step 2 & 3: Net Needs and Grouping
    const shoppingList: ShoppingListSection = {};

    Object.entries(grossNeeds).forEach(([key, need]) => {
      const [ingredient_id] = key.split("_");
      const master = state.ingredients.find(m => m.id === ingredient_id);
      if (!master) return;
 
      // Fetch current stock
      const inStock = state.raw_inventory
        .filter(ri => ri.ingredient_id === ingredient_id && ri.unit === need.unit)
        .reduce((sum, item) => sum + item.qty_available, 0);

      const netNeed = need.qty - inStock;

      if (netNeed > 0) {
        const section = master.section || "generalSection";
        if (!shoppingList[section]) {
          shoppingList[section] = [];
        }

        shoppingList[section].push({
          name: master.name,
          qty_to_buy: netNeed,
          unit: need.unit,
          note: inStock > 0 ? `pantryCheckNote|qty:${inStock},unit:${need.unit}` : ""
        });
      }
    });

    return {
      sections: shoppingList,
      check_pantry: Array.from(checkPantry)
    };
  }
};
