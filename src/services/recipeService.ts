import { translateText, translateLongText } from "../utils/translate";

export interface ExternalRecipeDetail {
  id: string;
  name: string;
  category: string;
  instructions: string;
  ingredients: string; // Lista formatada como string (um por linha)
  imageUrl: string;
  youtubeUrl?: string;
}

const THEMEALDB_LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php";
const THEMEALDB_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

/**
 * Busca e processa uma receita do TheMealDB por ID
 */
export async function getExternalRecipeById(id: string, targetLang: string = "pt"): Promise<ExternalRecipeDetail> {
  const response = await fetch(`${THEMEALDB_LOOKUP_URL}?i=${id}`);
  const data = await response.json();

  if (!data.meals || data.meals.length === 0) {
    throw new Error("Receita não encontrada.");
  }

  const meal = data.meals[0];
  return processMealData(meal, targetLang);
}

/**
 * Busca receitas pelo nome no TheMealDB
 */
export async function searchExternalRecipesByName(name: string, targetLang: string = "pt"): Promise<ExternalRecipeDetail[]> {
  const response = await fetch(`${THEMEALDB_SEARCH_URL}?s=${name}`);
  const data = await response.json();

  if (!data.meals) return [];

  // Processamos apenas as 5 primeiras para evitar overload de tradução e rate limit
  const processedMeals = await Promise.all(
    data.meals.slice(0, 5).map((meal: any) => processMealData(meal, targetLang))
  );

  return processedMeals;
}

/**
 * Função interna para limpar e traduzir os dados de uma receita ("meal")
 */
async function processMealData(meal: any, targetLang: string): Promise<ExternalRecipeDetail> {
  // 1. Limpeza de Ingredientes
  const ingredientList: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      const combined = measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
      ingredientList.push(combined);
    }
  }

  // Se o idioma de destino for inglês, não traduzimos (os dados originais são em inglês)
  if (targetLang === "en") {
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      instructions: meal.strInstructions,
      ingredients: ingredientList.join("\n"),
      imageUrl: meal.strMealThumb,
      youtubeUrl: meal.strYoutube
    };
  }

  // 2. Tradução para Português
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
    youtubeUrl: meal.strYoutube
  };
}
