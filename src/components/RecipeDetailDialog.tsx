import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe } from "@/types/recipe";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChefHat, Clock, Users, Plus, BookOpen, Youtube, ExternalLink } from "lucide-react";

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
  isExternal?: boolean;
}

export function RecipeDetailDialog({ recipe, open, onClose, onAdd, isExternal }: RecipeDetailDialogProps) {
  const { t } = useLanguage();

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
          {(recipe as any).strMealThumb ? (
            <img 
              src={(recipe as any).strMealThumb} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <ChefHat className="w-16 h-16 text-muted-foreground/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-white/20 text-white border-white/30">
              {t(recipe.category as any)}
            </Badge>
            <DialogTitle className="text-2xl font-fredoka font-bold text-white leading-tight">
              {recipe.name}
            </DialogTitle>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-sm text-muted-foreground pb-4 border-b">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{recipe.portions} {t("portions")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{recipe.created_at}</span>
              </div>
              {(recipe as any).ownerId && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{t("sharedBy")}: {(recipe as any).ownerId.substring(0, 6)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-fredoka font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {t("ingredients")}
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.split("\n").filter(Boolean).map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-fredoka font-bold text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                {t("howToMake")}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap bg-muted/20 p-4 rounded-xl border border-muted-foreground/10">
                {recipe.instructions}
              </p>
            </div>

            {(recipe as any).strYoutube && (
              <Button 
                variant="outline" 
                className="w-full gap-2 rounded-xl h-12"
                onClick={() => window.open((recipe as any).strYoutube, "_blank")}
              >
                <Youtube className="w-5 h-5 text-red-600" />
                {t("youtube")}
              </Button>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 bg-muted/30 border-t sm:justify-between flex-row gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl flex-1">
            {t("cancel")}
          </Button>
          <Button onClick={() => onAdd(recipe)} className="rounded-xl flex-[2] gap-2 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            {t("addToMyRecipes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
