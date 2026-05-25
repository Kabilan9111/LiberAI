"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Chat,
  Message,
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
  generateImage: (prompt: string, style: ImageStyle, aspectRatio: AspectRatio) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  const [personalityMode, setPersonalityModeState] = useState<PersonalityMode>("chill");
  const [language, setLanguageState] = useState<Language>("english");
  const [settings, setSettings] = useState<PersonalitySettings>(INITIAL_SETTINGS);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>("auto");

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

    const savedChats = localStorage.getItem("liber_chats");
    if (savedChats) {
      // Parse dates back to Date objects
      const parsed = JSON.parse(savedChats).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
      }));
      setChats(parsed);
      if (parsed.length > 0) {
        setActiveChatId(parsed[0].id);
      }
    } else {
      // Create initial welcome chat
      const welcomeChatId = "welcome-chat";
      const welcomeChat: Chat = {
        id: welcomeChatId,
        title: "Introduction to Liber AI",
        personalityMode: "chill",
        language: "english",
        createdAt: new Date(),
        messages: [
          {
            id: "welcome-msg-1",
            role: "assistant",
            content: "Hello! I am **Liber AI**, your premium, multilingual intelligent companion. I am tuned to respond in various dialects, personalities, and styles. Feel free to switch my language or personality mode on the left sidebar to see how my tone adjusts!\n\nTo get started, try asking me a question or heading over to the **Image Studio** to generate stunning visuals.",
            timestamp: new Date(),
          },
        ],
      };
      setChats([welcomeChat]);
      setActiveChatId(welcomeChatId);
    }

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
    const isNewModeWild = mode === "wild";
    const isCurrentModeWild = personalityMode === "wild";

    if (isNewModeWild && !isCurrentModeWild) {
      // Switching from Standard to Wild
      if (activeChatId) {
        localStorage.setItem("liber_last_standard_chat_id", activeChatId);
      }
      
      const savedWildId = localStorage.getItem("liber_last_wild_chat_id");
      let targetWildChat = chats.find(c => c.id === savedWildId && c.personalityMode === "wild");
      
      if (!targetWildChat) {
        targetWildChat = chats.find(c => c.personalityMode === "wild");
      }
      
      if (targetWildChat) {
        setActiveChatId(targetWildChat.id);
        setPersonalityModeState("wild");
      } else {
        const newId = `chat-wild-${Date.now()}`;
        const newChat: Chat = {
          id: newId,
          title: "Wild Dialogue",
          personalityMode: "wild",
          language,
          createdAt: new Date(),
          messages: [],
        };
        const updated = [newChat, ...chats];
        setChats(updated);
        setActiveChatId(newId);
        setPersonalityModeState("wild");
        saveChatsToStorage(updated);
        localStorage.setItem("liber_last_wild_chat_id", newId);
      }
    } else if (!isNewModeWild && isCurrentModeWild) {
      // Switching from Wild to Standard
      if (activeChatId) {
        localStorage.setItem("liber_last_wild_chat_id", activeChatId);
      }
      
      const savedStandardId = localStorage.getItem("liber_last_standard_chat_id");
      let targetStandardChat = chats.find(c => c.id === savedStandardId && c.personalityMode !== "wild");
      
      if (!targetStandardChat) {
        targetStandardChat = chats.find(c => c.personalityMode !== "wild");
      }
      
      if (targetStandardChat) {
        setActiveChatId(targetStandardChat.id);
        setPersonalityModeState(mode);
        const updated = chats.map(c => 
          c.id === targetStandardChat!.id ? { ...c, personalityMode: mode } : c
        );
        setChats(updated);
        saveChatsToStorage(updated);
      } else {
        const newId = `chat-std-${Date.now()}`;
        const newChat: Chat = {
          id: newId,
          title: "New Dialogue",
          personalityMode: mode,
          language,
          createdAt: new Date(),
          messages: [],
        };
        const updated = [newChat, ...chats];
        setChats(updated);
        setActiveChatId(newId);
        setPersonalityModeState(mode);
        saveChatsToStorage(updated);
        localStorage.setItem("liber_last_standard_chat_id", newId);
      }
    } else {
      // Standard to Standard or Wild to Wild
      setPersonalityModeState(mode);
      if (activeChatId) {
        const updated = chats.map((c) =>
          c.id === activeChatId ? { ...c, personalityMode: mode } : c
        );
        setChats(updated);
        saveChatsToStorage(updated);
        if (!isNewModeWild) {
          localStorage.setItem("liber_last_standard_chat_id", activeChatId);
        } else {
          localStorage.setItem("liber_last_wild_chat_id", activeChatId);
        }
      }
    }
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
    const newChat: Chat = {
      id: newId,
      title: personalityMode === "wild" ? "Wild Dialogue" : "New Dialogue",
      personalityMode,
      language,
      createdAt: new Date(),
      messages: [],
    };
    const updated = [newChat, ...chats];
    setChats(updated);
    setActiveChatId(newId);
    saveChatsToStorage(updated);

    if (personalityMode === "wild") {
      localStorage.setItem("liber_last_wild_chat_id", newId);
    } else {
      localStorage.setItem("liber_last_standard_chat_id", newId);
    }

    return newId;
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    saveChatsToStorage(updated);
    if (activeChatId === id) {
      if (updated.length > 0) {
        setActiveChatId(updated[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setPersonalityModeState(chat.personalityMode);
      setLanguageState(chat.language);
      if (chat.personalityMode === "wild") {
        localStorage.setItem("liber_last_wild_chat_id", id);
      } else {
        localStorage.setItem("liber_last_standard_chat_id", id);
      }
    }
  };

  // Send message calling Gemini API proxy endpoint
  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeChatId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Update messages local state
    const currentChat = chats.find((c) => c.id === activeChatId);
    if (!currentChat) return;

    const updatedMessages = [...currentChat.messages, userMessage];

    // Auto-update title if it was the first message or "New Dialogue"
    let newTitle = currentChat.title;
    if (currentChat.title === "New Dialogue" && currentChat.messages.length === 0) {
      newTitle = content.length > 25 ? content.substring(0, 22) + "..." : content;
    }

    const updatedChats = chats.map((c) =>
      c.id === activeChatId ? { ...c, title: newTitle, messages: updatedMessages } : c
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);

    // AI response thinking state sequence
    setIsStreaming(true);

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
      // Add temporary empty assistant message for streaming
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const tempAssistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === activeChatId
            ? { ...c, title: newTitle, messages: [...c.messages, tempAssistantMessage] }
            : c
        )
      );

      console.log("=== Frontend sendMessage: Initiating fetch to /api/chat ===");
      const payload = {
        message: content,
        history: currentChat.messages.filter(m => !m.id.startsWith("welcome-")),
        personality: personalityMode,
        language,
        settings,
        provider: selectedProvider,
      };
      console.log("Payload sent from frontend:", JSON.stringify(payload, null, 2));

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
        let currentText = "";

        console.log("Starting stream read loop...");
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Frontend stream read loop done.");
            break;
          }

          const decodedValue = decoder.decode(value, { stream: true });
          console.log("Frontend read chunk value:", JSON.stringify(decodedValue));
          currentText += decodedValue;

          setChats((prevChats) =>
            prevChats.map((c) =>
              c.id === activeChatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: currentText } : m
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
            c.id === activeChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: `Error: Failed to stream response from Gemini Core. Detail: ${err.message}` }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsStreaming(false);

        // Save actual complete chats list to storage
        setChats((finalChats) => {
          saveChatsToStorage(finalChats);
          return finalChats;
        });
      }
    };
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
