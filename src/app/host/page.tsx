"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

// Mock public events for discovery (in a real app, this would come from a database)
const MOCK_PUBLIC_EVENTS = [
  {
    id: "pub1",
    host: "Sarah M.",
    dish: "Homemade Pad Thai Night",
    date: "Dec 7, 2024",
    time: "7:00 PM",
    location: "Brooklyn, NY",
    spots: 4,
    spotsLeft: 2,
    image: "/thai.jpg",
    costPerPerson: 12,
  },
  {
    id: "pub2",
    host: "Marcus J.",
    dish: "Italian Pasta Party",
    date: "Dec 10, 2024",
    time: "6:30 PM",
    location: "Manhattan, NY",
    spots: 6,
    spotsLeft: 4,
    image: "/pasta.jpg",
    costPerPerson: 15,
  },
  {
    id: "pub3",
    host: "Priya K.",
    dish: "Butter Chicken Feast",
    date: "Dec 12, 2024",
    time: "7:30 PM",
    location: "Queens, NY",
    spots: 8,
    spotsLeft: 5,
    image: "/indian.jpg",
    costPerPerson: 10,
  },
];

type Tab = "my-hosting" | "discover";

export default function HostPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my-hosting");
  const { cart, openCart, hostingEvents, mealQueue, removeHostingEvent } = useStore();

  // Get meals that are marked as hosting
  const hostingMeals = useMemo(() => {
    return mealQueue.filter((meal) => meal.isHosting && !meal.isCooked);
  }, [mealQueue]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#003314]/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="text-[#003314]">Beli</span> at Home
              </h1>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                My Meals
              </Link>
              <Link
                href="/discover"
                className="text-[#666666] hover:text-[#003314] font-medium transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Discover
              </Link>
              <span
                className="text-[#003314] font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Host
              </span>
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
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-bold text-[#1a1a1a] mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-[#003314]">Host</span> a Dinner
            </h2>
            <p className="text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
              Cook for friends or discover community dinners
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("my-hosting")}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === "my-hosting"
                  ? "bg-[#003314] text-white shadow-lg shadow-[#003314]/30"
                  : "bg-white text-[#666666] hover:bg-gray-100 border border-gray-200"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              My Hosting
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === "discover"
                  ? "bg-[#003314] text-white shadow-lg shadow-[#003314]/30"
                  : "bg-white text-[#666666] hover:bg-gray-100 border border-gray-200"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Discover Hosts
            </button>
          </div>

          {/* My Hosting Tab */}
          {activeTab === "my-hosting" && (
            <div>
              {hostingMeals.length === 0 && hostingEvents.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm p-12 border border-[#003314]/10 text-center">
                  <div className="w-20 h-20 bg-[#003314]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#003314]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3
                    className="text-xl font-bold text-[#1a1a1a] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    No events yet
                  </h3>
                  <p className="text-[#666666] mb-6" style={{ fontFamily: "var(--font-accent)" }}>
                    Start hosting by adding a meal and toggling &ldquo;Hosting&rdquo; on
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#003314] hover:bg-[#004d1f] text-white font-bold rounded-full transition-all hover:shadow-lg hover:shadow-[#003314]/30"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Find a Dish to Host
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {hostingMeals.map((meal) => {
                    const event = hostingEvents.find((e) => e.meal.id === meal.id);
                    return (
                      <div
                        key={meal.id}
                        className="bg-white rounded-2xl shadow-sm p-6 border border-[#003314]/10"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#1a1a1a]">{meal.recipe.dish}</h3>
                              <span className="text-xs bg-[#003314]/10 text-[#003314] px-2 py-1 rounded-full">
                                {meal.guestCount} guests
                              </span>
                              {event && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  event.hostingType === "public"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}>
                                  {event.hostingType === "public" ? "Public" : "Private"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
                              {meal.recipe.restaurant} style
                            </p>
                            {event && (
                              <p className="text-sm text-[#999] mt-2">
                                {new Date(event.eventDate).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {event.eventTime && ` at ${event.eventTime}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-4 py-2 bg-[#003314]/10 text-[#003314] hover:bg-[#003314] hover:text-white text-sm font-bold rounded-full transition-all"
                              style={{ fontFamily: "var(--font-accent)" }}
                            >
                              Share Invite
                            </button>
                            {event && (
                              <button
                                onClick={() => removeHostingEvent(event.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {event?.inviteMessage && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Your invite:</p>
                            <p className="text-sm text-gray-700 italic">&ldquo;{event.inviteMessage}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Discover Hosts Tab */}
          {activeTab === "discover" && (
            <div>
              <div className="mb-6">
                <p className="text-sm text-[#666666]" style={{ fontFamily: "var(--font-accent)" }}>
                  Community dinners near you
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {MOCK_PUBLIC_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:border-[#003314]/30 hover:shadow-lg transition-all"
                  >
                    {/* Event Image Placeholder */}
                    <div className="h-32 bg-gradient-to-r from-[#003314]/20 to-[#FF8A94]/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-[#003314]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-[#1a1a1a] mb-1">{event.dish}</h3>
                          <p className="text-sm text-[#666666]">by {event.host}</p>
                        </div>
                        <span className="text-lg font-bold text-[#003314]">
                          ${event.costPerPerson}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#999] mb-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          event.spotsLeft <= 2 ? "text-red-500" : "text-green-600"
                        }`}>
                          {event.spotsLeft} spots left
                        </span>
                        <button
                          className="px-4 py-2 bg-[#003314] hover:bg-[#004d1f] text-white text-sm font-bold rounded-full transition-all hover:shadow-lg hover:shadow-[#003314]/30"
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#666666] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
                  Want to host your own dinner?
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#003314] text-[#003314] hover:text-white font-bold rounded-full border-2 border-[#003314] transition-all"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Start Hosting
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
