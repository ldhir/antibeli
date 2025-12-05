"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

// Common units for measurement
const UNITS = ["units", "lbs", "oz", "kg", "g", "cups", "tbsp", "tsp", "ml", "L", "bunch", "head", "cloves"];

export default function PantryPage() {
  const {
    pantry,
    addToPantry,
    removeFromPantry,
    updatePantryQuantity,
    updatePantryUnit,
    clearPantry,
    customEssentials,
    addCustomEssential,
    removeCustomEssential,
    getReservedIngredients,
    mealQueue,
  } = useStore();

  // Get reserved ingredients (memoized to prevent re-renders)
  const reservedIngredients = useMemo(() => getReservedIngredients(), [mealQueue]);

  // Helper to check if an item is reserved
  const getReservedMeals = (itemName: string): string[] => {
    const normalized = itemName.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/s$/, "");
    return reservedIngredients.get(normalized) || [];
  };

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState("units");
  const [isEditingEssentials, setIsEditingEssentials] = useState(false);
  const [newEssential, setNewEssential] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addToPantry(newItem.trim(), newQuantity, newUnit);
      setNewItem("");
      setNewQuantity(1);
      setNewUnit("units");
    }
  };

  const handleEssentialClick = (item: string) => {
    if (!isEditingEssentials) {
      // Add essential to pantry with default quantity
      addToPantry(item, 1, "units");
    }
  };

  const handleAddEssential = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEssential.trim()) {
      addCustomEssential(newEssential.trim());
      setNewEssential("");
    }
  };

  const isInPantryList = (item: string) => {
    return pantry.some(
      (p) => p.displayName.toLowerCase() === item.toLowerCase() ||
             p.englishName.toLowerCase() === item.toLowerCase()
    );
  };

  return (
    <main className="min-h-screen relative">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#003314]/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="text-[#003314]">Beli</span> at Home
              </h1>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                My Meals
              </Link>
              <Link
                href="/discover"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                Discover
              </Link>
              <Link
                href="/host"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                Host
              </Link>
              <span
                className="text-[#003314] font-bold"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                Pantry
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#003314]/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#003314]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2
              className="text-4xl font-bold text-[#1a1a1a] mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              My Pantry
            </h2>
            <p className="text-[#666666] text-lg">
              Add items you already have at home. We&apos;ll skip them from your grocery list!
            </p>
          </div>

          {/* Essentials - Quick Add */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h3
                  className="text-lg font-bold text-[#1a1a1a]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Essentials
                </h3>
                {!isEditingEssentials && (
                  <span className="text-sm text-[#666666]" style={{ fontFamily: 'var(--font-accent)' }}>
                    (tap to add)
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditingEssentials(!isEditingEssentials)}
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                  isEditingEssentials
                    ? "bg-amber-500 text-white"
                    : "text-amber-600 hover:bg-amber-50 border border-amber-200"
                }`}
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                {isEditingEssentials ? "Done" : "Customize"}
              </button>
            </div>

            {/* Add new essential input (shown when editing) */}
            {isEditingEssentials && (
              <form onSubmit={handleAddEssential} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newEssential}
                  onChange={(e) => setNewEssential(e.target.value)}
                  placeholder="Add new essential..."
                  className="flex-1 px-4 py-2 text-sm bg-white border-2 border-amber-200 rounded-full focus:border-amber-500 focus:outline-none transition-all"
                  style={{ fontFamily: 'var(--font-accent)' }}
                />
                <button
                  type="submit"
                  disabled={!newEssential.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-accent)' }}
                >
                  Add
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {customEssentials.map((item) => {
                const isAdded = isInPantryList(item);
                return (
                  <button
                    key={item}
                    onClick={() => handleEssentialClick(item)}
                    disabled={isAdded && !isEditingEssentials}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      isEditingEssentials
                        ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-red-100 hover:text-red-600 hover:border-red-300"
                        : isAdded
                        ? "bg-green-100 text-green-600 border border-green-200 cursor-default"
                        : "bg-white hover:bg-amber-500 hover:text-white text-[#666666] border border-amber-200 hover:shadow-lg hover:shadow-amber-500/20"
                    }`}
                    style={{ fontFamily: 'var(--font-accent)' }}
                  >
                    {isEditingEssentials ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomEssential(item);
                        }}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {item}
                      </span>
                    ) : isAdded ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {item}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {isEditingEssentials && (
              <p className="text-xs text-amber-600 mt-3" style={{ fontFamily: 'var(--font-accent)' }}>
                Click an item to remove it from your essentials list
              </p>
            )}
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="mb-8">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add an item (e.g., Chicken, Tomatoes, Bhindi...)"
                className="w-full px-6 py-4 text-lg bg-white border-2 border-[#003314]/20 rounded-2xl focus:border-[#003314] focus:outline-none focus:shadow-lg focus:shadow-[#003314]/10 transition-all duration-300"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white border-2 border-[#003314]/20 rounded-2xl px-4">
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Math.max(0.25, parseFloat(e.target.value) || 1))}
                    min="0.25"
                    step="0.25"
                    className="w-20 py-3 text-lg focus:outline-none"
                    style={{ fontFamily: 'var(--font-accent)' }}
                  />
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="flex-1 py-3 text-lg bg-transparent focus:outline-none cursor-pointer text-[#666666]"
                    style={{ fontFamily: 'var(--font-accent)' }}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!newItem.trim()}
                  style={{ fontFamily: 'var(--font-accent)' }}
                  className="px-8 py-4 bg-[#003314] hover:bg-[#004d1f] text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#003314]/30"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Pantry Items */}
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#003314]/10">
            <div className="flex justify-between items-center mb-6">
              <h3
                className="text-2xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Your Items ({pantry.length})
              </h3>
              {pantry.length > 0 && (
                <button
                  onClick={clearPantry}
                  style={{ fontFamily: 'var(--font-accent)' }}
                  className="text-sm text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            {pantry.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-[#666666]">Your pantry is empty</p>
                <p className="text-sm text-[#999999] mt-1">Add items above or tap an essential to get started</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pantry.map((item) => {
                  const reservedFor = getReservedMeals(item.englishName);
                  const isReserved = reservedFor.length > 0;

                  return (
                  <li
                    key={item.name}
                    className={`flex justify-between items-center py-3 px-4 rounded-xl border transition-all ${
                      isReserved
                        ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                        : "bg-[#FAFAFA] border-[#003314]/5 hover:border-[#003314]/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isReserved ? "bg-amber-100" : "bg-green-100"
                      }`}>
                        {isReserved ? (
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <div>
                        <span className="font-medium text-[#1a1a1a]">{item.displayName}</span>
                        {isReserved && (
                          <div className="text-xs text-amber-600 mt-0.5" style={{ fontFamily: 'var(--font-accent)' }}>
                            Reserved for: {reservedFor.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white rounded-xl border border-[#003314]/20 px-2 py-1">
                        <button
                          onClick={() => updatePantryQuantity(item.name, (item.quantity || 1) - 0.5)}
                          disabled={(item.quantity || 1) <= 0.25}
                          className="w-6 h-6 flex items-center justify-center text-[#003314] hover:bg-[#003314]/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span
                          className="w-10 text-center font-bold text-[#1a1a1a] text-sm"
                          style={{ fontFamily: 'var(--font-accent)' }}
                        >
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updatePantryQuantity(item.name, (item.quantity || 1) + 0.5)}
                          className="w-6 h-6 flex items-center justify-center text-[#003314] hover:bg-[#003314]/10 rounded transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      {/* Unit Selector */}
                      <select
                        value={item.unit || "units"}
                        onChange={(e) => updatePantryUnit(item.name, e.target.value)}
                        className="bg-white border border-[#003314]/20 rounded-lg px-2 py-1 text-sm text-[#666666] cursor-pointer focus:outline-none focus:border-[#003314]"
                        style={{ fontFamily: 'var(--font-accent)' }}
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      {/* Delete Button */}
                      <button
                        onClick={() => removeFromPantry(item.name)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-[#003314]/5 rounded-2xl border border-[#003314]/10">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#003314]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#003314]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: 'var(--font-accent)' }}>
                  How it works
                </h4>
                <p className="text-sm text-[#666666]">
                  When you generate a recipe, items in your pantry will be automatically crossed out from the grocery list and won&apos;t be added to your cart. Adjust quantities as needed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
