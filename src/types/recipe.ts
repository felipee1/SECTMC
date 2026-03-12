import { Category } from "./inventory";

export type StorageType = "freezer" | "fridge" | "natura";

export const STORAGE_EXPIRY_DAYS: Record<StorageType, number> = {
  freezer: 30,
  fridge: 5,
  natura: 2,
};

export interface StorageOption {
  type: StorageType;
  expiryDays: number;
}

export interface Recipe {
  uuid: string;
  name: string;
  category: Category;
  ingredients: string;
  instructions: string;
  portions: number;
  /** @deprecated Use storageOptions instead */
  storage?: StorageType;
  storageOptions: StorageOption[];
  created_at: string;
  tags?: string[];
}

/** Helper to get storage options from a recipe, handling legacy single-storage field */
export function getRecipeStorageOptions(recipe: Recipe): StorageOption[] {
  if (recipe.storageOptions && recipe.storageOptions.length > 0) return recipe.storageOptions;
  // Legacy fallback
  const st = recipe.storage || "freezer";
  return [{ type: st, expiryDays: STORAGE_EXPIRY_DAYS[st] }];
}
