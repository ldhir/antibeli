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
