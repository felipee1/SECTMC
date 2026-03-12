/**
 * Translation utility using exclusively Built-in AI (Gemini Nano)
 * API: window.ai.translator / window.translation
 */

const MAX_CHARS = 1000; // Built-in AI usually supports more than MyMemory

// Basic types for Chrome's experimental translation API
interface TranslationAPI {
  canTranslate: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  createTranslator: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<any>;
}

declare global {
  interface Window {
    translation?: TranslationAPI;
    ai?: {
      translator?: TranslationAPI;
    };
  }
}

/**
 * Checks if the built-in translation API is available
 */
async function getBuiltInTranslator(source: string, target: string) {
  try {
    // Tries to find the API in different locations (may vary by Chrome version)
    const api = (window as any).translation || window.ai?.translator || (window.ai as any)?.translation;
    
    if (!api) {
      console.warn("Built-in translation API (Gemini Nano) not found. Ensure you are in a secure context (HTTPS) and flags are enabled.");
      throw new Error("aiNotFoundTitle");
    }

    const capability = await api.canTranslate({ sourceLanguage: source, targetLanguage: target });
    console.log(`Translation capability (${source} -> ${target}):`, capability);

    if (capability === "no") {
      throw new Error("aiNotFoundTitle");
    }

    // If downloading, still throw error to show visual warning on how to configure/wait
    if (capability === "after-download") {
      console.info("Translation model is downloading. Please wait a moment.");
      // Optionally return the translator and let 'translate' fail or wait,
      // but throwing the error keeps the user informed via UI.
      throw new Error("aiNotFoundTitle"); 
    }

    return await api.createTranslator({ sourceLanguage: source, targetLanguage: target });
  } catch (error) {
    if (error instanceof Error && error.message === "aiNotFoundTitle") {
      throw error;
    }
    console.error("Error checking Built-in AI:", error);
    return null;
  }
}

/**
 * Translates a short text from Portuguese to English using Gemini Nano.
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  const translator = await getBuiltInTranslator("pt", "en");
  if (!translator) return text;

  try {
    return await translator.translate(text);
  } catch (error) {
    console.error("Gemini Nano translation error (PT->EN):", error);
    return text;
  }
}

/**
 * Translates a short text from English to Portuguese using Gemini Nano.
 */
export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  const translator = await getBuiltInTranslator("en", "pt");
  if (!translator) return text;

  try {
    return await translator.translate(text);
  } catch (error) {
    console.error("Gemini Nano translation error (EN->PT):", error);
    return text;
  }
}

/**
 * Translates long texts by splitting into sentences or lines to respect model limits.
 */
export async function translateLongText(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  const lines = text.split("\n").filter(l => l.trim() !== "");
  const hasManyLines = lines.length > 2;
  const hasLittlePunctuation = (text.match(/[.!?]/g) || []).length < lines.length / 2;

  let segments: string[];
  if (hasManyLines && hasLittlePunctuation) {
    segments = lines;
  } else {
    segments = text.match(/[^.!?]+[.!?]*/g) || [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = "";

  for (const segment of segments) {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) continue;

    if ((currentChunk + " " + trimmedSegment).length > MAX_CHARS) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmedSegment;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${trimmedSegment}` : trimmedSegment;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  try {
    const translatedChunks = await Promise.all(
      chunks.map(chunk => translateText(chunk))
    );
    
    return translatedChunks.join(hasManyLines && hasLittlePunctuation ? "\n" : " ");
  } catch (error) {
    console.error("Long text translation error (Gemini Nano):", error);
    return text;
  }
}
