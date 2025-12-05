// Types for Beli at Home

export interface GroceryItem {
  item: string;
  qty: string;
  cost: number;
}

export interface RecipeResult {
  dish: string;
  restaurant: string;
  restaurant_price: number;
  home_price: number;
  savings: number;
  savings_percent: number;
  time_mins: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  ingredients: string[];
  steps: string[];
  grocery_list: GroceryItem[];
}

export interface DishInput {
  type: "text" | "image";
  text?: string;
  imageBase64?: string;
}

// Extended grocery item with freshness data
export interface GroceryItemWithFreshness extends GroceryItem {
  daysUntilSpoil?: number; // how many days until this ingredient goes bad
  isPerishable: boolean;
}

// A meal in the queue
export interface QueuedMeal {
  id: string;
  recipe: RecipeResult;
  servings: number; // how many servings to make
  isHosting: boolean; // cooking for guests?
  guestCount: number; // if hosting, how many guests
  isCooked: boolean; // has this been made?
  dateAdded: string; // ISO date string
  suggestedOrder?: number; // AI-suggested cooking order based on freshness
}

// Leftover suggestion - quick meal from unused ingredients
export interface LeftoverSuggestion {
  name: string;
  description: string;
  ingredients: string[]; // which leftover ingredients it uses
  urgency: "low" | "medium" | "high"; // how soon to make it (based on ingredient freshness)
  timeMinutes: number;
}

// Consolidated grocery list for the queue
export interface ConsolidatedGroceryList {
  items: GroceryItemWithFreshness[];
  totalCost: number;
  totalRestaurantCost: number; // what you'd pay eating out for all queued meals
  totalSavings: number;
}

// Hosting types
export type HostingType = "private" | "public";

export interface HostingEvent {
  id: string;
  meal: QueuedMeal;
  hostingType: HostingType;
  inviteMessage?: string; // for private hosting
  eventDate: string; // ISO date string
  eventTime?: string; // e.g., "7:00 PM"
  lumaUrl?: string; // for public hosting
  guestList?: string[]; // email or names
  createdAt: string;
  isActive: boolean;
}

// Quick bite suggestion from pantry
export interface QuickBiteSuggestion {
  name: string;
  description: string;
  ingredients: string[]; // which pantry ingredients it uses
  timeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
}
