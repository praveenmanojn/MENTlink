# MENTlink

## Overview

MENTlink is a React Native (Expo) application that connects students and mentors through a scalable and modular architecture, allowing multiple developers to work simultaneously with minimal merge conflicts.

### Tech Stack

* React Native (Expo)
* TypeScript
* React Navigation
* Supabase
* NativeWind
* Zustand
* TanStack Query
* AsyncStorage
* Expo Notifications
* React Hook Form

---

## Project Structure

```text
src/
├── assets/
├── components/
├── constants/
├── hooks/
├── navigation/
├── screens/
│   ├── auth/
│   ├── student/
│   ├── mentor/
│   └── admin/
├── services/
├── store/
├── types/
├── utils/
├── theme/
└── App.tsx
```

---

## Installation

```bash
git clone <repository-url>
cd MENTlink
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Running the Application

```bash
npm run start
```

The application can be tested using:

* Expo Go
* Android Emulator
* iOS Simulator

---

## Coding Standards

* Use TypeScript strict mode.
* Follow ESLint and Prettier guidelines.
* Use camelCase for variables.
* Use PascalCase for components.
* Build reusable components whenever possible.

---

## Branching Strategy

* `main` – Stable code
* `feature/<name>` – New features
* `bugfix/<name>` – Bug fixes
* `hotfix/<name>` – Critical fixes

---

## Team CONQCODE

| Role                             | Member          | Register Number |
| -------------------------------- | --------------- | --------------- |
| Team Lead                        | Praveen Manoj N | 7376252AL190    |
| Backend and Frontend             | V Abinandh      | 7376252AL239    |
| Database                         | Krithick Raj    | 7376251CS264    |
| Documentation and Log Management | Sanjay S        | 7376252AL207    |

---

## Audio and Video Calls

MENTlink uses Jitsi Meet through WebView integration, allowing users to access voice and video calls directly from Expo Go.

---

## License

MIT License

---

**Developed by Team CONQCODE ❤️**
