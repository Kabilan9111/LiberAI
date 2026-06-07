/**
 * Hugging Face Image Generation Service
 *
 * Uses: router.huggingface.co → together provider → FLUX.1-schnell
 * 
 * Findings from live network testing (2026-06-07):
 *  - api-inference.huggingface.co: DNS ENOTFOUND globally (subdomain down)
 *  - router.huggingface.co/together/v1/images/generations: ✅ HTTP 200, working
 *  - Only supported model: black-forest-labs/FLUX.1-schnell
 *  - SG161222/Realistic_Vision_V5.1_noVAE, Lykon/DreamShaper,
 *    AstraliteHeart/pony-diffusion: not available on any working provider
 *
 * Solution: All three named presets route through FLUX.1-schnell with
 * heavily differentiated prompt engineering to achieve the target aesthetics.
 */

import https from "https";
import { HFModel, HFModelId, AspectRatio, ImageStyle } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Working inference endpoint (confirmed via live testing)
// ─────────────────────────────────────────────────────────────────────────────

const HF_ROUTER_HOST = "router.huggingface.co";
const HF_ROUTER_PATH = "/together/v1/images/generations";

// The only confirmed working model via together provider
const WORKING_MODEL = "black-forest-labs/FLUX.1-schnell";

// ─────────────────────────────────────────────────────────────────────────────
// Model registry — three named presets with distinct prompt engineering
// ─────────────────────────────────────────────────────────────────────────────

export const HF_MODELS: Record<HFModelId, HFModel> = {
  "SG161222/Realistic_Vision_V5.1_noVAE": {
    id: "SG161222/Realistic_Vision_V5.1_noVAE",
    name: "Realistic Vision V5",
    description: "Photorealistic humans, cinematic portraits, product renders",
    useCases: ["Realistic humans", "Portraits", "Cinematic photography", "Product renders"],
    style: "realistic",
    negativePrompt: "cartoon, anime, painting, illustration, drawing, sketch, unrealistic",
    promptSuffix:
      "photorealistic, RAW photo, DSLR, 8k uhd, sharp focus, professional photography, cinematic lighting, hyperrealistic",
  },

  "Lykon/DreamShaper": {
    id: "Lykon/DreamShaper",
    name: "DreamShaper",
    description: "Fantasy art, concept art, posters, creative artwork",
    useCases: ["Fantasy", "Concept art", "Posters", "Creative artwork"],
    style: "fantasy",
    negativePrompt: "photorealistic, photograph, ugly, blurry, low quality",
    promptSuffix:
      "fantasy digital painting, artstation, concept art, sharp focus, vibrant colors, intricate details, by Greg Rutkowski",
  },

  "AstraliteHeart/pony-diffusion": {
    id: "AstraliteHeart/pony-diffusion",
    name: "Pony Diffusion",
    description: "Anime, stylized characters, manga-style art",
    useCases: ["Anime", "Stylized characters", "Manga-style art"],
    style: "anime",
    negativePrompt: "photorealistic, 3d render, ugly, poorly drawn",
    promptSuffix:
      "anime illustration, manga style, vibrant colors, cel shading, sharp lines, studio quality, Japanese animation",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildEnhancedPrompt(
  userPrompt: string,
  model: HFModel,
  style: ImageStyle
): string {
  const styleEnhancements: Record<ImageStyle, string> = {
    realistic: "photorealistic, hyperrealistic,",
    cinematic: "cinematic shot, dramatic lighting, film grain,",
    fantasy: "fantasy art, ethereal, magical atmosphere,",
    cyberpunk: "cyberpunk aesthetic, neon lights, futuristic,",
    anime: "anime style, manga illustration,",
    dark_mode: "dark and moody, noir, high contrast,",
  };

  const stylePrefix = styleEnhancements[style] || "";
  return `${stylePrefix} ${userPrompt}, ${model.promptSuffix}`.replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Aspect ratio → pixel dimensions
// ─────────────────────────────────────────────────────────────────────────────

export function getDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9": return { width: 1024, height: 576 };
    case "3:4":  return { width: 768, height: 1024 };
    case "1:1":
    default:     return { width: 1024, height: 1024 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Low-level HTTPS request using Node.js https module
// (avoids undici/fetch 45s socket timeout)
// ─────────────────────────────────────────────────────────────────────────────

interface HFRawResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}

function httpsPost(
  host: string,
  path: string,
  headers: Record<string, string>,
  bodyJson: string
): Promise<HFRawResponse> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: host,
      port: 443,
      path,
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyJson),
      },
      timeout: 0, // no socket timeout — rely on maxDuration
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          statusCode: res.statusCode ?? 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body: Buffer.concat(chunks),
        })
      );
      res.on("error", reject);
    });

    req.on("error", reject);
    req.write(bodyJson);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Core generation — calls router.huggingface.co/together
// ─────────────────────────────────────────────────────────────────────────────

async function callHFRouter(
  prompt: string,
  width: number,
  height: number,
  token: string
): Promise<Buffer> {
  const requestBody = JSON.stringify({
    model: WORKING_MODEL,
    prompt,
    n: 1,
    response_format: "b64_json",
    width,
    height,
    num_inference_steps: 4, // FLUX.1-schnell is optimized for 4 steps
  });

  const reqHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  console.log(`[HF] POST ${HF_ROUTER_HOST}${HF_ROUTER_PATH}`);
  console.log(`[HF] Using model: ${WORKING_MODEL}`);
  console.log(`[HF] Dimensions: ${width}x${height}`);

  const raw = await httpsPost(HF_ROUTER_HOST, HF_ROUTER_PATH, reqHeaders, requestBody);

  console.log(`[HF] Response status: ${raw.statusCode}, body size: ${raw.body.length} bytes`);

  if (raw.statusCode === 429) {
    throw new Error("HF rate limit exceeded (429). Please wait a moment and try again.");
  }

  if (raw.statusCode === 401 || raw.statusCode === 403) {
    throw new Error(`HF authentication failed (${raw.statusCode}). Check HF_TOKEN.`);
  }

  if (raw.statusCode < 200 || raw.statusCode >= 300) {
    const errBody = raw.body.toString().substring(0, 300);
    throw new Error(`HF API error ${raw.statusCode}: ${errBody}`);
  }

  // Parse response JSON → extract b64_json
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw.body.toString());
  } catch (e) {
    throw new Error(`HF returned non-JSON response (${raw.statusCode}): ${raw.body.toString().substring(0, 200)}`);
  }

  const data = parsed.data as Array<{ b64_json?: string; url?: string }> | undefined;
  if (!data || data.length === 0) {
    throw new Error(`HF response missing data array: ${JSON.stringify(parsed).substring(0, 200)}`);
  }

  const b64 = data[0]?.b64_json;
  if (!b64 || b64.length < 100) {
    throw new Error(`HF returned empty or invalid image data (b64 length: ${b64?.length ?? 0})`);
  }

  return Buffer.from(b64, "base64");
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateImageResult {
  buffer: Buffer;
  contentType: string;
  modelId: HFModelId;
  enhancedPrompt: string;
  backendModel: string;
}

export async function generateHFImage(
  userPrompt: string,
  modelId: HFModelId,
  style: ImageStyle,
  aspectRatio: AspectRatio,
  token: string
): Promise<GenerateImageResult> {
  const model = HF_MODELS[modelId];
  if (!model) throw new Error(`Unknown model preset: ${modelId}`);

  const enhancedPrompt = buildEnhancedPrompt(userPrompt, model, style);
  const { width, height } = getDimensions(aspectRatio);

  console.log(`[HF] Preset: ${model.name} → backend: ${WORKING_MODEL}`);
  console.log(`[HF] Enhanced prompt: ${enhancedPrompt.substring(0, 120)}…`);

  const buffer = await callHFRouter(enhancedPrompt, width, height, token);

  // Detect PNG vs JPEG from magic bytes
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const contentType = isPng ? "image/png" : "image/jpeg";

  console.log(`[HF] Done. ${contentType}, ${buffer.length} bytes`);

  return {
    buffer,
    contentType,
    modelId,
    enhancedPrompt,
    backendModel: WORKING_MODEL,
  };
}
