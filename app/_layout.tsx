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

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

async function preloadData() {
  try {
    const historyJson = await AsyncStorage.getItem('conversion_history');
    
    const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    
    return true;
  } catch (error) {
    console.error("Error preloading data:", error);
    return true;
  }
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        
        await preloadData();
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error preparing app:", error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      const checkOnboarding = async () => {
        try {
          const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          
          if (onboardingComplete === 'true') {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          router.replace('/(tabs)');
        }
      };

      checkOnboarding();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreenComponent />
      </SafeAreaProvider>
    );
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
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="onboarding" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
        </Stack>
      </SafeAreaProvider>
      <PortalHost />
    </ThemeProvider>
  );
}
