// Import fetch proxy FIRST to intercept API calls (only affects web platform)
import '../utils/fetchProxy';

import { ThemeProvider } from "@react-navigation/native";
import {
  AppKit,
  AppKitButton,
  AppKitProvider
} from "@reown/appkit-react-native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { Platform, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'text-encoding';
import { WagmiProvider } from 'wagmi';
import "../global.css";
import { appKit, wagmiConfig } from "../hooks/AppKitConfig";
import { NAV_THEME } from "../lib/theme";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Only use AppKit on native mobile platforms (iOS/Android) where it works properly
// Web has CORS issues with WalletConnect's API
const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';




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
                <StatusBar style="auto"/>

                <Stack>
                  <Stack.Screen name="index" options={{
                    headerLargeTitle: Platform.OS !== 'ios',
                    headerTransparent: false,
                    title: "Pokedex",
                    headerRight: () => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', backgroundColor: 'transparent' }}>
                        <AppKitButton size='sm' />
                      </View>
                    ),
                  }} />
</Stack>
                  

                <AppKit />
                <PortalHost />
              </ThemeProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </AppKitProvider>
      ) : (
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
              <StatusBar style="auto" />

              <Stack>
                <Stack.Screen name="index" options={{
                  headerLargeTitle: true,
                  headerTransparent: false,
                  title: "Pokedexxx",
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
