import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORY_EMOJIS } from "@/types/inventory";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductionFABProps {
  onSelectCategory: (category: Category) => void;
}

export function ProductionFAB({ onSelectCategory }: ProductionFABProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const categories: Category[] = ["protein", "carb", "veggie", "flavor"];

  const colorMap: Record<Category, string> = {
    protein: "bg-protein",
    carb: "bg-carb",
    veggie: "bg-veggie",
    flavor: "bg-flavor",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? "bg-muted-foreground rotate-45" : "bg-primary"
        }`}
      >
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <Plus className="w-7 h-7 text-primary-foreground" />}
      </button>

      <AnimatePresence>
        {open &&
          categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { onSelectCategory(cat); setOpen(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-white font-semibold text-sm ${colorMap[cat]}`}
            >
              <span>{CATEGORY_EMOJIS[cat]}</span>
              <span>{t(cat)}</span>
            </motion.button>
          ))}
      </AnimatePresence>
    </div>
  );
}
