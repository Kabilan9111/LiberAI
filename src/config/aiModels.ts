import { AIProvider } from "@/types";

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

export const PERSONALITY_TO_PROFILE: Record<string, keyof typeof AI_MODELS> = {
  chill: "fast",
  savage: "premium",
  romantic: "premium",
  motivational: "premium",
  study_coach: "smart",
  tamil_local: "fast",
  wild: "wild",
};

export interface WildModelInfo {
  name: string;
  openRouterModel: string;
  togetherModel: string;
  description: string;
}

export const WILD_MODE_MODELS: WildModelInfo[] = [
  {
    name: "Nous Hermes",
    openRouterModel: "nousresearch/nous-hermes-2-mixtral",
    togetherModel: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    description: "Balanced conversations"
  },
  {
    name: "Dolphin Mixtral",
    openRouterModel: "cognitivecomputations/dolphin-mixtral-8x7b",
    togetherModel: "cognitivecomputations/dolphin-2.5-mixtral-8x7b",
    description: "Savage/confident tone"
  },
  {
    name: "DeepSeek",
    openRouterModel: "deepseek/deepseek-chat",
    togetherModel: "deepseek-ai/DeepSeek-V3",
    description: "Intelligent deep reasoning"
  },
  {
    name: "MythoMax",
    openRouterModel: "gryphe/mythomax-l2-13b",
    togetherModel: "Gryphe/MythoMax-L2-13b",
    description: "Emotional conversations"
  },
  {
    name: "Llama 3",
    openRouterModel: "meta-llama/llama-3-8b-instruct",
    togetherModel: "meta-llama/Meta-Llama-3-8B-Instruct",
    description: "Expressive and direct conversations"
  },
  {
    name: "Mistral",
    openRouterModel: "mistralai/mistral-7b-instruct",
    togetherModel: "mistralai/Mistral-7B-Instruct-v0.2",
    description: "Fluid chat and storytelling"
  }
];

/**
 * Classifies user prompt and returns the designated model string for the active provider.
 */
export function selectWildModel(message: string, provider: "openrouter" | "together" | string): string {
  const msg = message.toLowerCase();
  
  // Keywords classification
  const emotionalKeywords = [
    "feel", "love", "sad", "lonely", "depress", "emotion", "cry", "heart", "scared", "afraid", 
    "anxious", "trust", "relationship", "intimate", "girlfriend", "boyfriend", "romance", "warmth", 
    "hug", "comfort", "support", "marriage", "breakup", "kiss", "dating", "date", "feeling"
  ];
  
  const savageKeywords = [
    "savage", "roast", "burn", "insult", "funny", "laugh", "joke", "tease", "flirt", "confident", 
    "sarcasm", "sarcastic", "witty", "bold", "dare", "brutal", "insult", "mock"
  ];
  
  const deepKeywords = [
    "solve", "code", "explain", "reason", "math", "science", "algorithm", "analyze", "debug", 
    "logic", "why", "how to", "program", "architecture", "develop", "quantum", "physics"
  ];
  
  const mistralKeywords = [
    "creative", "story", "write", "poem", "novel", "roleplay", "imagine", "essay", "lyrics"
  ];

  let selectedModelName = "Nous Hermes"; // default

  if (emotionalKeywords.some(kw => msg.includes(kw))) {
    selectedModelName = "MythoMax";
  } else if (savageKeywords.some(kw => msg.includes(kw))) {
    selectedModelName = "Dolphin Mixtral";
  } else if (deepKeywords.some(kw => msg.includes(kw))) {
    selectedModelName = "DeepSeek";
  } else if (mistralKeywords.some(kw => msg.includes(kw))) {
    selectedModelName = "Mistral";
  } else if (msg.includes("llama")) {
    selectedModelName = "Llama 3";
  }

  // Get matching model config
  const modelInfo = WILD_MODE_MODELS.find(m => m.name === selectedModelName) || WILD_MODE_MODELS[0];
  
  return provider === "together" ? modelInfo.togetherModel : modelInfo.openRouterModel;
}
