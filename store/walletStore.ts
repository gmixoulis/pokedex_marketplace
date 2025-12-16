import { proxy } from 'valtio';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const walletStore = proxy<WalletState>({
  address: null,
  isConnected: false,
  isConnecting: false,
});

export const setWalletAddress = (address: string | null) => {
  walletStore.address = address;
  walletStore.isConnected = !!address;
  walletStore.isConnecting = false;
};

export const setConnecting = (connecting: boolean) => {
  walletStore.isConnecting = connecting;
};
