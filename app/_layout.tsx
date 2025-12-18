// Import fetch proxy FIRST to intercept API calls (only affects web platform)
import "@ethersproject/shims";
import { MetaMaskProvider } from '@metamask/sdk-react-native';
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { Image, Platform, Text, useColorScheme, View } from 'react-native';
import "react-native-get-random-values";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "react-native-url-polyfill/auto";
import 'text-encoding';
import ConnectButton from "../components/ConnectButton";
import "../global.css";
import { skipMetaMaskProvider } from "../hooks/metamask-polyfill";
import { NAV_THEME } from "../lib/theme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Web has CORS issues with WalletConnect's API
const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';


const sdkOptions = {
  dappMetadata: {
    name: 'Demo React Native App',
    url: 'http://localhost:8081',
    iconUrl: '',
    scheme: 'pokedexmarketplace',
  },
  infuraAPIKey: process.env.EXPO_PUBLIC_INFURA_API_KEY || '355f29324c6e482083ea80b99da6ba1d',
  checkInstallationImmediately: false, // Prevent immediate check which might crash
};


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

  const AppContent = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style="auto"/>

        <Stack>
          <Stack.Screen name="index" options={{
            headerLargeTitle: Platform.OS !== 'ios',
            headerTransparent: false,
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image 
                  source={require('../assets/images/ash-ketchum.png')} 
                  style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#353840' }} 
                  className="rounded-full"
                />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colorScheme === 'dark' ? 'white' : 'black' }}>Pokedex</Text>
              </View>
            ),
            
            
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', backgroundColor: 'transparent' }}>
                <ConnectButton  />
              </View>
            ),
          }} />
        </Stack>

        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );

  return (
    <SafeAreaProvider>
        {skipMetaMaskProvider ? (
          AppContent
        ) : (
          <MetaMaskProvider sdkOptions={sdkOptions}>
            {AppContent}
          </MetaMaskProvider>
        )}
    </SafeAreaProvider>
  );
}