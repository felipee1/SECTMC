import { useState, useCallback, useEffect } from "react";
import { Ingredient } from "@/types/ingredient";

const STORAGE_KEY = "cozinha4x1_ingredients";

function loadIngredients(): Ingredient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveIngredients(items: Ingredient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(loadIngredients);

  useEffect(() => {
    saveIngredients(ingredients);
  }, [ingredients]);

  const addIngredient = useCallback((ingredient: Omit<Ingredient, "uuid" | "created_at">) => {
    const item: Ingredient = {
      ...ingredient,
      uuid: crypto.randomUUID(),
      created_at: new Date().toISOString().split("T")[0],
    };
    setIngredients((prev) => [...prev, item]);
    return item;
  }, []);

  const removeIngredient = useCallback((uuid: string) => {
    setIngredients((prev) => prev.filter((i) => i.uuid !== uuid));
  }, []);

  const updateIngredient = useCallback((uuid: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((i) => (i.uuid === uuid ? { ...i, ...updates } : i))
    );
  }, []);

  const getExpiringOn = useCallback(
    (dateStr: string): Ingredient[] => {
      return ingredients.filter((i) => i.expires_at === dateStr);
    },
    [ingredients]
  );

  return { ingredients, addIngredient, removeIngredient, updateIngredient, getExpiringOn };
}
