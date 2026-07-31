# Project Memory

## Overview
- **Project Name**: MENTlink (also referred to as PeerLink in documentation)
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand (global state), TanStack Query (server-state)
- **Styling**: React Native StyleSheet / Theme Tokens
- **Navigation**: React Navigation (Stack + Bottom Tab)
- **Backend/Database**: Supabase
- **Forms**: React Hook Form / Native Controlled Inputs

## Architecture
- Modules are separated into: `auth`, `student`, `mentor`, `admin`
- Screens are located in `src/screens/` under their respective modules.
- Reusable UI elements are kept in `src/components/common/`.
- Navigation structure is managed in `src/navigation/` (`AuthStack`, `MainTabs`, `RootNavigation`, `index.ts`).
- Navigation types are defined in `src/types/navigation.ts`.
- Global state is handled via Zustand (`src/store/`).
- Backend communication and API configuration with Supabase is housed in `src/services/`.

## Key Coding Standards
- Strictly functional components using hooks.
- PascalCase for components and types, camelCase for variables/functions.
- Rely on custom hooks and separation of concerns.

## Environment & Build
- Configuration files: `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`.
- Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.

## Current State / Ongoing Work
- **Root & Navigation Setup Complete**: Configured Expo app structure and React Navigation stacks.
- **Theme & Design System**: Created `src/theme/index.ts` with color tokens, typography, spacing, border radii, and shadows.
- **Common UI Components**: Upgraded `Button`, `TextInput`, `Card`, `Badge`, `Avatar`, `LoadingSpinner`, `EmptyState`, `SearchBar` using clean React Native primitives.
- **Welcome / Splash Page Built**: Created feature-rich Welcome Screen in `src/screens/auth/SplashScreen.tsx` with MENTlink branding, feature highlight cards, community stats, "Get Started" CTA, and "Log In" redirect.
- **Auth Flow & Dummy Logins Configured**:
  - `LoginScreen.tsx` configured with dummy accounts:
    - **Teacher / Mentor**: username `teacher`, pass `123t`
    - **Student**: username `student`, pass `123s`
    - **Admin**: username `admin`, pass `123a`
  - Added Quick-Fill chips on LoginScreen for single-tap login during demo/testing.
- **Role-Aware Main Tabs**: `MainTabs.tsx` dynamically routes users to Teacher/Mentor screens, Student screens, or Admin screens based on authenticated role.
- **Student Screens Added**: Created `ActivityScreen.tsx`, `NotificationsScreen.tsx`, and `ProfileScreen.tsx` under `src/screens/student/`.
