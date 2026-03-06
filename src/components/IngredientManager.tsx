import { useState } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Ingredient, UNIT_OPTIONS } from "@/types/ingredient";
import { useLanguage } from "@/contexts/LanguageContext";

interface IngredientManagerProps {
  open: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onAdd: (ingredient: Omit<Ingredient, "uuid" | "created_at">) => void;
  onRemove: (uuid: string) => void;
}

export function IngredientManager({ open, onClose, ingredients, onAdd, onRemove }: IngredientManagerProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? ptBR : enUS;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("unidade");
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 7 * 86400000));

  const reset = () => { setAdding(false); setName(""); setQuantity(""); setUnit("unidade"); setExpiresAt(new Date(Date.now() + 7 * 86400000)); };

  const handleAdd = () => {
    if (!name.trim() || !quantity) return;
    onAdd({ name: name.trim(), quantity: Number(quantity), unit, expires_at: expiresAt.toISOString().split("T")[0] });
    reset();
  };

  const today = new Date().toISOString().split("T")[0];
  const sorted = [...ingredients].sort((a, b) => a.expires_at.localeCompare(b.expires_at));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] px-4 sm:px-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-fredoka text-xl flex items-center gap-2">{t("ingredientTitle")}</SheetTitle>
          <SheetDescription>{t("controlStock")}</SheetDescription>
        </SheetHeader>

        {!adding ? (
          <>
            <Button onClick={() => setAdding(true)} className="w-full rounded-xl h-12 mb-4 font-semibold">
              <Plus className="w-4 h-4 mr-2" /> {t("addIngredient")}
            </Button>
            {sorted.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">{t("noIngredients")}</p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {sorted.map((ing) => {
                  const isExpired = ing.expires_at < today;
                  const isExpiringSoon = !isExpired && ing.expires_at <= new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
                  return (
                    <div key={ing.uuid} className={cn("flex items-center justify-between p-3 rounded-xl border", isExpired && "border-destructive/50 bg-destructive/5", isExpiringSoon && !isExpired && "border-secondary/50 bg-secondary/5")}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{ing.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ing.quantity} {ing.unit} • {t("expiresOn")} {format(new Date(ing.expires_at + "T12:00:00"), "dd/MM", { locale })}
                          {isExpired && <span className="text-destructive font-bold ml-1">{t("expired")}</span>}
                          {isExpiringSoon && !isExpired && <span className="text-secondary-foreground font-bold ml-1">⚠️</span>}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemove(ing.uuid)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">{t("name")}</label>
              <Input placeholder="Ex: Peito de frango" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12 text-base" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("quantity")}</label>
                <Input type="number" placeholder="Ex: 500" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-xl h-12 text-base" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">{t("unit")}</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">{t("expiryDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl h-12">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(expiresAt, lang === "pt" ? "dd 'de' MMMM, yyyy" : "MMMM dd, yyyy", { locale })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expiresAt} onSelect={(d) => d && setExpiresAt(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={reset}>{t("cancel")}</Button>
              <Button className="flex-1 rounded-xl h-12 font-bold" onClick={handleAdd} disabled={!name.trim() || !quantity}>{t("save")}</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
