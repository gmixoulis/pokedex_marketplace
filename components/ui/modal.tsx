import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSDK } from "@metamask/sdk-react-native";
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSnapshot } from 'valtio';
import PokemonABI from '../../contracts/abi.json';
import { setConnecting, setWalletAddress, walletStore } from '../../store/walletStore';
import { completePipeline, getTotalClaims, hasUserClaimed } from '../../utils/PokemonNFT-Pipeline';

// Placeholder Contract Address - User to update
const CONTRACT_ADDRESS = '0xf0b0ec72049FDeCbd57E3d24Ef5E9D7A7827263B';
interface ModalProps {
  pokemon_url: string;
  pokemon_name: string;
  pokemon_types: string[];
  pokemon_description: string;
  pokemon_stats: {
        name: string;
        value: number;
    }[];
  pokemon_id: number;
  pokemon_image: string;
  address: string;  
}


    // Creating a signing account from a private key


const App = ({pokemon_url, pokemon_name, pokemon_stats, pokemon_image, pokemon_types, pokemon_description, pokemon_id}: Omit<ModalProps, 'address'>) => {
  const { address, isConnected, isConnecting } = useSnapshot(walletStore);
  const [modalVisible, setModalVisible] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [totalClaims, setTotalClaims] = useState(0);
  const { sdk } = useSDK();

  const connect = async () => {
    setConnecting(true);
    try {
      if (Platform.OS === 'web') {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum as any);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();
          setWalletAddress(userAddress);
        } else {
          Alert.alert("Install MetaMask", "Please install MetaMask to connect.");
        }
      } else {
        // Native SDK
        const accounts = await sdk?.connect();
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnecting(false);
    }
  };

  React.useEffect(() => {
    if (modalVisible && address) {
      checkStatus();
    }
  }, [modalVisible, address, pokemon_id]);

  const checkStatus = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PokemonABI, provider);
      
      const claimed = await hasUserClaimed(contract, address, pokemon_id);
      setHasClaimed(claimed);
      
      const total = await getTotalClaims(contract, pokemon_id);
      setTotalClaims(total);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };
  const handleClaim = async () => {
    if (!isConnected || !address) {
       await connect();
       return;
    }

    if (!window.ethereum && Platform.OS === 'web') {
      Alert.alert("Wallet not found", "Please install a wallet like MetaMask.");
      return;
    }

    setClaiming(true);
    try {
      // Connect to the user's browser wallet (MetaMask, etc.)
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PokemonABI, signer);

      // Execute Complete Pipeline
      // logic: Fetch API -> Check Init -> Check User Claim Status -> Claim -> Verify
      console.log(`Starting full pipeline claim for Pokemon #${pokemon_id}...`);
      
      const result = await completePipeline(contract, signer, pokemon_id);

      if (result.success) {
        Alert.alert("Success", `Pipeline Complete! Claimed ${result.pokemonData.name}\\nToken ID: ${result.claimResult.tokenId}`);
      } else {
        throw new Error("Pipeline returned failure status");
      }
      
    } catch (error: any) {
      console.error("Pipeline Error:", error);
      Alert.alert("Claim Failed", error.message || "An error occurred during the claim pipeline.");
    } finally {
      setClaiming(false);
      checkStatus(); // Refresh status after attempt
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View 
              style={[
                styles.modalView,
                Platform.OS !== 'web' ? { width: '95%', height: '92%', maxHeight: Dimensions.get('window').height * 0.92 } : { width: '90%', height: '85%', maxWidth: 1200, maxHeight: 800 } 
              ]} 
              className={Platform.OS === 'web' ? "flex-col p-6 bg-[#202225] border border-[#353840]" : "flex-col bg-[#202225] border border-[#353840]"}
            >
              {/* Top Bar (Close Button) */}
              <View style={{ right: 25, top: 15 }} className="flex-row justify-end mb-4">
                 <Pressable style={{ left: 0 }} onPress={() => setModalVisible(!modalVisible)} className="active:opacity-90 left-5 mr-5 pr-5">
                   <MaterialCommunityIcons name="close" size={28} color="#8a939b" />
                 </Pressable>
              </View>

              {Platform.OS === 'web' ? (
                // WEB LAYOUT - Original Horizontal Layout
                <View className="flex-1 flex-row gap-8 px-6 pb-6">
                  {/* Left Column: Image Card - RESPONSIVE WIDTH */}
                  <View style={{ flex: 1, maxWidth: 400, aspectRatio: 1 }}>
                    <View className="w-full h-full border border-[#353840] rounded-xl overflow-hidden bg-[#262b2f] items-center justify-center">
                      <Image 
                        source={{ uri: pokemon_image }} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover" 
                      />
                    </View>
                  </View>

                  {/* Right Column: Details & Traits */}
                  <View className="flex-1">
                    {/* Header Info */}
                    <View className="mb-6">
                      <View className="flex-row items-center gap-1 mb-2">
                        <Text className="text-[#2081e2] font-semibold text-base">Pokemon Collection</Text>
                        <MaterialCommunityIcons name="check-decagram" size={16} color="#2081e2" />
                      </View>
                      <Text className="text-4xl font-bold text-white mb-2">{pokemon_name} #{pokemon_id}</Text>
                      <View className="flex-row items-center gap-2 mb-4 mt-2">
                        {isConnected ? (
                          <Text className="text-[#8a939b] shrink" numberOfLines={1} ellipsizeMode="middle">Your Address: <Text className="text-[#2081e2]">{address}</Text></Text> 
                        ) : (
                          <Text className="text-[#8a939b]">Connect wallet to view status</Text>
                        )}
                      </View>
                      
                      {/* Stats Row */}
                      {isConnected && (
                        <View className="flex-row gap-4 mb-4">
                          <View className="flex-row items-center bg-[#262b2f] px-3 py-1 rounded-lg border border-[#353840]">
                            <MaterialCommunityIcons name="trophy-outline" size={16} color="#ffd700" style={{marginRight: 6}} />
                            <Text className="text-gray-300">Total Claims: <Text className="text-white font-bold">{totalClaims}</Text></Text>
                          </View>
                          
                          {hasClaimed && (
                            <View className="flex-row items-center bg-[rgba(32,129,226,0.1)] px-3 py-1 rounded-lg border border-[#2081e2]">
                              <MaterialCommunityIcons name="check-circle" size={16} color="#2081e2" style={{marginRight: 6}} />
                              <Text className="text-[#2081e2] font-bold">You own this!</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Price / Action Card */}
                    <View className="bg-[#262b2f] border border-[#353840] rounded-xl p-4 mb-8">
                      <View className="flex-row gap-3">
                        <Pressable 
                          className="bg-[#2081e2] py-3.5 rounded-lg items-center active:opacity-90"
                          onPress={handleClaim}
                          disabled={claiming || hasClaimed}
                          style={{ opacity: (claiming || hasClaimed) ? 0.7 : 1, backgroundColor: hasClaimed ? '#353840' : '#2081e2', paddingHorizontal: 32 }}
                        >
                          <Text className="text-white font-bold text-base">
                            {!isConnected ? (isConnecting ? "Connecting..." : "Connect Wallet") : 
                            (claiming ? "Claiming..." : hasClaimed ? "Already Claimed" : "Claim Pokemon")}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Traits Grid - High Fidelity OpenSea Colors */}
                    <View className="border border-[#353840] rounded-xl overflow-hidden py-6">
                      <View className="bg-[#262b2f] p-4 border-b border-[#353840] flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-bold text-lg text-white">Traits</Text>
                        </View>
                      </View>
                      
                      <View className="p-4 bg-[#202225]">
                        {(() => {
                          const allTraits = [
                            ...(pokemon_stats?.slice(0, 6).map(s => ({ type: 'stat', ...s })) || []),
                            ...(pokemon_types?.map(t => ({ type: 'type', value: t })) || [])
                          ];
                          
                          const rows = [];
                          for (let i = 0; i < allTraits.length; i += 4) {
                            rows.push(allTraits.slice(i, i + 4));
                          }

                          return rows.map((row, rowIndex) => (
                            <View key={`row-${rowIndex}`} className="flex-row gap-2 mb-2" style={{ width: '100%' }}>
                              {row.map((item, index) => (
                                <View 
                                  key={`trait-${rowIndex}-${index}`} 
                                  style={{ 
                                    width: '23%', 
                                    backgroundColor: 'rgba(21, 178, 229, 0.06)', 
                                    borderColor: '#15b2e5', 
                                    borderWidth: 1, 
                                    borderRadius: 8, 
                                    padding: 8, 
                                    alignItems: 'center' 
                                  }}
                                >
                                  {item.type === 'stat' ? (
                                    <>
                                      <Text className="uppercase text-[10px] font-bold tracking-wider mb-0.5 text-center" style={{ color: '#15b2e5' }}>{item.name}</Text>
                                      <Text className="text-gray-100 font-bold text-sm text-center">{item.value}</Text>
                                    </>
                                  ) : (
                                    <>
                                      <Text className="uppercase text-[10px] font-bold tracking-wider mb-0.5" style={{ color: '#15b2e5' }}>Type</Text>
                                      <Text className="text-gray-100 font-bold text-sm capitalize">{item.value}</Text>
                                    </>
                                  )}
                                </View>
                              ))}
                            </View>
                          ));
                        })()}
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                // MOBILE LAYOUT - Vertical with ScrollView
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  <View className="px-4 pb-6 w-full">
                    {/* Image Card - Full Width on Mobile */}
                    <View style={{ width: '100%', height: 280, marginBottom: 16 }}>
                      <View className="w-full h-full border border-[#353840] rounded-xl overflow-hidden bg-[#262b2f] items-center justify-center">
                        <Image 
                          source={{ uri: pokemon_image }} 
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover" 
                        />
                      </View>
                    </View>

                    {/* Header Info */}
                    <View className="mb-4">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Text className="text-[#2081e2] font-semibold text-xs">Pokemon Collection</Text>
                        <MaterialCommunityIcons name="check-decagram" size={12} color="#2081e2" />
                      </View>
                      <Text className="text-2xl font-bold text-white mb-2">{pokemon_name} #{pokemon_id}</Text>
                      {isConnected ? (
                        <Text className="text-[#8a939b] text-xs mb-2">Address: <Text className="text-[#2081e2]">{address?.slice(0,6)}...{address?.slice(-4)}</Text></Text> 
                      ) : (
                        <Text className="text-[#8a939b] text-xs mb-2">Connect wallet to view status</Text>
                      )}
                      
                      {isConnected && (
                        <View className="flex-row gap-2 flex-wrap">
                          <View className="flex-row items-center bg-[#262b2f] px-2 py-1 rounded-lg border border-[#353840]">
                            <MaterialCommunityIcons name="trophy-outline" size={12} color="#ffd700" style={{marginRight: 4}} />
                            <Text className="text-gray-300 text-xs">Claims: <Text className="text-white font-bold">{totalClaims}</Text></Text>
                          </View>
                          {hasClaimed && (
                            <View className="flex-row items-center bg-[rgba(32,129,226,0.1)] px-2 py-1 rounded-lg border border-[#2081e2]">
                              <MaterialCommunityIcons name="check-circle" size={12} color="#2081e2" style={{marginRight: 4}} />
                              <Text className="text-[#2081e2] font-bold text-xs">You own this!</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Action Button */}
                    <View className="bg-[#262b2f] border border-[#353840] rounded-xl p-3 mb-4">
                      <Pressable 
                        className="bg-[#2081e2] py-3 rounded-lg items-center active:opacity-90"
                        onPress={handleClaim}
                        disabled={claiming || hasClaimed}
                        style={{ opacity: (claiming || hasClaimed) ? 0.7 : 1, backgroundColor: hasClaimed ? '#353840' : '#2081e2' }}
                      >
                        <Text className="text-white font-bold text-sm">
                          {!isConnected ? (isConnecting ? "Connecting..." : "Connect Wallet") : 
                          (claiming ? "Claiming..." : hasClaimed ? "Already Claimed" : "Claim Pokemon")}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Traits Grid - Smaller on Mobile */}
                    <View className="border border-[#353840] rounded-xl overflow-hidden">
                      <View className="bg-[#262b2f] p-3 border-b border-[#353840] flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                          <MaterialCommunityIcons name="tag-outline" size={16} color="white" />
                          <Text className="font-bold text-sm text-white">Traits</Text>
                        </View>
                      </View>
                      <View className="p-3 bg-[#202225] flex-row flex-wrap gap-1.5">
                        {pokemon_stats && pokemon_stats.slice(0, 6).map((s, index) => (
                          <View 
                            key={`stat-${index}`} 
                            style={{ 
                              width: '31.5%',
                              backgroundColor: 'rgba(21, 178, 229, 0.06)', 
                              borderColor: '#15b2e5',
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 8,
                              alignItems: 'center'
                            }}
                          >
                            <Text className="uppercase text-[8px] font-bold tracking-wider mb-0.5 text-center" style={{ color: '#15b2e5' }}>{s.name.slice(0,3)}</Text>
                            <Text className="text-gray-100 font-bold text-xs text-center mb-0.5">{s.value}</Text>
                            <Text className="text-[#8a939b] text-[8px]">Base</Text>
                          </View>
                        ))}
                        {pokemon_types && pokemon_types.map((t, index) => (
                          <View 
                            key={`type-${index}`} 
                            style={{ 
                              width: '31.5%',
                              backgroundColor: 'rgba(21, 178, 229, 0.06)', 
                              borderColor: '#15b2e5',
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 8,
                              alignItems: 'center'
                            }}
                          >
                            <Text className="uppercase text-[8px] font-bold tracking-wider mb-0.5" style={{ color: '#15b2e5' }}>Type</Text>
                            <Text className="text-gray-100 font-bold text-xs capitalize mb-0.5">{t}</Text>
                            <Text className="text-[#8a939b] text-[8px]">Attr</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
          
        </Modal>
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.textStyle}>Show Modal</Text>
        </Pressable>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default App;