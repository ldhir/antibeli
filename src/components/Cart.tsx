"use client";

import { useStore } from "@/lib/store";

export default function Cart() {
  const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, closeCart } = useStore();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#003314]/10">
          <h2
            className="text-2xl font-bold text-[#1a1a1a]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Shopping Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-[#666666] text-lg mb-2">Your cart is empty</p>
              <p className="text-sm text-[#999999]">
                Add items from a recipe to get started
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, index) => (
                <li
                  key={`${item.item}-${index}`}
                  className="flex justify-between items-center py-4 px-4 bg-[#FAFAFA] rounded-xl border border-[#003314]/5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1a1a1a]">{item.item}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[#666666]" style={{ fontFamily: 'var(--font-accent)' }}>
                        {item.qty}
                      </span>
                      {item.recipeSource && (
                        <span className="text-xs text-[#003314] bg-[#003314]/10 px-2 py-0.5 rounded-full">
                          {item.recipeSource}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#1a1a1a]" style={{ fontFamily: 'var(--font-accent)' }}>
                      ${item.cost.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.item)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-[#003314]/10 p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-[#1a1a1a]">Total</span>
              <span
                className="text-2xl font-bold text-[#003314]"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={clearCart}
                style={{ fontFamily: 'var(--font-accent)' }}
                className="w-full py-3 text-red-500 font-bold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-all"
              >
                Clear Cart
              </button>
            </div>

            <p className="text-center text-sm text-[#666666] mt-4">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
