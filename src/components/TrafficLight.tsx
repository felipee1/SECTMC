import {
  Category,
  CATEGORY_EMOJIS,
  AppSettings,
  getSemaphoreColor,
} from "@/types/inventory";

interface TrafficLightProps {
  category: Category;
  count: number;
  settings: AppSettings;
}

export function TrafficLight({ category, count, settings }: TrafficLightProps) {
  const color = getSemaphoreColor(count, settings);

  const bgMap = {
    red: "bg-semaphore-red",
    yellow: "bg-semaphore-yellow",
    green: "bg-semaphore-green",
  };

  const shadowMap = {
    red: "shadow-[0_0_12px_hsl(var(--semaphore-red)/0.5)]",
    yellow: "shadow-[0_0_12px_hsl(var(--semaphore-yellow)/0.5)]",
    green: "shadow-[0_0_12px_hsl(var(--semaphore-green)/0.5)]",
  };

  return (
    <div
      className={`relative flex items-center justify-center w-10 h-10 rounded-full ${bgMap[color]} ${shadowMap[color]} transition-all duration-500`}
    >
      <span className="text-xs font-bold text-white leading-none">{count}</span>
      <span className="absolute -bottom-4 text-xs">
        {CATEGORY_EMOJIS[category]}
      </span>
    </div>
  );
}
