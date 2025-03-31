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

// Bu fonksiyon gerekli verileri önceden yükler
async function preloadData() {
  try {
    // History verilerini önceden yükle
    const historyJson = await AsyncStorage.getItem('conversion_history');
    console.log("Preloaded history data:", historyJson ? "Found" : "Not found");
    
    // Onboarding durumunu kontrol et
    const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    console.log("Onboarding status:", onboardingComplete === 'true' ? "Completed" : "Not completed");
    
    return true;
  } catch (error) {
    console.error("Error preloading data:", error);
    return true; // Hata olsa bile devam et
  }
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Splash ekranını göster
        await SplashScreen.preventAutoHideAsync();
        
        // Tüm verileri önceden yükle
        await preloadData();
        
        // 2 saniye bekle - hem splash görünsün hem veriler yüklensin
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error preparing app:", error);
      } finally {
        // Uygulama hazır
        setIsReady(true);
        // Splash ekranını gizle
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);

  useEffect(() => {
    // Uygulama hazır olduğunda çalışır
    if (isReady) {
      // Onboarding durumunu kontrol et
      const checkOnboarding = async () => {
        try {
          const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          
          // Onboarding tamamlandıysa tabslara git, değilse onboarding'e
          if (onboardingComplete === 'true') {
            router.replace('/(tabs)');
          } else {
            // Onboarding yok, direkt tabslara git ve onboarding tamamlandı olarak işaretle
            AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Hata durumunda tabs'a git
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
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
      <PortalHost />
    </ThemeProvider>
  );
}
