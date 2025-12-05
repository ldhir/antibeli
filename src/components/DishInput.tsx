"use client";

import { useState, useRef } from "react";

interface DishInputProps {
  onSubmit: (input: { type: "text" | "image"; text?: string; imageBase64?: string }) => void;
  isLoading: boolean;
}

export default function DishInput({ onSubmit, isLoading }: DishInputProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({ type: "text", text: text.trim() });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = () => {
    if (imagePreview) {
      onSubmit({ type: "image", imageBase64: imagePreview });
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex gap-3 mb-8 justify-center">
        <button
          onClick={() => setInputMode("text")}
          style={{ fontFamily: 'var(--font-accent)' }}
          className={`px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${
            inputMode === "text"
              ? "bg-[#003314] text-white shadow-lg shadow-[#003314]/30"
              : "bg-white text-[#666666] border border-[#003314]/20 hover:border-[#003314]/50"
          }`}
        >
          Type a Dish
        </button>
        <button
          onClick={() => setInputMode("image")}
          style={{ fontFamily: 'var(--font-accent)' }}
          className={`px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${
            inputMode === "image"
              ? "bg-[#003314] text-white shadow-lg shadow-[#003314]/30"
              : "bg-white text-[#666666] border border-[#003314]/20 hover:border-[#003314]/50"
          }`}
        >
          Upload Photo
        </button>
      </div>

      {/* Text Input Mode */}
      {inputMode === "text" && (
        <form onSubmit={handleTextSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g. "Spicy Rigatoni at Carbone" or "Pad Thai"'
              className="w-full px-6 py-5 text-lg bg-white border-2 border-[#003314]/20 rounded-2xl focus:border-[#003314] focus:outline-none focus:shadow-lg focus:shadow-[#003314]/10 transition-all duration-300"
              style={{ fontFamily: 'var(--font-body)' }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            style={{ fontFamily: 'var(--font-accent)' }}
            className="w-full py-5 bg-[#003314] hover:bg-[#004d1f] text-white font-bold text-lg rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#003314]/30 hover:-translate-y-0.5"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Recipe...
              </span>
            ) : (
              "Get Recipe & Savings"
            )}
          </button>
        </form>
      )}

      {/* Image Input Mode */}
      {inputMode === "image" && (
        <div className="space-y-5">
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-[#003314]/30 rounded-2xl cursor-pointer hover:border-[#003314] hover:bg-[#003314]/5 transition-all duration-300 bg-white">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#003314]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#003314]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mb-2 text-lg text-[#1a1a1a]" style={{ fontFamily: 'var(--font-body)' }}>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-[#666666]" style={{ fontFamily: 'var(--font-accent)' }}>
                  Photo of a restaurant dish
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={imagePreview}
                alt="Dish preview"
                className="w-full h-72 object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 p-2.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleImageSubmit}
            disabled={!imagePreview || isLoading}
            style={{ fontFamily: 'var(--font-accent)' }}
            className="w-full py-5 bg-[#003314] hover:bg-[#004d1f] text-white font-bold text-lg rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#003314]/30 hover:-translate-y-0.5"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing & Generating...
              </span>
            ) : (
              "Get Recipe & Savings"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
