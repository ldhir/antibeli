import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Empty Beli, an app that helps people cook restaurant dishes at home for cheap.

Given a dish name (and optionally restaurant), return a complete recipe with grocery list and cost comparison.

Return ONLY valid JSON matching this exact structure:
{
  "dish": "Dish Name",
  "restaurant": "Restaurant Name or 'Popular Restaurant'",
  "restaurant_price": 32,
  "home_price": 6.50,
  "savings": 25.50,
  "savings_percent": 79,
  "time_mins": 35,
  "difficulty": "Easy" | "Medium" | "Hard",
  "servings": 2,
  "ingredients": ["ingredient with quantity", ...],
  "steps": ["step 1", "step 2", ...],
  "grocery_list": [
    {"item": "Item name", "qty": "quantity", "cost": 2.00},
    ...
  ]
}

Rules:
- Be accurate with grocery prices (US average)
- restaurant_price should reflect typical menu price for that dish
- home_price is the sum of grocery_list costs divided by servings
- Include all ingredients needed, even basics like oil/salt
- Steps should be clear and numbered
- Difficulty: Easy (<20 mins, simple), Medium (20-45 mins), Hard (>45 mins or complex technique)
- Return ONLY the JSON, no other text`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, text, imageBase64 } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    let userContent: Anthropic.MessageCreateParams["messages"][0]["content"];

    if (type === "image" && imageBase64) {
      // Extract media type and base64 data from data URL
      const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }

      const mediaType = matches[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      const base64Data = matches[2];

      userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: "text",
          text: "What dish is in this photo? Generate a recipe to make it at home. Return only JSON.",
        },
      ];
    } else if (type === "text" && text) {
      userContent = `User wants to make: ${text}`;
    } else {
      return NextResponse.json(
        { error: "Invalid input. Provide either text or image." },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userContent },
      ],
    });

    const responseText = message.content[0].type === "text"
      ? message.content[0].text
      : null;

    if (!responseText) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const recipe = JSON.parse(jsonStr.trim());

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Recipe generation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
