import { useSDK } from "@metamask/sdk-react-native";
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSnapshot } from 'valtio';
import { setConnecting, setWalletAddress, walletStore } from '../store/walletStore';

const ConnectButton = () => {
  const { isConnected, address, isConnecting } = useSnapshot(walletStore);
  const { sdk } = useSDK();
  const [showMenu, setShowMenu] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const connect = async () => {
    setConnecting(true);
    try {
      if (Platform.OS === 'web') {
        // Find MetaMask provider specifically (handles multiple wallet extensions)
        let ethereum = window.ethereum;
        
        // If multiple providers exist, find MetaMask specifically
        if (window.ethereum?.providers?.length) {
          const metaMaskProvider = window.ethereum.providers.find(
            (p: any) => p.isMetaMask && !p.isPhantom
          );
          if (metaMaskProvider) {
            ethereum = metaMaskProvider;
            console.log('Found MetaMask among multiple providers');
          }
        } else if (window.ethereum?.isPhantom) {
          // Phantom is the primary provider, try to find MetaMask anyway
          console.warn('Phantom is primary provider. Looking for MetaMask...');
          // MetaMask may still be available but overridden
        }
        
        if (!ethereum?.isMetaMask) {
          alert("MetaMask not found. Please make sure MetaMask is installed and enabled.");
          setConnecting(false);
          return;
        }
        
        console.log('Requesting accounts from MetaMask...');
        
        // Use direct ethereum.request for better compatibility
        const accounts = await ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          console.log('Connected:', accounts[0]);
          setWalletAddress(accounts[0]);
        }
      } else {
        // Native SDK
        if (!sdk) {
          console.warn("MetaMask SDK not initialized (likely running in Expo Go)");
          alert("Wallet connection is not available in Expo Go. Please use a development build.");
          return;
        }
        console.log("Connecting via SDK...");
        
        // Add timeout for SDK too
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timed out")), 15000)
        );
        
        const accounts = await Promise.race([sdk?.connect(), timeoutPromise]) as string[];
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error: any) {
      console.error("Connection failed:", error);
      alert(error.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    setWalletAddress(null);
    setShowMenu(false);
    
    // Web: Revoke permissions to truly disconnect
    if (Platform.OS === 'web' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
      } catch (e) {
        console.error("Error revoking permissions:", e);
      }
    }

    // Mobile: Terminate session
    if (Platform.OS !== 'web') {
      sdk?.terminate();
    }
  };

  // Connected state - show address with disconnect option
  if (isConnected && address) {
    return (
      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          activeOpacity={0.8}
          style={{
            borderWidth: 2,
            borderColor: '#a855f7', // purple-500
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
        </TouchableOpacity>

        {/* Disconnect dropdown */}
        {showMenu && (
          <View
            style={{
              position: 'absolute',
              top: 48,
              right: 0,
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#e5e5e5',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              minWidth: 140,
              zIndex: 100,
            }}
          >
            <TouchableOpacity
              onPress={disconnect}
              activeOpacity={0.7}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>
                Disconnect
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Disconnected state - show connect button
  return (
    <TouchableOpacity 
      onPress={connect}
      activeOpacity={0.8}
      disabled={isConnecting}
      style={{
        borderWidth: 2,
        borderColor: '#a855f7', // purple-500
        backgroundColor: '#a855f7',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isConnecting ? 0.7 : 1,
      }}
    >
      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
        {isConnecting ? "Connecting..." : "Connect"}
      </Text>
    </TouchableOpacity>
  );
}

export default ConnectButton;

