import { NextRequest, NextResponse } from "next/server";
import http from "http";

export const maxDuration = 1800; // 30 minutes max for serverless

// ============================================================
// Provider:  Local Meta AudioCraft Server
// Model:     facebook/musicgen-small (cached locally)
// Endpoint:  http://localhost:8000/api/generate
// ============================================================

const LOCAL_MODEL_URL = "http://localhost:8000/api/generate";
const DEFAULT_DURATION = 30; // seconds — one full musicgen-small chunk
const MAX_DURATION = 120;    // seconds — hard cap (multi-chunk via server)

function buildMusicPrompt(basePrompt: string, mode: string): string {
  const lower = basePrompt.toLowerCase();

  // Phonk / Montagem / Brazilian phonk
  if (lower.includes("montagem") || lower.includes("brazilian phonk"))
    return `dark aggressive brazilian montagem phonk, distorted 808 bass drops, fast cowbell melody, trap hi-hats, heavy compression, energetic progression, pitch-shifted vocals stabs, dark synth, relentless energy, no ambience`;

  if (lower.includes("phonk") || lower.includes("ultrafunk") || lower.includes("dark phonk"))
    return `dark phonk music, heavy distorted 808 bass, cowbell rhythm, aggressive trap percussion, dark minor chord progression, distorted synth stabs, menacing low-end groove, high energy, no ambient pads, full musical structure`;

  if (lower.includes("horror phonk") || lower.includes("horror"))
    return `horror phonk music, dark trap beat, distorted 808 bass, eerie minor melody, menacing atmosphere, aggressive percussion drops, dark energy progression, phonk cowbell, pitch-shifted samples`;

  if (lower.includes("gym") || lower.includes("workout") || lower.includes("hype"))
    return `high energy gym workout music, aggressive trap beats, heavy bass drops, motivational progression, dark phonk influence, intense percussion, powerful low-end, no slow sections`;

  if (lower.includes("villain") || lower.includes("antagonist"))
    return `dark villain cinematic music, aggressive bass hits, menacing orchestral stabs, rising tension, dark chord progression, heavy percussion drops, intense energy`;

  if (lower.includes("emotional") || lower.includes("sad"))
    return `emotional cinematic orchestral score, deep strings, solo piano, emotional climax build, powerful swell, Hans Zimmer style, full musical arc`;

  if (lower.includes("action") || lower.includes("epic") || lower.includes("trailer"))
    return `epic action trailer music, powerful orchestra, intense percussion, brass hits, rising tension, blockbuster energy, full musical structure with drops and builds`;

  if (lower.includes("lo-fi") || lower.includes("lofi"))
    return `lo-fi hip hop, chill beats, vinyl crackle, mellow chords, soft drums, jazzy samples, relaxed atmosphere`;

  if (lower.includes("synthwave") || lower.includes("retro"))
    return `synthwave retro music, pulsing bass synth, arpeggiated leads, driving rhythm, 80s aesthetic, full melodic structure`;

  // Director mode — preserve user's intent, enhance quality descriptors
  if (mode === "director")
    return `high quality ${basePrompt}, full musical structure with verse chorus and drops, strong bass, clear progression, professional mix, no ambient noise`;

  return `${basePrompt}, full musical structure, strong rhythm section, melodic progression`;
}

export async function POST(req: NextRequest) {
  try {
    console.log("========== MUSIC ROUTE ENTERED ==========");
    console.log("Provider : Local Meta AudioCraft Server");
    console.log("Model    : facebook/musicgen-medium");

    const body = await req.json();
    const prompt: string = body.prompt;
    const mode: string = body.mode || "wild";
    // Parse duration — frontend sends it; clamp to valid range
    const rawDuration: number = Number(body.duration) || DEFAULT_DURATION;
    const duration: number = Math.min(Math.max(rawDuration, 1), MAX_DURATION);

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const enhancedPrompt = buildMusicPrompt(prompt, mode);
    console.log(`[Local] Prompt: "${enhancedPrompt}"`);
    console.log(`[Local] Duration: ${duration}s (requested: ${rawDuration}s)`);
    console.log("[Local] Sending request to local server...");

    // Use node:http to bypass undici's strict 5-minute timeout
    const data = await new Promise<any>((resolve, reject) => {
      const postData = JSON.stringify({ prompt: enhancedPrompt, duration });
      const request = http.request(LOCAL_MODEL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        },
        timeout: 0 // No timeout — CPU generation takes a long time
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Local API error ${res.statusCode}: ${body}`));
          } else {
            resolve(JSON.parse(body));
          }
        });
      });

      request.on("error", reject);
      request.on("timeout", () => {
        request.destroy();
        reject(new Error("The operation was aborted due to timeout"));
      });

      request.write(postData);
      request.end();
    });

    console.log(`[Local] Successfully generated. Audio URL: ${data.url}, Model: ${data.model}`);

    // Fetch the audio file from the local server and stream to frontend
    console.log("[Local] Fetching audio file to stream to client...");
    const audioFileRes = await fetch(data.url);

    if (!audioFileRes.ok) {
      throw new Error(`Failed to fetch generated audio file from ${data.url}`);
    }

    const audioBuffer = await audioFileRes.arrayBuffer();
    console.log(`[Local] Audio buffer size: ${audioBuffer.byteLength} bytes`);

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Local server returned empty audio buffer." },
        { status: 502 }
      );
    }

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="liber-ai-track.wav"`,
      },
    });

  } catch (error: any) {
    console.error("FULL MUSIC ROUTE ERROR:", error.message);
    if (error.message.includes("fetch failed") || error.name === "TypeError") {
      console.error("Connection Refused. Is the local FastAPI server running on port 8000?");
      return NextResponse.json(
        { error: "Music generation failed: Cannot connect to local server. Is it running?" },
        { status: 503 }
      );
    }
    try {
      console.error("RAW ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (_) {}
    return NextResponse.json(
      { error: `Music generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}
