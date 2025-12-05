"use client";

import { useState } from "react";
import { RecipeResult as RecipeResultType, HostingType } from "@/lib/types";
import { useStore } from "@/lib/store";

interface RecipeResultProps {
  recipe: RecipeResultType;
  onReset: () => void;
}

export default function RecipeResult({ recipe, onReset }: RecipeResultProps) {
  const { isInPantry, addToCart, addToQueue, mealQueue, createHostingEvent } = useStore();
  const [servings, setServings] = useState(recipe.servings);
  const [isHosting, setIsHosting] = useState(false);
  const [hostingType, setHostingType] = useState<HostingType>("private");
  const [guestCount, setGuestCount] = useState(2);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("7:00 PM");
  const [showHostingDetails, setShowHostingDetails] = useState(false);

  // Check if already in queue
  const isAlreadyQueued = mealQueue.some(
    (meal) => meal.recipe.dish === recipe.dish && !meal.isCooked
  );

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

  const handleAddToQueue = () => {
    addToQueue(recipe, servings, isHosting, isHosting ? guestCount : 0);
    setAddedToQueue(true);
    setTimeout(() => setAddedToQueue(false), 2000);
  };

  const handleHostingToggle = () => {
    if (!isHosting) {
      setIsHosting(true);
      setShowHostingDetails(true);
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEventDate(tomorrow.toISOString().split("T")[0]);
      // Generate default invite message
      setInviteMessage(`You're invited to ${recipe.dish} night at my place! Come hungry.`);
    } else {
      setIsHosting(false);
      setShowHostingDetails(false);
    }
  };

  const generateLumaLink = () => {
    // In a real app, this would integrate with Luma API
    // For now, we'll create a mock link
    const eventTitle = encodeURIComponent(`${recipe.dish} Dinner Party`);
    const eventDesc = encodeURIComponent(`Join us for a homemade ${recipe.dish} dinner! Save money, eat well, and have fun together.`);
    return `https://lu.ma/create?title=${eventTitle}&description=${eventDesc}`;
  };

  // Calculate cost per serving
  const costPerServing = actualCost / recipe.servings;
  const adjustedCost = costPerServing * servings;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Savings Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003314] via-[#00441a] to-[#003314] rounded-3xl p-10 text-white text-center shadow-2xl shadow-[#003314]/30">
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

      {/* Add to Queue Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#003314]/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Cost per meal info */}
          <div>
            <h3
              className="text-xl font-bold text-[#1a1a1a] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Add to Your Meal Queue
            </h3>
            <p className="text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
              <span className="text-[#003314] font-bold text-2xl">${costPerServing.toFixed(2)}</span>
              <span className="text-sm"> per meal</span>
              <span className="mx-2 text-[#ccc]">|</span>
              <span className="text-sm">
                {servings} {servings === 1 ? "meal" : "meals"} = ${adjustedCost.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Servings control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
                Servings:
              </span>
              <div className="flex items-center bg-gray-100 rounded-full">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#003314] transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-[#1a1a1a]">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#003314] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hosting toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleHostingToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  isHosting
                    ? "bg-[#003314] text-white"
                    : "bg-gray-100 text-[#666666] hover:bg-gray-200"
                }`}
                style={{ fontFamily: "var(--font-accent)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Hosting?
              </button>
              {isHosting && (
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#003314] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-[#1a1a1a]">{guestCount}</span>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#003314] transition-colors"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Add to Queue button */}
            <button
              onClick={handleAddToQueue}
              disabled={isAlreadyQueued || addedToQueue}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                addedToQueue
                  ? "bg-green-500 text-white"
                  : isAlreadyQueued
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#003314] hover:bg-[#004d1f] text-white hover:shadow-lg hover:shadow-[#003314]/30"
              }`}
            >
              {addedToQueue ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : isAlreadyQueued ? (
                "Already Queued"
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Queue
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hosting Details Panel */}
        {showHostingDetails && isHosting && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-[#1a1a1a] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Hosting Details
            </h4>

            {/* Private vs Public Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setHostingType("private")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  hostingType === "private"
                    ? "border-[#003314] bg-[#003314]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${hostingType === "private" ? "text-[#003314]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className={`font-bold ${hostingType === "private" ? "text-[#003314]" : "text-gray-600"}`} style={{ fontFamily: "var(--font-accent)" }}>
                    Private
                  </span>
                </div>
                <p className="text-xs text-gray-500">Invite friends directly</p>
              </button>
              <button
                onClick={() => setHostingType("public")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  hostingType === "public"
                    ? "border-[#003314] bg-[#003314]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${hostingType === "public" ? "text-[#003314]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className={`font-bold ${hostingType === "public" ? "text-[#003314]" : "text-gray-600"}`} style={{ fontFamily: "var(--font-accent)" }}>
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500">Create Luma event</p>
              </button>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#003314] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                  Time
                </label>
                <select
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#003314] focus:outline-none"
                >
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>
              </div>
            </div>

            {/* Private - Invite Message */}
            {hostingType === "private" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                  Invite Message
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003314] focus:outline-none resize-none"
                  placeholder="Write a nice invite for your friends..."
                />
                <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{inviteMessage}&rdquo;</p>
                </div>
              </div>
            )}

            {/* Public - Luma Integration */}
            {hostingType === "public" && (
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800" style={{ fontFamily: "var(--font-accent)" }}>Luma Event</p>
                      <p className="text-xs text-gray-500">Create a public event page</p>
                    </div>
                  </div>
                  <a
                    href={generateLumaLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Create Luma Event
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  A Luma event page will be created where people can RSVP. Share the link on social media!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Grocery List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#003314]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-[#003314]/10">
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
              className="text-sm text-white bg-[#003314] hover:bg-[#004d1f] font-bold flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#003314]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className={`flex justify-between items-center py-3 border-b border-[#003314]/10 last:border-0 ${
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

          <div className="mt-6 pt-6 border-t-2 border-[#003314]/20">
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
                className="font-bold text-[#003314] text-2xl"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                ${actualCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Recipe Steps */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#003314]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-[#003314]/10">
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
                  <span className="text-[#003314] mt-1.5 text-lg">•</span>
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
                    className="flex-shrink-0 w-8 h-8 bg-[#003314] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-[#003314]/30"
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
          className="px-10 py-4 bg-white hover:bg-[#003314] text-[#003314] hover:text-white font-bold rounded-full transition-all duration-300 border-2 border-[#003314] hover:shadow-xl hover:shadow-[#003314]/30"
        >
          Try Another Dish
        </button>
      </div>
    </div>
  );
}
