import { useState } from "react";
import { 
  Search, 
  Loader2, 
  Zap, 
  Check, 
  ChevronRight,
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useChefAgent } from "@/lib/agent/useChefAgent";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalRecipeDetail } from "@/services/recipeService";
import { cn } from "@/lib/utils";
import { RecipeDiffCard } from "./RecipeDiffCard";

interface SmartRecipeSearchProps {
  onSave?: (recipe: ExternalRecipeDetail) => void;
}

export function SmartRecipeSearch({ onSave }: SmartRecipeSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const {
    submitSearchQuery,
    approveSearchPlan,
    rejectSearchPlan,
    pendingSearchPlan,
    searchResults,
    recipeDiff,
    isSearching,
    isWaitingForApproval,
    updateSearchPlan
  } = useChefAgent();

  const [selectedRecipe, setSelectedRecipe] = useState<ExternalRecipeDetail | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    submitSearchQuery(query.trim());
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-primary font-fredoka">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Busca Inteligente (IA Local)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ex: Almoço rápido com frango e batata..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching || isWaitingForApproval}
                className="pl-10 rounded-xl h-12 shadow-sm focus-visible:ring-primary border-primary/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching || !query.trim() || isWaitingForApproval}
              className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analisar"}
            </Button>
          </form>

          <AnimatePresence>
            {isWaitingForApproval && pendingSearchPlan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pt-2"
              >
                <Card className="border-primary/30 shadow-md bg-card">
                  <CardHeader className="p-4 bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                       <Zap className="w-4 h-4 text-primary" />
                       Plano de Busca da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{pendingSearchPlan.reasoning}"
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary/60">Ações Planejadas:</p>
                      <div className="space-y-2">
                        {pendingSearchPlan.toolCalls.map((call, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background border border-primary/10 shadow-sm group/item">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Badge variant="secondary" className="text-[9px] font-bold uppercase shrink-0">
                                {call.tool === 'search_meal_db' ? 'Global' : 'Comunidade'}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate italic">
                                "{call.input}"
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              onClick={() => {
                                const newCalls = pendingSearchPlan.toolCalls.filter((_, i) => i !== idx);
                                updateSearchPlan({ ...pendingSearchPlan, toolCalls: newCalls });
                              }}
                            >
                              <Plus className="w-3 h-3 rotate-45" />
                            </Button>
                          </div>
                        ))}

                        {/* Quick Add Buttons */}
                        <div className="flex gap-2 pt-1">
                          {!pendingSearchPlan.toolCalls.some(c => c.tool === 'search_meal_db') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] gap-1 border-dashed"
                              onClick={() => {
                                const input = query || "receita";
                                updateSearchPlan({ 
                                  ...pendingSearchPlan, 
                                  toolCalls: [...pendingSearchPlan.toolCalls, { tool: 'search_meal_db', input: 'chicken' }] 
                                });
                              }}
                            >
                              <Plus className="w-3 h-3" /> Add Global
                            </Button>
                          )}
                          {!pendingSearchPlan.toolCalls.some(c => c.tool === 'search_internal_hub') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] gap-1 border-dashed"
                              onClick={() => {
                                updateSearchPlan({ 
                                  ...pendingSearchPlan, 
                                  toolCalls: [...pendingSearchPlan.toolCalls, { tool: 'search_internal_hub', input: query || 'receita' }] 
                                });
                              }}
                            >
                              <Plus className="w-3 h-3" /> Add Comunidade
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline"
                        onClick={rejectSearchPlan}
                        disabled={isSearching}
                        className="flex-1 rounded-xl h-11 font-bold border-primary/20 hover:bg-neutral-100"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={approveSearchPlan}
                        disabled={isSearching || pendingSearchPlan.toolCalls.length === 0}
                        className="flex-[2] rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Executar Busca ({pendingSearchPlan.toolCalls.length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isSearching && !isWaitingForApproval && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Executando inteligência culinary...
            </p>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Receitas Encontradas
              </h3>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {searchResults.length} Resultados
              </Badge>
            </div>

            <div className="grid gap-4">
              {searchResults.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden border-muted-foreground/10 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex flex-row min-h-32">
                    {recipe.imageUrl ? (
                      <div className="w-32 h-full shrink-0 relative">
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      </div>
                    ) : (
                      <div className="w-32 h-full shrink-0 bg-primary/5 flex items-center justify-center p-4">
                        <Sparkles className="w-8 h-8 text-primary/20" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={cn(
                            "font-bold line-clamp-2 group-hover:text-primary transition-colors",
                            !recipe.imageUrl ? "text-lg" : "text-sm"
                          )}>
                            {recipe.name}
                          </h4>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">
                            {recipe.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-normal text-muted-foreground">
                            {recipe.source}
                          </Badge>
                          <p className="text-xs text-muted-foreground line-clamp-1 italic">
                            {recipe.ingredients.split("\n").slice(0, 3).join(", ")}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 gap-1.5 font-bold text-primary text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSave?.(recipe);
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {searchResults && searchResults.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4 text-center px-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Nenhuma receita encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Não conseguimos encontrar receitas com esses critérios. Tente termos mais simples como "frango" ou "carne".
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-8">
              <DialogHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <DialogTitle className="text-3xl font-fredoka text-primary leading-tight">
                      {selectedRecipe.name}
                    </DialogTitle>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="secondary" className="px-3 py-1 font-bold">{selectedRecipe.category}</Badge>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{selectedRecipe.source}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {selectedRecipe.imageUrl && (
                <div className="w-full h-80 rounded-3xl overflow-hidden shadow-xl border border-primary/5">
                  <img src={selectedRecipe.imageUrl} alt={selectedRecipe.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-2 text-primary text-lg">
                    <Check className="w-5 h-5" />
                    Ingredientes
                  </h4>
                  <div className="bg-muted/30 p-6 rounded-3xl text-base leading-loose whitespace-pre-line border border-primary/5 shadow-inner">
                    {selectedRecipe.ingredients}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-2 text-primary text-lg">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Modo de Preparo
                  </h4>
                  <div className="bg-muted/30 p-6 rounded-3xl text-base leading-loose whitespace-pre-line border border-primary/5 shadow-inner">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-primary/10">
                <Button 
                  onClick={() => {
                    onSave?.(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className="rounded-2xl h-14 px-10 font-bold text-lg shadow-lg shadow-primary/30"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Adicionar à Minha Biblioteca
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
