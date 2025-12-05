"use client";

import { RecipeResult as RecipeResultType } from "@/lib/types";
import { useStore } from "@/lib/store";

interface RecipeResultProps {
  recipe: RecipeResultType;
  onReset: () => void;
}

export default function RecipeResult({ recipe, onReset }: RecipeResultProps) {
  const { isInPantry, addToCart } = useStore();

  // Calculate what's in pantry vs what needs to be bought
  const groceryWithPantryStatus = recipe.grocery_list.map((item) => ({
    ...item,
    inPantry: isInPantry(item.item),
  }));

  const itemsToBuy = groceryWithPantryStatus.filter((item) => !item.inPantry);
  const itemsInPantry = groceryWithPantryStatus.filter((item) => item.inPantry);
  const actualCost = itemsToBuy.reduce((sum, item) => sum + item.cost, 0);
  const pantrySavings = itemsInPantry.reduce((sum, item) => sum + item.cost, 0);

  const handleAddToCart = () => {
    addToCart(itemsToBuy, recipe.dish);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Savings Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B7A] via-[#FF8A94] to-[#FF6B7A] rounded-3xl p-10 text-white text-center shadow-2xl shadow-[#FF6B7A]/30">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h2
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {recipe.dish}
          </h2>
          <p
            className="text-white/80 mb-8 text-lg"
            style={{ fontFamily: 'var(--font-accent)' }}
          >
            inspired by {recipe.restaurant}
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'var(--font-accent)' }}>Restaurant</p>
              <p className="text-2xl font-bold line-through opacity-60">
                ${recipe.restaurant_price}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'var(--font-accent)' }}>You Pay</p>
              <p className="text-3xl font-bold">${actualCost.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'var(--font-accent)' }}>You Save</p>
              <p className="text-3xl font-bold text-green-200">
                {Math.round(((recipe.restaurant_price - actualCost) / recipe.restaurant_price) * 100)}%
              </p>
            </div>
          </div>

          {pantrySavings > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-200 font-medium" style={{ fontFamily: 'var(--font-accent)' }}>
                ${pantrySavings.toFixed(2)} saved from pantry!
              </span>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-8 text-sm" style={{ fontFamily: 'var(--font-accent)' }}>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.time_mins} mins
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Serves {recipe.servings}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Grocery List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#FF6B7A]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B7A]/10">
          <div className="flex justify-between items-center mb-6">
            <h3
              className="text-2xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Grocery List
            </h3>
            <button
              onClick={handleAddToCart}
              disabled={itemsToBuy.length === 0}
              style={{ fontFamily: 'var(--font-accent)' }}
              className="text-sm text-white bg-[#FF6B7A] hover:bg-[#FF5468] font-bold flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#FF6B7A]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
          </div>

          <ul className="space-y-4">
            {groceryWithPantryStatus.map((item, index) => (
              <li
                key={index}
                className={`flex justify-between items-center py-3 border-b border-[#FF6B7A]/10 last:border-0 ${
                  item.inPantry ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.inPantry && (
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <div>
                    <span className={`font-semibold text-[#1a1a1a] ${item.inPantry ? 'line-through' : ''}`}>
                      {item.item}
                    </span>
                    <span className="text-[#666666] text-sm ml-2" style={{ fontFamily: 'var(--font-accent)' }}>
                      {item.qty}
                    </span>
                    {item.inPantry && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        In pantry
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`font-bold ${item.inPantry ? 'text-green-600' : 'text-[#666666]'}`}
                  style={{ fontFamily: 'var(--font-accent)' }}
                >
                  {item.inPantry ? '$0.00' : `$${item.cost.toFixed(2)}`}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t-2 border-[#FF6B7A]/20">
            {pantrySavings > 0 && (
              <div className="flex justify-between items-center mb-3 text-green-600">
                <span className="font-medium">Pantry savings</span>
                <span className="font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
                  -${pantrySavings.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#1a1a1a] text-lg">You&apos;ll Pay</span>
              <span
                className="font-bold text-[#FF6B7A] text-2xl"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                ${actualCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Recipe Steps */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#FF6B7A]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B7A]/10">
          <h3
            className="text-2xl font-bold text-[#1a1a1a] mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Recipe
          </h3>

          {/* Ingredients */}
          <div className="mb-8">
            <h4
              className="font-bold text-[#666666] mb-4 uppercase text-sm tracking-wider"
              style={{ fontFamily: 'var(--font-accent)' }}
            >
              Ingredients
            </h4>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-[#1a1a1a] flex items-start gap-3">
                  <span className="text-[#FF6B7A] mt-1.5 text-lg">•</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h4
              className="font-bold text-[#666666] mb-4 uppercase text-sm tracking-wider"
              style={{ fontFamily: 'var(--font-accent)' }}
            >
              Instructions
            </h4>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 bg-[#FF6B7A] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-[#FF6B7A]/30"
                    style={{ fontFamily: 'var(--font-accent)' }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[#1a1a1a] pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          style={{ fontFamily: 'var(--font-accent)' }}
          className="px-10 py-4 bg-white hover:bg-[#FF6B7A] text-[#FF6B7A] hover:text-white font-bold rounded-full transition-all duration-300 border-2 border-[#FF6B7A] hover:shadow-xl hover:shadow-[#FF6B7A]/30"
        >
          Try Another Dish
        </button>
      </div>
    </div>
  );
}
