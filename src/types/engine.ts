import { Recipe as BaseRecipe } from "./recipe";
import { InventoryItem as BaseInventoryItem, Category } from "./inventory";

export interface EngineIngredient {
  ingredient_id: string;
  qty_numeric: number;
  unit: string;
  is_pantry: boolean;
}

export interface EngineRecipe extends Omit<BaseRecipe, "ingredients"> {
  id: string; // Map from uuid
  ingredients: EngineIngredient[];
}

export interface MasterIngredient {
  id: string;
  name: string;
  section: string;
  is_staple: boolean;
}

export interface RawInventoryItem {
  id: string;
  ingredient_id: string;
  qty_available: number;
  unit: string;
  expires_at: string; // ISO String
}

export interface FrozenInventoryItem {
  id: string;
  category: "PROTEIN" | "CARB" | "VEGGIE";
  qty: number;
}

export interface GlobalState {
  recipes: EngineRecipe[];
  ingredients: MasterIngredient[];
  raw_inventory: RawInventoryItem[];
  inventory: FrozenInventoryItem[];
}

export interface DailyMissionResult {
  recipe: EngineRecipe;
  criticalCategory: string;
  justification: string;
  score: number;
}

export interface ShoppingListSection {
  [sectionName: string]: {
    name: string;
    qty_to_buy: number;
    unit: string;
    note: string;
  }[];
}

export interface SmartShoppingList {
  sections: ShoppingListSection;
  check_pantry: string[];
}
