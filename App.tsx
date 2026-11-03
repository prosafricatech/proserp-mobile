import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { AppThemeProvider, useAppTheme } from './src/theme/ThemeProvider';

// react-native-drawer-layout (behind @react-navigation/drawer) passes a dependency array to
// Reanimated's useAnimatedStyle; on native Reanimated ignores it and warns. Harmless and not
// ours to fix (it's library code), so silence exactly that message and nothing else.
LogBox.ignoreLogs(['[Reanimated] Dependencies should only be used on the web']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const ThemedNavigation = () => {
  const { navigationTheme, isDark } = useAppTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
};

export default function App() {
  // NoirPro is the web app's font (live-repo @assets/fonts/noir-pro), converted from woff to ttf.
  const [fontsLoaded] = useFonts({
    // Paper's icon font; preloaded so icons never flash as empty boxes.
    ...MaterialCommunityIcons.font,
    'NoirPro-Regular': require('./assets/fonts/NoirPro-Regular.ttf'),
    'NoirPro-Medium': require('./assets/fonts/NoirPro-Medium.ttf'),
    'NoirPro-SemiBold': require('./assets/fonts/NoirPro-SemiBold.ttf'),
    'NoirPro-Bold': require('./assets/fonts/NoirPro-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    // The drawer's swipe gestures need react-native-gesture-handler's root view.
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        {/* Tracks the keyboard frame by frame so forms can keep the focused field visible. */}
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
              <AuthProvider>
                <ThemedNavigation />
              </AuthProvider>
            </AppThemeProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
