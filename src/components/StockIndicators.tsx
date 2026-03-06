import { Category, CATEGORY_EMOJIS, CATEGORY_LABELS, AppSettings, getSemaphoreColor } from "@/types/inventory";

interface StockIndicatorsProps {
  getCategoryTotal: (cat: Category) => number;
  settings: AppSettings;
}

const categories: Category[] = ["protein", "carb", "veggie", "flavor"];

export function StockIndicators({ getCategoryTotal, settings }: StockIndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      {categories.map((cat) => {
        const count = getCategoryTotal(cat);
        const color = getSemaphoreColor(count, settings);

        const colorClass = {
          red: "text-semaphore-red",
          yellow: "text-semaphore-yellow",
          green: "text-semaphore-green",
        }[color];

        return (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="text-lg">{CATEGORY_EMOJIS[cat]}</span>
            <span className={`text-xl font-bold font-fredoka ${colorClass} leading-none`}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
