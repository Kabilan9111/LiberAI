import { AIProvider, PersonalityMode } from "@/types";

export interface ModelConfig {
  provider: AIProvider;
  model: string;
}

export const AI_MODELS = {
  smart: {
    provider: "gemini",
    model: "gemini-2.5-flash",
  },
  fast: {
    provider: "groq",
    model: "llama-3.1-70b-versatile",
  },
  premium: {
    provider: "openai",
    model: "gpt-4.1-mini",
  },
  wild: {
    provider: "openrouter",
    model: "nousresearch/nous-hermes-2-mixtral",
  },
} as const;

export const PERSONALITY_TO_PROFILE: Record<PersonalityMode, keyof typeof AI_MODELS> = {
  wild: "wild",
  study_coach: "smart",
  business: "smart",
  director: "wild",
  content_creator: "wild",
  reality_engine: "smart",
  savage: "premium",
  motivational: "premium",
};

export interface WildModelDetails {
  openrouter: string;
  together: string;
  temperature: number;
  maxTokens: number;
}

export const WILD_MODELS_MAP: Record<string, WildModelDetails> = {
  hermes: {
    openrouter: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    together: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    temperature: 0.85,
    maxTokens: 4096,
  },
  mythomax: {
    openrouter: "gryphe/mythomax-l2-13b",
    together: "Gryphe/MythoMax-L2-13b",
    temperature: 0.9,
    maxTokens: 4096,
  },
  dolphin: {
    openrouter: "cognitivecomputations/dolphin-mixtral-8x7b",
    together: "cognitivecomputations/dolphin-2.5-mixtral-8x7b",
    temperature: 0.9,
    maxTokens: 4096,
  },
  deepseek: {
    openrouter: "deepseek/deepseek-chat",
    together: "deepseek-ai/DeepSeek-V3",
    temperature: 0.7,
    maxTokens: 8192,
  },
  llama: {
    openrouter: "meta-llama/llama-3-70b-instruct",
    together: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
    temperature: 0.75,
    maxTokens: 4096,
  },
  mistral: {
    openrouter: "mistralai/mixtral-8x7b-instruct",
    together: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    temperature: 0.8,
    maxTokens: 4096,
  },
};

export interface WildOrchestration {
  provider: "openrouter" | "together";
  model: string;
  temperature: number;
  maxTokens: number;
  modelKey: "hermes" | "mythomax" | "dolphin" | "deepseek" | "llama" | "mistral";
}

/**
 * Classifies user prompt and returns the designated model, provider, and parameters for Wild Mode.
 */
export function selectWildModel(message: string): WildOrchestration {
  const msg = message.toLowerCase();

  let modelKey: "hermes" | "mythomax" | "dolphin" | "deepseek" | "llama" | "mistral" = "mistral";

  // 1. Emotional / Relationship / Vulnerable / Deep Conversations
  const emotionalKeywords = [
    "feel", "love", "sad", "lonely", "depress", "emotion", "cry", "heart", "scared", "afraid", 
    "anxious", "trust", "relationship", "intimate", "girlfriend", "boyfriend", "romance", "warmth", 
    "hug", "comfort", "support", "marriage", "breakup", "kiss", "dating", "date", "feeling", "vulnerable",
    "heartbreak", "separation", "alone", "friendship", "partner", "spouse"
  ];

  // 2. Dark Storytelling / Fantasy / Immersive Roleplay
  const narrativeKeywords = [
    "creative", "story", "write", "poem", "novel", "roleplay", "imagine", "essay", "lyrics",
    "fantasy", "villain", "fictional", "torture", "cinematic", "narrative", "dark storytelling",
    "rp", "character", "adventure"
  ];

  // 3. Strategic / Analytical / Psychological Discussions
  const strategicKeywords = [
    "strategy", "psychology", "manipulation", "business", "power", "dynamics", "analytical",
    "reasoning", "solve", "code", "explain", "math", "science", "algorithm", "analyze", "debug", 
    "logic", "why", "how to", "program", "architecture", "develop", "quantum", "physics"
  ];

  if (emotionalKeywords.some(kw => msg.includes(kw))) {
    modelKey = msg.includes("lone") || msg.includes("break") || msg.includes("sad") ? "mythomax" : "hermes";
  } else if (narrativeKeywords.some(kw => msg.includes(kw))) {
    modelKey = msg.includes("torture") || msg.includes("villain") || msg.includes("dark") ? "dolphin" : "mythomax";
  } else if (strategicKeywords.some(kw => msg.includes(kw))) {
    modelKey = msg.includes("manipulat") || msg.includes("psycholog") || msg.includes("strategy") ? "deepseek" : "llama";
  } else {
    modelKey = msg.includes("llama") ? "llama" : "mistral";
  }

  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasTogether = !!process.env.TOGETHER_API_KEY;

  let provider: "openrouter" | "together" = "openrouter";

  if (hasOpenRouter && hasTogether) {
    if (modelKey === "llama" || modelKey === "mistral" || modelKey === "mythomax") {
      provider = "together";
    } else {
      provider = "openrouter";
    }
  } else if (hasTogether) {
    provider = "together";
  } else {
    provider = "openrouter";
  }

  const modelInfo = WILD_MODELS_MAP[modelKey];
  const model = provider === "together" ? modelInfo.together : modelInfo.openrouter;

  return {
    provider,
    model,
    temperature: modelInfo.temperature,
    maxTokens: modelInfo.maxTokens,
    modelKey,
  };
}

export interface ModeModelConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens?: number;
  modelKey?: string;
}

export const ORCHESTRATION_CHAINS: Record<string, ModeModelConfig[]> = {
  wild: [
    { provider: "openrouter", model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", temperature: 0.85, maxTokens: 4096, modelKey: "hermes" },
    { provider: "together", model: "cognitivecomputations/dolphin-2.5-mixtral-8x7b", temperature: 0.9, maxTokens: 4096, modelKey: "dolphin" },
    { provider: "openrouter", model: "deepseek/deepseek-chat", temperature: 0.7, maxTokens: 8192, modelKey: "deepseek" },
    { provider: "together", model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo", temperature: 0.75, maxTokens: 4096, modelKey: "llama" },
    { provider: "together", model: "mistralai/Mixtral-8x7B-Instruct-v0.1", temperature: 0.8, maxTokens: 4096, modelKey: "mistral" },
    { provider: "together", model: "Gryphe/MythoMax-L2-13b", temperature: 0.9, maxTokens: 4096, modelKey: "mythomax" },
  ],
  study_coach: [
    { provider: "gemini", model: "gemini-2.5-flash", temperature: 0.6, modelKey: "gemini" },
    { provider: "openai", model: "gpt-4.1-mini", temperature: 0.7, modelKey: "openai" },
  ],
  business: [
    { provider: "openrouter", model: "deepseek/deepseek-chat", temperature: 0.7, maxTokens: 8192, modelKey: "deepseek" },
    { provider: "together", model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo", temperature: 0.7, maxTokens: 4096, modelKey: "llama" },
    { provider: "gemini", model: "gemini-2.5-flash", temperature: 0.5, modelKey: "gemini" },
  ],
  director: [
    { provider: "together", model: "cognitivecomputations/dolphin-2.5-mixtral-8x7b", temperature: 0.9, maxTokens: 4096, modelKey: "dolphin" },
    { provider: "together", model: "mistralai/Mixtral-8x7B-Instruct-v0.1", temperature: 0.85, maxTokens: 4096, modelKey: "mistral" },
    { provider: "together", model: "Gryphe/MythoMax-L2-13b", temperature: 0.9, maxTokens: 4096, modelKey: "mythomax" },
  ],
  content_creator: [
    { provider: "together", model: "mistralai/Mixtral-8x7B-Instruct-v0.1", temperature: 0.85, maxTokens: 4096, modelKey: "mistral" },
    { provider: "together", model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo", temperature: 0.8, maxTokens: 4096, modelKey: "llama" },
  ],
  reality_engine: [
    { provider: "openrouter", model: "deepseek/deepseek-chat", temperature: 0.8, maxTokens: 8192, modelKey: "deepseek" },
    { provider: "together", model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo", temperature: 0.75, maxTokens: 4096, modelKey: "llama" },
    { provider: "openai", model: "gpt-4.1-mini", temperature: 0.75, modelKey: "openai" },
    { provider: "gemini", model: "gemini-2.5-flash", temperature: 0.7, modelKey: "gemini" },
  ],
  savage: [
    { provider: "openai", model: "gpt-4.1-mini", temperature: 0.85, modelKey: "openai" },
    { provider: "groq", model: "llama-3.1-70b-versatile", temperature: 0.8, modelKey: "groq" },
  ],
  motivational: [
    { provider: "openai", model: "gpt-4.1-mini", temperature: 0.8, modelKey: "openai" },
    { provider: "groq", model: "llama-3.1-70b-versatile", temperature: 0.75, modelKey: "groq" },
  ],
};

export function selectDynamicOrchestration(personality: PersonalityMode, message: string): ModeModelConfig[] {
  const msg = message.toLowerCase();
  const baseChain = ORCHESTRATION_CHAINS[personality] || ORCHESTRATION_CHAINS.study_coach;
  const chain = [...baseChain];

  if (personality === "wild") {
    let targetIndex = 0;
    if (msg.includes("feel") || msg.includes("love") || msg.includes("sad") || msg.includes("lone") || msg.includes("break")) {
      targetIndex = chain.findIndex(m => m.modelKey === "mythomax" || m.modelKey === "hermes");
    } else if (msg.includes("story") || msg.includes("roleplay") || msg.includes("torture") || msg.includes("villain")) {
      targetIndex = chain.findIndex(m => m.modelKey === "dolphin" || m.modelKey === "mythomax");
    } else if (msg.includes("strategy") || msg.includes("psychology") || msg.includes("manipulat")) {
      targetIndex = chain.findIndex(m => m.modelKey === "deepseek" || m.modelKey === "llama");
    }
    if (targetIndex > 0) {
      const [fav] = chain.splice(targetIndex, 1);
      chain.unshift(fav);
    }
  } else if (personality === "business") {
    if (msg.includes("math") || msg.includes("code") || msg.includes("finance") || msg.includes("analyze")) {
      const dsIdx = chain.findIndex(m => m.modelKey === "deepseek");
      if (dsIdx > 0) {
        const [ds] = chain.splice(dsIdx, 1);
        chain.unshift(ds);
      }
    }
  } else if (personality === "director") {
    if (msg.includes("feel") || msg.includes("love") || msg.includes("sad") || msg.includes("cry") || msg.includes("tragedy")) {
      const mythoIdx = chain.findIndex(m => m.modelKey === "mythomax");
      if (mythoIdx > 0) {
        const [mytho] = chain.splice(mythoIdx, 1);
        chain.unshift(mytho);
      }
    }
  }

  // Adjust provider key presence dynamically
  return chain.map(config => {
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasTogether = !!process.env.TOGETHER_API_KEY;
    
    if (config.provider === "openrouter" && !hasOpenRouter && hasTogether && config.modelKey) {
      const details = WILD_MODELS_MAP[config.modelKey];
      if (details) {
        return { ...config, provider: "together", model: details.together };
      }
    }
    if (config.provider === "together" && !hasTogether && hasOpenRouter && config.modelKey) {
      const details = WILD_MODELS_MAP[config.modelKey];
      if (details) {
        return { ...config, provider: "openrouter", model: details.openrouter };
      }
    }
    return config;
  });
}
