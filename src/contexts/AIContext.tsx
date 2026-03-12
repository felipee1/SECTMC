import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useInventory } from "@/hooks/useInventory";
import { toast } from "sonner";
import * as webllm from "@mlc-ai/web-llm";
import { Category } from "@/types/inventory";

interface AIContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  engine: webllm.MLCEngineInterface | null;
  loadingProgress: number;
  isInitializing: boolean;
  modelReady: boolean;
  hardwareError: string | null;
  initEngine: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const { data } = useInventory();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [engine, setEngine] = useState<webllm.MLCEngineInterface | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [hardwareError, setHardwareError] = useState<string | null>(null);

  const initEngine = useCallback(async () => {
    if (engine || isInitializing) return;
    
    setIsInitializing(true);
    setLoadingProgress(0);
    setHardwareError(null);
    
    try {
      // Check for WebGPU support
      if (!(navigator as any).gpu) {
        throw new Error("WebGPU is not supported by your browser or hardware.");
      }

      const modelId = data.settings.ai_model_id || "Qwen2-1.5B-Instruct-q4f32_1-MLC";
      
      const newEngine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          setLoadingProgress(Math.round(report.progress * 100));
          console.log("WebLLM Progress:", report.text);
        },
      });
      
      setEngine(newEngine);
      setModelReady(true);
      toast.success("AI Model loaded successfully!");
    } catch (error: any) {
      console.error("WebLLM Init Error:", error);
      const isPascalError = error.message?.includes("f16") || error.message?.includes("extension");
      const msg = isPascalError 
        ? "Incompatibility detected: Arquitetura Pascal não suporta f16. Use modelos f32." 
        : error.message || "Failed to initialize AI model.";
      setHardwareError(msg);
      toast.error("Hardware mismatch detected.");
    } finally {
      setIsInitializing(false);
    }
  }, [data.settings.ai_model_id, engine, isInitializing]);

  // Auto-initialize when enabled
  useEffect(() => {
    if (data.settings.ai_enabled && !engine && !isInitializing && !hardwareError) {
      initEngine();
    }
  }, [data.settings.ai_enabled, engine, isInitializing, hardwareError, initEngine]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (engine) {
        engine.unload();
      }
    };
  }, [engine]);

  return (
    <AIContext.Provider value={{
      isChatOpen,
      setIsChatOpen,
      engine,
      loadingProgress,
      isInitializing,
      modelReady,
      hardwareError,
      initEngine
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
