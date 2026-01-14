import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "llama-4-scout-17b-16e-instruct";

function getClient(): OpenAI {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChipotleTestRequest;
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const client = getClient();

    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Generate the conclusion message." },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const message = response.choices[0]?.message?.content ||
      "Thanks for sharing! Peek appreciates you taking the time to reflect. 🌯";

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chipotle test API error:", error);
    return NextResponse.json(
      {
        message: "Thanks for sharing! Peek appreciates you taking the time to reflect. We'll continue to learn more about you and your patterns, especially around food. 🌯"
      },
      { status: 200 } // Return 200 with fallback message instead of error
    );
  }
}
