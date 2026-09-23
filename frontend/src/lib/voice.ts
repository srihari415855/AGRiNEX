import { api, API } from "./api";

export interface VoiceInfo {
  id: string;
  name: string;
  description: string;
}

export interface VoiceStatus {
  elevenlabs_configured: boolean;
  gemini_configured: boolean;
  default_voice_id: string;
  available_voices: VoiceInfo[];
}

export const FALLBACK_VOICES: VoiceInfo[] = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Calm, clear & professional (Default)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "Deep, friendly & authoritative" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Warm, expressive & energetic" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", description: "Friendly, modern agronomic advisor" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "Clear, youthful & engaging" },
];

// Audio URL cache to avoid redundant API calls
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Check if Web Speech Recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionClass() !== null;
}

/**
 * Map application language code to standard Speech Recognition BCP-47 tag
 */
export function getRecognitionLanguageCode(lang: string): string {
  switch (lang) {
    case "hi":
      return "hi-IN";
    case "kn":
      return "kn-IN";
    case "en":
    default:
      return "en-IN";
  }
}

/**
 * Start listening to speech via Web Speech API
 */
export function startSpeechRecognition({
  lang = "en",
  onInterim,
  onFinal,
  onError,
  onEnd,
}: {
  lang: string;
  onInterim?: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError?: (err: SpeechRecognitionErrorEvent | Error) => void;
  onEnd?: () => void;
}) {
  const SpeechRecognition = getSpeechRecognitionClass();

  if (!SpeechRecognition) {
    onError?.({ error: "not_supported", message: "Web Speech API is not supported in this browser." });
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = getRecognitionLanguageCode(lang);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim && onInterim) {
        onInterim(interim);
      }

      if (finalTranscript) {
        onFinal(finalTranscript.trim());
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.warn("Speech recognition error:", e);
      onError?.(e);
    };

    recognition.onend = () => {
      onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch { }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch { }
      },
    };
  } catch (err: unknown) {
    console.error("Failed to start speech recognition:", err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Clean text for natural speech synthesis
 */
export function cleanSpokenText(text: string): string {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s*/g, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[|~^<>]/g, " ")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/\s*([,.;:?!])\s*/g, "$1 ")
    .replace(/\.\s*\./g, ".")
    .trim();
}

/**
 * Stop any current audio or speech synthesis playback
 */
export function stopAllPlayback() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch { }
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch { }
  }
}

/**
 * Synthesize and play speech using ElevenLabs (with automatic browser fallback)
 */
export async function speakText({
  text,
  voiceId = "21m00Tcm4TlvDq8ikWAM",
  language = "en",
  apiKeyOverride,
  onStart,
  onEnd,
  onError,
}: {
  text: string;
  voiceId?: string;
  language?: string;
  apiKeyOverride?: string;
  onStart?: (provider: "elevenlabs" | "browser") => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}): Promise<"elevenlabs" | "browser"> {
  stopAllPlayback();

  const cleaned = cleanSpokenText(text);
  if (!cleaned) {
    onEnd?.();
    return "browser";
  }

  const cacheKey = `${voiceId}_${cleaned.slice(0, 80)}`;

  // 1. Check if cached audio exists
  if (audioCache.has(cacheKey)) {
    const cachedUrl = audioCache.get(cacheKey)!;
    const audio = new Audio(cachedUrl);
    currentAudio = audio;
    onStart?.("elevenlabs");
    audio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      fallbackToBrowserSpeech(cleaned, language, onStart, onEnd, onError);
    };
    audio.play().catch(() => {
      fallbackToBrowserSpeech(cleaned, language, onStart, onEnd, onError);
    });
    return "elevenlabs";
  }

  // 2. Try fetching from ElevenLabs backend endpoint
  try {
    const response = await fetch(`${API}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleaned,
        voice_id: voiceId,
        language: language,
        api_key_override: apiKeyOverride || undefined,
      }),
    });

    const contentType = response.headers.get("Content-Type") || "";

    if (response.ok && contentType.includes("audio")) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      audioCache.set(cacheKey, audioUrl);

      const audio = new Audio(audioUrl);
      currentAudio = audio;
      onStart?.("elevenlabs");

      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        fallbackToBrowserSpeech(cleaned, language, onStart, onEnd, onError);
      };

      await audio.play();
      return "elevenlabs";
    } else {
      fallbackToBrowserSpeech(cleaned, language, onStart, onEnd, onError);
      return "browser";
    }
  } catch (err: unknown) {
    fallbackToBrowserSpeech(cleaned, language, onStart, onEnd, onError);
    return "browser";
  }
}

function selectFemaleVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Known male keywords to strictly avoid
  const maleKeywords = [
    "david", "mark", "george", "guy", "ravi", "prabhat", "hemant", 
    "stefan", "male", "microsoft david", "microsoft mark", "man"
  ];

  const isMale = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return maleKeywords.some((k) => n.includes(k));
  };

  // High priority crystal-clear natural female neural voices
  const topFemaleKeywords = [
    "jenny", "aria", "neerja", "swara", "sapna", "samantha", "zira",
    "kavya", "veena", "heera", "sonia", "female", "natural", "online",
    "google us english", "google uk english female"
  ];

  const langCode = lang.toLowerCase();

  // Filter voices matching the requested language
  const langVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang.startsWith(langCode) || vLang.includes(langCode);
  });

  // 1. In language voices, find top natural neural female voice (excluding male)
  const bestLangFemale = langVoices.find((v) => {
    if (isMale(v)) return false;
    const n = v.name.toLowerCase();
    return topFemaleKeywords.some((k) => n.includes(k));
  });
  if (bestLangFemale) return bestLangFemale;

  // 2. In language voices, find any non-male voice
  const nonMaleLang = langVoices.find((v) => !isMale(v));
  if (nonMaleLang) return nonMaleLang;

  // 3. Fallback: Find top natural neural female voice globally (Jenny / Aria / Neerja / Google)
  const bestGlobalFemale = voices.find((v) => {
    if (isMale(v)) return false;
    const n = v.name.toLowerCase();
    return topFemaleKeywords.some((k) => n.includes(k));
  });
  if (bestGlobalFemale) return bestGlobalFemale;

  // 4. Any non-male voice in all voices
  const anyNonMale = voices.find((v) => !isMale(v));
  if (anyNonMale) return anyNonMale;

  return voices[0] || null;
}

/**
 * Browser SpeechSynthesis fallback with gentle, natural female voice
 */
function fallbackToBrowserSpeech(
  text: string,
  lang: string,
  onStart?: (provider: "elevenlabs" | "browser") => void,
  onEnd?: () => void,
  onError?: (err: Error) => void
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError?.(new Error("Speech synthesis not available"));
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getRecognitionLanguageCode(lang);
  utterance.rate = 0.98; // Natural, clear, relaxed cadence
  utterance.pitch = 1.02; // Warm, gentle female resonance
  utterance.volume = 1.0; // Crystal clear volume

  const assignVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const voice = selectFemaleVoice(voices, lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      onStart?.("browser");
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.warn("Browser SpeechSynthesis error:", event.error);
      onError?.(new Error(event.error));
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    assignVoiceAndSpeak();
  } else {
    // Voices might still be loading in Chromium
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      assignVoiceAndSpeak();
    };
    // Fallback trigger if event doesn't fire
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        assignVoiceAndSpeak();
      }
    }, 150);
  }
}

/**
 * Fetch Voice System Status (ElevenLabs status, Gemini status, available voices)
 */
export async function getVoiceStatus(): Promise<VoiceStatus> {
  try {
    const res = await api.get("/voice/status");
    return res.data;
  } catch {
    return {
      elevenlabs_configured: false,
      gemini_configured: true,
      default_voice_id: "21m00Tcm4TlvDq8ikWAM",
      available_voices: FALLBACK_VOICES,
    };
  }
}
