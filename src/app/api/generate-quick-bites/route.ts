import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { QuickBiteSuggestion } from "@/lib/types";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const { pantryItems } = await request.json();

    if (!pantryItems || pantryItems.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const prompt = `You are a helpful cooking assistant. Based on the following pantry items, suggest 3-4 quick, easy meals that can be made.

PANTRY ITEMS:
${pantryItems.map((item: { displayName: string; quantity: number; unit: string }) =>
  `- ${item.displayName} (${item.quantity} ${item.unit})`
).join("\n")}

For each suggestion, provide:
1. A catchy name
2. A brief description (1 sentence)
3. Which pantry ingredients it uses (from the list above)
4. Estimated cooking time in minutes
5. Difficulty (Easy, Medium, or Hard)

Focus on QUICK meals that are simple and satisfying - think 15-30 minute dishes.
Prioritize using multiple pantry items together.

Respond in this exact JSON format:
{
  "suggestions": [
    {
      "name": "Garlic Butter Pasta",
      "description": "Simple aglio e olio style pasta with crispy garlic",
      "ingredients": ["garlic", "olive oil", "pasta"],
      "timeMinutes": 15,
      "difficulty": "Easy"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);
    const suggestions: QuickBiteSuggestion[] = result.suggestions || [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error generating quick bites:", error);
    return NextResponse.json(
      { error: "Failed to generate quick bite suggestions" },
      { status: 500 }
    );
  }
}
