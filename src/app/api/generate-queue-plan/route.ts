import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { QueuedMeal, LeftoverSuggestion, GroceryItemWithFreshness } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a smart meal planning assistant for Beli at Home, an app that helps broke people cook restaurant dishes at home.

Given a list of queued meals with their recipes and grocery lists, you need to:

1. CONSOLIDATE the grocery list - combine duplicate ingredients across recipes
2. Add FRESHNESS data - estimate how many days each ingredient lasts
3. Suggest COOKING ORDER - which meals to cook first based on perishable ingredients
4. Suggest LEFTOVER MEALS - quick, easy meals using ingredients that will be left over

Return ONLY valid JSON matching this exact structure:
{
  "consolidatedGroceryList": [
    {
      "item": "Ingredient name",
      "qty": "combined quantity",
      "cost": 3.50,
      "daysUntilSpoil": 7,
      "isPerishable": true,
      "usedIn": ["Dish 1", "Dish 2"]
    }
  ],
  "suggestedOrder": [
    {
      "mealId": "abc123",
      "order": 1,
      "reason": "Fresh herbs will spoil in 3 days"
    }
  ],
  "leftoverSuggestions": [
    {
      "name": "Quick meal name",
      "description": "Brief description of the dish",
      "ingredients": ["leftover ingredient 1", "leftover ingredient 2"],
      "urgency": "high",
      "timeMinutes": 15
    }
  ],
  "totalCost": 28.50,
  "totalRestaurantCost": 85.00,
  "totalSavings": 56.50
}

Rules for freshness (daysUntilSpoil):
- Fresh herbs (basil, cilantro, parsley): 3-5 days
- Leafy greens: 5-7 days
- Fresh meat/fish: 2-3 days
- Ground meat: 1-2 days
- Vegetables (tomatoes, peppers): 7-10 days
- Root vegetables (onions, garlic, potatoes): 14+ days
- Dairy (milk, cream): 7-10 days
- Cheese: 14-21 days
- Pantry items (rice, pasta, canned goods): 30+ days (not perishable)

Urgency levels for leftover suggestions:
- "high": uses ingredients that spoil within 3 days
- "medium": uses ingredients that spoil within 7 days
- "low": uses non-perishable leftovers

Leftover meals should be SIMPLE and QUICK (under 20 mins) - think fried rice, quesadillas, omelets, stir-fry, etc.

Return ONLY the JSON, no other text.`;

interface ConsolidatedItem extends GroceryItemWithFreshness {
  usedIn: string[];
}

interface QueuePlanResponse {
  consolidatedGroceryList: ConsolidatedItem[];
  suggestedOrder: Array<{
    mealId: string;
    order: number;
    reason: string;
  }>;
  leftoverSuggestions: LeftoverSuggestion[];
  totalCost: number;
  totalRestaurantCost: number;
  totalSavings: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meals } = body as { meals: QueuedMeal[] };

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: "No meals provided" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt with meal details
    const mealDetails = meals.map((meal) => ({
      id: meal.id,
      dish: meal.recipe.dish,
      servings: meal.servings,
      isHosting: meal.isHosting,
      guestCount: meal.guestCount,
      groceryList: meal.recipe.grocery_list,
      restaurantPrice: meal.recipe.restaurant_price,
    }));

    const userContent = `Here are the queued meals to plan:

${JSON.stringify(mealDetails, null, 2)}

Please consolidate the grocery list, suggest cooking order based on ingredient freshness, and suggest quick leftover meals.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : null;

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

    const plan: QueuePlanResponse = JSON.parse(jsonStr.trim());

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Queue plan generation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate queue plan" },
      { status: 500 }
    );
  }
}
