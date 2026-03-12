import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";

import { ExternalRecipeDetail } from "@/services/recipeService";

// Zod schema for the agent's plan approval
export const PlanSchema = z.object({
  reasoning: z.string().describe("Explain why this plan is being proposed"),
  steps: z.array(z.string()).describe("List of actions the agent will take"),
  toolCalls: z.array(z.object({
    tool: z.enum(["search_meal_db", "search_internal_hub"]),
    input: z.string().describe("Query in English for meal_db, Portuguese for internal_hub")
  })),
});

export type AgentPlan = z.infer<typeof PlanSchema>;

// Zod schema for recipe modifications (Diff)
export const RecipeDiffSchema = z.object({
  recipeId: z.string(),
  recipeName: z.string(),
  addedIngredients: z.array(z.string()),
  removedIngredients: z.array(z.string()),
  instructionsChanged: z.boolean(),
  newInstructions: z.string().optional(),
});

export type RecipeDiff = z.infer<typeof RecipeDiffSchema>;

// LangGraph state definition
export interface AgentState {
  messages: BaseMessage[];
  inventory: any; // Current user inventory
  plan: AgentPlan | null;
  searchResults: ExternalRecipeDetail[] | null;
  diff: RecipeDiff | null;
  approvals: {
    plan: boolean;
    diff: boolean;
  };
  language: string; // Target language for translation
  i18n: {
    categories: string[];
    ingredients: string;
    instructions: string;
  };
}
