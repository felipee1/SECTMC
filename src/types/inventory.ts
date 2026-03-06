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
};

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: "Proteína",
  carb: "Carboidrato",
  veggie: "Legumes",
  flavor: "Molhos/Conservas",
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  protein: "🥩",
  carb: "🍚",
  veggie: "🥦",
  flavor: "🫙",
};

export const LOCATION_LABELS: Record<Location, string> = {
  freezer: "Freezer",
  fridge: "Geladeira",
};

export const LOCATION_EMOJIS: Record<Location, string> = {
  freezer: "❄️",
  fridge: "🧊",
};

export const SUBTYPE_LABELS: Record<Subtype, string> = {
  beef: "Carne",
  chicken: "Frango",
  pork: "Porco",
  fish: "Peixe",
};

export const SUBTYPE_SIGLAS: Record<Subtype, string> = {
  beef: "CARN",
  chicken: "FRAN",
  pork: "PORC",
  fish: "PEIX",
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
