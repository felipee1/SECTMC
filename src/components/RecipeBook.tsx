import { useState } from "react";
import { Plus, Trash2, BookOpen, ChevronDown, ChevronUp, Sparkles, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Category, CATEGORY_EMOJIS } from "@/types/inventory";
import { Recipe, StorageType, StorageOption, STORAGE_EXPIRY_DAYS, getRecipeStorageOptions } from "@/types/recipe";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecipeBookProps {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onAdd: (name: string, category: Category, ingredients: string, instructions: string, portions: number, storageOptions: StorageOption[]) => void;
  onRemove: (uuid: string) => void;
}

const STORAGE_EMOJIS: Record<StorageType, string> = { freezer: "❄️", fridge: "🧊", natura: "🌡️" };

export function RecipeBook({ open, onClose, recipes, onAdd, onRemove }: RecipeBookProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("protein");
  const [newIngredients, setNewIngredients] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newPortions, setNewPortions] = useState(4);
  const [newStorageOptions, setNewStorageOptions] = useState<StorageOption[]>([
    { type: "freezer", expiryDays: 30 },
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: Category[] = ["protein", "carb", "veggie", "flavor"];
  const storageTypes: StorageType[] = ["freezer", "fridge", "natura"];

  const toggleStorage = (st: StorageType) => {
    const existing = newStorageOptions.find((o) => o.type === st);
    if (existing) {
      // Don't allow removing the last one
      if (newStorageOptions.length <= 1) return;
      setNewStorageOptions(newStorageOptions.filter((o) => o.type !== st));
    } else {
      setNewStorageOptions([...newStorageOptions, { type: st, expiryDays: STORAGE_EXPIRY_DAYS[st] }]);
    }
  };

  const updateExpiryDays = (st: StorageType, days: number) => {
    setNewStorageOptions(
      newStorageOptions.map((o) => (o.type === st ? { ...o, expiryDays: Math.max(1, days) } : o))
    );
  };

  const handleAdd = () => {
    if (!newName.trim() || newStorageOptions.length === 0) return;
    onAdd(newName, newCategory, newIngredients, newInstructions, newPortions, newStorageOptions);
    setNewName("");
    setNewIngredients("");
    setNewInstructions("");
    setNewPortions(4);
    setNewStorageOptions([{ type: "freezer", expiryDays: 30 }]);
    setAdding(false);
  };

  const grouped = categories.map((cat) => ({
    cat,
    items: recipes.filter((r) => r.category === cat),
  }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] px-4 sm:px-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-fredoka text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> {t("recipeBookTitle")}
          </SheetTitle>
          <SheetDescription>{t("yourRecipes")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                {CATEGORY_EMOJIS[cat]} {t(cat)}
                <span className="text-muted-foreground font-normal ml-1">({items.length})</span>
              </h3>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-2">{t("noRecipes")}</p>
              ) : (
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {items.map((recipe) => {
                      const opts = getRecipeStorageOptions(recipe);
                      return (
                        <motion.div key={recipe.uuid} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="bg-muted rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2">
                            <button className="flex items-center gap-1.5 text-sm font-medium text-left flex-1" onClick={() => setExpandedId(expandedId === recipe.uuid ? null : recipe.uuid)}>
                              {expandedId === recipe.uuid ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                              {recipe.name}
                              <span className="text-xs text-muted-foreground ml-1">
                                {opts.map((o) => STORAGE_EMOJIS[o.type]).join("")}
                              </span>
                            </button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0" onClick={() => onRemove(recipe.uuid)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <AnimatePresence>
                            {expandedId === recipe.uuid && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-3 pb-3 space-y-2 text-xs">
                                  {recipe.portions > 0 && (
                                    <p className="font-semibold text-primary">🍽️ {t("yield")}: {recipe.portions} {t("portions")}</p>
                                  )}
                                  <div>
                                    <p className="font-semibold mb-0.5">{t("storageType")}:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {opts.map((o) => (
                                        <span key={o.type} className="inline-flex items-center gap-0.5 bg-background px-2 py-0.5 rounded-lg text-xs">
                                          {STORAGE_EMOJIS[o.type]} {t(o.type)} · {o.expiryDays}{t("days")}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  {recipe.ingredients && (
                                    <div>
                                      <p className="font-semibold text-muted-foreground mb-0.5">{t("ingredientsLabel")}</p>
                                      <p className="whitespace-pre-wrap">{recipe.ingredients}</p>
                                    </div>
                                  )}
                                  {recipe.instructions && (
                                    <div>
                                      <p className="font-semibold text-muted-foreground mb-0.5">{t("howToMakeLabel")}</p>
                                      <p className="whitespace-pre-wrap">{recipe.instructions}</p>
                                    </div>
                                  )}
                                  {!recipe.ingredients && !recipe.instructions && (
                                    <p className="text-muted-foreground italic">{t("noDetails")}</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {!adding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold text-sm tracking-tight">{t("hubCTATitle")}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("hubCTADesc")}
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-10 gap-2 font-bold text-xs"
                onClick={() => {
                  onClose();
                  navigate("/hub");
                }}
              >
                <ChefHat className="w-4 h-4" />
                {t("openHub")}
              </Button>
            </motion.div>
          )}

          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 overflow-hidden">
              <Input placeholder={t("recipeName") as string} value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl h-12 text-base" autoFocus />
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <Button key={cat} variant={newCategory === cat ? "default" : "outline"} className="flex-1 rounded-xl h-10 text-xs font-semibold" onClick={() => setNewCategory(cat)}>
                    {CATEGORY_EMOJIS[cat]} {t(cat)}
                  </Button>
                ))}
              </div>

              {/* Multi-select storage with custom expiry days */}
              <div>
                <label className="text-sm font-medium mb-1 block">{t("storageType")}</label>
                <div className="flex gap-2 mb-2">
                  {storageTypes.map((st) => {
                    const isSelected = newStorageOptions.some((o) => o.type === st);
                    return (
                      <Button
                        key={st}
                        variant={isSelected ? "default" : "outline"}
                        className="flex-1 rounded-xl h-10 text-xs font-semibold"
                        onClick={() => toggleStorage(st)}
                      >
                        {STORAGE_EMOJIS[st]} {t(st)}
                      </Button>
                    );
                  })}
                </div>
                {/* Expiry days per selected storage */}
                <div className="space-y-2">
                  {newStorageOptions.map((opt) => (
                    <div key={opt.type} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                      <span className="text-sm font-medium flex-shrink-0">
                        {STORAGE_EMOJIS[opt.type]} {t(opt.type)}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={opt.expiryDays}
                        onChange={(e) => updateExpiryDays(opt.type, parseInt(e.target.value) || 1)}
                        className="rounded-lg h-9 w-20 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground">{t("days")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Textarea placeholder={t("ingredientsPerLineQty") as string} value={newIngredients} onChange={(e) => setNewIngredients(e.target.value)} className="rounded-xl text-sm min-h-[80px]" />
              <Textarea placeholder={t("howToPrepare") as string} value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} className="rounded-xl text-sm min-h-[80px]" />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">🍽️ {t("yield")}:</label>
                <Input type="number" min={1} value={newPortions} onChange={(e) => setNewPortions(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl h-10 w-24 text-center" />
                <span className="text-sm text-muted-foreground">{t("portions")}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setAdding(false); setNewName(""); setNewIngredients(""); setNewInstructions(""); setNewStorageOptions([{ type: "freezer", expiryDays: 30 }]); }}>
                  {t("cancel")}
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleAdd} disabled={!newName.trim() || newStorageOptions.length === 0}>
                  {t("save")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!adding && (
          <Button className="w-full mt-4 rounded-xl h-12 font-bold gap-2" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> {t("addRecipe")}
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}