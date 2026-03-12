import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  MinusCircle, 
  PlusCircle, 
  ChevronRight, 
  ChefHat,
  Utensils
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface RecipeDiffCardProps {
  diff: {
    recipeId: string;
    recipeName: string;
    addedIngredients: string[];
    removedIngredients: string[];
    instructionsChanged: boolean;
    newInstructions: string;
  };
}

export const RecipeDiffCard: React.FC<RecipeDiffCardProps> = ({ diff }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-6"
    >
      <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-primary/5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-fredoka font-bold">
                Adaptação do Chef: {diff.recipeName}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1 px-3">
              <Sparkles className="w-3 h-3" />
              IA Sugestão
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients to Add/Buy */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-destructive">
                <PlusCircle className="w-4 h-4" />
                <span>O que falta no seu estoque:</span>
              </div>
              <div className="space-y-2">
                {diff.addedIngredients.length > 0 ? (
                  diff.addedIngredients.map((ing, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 bg-destructive/5 p-2 rounded-lg border border-destructive/10 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      {ing}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Nada a adicionar! Você tem tudo.</p>
                )}
              </div>
            </div>

            {/* Ingredients to Remove/Substitute */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                <MinusCircle className="w-4 h-4" />
                <span>Substituir/Remover (Não possui):</span>
              </div>
              <div className="space-y-2">
                {diff.removedIngredients.length > 0 ? (
                  diff.removedIngredients.map((ing, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {ing}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Nenhuma substituição necessária.</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-primary/10" />

          {/* New Instructions */}
          {diff.instructionsChanged && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Utensils className="w-4 h-4" />
                <span>Como preparar com o seu estoque:</span>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border border-primary/5 italic text-sm leading-relaxed text-muted-foreground">
                "{diff.newInstructions}"
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" className="rounded-xl border-primary/20 text-xs font-semibold h-10 px-6">
              Salvar Versão Adaptada
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-8 shadow-lg shadow-primary/20 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Assumir Plano
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
