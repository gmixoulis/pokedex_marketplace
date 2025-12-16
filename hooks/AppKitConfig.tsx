// // src/AppKitConfig.ts
// import "@walletconnect/react-native-compat"; // MUST BE THE FIRST IMPORT
// import '../hooks/polyfill';

// console.log('AppKitConfig: Polyfill check');
// console.log('Buffer defined?', !!global.Buffer);
// console.log('TextEncoder defined?', !!global.TextEncoder);
// // @ts-ignore
// console.log('Window Buffer defined?', typeof window !== 'undefined' ? !!window.Buffer : 'no window');

// import { vTestnet } from "@/app/tenderly.config";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BitcoinAdapter } from "@reown/appkit-bitcoin-react-native";
// import { createAppKit } from "@reown/appkit-react-native";
// import { PhantomConnector, SolanaAdapter } from "@reown/appkit-solana-react-native";
// import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
// import { IProviderMetadata } from '@walletconnect/modal-react-native';
// import * as Clipboard from 'expo-clipboard';
// import { arbitrum, mainnet, polygon, sepolia } from "wagmi/chains";

// import { storage } from "../utils/StorageUtil";
// const projectId = "5fc8a56a938fc53868f5ec52ff3a5d72"; // Obtain from https://dashboard.reown.com/

// const clipboardClient = {
//   setString: async (value: string) => {
//     Clipboard.setStringAsync(value);
//   },
// };

// const metadata: IProviderMetadata = {
//   name: "My Awesome dApp",
//   description: "My dApp description",
//   url: "http://localhost:8081",
  
//   icons: ['https://avatars.githubusercontent.com/u/179229932'],
//   redirect: {
//     native: "pokedexmarketplace://",
//     universal: "localhost",
//   },
// };

// // Lazy initialization - only create appKit in client environment
// let _appKit: any = null;
// let wagmiAdapter: WagmiAdapter;
// const networks = [mainnet, polygon, arbitrum];

// function getAppKit() {
//   if (_appKit) return _appKit;
  
//   // Only initialize in client-side environment
//   if (typeof window === 'undefined') {
//     return null;
//   }

//   // Initialize adapters only in client environment
//   if (!wagmiAdapter) {
//     wagmiAdapter = new WagmiAdapter({
//       projectId,
//       networks: [mainnet, arbitrum, sepolia],
//     });
//   }
  
//   const solanaAdapter = new SolanaAdapter();
//   const bitcoinAdapter = new BitcoinAdapter();

//   const clearWalletConnectStorage = async () => {
//     try {
//       const keys = await AsyncStorage.getAllKeys();
//       const wcKeys = keys.filter(key => 
//         key.startsWith('wc@') || 
//         key.startsWith('@walletconnect') ||
//         key.startsWith('WALLETCONNECT')
//       );
//       if (wcKeys.length > 0) {
//         await AsyncStorage.multiRemove(wcKeys);
//         console.log('Cleared WalletConnect storage keys:', wcKeys);
//       }
//     } catch (error) {
//       console.warn('Error clearing WalletConnect storage:', error);
//     }
//   };

//   // Clear storage before initialization (only on first load)
//   clearWalletConnectStorage().catch(console.warn);

//   _appKit = createAppKit({
//     projectId,
//     metadata,
//     networks: [...networks,  vTestnet],
//     adapters: [wagmiAdapter],
//     extraConnectors: [new PhantomConnector()],
//     clipboardClient,
//     defaultNetwork: mainnet,
//     enableAnalytics: false, // Disable analytics to avoid CORS issues with pulse.walletconnect.org
//     storage,
//   });

//   return _appKit;
// }

// // Export lazy-initialized appKit
// export const appKit = getAppKit();


// // Export the wagmi config for provider setup
// // Initialize wagmiAdapter if needed before exporting config
// if (typeof window !== 'undefined' && !wagmiAdapter) {
//   wagmiAdapter = new WagmiAdapter({
//     projectId,
//     networks: [polygon, arbitrum, sepolia],
//   });
// }

// export const wagmiConfig = wagmiAdapter?.wagmiConfig;
