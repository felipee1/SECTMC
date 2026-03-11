import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { recipeHubService } from './recipeHubService';

const STORAGE_KEY = 'cozinha4x1';
const CLOUD_KEY = 'cozinha4x1_cloud';

export interface StorageData {
  inventory: any[];
  history: Record<string, any>;
  settings: any;
  recipes?: any[];
  ingredients?: any[];
}

// Local Storage Functions
export const loadFromLocalStorage = (): StorageData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error loading from local storage:', error);
  }
  return null;
};

export const saveToLocalStorage = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

// Cloud Storage Functions
export const saveToCloud = async (userId: string, data: StorageData): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...data,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving to cloud:', error);
    throw error;
  }
};

export const loadFromCloud = async (userId: string): Promise<StorageData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove Firebase metadata
      const { lastUpdated, ...storageData } = data;
      return storageData as StorageData;
    }
  } catch (error) {
    console.error('Error loading from cloud:', error);
  }
  return null;
};

// Merge two data objects, avoiding duplicates
const mergeStorageData = (local: StorageData, cloud: StorageData): StorageData => {
  // Merge inventory - use a Map to avoid duplicates by ID
  const inventoryMap = new Map();
  
  // Add cloud items first (they are the source of truth)
  cloud.inventory?.forEach((item: any) => {
    if (item.id) {
      inventoryMap.set(item.id, item);
    }
  });
  
  // Add local items that don't exist in cloud
  local.inventory?.forEach((item: any) => {
    if (item.id && !inventoryMap.has(item.id)) {
      inventoryMap.set(item.id, item);
    }
  });
  
  // Merge history - combine both, cloud takes precedence
  const mergedHistory = {
    ...local.history,
    ...cloud.history,
  };
  
  // Merge recipes - avoid duplicates by ID
  const recipesMap = new Map();
  cloud.recipes?.forEach((recipe: any) => {
    if (recipe.id) {
      recipesMap.set(recipe.id, recipe);
    }
  });
  local.recipes?.forEach((recipe: any) => {
    if (recipe.id && !recipesMap.has(recipe.id)) {
      recipesMap.set(recipe.id, recipe);
    }
  });
  
  // Merge ingredients - avoid duplicates by ID
  const ingredientsMap = new Map();
  cloud.ingredients?.forEach((ingredient: any) => {
    if (ingredient.id) {
      ingredientsMap.set(ingredient.id, ingredient);
    }
  });
  local.ingredients?.forEach((ingredient: any) => {
    if (ingredient.id && !ingredientsMap.has(ingredient.id)) {
      ingredientsMap.set(ingredient.id, ingredient);
    }
  });
  
  return {
    inventory: Array.from(inventoryMap.values()),
    history: mergedHistory,
    settings: cloud.settings || local.settings,
    recipes: Array.from(recipesMap.values()),
    ingredients: Array.from(ingredientsMap.values()),
  };
};

// Smart sync: merge local and cloud data, then save to both
export const syncLocalToCloud = async (userId: string): Promise<void> => {
  try {
    const localData = loadFromLocalStorage();
    const cloudData = await loadFromCloud(userId);
    
    if (localData && cloudData) {
      // Both exist - merge them
      const mergedData = mergeStorageData(localData, cloudData);
      await saveToCloud(userId, mergedData);
      saveToLocalStorage(mergedData);
      
      // Share recipes to global hub
      if (mergedData.recipes && mergedData.recipes.length > 0) {
        mergedData.recipes.forEach(r => recipeHubService.shareRecipe(r, userId));
      }

      toast({
        title: 'Sync Complete',
        description: 'Your data has been synced successfully.',
      });
    } else if (localData && !cloudData) {
      // Only local exists - upload to cloud
      await saveToCloud(userId, localData);
      
      // Share recipes to global hub
      if (localData.recipes && localData.recipes.length > 0) {
        localData.recipes.forEach(r => recipeHubService.shareRecipe(r, userId));
      }

      toast({
        title: 'Sync Complete',
        description: 'Your local data has been uploaded to the cloud.',
      });
    } else if (!localData && cloudData) {
      // Only cloud exists - download to local
      saveToLocalStorage(cloudData);
      toast({
        title: 'Sync Complete',
        description: 'Your cloud data has been downloaded.',
      });
    }
  } catch (error) {
    console.error('Error syncing local to cloud:', error);
    toast({
      title: 'Sync Error',
      description: 'Failed to sync your data to the cloud.',
      variant: 'destructive',
    });
  }
};

// Load cloud data and merge with local
export const syncCloudToLocal = async (userId: string): Promise<void> => {
  try {
    const cloudData = await loadFromCloud(userId);
    const localData = loadFromLocalStorage();
    
    if (cloudData && localData) {
      // Merge cloud data with local
      const mergedData = mergeStorageData(localData, cloudData);
      saveToLocalStorage(mergedData);
      toast({
        title: 'Data Loaded',
        description: 'Your cloud data has been merged with local data.',
      });
    } else if (cloudData) {
      // Only cloud data exists
      saveToLocalStorage(cloudData);
      toast({
        title: 'Data Loaded',
        description: 'Your cloud data has been loaded.',
      });
    }
  } catch (error) {
    console.error('Error syncing cloud to local:', error);
  }
};

// Real-time sync listener
export const subscribeToCloudChanges = (
  userId: string,
  callback: (data: StorageData) => void
) => {
  const userDocRef = doc(db, 'users', userId);
  
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const { lastUpdated, ...storageData } = data;
      callback(storageData as StorageData);
    }
  }, (error) => {
    console.error('Error in cloud sync listener:', error);
  });
};

// Check if cloud sync is enabled
export const isCloudSyncEnabled = (): boolean => {
  try {
    return localStorage.getItem(CLOUD_KEY) === 'true';
  } catch {
    return false;
  }
};

// Set cloud sync preference
export const setCloudSyncEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(CLOUD_KEY, String(enabled));
  } catch (error) {
    console.error('Error setting cloud sync preference:', error);
  }
};

// Save user info to local storage
export const saveUserToLocalStorage = (user: any): void => {
  try {
    localStorage.setItem(CLOUD_KEY + '_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to local storage:', error);
  }
};

// Load user info from local storage
export const loadUserFromLocalStorage = (): any | null => {
  try {
    const raw = localStorage.getItem(CLOUD_KEY + '_user');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error loading user from local storage:', error);
  }
  return null;
};

// Remove user info from local storage
export const removeUserFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(CLOUD_KEY + '_user');
  } catch (error) {
    console.error('Error removing user from local storage:', error);
  }
};


