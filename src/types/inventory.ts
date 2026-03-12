export type Category = "protein" | "carb" | "veggie" | "flavor";
export type ItemType = "base" | "ready_meal";
export type Subtype = "beef" | "chicken" | "pork" | "fish";
export type Location = "freezer" | "fridge";

export const LOCATION_EXPIRY_DAYS: Record<Location, number> = {
  freezer: 30,
  fridge: 5,
};

export interface InventoryItem {
  uuid: string;
  category: Category;
  type: ItemType;
  subtype: Subtype | null;
  name: string;
  quantity: number;
  location: Location;
  created_at: string; // ISO date
  expires_at: string; // ISO date
}

export interface DayHistory {
  produced: boolean;
  consumed: boolean;
  details: string[];
}

export interface AppSettings {
  threshold_red: number;
  threshold_yellow: number;
  household_size: number;
  ai_enabled?: boolean;
  ai_model_id?: string;
}

export interface AppData {
  inventory: InventoryItem[];
  history: Record<string, DayHistory>;
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  threshold_red: 2,
  threshold_yellow: 5,
  household_size: 2,
  ai_enabled: false,
  ai_model_id: "Qwen2-1.5B-Instruct-q4f32_1-MLC",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: "Protein",
  carb: "Carbohydrate",
  veggie: "Vegetables",
  flavor: "Sauces/Preserves",
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  protein: "🥩",
  carb: "🍚",
  veggie: "🥦",
  flavor: "🫙",
};

export const LOCATION_LABELS: Record<Location, string> = {
  freezer: "Freezer",
  fridge: "Fridge",
};

export const LOCATION_EMOJIS: Record<Location, string> = {
  freezer: "❄️",
  fridge: "🧊",
};

export const SUBTYPE_LABELS: Record<Subtype, string> = {
  beef: "Beef",
  chicken: "Chicken",
  pork: "Pork",
  fish: "Fish",
};

export const SUBTYPE_SIGLAS: Record<Subtype, string> = {
  beef: "BEEF",
  chicken: "CHIC",
  pork: "PORK",
  fish: "FISH",
};

export function generateLabel(item: InventoryItem): string {
  const date = new Date(item.created_at);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  if (item.type === "base" && item.subtype) {
    return `${SUBTYPE_SIGLAS[item.subtype]}-${dd}/${mm}`;
  }
  // Ready meal: first 4 chars uppercase
  const sigla = item.name.substring(0, 4).toUpperCase();
  return `${sigla}-${dd}/${mm}`;
}

export function getSemaphoreColor(
  count: number,
  settings: AppSettings
): "red" | "yellow" | "green" {
  if (count <= settings.threshold_red) return "red";
  if (count <= settings.threshold_yellow) return "yellow";
  return "green";
}
