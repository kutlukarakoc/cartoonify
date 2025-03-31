import "~/global.css";

import { DarkTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SplashScreenComponent } from "~/components/SplashScreen";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Define a key for onboarding state
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    // Check if onboarding was completed
    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        
        // After a small delay to show splash screen, redirect to the proper screen
        setTimeout(() => {
          // If onboarding was completed, go to (tabs), else go to onboarding
          if (onboardingComplete === 'true') {
            router.replace('/(tabs)');
          } else {
            // If there's an onboarding flow, uncomment this line
            // router.replace('/onboarding');
            
            // For now, just go to tabs and mark onboarding as complete
            AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            router.replace('/(tabs)');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to tabs on error
        router.replace('/(tabs)');
      }
    };

    checkOnboarding();
  }, []);

  if (!isReady) {
    return <SplashScreenComponent />;
  }

  return (
    <ThemeProvider value={DARK_THEME}>
      <StatusBar style="light" />
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Cartoonify - Ghibli",
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
      <PortalHost />
    </ThemeProvider>
  );
}
