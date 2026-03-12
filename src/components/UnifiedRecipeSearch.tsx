import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import Fuse from "fuse.js";
import { Search, Loader2, ChefHat, ExternalLink, Plus, Info, Zap } from "lucide-react";
import { getExternalRecipeById, searchExternalRecipesByName, ExternalRecipeDetail } from "../services/recipeService";
import { translateToEnglish } from "../utils/translate";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UnifiedRecipeSearchProps {
  onSave?: (recipe: ExternalRecipeDetail) => void;
}

export function UnifiedRecipeSearch({ onSave }: UnifiedRecipeSearchProps) {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExternalRecipeDetail[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<ExternalRecipeDetail | null>(null);

  // Fuse configuration for fuzzy matching within results
  const fuse = useMemo(() => {
    return new Fuse(results, {
      keys: ["name"],
      threshold: 0.4,
    });
  }, [results]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setLoading(true);
    setSelectedRecipe(null);
    setResults([]);

    try {
      // Logic: If query is numeric, assume it's an ID. Otherwise, search by name.
      const isId = /^\d+$/.test(query);

      if (isId) {
        const recipe = await getExternalRecipeById(query, lang);
        setSelectedRecipe(recipe);
        setResults([recipe]);
      } else {
        // If we are in EN, we don't need to translate the query
        // If we are in PT, we translate to EN so MealDB can understand
        const englishQuery = lang === "en" ? query : await translateToEnglish(query);
        const found = await searchExternalRecipesByName(englishQuery, lang);
        setResults(found);
        if (found.length === 1) {
          setSelectedRecipe(found[0]);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === "aiNotFoundTitle") {
        toast.error(t("aiNotFoundTitle"), {
          description: t("aiNotFoundDesc"),
          duration: 5000,
        });
      } else {
        const msg = err instanceof Error ? err.message : t("searchError");
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtered results based on fuzzy typing while having a result list
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim() || selectedRecipe) return results;
    const fuzzy = fuse.search(searchTerm);
    return fuzzy.length > 0 ? fuzzy.map(r => r.item) : results;
  }, [searchTerm, results, fuse, selectedRecipe]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5" />
            {t("unifiedSearchTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("unifiedSearchPlaceholder") as string}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl h-12 shadow-sm focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !searchTerm.trim()}
              className="rounded-xl px-8 h-12 font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("search")}
            </Button>
          </form>

          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-primary italic">{t("unifiedSearchTipTitle")}</p>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                {t("unifiedSearchTipDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">{t("searchingAndTranslating")}</p>
          </motion.div>
        )}

        {!loading && selectedRecipe && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-card">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={selectedRecipe.imageUrl} 
                  alt={selectedRecipe.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-primary font-bold px-3 py-1">
                    {t(selectedRecipe.category.toLowerCase() as any)}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white border-none rounded-full"
                  onClick={() => setSelectedRecipe(null)}
                >
                  {t("backToResults")}
                </Button>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold font-fredoka text-primary">
                  {selectedRecipe.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-primary">
                    <ChefHat className="w-4 h-4" />
                    {t("ingredients")}
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line border border-muted/50">
                    {selectedRecipe.ingredients}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-primary">👨‍🍳 {t("howToMakeLabel")}</h3>
                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/10 p-4 rounded-xl border border-muted/20">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/30 p-4 flex gap-3 border-t">
                {selectedRecipe.youtubeUrl && (
                  <Button variant="outline" asChild className="flex-1 rounded-xl gap-2 h-12 shadow-sm">
                    <a href={selectedRecipe.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {t("youtube")}
                    </a>
                  </Button>
                )}
                <Button 
                  className="flex-1 rounded-xl gap-2 h-12 font-bold shadow-md"
                  onClick={() => onSave?.(selectedRecipe)}
                >
                  <Plus className="w-5 h-5" />
                  {t("saveToMyHub")}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {!loading && !selectedRecipe && filteredResults.length > 0 && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {filteredResults.map((recipe) => (
              <Card 
                key={recipe.id}
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md h-full flex flex-col group"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-3 bg-card flex-grow flex items-center justify-center text-center">
                  <p className="text-xs font-bold leading-tight line-clamp-2">{recipe.name}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {!loading && !selectedRecipe && searchTerm.trim() && filteredResults.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("noResultsFound")}</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
