import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b shadow-sm px-4 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="w-9" />
        <h1 className="text-sm font-bold font-fredoka text-primary leading-tight text-center">
          {t("appTitle")}
        </h1>
        <Link
          to="/settings"
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
