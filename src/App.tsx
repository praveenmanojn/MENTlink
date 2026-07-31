import React from 'react';
import { Navigation } from './navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@windicramble/nativewind';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { supabase } from './services/supabase/client';
import { useEffect } from 'react';
import { theme } from './theme';

const App = () => {
  const queryClient = useQueryClient();

  // Optional: listen to auth changes
  const { isAuthenticated } = useAuthStore();
  const { isDark } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;