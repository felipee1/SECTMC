import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayHistory, InventoryItem } from "@/types/inventory";
import { Ingredient } from "@/types/ingredient";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface MonthCalendarProps {
  history: Record<string, DayHistory>;
  inventory: InventoryItem[];
  ingredients: Ingredient[];
}

export function MonthCalendar({ history, inventory, ingredients }: MonthCalendarProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? ptBR : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const monthName = currentDate.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const weekDays = t("weekDays") as string[];

  const getExpiringItems = (dateStr: string) => {
    const expiringInventory = (inventory || []).filter((it) => it.expires_at === dateStr);
    const expiringIngredients = (ingredients || []).filter((it) => it.expires_at === dateStr);
    return { expiringInventory, expiringIngredients };
  };

  const getDayInfo = (dateStr: string) => {
    const dayData = history[dateStr];
    const { expiringInventory, expiringIngredients } = getExpiringItems(dateStr);
    return { dayData, expiringInventory, expiringIngredients };
  };

  const selectedInfo = selectedDay ? getDayInfo(selectedDay) : null;

  return (
    <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-fredoka font-semibold capitalize text-base">{monthName}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((d, i) => (
          <div key={i} className="text-[11px] font-bold text-muted-foreground py-2 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-12 sm:h-14 border-b border-r last:border-r-0" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDay;
          const { dayData, expiringInventory, expiringIngredients } = getDayInfo(dateStr);
          const hasExpiring = expiringInventory.length > 0 || expiringIngredients.length > 0;
          const hasActivity = dayData?.produced || dayData?.consumed;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              className={`relative h-12 sm:h-14 flex flex-col items-center justify-center border-b border-r transition-colors
                ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}
                ${isToday ? "font-bold" : ""}
              `}
            >
              <span className={`text-sm leading-none ${isToday ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center" : ""}`}>
                {day}
              </span>
              {(hasActivity || hasExpiring) && (
                <div className="flex gap-0.5 mt-1">
                  {dayData?.produced && <span className="w-1.5 h-1.5 rounded-full bg-production" />}
                  {dayData?.consumed && <span className="w-1.5 h-1.5 rounded-full bg-consumption" />}
                  {hasExpiring && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t bg-muted/20">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-production" /> {t("production")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-consumption" /> {t("consumption")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-destructive" /> {t("expiration")}
        </span>
      </div>

      {selectedDay && selectedInfo && (
        <div className="border-t px-4 py-3 bg-muted/10 space-y-2 animate-accordion-down">
          <p className="text-xs font-bold text-muted-foreground">
            📅 {format(new Date(selectedDay + "T12:00:00"), lang === "pt" ? "dd 'de' MMMM" : "MMMM dd", { locale })}
          </p>
          {selectedInfo.dayData?.produced && (
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-production flex-shrink-0" />
              <span>{t("productionRegistered")}</span>
            </div>
          )}
          {selectedInfo.dayData?.consumed && (
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-consumption flex-shrink-0" />
              <span>{t("consumptionRegistered")}</span>
            </div>
          )}
          {selectedInfo.dayData?.details && selectedInfo.dayData.details.length > 0 && (
            <ul className="pl-4 space-y-0.5">
              {selectedInfo.dayData.details.map((d, idx) => (
                <li key={idx} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          )}
          {(selectedInfo.expiringInventory.length > 0 || selectedInfo.expiringIngredients.length > 0) && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive flex items-center gap-1">⚠️ {t("expirations")}</p>
              {selectedInfo.expiringInventory.map((it) => (
                <div key={it.uuid} className="text-xs flex items-center gap-2 pl-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                  {it.quantity}x {it.name}
                </div>
              ))}
              {selectedInfo.expiringIngredients.map((it) => (
                <div key={it.uuid} className="text-xs flex items-center gap-2 pl-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                  🧅 {it.quantity} {it.unit} {it.name}
                </div>
              ))}
            </div>
          )}
          {!selectedInfo.dayData && selectedInfo.expiringInventory.length === 0 && selectedInfo.expiringIngredients.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("noActivity")}</p>
          )}
        </div>
      )}
    </div>
  );
}
