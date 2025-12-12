// src/AppKitConfig.ts
import "@walletconnect/react-native-compat"; // MUST BE THE FIRST IMPORT

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BitcoinAdapter } from "@reown/appkit-bitcoin-react-native";
import { bitcoin, createAppKit, solana } from "@reown/appkit-react-native";
import { PhantomConnector, SolanaAdapter, SolflareConnector } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import * as Clipboard from 'expo-clipboard';

import { arbitrum, mainnet, polygon, sepolia } from "wagmi/chains";

const projectId = "5fc8a56a938fc53868f5ec52ff3a5d72"; // Obtain from https://dashboard.reown.com/

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setStringAsync(value);
  },
};

const metadata = {
  name: "My Awesome dApp",
  description: "My dApp description",
  url: "http://localhost:8081",
  icons: ["http://localhost:8081/icon.png"],
  redirect: {
    native: "pokedex://",
    universal: "localhost",
  },
};
const networks = [mainnet, polygon, arbitrum];

// Lazy initialization - only create appKit in client environment
let _appKit: any = null;
let wagmiAdapter: WagmiAdapter;

function getAppKit() {
  if (_appKit) return _appKit;
  
  // Only initialize in client-side environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Initialize adapters only in client environment
  if (!wagmiAdapter) {
    wagmiAdapter = new WagmiAdapter({
      projectId,
      networks: [polygon, arbitrum, sepolia],
    });
  }
  
  const solanaAdapter = new SolanaAdapter();
  const bitcoinAdapter = new BitcoinAdapter();

  // Clear any potentially corrupted WalletConnect storage
  const clearWalletConnectStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const wcKeys = keys.filter(key => 
        key.startsWith('wc@') || 
        key.startsWith('@walletconnect') ||
        key.startsWith('WALLETCONNECT')
      );
      if (wcKeys.length > 0) {
        await AsyncStorage.multiRemove(wcKeys);
        console.log('Cleared WalletConnect storage keys:', wcKeys);
      }
    } catch (error) {
      console.warn('Error clearing WalletConnect storage:', error);
    }
  };

  // Clear storage before initialization (only on first load)
  clearWalletConnectStorage().catch(console.warn);

  _appKit = createAppKit({
    projectId,
    metadata,
    networks: [...networks, solana, bitcoin],
    adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
    extraConnectors: [new PhantomConnector(), new SolflareConnector()],
    clipboardClient,
    defaultNetwork: sepolia,
    enableAnalytics: false, // Disable analytics to avoid CORS issues with pulse.walletconnect.org
    storage: {
      getItem: async (key) => {
        try {
          const res = await AsyncStorage.getItem(key);
          // Return undefined instead of null to prevent WalletConnect errors
          return (res === null ? undefined : res) as any;
        } catch (error) {
          console.warn('AsyncStorage getItem error:', error);
          return undefined;
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
          const keys = await AsyncStorage.getAllKeys();
          return (keys || []) as string[];
        } catch (error) {
          console.warn('AsyncStorage getKeys error:', error);
          return [];
        }
      },
      getEntries: async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          if (!keys || keys.length === 0) {
            return [];
          }
          const entries = await AsyncStorage.multiGet(keys);
          return (entries || []) as any;
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
// Initialize wagmiAdapter if needed before exporting config
if (typeof window !== 'undefined' && !wagmiAdapter) {
  wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [polygon, arbitrum, sepolia],
  });
}

export const wagmiConfig = wagmiAdapter?.wagmiConfig;