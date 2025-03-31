import "~/global.css";

import { DarkTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SplashScreenComponent } from "~/components/SplashScreen";

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

  if (!isReady) {
    return <SplashScreenComponent />;
  }

  return (
    <ThemeProvider value={DARK_THEME}>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Cartoonify - Ghibli",
          }}
        />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
