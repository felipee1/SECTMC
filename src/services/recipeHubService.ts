import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, increment, query, orderBy, limit } from "firebase/firestore";
import { Recipe } from "@/types/recipe";

const COLLECTION_NAME = "platform_recipes";

export const recipeHubService = {
  /**
   * Fetches all shared recipes from the platform hub
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      if (!db || !db.type) return [];
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Recipe),
      }));
    } catch (error) {
      console.error("Error fetching recipes from hub:", error);
      return [];
    }
  },

  /**
   * Fetches recipes ordered by popularity
   */
  async getPopularRecipes(max: number = 5): Promise<Recipe[]> {
    try {
      if (!db || !db.type) return [];
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("popularity", "desc"),
        limit(max)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Recipe),
      }));
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
      return [];
    }
  },

  /**
   * Increases the popularity score of a recipe
   */
  async incrementPopularity(recipeUuid: string): Promise<void> {
    try {
      if (!db || !db.type) return;
      const recipeRef = doc(db, COLLECTION_NAME, recipeUuid);
      await updateDoc(recipeRef, {
        popularity: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing popularity:", error);
    }
  },

  /**
   * Shares a recipe to the global hub
   */
  async shareRecipe(recipe: Recipe, ownerId: string): Promise<void> {
    try {
      if (!db || !db.type) return;
      const recipeRef = doc(db, COLLECTION_NAME, recipe.uuid);
      await setDoc(recipeRef, {
        ...recipe,
        ownerId,
        sharedAt: new Date().toISOString(),
        popularity: (recipe as any).popularity || 0,
      }, { merge: true });
    } catch (error) {
      console.error("Error sharing recipe to hub:", error);
    }
  },
};
