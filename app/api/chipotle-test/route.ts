import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Use a simpler, more reliable model for this task
const MODEL_ID = "llama-3.3-70b";

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

    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        {
          role: "system",
          content: "You are Peek, a warm and friendly financial companion. Respond conversationally in 2-3 sentences. Never use bullet points, markdown, or formatting. Just write natural sentences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const message = response.choices[0]?.message?.content?.trim();

    if (!message) {
      console.error("No message content in LLM response");
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    console.log("Chipotle test API - LLM response:", message);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chipotle test API error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    return NextResponse.json({ message: FALLBACK_MESSAGE });
  }
}
