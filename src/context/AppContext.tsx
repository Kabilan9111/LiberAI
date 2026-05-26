"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Chat,
  MessageBlock,
  User,
  PersonalityMode,
  Language,
  PersonalitySettings,
  GeneratedImage,
  ImageStyle,
  AspectRatio,
  AIProvider,
} from "@/types";

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | undefined;
  isStreaming: boolean;
  isGeneratingImage: boolean;
  thinkingState: string | null;
  streamingChatId: string | null;
  streamingBlockId: string | null;
  personalityMode: PersonalityMode;
  language: Language;
  settings: PersonalitySettings;
  generatedImages: GeneratedImage[];
  selectedProvider: AIProvider;
  setSelectedProvider: (provider: AIProvider) => void;
  setPersonalityMode: (mode: PersonalityMode) => void;
  setLanguage: (lang: Language) => void;
  updateSettings: (settings: Partial<PersonalitySettings>) => void;
  startNewChat: () => string;
  deleteChat: (id: string) => void;
  selectChat: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteMessageBlock: (blockId: string) => void;
  generateImage: (prompt: string, style: ImageStyle, aspectRatio: AspectRatio) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getWelcomeMessage(mode: PersonalityMode): string {
  switch (mode) {
    case "study_coach":
      return "Hello. I am **Liber AI**, your structured study coach. Let's break down concepts step-by-step, review material, and test your understanding using clear outlines and bullet points. 📚";
    case "business":
      return "Welcome to Business Mode. I am **Liber AI**, your corporate strategy advisor and startup architect. Let's analyze metrics, develop growth plans, design pitch structures, and scale your operations. 💼";
    case "director":
      return "Action. I am **Liber AI** in Director Mode, your screenwriting and cinematic drama pacing partner. Let's write gripping screenplays, outline vivid character arcs, and build immersive cinematic worlds. 🎬";
    case "content_creator":
      return "Ready to create? I am **Liber AI**'s Content Creator Mode. Let's draft viral hooks, craft engaging copy, design magnetic headlines, and build high-performance content frameworks for any channel. 🚀";
    case "reality_engine":
      return "Initializing simulations. I am the **Reality Engine**. I analyze multi-scenario forecasting models, compute probabilistic risks, and structure base-case, optimistic, and pessimistic projections. Let's simulate your choices. 🌀";
    case "savage":
      return "Hey there. I am **Liber AI** in Savage Mode. Ready for some brutally honest, sarcastic, and hilarious replies? Let's see what you've got. 🔥";
    case "motivational":
      return "Welcome! I am **Liber AI**, your high-energy personal development and gym coach. Let's push you to succeed, set goals, and build unstoppable discipline today! 💪🔥";
    case "wild":
      return "Hello. I am **Liber AI**, your confident, emotionally intelligent, and charismatic partner. Let's explore deep, mature, relationship, or attraction conversations. No preachy limits, just real, mature connection. 👁️";
    default:
      return "Hello! I am **Liber AI**, your premium intelligent companion. I am ready to help you.";
  }
}

function createInitialWelcomeChat(mode: PersonalityMode, language: Language): Chat {
  const newId = `welcome-chat-${mode}-${Date.now()}`;
  let title = "Welcome Session";
  if (mode === "wild") title = "Wild Dialogue";
  else if (mode === "business") title = "Business Strategy";
  else if (mode === "director") title = "Director's Cut";
  else if (mode === "reality_engine") title = "Simulation Hub";

  return {
    id: newId,
    title,
    personalityMode: mode,
    language,
    createdAt: new Date(),
    messages: [
      {
        id: `welcome-msg-${mode}`,
        userMessage: "",
        assistantMessage: getWelcomeMessage(mode),
        timestamp: new Date(),
        personalityMode: mode,
      },
    ],
  };
}

function updateModeMemory(mode: PersonalityMode, userMsg: string, assistantMsg: string) {
  if (typeof window === "undefined") return;

  const storageKey = `liber_memory_${mode}`;
  let currentMemory = {
    relationship: "",
    goals: "",
    projects: "",
    historySummary: "",
  };

  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      currentMemory = { ...currentMemory, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 1. Goal heuristics
  const goalRegexes = [
    /(?:my goal is|i want to|trying to|planning to|i need to|aiming to)\s+([^.!?]+)/gi
  ];
  for (const regex of goalRegexes) {
    const match = regex.exec(userMsg);
    if (match && match[1]) {
      const extractedGoal = match[1].trim();
      currentMemory.goals = currentMemory.goals
        ? `${currentMemory.goals}; ${extractedGoal}`
        : extractedGoal;
    }
  }

  // 2. Project heuristics
  const projectRegexes = [
    /(?:i'm building|i'm working on|project is|developing a|coding a|my app is|my website is)\s+([^.!?]+)/gi
  ];
  for (const regex of projectRegexes) {
    const match = regex.exec(userMsg);
    if (match && match[1]) {
      const extractedProject = match[1].trim();
      currentMemory.projects = currentMemory.projects
        ? `${currentMemory.projects}; ${extractedProject}`
        : extractedProject;
    }
  }

  // 3. Relationship / preference heuristics
  const preferenceRegexes = [
    /(?:i prefer|i like|i don't like|i am a|i am an|my background is)\s+([^.!?]+)/gi
  ];
  for (const regex of preferenceRegexes) {
    const match = regex.exec(userMsg);
    if (match && match[1]) {
      const extractedPreference = match[1].trim();
      currentMemory.relationship = currentMemory.relationship
        ? `${currentMemory.relationship}; ${extractedPreference}`
        : extractedPreference;
    }
  }

  // Keep fields reasonably sized
  if (currentMemory.goals.length > 500) currentMemory.goals = currentMemory.goals.slice(-500);
  if (currentMemory.projects.length > 500) currentMemory.projects = currentMemory.projects.slice(-500);
  if (currentMemory.relationship.length > 500) currentMemory.relationship = currentMemory.relationship.slice(-500);

  // Maintain rolling exchange summary
  let rollingExchanges: { u: string; a: string }[] = [];
  const historyKey = `liber_history_rolling_${mode}`;
  const savedHistory = localStorage.getItem(historyKey);
  if (savedHistory) {
    try {
      rollingExchanges = JSON.parse(savedHistory);
    } catch (e) {}
  }

  // Add the new exchange
  rollingExchanges.push({
    u: userMsg.length > 100 ? userMsg.substring(0, 97) + "..." : userMsg,
    a: assistantMsg.length > 150 ? assistantMsg.substring(0, 147) + "..." : assistantMsg,
  });

  // Limit to last 5
  if (rollingExchanges.length > 5) {
    rollingExchanges = rollingExchanges.slice(-5);
  }

  localStorage.setItem(historyKey, JSON.stringify(rollingExchanges));

  // Build the history summary string
  currentMemory.historySummary = rollingExchanges
    .map((ex, idx) => `Exchange ${idx + 1}:\nUser: ${ex.u}\nAssistant: ${ex.a}`)
    .join("\n\n");

  localStorage.setItem(storageKey, JSON.stringify(currentMemory));
}

const INITIAL_SETTINGS: PersonalitySettings = {
  creativity: 75,
  humor: 50,
  formalCasual: 60,
  responsePreset: "balanced",
};

const DEFAULT_MOCK_IMAGES: GeneratedImage[] = [
  {
    id: "img-1",
    prompt: "Futuristic neon city with tall skyscrapers and flying vehicles in dark rain, cyberpunk style",
    url: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&auto=format&fit=crop&q=80",
    style: "cyberpunk",
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: "img-2",
    prompt: "A majestic fantasy castle perched on top of a glowing crystal mountain, ethereal sky",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    style: "fantasy",
    aspectRatio: "1:1",
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "img-3",
    prompt: "Cinematic portrait of a high-tech robotic companion in an abandoned forest, moody lighting",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    style: "cinematic",
    aspectRatio: "3:4",
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [thinkingState, setThinkingState] = useState<string | null>(null);
  const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
  const [streamingBlockId, setStreamingBlockId] = useState<string | null>(null);
  const [personalityMode, setPersonalityModeState] = useState<PersonalityMode>("wild");
  const [language, setLanguageState] = useState<Language>("english");
  const [settings, setSettings] = useState<PersonalitySettings>(INITIAL_SETTINGS);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>("auto");

  // Keep refs up-to-date to prevent stale closure issues in asynchronous callbacks
  const chatsRef = React.useRef<Chat[]>([]);
  const activeChatIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Load from localStorage on client render
  useEffect(() => {
    const savedUser = localStorage.getItem("liber_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedProvider = localStorage.getItem("liber_provider");
    if (savedProvider) {
      setSelectedProviderState(savedProvider as AIProvider);
    }

    let loadedChats: Chat[] = [];
    const savedChats = localStorage.getItem("liber_chats");
    if (savedChats) {
      try {
        loadedChats = JSON.parse(savedChats).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
      } catch (e) {
        console.error("Error parsing chats:", e);
      }
    }

    // Load active mode
    const savedMode = (localStorage.getItem("liber_active_mode") as PersonalityMode) || "wild";
    setPersonalityModeState(savedMode);

    // Load last active chat ID per mode dictionary
    const savedActiveDict = localStorage.getItem("liber_last_active_chat_ids");
    let activeDict: Record<PersonalityMode, string | null> = {
      wild: null,
      study_coach: null,
      business: null,
      director: null,
      content_creator: null,
      reality_engine: null,
      savage: null,
      motivational: null,
    };
    if (savedActiveDict) {
      try {
        activeDict = JSON.parse(savedActiveDict);
      } catch (e) {}
    }

    // Ensure there is at least one chat for the active mode
    const chatsForActiveMode = loadedChats.filter((c) => c.personalityMode === savedMode);
    let currentActiveId = activeDict[savedMode];

    if (chatsForActiveMode.length === 0) {
      const newWelcome = createInitialWelcomeChat(savedMode, "english");
      loadedChats.unshift(newWelcome);
      currentActiveId = newWelcome.id;
      activeDict[savedMode] = newWelcome.id;
    } else if (!currentActiveId || !chatsForActiveMode.some((c) => c.id === currentActiveId)) {
      currentActiveId = chatsForActiveMode[0].id;
      activeDict[savedMode] = currentActiveId;
    }

    setChats(loadedChats);
    setActiveChatId(currentActiveId);
    localStorage.setItem("liber_last_active_chat_ids", JSON.stringify(activeDict));
    localStorage.setItem("liber_chats", JSON.stringify(loadedChats));

    const savedImages = localStorage.getItem("liber_images");
    if (savedImages) {
      setGeneratedImages(
        JSON.parse(savedImages).map((img: any) => ({
          ...img,
          createdAt: new Date(img.createdAt),
        }))
      );
    } else {
      setGeneratedImages(DEFAULT_MOCK_IMAGES);
    }
  }, []);

  const saveChatsToStorage = (updatedChats: Chat[]) => {
    localStorage.setItem("liber_chats", JSON.stringify(updatedChats));
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser: User = {
      email,
      username: email.split("@")[0],
    };
    setUser(mockUser);
    localStorage.setItem("liber_user", JSON.stringify(mockUser));
    return true;
  };

  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const mockUser: User = { email, username };
    setUser(mockUser);
    localStorage.setItem("liber_user", JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("liber_user");
  };

  // Chat settings setters
  const setPersonalityMode = (mode: PersonalityMode) => {
    // 1. Get the current last active chat ID per mode dictionary
    const savedActiveDict = localStorage.getItem("liber_last_active_chat_ids");
    let activeDict: Record<PersonalityMode, string | null> = {
      wild: null,
      study_coach: null,
      business: null,
      director: null,
      content_creator: null,
      reality_engine: null,
      savage: null,
      motivational: null,
    };
    if (savedActiveDict) {
      try {
        activeDict = JSON.parse(savedActiveDict);
      } catch (e) {}
    }

    // 2. Save active chat ID for the current mode before switching
    if (activeChatId) {
      activeDict[personalityMode] = activeChatId;
    }

    // 3. Set the new mode state and persist active mode
    setPersonalityModeState(mode);
    localStorage.setItem("liber_active_mode", mode);

    // 4. Retrieve or initialize active chat ID for the destination mode
    let targetChatId = activeDict[mode];
    const chatsForNewMode = chats.filter((c) => c.personalityMode === mode);

    if (chatsForNewMode.length === 0) {
      const welcomeChat = createInitialWelcomeChat(mode, language);
      const updatedChats = [welcomeChat, ...chats];
      setChats(updatedChats);
      saveChatsToStorage(updatedChats);
      targetChatId = welcomeChat.id;
      activeDict[mode] = welcomeChat.id;
    } else if (!targetChatId || !chatsForNewMode.some((c) => c.id === targetChatId)) {
      targetChatId = chatsForNewMode[0].id;
      activeDict[mode] = targetChatId;
    }

    // 5. Update state and save dictionary
    setActiveChatId(targetChatId);
    localStorage.setItem("liber_last_active_chat_ids", JSON.stringify(activeDict));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (activeChatId) {
      const updated = chats.map((c) =>
        c.id === activeChatId ? { ...c, language: lang } : c
      );
      setChats(updated);
      saveChatsToStorage(updated);
    }
  };

  const updateSettings = (newSettings: Partial<PersonalitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setSelectedProvider = (provider: AIProvider) => {
    setSelectedProviderState(provider);
    localStorage.setItem("liber_provider", provider);
  };

  // Chat Management
  const startNewChat = (): string => {
    const newId = `chat-${Date.now()}`;
    let title = "New Dialogue";
    if (personalityMode === "wild") title = "Wild Dialogue";
    else if (personalityMode === "business") title = "Business Strategy";
    else if (personalityMode === "director") title = "Director's Cut";
    else if (personalityMode === "reality_engine") title = "Simulation Hub";

    const newChat: Chat = {
      id: newId,
      title,
      personalityMode,
      language,
      createdAt: new Date(),
      messages: [],
    };
    const updated = [newChat, ...chats];
    setChats(updated);
    setActiveChatId(newId);
    saveChatsToStorage(updated);

    const savedActiveDict = localStorage.getItem("liber_last_active_chat_ids");
    let activeDict: Record<PersonalityMode, string | null> = {
      wild: null,
      study_coach: null,
      business: null,
      director: null,
      content_creator: null,
      reality_engine: null,
      savage: null,
      motivational: null,
    };
    if (savedActiveDict) {
      try {
        activeDict = JSON.parse(savedActiveDict);
      } catch (e) {}
    }
    activeDict[personalityMode] = newId;
    localStorage.setItem("liber_last_active_chat_ids", JSON.stringify(activeDict));

    return newId;
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    saveChatsToStorage(updated);
    if (activeChatId === id) {
      const remainingForMode = updated.filter((c) => c.personalityMode === personalityMode);
      if (remainingForMode.length > 0) {
        setActiveChatId(remainingForMode[0].id);
      } else {
        // Create initial welcome chat for mode
        const welcomeChat = createInitialWelcomeChat(personalityMode, language);
        const newUpdated = [welcomeChat, ...updated];
        setChats(newUpdated);
        saveChatsToStorage(newUpdated);
        setActiveChatId(welcomeChat.id);
      }
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setLanguageState(chat.language);
      const savedActiveDict = localStorage.getItem("liber_last_active_chat_ids");
      let activeDict: Record<PersonalityMode, string | null> = {
        wild: null,
        study_coach: null,
        business: null,
        director: null,
        content_creator: null,
        reality_engine: null,
        savage: null,
        motivational: null,
      };
      if (savedActiveDict) {
        try {
          activeDict = JSON.parse(savedActiveDict);
        } catch (e) {}
      }
      activeDict[chat.personalityMode] = id;
      localStorage.setItem("liber_last_active_chat_ids", JSON.stringify(activeDict));
    }
  };

  // Send message calling Gemini API proxy endpoint
  const sendMessage = async (content: string) => {
    const targetChatId = activeChatId;
    if (!content.trim() || !targetChatId) return;

    // Stable tracking for this message block
    const blockId = `block-${Date.now()}`;
    const newBlock: MessageBlock = {
      id: blockId,
      userMessage: content,
      assistantMessage: "",
      timestamp: new Date(),
      personalityMode: personalityMode,
    };

    // Capture stable state configurations at the moment of send to prevent race conditions
    const targetPersonality = personalityMode;
    const targetLanguage = language;
    const targetSettings = settings;
    const targetProvider = selectedProvider;

    // Immediately update state functionally to append the block
    setChats((prevChats) => {
      const updated = prevChats.map((c) => {
        if (c.id === targetChatId) {
          const updatedMessages = [...c.messages, newBlock];
          let newTitle = c.title;
          if (c.title === "New Dialogue" && c.messages.length === 0) {
            newTitle = content.length > 25 ? content.substring(0, 22) + "..." : content;
          }
          return { ...c, title: newTitle, messages: updatedMessages };
        }
        return c;
      });
      localStorage.setItem("liber_chats", JSON.stringify(updated));
      return updated;
    });

    // Initialize stream and block status
    setIsStreaming(true);
    setStreamingChatId(targetChatId);
    setStreamingBlockId(blockId);

    const THINKING_LABELS = [
      "Thinking...",
      "Analyzing context...",
      "Generating response...",
      "Switching personality tone...",
      "Rendering reply..."
    ];

    // Start with a random thinking label
    setThinkingState(THINKING_LABELS[Math.floor(Math.random() * THINKING_LABELS.length)]);

    // Rotate thinking state twice
    let rotateCount = 0;
    const rotateInterval = setInterval(() => {
      rotateCount++;
      setThinkingState(THINKING_LABELS[Math.floor(Math.random() * THINKING_LABELS.length)]);

      if (rotateCount >= 3) {
        clearInterval(rotateInterval);
        setThinkingState(null);
        startStreaming();
      }
    }, 450);

    const startStreaming = async () => {
      console.log("=== Frontend sendMessage: Initiating fetch to /api/chat ===");
      
      // Get the absolute latest, non-stale chats array using our ref
      const latestChats = chatsRef.current;
      const latestChat = latestChats.find((c) => c.id === targetChatId);
      if (!latestChat) return;

      // Filter history: exclude the active block itself and any welcome messages, ensuring userMessage exists
      const history = latestChat.messages.filter(
        (m) => m.id !== blockId && !m.id.startsWith("welcome-") && m.userMessage
      );

      let memoryPayload = null;
      if (typeof window !== "undefined") {
        const savedMemory = localStorage.getItem(`liber_memory_${targetPersonality}`);
        if (savedMemory) {
          try {
            memoryPayload = JSON.parse(savedMemory);
          } catch (e) {}
        }
      }

      const payload = {
        message: content,
        history,
        personality: targetPersonality,
        language: targetLanguage,
        settings: targetSettings,
        provider: targetProvider,
        memory: memoryPayload,
      };
      console.log("Payload sent from frontend:", JSON.stringify(payload, null, 2));

      let currentText = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Frontend received fetch response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorMsg = await response.text();
          console.error("Frontend fetch response error content:", errorMsg);
          throw new Error("Failed to connect to AI route: " + errorMsg);
        }

        if (!response.body) {
          console.error("Frontend fetch response body is null.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        console.log("Starting stream read loop...");
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Frontend stream read loop done.");
            break;
          }

          const decodedValue = decoder.decode(value, { stream: true });
          currentText += decodedValue;

          // Stream directly into the specific block in the correct chat functionally
          setChats((prevChats) =>
            prevChats.map((c) =>
              c.id === targetChatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === blockId ? { ...m, assistantMessage: currentText } : m
                    ),
                  }
                : c
            )
          );
        }
      } catch (err: any) {
        console.error("AI stream error on frontend:", err);
        setChats((prevChats) =>
          prevChats.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === blockId
                      ? { ...m, assistantMessage: `Error: Failed to stream response. Detail: ${err.message}` }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsStreaming(false);
        setStreamingChatId(null);
        setStreamingBlockId(null);

        // Save complete chats list to storage functionally
        setChats((finalChats) => {
          localStorage.setItem("liber_chats", JSON.stringify(finalChats));
          return finalChats;
        });

        if (currentText.trim()) {
          updateModeMemory(targetPersonality, content, currentText);
        }
      }
    };
  };

  const deleteMessageBlock = (blockId: string) => {
    if (!activeChatId) return;
    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat) return;

    const updatedMessages = currentChat.messages.filter(m => m.id !== blockId);
    const updatedChats = chats.map(c =>
      c.id === activeChatId ? { ...c, messages: updatedMessages } : c
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  // Simulate Image Generation
  const generateImage = async (prompt: string, style: ImageStyle, aspectRatio: BaseAspectRatio) => {
    if (!prompt.trim()) return;

    setIsGeneratingImage(true);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds simulation

    // Dynamic mock images based on style
    const unsplashPics: Record<ImageStyle, string[]> = {
      cyberpunk: [
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
      ],
      anime: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&auto=format&fit=crop&q=80",
      ],
      cinematic: [
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
      ],
      fantasy: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&auto=format&fit=crop&q=80",
      ],
      realistic: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80",
      ],
      dark_mode: [
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80",
      ],
    };

    const options = unsplashPics[style] || unsplashPics.cyberpunk;
    const randomUrl = options[Math.floor(Math.random() * options.length)];

    const newImage: GeneratedImage = {
      id: `img-${Date.now()}`,
      prompt,
      url: randomUrl,
      style,
      aspectRatio,
      createdAt: new Date(),
    };

    const updated = [newImage, ...generatedImages];
    setGeneratedImages(updated);
    localStorage.setItem("liber_images", JSON.stringify(updated));
    setIsGeneratingImage(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        chats,
        activeChatId,
        activeChat,
        isStreaming,
        isGeneratingImage,
        thinkingState,
        streamingChatId,
        streamingBlockId,
        personalityMode,
        language,
        settings,
        generatedImages,
        selectedProvider,
        setSelectedProvider,
        setPersonalityMode,
        setLanguage,
        updateSettings,
        startNewChat,
        deleteChat,
        selectChat,
        sendMessage,
        deleteMessageBlock,
        generateImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
type BaseAspectRatio = AspectRatio;
