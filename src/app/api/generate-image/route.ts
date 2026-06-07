import { NextRequest, NextResponse } from "next/server";
import { generateHFImage } from "@/lib/hf-image-service";
import { HFModelId, AspectRatio, ImageStyle } from "@/types";

export const maxDuration = 300; // 5 minutes — model cold start + retries

export async function POST(req: NextRequest) {
  console.log("=== /api/generate-image: Request received ===");

  try {
    const body = await req.json();
    const {
      prompt,
      model,
      aspectRatio,
      style,
    }: {
      prompt: string;
      model: HFModelId;
      aspectRatio: AspectRatio;
      style: ImageStyle;
    } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Missing required field: prompt" }, { status: 400 });
    }

    const VALID_MODELS: HFModelId[] = [
      "SG161222/Realistic_Vision_V5.1_noVAE",
      "Lykon/DreamShaper",
      "AstraliteHeart/pony-diffusion",
    ];
    if (!model || !VALID_MODELS.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` },
        { status: 400 }
      );
    }

    const VALID_RATIOS: AspectRatio[] = ["1:1", "16:9", "3:4"];
    if (aspectRatio && !VALID_RATIOS.includes(aspectRatio)) {
      return NextResponse.json(
        { error: `Invalid aspectRatio. Must be one of: ${VALID_RATIOS.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Token resolution ─────────────────────────────────────────────────────
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      console.error("[HF] HF_TOKEN is not set in environment.");
      return NextResponse.json(
        { error: "Server configuration error: HF_TOKEN is not configured." },
        { status: 500 }
      );
    }

    // ── Generate ─────────────────────────────────────────────────────────────
    console.log(`[HF] Model: ${model}, Style: ${style}, AspectRatio: ${aspectRatio}`);
    console.log(`[HF] Prompt: ${prompt.substring(0, 80)}…`);

    const result = await generateHFImage(
      prompt.trim(),
      model,
      style || "realistic",
      aspectRatio || "1:1",
      hfToken
    );

    console.log(`[HF] Image generated. Buffer size: ${result.buffer.length} bytes`);

    // ── Convert to base64 and return JSON ────────────────────────────────────
    // Buffer (Node.js) returned by the service — directly call .toString("base64")
    const base64 = result.buffer.toString("base64");
    const dataUrl = `data:${result.contentType};base64,${base64}`;

    return NextResponse.json({
      imageUrl: dataUrl,
      model: result.modelId,
      backendModel: result.backendModel,
      enhancedPrompt: result.enhancedPrompt,
      contentType: result.contentType,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[HF] Image generation error:", err.message);

    // Classify errors for the frontend
    let userMessage = "Image generation failed. Please try again.";
    let statusCode = 500;

    if (err.message.includes("503") || err.message.toLowerCase().includes("loading")) {
      userMessage = "The model is warming up. Please wait 30 seconds and try again.";
      statusCode = 503;
    } else if (err.message.includes("429")) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
      statusCode = 429;
    } else if (err.message.includes("401") || err.message.includes("403")) {
      userMessage = "Authentication error — please check your HF_TOKEN.";
      statusCode = 401;
    } else if (err.message.includes("timed out") || err.message.includes("timeout")) {
      userMessage = "Request timed out — HF model is under heavy load. Please try again.";
      statusCode = 504;
    } else if (err.message.includes("empty image") || err.message.includes("small response")) {
      userMessage = "The model returned an empty image. Please try a different prompt.";
      statusCode = 502;
    }

    return NextResponse.json({ error: userMessage, detail: err.message }, { status: statusCode });
  }
}
