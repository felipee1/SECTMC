import { useState, useCallback, useEffect } from "react";
import { Recipe, StorageOption } from "@/types/recipe";
import { Category } from "@/types/inventory";
import { isCloudSyncEnabled, loadUserFromLocalStorage } from "@/services/storageService";
import { recipeHubService } from "@/services/recipeHubService";

const STORAGE_KEY = "cozinha4x1_recipes";

function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  const addRecipe = useCallback(
    (name: string, category: Category, ingredients: string, instructions: string, portions: number = 4, storageOptions: StorageOption[] = [{ type: "freezer", expiryDays: 30 }]) => {
      const recipe: Recipe = {
        uuid: crypto.randomUUID(),
        name: name.trim(),
        category,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        portions,
        storageOptions,
        created_at: new Date().toISOString().split("T")[0],
      };
      setRecipes((prev) => [...prev, recipe]);

      // Global Sharing
      if (isCloudSyncEnabled()) {
        const user = loadUserFromLocalStorage();
        if (user?.uid) {
          recipeHubService.shareRecipe(recipe, user.uid);
        }
      }

      return recipe;
    },
    []
  );

  const removeRecipe = useCallback((uuid: string) => {
    setRecipes((prev) => prev.filter((r) => r.uuid !== uuid));
  }, []);

  const getRecipesByCategory = useCallback(
    (category: Category): Recipe[] => {
      return recipes.filter((r) => r.category === category);
    },
    [recipes]
  );

  return { recipes, addRecipe, removeRecipe, getRecipesByCategory };
}
