import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, BookOpen, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRecipes } from "@/hooks/useRecipes";
import { recipeHubService } from "@/services/recipeHubService";
import { Recipe } from "@/types/recipe";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedRecipeSearch } from "@/components/UnifiedRecipeSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RecipeDetailDialog } from "@/components/RecipeDetailDialog";
import { ExternalRecipeDetail } from "@/services/recipeService";
import { Category } from "@/types/inventory";

const HubRecipes = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { recipes: userRecipes, addRecipe } = useRecipes();
  
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [hubRecipes, setHubRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      const [all, popular] = await Promise.all([
        recipeHubService.getAllRecipes(),
        recipeHubService.getPopularRecipes(6)
      ]);
      setHubRecipes(all);
      setPopularRecipes(popular);
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  const handleAddRecipeWithTracking = async (recipe: Recipe) => {
    // Check if user already has this recipe
    const exists = userRecipes.some(r => r.name.toLowerCase() === recipe.name.toLowerCase());
    
    if (exists) {
      toast.info(t("recipeDishName") + " " + recipe.name + " " + t("alreadyInCollection"));
      return;
    }

    addRecipe(
      recipe.name,
      recipe.category,
      recipe.ingredients,
      recipe.instructions,
      recipe.portions,
      recipe.storageOptions
    );
    
    // Increment popularity in global hub
    recipeHubService.incrementPopularity(recipe.uuid);
    
    toast.success(`${t("recipeAdded")} (${recipe.name})`);
    setDetailOpen(false);
  };

  const handleSaveExternal = (extRecipe: ExternalRecipeDetail) => {
    const recipe: Recipe = {
      uuid: crypto.randomUUID(),
      name: extRecipe.name,
      category: (extRecipe.category.toLowerCase() as Category) || "protein",
      ingredients: extRecipe.ingredients,
      instructions: extRecipe.instructions,
      portions: 4,
      storageOptions: [{ type: "freezer", expiryDays: 30 }],
      created_at: new Date().toISOString().split("T")[0]
    };
    
    handleAddRecipeWithTracking(recipe);
    setSearchModalOpen(false);
  };

  const openDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDetailOpen(true);
  };

  const filteredHub = hubRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-fredoka">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b shadow-sm px-4 py-3">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            {t("hubTitle")}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Call to External Search */}
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col items-center text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">{t("unifiedSearchTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("hubDesc")}
            </p>
          </div>
          <Button 
            onClick={() => setSearchModalOpen(true)}
            className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20"
          >
            {t("searchExternalHub")}
          </Button>
        </div>

        {/* Popular Section */}
        {popularRecipes.length > 0 && !searchTerm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                {t("popularRecipes")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularRecipes.map((recipe) => (
                <Card 
                  key={recipe.uuid} 
                  className="overflow-hidden border-muted/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => openDetail(recipe)}
                >
                  <div className="h-24 bg-muted relative">
                    {(recipe as any).strMealThumb && (
                      <img src={(recipe as any).strMealThumb} alt={recipe.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <Badge className="absolute top-2 left-2 text-[10px] py-0 px-1.5" variant="secondary">
                      {t(recipe.category as any)}
                    </Badge>
                  </div>
                  <CardHeader className="p-3">
                    <CardTitle className="text-xs font-bold line-clamp-2">
                      {recipe.name}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Library Section */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t("hubLibraryTitle")}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t("hubSearchPlaceholder") as string}
              className="pl-10 rounded-xl h-12 shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">{t("loadingHub")}</p>
              </div>
            ) : filteredHub.length > 0 ? (
              <AnimatePresence>
                {filteredHub.map((recipe, index) => (
                  <motion.div
                    key={recipe.uuid || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openDetail(recipe)}
                    className="cursor-pointer"
                  >
                    <Card className="overflow-hidden border-muted/40 shadow-sm hover:shadow-md transition-all group">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="mb-2 font-semibold">
                            {t(recipe.category as any)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {recipe.portions} {t("portions")}
                          </span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {recipe.name}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-2 border-t bg-muted/5 flex justify-between items-center p-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {t("viewDetails")}
                        </span>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddRecipeWithTracking(recipe);
                          }}
                          className="h-8 gap-1.5 font-bold text-primary"
                        >
                          <Plus className="w-4 h-4" />
                          {t("add")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20 space-y-2">
                <Search className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground font-medium">{t("noRecipesFound")}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* External Search Dialog */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="max-w-lg p-6 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-xl">{t("searchExternalHub")}</DialogTitle>
            <DialogDescription>{t("hubDesc")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <UnifiedRecipeSearch onSave={handleSaveExternal} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <RecipeDetailDialog 
        recipe={selectedRecipe}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAdd={handleAddRecipeWithTracking}
      />
    </div>
  );
};

export default HubRecipes;
