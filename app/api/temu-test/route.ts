import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "zai-glm-4.6";

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

interface TemuTestRequest {
  prompt: string;
}

const FALLBACK_MESSAGE =
  "Thanks for walking through that with me. If you want to dig more into your Temu pattern later, I'm here.";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TemuTestRequest;
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    const client = getClient();
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        {
          role: "system",
          content:
            "You are Peek, a warm and friendly financial companion. Respond conversationally in 2-3 sentences. Never use bullet points, markdown, or formatting. Just write natural sentences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 180,
    });

    const message = response.choices[0]?.message?.content?.trim();
    if (!message) {
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: FALLBACK_MESSAGE });
  }
}
