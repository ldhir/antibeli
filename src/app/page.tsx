"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function Home() {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingQuickBites, setIsGeneratingQuickBites] = useState(false);
  const {
    cart,
    openCart,
    mealQueue,
    removeFromQueue,
    markAsCooked,
    leftoverSuggestions,
    setLeftoverSuggestions,
    isInPantry,
    clearQueue,
    pantry,
    quickBiteSuggestions,
    setQuickBiteSuggestions,
  } = useStore();

  // Get uncooked meals
  const upcomingMeals = useMemo(
    () => mealQueue.filter((meal) => !meal.isCooked),
    [mealQueue]
  );
  const cookedMeals = useMemo(
    () => mealQueue.filter((meal) => meal.isCooked),
    [mealQueue]
  );

  // Calculate totals
  const totalSavings = useMemo(() => {
    return upcomingMeals.reduce((sum, meal) => {
      const groceryCost = meal.recipe.grocery_list.reduce((s, item) => s + item.cost, 0);
      return sum + (meal.recipe.restaurant_price - groceryCost);
    }, 0);
  }, [upcomingMeals]);

  const totalGroceryCost = useMemo(() => {
    return upcomingMeals.reduce((sum, meal) => {
      return sum + meal.recipe.grocery_list.reduce((s, item) => {
        return s + (isInPantry(item.item) ? 0 : item.cost);
      }, 0);
    }, 0);
  }, [upcomingMeals, isInPantry]);

  // Generate queue plan when meals change
  useEffect(() => {
    const generatePlan = async () => {
      if (upcomingMeals.length < 1) {
        setLeftoverSuggestions([]);
        return;
      }

      setIsGeneratingPlan(true);
      try {
        const response = await fetch("/api/generate-queue-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meals: upcomingMeals }),
        });

        if (response.ok) {
          const data = await response.json();
          setLeftoverSuggestions(data.leftoverSuggestions || []);
        }
      } catch (err) {
        console.error("Failed to generate queue plan", err);
      } finally {
        setIsGeneratingPlan(false);
      }
    };

    const timeoutId = setTimeout(generatePlan, 500);
    return () => clearTimeout(timeoutId);
  }, [upcomingMeals.length]);

  // Generate quick bite suggestions from pantry
  useEffect(() => {
    const generateQuickBites = async () => {
      // Only generate if pantry has items and no upcoming meals
      if (pantry.length < 2 || upcomingMeals.length > 0) {
        return;
      }

      setIsGeneratingQuickBites(true);
      try {
        const response = await fetch("/api/generate-quick-bites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pantryItems: pantry }),
        });

        if (response.ok) {
          const data = await response.json();
          setQuickBiteSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Failed to generate quick bites", err);
      } finally {
        setIsGeneratingQuickBites(false);
      }
    };

    const timeoutId = setTimeout(generateQuickBites, 1000);
    return () => clearTimeout(timeoutId);
  }, [pantry.length, upcomingMeals.length]);

  // Background style based on whether there are meals
  const bgStyle = upcomingMeals.length === 0
    ? "bg-gradient-to-r from-white via-[#f0f7f1] to-[#e6f2e9]"
    : "bg-gray-50";

  return (
    <main className={`min-h-screen relative ${bgStyle}`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#003314]/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="text-[#003314]">Beli</span> at Home
            </h1>
            <div className="flex items-center gap-6">
              <span
                className="text-[#003314] font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                My Meals
              </span>
              <Link
                href="/discover"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Discover
              </Link>
              <Link
                href="/host"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Host
              </Link>
              <Link
                href="/pantry"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Pantry
              </Link>
              <button
                onClick={openCart}
                className="relative p-2.5 bg-[#003314] hover:bg-[#004d1f] text-white rounded-full transition-all hover:shadow-lg hover:shadow-[#003314]/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#003314] text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {upcomingMeals.length === 0 ? (
            // Hero Empty State
            <div className="text-center py-12">
              <div className="badge mb-8">Save up to 80% on your favorite meals</div>
              <h2
                className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="text-[#003314]">Champagne</span> taste
                <br />on a beer budget
              </h2>
              <p className="text-xl text-[#666666] max-w-lg mx-auto mb-12">
                Enter any restaurant dish and get the recipe + grocery list with savings
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-10 py-5 bg-[#003314] hover:bg-[#004d1f] text-white text-lg font-bold rounded-full transition-all hover:shadow-xl hover:shadow-[#003314]/30"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Dishes to Cook
              </Link>

              {/* Example Dishes */}
              <div className="mt-16">
                <p className="text-sm text-[#666666] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
                  Popular dishes to try:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "Spicy Rigatoni at Carbone",
                    "Pad Thai",
                    "Chicken Tikka Masala",
                    "Cacio e Pepe",
                    "Birria Tacos",
                  ].map((dish) => (
                    <Link
                      key={dish}
                      href={`/discover?dish=${encodeURIComponent(dish)}`}
                      className="px-5 py-2.5 bg-white hover:bg-[#003314] hover:text-white text-[#666666] text-sm rounded-full border border-[#003314]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#003314]/20"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {dish}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Bites from Pantry */}
              {(quickBiteSuggestions.length > 0 || isGeneratingQuickBites) && pantry.length >= 2 && (
                <div className="mt-16 bg-white rounded-3xl shadow-sm p-8 border border-[#003314]/10 text-left">
                  <h3
                    className="text-xl font-bold text-[#1a1a1a] mb-2 flex items-center gap-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Quick Bites from Your Pantry
                  </h3>
                  <p className="text-sm text-[#666666] mb-6" style={{ fontFamily: "var(--font-accent)" }}>
                    Ideas based on what you have at home
                  </p>

                  {isGeneratingQuickBites ? (
                    <div className="text-center py-8 text-[#666666]">
                      <span className="animate-pulse">Finding quick meal ideas...</span>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {quickBiteSuggestions.map((suggestion, index) => (
                        <Link
                          key={index}
                          href={`/discover?dish=${encodeURIComponent(suggestion.name)}`}
                          className="rounded-xl p-4 border border-gray-100 bg-gray-50 hover:border-[#003314]/30 hover:shadow-md cursor-pointer transition-all block"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-[#1a1a1a]">{suggestion.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              suggestion.difficulty === "Easy"
                                ? "bg-green-100 text-green-600"
                                : suggestion.difficulty === "Medium"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {suggestion.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-[#666666] mb-3">{suggestion.description}</p>
                          <div className="flex items-center justify-between text-xs text-[#999]">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {suggestion.timeMinutes} min
                            </span>
                            <span>{suggestion.ingredients.slice(0, 3).join(", ")}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Stats Header */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#003314]/10">
                  <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: "var(--font-accent)" }}>
                    Meals Planned
                  </p>
                  <p className="text-3xl font-bold text-[#1a1a1a]">{upcomingMeals.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#003314]/10">
                  <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: "var(--font-accent)" }}>
                    Grocery Cost
                  </p>
                  <p className="text-3xl font-bold text-[#003314]">${totalGroceryCost.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200 bg-green-50">
                  <p className="text-sm text-green-700 mb-1" style={{ fontFamily: "var(--font-accent)" }}>
                    Total Savings
                  </p>
                  <p className="text-3xl font-bold text-green-600">${totalSavings.toFixed(2)}</p>
                </div>
              </div>

              {/* Upcoming Meals */}
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#003314]/10 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-2xl font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Upcoming Meals
                  </h2>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/discover"
                      className="text-sm text-[#003314] hover:text-[#004d1f] font-medium flex items-center gap-1"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add More
                    </Link>
                    {upcomingMeals.length > 0 && (
                      <button
                        onClick={() => clearQueue()}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                        style={{ fontFamily: "var(--font-accent)" }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {upcomingMeals.map((meal) => {
                    const inPantryCount = meal.recipe.grocery_list.filter((item) =>
                      isInPantry(item.item)
                    ).length;
                    const totalIngredients = meal.recipe.grocery_list.length;
                    const ingredientStatus =
                      inPantryCount === totalIngredients
                        ? "ready"
                        : inPantryCount > 0
                        ? "partial"
                        : "missing";

                    const mealCost = meal.recipe.grocery_list.reduce(
                      (sum, item) => sum + (isInPantry(item.item) ? 0 : item.cost),
                      0
                    );

                    return (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#003314]/20 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-[#1a1a1a] text-lg">{meal.recipe.dish}</h3>
                            {meal.isHosting && (
                              <span className="text-xs bg-[#003314]/10 text-[#003314] px-2 py-1 rounded-full">
                                Hosting {meal.guestCount}
                              </span>
                            )}
                            <span className="text-sm text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
                              ${mealCost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#666666]">
                            <span style={{ fontFamily: "var(--font-accent)" }}>
                              {meal.servings} {meal.servings === 1 ? "serving" : "servings"}
                            </span>
                            <span>|</span>
                            <span style={{ fontFamily: "var(--font-accent)" }}>
                              {meal.recipe.time_mins} mins
                            </span>
                            <span>|</span>
                            <span
                              className={`flex items-center gap-1 ${
                                ingredientStatus === "ready"
                                  ? "text-green-600"
                                  : ingredientStatus === "partial"
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                              style={{ fontFamily: "var(--font-accent)" }}
                            >
                              {ingredientStatus === "ready" ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Ready to cook
                                </>
                              ) : (
                                <>{inPantryCount}/{totalIngredients} ingredients</>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markAsCooked(meal.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-full transition-all"
                            style={{ fontFamily: "var(--font-accent)" }}
                          >
                            Cooked!
                          </button>
                          <button
                            onClick={() => removeFromQueue(meal.id)}
                            className="p-2 text-[#999] hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leftover Suggestions */}
              {leftoverSuggestions.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#003314]/10">
                  <h3
                    className="text-xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <span className="text-2xl">💡</span> Use It Up
                    <span className="text-sm font-normal text-[#666666] ml-2">
                      Quick meals from your leftovers
                    </span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leftoverSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 border ${
                          suggestion.urgency === "high"
                            ? "border-red-200 bg-red-50"
                            : suggestion.urgency === "medium"
                            ? "border-amber-200 bg-amber-50"
                            : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-[#1a1a1a]">{suggestion.name}</h4>
                          {suggestion.urgency === "high" && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Make soon!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#666666] mb-2">{suggestion.description}</p>
                        <div className="flex items-center justify-between text-xs text-[#999]">
                          <span>{suggestion.ingredients.slice(0, 3).join(", ")}</span>
                          <span>{suggestion.timeMinutes} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isGeneratingPlan && (
                <div className="mt-4 text-center text-sm text-[#666666]">
                  <span className="animate-pulse">Generating meal suggestions...</span>
                </div>
              )}
            </>
          )}

          {/* Cooked Meals History */}
          {cookedMeals.length > 0 && (
            <div className="mt-8 bg-white/50 rounded-3xl p-6 border border-gray-100">
              <h3
                className="text-lg font-bold text-[#666666] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Recently Cooked
              </h3>
              <div className="flex flex-wrap gap-2">
                {cookedMeals.slice(0, 5).map((meal) => (
                  <span
                    key={meal.id}
                    className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {meal.recipe.dish}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
