"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GroceryItem } from "./types";
import { processIngredient } from "./ingredients";

// Pantry item - what user has at home
interface PantryItem {
  name: string; // normalized lowercase for matching
  displayName: string; // display name (may include translation)
  englishName: string; // english name for matching
  quantity: number; // quantity value (default 1)
  unit: string; // unit of measurement (e.g., "lbs", "oz", "cups")
}

// Cart item - grocery item to buy
interface CartItem extends GroceryItem {
  recipeSource?: string; // which dish it came from
}

interface StoreContextType {
  // Pantry
  pantry: PantryItem[];
  addToPantry: (item: string, quantity?: number, unit?: string) => void;
  removeFromPantry: (name: string) => void;
  updatePantryQuantity: (name: string, quantity: number) => void;
  updatePantryUnit: (name: string, unit: string) => void;
  isInPantry: (itemName: string) => boolean;
  clearPantry: () => void;

  // Custom Essentials (quick-add buttons)
  customEssentials: string[];
  addCustomEssential: (item: string) => void;
  removeCustomEssential: (item: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (items: GroceryItem[], recipeSource?: string) => void;
  removeFromCart: (itemName: string) => void;
  clearCart: () => void;
  cartTotal: number;

  // Cart UI
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to normalize item names for matching
const normalizeItemName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove special chars
    .replace(/s$/, ""); // remove trailing 's' for plurals
};

// Check if pantry item matches grocery item
const itemMatches = (pantryItem: string, groceryItem: string): boolean => {
  const normalizedPantry = normalizeItemName(pantryItem);
  const normalizedGrocery = normalizeItemName(groceryItem);

  // Direct match
  if (normalizedPantry === normalizedGrocery) return true;

  // Partial match (pantry item is contained in grocery item or vice versa)
  if (normalizedGrocery.includes(normalizedPantry) || normalizedPantry.includes(normalizedGrocery)) {
    return true;
  }

  return false;
};

// Default essentials list
const DEFAULT_ESSENTIALS = [
  "Salt",
  "Pepper",
  "Olive Oil",
  "Vegetable Oil",
  "Butter",
  "Sugar",
  "Flour",
  "Garlic",
  "Onion",
  "Eggs",
  "Milk",
  "Rice",
  "Soy Sauce",
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [customEssentials, setCustomEssentials] = useState<string[]>(DEFAULT_ESSENTIALS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPantry = localStorage.getItem("beli-pantry");
    const savedEssentials = localStorage.getItem("beli-custom-essentials");
    const savedCart = localStorage.getItem("beli-cart");

    if (savedPantry) {
      try {
        setPantry(JSON.parse(savedPantry));
      } catch (e) {
        console.error("Failed to parse pantry", e);
      }
    }

    if (savedEssentials) {
      try {
        setCustomEssentials(JSON.parse(savedEssentials));
      } catch (e) {
        console.error("Failed to parse essentials", e);
      }
    }

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save pantry to localStorage
  useEffect(() => {
    localStorage.setItem("beli-pantry", JSON.stringify(pantry));
  }, [pantry]);

  // Save custom essentials to localStorage
  useEffect(() => {
    localStorage.setItem("beli-custom-essentials", JSON.stringify(customEssentials));
  }, [customEssentials]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("beli-cart", JSON.stringify(cart));
  }, [cart]);

  const addToPantry = (item: string, quantity: number = 1, unit: string = "units") => {
    const trimmed = item.trim();
    if (!trimmed) return;

    // Process ingredient for translation and autocorrection
    const processed = processIngredient(trimmed);
    const normalized = normalizeItemName(processed.englishName);

    const exists = pantry.some((p) => normalizeItemName(p.englishName) === normalized);

    if (!exists) {
      setPantry((prev) => [...prev, {
        name: normalized,
        displayName: processed.displayName,
        englishName: processed.englishName,
        quantity,
        unit,
      }]);
    }
  };

  const removeFromPantry = (name: string) => {
    setPantry((prev) => prev.filter((p) => p.name !== name));
  };

  const updatePantryQuantity = (name: string, quantity: number) => {
    if (quantity < 0.25) return; // Allow fractional quantities like 0.5
    setPantry((prev) =>
      prev.map((p) => p.name === name ? { ...p, quantity } : p)
    );
  };

  const updatePantryUnit = (name: string, unit: string) => {
    setPantry((prev) =>
      prev.map((p) => p.name === name ? { ...p, unit } : p)
    );
  };

  const isInPantry = (itemName: string): boolean => {
    return pantry.some((p) =>
      itemMatches(p.name, itemName) || itemMatches(p.englishName, itemName)
    );
  };

  const clearPantry = () => {
    setPantry([]);
  };

  // Custom essentials management
  const addCustomEssential = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;

    // Process for proper capitalization
    const processed = processIngredient(trimmed);
    const displayName = processed.displayName;

    // Check if already exists (case insensitive)
    const exists = customEssentials.some(
      (e) => e.toLowerCase() === displayName.toLowerCase()
    );

    if (!exists) {
      setCustomEssentials((prev) => [...prev, displayName]);
    }
  };

  const removeCustomEssential = (item: string) => {
    setCustomEssentials((prev) => prev.filter((e) => e !== item));
  };

  const addToCart = (items: GroceryItem[], recipeSource?: string) => {
    const newItems: CartItem[] = items
      .filter((item) => !isInPantry(item.item)) // Don't add items already in pantry
      .map((item) => ({
        ...item,
        recipeSource,
      }));

    setCart((prev) => {
      // Merge with existing cart, avoiding duplicates
      const merged = [...prev];
      for (const newItem of newItems) {
        const existingIndex = merged.findIndex(
          (m) => normalizeItemName(m.item) === normalizeItemName(newItem.item)
        );
        if (existingIndex === -1) {
          merged.push(newItem);
        }
        // If already exists, keep existing (don't duplicate)
      }
      return merged;
    });

    // Open cart after adding
    setIsCartOpen(true);
  };

  const removeFromCart = (itemName: string) => {
    setCart((prev) => prev.filter((item) => item.item !== itemName));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.cost, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <StoreContext.Provider
      value={{
        pantry,
        addToPantry,
        removeFromPantry,
        updatePantryQuantity,
        updatePantryUnit,
        isInPantry,
        clearPantry,
        customEssentials,
        addCustomEssential,
        removeCustomEssential,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
