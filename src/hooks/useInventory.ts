import { useState, useCallback, useEffect } from "react";
import {
  AppData,
  InventoryItem,
  Category,
  DEFAULT_SETTINGS,
  AppSettings,
} from "@/types/inventory";

const STORAGE_KEY = "cozinha4x1";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { inventory: [], history: {}, settings: { ...DEFAULT_SETTINGS } };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useInventory() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addItem = useCallback((item: InventoryItem) => {
    const today = new Date().toISOString().split("T")[0];
    setData((prev) => {
      const history = { ...prev.history };
      const day = history[today] || { produced: false, consumed: false, details: [] };
      day.produced = true;
      day.details = [...day.details, `Adicionou ${item.quantity}x ${item.name}`];
      history[today] = day;
      return { ...prev, inventory: [...prev.inventory, item], history };
    });
  }, []);

  const consumeItem = useCallback((uuid: string) => {
    const today = new Date().toISOString().split("T")[0];
    setData((prev) => {
      const inventory = prev.inventory.map((it) =>
        it.uuid === uuid ? { ...it, quantity: Math.max(0, it.quantity - 1) } : it
      ).filter((it) => it.quantity > 0);

      const consumed = prev.inventory.find((it) => it.uuid === uuid);
      const history = { ...prev.history };
      const day = history[today] || { produced: false, consumed: false, details: [] };
      day.consumed = true;
      if (consumed) {
        day.details = [...day.details, `Consumiu 1x ${consumed.name}`];
      }
      history[today] = day;
      return { ...prev, inventory, history };
    });
  }, []);

  const getCategoryTotal = useCallback(
    (category: Category): number => {
      return data.inventory
        .filter((it) => it.category === category)
        .reduce((sum, it) => sum + it.quantity, 0);
    },
    [data.inventory]
  );

  const getItemsByCategory = useCallback(
    (category: Category): InventoryItem[] => {
      return data.inventory
        .filter((it) => it.category === category)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)); // FIFO
    },
    [data.inventory]
  );

  const updateSettings = useCallback((settings: AppSettings) => {
    setData((prev) => ({ ...prev, settings }));
  }, []);

  return {
    data,
    addItem,
    consumeItem,
    getCategoryTotal,
    getItemsByCategory,
    updateSettings,
  };
}
