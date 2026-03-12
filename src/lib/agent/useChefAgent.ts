import { useState, useCallback, useMemo } from "react";
import { useAI } from "@/contexts/AIContext";
import { useInventory } from "@/hooks/useInventory";
import { useLanguage } from "@/contexts/LanguageContext";
import { createAgentGraph } from "./agent";
import { HumanMessage } from "@langchain/core/messages";
import { AgentPlan, RecipeDiff } from "./types";
import { toast } from "sonner";
import { MemorySaver } from "@langchain/langgraph";
import { ExternalRecipeDetail } from "@/services/recipeService";

/**
 * useChefAgent Hook - Phase 1: Smart Search
 * 
 * Flow: submitSearchQuery -> intent extraction -> interrupt (pendingSearchPlan) -> approveSearchPlan -> run tools -> results
 */
export function useChefAgent() {
  const { engine, modelReady } = useAI();
  const { data } = useInventory();
  const { lang, t } = useLanguage();
  
  // State for Phase 1 & 2
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingSearchPlan, setPendingSearchPlan] = useState<AgentPlan | null>(null);
  const [searchResults, setSearchResults] = useState<ExternalRecipeDetail[] | null>(null);
  const [recipeDiff, setRecipeDiff] = useState<RecipeDiff | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

  // Persistence (Native HITL)
  const checkpointer = useMemo(() => new MemorySaver(), []);
  const thread_id = useMemo(() => `search-${Date.now()}`, []);
  
  const graph = useMemo(() => createAgentGraph(checkpointer), [checkpointer]);

  /**
   * Starts Phase 1: Intent Extraction
   */
  const submitSearchQuery = useCallback(async (query: string) => {
    if (!modelReady || !engine) {
      toast.error("IA não inicializada ou hardware incompatível.");
      return;
    }

    setIsSearching(true);
    setSearchResults(null);
    setPendingSearchPlan(null);
    setRecipeDiff(null);

    const initialState = {
      messages: [new HumanMessage({ content: query })],
      inventory: data.inventory,
      plan: null,
      searchResults: null,
      diff: null,
      approvals: { plan: false, diff: false },
      language: lang === 'pt' ? 'portuguese' : 'english',
      i18n: {
        categories: [t('protein'), t('carb'), t('veggie'), t('flavor')],
        ingredients: t('ingredientsLabel'),
        instructions: t('howToMakeLabel'),
      }
    };

    try {
      // Run until 'tools' interrupt
      const result = await graph.invoke(initialState as any, {
        configurable: { engine, thread_id },
      }) as any;

      setMessages(result.messages);
      
      if (result.plan) {
        setPendingSearchPlan(result.plan);
        setIsWaitingForApproval(true);
      }
    } catch (error) {
      console.error("Agent Search Error:", error);
      toast.error("Erro ao analisar sua busca.");
    } finally {
      setIsSearching(false);
    }
  }, [engine, modelReady, data.inventory, graph, thread_id]);

  /**
   * Resumes Phase 1: Tool Execution -> Formatter -> Phase 2: Recipe Adaptation
   */
  const approveSearchPlan = useCallback(async () => {
    if (!pendingSearchPlan) return;
    
    setIsSearching(true);
    setIsWaitingForApproval(false);

    try {
      // Resume from interrupt point
      const result = await graph.invoke(null, {
        configurable: { engine, thread_id },
      }) as any;

      setMessages(result.messages);
      
      if (result.searchResults) {
        setSearchResults(result.searchResults);
      }

      // Diff from Phase 2
      if (result.diff) {
        setRecipeDiff(result.diff);
        toast.info("A IA sugeriu adaptações para a receita encontrada!");
      }
      
      setPendingSearchPlan(null);
      toast.success("Busca e Adaptação concluídas!");
    } catch (error) {
      console.error("Search Approval Error:", error);
      toast.error("Erro ao executar as ferramentas de busca.");
    } finally {
      setIsSearching(false);
    }
  }, [pendingSearchPlan, engine, graph, thread_id]);

  /**
   * Manually updates the pending plan before approval
   */
  const updateSearchPlan = useCallback(async (newPlan: AgentPlan) => {
    setPendingSearchPlan(newPlan);
    
    // Synchronize with graph state
    try {
      await graph.updateState({ configurable: { thread_id } }, { plan: newPlan });
    } catch (error) {
      console.error("Failed to update graph state:", error);
    }
  }, [graph, thread_id]);

  /**
   * Resets the current search flow
   */
  const rejectSearchPlan = useCallback(() => {
    setPendingSearchPlan(null);
    setIsWaitingForApproval(false);
    setMessages([]);
    setSearchResults(null);
    setRecipeDiff(null);
    toast.info("Busca cancelada. Pode tentar um novo termo!");
  }, []);

  return {
    submitSearchQuery,
    approveSearchPlan,
    rejectSearchPlan,
    pendingSearchPlan,
    searchResults,
    recipeDiff,
    isSearching,
    isWaitingForApproval,
    messages,
    updateSearchPlan
  };
}
