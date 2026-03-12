import { translateText, translateLongText } from "../utils/translate";

export interface ExternalRecipeDetail {
  id: string;
  name: string;
  category: string;
  instructions: string;
  ingredients: string; // Formatted as string (one per line)
  imageUrl: string;
  source: string; // "MealDB" or "Community"
  youtubeUrl?: string;
}

const THEMEALDB_LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php";
const THEMEALDB_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

/**
 * Fetches and processes a recipe from TheMealDB by ID
 */
export async function getExternalRecipeById(id: string, targetLang: string = "pt"): Promise<ExternalRecipeDetail> {
  const response = await fetch(`${THEMEALDB_LOOKUP_URL}?i=${id}`);
  const data = await response.json();

  if (!data.meals || data.meals.length === 0) {
    throw new Error("Recipe not found.");
  }

  const meal = data.meals[0];
  return processMealData(meal, targetLang);
}

/**
 * Searches for recipes by name on TheMealDB
 */
export async function searchExternalRecipesByName(name: string, targetLang: string = "pt"): Promise<ExternalRecipeDetail[]> {
  const response = await fetch(`${THEMEALDB_SEARCH_URL}?s=${name}`);
  const data = await response.json();

  if (!data.meals) return [];
  
  // Process only the first 5 to avoid translation overload and rate limits
  const processedMeals = await Promise.all(
    data.meals.slice(0, 5).map((meal: any) => processMealData(meal, targetLang))
  );

  return processedMeals;
}

/**
 * Internal function to clean and translate meal data
 */
async function processMealData(meal: any, targetLang: string): Promise<ExternalRecipeDetail> {
  // 1. Ingredients Cleanup
  const ingredientList: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      const combined = measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
      ingredientList.push(combined);
    }
  }

  // If target language is English, skip translation (original data is in English)
  if (targetLang === "en") {
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      instructions: meal.strInstructions,
      ingredients: ingredientList.join("\n"),
      imageUrl: meal.strMealThumb,
      source: "MealDB",
      youtubeUrl: meal.strYoutube
    };
  }

  // 2. Translate to Portuguese
  const [translatedName, translatedCategory, translatedInstructions, translatedIngredients] = await Promise.all([
    translateText(meal.strMeal),
    translateText(meal.strCategory),
    translateLongText(meal.strInstructions),
    translateLongText(ingredientList.join("\n"))
  ]);

  return {
    id: meal.idMeal,
    name: translatedName,
    category: translatedCategory,
    instructions: translatedInstructions,
    ingredients: translatedIngredients,
    imageUrl: meal.strMealThumb,
    source: "MealDB",
    youtubeUrl: meal.strYoutube
  };
}
