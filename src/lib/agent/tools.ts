import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchExternalRecipesByName } from "@/services/recipeService";
import { recipeHubService } from "@/services/recipeHubService";

/**
 * Tool to search for global recipes on TheMealDB.
 * The query should be in English (translated by the LLM).
 */
export const searchMealDbTool = tool(
  async ({ query }) => {
    console.log(`[Tool: MealDB] Searching for: "${query}"...`);
    try {
      const recipes = await searchExternalRecipesByName(query, "en");
      console.log(`[Tool: MealDB] Found ${recipes.length} results.`);
      return JSON.stringify(recipes);
    } catch (error) {
      console.error(`[Tool: MealDB] Error:`, error);
      return `Error searching MealDB: ${error}`;
    }
  },
  {
    name: "search_meal_db",
    description: "Search for global recipes on TheMealDB. Query must be in English. Useful for finding new recipe ideas.",
    schema: z.object({
      query: z.string().describe("The search term in English"),
    }),
  }
);

/**
 * Tool to search for community recipes in the internal hub.
 * Search by tag or recipe name in Portuguese.
 */
export const searchInternalHubTool = tool(
  async ({ tag }) => {
    console.log(`[Tool: InternalHub] Searching for: "${tag}"...`);
    try {
      const allRecipes = await recipeHubService.getAllRecipes();
      const filtered = allRecipes.filter(r => 
        (r.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))) ||
        r.name.toLowerCase().includes(tag.toLowerCase()) ||
        r.category.toLowerCase().includes(tag.toLowerCase())
      );
      console.log(`[Tool: InternalHub] Found ${filtered.length} matches.`);
      return JSON.stringify(filtered.slice(0, 5));
    } catch (error) {
      console.error(`[Tool: InternalHub] Error:`, error);
      return `Error searching internal hub: ${error}`;
    }
  },
  {
    name: "search_internal_hub",
    description: "Search for recipes in the internal community hub by tag, name or category in Portuguese.",
    schema: z.object({
      tag: z.string().describe("The tag, category or recipe name in Portuguese"),
    }),
  }
);

export const tools = [searchMealDbTool, searchInternalHubTool];
