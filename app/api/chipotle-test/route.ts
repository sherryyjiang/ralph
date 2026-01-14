import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Use same model as main chat route
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "zai-glm-4.6";

function getClient(): OpenAI {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    console.error("CEREBRAS_API_KEY is not set");
    throw new Error("CEREBRAS_API_KEY environment variable is required");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });
}

interface ChipotleTestRequest {
  prompt: string;
}

const FALLBACK_MESSAGE = "Thanks for sharing! Peek appreciates you taking the time to reflect. We'll continue to learn more about you and your patterns, especially around food. 🌯";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChipotleTestRequest;
    const { prompt } = body;

    if (!prompt) {
      console.error("Missing prompt in request");
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    console.log("Chipotle test API - calling Cerebras with model:", MODEL_ID);

    const client = getClient();

    // Use user role for the full prompt (some models handle this better)
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: prompt + "\n\nPlease respond with ONLY the conclusion message, nothing else.",
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log("Chipotle test API - full response:", JSON.stringify(response, null, 2));

    const message = response.choices[0]?.message?.content?.trim();

    if (!message) {
      console.error("No message content in LLM response");
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    console.log("Chipotle test API - LLM response:", message);

    return NextResponse.json({ message });
  } catch (error) {
    // Log the full error for debugging
    console.error("Chipotle test API error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    return NextResponse.json({ message: FALLBACK_MESSAGE });
  }
}
