import { useState } from "react";
import { Category } from "@/types/inventory";
import { useInventory } from "@/hooks/useInventory";
import { useRecipes } from "@/hooks/useRecipes";
import { useIngredients } from "@/hooks/useIngredients";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { MonthCalendar } from "@/components/MonthCalendar";
import { StockIndicators } from "@/components/StockIndicators";
import { MissionCard } from "@/components/MissionCard";
import { ProductionFAB } from "@/components/ProductionFAB";
import { ProductionSheet } from "@/components/ProductionSheet";
import { DinnerRoulette } from "@/components/DinnerRoulette";
import { ManualConsume } from "@/components/ManualConsume";
import { RecipeBook } from "@/components/RecipeBook";
import { IngredientManager } from "@/components/IngredientManager";
import { ShoppingList } from "@/components/ShoppingList";
import { StockViewer } from "@/components/StockViewer";
import { ExpiredAlerts } from "@/components/ExpiredAlerts";
import { Button } from "@/components/ui/button";

const Index = () => {
  const {
    data,
    addItem,
    consumeItem,
    getCategoryTotal,
    getItemsByCategory,
  } = useInventory();

  const { recipes, addRecipe, removeRecipe, getRecipesByCategory } = useRecipes();
  const { ingredients, addIngredient, removeIngredient, updateIngredient } = useIngredients();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [recipeBookOpen, setRecipeBookOpen] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <ExpiredAlerts
          getItemsByCategory={getItemsByCategory}
          ingredients={ingredients}
          onConsumeItem={consumeItem}
          onRemoveIngredient={removeIngredient}
        />

        <StockIndicators
          getCategoryTotal={getCategoryTotal}
          settings={data.settings}
        />

        <MonthCalendar
          history={data.history}
          inventory={data.inventory}
          ingredients={ingredients}
        />

        <MissionCard
          getCategoryTotal={getCategoryTotal}
          settings={data.settings}
          getRecipesByCategory={getRecipesByCategory}
          onAddToStock={addItem}
          ingredients={ingredients}
          onUpdateIngredient={updateIngredient}
          onRemoveIngredient={removeIngredient}
        />

        <Button
          onClick={() => setRouletteOpen(true)}
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold font-fredoka rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
          {t("whatToEat")}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => setManualOpen(true)}
            className="h-11 rounded-xl font-semibold text-xs sm:text-sm bg-[hsl(24_90%_92%)] border-[hsl(24_80%_82%)] text-[hsl(24_60%_35%)] hover:bg-[hsl(24_90%_86%)] dark:bg-[hsl(24_40%_20%)] dark:border-[hsl(24_30%_30%)] dark:text-[hsl(24_80%_75%)] dark:hover:bg-[hsl(24_40%_25%)]"
          >
            {t("manualConsume")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setRecipeBookOpen(true)}
            className="h-11 rounded-xl font-semibold text-xs sm:text-sm bg-[hsl(280_60%_93%)] border-[hsl(280_50%_83%)] text-[hsl(280_40%_35%)] hover:bg-[hsl(280_60%_87%)] dark:bg-[hsl(280_30%_20%)] dark:border-[hsl(280_25%_30%)] dark:text-[hsl(280_60%_75%)] dark:hover:bg-[hsl(280_30%_25%)]"
          >
            {t("recipes")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIngredientsOpen(true)}
            className="h-11 rounded-xl font-semibold text-xs sm:text-sm bg-[hsl(145_50%_92%)] border-[hsl(145_40%_82%)] text-[hsl(145_40%_30%)] hover:bg-[hsl(145_50%_86%)] dark:bg-[hsl(145_25%_18%)] dark:border-[hsl(145_20%_28%)] dark:text-[hsl(145_50%_70%)] dark:hover:bg-[hsl(145_25%_23%)]"
          >
            {t("ingredientsBtn")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShoppingOpen(true)}
            className="h-11 rounded-xl font-semibold text-xs sm:text-sm bg-[hsl(215_70%_93%)] border-[hsl(215_60%_83%)] text-[hsl(215_50%_35%)] hover:bg-[hsl(215_70%_87%)] dark:bg-[hsl(215_30%_18%)] dark:border-[hsl(215_25%_28%)] dark:text-[hsl(215_60%_75%)] dark:hover:bg-[hsl(215_30%_23%)]"
          >
            {t("shopping")}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setStockOpen(true)}
          className="w-full h-11 rounded-xl font-semibold text-sm"
        >
          {t("viewStock")}
        </Button>
      </main>

      <ProductionFAB onSelectCategory={setSelectedCategory} />

      <ProductionSheet
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onAdd={addItem}
        recipes={recipes}
      />

      <DinnerRoulette
        open={rouletteOpen}
        onClose={() => setRouletteOpen(false)}
        getItemsByCategory={getItemsByCategory}
        onConsume={consumeItem}
        history={data.history}
      />

      <ManualConsume
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        getItemsByCategory={getItemsByCategory}
        onConsume={consumeItem}
      />

      <RecipeBook
        open={recipeBookOpen}
        onClose={() => setRecipeBookOpen(false)}
        recipes={recipes}
        onAdd={addRecipe}
        onRemove={removeRecipe}
      />

      <IngredientManager
        open={ingredientsOpen}
        onClose={() => setIngredientsOpen(false)}
        ingredients={ingredients}
        onAdd={addIngredient}
        onRemove={removeIngredient}
      />

      <ShoppingList
        open={shoppingOpen}
        onClose={() => setShoppingOpen(false)}
        recipes={recipes}
        ingredients={ingredients}
      />

      <StockViewer
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        getItemsByCategory={getItemsByCategory}
        onConsume={consumeItem}
      />
    </div>
  );
};

export default Index;
