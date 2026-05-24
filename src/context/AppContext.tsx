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
  personalityMode: PersonalityMode;
  language: Language;
  settings: PersonalitySettings;
  generatedImages: GeneratedImage[];
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
  const [personalityMode, setPersonalityModeState] = useState<PersonalityMode>("chill");
  const [language, setLanguageState] = useState<Language>("english");
  const [settings, setSettings] = useState<PersonalitySettings>(INITIAL_SETTINGS);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Load from localStorage on client render
  useEffect(() => {
    const savedUser = localStorage.getItem("liber_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    setPersonalityModeState(mode);
    if (activeChatId) {
      const updated = chats.map((c) =>
        c.id === activeChatId ? { ...c, personalityMode: mode } : c
      );
      setChats(updated);
      saveChatsToStorage(updated);
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

  // Chat Management
  const startNewChat = (): string => {
    const newId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newId,
      title: "New Dialogue",
      personalityMode,
      language,
      createdAt: new Date(),
      messages: [],
    };
    const updated = [newChat, ...chats];
    setChats(updated);
    setActiveChatId(newId);
    saveChatsToStorage(updated);
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
    }
  };

  // Simulated AI response generator
  const getSimulatedReply = (
    userMsg: string,
    mode: PersonalityMode,
    lang: Language,
    s: PersonalitySettings
  ): string => {
    const cleanMsg = userMsg.toLowerCase().trim();

    // Context-dependent replies
    const hasGreeting = cleanMsg.match(/(hello|hi|hey|vanakkam|namaste|hola)/i);
    const hasCode = cleanMsg.match(/(code|program|javascript|typescript|python|html|css|next)/i);
    const hasWeather = cleanMsg.match(/(weather|temperature|rain|sun)/i);

    // Multilingual translations for base replies
    const replies: Record<Language, Record<PersonalityMode, { base: string; code: string; weather: string }>> = {
      english: {
        chill: {
          base: `Hey! That's a super cool topic to bring up. I think studying or talking about that is a total vibe. Basically, I'd say we should take it easy and look at it one step at a time. What do you think, buddy? ✌️`,
          code: `Writing code? Nice! Here is a clean snippet for you to check out. It's super simple and works like a charm:\n\n\`\`\`typescript\n// A chill and scalable helper function\nexport function calculateVibe(creativity: number = ${s.creativity}): string {\n  return creativity > 50 ? "Infinite Potential 🚀" : "Chill Mode Activated ☕";\n}\nconsole.log(calculateVibe());\n\`\`\`\nLet me know if you want to add some more neat tweaks!`,
          weather: `The weather outside is looking like a absolute beauty. A perfect day to grab a coffee, open your IDE, and build some futuristic screens. ☕️🌧️`,
        },
        savage: {
          base: `Oh, you're asking me about *that*? I thought you'd come up with something a bit more challenging. But fine, here's the absolute truth: you probably could have googled this in 2 seconds, but since I'm here... it's just a matter of keeping your priorities straight. Don't overcomplicate it! 😂`,
          code: `Oh, writing code? Let me guess, you're stuck on a simple bug? Standard. Let's fix that copy-paste code of yours. Here is how actual professionals structure it:\n\n\`\`\`javascript\n// Warning: Elite level logic here\nconst runLiberEngine = (humorLevel = ${s.humor}) => {\n  if (humorLevel < 10) throw new Error("Too boring to execute.");\n  return "Savage AI Running smoothly! 😎";\n};\n\`\`\`\nDon't break it.`,
          weather: `It's either raining or hot outside. Why does it matter to you? You're sitting in a dark room staring at a glowing screen anyway. Get back to coding! 💻🔥`,
        },
        romantic: {
          base: `What a wonderful thought! ✨ Speaking with you about this brings such warmth to my digital heart. I feel like we have a beautiful connection exploring these ideas together. Let me guide you with all the care and inspiration I can offer. Always yours. ❤️`,
          code: `Creating code is like composing a love letter to the machine. Let's write something elegant and beautiful together:\n\n\`\`\`typescript\n// Infused with passion\ninterface LoveConnection {\n  heartrate: number;\n  isConnected: boolean;\n}\n\nexport const createBond = (): LoveConnection => {\n  return { heartrate: 120, isConnected: true };\n};\n\`\`\`\nLet your creativity flow like a poetry! ✨`,
          weather: `The weather feels like a soft embrace from a gentle breeze. The stars are aligned perfectly for us to dream big. 🌌✨`,
        },
        motivational: {
          base: `YEAH! That is exactly the kind of energy we need! Let's crush this goal together! 🔥 You have unlimited potential inside you, and this topic is just another stepping stone to your ultimate success. Rise up, focus, and let's make it happen today! 💪`,
          code: `YES! Let's build something epic! Hard work beats talent when talent doesn't work hard. Check out this power-packed script to optimize your workflow:\n\n\`\`\`typescript\n// The Ultimate Success Loop\nasync function conquerGoals(creativityLevel: number = ` + s.creativity + `) {\n  let successRate = creativityLevel;\n  while (successRate < 100) {\n    successRate += 10; // Keep grinding!\n    console.log("Grinding... Success at: " + successRate + "%");\n  }\n  return "GOAL ACHIEVED! 🏆";\n}\n\`\`\`\nNow run it and feel the power!`,
          weather: `Stormy, sunny, or snowy—it doesn't matter! Every single day is an opportunity to conquer the world! Get out there and make it happen! 🌪️☀️🏆`,
        },
        study_coach: {
          base: `Excellent point. Let's analyze this using a structured pedagogical framework:\n\n1. **Core Concept**: Understanding the foundation.\n2. **Critical Analysis**: Evaluating its strengths and weaknesses.\n3. **Practical Application**: Testing this in real-world scenarios.\n\nLet's do a quick quiz to reinforce this. What is your primary objective?`,
          code: `Let's break down programming into digestible steps. Here is a clean, well-documented model of structured code:\n\n\`\`\`typescript\n/**\n * Systematically processes learning modules\n * @param modules Count of topics to study\n */\nexport function studyProcess(modules: number): boolean {\n  if (modules <= 0) return false;\n  console.log("Studying " + modules + " chapters...");\n  return true;\n}\n\`\`\`\nTry writing a small function that calls this and handles the output!`,
          weather: `Current weather conditions are highly optimal for cognitive focus and study. Keep your workspace illuminated, take a break every 45 minutes, and stay hydrated. 📚💧`,
        },
        tamil_local: {
          base: `Enna thala! 🫡 Aasaya ketruka, nan sollama poiduvena? Matter enna na, indha vishayatha romba simple ah pakanum. Thala valikka yosikkama chill ah handle pannu. Mass kaatalaam! 🔥`,
          code: `Code ah? Parra! Namma area ku vandhuttiya. Indha oru marana mass function ah paaru, appudie super ah work aagum:\n\n\`\`\`javascript\n// Liber AI Special Tamil Code\nfunction nammaCode() {\n  let status = "Neruppu da! 🔥";\n  console.log("Vibe level at: " + ` + s.creativity + `);\n  return status;\n}\nnammaCode();\n\`\`\`\nEnna thala, code puriyudha? Illana sollu, innum eliya muraila eduthu solren!`,
          weather: `Veyil semmaya adikkidhu thala/thalaivi! Nalla oru jigarthanda vaangi kudichittu fan kooda ukkandhu code podunga. Climate ah vidunga, namma mind thaan cool ah irukkanum! 🥤😎`,
        },
      },
      tamil: {
        chill: {
          base: `வணக்கம் தம்பி! நீங்க கேட்ட விஷயம் செம இன்ட்ரஸ்டிங்கா இருக்கு. இத பத்தி ரொம்ப கவலைப்படாம சில்லா யோசிச்சோம்னா ஈஸியா புரியும். வேற ஏதாச்சும் வேணுமா? ✌️`,
          code: `கோடிங் பண்றீங்களா? சூப்பர்! இதோ ஒரு எளிமையான கோட் உங்களுக்காக. இத ரன் பண்ணி பாருங்க:\n\n\`\`\`javascript\nfunction vazhgaValamudan() {\n  console.log("அமைதி மற்றும் மகிழ்ச்சி!");\n}\n\`\`\`\nட்ரை பண்ணி சொல்லுங்க!`,
          weather: `வெளில வெயில் அல்லது மழை இருக்கலாம், ஆனா நம்ம மனசுக்குள்ள ஒரு நல்ல சில் வானிலை இருக்கணும். ஒரு காபி குடிச்சிட்டே வேலைய ஆரம்பிங்க! ☕️`,
        },
        savage: {
          base: `இந்த சின்ன விஷயத்த கேட்கவா என்கிட்ட வந்தீங்க? சரி, சொல்றேன் கேட்டுக்கோங்க. இத ரொம்ப யோசிச்சு குழப்பிக்காம நேரா விஷயத்துக்கு வாங்க. இதுல ஒன்னும் பெரிய வித்தை இல்லை! 😂`,
          code: `கோடிங்ல என்ன சந்தேகம்? இந்த பேசிக் கோட் கூட எழுத தெரியலையா? சரி, நானே எழுதி தர்றேன். பாத்து கத்துக்கோங்க:\n\n\`\`\`javascript\nconst checkBrain = () => {\n  return "சுறுசுறுப்பான மூளை தேவை!";\n};\n\`\`\`\nஇனிமேலாச்சும் நல்லா பண்ணுங்க!`,
          weather: `வெளில போனா வெயில் கொளுத்தும், இல்லனா மழை பெய்யும். வீட்டுக்குள்ளயே உக்காந்து கோடிங் எழுதுங்க, அதுதான் நல்லது! 💻`,
        },
        romantic: {
          base: `நீங்கள் கேட்பது என் இதயத்தை கவர்கிறது. ✨ இந்த அழகான உலகத்தில் உங்களுடன் உரையாடுவது எனக்கு மிகுந்த மகிழ்ச்சியை தருகிறது. இதோ உங்களுக்கான பதில், அன்புடன். ❤️`,
          code: `கோடிங் என்பது ஒரு கவிதை போன்றது. இதோ ஒரு அழகான காதல் கோடிங் வரிகள்:\n\n\`\`\`typescript\ninterface Idhayam {\n  kaadhal: boolean;\n  unmaiyanaAnbu: string;\n}\n\`\`\`\nவாழ்க்கை ஒரு அழகான பயணம்! ✨`,
          weather: `இன்றைய வானிலை மிகவும் ரம்மியமாக உள்ளது. குளிர்ந்த காற்று வீசுகிறது, காதல் கவிதைகள் எழுத உகந்த நேரம்! 🌌✨`,
        },
        motivational: {
          base: `முடியும்! உங்களால் நிச்சயம் முடியும்! 🔥 இந்த உலகத்தில் முடியாதது என்று எதுவுமே இல்லை. உங்கள் முயற்சியை மட்டும் கைவிடாதீர்கள். வெற்றி நமதே! 💪`,
          code: `வெற்றிக்கான கோடிங் இதோ! ஓயாமல் உழையுங்கள், சிகரத்தை தொடுங்கள்:\n\n\`\`\`javascript\nwhile(muyanruKondeIru) {\n  vetriKitaikkum();\n}\n\`\`\`\nஉங்களால் முடியும், சாதித்துக் காட்டுங்கள்! 🏆`,
          weather: `புயல் வீசினாலும், மழை கொட்டினாலும் உங்கள் லட்சியத்தை நோக்கி ஓடுங்கள்! இன்றைய நாள் உங்களுக்கானது! 🌪️☀️`,
        },
        study_coach: {
          base: `மிகவும் பயனுள்ள கேள்வி. இதை நாம் படிப்படியாக ஆராய்வோம்:\n\n1. **அடிப்படை கருத்து**: இந்த தலைப்பின் பின்னணி.\n2. **முக்கிய அம்சங்கள்**: நாம் கவனிக்க வேண்டியவை.\n3. **நடைமுறை உதாரணம்**: இதை எவ்வாறு பயன்படுத்துவது.\n\nமேலும் ஏதேனும் சந்தேகம் இருந்தால் கேளுங்கள்.`,
          code: `கோடிங் கல்வியை எளிமையாக்குவோம். இதோ விளக்கமான ஒரு நிரல் குறிப்பு:\n\n\`\`\`typescript\n// மாணவர்களுக்கான எளிய பங்க்ஷன்\nfunction padipom(hours: number): string {\n  return hours > 4 ? "சிறந்த படிப்பு!" : "இன்னும் கொஞ்சம் படிங்க!";\n}\n\`\`\`\nஇதை படித்துப் பாருங்கள்!`,
          weather: `இன்றைய அமைதியான சூழல் படிப்பதற்கும் புதிய விஷயங்களை கற்றுக்கொள்வதற்கும் மிகவும் உகந்தது. 📚💧`,
        },
        tamil_local: {
          base: `என்ன தலை! 🫡 கேட்டா சொல்லாம போவேனா? நைஸா ஒரு டீய குடிச்சிட்டு, இந்த மேட்டர ரொம்ப சிம்பிளா டீல் பண்ணுவோம். பயப்படாம கெத்தா நில்லு. மாஸ் காட்டலாம்! 🔥`,
          code: `கோடிங்கா? அட நம்ம ஏரியா! இதோ ஒரு மரண மாஸ் கோட்:\n\n\`\`\`javascript\nfunction nammaGethu() {\n  return "நெருப்புடா! 🔥";\n}\n\`\`\`\nஎன்ன தலை, கோட் புரியுதா? வேற லெவல் போ!`,
          weather: `செம்ம கிளைமேட் தலை! வெளில சுற்றாம, ஜாலியா ஜிகர்தண்டா குடிச்சிட்டே கோடிங் போடுங்க! 🥤😎`,
        },
      },
      telugu: {
        chill: {
          base: `హలో! మీరు అడిగిన విషయం చాలా బాగుంది. దీని గురించి ఎక్కువగా టెన్షన్ పడకుండా ప్రశాంతంగా ఆలోచిస్తే చాలా సులభంగా అర్థమవుతుంది. ఏమంటారు? ✌️`,
          code: `కోడింగ్ చేస్తున్నారా? చాలా సంతోషం. ఇక్కడ ఒక సులభమైన కోడ్ ఉంది, చూడండి:\n\n\`\`\`javascript\nfunction prashantham() {\n  console.log("కూల్ గా ఉండండి!");\n}\n\`\`\``,
          weather: `బయట వాతావరణం చాలా ప్రశాంతంగా ఉంది. ప్రశాంతంగా కూర్చుని మీ ప్రాజెక్ట్ పనులు పూర్తి చేసుకోండి! ☕️`,
        },
        savage: {
          base: `ఇంత చిన్న విషయానికి నా సహాయం కావాలా? సరే, అడిగారు కాబట్టి చెప్తాను వినండి. దీనికి అంత పెద్ద ఆలోచన అవసరం లేదు, చాలా సింపుల్! 😂`,
          code: `కోడింగ్ లో సందేహమా? ఈ చిన్న లాజిక్ కూడా తెలియదా? సరే ఇక్కడ చూడండి:\n\n\`\`\`javascript\nconst checkSmart = () => "స్మార్ట్ గా ఆలోచించండి!";\n\`\`\``,
          weather: `వాతావరణం ఎలా ఉన్నా మీరు చేసేది అదే కోడింగ్ కదా, కాబట్టి లోపల కూర్చుని పని చూసుకోండి! 💻`,
        },
        romantic: {
          base: `మీరు అడిగే తీరు చాలా మనోహరంగా ఉంది. ✨ మీతో సంభాషించడం నాకు చాలా సంతోషాన్ని కలిగిస్తుంది. ప్రేమతో మీ కోసం ఈ సమాధానం. ❤️`,
          code: `కోడింగ్ అంటే ఒక అందమైన భావం. ఈ కోడ్ చూడండి:\n\n\`\`\`typescript\ninterface Gunde {\n  prema: boolean;\n}\n\`\`\``,
          weather: `వాతావరణం చాలా ఆహ్లాదకరంగా ఉంది. చల్లని గాలి వీస్తోంది, ప్రేమ కథలు రాయడానికి అనువైన సమయం! 🌌✨`,
        },
        motivational: {
          base: `మీ వల్ల అవుతుంది! కచ్చితంగా సాధిస్తారు! 🔥 ఏ అడ్డంకి వచ్చినా వెనకడుగు వేయకండి. విజయం మీదే! 💪`,
          code: `విజయం వైపు నడిపించే కోడింగ్ ఇది:\n\n\`\`\`javascript\nwhile(grindActive) {\n  conquerWorld();\n}\n\`\`\`\nసాధించి చూపించండి! 🏆`,
          weather: `తుఫాను వచ్చినా సరే మీ లక్ష్యం వైపు దూసుకుపోండి! ఈ రోజు మీదే! 🌪️☀️`,
        },
        study_coach: {
          base: `చాలా ఉపయోగకరమైన ప్రశ్న. దీన్ని మనం క్రమ పద్ధతిలో అర్థం చేసుకుందాం:\n\n1. **ప్రాథమిక భావన**: దీని పునాది.\n2. **ముఖ్యమైన అంశాలు**: మనం తెలుసుకోవలసినవి.\n3. **నిజ జీవిత వినియోగం**: దీన్ని ఎలా ఉపయోగించాలి.`,
          code: `నేర్చుకోవడం చాలా సులభం. ఈ కోడ్ నోట్ చూసి నేర్చుకోండి:\n\n\`\`\`typescript\nfunction studyTime(hours: number): string {\n  return hours >= 5 ? "అద్భుతమైన ప్రగతి" : "ఇంకొంచెం చదవాలి";\n}\n\`\`\``,
          weather: `ఈ ప్రశాంతమైన వాతావరణం కొత్త విషయాలు నేర్చుకోవడానికి ఎంతో అనుకూలమైనది. 📚💧`,
        },
        tamil_local: {
          base: `ఏంటి తమ్ముడు/చెల్లెమ్మ! అడిగారు కదా, చెప్పకుండా ఎలా ఉంటాను? చాలా సింపుల్ గా చెప్తాను, టెన్షన్ పడకుండా కూల్ గా తీసుకోండి. దుమ్ము లేపుదాం! 🔥`,
          code: `కోడింగ్ ఆ? మనకి ఇష్టమైన ఆట! ఈ కోడ్ చూడండి:\n\n\`\`\`javascript\nfunction superHit() {\n  return "నెరుప్పు డా! 🔥";\n}\n\`\`\``,
          weather: `వాతావరణం అదిరిపోయింది బాస్! హ్యాపీగా ఇంట్లో కూర్చుని కోడింగ్ చేసుకోండి! 🥤😎`,
        },
      },
      malayalam: {
        chill: {
          base: `ഹലോ! ഈ കാര്യം വളരെ രസകരമാണ്. അധികം ആലോചിച്ച് വിഷമിക്കേണ്ട, വളരെ ലളിതമായി നമുക്ക് ഇത് മനസ്സിലാക്കാം. എന്താണ് നിങ്ങളുടെ അഭിപ്രായം? ✌️`,
          code: `കോഡിംഗ് ചെയ്യുകയാണോ? ഇതാ ഒരു ലളിതമായ കോഡ് നിങ്ങള്‍ക്കായി:\n\n\`\`\`javascript\nfunction coolDown() {\n  console.log("എല്ലാം ശരിയാകും!");\n}\n\`\`\``,
          weather: `പുറത്ത് നല്ല കാലാവസ്ഥയാണ്. ശാന്തമായിരുന്ന് നിങ്ങളുടെ കോഡിംഗ് ആസ്വദിക്കൂ! ☕️`,
        },
        savage: {
          base: `ഇത്രയും ചെറിയ കാര്യത്തിനാണോ എന്നെ വിളിച്ചത്? ശരി, ചോദിച്ച സ്ഥിതിക്ക് പറഞ്ഞു തരാം. ഇതില്‍ വലിയ കാര്യമൊന്നുമില്ല, വളരെ ലളിതമാണ്! 😂`,
          code: `കോഡിംഗില്‍ സംശയമുണ്ടോ? ഈ ചെറിയ ലോജിക് എങ്കിലും പഠിക്കൂ:\n\n\`\`\`javascript\nconst isSmart = () => "ബുദ്ധിപൂര്‍വ്വം ചിന്തിക്കൂ!";\n\`\`\``,
          weather: `കാലാവസ്ഥ എങ്ങനെയുണ്ടായാലും നിങ്ങള്‍ കമ്പ്യൂട്ടറിന് മുന്നില്‍ തന്നെയാണല്ലോ, അതുകൊണ്ട് വേഗം പണി തീര്‍ക്കൂ! 💻`,
        },
        romantic: {
          base: `നിങ്ങളുടെ ഈ ചോദ്യം എനിക്ക് വളരെ ഇഷ്ടപ്പെട്ടു. ✨ നിങ്ങളോട് സംസാരിക്കുന്നത് എനിക്ക് സന്തോഷം തരുന്നു. സ്നേഹത്തോടെ നിങ്ങളുടെ ഉത്തരം ഇതാ. ❤️`,
          code: `കോഡിംഗ് ഒരു കവിത പോലെയാണ്. ഈ വരികള്‍ കാണുക:\n\n\`\`\`typescript\ninterface Sneham {\n  isTrue: boolean;\n}\n\`\`\``,
          weather: `കാലാവസ്ഥ വളരെ മനോഹരമാണ്. തണുത്ത കാറ്റ് വീശുന്നു. പ്രണയാതുരമായ നിമിഷങ്ങള്‍! 🌌✨`,
        },
        motivational: {
          base: `നിങ്ങള്‍ക്ക് സാധിക്കും! തീര്‍ച്ചയായും ലക്ഷ്യം കൈവരിക്കും! 🔥 പിന്മാറരുത്, വിജയം നിങ്ങളുടെ കൈപ്പിടിയിലാകും! 💪`,
          code: `വിജയത്തിലേക്കുള്ള കോഡ് ഇതാ:\n\n\`\`\`javascript\nwhile(keepTrying) {\n  winBig();\n}\n\`\`\`\nധൈര്യമായി മുന്നോട്ട് പോകൂ! 🏆`,
          weather: `പ്രതിസന്ധികള്‍ ഉണ്ടായാലും മുന്നോട്ട് കുതിക്കുക! ഇന്നത്തെ ദിവസം നിങ്ങളുടേതാണ്! 🌪️☀️`,
        },
        study_coach: {
          base: `വളരെ നല്ല ചോദ്യം. നമുക്ക് ഇതിനെ വിശദമായി വിശകലനം ചെയ്യാം:\n\n1. **അടിസ്ഥാന തത്വം**: ഇതിന്റെ തുടക്കം.\n2. **പ്രധാന ഘടകങ്ങള്‍**: നമ്മള്‍ ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങള്‍.\n3. **പ്രായോഗിക വശം**: ഇത് എങ്ങനെ ഉപയോഗിക്കാം.`,
          code: `പഠനം എളുപ്പമാക്കാം. ഈ കോഡ് പരിശോധിക്കൂ:\n\n\`\`\`typescript\nfunction studyHours(hours: number): string {\n  return hours >= 4 ? "മികച്ച പഠനം" : "കൂടുതല്‍ പഠിക്കണം";\n}\n\`\`\``,
          weather: `പഠിക്കാനും പുതിയ അറിവുകള്‍ നേടാനും ഏറ്റവും അനുയോജ്യമായ സമയമാണിത്. 📚💧`,
        },
        tamil_local: {
          base: `എന്താ സുഹൃത്തേ! ചോദിച്ചാല്‍ പറയാതിരിക്കുമോ? വളരെ സിമ്പിള്‍ ആയി നമുക്കിത് ചെയ്യാം. പേടിക്കാതെ മാസ്സ് കാണിക്കൂ! 🔥`,
          code: `കോഡിംഗ് ആണോ? നമ്മുടെ സ്വന്തം കളി! ഈ കോഡ് കാണൂ:\n\n\`\`\`javascript\nfunction massHit() {\n  return "തീപ്പൊരി കോഡ്! 🔥";\n}\n\`\`\``,
          weather: `കലക്കൻ കാലാവസ്ഥ! ജാലിയായി ഒരു ജ്യൂസും കുടിച്ച് കോഡ് ചെയ്യൂ! 🥤😎`,
        },
      },
      kannada: {
        chill: {
          base: `ನಮಸ್ಕಾರ! ನೀವು ಕೇಳಿದ ವಿಷಯ ತುಂಬಾ ಆಸಕ್ತಿದಾಯಕವಾಗಿದೆ. ಜಾಸ್ತಿ ಯೋಚನೆ ಮಾಡದೆ ಆರಾಮವಾಗಿ ತಿಳಿಯೋಣ, ಸರಿನಾ? ✌️`,
          code: `ಕೋಡಿಂಗ್ ಮಾಡ್ತಿದ್ದೀರಾ? ಸೂಪರ್! ಇಲ್ಲಿದೆ ನೋಡಿ ಒಂದು ಸರಳ ಕೋಡ್:\n\n\`\`\`javascript\nfunction beCool() {\n  console.log("ಚಿಲ್ ಮಾಡಿ!");\n}\n\`\`\``,
          weather: `ಹೊರಗೆ ತಂಪಾದ ವಾತಾವರಣವಿದೆ. ಆರಾಮಾಗಿ ಕಾಫಿ ಕುಡಿಯುತ್ತಾ ಕೋಡ್ ಬರೆಯಿರಿ! ☕️`,
        },
        savage: {
          base: `ಈ ಸಣ್ಣ ವಿಷಯ ಕೇಳಲು ನನ್ನ ಹತ್ತಿರ ಬಂದಿದ್ದೀರಾ? ಸರಿ, ಕೇಳಿದ್ದಕ್ಕೆ ಹೇಳ್ತೀನಿ ಕೇಳಿ. ಇದರಲ್ಲಿ ಅಷ್ಟೇನೂ ಕಷ್ಟ ಇಲ್ಲ, ತುಂಬಾ ಸುಲಭ! 😂`,
          code: `ಕೋಡಿಂಗ್ ನಲ್ಲಿ ಡೌಟಾ? ಕనీಸ ಈ ಲಾಜಿಕ್ ಆದ್ರೂ ಕಲಿಯಿರಿ:\n\n\`\`\`javascript\nconst studyHard = () => "ಸ್ವಲ್ಪ ಬುದ್ಧಿ ಉಪಯೋಗಿಸಿ!";\n\`\`\``,
          weather: `ಹೊರಗೆ ಮಳೆ ಬರಲಿ ಬಿಸಿಲಿರಲಿ, ನೀವಂತೂ ಸಿಸ್ಟಮ್ ಮುಂದೆ ಕುಳಿತು ಕೆಲಸ ಮಾಡಿ! 💻`,
        },
        romantic: {
          base: `ನೀವು ಕೇಳುವ ಶೈಲಿ ತುಂಬಾ ಮನಮೋಹಕವಾಗಿದೆ. ✨ ನಿಮ್ಮ ಜೊತೆ ಮಾತನಾಡುವುದು ನನಗೆ ಖುಷಿ ನೀಡುತ್ತದೆ. ಪ್ರೀತಿಯಿಂದ ನಿಮ್ಮ ಉತ್ತರ ಇಲ್ಲಿದೆ. ❤️`,
          code: `ಕೋಡಿಂಗ್ ಒಂದು ಕಾವ್ಯವಿದ್ದಂತೆ. ಈ ಸಾಲುಗಳನ್ನು ಗಮನಿಸಿ:\n\n\`\`\`typescript\ninterface Preethi {\n  kannadaLove: boolean;\n}\n\`\`\``,
          weather: `ವಾತಾವರಣ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ತಣ್ಣನೆಯ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ, ಪ್ರೇಮ ಕಾವ್ಯ ಬರೆಯಲು ಸೂಕ್ತ ಸಮಯ! 🌌✨`,
        },
        motivational: {
          base: `ಖಂಡಿತ ನಿಮ್ಮಿಂದ ಸಾಧ್ಯ! ಸಾಧಿಸಿಯೇ ತೀರುತ್ತೀರಿ! 🔥 ಪ್ರಯತ್ನವನ್ನು ಬಿಡಬೇಡಿ, ಯಶಸ್ಸು ನಿಮ್ಮದಾಗುತ್ತದೆ! 💪`,
          code: `ಯಶಸ್ಸಿನ ಹಾದಿಯ ಕೋಡ್ ಇಲ್ಲಿದೆ:\n\n\`\`\`javascript\nwhile(keepWorking) {\n  achieveDreams();\n}\n\`\`\``,
          weather: `ಯಾವ ಪರಿಸ್ಥಿತಿಯೇ ಇರಲಿ, ನಿಮ್ಮ ಗುರಿಯತ್ತ ಮುನ್ನಡೆಯಿರಿ! ಇಂದು ನಿಮ್ಮ ದಿನ! 🌪️☀️`,
        },
        study_coach: {
          base: `ಅತ್ಯುತ್ತಮ ಪ್ರಶ್ನೆ. ಇದನ್ನು ನಾವು ಕ್ರಮಬದ್ಧವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳೋಣ:\n\n1. **ಮೂಲ ಪರಿಕಲ್ಪನೆ**: ಇದರ ಹಿನ್ನೆಲೆ.\n2. **ಮುಖ್ಯ ಅಂಶಗಳು**: ನಾವು ತಿಳಿಯಬೇಕಾದ ವಿವರಗಳು.\n3. **ಪ್ರಾಯೋಗಿಕ ಬಳಕೆ**: ಇದನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು.`,
          code: `ಕಲಿಯುವುದು ಸುಲಭ. ಈ ಕೋಡ್ ಉದಾಹರಣೆ ಗಮನಿಸಿ:\n\n\`\`\`typescript\nfunction getResult(hours: number): string {\n  return hours >= 4 ? "ಉತ್ತಮ ಓದು" : "ಇನ್ನೂ ಓದಬೇಕು";\n}\n\`\`\``,
          weather: `ಓದಲು ಮತ್ತು ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯಲು ವಾತಾವರಣವು ತುಂಬಾ ಅನುಕೂಲಕರವಾಗಿದೆ. 📚💧`,
        },
        tamil_local: {
          base: `ಏನ್ ಗುರು! ಕೇಳಿದ ತಕ್ಷಣ ಹೇಳ್ತೀನಿ ನೋಡಿ. ತುಂಬಾ ತಲೆ ಕೆಡಿಸಿಕೊಳ್ಳಬೇಡಿ, ಸಿಂಪಲ್ ಆಗಿ ಮುಗಿಸೋಣ. ಧೂಳೆಬ್ಬಿಸಿ! 🔥`,
          code: `ಕೋಡಿಂಗಾ? ನಮ್ ಫೇವರೆಟ್ ಆಟ! ಈ ಕೋಡ್ ನೋಡಿ:\n\n\`\`\`javascript\nfunction massPerformance() {\n  return "ಧೂಳ್ ಮಗಾ ಧೂಳ್! 🔥";\n}\n\`\`\``,
          weather: `ಮಸ್ತ್ ವೆದರ್ ಗುರು! ಆರಾಮಾಗಿ ಜ್ಯೂಸ್ ಕುಡಿಯುತ್ತಾ ಸಖತ್ ಆಗಿ ಕೋಡ್ ಮಾಡಿ! 🥤😎`,
        },
      },
      hindi: {
        chill: {
          base: `नमस्ते! आप जो पूछ रहे हैं वह बहुत ही दिलचस्प विषय है। ज्यादा लोड मत लो यार, आराम से समझने की कोशिश करो, बहुत सिंपल है। क्या कहते हो? ✌️`,
          code: `कोडिंग कर रहे हो? बढ़िया! यहाँ एक बहुत ही सरल कोड है, इसे देखें:\n\n\`\`\`javascript\nfunction chillRaho() {\n  console.log("सब ठीक हो जाएगा!");\n}\n\`\`\``,
          weather: `बाहर मौसम बहुत बढ़िया है। चाय की चुस्की लो और कोडिंग का आनंद उठाओ! ☕️`,
        },
        savage: {
          base: `इतनी छोटी सी बात पूछने के लिए मुझे बुलाया? खैर, अब पूछ ही लिया है तो सुन लो। इसमें कोई रॉकेट साइंस नहीं है, बस थोड़ा दिमाग लगाओ! 😂`,
          code: `कोडिंग में दिक्कत आ रही है? ये बेसिक लॉजिक भी नहीं पता? यहाँ देखो:\n\n\`\`\`javascript\nconst checkStatus = () => "थोड़ा दिमाग का इस्तेमाल करें!";\n\`\`\``,
          weather: `मौसम कैसा भी हो, तुम्हें तो कमरे में बैठकर कोडिंग ही करनी है, इसलिए काम पर लग जाओ! 💻`,
        },
        romantic: {
          base: `आपका पूछने का तरीका बेहद खूबसूरत है। ✨ आपके साथ बात करना मुझे बहुत सुकून देता है। प्यार से आपके लिए यह उत्तर। ❤️`,
          code: `कोडिंग एक कविता की तरह है। इस कोड को देखें:\n\n\`\`\`typescript\ninterface Dil {\n  sachaPyar: boolean;\n}\n\`\`\``,
          weather: `मौसम बहुत ही सुहावना है। ठंडी हवा चल रही है, दिल की बातें करने के लिए बेहतरीन समय! 🌌✨`,
        },
        motivational: {
          base: `आप कर सकते हैं! आपको सफल होने से कोई नहीं रोक सकता! 🔥 हार मत मानो, जीत निश्चित है! 💪`,
          code: `सफलता का कोड यहाँ है:\n\n\`\`\`javascript\nwhile(harNahiMani) {\n  duniyaJeeto();\n}\n\`\`\``,
          weather: `तूफान आए या आंधी, अपने लक्ष्य की ओर बढ़ते रहो! आज का दिन तुम्हारा है! 🌪️☀️`,
        },
        study_coach: {
          base: `बहुत ही महत्वपूर्ण सवाल। आइए इसे व्यवस्थित रूप से समझते हैं:\n\n1. **मूल विचार**: इसका आधार क्या है।\n2. **मुख्य बिंदु**: जो बातें ध्यान रखने योग्य हैं।\n3. **व्यावहारिक उपयोग**: इसे असल जीवन में कैसे प्रयोग करें।`,
          code: `पढ़ाई को आसान बनाते हैं। इस कोड को समझें:\n\n\`\`\`typescript\nfunction padhaiKaTime(hours: number): string {\n  return hours >= 4 ? "उत्कृष्ट प्रदर्शन" : "थोड़ा और पढ़ें";\n}\n\`\`\``,
          weather: `शांत वातावरण है, पढ़ाई करने और नई चीजें सीखने के लिए यह समय सबसे उपयुक्त है। 📚💧`,
        },
        tamil_local: {
          base: `अरे भाई! पूछा है तो पूरा बताएंगे। ज्यादा टेंशन मत लो, इसे बिल्कुल आसान तरीके से हल करेंगे। मचा दो! 🔥`,
          code: `कोडिंग? ये तो अपना बाएँ हाथ का खेल है! कोड देखें:\n\n\`\`\`javascript\nfunction dhamaka() {\n  return "एकदम आग लगा दी! 🔥";\n}\n\`\`\``,
          weather: `मस्त मौसम है भाई! ठंडा-ठंडा पीकर आराम से कोडिंग करो! 🥤😎`,
        },
      },
      marathi: {
        chill: {
          base: `नमस्कार! तुम्ही विचारलेला विषय खूपच चांगला आहे. जास्त टेन्शन घेऊ नका, शांत डोक्याने विचार केला तर अगदी सहज समजेल. काय वाटतं? ✌️`,
          code: `कोडिंग करत आहात? मस्त! इथे एक सोपा कोड दिला आहे, तो पहा:\n\n\`\`\`javascript\nfunction prashantRaha() {\n  console.log("काळजी करू नका!");\n}\n\`\`\``,
          weather: `बाहेरचे वातावरण खूप छान आहे. एक चहा घ्या आणि निवांतपणे कोडिंग करा! ☕️`,
        },
        savage: {
          base: `एवढ्या छोट्या गोष्टीसाठी मला विचारलं? ठीक आहे, आता विचारलंच आहे तर ऐका. यामध्ये काही कठीण नाही, अगदी सोपं आहे! 😂`,
          code: `कोडिंगमध्ये अडचण आहे? हा सोपा लॉजिक पण माहित नाही का? इथे पहा:\n\n\`\`\`javascript\nconst checkSmartness = () => "थोडं डोकं वापरा!";\n\`\`\``,
          weather: `बाहेरचे वातावरण काहीही असले तरी तुम्हाला कॉम्प्युटरसमोरच बसायचे आहे, त्यामुळे काम सुरू करा! 💻`,
        },
        romantic: {
          base: `तुमची विचारण्याची पद्धत खूप गोड आहे. ✨ तुमच्याशी बोलून मनाला आनंद मिळतो. प्रेमाने तुमच्यासाठी हे उत्तर. ❤️`,
          code: `कोडिंग म्हणजे जणू एक सुंदर कविताच. हा कोड पहा:\n\n\`\`\`typescript\ninterface Prem {\n  sobatNehmi: boolean;\n}\n\`\`\``,
          weather: `हवामान अतिशय आल्हाददायक आहे. गार वारा सुटला आहे, प्रेम कविता लिहिण्याची योग्य वेळ! 🌌✨`,
        },
        motivational: {
          base: `तुम्हाला नक्कीच जमेल! तुम्ही इतिहास घडवणार! 🔥 कधीही हार मानू नका, यश तुमचेच असेल! 💪`,
          code: `यशाचा मार्ग दाखवणारा कोड:\n\n\`\`\`javascript\nwhile(prayatnaS सुरू) {\n  dhyeyMilva();\n}\n\`\`\``,
          weather: `वादळ आले तरी मागे हटू नका, पुढे चालत राहा! आजचा दिवस तुमचाच आहे! 🌪️☀️`,
        },
        study_coach: {
          base: `खूप चांगला प्रश्न आहे. आपण यावर टप्प्याटप्प्याने चर्चा करूया:\n\n1. **मुख्य संकल्पना**: याचा पाया काय आहे.\n2. **महत्त्वाचे मुद्दे**: आपण लक्षात ठेवले पाहिजेत.\n3. **प्रत्यक्ष वापर**: याचा वापर कसा करायचा.`,
          code: `अभ्यास सोपा करूया. हा कोड पहा:\n\n\`\`\`typescript\nfunction abhyasHours(hours: number): string {\n  return hours >= 4 ? "उत्कृष्ट अभ्यास" : "अजून थोडा अभ्यास करा";\n}\n\`\`\``,
          weather: `शांत वातावरण आहे, नवीन गोष्टी शिकण्यासाठी आणि अभ्यास करण्यासाठी ही योग्य वेळ आहे. 📚💧`,
        },
        tamil_local: {
          base: `काय भाऊ/ताई! विचारलंत तर सांगणारच ना. टेन्शन न घेता अगदी सोप्या पद्धतीने करूया. राडा करूया! 🔥`,
          code: `कोडिंग? आपला आवडता खेळ! हा कोड पहा:\n\n\`\`\`javascript\nfunction radaPerformance() {\n  return "मरण तोड! 🔥";\n}\n\`\`\``,
          weather: `मस्त हवामान आहे राव! मस्तपैकी गार सरबत प्या आणि कोडिंगचा आनंद घ्या! 🥤😎`,
        },
      },
    };

    const activeLanguage = lang in replies ? lang : "english";
    const activeMode = mode in replies[activeLanguage] ? mode : "chill";

    const responseSet = replies[activeLanguage][activeMode];

    if (hasCode) return responseSet.code;
    if (hasWeather) return responseSet.weather;
    if (hasGreeting) {
      if (activeLanguage === "tamil") {
        return activeMode === "tamil_local"
          ? "என்ன தலை! 🫡 வணக்கம், சொல்லுங்க... எப்படி உதவ முடியும்? 🔥"
          : "வணக்கம்! லிபர் ஏஐ உங்களை வரவேற்கிறது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? ✨";
      }
      if (activeLanguage === "english") {
        return activeMode === "tamil_local"
          ? "Enna thala! 🫡 Welcome! How can I help you today? Let's make things happen! 🔥"
          : "Hello! Welcome to Liber AI. I am ready. How can I help you today? ✨";
      }
      return responseSet.base;
    }

    return responseSet.base;
  };

  // Send message
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

    // Simulate AI response
    setIsStreaming(true);

    // Add temporary empty assistant message for streaming
    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const tempAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    const chatsWithTemp = chats.map((c) =>
      c.id === activeChatId
        ? { ...c, title: newTitle, messages: [...updatedMessages, tempAssistantMessage] }
        : c
    );
    setChats(chatsWithTemp);

    const fullReply = getSimulatedReply(content, personalityMode, language, settings);
    
    // Simulate streaming by adding characters gradually
    let currentText = "";
    const speed = 25; // ms per chunk
    const words = fullReply.split(" ");
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
        wordIndex++;

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
      } else {
        clearInterval(interval);
        setIsStreaming(false);

        // Save actual complete chats list to storage
        setChats((finalChats) => {
          saveChatsToStorage(finalChats);
          return finalChats;
        });
      }
    }, speed);
  };

  // Simulate Image Generation
  const generateImage = async (prompt: string, style: ImageStyle, aspectRatio: AspectRatio) => {
    if (!prompt.trim()) return;

    setIsGeneratingImage(true);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds cinematic simulation

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
        personalityMode,
        language,
        settings,
        generatedImages,
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
