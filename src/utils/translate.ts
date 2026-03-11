/**
 * Utilitário de tradução usando exclusivamente Built-in AI (Gemini Nano)
 * API: window.ai.translator / window.translation
 */

const MAX_CHARS = 1000; // Built-in AI costuma suportar mais que MyMemory

// Tipagem básica para a API experimental de tradução do Chrome
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
 * Verifica se a API de tradução embutida está disponível
 */
async function getBuiltInTranslator(source: string, target: string) {
  try {
    const api = window.ai?.translator || window.translation;
    
    if (!api) {
      throw new Error("aiNotFoundTitle");
    }

    const capability = await api.canTranslate({ sourceLanguage: source, targetLanguage: target });
    if (capability === "no") {
      throw new Error("aiNotFoundTitle");
    }

    return await api.createTranslator({ sourceLanguage: source, targetLanguage: target });
  } catch (error) {
    if (error instanceof Error && error.message === "aiNotFoundTitle") {
      throw error;
    }
    console.error("Erro ao verificar Built-in AI:", error);
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
    console.error("Erro na tradução do Gemini Nano (PT->EN):", error);
    return text;
  }
}

/**
 * Traduz um texto curto de Inglês para Português usando Gemini Nano.
 */
export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  const translator = await getBuiltInTranslator("en", "pt");
  if (!translator) return text;

  try {
    return await translator.translate(text);
  } catch (error) {
    console.error("Erro na tradução do Gemini Nano (EN->PT):", error);
    return text;
  }
}

/**
 * Traduz textos longos dividindo em frases ou linhas para respeitar limites do modelo
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
    console.error("Erro na tradução de texto longo (Gemini Nano):", error);
    return text;
  }
}
