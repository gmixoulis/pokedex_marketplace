import { NativeModules, Platform } from 'react-native';

// Skip MetaMaskProvider if:
// 1. Running on web (should use window.ethereum instead)
// 2. Running on native without the SDK native module (e.g., Expo Go)
const skipMetaMaskProvider = 
  Platform.OS === 'web' || 
  !NativeModules.MetaMaskReactNativeSdk;

if (skipMetaMaskProvider && Platform.OS !== 'web') {
  console.warn('Running in Expo Go: MetaMask SDK native features are disabled.');
}

export { skipMetaMaskProvider };
