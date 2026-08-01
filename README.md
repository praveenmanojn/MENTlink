# PeerLink Mobile Application

## Overview

PeerLink is a React Native (Expo) mobile application designed with a scalable, modular architecture to enable three developers to work independently on Student, Mentor, and Backend modules without merge conflicts.

### Tech Stack

- **React Native (Expo)**
- **TypeScript**
- **React Navigation** (Stack + Bottom Tab)
- **Supabase** (Backend as a Service)
- **Expo Router** (optional, not used in this base)
- **NativeWind** (CSS-in-JS styling)
- **React Hook Form**
- **Zustand** (global state)
- **TanStack Query** (server-state management)
- **AsyncStorage**
- **Expo Notifications**

## Folder Structure

```
src/
├── assets/               # Images, icons, fonts, etc.
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   └── LoadingSpinner.tsx
│   └── ...               # Feature-specific components
├── constants/            # Application constants
├── hooks/                # Custom React hooks (if any)
├── navigation/           # React Navigation configuration
│   ├── AuthStack.tsx
│   ├── MainTabs.tsx
│   └── Index.tsx
├── screens/              # Screen-level components
│   ├── auth/
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── RoleSelectionScreen.tsx
│   ├── student/
│   │   ├── HomeScreen.tsx
│   │   ├── AskDoubtScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── HistoryScreen.tsx
│   ├── mentor/
│   │   ├── DashboardScreen.tsx
│   │   ├── RequestsScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── RatingsScreen.tsx
│   └── admin/
│       ├── DashboardScreen.tsx
│       ├── UsersScreen.tsx
│       └── AnalyticsScreen.tsx
├── services/
│   ├── supabase/
│   │   └── client.ts     # Supabase client instance
│   ├── auth/
│   ├── location/
│   ├── notifications/
│   └── storage/
├── store/                # Zustand stores
│   ├── authStore.ts
│   ├── userStore.ts
│   └── themeStore.ts
├── types/                # TypeScript types and interfaces
├── utils/                # Helper functions
│   ├── dateFormatter.ts
│   ├── validation.ts
│   ├── constants.ts
│   ├── errorHandler.ts
│   └── logger.ts
├── theme/                # NativeWind theme configuration
│   └── index.ts
└── App.tsx               # Root component with QueryClientProvider
```

## Getting Started

### Prerequisites

- **Node.js** (v20.x)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)

### Installation

```bash
git clone <repo-url>
cd peer-peer
npm install
```

### Environment Setup

Create a `.env` file at the project root with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The `EXPO_PUBLIC_` prefix makes variables available to the Expo app.

### Development

```bash
npm run start   # starts Expo dev server
```

The app will open in Expo Go on your device or a simulator.

### Building for Production

```bash
expo build:android   # or expo build:ios
```

## Coding Standards

- **TypeScript** strict mode enabled.
- **Prettier** for formatting (see `.prettierrc`).
- **ESLint** for linting (see `.eslintrc.js`).
- Use **camelCase** for variable names and **PascalCase** for components and types.
- Keep components small and focused; extract reusable UI pieces into `components/common`.
- Prefer **functional components** with hooks over class components.
- Use **descriptive prop names** and **JSDoc** comments for clarity.

## Branch Strategy

- **main** – production-ready code.
- **feature/<name>** – new feature development.
- **bugfix/<name>** – fix a bug.
- **hotfix/<name>** – urgent production fix.
- All developers should **pull** the latest `main` before starting a new branch.

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client-side access |

## Live Audio/Video Calls (Expo Go Compatible)

> [!NOTE]
> Live Audio and Video calls in PeerLink use **Jitsi Meet** loaded inside a WebView (`react-native-webview`).
> 
> This approach is **100% Expo Go compatible**—no native build or custom development client is required! You can test calls directly using the standard Expo Go mobile app.

## License

MIT License

---

*Generated with ❤️ using React Native, Expo, and TypeScript.*