import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Search,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useAI } from "@/contexts/AIContext";
import { useChefAgent } from "@/lib/agent/useChefAgent";
import { AgentPlan, RecipeDiff } from "@/lib/agent/types";
import { useInventory } from "@/hooks/useInventory";

export function ChefAIChat() {
  const { isChatOpen, setIsChatOpen, modelReady, isInitializing, loadingProgress } = useAI();
  const { t } = useLanguage();
  const { 
    messages, 
    pendingSearchPlan: currentPlan, 
    searchResults, 
    isSearching,
    isWaitingForApproval, 
    submitSearchQuery: runAgent, 
    approveSearchPlan: approvePlan, 
    rejectSearchPlan: rejectPlan,
  } = useChefAgent();

  const agentLoading = isSearching;
  const currentDiff = null; // Phase 2
  const approveDiff = () => {}; // Phase 2
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentLoading, currentPlan, currentDiff]);

  const handleSend = () => {
    if (!input.trim() || agentLoading || !modelReady) return;
    runAgent(input.trim());
    setInput("");
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center p-0 relative"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          {isInitializing && (
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
               <Loader2 className="w-3 h-3 text-white animate-spin" />
             </div>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-[400px] z-50 pointer-events-auto"
          >
            <Card className="shadow-2xl border-primary/10 overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
              <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-primary-foreground font-fredoka flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  {t("aiAssistant")}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-white/10 h-8 w-8"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                  {messages.length === 0 && !isInitializing && (
                    <div className="text-center py-8 px-4 space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        {t("aiAssistantDesc")}
                      </p>
                      {!modelReady && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                          {t("setupRequired")}
                        </div>
                      )}
                    </div>
                  )}

                  {isInitializing && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
                       <div className="text-center">
                         <p className="text-sm font-medium">{t("initializingModel")}</p>
                         <p className="text-xs text-muted-foreground">{loadingProgress}%</p>
                       </div>
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex w-full", msg.kwargs.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                        msg.kwargs.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Plan Approval HUD */}
                  {currentPlan && isWaitingForApproval && !currentDiff && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="border-primary/20 shadow-md">
                        <CardHeader className="p-3 bg-primary/5">
                          <CardTitle className="text-sm flex items-center gap-2">
                             <Search className="w-4 h-4 text-primary" />
                             Plano de Ação
                          </CardTitle>
                        </CardHeader>
                      <div className="text-xs space-y-2">
                        <p className="italic text-muted-foreground">{currentPlan.reasoning}</p>
                        <div className="space-y-1">
                          {currentPlan.toolCalls.map((call, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-background border border-primary/10">
                              <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase tracking-tight font-bold shrink-0">
                                {call.tool === 'search_meal_db' ? 'Global' : 'Comunidade'}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground truncate italic">
                                "{call.input}"
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 h-8 rounded-lg text-xs" onClick={rejectPlan}>
                          Refinar
                        </Button>
                        <Button size="sm" className="flex-1 h-8 rounded-lg text-xs" onClick={approvePlan}>
                          Aprovar
                        </Button>
                      </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Diff Approval HUD */}
                  {currentDiff && isWaitingForApproval && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="border-green-200 shadow-md">
                        <CardHeader className="p-3 bg-green-50 dark:bg-green-900/20">
                          <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                             <Check className="w-4 h-4" />
                             Adaptação Sugerida
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                           <p className="text-sm font-bold">{currentDiff.recipeName}</p>
                           <div className="space-y-2">
                             {currentDiff.addedIngredients.length > 0 && (
                               <div className="text-[11px] text-green-600 bg-green-50 dark:bg-green-900/10 p-2 rounded-md">
                                 <span className="font-bold">+ Adicionar:</span>
                                 <ul className="list-disc pl-4">{currentDiff.addedIngredients.map((ing, k) => <li key={k}>{ing}</li>)}</ul>
                               </div>
                             )}
                             {currentDiff.removedIngredients.length > 0 && (
                               <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
                                 <span className="font-bold">- Remover (Não tem no estoque):</span>
                                 <ul className="list-disc pl-4">{currentDiff.removedIngredients.map((ing, k) => <li key={k}>{ing}</li>)}</ul>
                               </div>
                             )}
                           </div>
                           <Button size="sm" className="w-full h-8 rounded-lg text-xs bg-green-600 hover:bg-green-700 font-bold" onClick={approveDiff}>
                             Salvar Adaptação
                           </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                  
                  {/* Search results are now displayed as cards in the SmartRecipeSearch component, 
                      which is rendered inside a dialog on the Hub page. 
                      However, if we want to show them in the chat itself, we'd need another UI block here.
                      For Phase 1, the chat focuses on Plan and Diff approval. */}
                  
                  {agentLoading && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aguardando IA...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Input
                      placeholder={modelReady ? "O que vamos cozinhar hoje?" : "IA não inicializada..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={agentLoading || !modelReady || isWaitingForApproval}
                      className="rounded-xl h-11 border-muted-foreground/20 focus-visible:ring-primary"
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={agentLoading || !input.trim() || !modelReady || isWaitingForApproval}
                      className="h-11 w-11 p-0 rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
