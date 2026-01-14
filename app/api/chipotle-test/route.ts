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

    // Use user role for the full prompt
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: prompt + "\n\nRespond with ONLY the 2-3 sentence conclusion message.",
        },
      ],
      temperature: 0.7,
      max_tokens: 500, // Increased to allow for reasoning + content
    });

    console.log("Chipotle test API - full response:", JSON.stringify(response, null, 2));

    // Handle both content field and reasoning field (model may use either)
    const messageObj = response.choices[0]?.message as { content?: string; reasoning?: string };
    let message = messageObj?.content?.trim();

    // If content is empty but reasoning has text, extract the response from reasoning
    if (!message && messageObj?.reasoning) {
      console.log("Using reasoning field as response");
      // The reasoning often contains the actual response - extract it
      const reasoning = messageObj.reasoning;
      // Look for the actual response part (usually after "Here's my draft:" or similar)
      const draftMatch = reasoning.match(/(?:Here's my (?:draft|response)|draft:)\s*["\n]([^"]+)/i);
      if (draftMatch) {
        message = draftMatch[1].trim();
      } else {
        // Just use the last paragraph of reasoning as the response
        const paragraphs = reasoning.split('\n\n').filter((p: string) => p.trim());
        const lastParagraph = paragraphs[paragraphs.length - 1];
        if (lastParagraph && lastParagraph.length > 20) {
          message = lastParagraph.replace(/^["']|["']$/g, '').trim();
        }
      }
    }

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
