// src/AppKitConfig.ts (or wherever you configure AppKit)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppKit } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import "@walletconnect/react-native-compat";
import { mainnet, sepolia } from 'wagmi/chains';

const projectId = 'YOUR_PROJECT_ID';

const metadata = {
    name: 'Pokedex Marketplace',
    description: 'Pokedex Marketplace App',
    url: 'https://pokedex-marketplace.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
        native: 'pokedex-marketplace://',
    }
};

export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [mainnet, sepolia],
});

export const appKit = createAppKit({
    projectId,
    metadata,
    adapters: [wagmiAdapter],
    networks: [mainnet, sepolia],
    storage: {
        getItem: async <T = any>(key: string): Promise<T | undefined> => {
            const value = await AsyncStorage.getItem(key);
            if (!value) return undefined;
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        },
        setItem: async (key: string, value: any) => {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            await AsyncStorage.setItem(key, stringValue);
        },
        removeItem: async (key: string) => {
            await AsyncStorage.removeItem(key);
        },
        getKeys: async () => {
            const keys = await AsyncStorage.getAllKeys();
            return [...keys];
        },
        getEntries: async <T = any>() => {
            const keys = await AsyncStorage.getAllKeys();
            const entries = await AsyncStorage.multiGet(keys);
            return entries as [string, T][];
        }
    }
});