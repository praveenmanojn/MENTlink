import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './navigation';
import { queryClient } from './utils/queryClient';

/**
 * PeerLink App Entry Point
 *
 * Font loading note:
 * If @expo-google-fonts/poppins is installed, add:
 *   import { useFonts, Poppins_400Regular, Poppins_500Medium,
 *            Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold }
 *     from '@expo-google-fonts/poppins';
 *   const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium,
 *            Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });
 *   if (!fontsLoaded) return <LoadingSpinner />;
 *
 * Until then, the app renders with system fonts as a fallback.
 * fontFamily values in the theme files are written to match Expo font names.
 */
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" backgroundColor="#F5F0E8" />
          <Navigation />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
