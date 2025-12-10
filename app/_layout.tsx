import { ThemeProvider } from "@react-navigation/native";
import { AppKitProvider } from '@reown/appkit-react-native';
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WagmiProvider } from 'wagmi';

import "../global.css";
import { appKit, wagmiConfig } from "../hooks/AppKitConfig";
import { NAV_THEME } from "../lib/theme";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    <SafeAreaProvider>
      {appKit ? (
        <AppKitProvider instance={appKit}>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
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
            </QueryClientProvider>
          </WagmiProvider>
        </AppKitProvider>
      ) : (
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
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
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </SafeAreaProvider>
  );
}
