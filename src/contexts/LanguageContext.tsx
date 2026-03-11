import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "pt" | "en";

const translations = {
  pt: {
    // Header
    appTitle: "🍳 Se Eu Cozinho, Todo Mundo Come",

    // Categories
    protein: "Proteína",
    carb: "Carboidrato",
    veggie: "Legumes",
    flavor: "Molhos/Conservas",

    // Subtypes
    beef: "Carne",
    chicken: "Frango",
    pork: "Porco",
    fish: "Peixe",

    // Calendar
    weekDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    production: "Produção",
    consumption: "Consumo",
    expiration: "Vencimento",
    noActivity: "Nenhuma atividade neste dia",
    productionRegistered: "Produção registrada",
    consumptionRegistered: "Consumo registrado",
    expirations: "Vencimentos",

    // Mission card
    missionTitle: "🎯 Missão do Dia",
    urgent: "URGENTE",
    stockOf: "Seu estoque de",
    isCritical: "está crítico",
    isLow: "está baixo",
    isOk: "está ok",
    todayMake: "Hoje é dia de fazer:",
    clickToDiscover: "Clique para descobrir o que cozinhar hoje!",
    generateRecipe: "Gerar Receita",
    generateAnother: "Gerar outra receita",
    viewRecipe: "Ver receita",
    addToStock: "Adicionar ao estoque",
    ingredients: "🛒 Ingredientes",
    howToMake: "👨‍🍳 Modo de Preparo",

    // Main buttons
    whatToEat: "🎰 O que vamos comer?",
    manualConsume: "📋 Baixa manual",
    recipes: "📖 Receitas",
    ingredientsBtn: "🧅 Ingredientes",
    shopping: "🛒 Compras",

    // Dinner roulette
    rouletteTitle: "🎰 Roleta do Jantar",
    emptyStock: "Seu estoque está vazio! Adicione pratos prontos primeiro.",
    spinToAssemble: "Gire para montar a refeição de hoje!",
    spinning: "Girando...",
    spin: "🎲 Girar!",
    accept: "✅ Aceitar (dar baixa)",
    spinAgain: "🔄 Girar de novo",
    madeOn: "feito em",
    emptyStockShort: "Estoque vazio!",

    // Manual consume
    manualTitle: "📋 Baixa Manual",
    selectConsumed: "Selecione o item que você consumiu",
    portions: "porções",
    emptyAddFirst: "Estoque vazio! Adicione itens primeiro.",

    // Recipe book
    recipeBookTitle: "Banco de Receitas",
    yourRecipes: "Suas receitas para as missões do dia",
    noRecipes: "Nenhuma receita cadastrada",
    ingredientsLabel: "🛒 Ingredientes",
    howToMakeLabel: "👨‍🍳 Como fazer",
    noDetails: "Sem detalhes cadastrados",
    recipeName: "Nome da receita...",
    ingredientsPerLine: "Ingredientes (um por linha)...",
    howToPrepare: "Modo de preparo...",
    cancel: "Cancelar",
    save: "✅ Salvar",
    addRecipe: "Adicionar Receita",
    search: "Buscar",
    alreadyInCollection: "já está na sua coleção",

    // Production sheet
    add: "Adicionar",
    chooseType: "Escolha o tipo de preparo",
    defineQty: "Defina a quantidade e data",
    itemAdded: "Item adicionado com sucesso!",
    neutralBase: "Base Neutra (congelada sem tempero)",
    neutralBaseCarb: "Base Neutra (arroz, massa, batata)",
    neutralBaseVeggie: "Base Neutra (legumes cozidos/assados)",
    neutralBaseFlavor: "Base Neutra (molho base, conserva)",
    readyProtein: "🍲 Prato Pronto de Proteína",
    readyCarb: "🍲 Prato Pronto de Carboidrato",
    readyVeggie: "🍲 Prato Pronto de Legumes",
    readyFlavor: "🍲 Molho/Conserva Finalizado",

    // Location
    freezer: "Freezer",
    fridge: "Geladeira",
    storageLocation: "Local de armazenamento",

    // Smart roulette
    freshlyCooked: "Prato Fresco (acabou de fazer)",
    smartPairingMsg:
      "Misture seu prato fresco com itens antigos do estoque para rotacionar!",
    lazyDayMsg:
      "Roleta do Jantar: Resgatando os itens mais antigos do seu estoque.",
    restDay: "Estoque saudável! Dia de folga. 🎉",
    or: "ou",
    fromRecipeBank: "do banco de receitas",
    recipeDishName: "Nome da receita",
    itemName: "Nome do item",
    portionQty: "Quantidade de porções",
    productionDate: "Data de produção",
    addToStockBtn: "✅ Adicionar ao Estoque",
    writeLabel: "Escreva na etiqueta:",
    close: "Fechar",
    selectedRecipe: "Receita selecionada",

    // Ingredient manager
    ingredientTitle: "🧅 Ingredientes",
    controlStock: "Controle o estoque dos seus ingredientes",
    addIngredient: "Adicionar Ingrediente",
    noIngredients: "Nenhum ingrediente cadastrado",
    name: "Nome",
    quantity: "Quantidade",
    unit: "Unidade",
    expiryDate: "Data de validade",
    expired: "VENCIDO",
    expiresOn: "Vence",

    // Shopping list
    shoppingTitle: "Lista de Compras",
    basedOnRecipes: "Baseada nas suas receitas e ingredientes em estoque",
    registerRecipes: "Cadastre receitas com ingredientes para gerar a lista",
    allIngredientsOk: "Você tem todos os ingredientes!",

    // Settings
    settings: "⚙️ Configurações",
    semaphoreLimits: "Limites do Semáforo",
    redLimit: "🔴 Limite Vermelho (Crítico) — até quantas porções?",
    yellowLimit: "🟡 Limite Amarelo (Atenção) — até quantas porções?",
    aboveYellow: "Acima do limite amarelo = 🟢 Verde (Confortável)",
    saveSettings: "💾 Salvar Configurações",
    about: "Sobre",
    aboutText:
      "🍳 Cozinha 4x1 — Gerenciador de estoque de refeições congeladas usando a metodologia de Estoque Cumulativo.",
    dataLocal: "Todos os dados são salvos localmente no seu navegador.",
    cloudSync: "Sincronizar com a Cloud",
    cloudSyncDesc:
      "Salve seus dados na nuvem para acessar de qualquer dispositivo",
    loginGoogle: "Entrar com Google",
    logout: "Sair",
    loggedAs: "Logado como",
    cloudComingSoon: "Integração com a Cloud em breve!",
    appearance: "Aparência",
    darkMode: "Modo escuro",
    language: "Idioma",
    portuguese: "Português",
    english: "English",

    noRecipesRegistered:
      "Não há receitas cadastradas! Cadastre ao menos uma receita.",
    yield: "Rendimento",
    ingredientsPerLineQty: "Ingredientes (um por linha, ex: cebola 2 un)...",
    natura: "Natura (ambiente)",
    storageType: "Refrigeração",
    householdSize: "Pessoas na casa",
    householdSizeDesc:
      "Usado para calcular o multiplicador de porções nas sugestões de receitas",
    suggestedMultiplier: "Multiplicador sugerido",
    portionsForPeople: "porções para",
    people: "pessoas",
    days: "dias",
    inStock: "Em estoque",
    missing: "Falta",
    toBuy: "Comprar",
    has: "Tem",

    // FAB
    added: "adicionado!",

    // Stock viewer
    stockViewerTitle: "📦 Estoque Completo",
    stockViewerDesc: "Todos os itens e pratos prontos no seu estoque",
    expiredItems: "Itens Vencidos",
    validItems: "Itens Válidos",
    expiredAlert: "Produtos vencidos! Descarte-os.",
    viewStock: "📦 Ver estoque",
    discardAll: "Descartar todos",

    // Create Account
    createAccount: "Criar Conta",
    createAccountDesc:
      "Quer usar sincronização na nuvem e acessar seus dados de vários dispositivos?",
    learnAboutAccount: "Saiba Mais Sobre Criação de Conta",
    aboutAccountCreation: "Sobre a Criação de Conta",
    notCommercialProject: "Este não é um projeto comercial.",
    contactToUse:
      "Se você quiser usar e testar ou disponibilizar, entre em contato:",
    futurePlans: "🚀 Planos Futuros",
    ifProjectHits: "Se este projeto atingir",
    usersRequests: "usuários/solicitações",
    canStartCommercial:
      "posso iniciar o projeto comercial e fornecer novos recursos como:",
    recipeHub: "Hub de Receitas",
    mobileNativeApp: "Aplicativo Nativo Mobile (iOS/Android)",
    integratedAI: "IA Integrada para Chef Pessoal",
    recipeBuilderAI: "Construtor de Receitas com IA",
    chefHub: "Hub de Chefs para contratar um chef humano para criar receitas",
    nutritionistLists: "Listas de nutricionistas para ajudar na sua dieta",
    andMuchMore: "E muito mais!",
    yourInterest:
      "Seu interesse e feedback são valiosos para fazer este projeto crescer! 🍳",
    gotIt: "Entendi!",

    // Recipe Hub
    hubTitle: "Hub de Receitas",
    hubDesc: "Descubra novas receitas da comunidade e adicione à sua coleção",
    addToMyRecipes: "Adicionar às minhas receitas",
    recipeAdded: "Receita adicionada!",
    loadingHub: "Carregando o hub...",
    hubSearchPlaceholder: "Buscar receitas...",
    hubCTATitle: "Sem ideias?",
    hubCTADesc: "Explore o Hub de Receitas para descobrir novos sabores e adicionar à sua coleção!",
    openHub: "Explorar Hub de Receitas",
    hubLibraryTitle: "Banco de Receitas do Hub",
    noRecipesFound: "Nenhuma receita encontrada",
    popularRecipes: "Mais Populares",
    searchExternalHub: "🔍 Buscar no Hub Externo (MealDB)",
    viewDetails: "Ver Detalhes",
    sharedBy: "Compartilhado por",
    externalResults: "Resultados Externos",
    
    // Unified Search
    unifiedSearchTitle: "Busca Unificada de Receitas",
    unifiedSearchPlaceholder: "Busque por nome ou ID (ex: Frango ou 52772)",
    unifiedSearchTipTitle: "Dica de Busca:",
    unifiedSearchTipDesc: "Se você digitar números, buscaremos o ID exato. Se digitar texto, usaremos busca inteligente (Fuzzy Search) com tradução automática.",
    searchingAndTranslating: "Consultando e traduzindo receitas...",
    backToResults: "Voltar aos resultados",
    saveToMyHub: "Salvar no Meu Hub",
    youtube: "YouTube",
    noResultsFound: "Nenhuma receita corresponde à sua busca.",
    searchError: "Erro na busca.",
    recipeNotFound: "Receita não encontrada.",
    
    // Engine
    engineJustification: "Faça {recipe} para salvar ingredientes que estão vencendo e repor seu estoque de {category}!",
    pantryCheckNote: "Você já tem {qty} {unit}",
    generalSection: "Geral",
    aiNotFoundTitle: "Gemini Nano não encontrado",
    aiNotFoundDesc: "Ative as Flags do Chrome e baixe o modelo (Optimization Guide) em chrome://components para habilitar a tradução local.",
  },
  en: {
    appTitle: "🍳 If I Cook, Everyone Eats",

    protein: "Protein",
    carb: "Carbs",
    veggie: "Veggies",
    flavor: "Sauces/Preserves",

    beef: "Beef",
    chicken: "Chicken",
    pork: "Pork",
    fish: "Fish",

    weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    production: "Production",
    consumption: "Consumption",
    expiration: "Expiration",
    noActivity: "No activity on this day",
    productionRegistered: "Production registered",
    consumptionRegistered: "Consumption registered",
    expirations: "Expirations",

    missionTitle: "🎯 Daily Mission",
    urgent: "URGENT",
    stockOf: "Your stock of",
    isCritical: "is critical",
    isLow: "is low",
    isOk: "is ok",
    todayMake: "Today is the day to make:",
    clickToDiscover: "Click to find out what to cook today!",
    generateRecipe: "Generate Recipe",
    generateAnother: "Generate another",
    viewRecipe: "View recipe",
    addToStock: "Add to stock",
    ingredients: "🛒 Ingredients",
    howToMake: "👨‍🍳 How to Make",

    whatToEat: "🎰 What are we eating?",
    manualConsume: "📋 Manual consume",
    recipes: "📖 Recipes",
    ingredientsBtn: "🧅 Ingredients",
    shopping: "🛒 Shopping",

    rouletteTitle: "🎰 Dinner Roulette",
    emptyStock: "Your stock is empty! Add ready meals first.",
    spinToAssemble: "Spin to assemble today's meal!",
    spinning: "Spinning...",
    spin: "🎲 Spin!",
    accept: "✅ Accept (consume)",
    spinAgain: "🔄 Spin again",
    madeOn: "made on",
    emptyStockShort: "Empty stock!",

    manualTitle: "📋 Manual Consume",
    selectConsumed: "Select the item you consumed",
    portions: "portions",
    emptyAddFirst: "Empty stock! Add items first.",

    recipeBookTitle: "Recipe Book",
    yourRecipes: "Your recipes for daily missions",
    noRecipes: "No recipes registered",
    ingredientsLabel: "🛒 Ingredients",
    howToMakeLabel: "👨‍🍳 How to make",
    noDetails: "No details registered",
    recipeName: "Recipe name...",
    ingredientsPerLine: "Ingredients (one per line)...",
    howToPrepare: "How to prepare...",
    cancel: "Cancel",
    save: "✅ Save",
    addRecipe: "Add Recipe",
    search: "Search",
    alreadyInCollection: "is already in your collection",

    add: "Add",
    chooseType: "Choose the type of preparation",
    defineQty: "Set quantity and date",
    itemAdded: "Item added successfully!",
    neutralBase: "Neutral Base (frozen, unseasoned)",
    neutralBaseCarb: "Neutral Base (rice, pasta, potato)",
    neutralBaseVeggie: "Neutral Base (cooked/roasted veggies)",
    neutralBaseFlavor: "Neutral Base (base sauce, preserve)",
    readyProtein: "🍲 Ready Protein Dish",
    readyCarb: "🍲 Ready Carb Dish",
    readyVeggie: "🍲 Ready Veggie Dish",
    readyFlavor: "🍲 Finished Sauce/Preserve",

    // Location
    freezer: "Freezer",
    fridge: "Fridge",
    storageLocation: "Storage location",

    // Smart roulette
    freshlyCooked: "Fresh Dish (just made)",
    smartPairingMsg: "Mix your fresh dish with old stock items to rotate!",
    lazyDayMsg: "Dinner Roulette: Rescuing the oldest items from your stock.",
    restDay: "Healthy stock! Rest day. 🎉",
    or: "or",
    fromRecipeBank: "from recipe book",
    recipeDishName: "Recipe name",
    itemName: "Item name",
    portionQty: "Number of portions",
    productionDate: "Production date",
    addToStockBtn: "✅ Add to Stock",
    writeLabel: "Write on the label:",
    close: "Close",
    selectedRecipe: "Selected recipe",

    ingredientTitle: "🧅 Ingredients",
    controlStock: "Control your ingredient stock",
    addIngredient: "Add Ingredient",
    noIngredients: "No ingredients registered",
    name: "Name",
    quantity: "Quantity",
    unit: "Unit",
    expiryDate: "Expiry date",
    expired: "EXPIRED",
    expiresOn: "Expires",

    shoppingTitle: "Shopping List",
    basedOnRecipes: "Based on your recipes and ingredients in stock",
    registerRecipes: "Add recipes with ingredients to generate the list",
    allIngredientsOk: "You have all the ingredients!",

    settings: "⚙️ Settings",
    semaphoreLimits: "Semaphore Limits",
    redLimit: "🔴 Red Limit (Critical) — up to how many portions?",
    yellowLimit: "🟡 Yellow Limit (Warning) — up to how many portions?",
    aboveYellow: "Above yellow limit = 🟢 Green (Comfortable)",
    saveSettings: "💾 Save Settings",
    about: "About",
    aboutText:
      "🍳 Kitchen 4x1 — Frozen meal stock manager using the Cumulative Stock methodology.",
    dataLocal: "All data is saved locally in your browser.",
    cloudSync: "Sync with Cloud",
    cloudSyncDesc: "Save your data in the cloud to access from any device",
    loginGoogle: "Sign in with Google",
    logout: "Sign out",
    loggedAs: "Logged in as",
    cloudComingSoon: "Cloud integration coming soon!",
    appearance: "Appearance",
    darkMode: "Dark mode",
    language: "Language",
    portuguese: "Português",
    english: "English",

    noRecipesRegistered:
      "No recipes registered! Add at least one recipe first.",
    yield: "Yield",
    ingredientsPerLineQty: "Ingredients (one per line, e.g.: onion 2 units)...",
    natura: "Room temp",
    storageType: "Storage",
    householdSize: "People in household",
    householdSizeDesc:
      "Used to calculate portion multiplier in recipe suggestions",
    suggestedMultiplier: "Suggested multiplier",
    portionsForPeople: "portions for",
    people: "people",
    days: "days",
    inStock: "In stock",
    missing: "Missing",
    toBuy: "Buy",
    has: "Has",

    added: "added!",

    // Stock viewer
    stockViewerTitle: "📦 Full Stock",
    stockViewerDesc: "All items and ready meals in your stock",
    expiredItems: "Expired Items",
    validItems: "Valid Items",
    expiredAlert: "Expired products! Discard them.",
    viewStock: "📦 View stock",
    discardAll: "Discard all",

    // Create Account
    createAccount: "Create Account",
    createAccountDesc:
      "Want to use cloud sync and access your data from multiple devices?",
    learnAboutAccount: "Learn About Account Creation",
    aboutAccountCreation: "About Account Creation",
    notCommercialProject: "This is not a commercial project.",
    contactToUse:
      "If you want to use and test it or want to make it available, please contact:",
    futurePlans: "🚀 Future Plans",
    ifProjectHits: "If this project hits",
    usersRequests: "users/requests",
    canStartCommercial:
      "I can start the commercial project and provide new features like:",
    recipeHub: "Recipe Hub",
    mobileNativeApp: "Mobile Native Application (iOS/Android)",
    integratedAI: "Integrated AI for Personal Chef",
    recipeBuilderAI: "Recipe Builder AI",
    chefHub: "Chef Hub to hire a human chef to create recipes",
    nutritionistLists: "Nutritionist lists to help you in your diet",
    andMuchMore: "And much more!",
    yourInterest:
      "Your interest and feedback are valuable to make this project grow! 🍳",
    gotIt: "Got it!",

    // Recipe Hub
    hubTitle: "Recipe Hub",
    hubDesc: "Discover new recipes from the community and add them to your collection",
    addToMyRecipes: "Add to my recipes",
    recipeAdded: "Recipe added!",
    loadingHub: "Loading hub...",
    hubSearchPlaceholder: "Search recipes...",
    hubCTATitle: "No ideas?",
    hubCTADesc: "Explore the Recipe Hub to discover new flavors and add them to your collection!",
    openHub: "Explore Recipe Hub",
    hubLibraryTitle: "Hub Recipe Library",
    noRecipesFound: "No recipes found",
    popularRecipes: "Most Popular",
    searchExternalHub: "🔍 Search External Hub (MealDB)",
    viewDetails: "View Details",
    sharedBy: "Shared by",
    externalResults: "External Results",

    // Unified Search
    unifiedSearchTitle: "Unified Recipe Search",
    unifiedSearchPlaceholder: "Search by name or ID (ex: Chicken or 52772)",
    unifiedSearchTipTitle: "Search Tip:",
    unifiedSearchTipDesc: "If you type numbers, we will look for the exact ID. If you type text, we will use smart fuzzy search with automatic translation.",
    searchingAndTranslating: "Searching and translating recipes...",
    backToResults: "Back to results",
    saveToMyHub: "Save to My Hub",
    youtube: "YouTube",
    noResultsFound: "No recipes match your search.",
    searchError: "Search error.",
    recipeNotFound: "Recipe not found.",

    // Engine
    engineJustification: "Make {recipe} to save ingredients that are about to expire and restock your {category}!",
    pantryCheckNote: "You already have {qty} {unit}",
    generalSection: "General",
    aiNotFoundTitle: "Gemini Nano not found",
    aiNotFoundDesc: "Enable Chrome Flags and download the model (Optimization Guide) at chrome://components to enable local translation.",
  },
} as const;

export type TranslationKey = keyof typeof translations.pt | (string & {});

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => any;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANG_KEY = "cozinha4x1_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      return (localStorage.getItem(LANG_KEY) as Language) || "pt";
    } catch {
      return "pt";
    }
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  const t = (key: TranslationKey): any => {
    // Handle dynamic keys with placeholders like "key|p1:v1,p2:v2"
    if (typeof key === "string" && key.includes("|")) {
      const [realKey, paramsStr] = key.split("|");
      let text = (translations[lang] as any)[realKey] || realKey;
      
      if (paramsStr) {
        const params = paramsStr.split(",");
        params.forEach(p => {
          const [k, v] = p.split(":");
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    }

    const val = (translations[lang] as any)[key];
    return val !== undefined ? val : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
