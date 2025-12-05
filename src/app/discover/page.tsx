"use client";

import { useState } from "react";
import Link from "next/link";
import DishInput from "@/components/DishInput";
import RecipeResult from "@/components/RecipeResult";
import { RecipeResult as RecipeResultType, DishInput as DishInputType } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function DiscoverPage() {
  const [recipe, setRecipe] = useState<RecipeResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart, openCart, mealQueue } = useStore();

  const handleSubmit = async (input: DishInputType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate recipe");
      }

      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecipe(null);
    setError(null);
  };

  return (
    <main className="min-h-screen relative">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#FF6B7A]/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="text-[#FF6B7A]">Beli</span> at Home
              </h1>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-[#666666] hover:text-[#FF6B7A] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                My Meals
              </Link>
              <span
                className="text-[#FF6B7A] font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Discover
              </span>
              <Link
                href="/host"
                className="text-[#666666] hover:text-[#FF6B7A] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Host
              </Link>
              <Link
                href="/pantry"
                className="text-[#666666] hover:text-[#FF6B7A] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Pantry
              </Link>
              <button
                onClick={openCart}
                className="relative p-2.5 bg-[#FF6B7A] hover:bg-[#FF5468] text-white rounded-full transition-all hover:shadow-lg hover:shadow-[#FF6B7A]/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#FF6B7A] text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-12">
        {!recipe ? (
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
              <div className="badge mb-8">Save up to 80% on your favorite meals</div>
              <h2
                className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Cook your <span className="text-[#FF6B7A]">favorite dishes</span>
                <br />at home for less
              </h2>
              <p className="text-xl text-[#666666] max-w-lg mx-auto">
                Enter any restaurant dish and get the recipe + grocery list with savings
              </p>
            </div>

            {/* Input Component */}
            <DishInput onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Example Dishes */}
            <div className="mt-16 text-center">
              <p className="text-sm text-[#666666] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
                Try these popular dishes:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Spicy Rigatoni at Carbone",
                  "Pad Thai",
                  "Chicken Tikka Masala",
                  "Cacio e Pepe",
                  "Birria Tacos",
                ].map((dish) => (
                  <button
                    key={dish}
                    onClick={() => handleSubmit({ type: "text", text: dish })}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-white hover:bg-[#FF6B7A] hover:text-white text-[#666666] text-sm rounded-full border border-[#FF6B7A]/20 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-[#FF6B7A]/20"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {dish}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Queue Status */}
            {mealQueue.filter(m => !m.isCooked).length > 0 && (
              <div className="mt-12 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-[#FF6B7A] hover:text-[#FF5468] font-medium"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  You have {mealQueue.filter(m => !m.isCooked).length} meals planned
                </Link>
              </div>
            )}
          </div>
        ) : (
          <RecipeResult recipe={recipe} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
