import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAI } from "@/contexts/AIContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import {
  logCloudSyncToggle,
  logLogin,
  logLogout,
  logSettingsSaved,
  logSignup,
} from "@/services/analyticsService";
import {
  CloudUser,
  logout as firebaseLogout,
  loginWithEmail,
  onAuthChange,
  signupWithEmail,
} from "@/services/authService";
import {
  isCloudSyncEnabled,
  loadFromLocalStorage,
  loadUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveToLocalStorage,
  saveUserToLocalStorage,
  setCloudSyncEnabled,
  syncLocalToCloud,
} from "@/services/storageService";
import { DEFAULT_SETTINGS } from "@/types/inventory";
import { useInventory } from "@/hooks/useInventory";
import {
  ArrowLeft,
  Bot,
  Cloud,
  Globe,
  Lock,
  LogOut,
  Mail,
  Moon,
  Sparkles,
  Sun,
  TriangleAlert,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  const { data, updateSettings } = useInventory();
  const [settings, setSettings] = useState(data.settings);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { loadingProgress, isInitializing, modelReady, hardwareError, initEngine } = useAI();
  const [cloudEnabled, setCloudEnabled] = useState(isCloudSyncEnabled());
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(
    loadUserFromLocalStorage(),
  );
  const [loggingIn, setLoggingIn] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  // Login form state
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCloudUser(user);
      if (user) {
        saveUserToLocalStorage(user);
      } else {
        removeUserFromLocalStorage();
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setLoggingIn(true);
    try {
      const user = isSignup
        ? await signupWithEmail(email, password, name || undefined)
        : await loginWithEmail(email, password);

      setCloudUser(user);
      saveUserToLocalStorage(user);

      // Sync local data to cloud after successful login
      if (cloudEnabled) {
        await syncLocalToCloud(user.uid);
      }

      // Clear form
      setEmail("");
      setPassword("");
      setName("");

      // Log analytics event
      if (isSignup) {
        logSignup("email");
      } else {
        logLogin("email");
      }

      toast({
        title: isSignup ? "Account created" : "Login successful",
        description: isSignup
          ? "Your account has been created successfully."
          : "You are now logged in.",
      });
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: isSignup ? "Signup failed" : "Login failed",
        description:
          error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await firebaseLogout();
      setCloudUser(null);
      removeUserFromLocalStorage();

      // Log analytics event
      logLogout();

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description:
          error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Handle cloud sync toggle
  const handleCloudToggle = async (checked: boolean) => {
    setCloudEnabled(checked);
    setCloudSyncEnabled(checked);

    // Log analytics event
    logCloudSyncToggle(checked);

    if (!checked) {
      // Disable cloud sync
      setCloudUser(null);
      removeUserFromLocalStorage();
      if (cloudUser) {
        await handleLogout();
      }
    } else if (cloudUser) {
      // Enable cloud sync and sync data
      try {
        await syncLocalToCloud(cloudUser.uid);
      } catch (error) {
        console.error("Sync error:", error);
      }
    }
  };

  // Sync settings state with global data
  useEffect(() => {
    setSettings(data.settings);
  }, [data.settings]);

  // Save settings
  const save = () => {
    try {
      updateSettings(settings);

      // If cloud sync is enabled and user is logged in, sync to cloud
      if (cloudEnabled && cloudUser) {
        syncLocalToCloud(cloudUser.uid).catch(console.error);
      }

      // Log analytics event
      logSettingsSaved();

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b shadow-sm px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-fredoka font-bold text-lg">{t("settings")}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
          <h2 className="font-fredoka font-semibold">{t("appearance")}</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span className="text-sm font-semibold">{t("darkMode")}</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          {/* Cloud sync */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5" />
              <div>
                <span className="text-sm font-semibold block">
                  {t("cloudSync")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("cloudSyncDesc")}
                </span>
              </div>
            </div>
            <Switch
              checked={cloudEnabled}
              onCheckedChange={handleCloudToggle}
            />
          </div>

          {/* Login/Signup Form */}
          {cloudEnabled && !cloudUser && (
            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div className="space-y-2">
                {isSignup && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 rounded-xl h-11"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rounded-xl h-11"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 rounded-xl h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl h-11 font-semibold"
                disabled={loggingIn}
              >
                {loggingIn ? "Processing..." : isSignup ? "Sign Up" : "Login"}
              </Button>

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignup
                  ? "Already have an account? Login"
                  : "Need an account? Sign up"}
              </button>
            </form>
          )}

          {/* User Profile */}
          {cloudEnabled && cloudUser && (
            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={cloudUser.avatar} alt={cloudUser.name} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{cloudUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cloudUser.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-semibold">{t("language")}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant={lang === "pt" ? "default" : "outline"}
                size="sm"
                className="rounded-lg h-8 text-xs"
                onClick={() => setLang("pt")}
              >
                {t("portuguese")}
              </Button>
              <Button
                variant={lang === "en" ? "default" : "outline"}
                size="sm"
                className="rounded-lg h-8 text-xs"
                onClick={() => setLang("en")}
              >
                {t("english")}
              </Button>
            </div>
          </div>
        </div>

        {/* Chef AI Assistant */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="font-fredoka font-semibold">{t("aiAssistant")}</h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <div>
                <span className="text-sm font-semibold block">
                  {t("aiEnabled")}
                </span>
                <span className="text-xs text-muted-foreground mr-8 block">
                  {t("aiAssistantDesc")}
                </span>
              </div>
            </div>
            <Switch
              checked={settings.ai_enabled}
              onCheckedChange={(checked) => {
                const newSettings = { ...settings, ai_enabled: checked };
                setSettings(newSettings);
                // For AI, we want it to react immediately so the model starts loading/unloading
                updateSettings(newSettings);
              }}
            />
          </div>

          {settings.ai_enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("aiModel")}</label>
                <Select
                  value={settings.ai_model_id}
                  onValueChange={(value) => {
                    const newSettings = { ...settings, ai_model_id: value };
                    setSettings(newSettings);
                    updateSettings(newSettings);
                  }}
                  disabled={isInitializing || modelReady}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Qwen2-1.5B-Instruct-q4f32_1-MLC">
                      Qwen 2 1.5B (f32 - Pascal Safe)
                    </SelectItem>
                    <SelectItem value="Phi-3-mini-4k-instruct-q4f32_1-MLC">
                      Phi-3 Mini (f32 - Stable)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hardwareError && (
                <div className="flex flex-col gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive">
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="w-5 h-5" />
                    <span className="font-bold">{t("hardwareError")}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{t("webGPUNotSupported")}</p>
                  <p className="text-[10px] font-mono opacity-70 break-all">{hardwareError}</p>
                </div>
              )}

              {!modelReady ? (
                <Button 
                  className="w-full h-11 rounded-xl font-bold"
                  onClick={initEngine}
                  disabled={isInitializing || !!hardwareError}
                >
                  {isInitializing ? t("initializingModel") : "Download & Initialize Model (f32)"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                  <span className="text-sm font-semibold">{t("modelReady")}</span>
                </div>
              )}

              {isInitializing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{t(`downloadProgress|progress:${loadingProgress}`)}</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <Progress value={loadingProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Semaphore */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
          <h2 className="font-fredoka font-semibold">{t("semaphoreLimits")}</h2>

          <div>
            <label className="text-sm font-semibold mb-1 block">
              {t("redLimit")}
            </label>
            <Input
              type="number"
              min={0}
              value={settings.threshold_red}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  threshold_red: Number(e.target.value),
                })
              }
              className="rounded-xl h-12"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">
              {t("yellowLimit")}
            </label>
            <Input
              type="number"
              min={0}
              value={settings.threshold_yellow}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  threshold_yellow: Number(e.target.value),
                })
              }
              className="rounded-xl h-12"
            />
          </div>

          <p className="text-xs text-muted-foreground">{t("aboveYellow")}</p>
        </div>

        {/* Household */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
          <h2 className="font-fredoka font-semibold">{t("householdSize")}</h2>
          <Input
            type="number"
            min={1}
            value={settings.household_size ?? 2}
            onChange={(e) =>
              setSettings({
                ...settings,
                household_size: Math.max(1, Number(e.target.value)),
              })
            }
            className="rounded-xl h-12"
          />
          <p className="text-xs text-muted-foreground">
            {t("householdSizeDesc")}
          </p>

          <Button className="w-full rounded-xl h-12 font-bold" onClick={save}>
            {t("saveSettings")}
          </Button>
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-3">
          <h2 className="font-fredoka font-semibold">{t("about")}</h2>
          <p className="text-sm text-muted-foreground">
            <strong>{t("aboutText")}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            {cloudEnabled && cloudUser
              ? "Your data is synced with the cloud."
              : t("dataLocal")}
          </p>
        </div>

        {/* Create Account Info */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
          <h2 className="font-fredoka font-semibold">{t("createAccount")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("createAccountDesc")}
          </p>
          <Button
            variant="default"
            className="w-full rounded-xl h-12 font-bold gap-2"
            onClick={() => setShowAccountDialog(true)}
          >
            <UserPlus className="w-5 h-5" />
            {t("learnAboutAccount")}
          </Button>
        </div>
      </main>

      {/* Account Info Dialog */}
      <AlertDialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-fredoka">
              About Account Creation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4 pt-4">
              <p>
                <strong>This is not a commercial project.</strong> If you want
                to use and test it or want to make it available, please contact:
              </p>
              <p className="font-semibold text-foreground">
                felipe.stefani.correia@gmail.com
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">🚀 Future Plans</p>
                <p>
                  If this project hits <strong>100 users/requests</strong>, I
                  can start the commercial project and provide new features
                  like:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Recipe Hub</li>
                  <li>Mobile Native Application (iOS/Android)</li>
                  <li>Integrated AI for Personal Chef</li>
                  <li>Recipe Builder AI</li>
                  <li>Chef Hub to hire a human chef to create recipes</li>
                  <li>Nutritionist lists to help you in your diet</li>
                  <li>And much more!</li>
                </ul>
              </div>
              <p className="text-sm">
                Your interest and feedback are valuable to make this project
                grow! 🍳
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="rounded-xl">
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
