# SCTMC - Se eu Cozinho Todo Mundo Come

> A smart kitchen inventory management system that helps you track ingredients, plan meals, and reduce food waste.

## 🎯 Overview

SCTMC (Se eu Cozinho Todo Mundo Come) is a comprehensive kitchen management application designed to help households manage their food inventory, track expiration dates, plan meals, and create shopping lists. The application works offline-first with optional cloud synchronization for multi-device access.

## 🎯 Project Philosophy

### The Core Concept

SCTMC implements a **"Cook One Meal Per Day, Grow Your Stock"** philosophy combined with smart inventory management.

### How It Works

#### 1. **Daily Cooking Habit**

Cook one meal per day and make extra portions:

- Cook 3-4 portions instead of just one
- Eat one portion immediately
- Store the rest for future meals
- Your ready-to-eat stock grows naturally over time

#### 2. **Inventory Intelligence**

The app uses a **traffic light system** to help you manage your ingredients:

- 🔴 **Red Zone**: Critical - use immediately
- 🟡 **Yellow Zone**: Warning - plan to use soon
- 🟢 **Green Zone**: Healthy stock

#### 3. **Meal Variety**

With basic ingredients, you can create endless combinations:

- Different proteins, carbs, and vegetables
- Various cooking styles and flavor profiles
- Never get bored with your meals

### The SCTMC Method

#### Step 1: Set Up Your Inventory

1. Add your current ingredients to the app
2. Set expiration dates
3. Configure your preferences

#### Step 2: Shop Smart

1. Check your inventory before shopping
2. Buy based on what you need
3. Focus on versatile ingredients

#### Step 3: Cook Daily

1. Cook one meal per day with extra portions
2. Eat one portion immediately
3. Store the rest for later
4. Track your consumption in the app

#### Step 4: Watch Your Stock Grow

1. Your ready-to-eat meals accumulate
2. Less time cooking over time
3. Always have food ready when you need it

## ✨ Features

### 📦 Inventory Management

- Track all your kitchen ingredients and items
- Monitor expiration dates with visual indicators (traffic light system)
- Automatic alerts for expiring items
- Categorize items by type (protein, carbs, vegetables, etc.)
- Manual consumption tracking

### 🍳 Recipe Management

- Create and store your favorite recipes
- Link recipes to inventory items
- Track recipe history and frequency
- Portion calculator based on household size

### 🛒 Shopping List

- Automatically generate shopping lists based on inventory
- Track what you need to buy
- Organize by categories

### 📊 Analytics & Insights

- Track consumption patterns
- Monitor food waste
- View inventory statistics
- Monthly calendar view of meals

### ☁️ Cloud Sync (Optional)

- Local-first architecture (works offline)
- Optional cloud synchronization via Firebase
- Multi-device access with automatic data merging
- Secure authentication with email/password
- Smart conflict resolution

### 🎨 User Experience

- Dark/Light theme support
- Multi-language support (Portuguese/English)
- Responsive design for mobile and desktop
- Intuitive traffic light system for stock levels

## 🏗️ Architecture

### Technology Stack

#### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Framer Motion** - Animations

#### Backend & Services

- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Cloud database
- **Firebase Analytics** - Usage tracking
- **LocalStorage** - Offline data persistence

#### State Management

- React Context API for theme and language
- Custom hooks for data management
- Local-first with cloud sync strategy

### Project Structure

```
sctmc/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── DinnerRoulette.tsx
│   │   ├── ExpiredAlerts.tsx
│   │   ├── Header.tsx
│   │   ├── IngredientManager.tsx
│   │   ├── ManualConsume.tsx
│   │   ├── MonthCalendar.tsx
│   │   ├── ProductionSheet.tsx
│   │   ├── RecipeBook.tsx
│   │   ├── ShoppingList.tsx
│   │   ├── StockIndicators.tsx
│   │   └── StockViewer.tsx
│   │
│   ├── contexts/           # React contexts
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useIngredients.ts
│   │   ├── useInventory.ts
│   │   ├── useRecipes.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                # Utility libraries
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── utils.ts        # Helper functions
│   │
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── Settings.tsx    # Settings page
│   │   └── NotFound.tsx    # 404 page
│   │
│   ├── services/           # Business logic services
│   │   ├── authService.ts      # Authentication
│   │   ├── storageService.ts   # Data persistence & sync
│   │   └── analyticsService.ts # Analytics tracking
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── ingredient.ts
│   │   ├── inventory.ts
│   │   └── recipe.ts
│   │
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── .env                    # Environment variables
└── package.json            # Dependencies
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (React Components + shadcn/ui + Tailwind CSS)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Custom Hooks Layer                      │
│  (useInventory, useRecipes, useIngredients)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Services Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Service │  │Storage Service│  │Analytics Svc │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ LocalStorage │          │   Firebase   │
│  (Primary)   │◄────────►│   (Cloud)    │
└──────────────┘          └──────────────┘
```

### Storage Strategy

#### Local-First Architecture

1. **Primary Storage**: Browser's localStorage
2. **Cloud Backup**: Firebase Firestore (optional)
3. **Sync Strategy**: Smart merge on login/sync

#### Data Synchronization

- **First Login**: Local data uploaded to cloud
- **New Device**: Cloud data downloaded to local
- **Merge**: Intelligent deduplication using item IDs
- **Conflict Resolution**: Cloud version takes precedence
- **Real-time**: Optional real-time sync with Firestore listeners

### Security

#### Authentication

- Email/password authentication via Firebase Auth
- Secure password hashing (handled by Firebase)
- Session management with auth state listeners

#### Data Access

- Firestore security rules enforce user isolation
- Users can only access their own data
- No anonymous access to cloud data
- Environment variables for sensitive configuration

#### Privacy

- Local data never leaves device unless cloud sync is enabled
- User controls when to enable cloud sync
- Data can be deleted at any time

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Firebase account (for cloud features)
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sctmc
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase** (optional, for cloud features)

   Follow the detailed guide in `FIREBASE_SETUP.md`

5. **Start development server**

   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Open in browser**

   Navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎨 Customization

### Theme

- Edit `src/contexts/ThemeContext.tsx` for theme logic
- Modify `tailwind.config.ts` for color schemes
- Update `src/index.css` for global styles

### Languages

- Add translations in `src/contexts/LanguageContext.tsx`
- Supported languages: Portuguese (pt), English (en)

### Components

- All UI components are in `src/components/`
- Base components from shadcn/ui in `src/components/ui/`

## 📊 Analytics Events

The application tracks the following events:

- User authentication (login, signup, logout)
- Cloud sync toggle
- Data synchronization
- Settings changes
- Inventory operations
- Recipe interactions
- Shopping list creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with React and TypeScript
- UI components from shadcn/ui
- Icons from Lucide React
- Backend powered by Firebase

## 📧 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**SCTMC** - Making kitchen management simple and efficient! 🍳
