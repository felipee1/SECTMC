export interface Ingredient {
  uuid: string;
  name: string;
  quantity: number;
  unit: string;
  expires_at: string; // ISO date
  created_at: string; // ISO date
}

export const UNIT_OPTIONS = [
  "g",
  "kg",
  "ml",
  "L",
  "unit",
  "package",
  "can",
  "dozen",
] as const;
