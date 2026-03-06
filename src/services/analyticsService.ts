import { analytics } from '@/lib/firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

// Custom event types for type safety
export type AnalyticsEvent = 
  | 'login'
  | 'signup'
  | 'logout'
  | 'cloud_sync_enabled'
  | 'cloud_sync_disabled'
  | 'data_synced'
  | 'settings_saved'
  | 'item_added'
  | 'item_removed'
  | 'recipe_created'
  | 'recipe_viewed'
  | 'shopping_list_created';

interface EventParams {
  [key: string]: string | number | boolean;
}

/**
 * Log an analytics event
 * @param eventName - Name of the event
 * @param params - Optional parameters for the event
 */
export const logEvent = (eventName: AnalyticsEvent, params?: EventParams): void => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    firebaseLogEvent(analytics, eventName as string, params);
    console.log(`Analytics event logged: ${eventName}`, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

/**
 * Log user login event
 */
export const logLogin = (method: 'email' | 'google' = 'email'): void => {
  logEvent('login', { method });
};

/**
 * Log user signup event
 */
export const logSignup = (method: 'email' | 'google' = 'email'): void => {
  logEvent('signup', { method });
};

/**
 * Log user logout event
 */
export const logLogout = (): void => {
  logEvent('logout');
};

/**
 * Log cloud sync toggle
 */
export const logCloudSyncToggle = (enabled: boolean): void => {
  logEvent(enabled ? 'cloud_sync_enabled' : 'cloud_sync_disabled');
};

/**
 * Log data sync event
 */
export const logDataSync = (direction: 'upload' | 'download' | 'merge', itemCount?: number): void => {
  logEvent('data_synced', { 
    direction,
    ...(itemCount !== undefined && { item_count: itemCount })
  });
};

/**
 * Log settings saved event
 */
export const logSettingsSaved = (): void => {
  logEvent('settings_saved');
};

/**
 * Log item added to inventory
 */
export const logItemAdded = (category?: string): void => {
  logEvent('item_added', {
    ...(category && { category })
  });
};

/**
 * Log item removed from inventory
 */
export const logItemRemoved = (category?: string): void => {
  logEvent('item_removed', {
    ...(category && { category })
  });
};

/**
 * Log recipe created
 */
export const logRecipeCreated = (): void => {
  logEvent('recipe_created');
};

/**
 * Log recipe viewed
 */
export const logRecipeViewed = (recipeId: string): void => {
  logEvent('recipe_viewed', { recipe_id: recipeId });
};

/**
 * Log shopping list created
 */
export const logShoppingListCreated = (itemCount: number): void => {
  logEvent('shopping_list_created', { item_count: itemCount });
};


