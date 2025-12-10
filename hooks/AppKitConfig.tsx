// src/AppKitConfig.ts
import "@walletconnect/react-native-compat"; // MUST BE THE FIRST IMPORT

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppKit } from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { mainnet, sepolia } from "wagmi/chains";

const projectId = "5fc8a56a938fc53868f5ec52ff3a5d72"; // Obtain from https://dashboard.reown.com/

const metadata = {
  name: "My Awesome dApp",
  description: "My dApp description",
  url: "https://myapp.com",
  icons: ["https://myapp.com/icon.png"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

// Initialize Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, sepolia], // Add all chains you want to support
});

// Lazy initialization - only create appKit in client environment
let _appKit: any = null;

function getAppKit() {
  if (_appKit) return _appKit;
  
  // Only initialize in client-side environment
  if (typeof window === 'undefined') {
    return null;
  }

  _appKit = createAppKit({
    projectId,
    metadata,
    networks: [mainnet, sepolia], // Must match the networks in wagmiAdapter
    adapters: [wagmiAdapter],
    storage: {
      getItem: async (key) => {
        try {
          const res = await AsyncStorage.getItem(key);
          return res as any;
        } catch (error) {
          console.warn('AsyncStorage getItem error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value as string);
        } catch (error) {
          console.warn('AsyncStorage setItem error:', error);
        }
      },
      removeItem: async (key) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.warn('AsyncStorage removeItem error:', error);
        }
      },
      getKeys: async () => {
        try {
          return await AsyncStorage.getAllKeys() as any;
        } catch (error) {
          console.warn('AsyncStorage getKeys error:', error);
          return [];
        }
      },
      getEntries: async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const entries = await AsyncStorage.multiGet(keys);
          return entries as any;
        } catch (error) {
          console.warn('AsyncStorage getEntries error:', error);
          return [];
        }
      },
    },
  });

  return _appKit;
}

// Export lazy-initialized appKit
export const appKit = getAppKit();

// Export the wagmi config for provider setup
export const wagmiConfig = wagmiAdapter.wagmiConfig;