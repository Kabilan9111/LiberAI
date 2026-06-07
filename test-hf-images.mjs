/**
 * End-to-End Live Image Generation Verification
 * Tests all three HF models against the running Next.js dev server.
 * Run: node test-hf-images.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const ENDPOINT = `${BASE_URL}/api/generate-image`;
const OUTPUT_DIR = "./hf-test-output";

// ─── Test cases ────────────────────────────────────────────────────────────────

const TEST_CASES = [
  {
    name: "Realistic Vision V5",
    model: "SG161222/Realistic_Vision_V5.1_noVAE",
    prompt: "Professional portrait of a confident businesswoman, dark office background, cinematic lighting, DSLR photograph, sharp focus",
    style: "realistic",
    aspectRatio: "1:1",
  },
  {
    name: "DreamShaper",
    model: "Lykon/DreamShaper",
    prompt: "Epic fantasy castle on a floating island above the clouds, golden hour, magical aurora sky, concept art, highly detailed",
    style: "fantasy",
    aspectRatio: "16:9",
  },
  {
    name: "Pony Diffusion",
    model: "AstraliteHeart/pony-diffusion",
    prompt: "Cute anime girl with silver hair and emerald eyes, cherry blossom park background, vibrant colors, sharp illustration",
    style: "anime",
    aspectRatio: "1:1",
  },
];

// ─── Utilities ──────────────────────────────────────────────────────────────

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(2)}MB`;
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return 0;
  return Math.round((base64.length * 3) / 4);
}

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${msg}`);
}

function sep(char = "─", len = 70) {
  return char.repeat(len);
}

// ─── Single model test ──────────────────────────────────────────────────────

async function testModel(tc, index) {
  const label = `[${index + 1}/3] ${tc.name}`;
  console.log(`\n${sep()}`);
  log(`${label} — STARTING`);
  log(`  Model ID   : ${tc.model}`);
  log(`  Prompt     : ${tc.prompt.substring(0, 60)}…`);
  log(`  Style      : ${tc.style}`);
  log(`  Ratio      : ${tc.aspectRatio}`);
  console.log(sep("·"));

  const result = {
    name: tc.name,
    model: tc.model,
    prompt: tc.prompt,
    status: null,
    httpStatus: null,
    generationTime: null,
    imageSize: null,
    imageBytes: null,
    contentType: null,
    enhancedPrompt: null,
    error: null,
    pass: false,
    savedPath: null,
  };

  const startTime = Date.now();

  try {
    log(`  Sending POST to ${ENDPOINT}…`);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: tc.prompt,
        model: tc.model,
        aspectRatio: tc.aspectRatio,
        style: tc.style,
      }),
      // No timeout here — model loading can take 60s+
      signal: AbortSignal.timeout(180_000), // 3-minute hard cap
    });

    const elapsed = Date.now() - startTime;
    result.httpStatus = res.status;
    result.generationTime = elapsed;

    log(`  HTTP Status : ${res.status} ${res.statusText} (${formatTime(elapsed)})`);

    const data = await res.json();

    if (!res.ok) {
      result.status = "FAIL";
      result.error = data.error || `HTTP ${res.status}`;
      result.pass = false;
      log(`  ✗ FAILED    : ${result.error}`);
      if (data.detail) log(`  Detail      : ${data.detail}`);
      return result;
    }

    // ── Validate response ──────────────────────────────────────────────────

    if (!data.imageUrl) {
      result.status = "FAIL";
      result.error = "Response JSON missing imageUrl field";
      log(`  ✗ FAILED    : ${result.error}`);
      return result;
    }

    if (!data.imageUrl.startsWith("data:image/")) {
      result.status = "FAIL";
      result.error = `imageUrl is not a data URL (got: ${data.imageUrl.substring(0, 40)})`;
      log(`  ✗ FAILED    : ${result.error}`);
      return result;
    }

    const bytes = dataUrlToBytes(data.imageUrl);
    if (bytes < 1024) {
      result.status = "FAIL";
      result.error = `Image appears empty or corrupt (only ${bytes} bytes decoded)`;
      log(`  ✗ FAILED    : ${result.error}`);
      return result;
    }

    result.imageBytes = bytes;
    result.imageSize = formatBytes(bytes);
    result.contentType = data.contentType || "image/jpeg";
    result.enhancedPrompt = data.enhancedPrompt;

    // ── Save image to disk for manual review ──────────────────────────────

    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
    const ext = result.contentType.includes("png") ? "png" : "jpg";
    const filename = `${tc.name.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
    const outputPath = join(OUTPUT_DIR, filename);

    // Strip data URL prefix and save raw bytes
    const base64Data = data.imageUrl.split(",")[1];
    writeFileSync(outputPath, Buffer.from(base64Data, "base64"));
    result.savedPath = outputPath;

    result.status = "PASS";
    result.pass = true;

    log(`  ✓ PASS`);
    log(`  Image Size  : ${result.imageSize} (${bytes.toLocaleString()} bytes)`);
    log(`  Content-Type: ${result.contentType}`);
    log(`  Saved to    : ${outputPath}`);
    log(`  Enhanced    : ${(result.enhancedPrompt || "").substring(0, 80)}…`);

  } catch (err) {
    const elapsed = Date.now() - startTime;
    result.generationTime = elapsed;
    result.status = "FAIL";
    result.pass = false;

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      result.error = "Request timed out after 3 minutes";
    } else if (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed")) {
      result.error = "Cannot connect to localhost:3000 — is the dev server running?";
    } else {
      result.error = err.message;
    }
    log(`  ✗ ERROR     : ${result.error} (${formatTime(elapsed)})`);
  }

  return result;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(sep("═"));
  console.log("  LIBER AI — HF IMAGE GENERATION END-TO-END TEST");
  console.log(`  ${new Date().toISOString()}`);
  console.log(`  Endpoint: ${ENDPOINT}`);
  console.log(sep("═"));

  // Quick connectivity check
  log("Checking dev server connectivity…");
  try {
    const ping = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    log(`  Server responded with HTTP ${ping.status} ✓`);
  } catch (e) {
    log(`  ✗ Cannot reach ${BASE_URL}: ${e.message}`);
    log("  Make sure the dev server is running: npm run dev");
    process.exit(1);
  }

  const results = [];

  // Run tests sequentially (model servers may share GPU quota)
  for (let i = 0; i < TEST_CASES.length; i++) {
    const r = await testModel(TEST_CASES[i], i);
    results.push(r);

    // Brief pause between models to avoid hammering the HF rate limit
    if (i < TEST_CASES.length - 1) {
      log("  Pausing 3s before next model…");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  console.log(`\n${sep("═")}`);
  console.log("  FINAL RESULTS");
  console.log(sep("═"));
  console.log(
    `${"Model".padEnd(22)} ${"HTTP".padEnd(5)} ${"Time".padEnd(8)} ${"Size".padEnd(10)} STATUS`
  );
  console.log(sep("─"));

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const timeStr = r.generationTime ? formatTime(r.generationTime) : "—";
    const sizeStr = r.imageSize || "—";
    const httpStr = r.httpStatus ? String(r.httpStatus) : "—";
    const statusIcon = r.pass ? "✅ PASS" : "❌ FAIL";
    console.log(
      `${r.name.padEnd(22)} ${httpStr.padEnd(5)} ${timeStr.padEnd(8)} ${sizeStr.padEnd(10)} ${statusIcon}`
    );
    if (!r.pass) console.log(`  └─ Error: ${r.error}`);
    r.pass ? passed++ : failed++;
  }

  console.log(sep("─"));
  console.log(`  Passed: ${passed}/3   Failed: ${failed}/3`);
  console.log(sep("═"));

  // ── Detailed per-model report ───────────────────────────────────────────────
  for (const r of results) {
    console.log(`\n── ${r.name} ─────────────────────`);
    console.log(`  Prompt used   : ${r.prompt}`);
    console.log(`  Model ID      : ${r.model}`);
    console.log(`  HTTP Status   : ${r.httpStatus ?? "N/A"}`);
    console.log(`  Gen Time      : ${r.generationTime ? formatTime(r.generationTime) : "N/A"}`);
    console.log(`  Image Size    : ${r.imageSize ?? "N/A"}`);
    console.log(`  Image Bytes   : ${r.imageBytes ? r.imageBytes.toLocaleString() : "N/A"}`);
    console.log(`  Content-Type  : ${r.contentType ?? "N/A"}`);
    console.log(`  Saved Path    : ${r.savedPath ?? "not saved"}`);
    console.log(`  Status        : ${r.pass ? "✅ PASS" : "❌ FAIL"}`);
    if (r.error) console.log(`  Error         : ${r.error}`);
  }

  // Write JSON report
  const reportPath = join(OUTPUT_DIR || ".", "test-report.json");
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n  Full JSON report saved to: ${reportPath}`);
  console.log(sep("═"));

  // Exit code: 0 = all pass, 1 = any fail
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
