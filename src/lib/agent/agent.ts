import { StateGraph, END, START } from "@langchain/langgraph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { tools } from "./tools";
import { AgentState, PlanSchema } from "./types";
import { translateText, translateLongText } from "@/utils/translate";

// Explicit JSON Schemas for WebLLM Grammar (f32 compat)
const PLAN_JSON_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    reasoning: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    toolCalls: { 
      type: "array", 
      items: { 
        type: "object",
        properties: {
          tool: { type: "string", enum: ["search_meal_db", "search_internal_hub"] },
          input: { type: "string" }
        },
        required: ["tool", "input"]
      } 
    }
  },
  required: ["reasoning", "steps", "toolCalls"]
});

const getResultsSchema = (categories: string[]) => JSON.stringify({
  type: "object",
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          category: { type: "string", enum: categories },
          instructions: { type: "string" },
          ingredients: { type: "string" },
          imageUrl: { type: "string" },
          source: { type: "string" }
        },
        required: ["id", "name", "category", "instructions", "ingredients", "imageUrl", "source"]
      }
    }
  },
  required: ["recipes"]
});


const plannerPrompt = `### ROLE
You are a Culinary Planner Assistant.

### TOOLS
1. search_meal_db: Global recipes. Input MUST be in English keywords (e.g., use "chicken" NOT "frango").
2. search_internal_hub: Community recipes. Input MUST be in Portuguese keywords.

### CRITICAL TRANSLATION RULE
If the user asks in Portuguese, you MUST translate the keywords to English for 'search_meal_db'.
Example: "receita de frango" -> search_meal_db(input: "chicken").

### OUTPUT FORMAT
JSON ONLY.`;

const formatterPrompt = `### ROLE
You are a Data Structured Formatter.

### EXTRACTION ALGORITHM (STRICT)
1. SCAN: Look through the 'Raw Data' block for segments starting with '[SOURCE:...]'.
2. IDENTIFY: Within each block, locate explicit recipe details (Name, Instructions, Ingredients).
3. VALIDATE: If a segment contains only an error message or "No results found", SKIP IT.
4. EXTRACT: Only pull fields actually present in the text. 
   - DO NOT infer ingredients that aren't listed.
   - DO NOT generate instructions if they are missing.
   - DO NOT create new recipes based on your general knowledge.
5. FORMAT: Convert each validated recipe into the required JSON structure.
6. SOURCE: Use the exactly 'Source Name' found in step 1 for the 'source' field.

### FALLBACK
If zero validated recipes are found in 'Raw Data', return: {"recipes": []}.

### OUTPUT FORMAT
JSON ONLY conformant to the recipes schema.`;

const getTranslatorPrompt = (i18n: AgentState['i18n']) => `### ROLE
You are a Culinary Translator and Recipe Formatter.

### PLATFORM STANDARDS (STRICT)
- category: MUST be one of [${i18n.categories.map(c => `"${c}"`).join(", ")}].
- ingredients: ONE ingredient per line. No bullets. Just the item and quantity.
- instructions: Detailed steps, placed below the ingredients.
- source: Preserve the original source.

### TERMINOLOGY
- Use "${i18n.ingredients}" for the ingredients section.
- Use "${i18n.instructions}" for the instructions section.

### TASK
Translate the recipes to the TARGET LANGUAGE while enforcing the standards above.
STRICT RULE: Only translate existing content. DO NOT add ingredients, tips, or instructions that were not in the original text.

### OUTPUT FORMAT
JSON ONLY conformant to the recipes schema.`;


/**
 * Node: Planner
 */
async function plannerNode(state: AgentState, config: any) {
  console.log("[Node: Planner] Generating plan...");
  const engine = config.configurable.engine;
  const lastMessage = state.messages[state.messages.length - 1];
  
  const inventorySummary = state.inventory?.map((i: any) => `${i.name}: ${i.quantity}`).join(", ").slice(0, 4000);

  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: plannerPrompt },
      { role: "user", content: `Inventory: ${inventorySummary}\nRequest: ${lastMessage.content}` }
    ],
    temperature: 0.1,
    top_p: 1.0,
    response_format: { 
      type: "json_object",
      schema: PLAN_JSON_SCHEMA 
    }
  });

  const rawContent = response.choices[0].message.content || "{}";
  const plan = PlanSchema.parse(JSON.parse(rawContent));
  console.log("[Node: Planner] Plan created:", plan.reasoning);
  
  return { 
    plan, 
    messages: [new AIMessage({ content: `Planejamento concluído: ${plan.reasoning}` })] 
  };
}

/**
 * Node: Tool Executor
 */
async function toolNode(state: AgentState) {
  console.log("[Node: Tools] Executing LLM-selected tools...");
  if (!state.plan?.toolCalls.length) {
    console.log("[Node: Tools] No tool calls selected in plan.");
    return { messages: [] };
  }
  
  const results = [];
  const searchPromises = state.plan.toolCalls.map(async (call) => {
    console.log(`[Tool Node] Executing ${call.tool} with input: ${call.input}`);
    try {
      const toolToRun = call.tool === "search_meal_db" ? tools[0] : tools[1];
      const toolInput = call.tool === "search_meal_db" ? { query: call.input } : { tag: call.input };
      
      const res = await (toolToRun as any).invoke(toolInput);
      const sourceLabel = call.tool === "search_meal_db" ? "MealDB" : "Hub Interno";
      return `[SOURCE:${sourceLabel}] Resultado para "${call.input}":\n${String(res).slice(0, 2000)}`;
    } catch (error) {
      return `Erro no tool ${call.tool}: ${error}`;
    }
  });

  const resolvedResults = await Promise.all(searchPromises);
  results.push(...resolvedResults);

  console.log("[Node: Tools] Dynamic execution completed.");
  return { 
    messages: [new HumanMessage({ content: `Resultados das Ferramentas:\n${results.join("\n\n")}` })] 
  };
}

/**
 * Node: Formatter
 */
async function formatterNode(state: AgentState, config: any) {
  console.log("[Node: Formatter] Structuring results...");
  const engine = config.configurable.engine;
  const lastResults = state.messages[state.messages.length - 1].content;

  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: formatterPrompt },
      { role: "user", content: `Raw Data: ${lastResults}` }
    ],
    response_format: { 
      type: "json_object",
      schema: getResultsSchema(state.i18n.categories)
    }
  });

  const rawJson = JSON.parse(response.choices[0].message.content || "{\"recipes\":[]}");
  const recipes = rawJson.recipes || [];

  console.log("[Node: Formatter] Structured recipes:", recipes.length);
  recipes.forEach((r: any) => {
    console.log(`  - [${r.source}] ${r.name} (${r.category})`);
  });
  
  return { 
    searchResults: recipes,
    messages: [new AIMessage({ content: `Encontrei ${recipes.length} receitas!` })]
  };
}

/**
 * Node: Translator
 */
async function translatorNode(state: AgentState, config: any) {
  if (!state.searchResults?.length) return { messages: [] };
  
  console.log(`[Node: Translator] Translating results to ${state.language} using LLM...`);
  const engine = config.configurable.engine;
  
  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: getTranslatorPrompt(state.i18n) },
      { role: "user", content: `Target Language: ${state.language}\nRecipes to translate: ${JSON.stringify(state.searchResults)}` }
    ],
    response_format: { 
      type: "json_object",
      schema: getResultsSchema(state.i18n.categories)
    }
  });

  const translatedJson = JSON.parse(response.choices[0].message.content || "{\"recipes\":[]}");
  const translatedRecipes = translatedJson.recipes || [];
  
  console.log("[Node: Translator] Translation finished.");
  translatedRecipes.forEach((r: any) => {
    console.log(`  - [MODIFIED] ${r.name} | Cat: ${r.category} | Source: ${r.source}`);
  });
  
  return { 
    searchResults: translatedRecipes,
    messages: [new AIMessage({ content: "Receitas traduzidas para português." })]
  };
}


/**
 * Graph Construction
 */
export const createAgentGraph = (checkpointer?: any) => {
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: { reducer: (x, y) => x.concat(y), default: () => [] },
      inventory: { reducer: (x, y) => y ?? x, default: () => null },
      plan: { reducer: (x, y) => y ?? x, default: () => null },
      searchResults: { reducer: (x, y) => y ?? x, default: () => null },
      diff: { reducer: (x, y) => y ?? x, default: () => null },
      approvals: { reducer: (x, y) => ({ ...x, ...y }), default: () => ({ plan: false, diff: false }) },
      language: { reducer: (x, y) => y ?? x, default: () => "portuguese" },
      i18n: { reducer: (x, y) => y ?? x, default: () => ({ 
        categories: ["Proteína", "Carbo", "Vegetais", "Molhos"],
        ingredients: "Ingredientes",
        instructions: "Modo de Preparo"
      })},
    }
  })
    .addNode("planner", plannerNode)
    .addNode("tools", toolNode)
    .addNode("formatter", formatterNode)
    .addNode("translator", translatorNode);
    
  // Edges
  workflow.addEdge(START, "planner");
  
  // Logical flow: planner -> [INTERRUPT] -> tools -> formatter -> translator -> END
  workflow.addEdge("planner", "tools");
  workflow.addEdge("tools", "formatter");
  workflow.addEdge("formatter", "translator");
  workflow.addEdge("translator", END);

  // We use structural interrupts (interruptBefore) instead of the interrupt() function
  // to avoid AsyncLocalStorage issues in the browser.
  return workflow.compile({ 
    checkpointer,
    interruptBefore: ["tools"] // Pause to approve the PLAN generated by the planner
  });
};
