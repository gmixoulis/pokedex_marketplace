import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import "../global.css";
import { NAV_THEME } from "../lib/theme";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (colorScheme) {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [colorScheme]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <Stack>
        <Stack.Screen name="index" options={{
          headerLargeTitle: true,
          headerTransparent: false,
          title: "Pokedex",
        }} />



      </Stack>

      <PortalHost />
    </ThemeProvider>
  );
}
