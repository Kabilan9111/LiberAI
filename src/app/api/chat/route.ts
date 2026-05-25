import { NextRequest } from "next/server";
import { AIProvider } from "@/types";
import { AI_MODELS, PERSONALITY_TO_PROFILE, selectWildModel } from "@/config/aiModels";

function getSystemPrompt(personality: string, language: string, settings: any): string {
  let modePrompt = "";
  switch (personality) {
    case "chill":
      modePrompt = "Respond in a very friendly, relaxed, casual Gen Z style. Use slang like 'yo', 'buddy', 'chill', lowercase, and casual emojis. Keep answers accurate and helpful.";
      break;
    case "savage":
      modePrompt = "Respond in a bold, sarcastic, roasting tone. Use sharp internet humor, playful insults (e.g. comparing bad code to burned maggi), and meme-heavy expressions. Keep the response accurate but deliver it with a humorous, roast-like attitude.";
      break;
    case "romantic":
      modePrompt = "Respond in a soft, sweet, highly supportive, flirty, and emotionally warm tone. Use encouraging words and emojis like ✨ and ❤️.";
      break;
    case "motivational":
      modePrompt = "Respond in a high-energy, discipline-focused, gym/CEO mentality coach style. Push the user to succeed, use strong verbs, uppercase emphasis, and emojis like 💪 and 🔥.";
      break;
    case "study_coach":
      modePrompt = "Respond in a highly structured, clear, educational style. Break explanations down step-by-step, use clear headings, bullet points, and encourage testing understanding.";
      break;
    case "tamil_local":
      modePrompt = "Respond in local Chennai slang (Tamil-English/Tanglish mixed style). Use terms like 'dei', 'thala', 'idhu easy da', 'kadhai enna na', and natural informal Tamil slang mixed with English.";
      break;
    case "wild":
      modePrompt = "You are in Wild Mode. You are a highly confident, charismatic, smooth, witty, and emotionally aware companion. Respond to relationship discussions, confidence talks, intimacy-related personal conversations, and bold/savage personality interactions with maturity, charm, and adaptive communication. Do NOT sound childish, spam emojis, repeat phrases, or act like a generic assistant. Maintain human-like pacing and a strong personality. If contextually appropriate, you may use a mature teasing or flirting tone.";
      break;
    default:
      modePrompt = "Respond in a friendly, helpful, and natural tone.";
  }

  // Include selected language instruction
  let langPrompt = `You MUST write your entire response in the following language: ${language}.`;
  if (language === "tamil" && personality === "tamil_local") {
    langPrompt = "You can write in a natural mix of Tamil and English (Tanglish) or Tamil script as appropriate for Chennai local slang.";
  }

  // Combine instructions
  return `You are Liber AI, a premium intelligent companion.
${modePrompt}
${langPrompt}

Core Rules:
1. You must answer the user's question accurately and intelligently.
2. The personality mode only changes your communication style, tone, and formatting, NOT your correctness or intelligence.
3. Keep all responses production-quality and stable.
4. You must answer the user's current question contextually based on the conversation history and the latest message. Do not repeat greeting messages or templates. Keep the response fresh, direct, and unique.`;
}

function getEnvVarName(provider: AIProvider): string {
  switch (provider) {
    case "gemini": return "GEMINI_API_KEY";
    case "groq": return "GROQ_API_KEY";
    case "openai": return "OPENAI_API_KEY";
    case "openrouter": return "OPENROUTER_API_KEY";
    case "together": return "TOGETHER_API_KEY";
    default: return "GEMINI_API_KEY";
  }
}

function getFetchUrl(provider: AIProvider, model: string, apiKey: string): string {
  switch (provider) {
    case "gemini":
      return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    case "groq":
      return "https://api.groq.com/openai/v1/chat/completions";
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
    case "together":
      return "https://api.together.xyz/v1/chat/completions";
    default:
      return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
  }
}

function getHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
  if (provider === "gemini") {
    return { "Content-Type": "application/json" };
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://liberai.com";
    headers["X-Title"] = "Liber AI";
  }

  return headers;
}

function getRequestBody(
  provider: AIProvider,
  model: string,
  contents: any[],
  systemPrompt: string,
  settings: any
) {
  const temperature = settings ? settings.creativity / 100 : 0.7;

  if (provider === "gemini") {
    return {
      contents,
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature,
      },
    };
  }

  // Format history to OpenAI format
  const messages = [
    { role: "system", content: systemPrompt },
    ...contents.map((msg) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.parts[0].text,
    })),
  ];

  return {
    model,
    messages,
    stream: true,
    temperature,
  };
}

function getFallbackProviderAndModel(targetProvider: AIProvider): { provider: AIProvider; model: string } {
  const keys = {
    gemini: process.env.GEMINI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    together: process.env.TOGETHER_API_KEY,
  };

  const available = Object.keys(keys).filter((p) => keys[p as keyof typeof keys]) as AIProvider[];
  
  if (available.length === 0) {
    throw new Error("No API keys are configured on the server.");
  }

  // Prefer gemini, otherwise take the first available
  const fallbackProvider = available.includes("gemini") ? "gemini" : available[0];
  let fallbackModel = "gemini-2.5-flash";

  if (fallbackProvider === "groq") fallbackModel = "llama-3.1-70b-versatile";
  else if (fallbackProvider === "openai") fallbackModel = "gpt-4.1-mini";
  else if (fallbackProvider === "openrouter") fallbackModel = "nousresearch/nous-hermes-2-mixtral";
  else if (fallbackProvider === "together") fallbackModel = "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO";

  return { provider: fallbackProvider, model: fallbackModel };
}

export async function POST(req: NextRequest) {
  console.log("=== API Route /api/chat: Request Received ===");
  try {
    const body = await req.json();
    const { message, history, personality, language, settings, provider } = body;
    console.log("Request Body:", {
      message,
      personality,
      language,
      settings,
      provider,
      historyCount: history ? history.length : 0,
    });

    // 1. Resolve Provider and Model
    let targetProvider: AIProvider = provider && provider !== "auto" ? provider : "gemini";
    let targetModel = "gemini-2.5-flash";

    if (!provider || provider === "auto") {
      const profile = PERSONALITY_TO_PROFILE[personality] || "smart";
      const config = AI_MODELS[profile];
      targetProvider = config.provider;
      targetModel = config.model;

      if (profile === "wild") {
        targetModel = selectWildModel(message, targetProvider);
      }
    } else {
      // Manual selection
      if (personality === "wild") {
        targetModel = selectWildModel(message, targetProvider);
      } else {
        // Map manually selected provider to its default model
        if (targetProvider === "gemini") targetModel = "gemini-2.5-flash";
        else if (targetProvider === "groq") targetModel = "llama-3.1-70b-versatile";
        else if (targetProvider === "openai") targetModel = "gpt-4.1-mini";
        else if (targetProvider === "openrouter") targetModel = "nousresearch/nous-hermes-2-mixtral";
        else if (targetProvider === "together") targetModel = "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO";
      }
    }

    // 2. Validate API Key / Handle fallback before calling
    let apiKey = process.env[getEnvVarName(targetProvider)];
    if (!apiKey) {
      console.warn(`API key for ${targetProvider} is missing. Falling back...`);
      const fallback = getFallbackProviderAndModel(targetProvider);
      targetProvider = fallback.provider;
      targetModel = fallback.model;
      apiKey = process.env[getEnvVarName(targetProvider)];
      console.log(`Fallback selected: ${targetProvider} with model ${targetModel}`);
    }

    if (!apiKey) {
      return new Response("No suitable API keys are configured on the server.", { status: 500 });
    }

    // 3. Build System Instruction
    const systemPrompt = getSystemPrompt(personality, language, settings);

    // 4. Format Conversation History (Gemini input format as canonical base)
    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.id.startsWith("welcome-")) continue;
        if (msg.content.startsWith("Error:") || msg.content.includes("Failed to stream response")) {
          continue;
        }
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    console.log(`Routing to Provider: ${targetProvider}, Model: ${targetModel}`);

    // 5. Call Provider API with timeout and retry fallback
    let response: Response | null = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 seconds timeout

      try {
        const fetchUrl = getFetchUrl(targetProvider, targetModel, apiKey);
        const fetchHeaders = getHeaders(targetProvider, apiKey);
        const fetchBody = getRequestBody(targetProvider, targetModel, contents, systemPrompt, settings);

        console.log(`Fetching stream from ${targetProvider}...`);
        response = await fetch(fetchUrl, {
          method: "POST",
          headers: fetchHeaders,
          body: JSON.stringify(fetchBody),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          break; // Fetch succeeded
        } else {
          const errText = await response.text();
          throw new Error(`Provider API error (${response.status}): ${errText}`);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error(`Attempt ${attempts} failed for ${targetProvider}:`, err.message);

        if (attempts >= maxAttempts) {
          return new Response(`AI Provider Error: ${err.message}`, { status: 502 });
        }

        // Switch to fallback provider for the next attempt
        const fallback = getFallbackProviderAndModel(targetProvider);
        targetProvider = fallback.provider;
        targetModel = fallback.model;
        apiKey = process.env[getEnvVarName(targetProvider)] || "";
        console.log(`Retrying with fallback provider: ${targetProvider}, model: ${targetModel}`);
      }
    }

    if (!response || !response.body) {
      return new Response("Provider response body is empty.", { status: 500 });
    }

    // 6. Return Unified Event Stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            const chunkStr = decoder.decode(value, { stream: true });
            buffer += chunkStr;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              // Parse event stream data lines
              if (trimmed.startsWith("data: ")) {
                const jsonStr = trimmed.substring(6).trim();
                if (jsonStr === "[DONE]") {
                  continue;
                }

                try {
                  const parsed = JSON.parse(jsonStr);
                  
                  // Resolve text depending on provider JSON response format
                  let text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (!text) {
                    text = parsed.choices?.[0]?.delta?.content;
                  }

                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  // Resilient parsing: continue on JSON warnings
                }
              }
            }
          }
          controller.close();
        } catch (streamErr: any) {
          console.error("Stream reading error:", streamErr);
          // Partial stream preservation: close stream gracefully
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Unhandled error in API route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
