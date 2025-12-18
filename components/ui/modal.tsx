import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSDK } from "@metamask/sdk-react-native";
import { ethers } from 'ethers';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSnapshot } from 'valtio';
import PokemonABI from '../../contracts/abi.json';
import { setConnecting, setWalletAddress, walletStore } from '../../store/walletStore';
import { completePipeline, getTotalClaims, hasUserClaimed } from '../../utils/PokemonNFT-Pipeline';

// Placeholder Contract Address - User to update
const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '0xf0b0ec72049FDeCbd57E3d24Ef5E9D7A7827263B';
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

  const primaryType = pokemon_types && pokemon_types.length > 0 ? pokemon_types[0].toLowerCase() : 'normal';

  // Helper to get color based on Pokemon type
  const getPokemonTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      fire: '#ff9900', grass: '#7AC74C', water: '#6390F0', electric: '#F7D02C',
      ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
      flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136',
      ghost: '#735797', dragon: '#6F35FC', steel: '#B7B7CE', fairy: '#D685AD',
      normal: '#A8A878'
    };
    return colors[type?.toLowerCase()] || '#2081e2';
  };

  const connect = async () => {
    setConnecting(true);
    try {
      if (Platform.OS === 'web') {
        // Find MetaMask provider specifically (handles multiple wallet extensions like Phantom)
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
          console.warn('Phantom is primary provider. Looking for MetaMask...');
        }
        
        if (!ethereum?.isMetaMask) {
          Alert.alert("MetaMask Not Found", "Please make sure MetaMask is installed and enabled.");
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
           Alert.alert("SDK Error", "MetaMask SDK not initialized.");
           return;
        }
        
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
      Alert.alert("Connection Failed", error.message || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  React.useEffect(() => {
    if (modalVisible && address) {
      checkStatus();
    }
  }, [modalVisible, address, pokemon_id]);

  // Helper to get MetaMask provider specifically
  const getMetaMaskProvider = () => {
    let ethereum = window.ethereum;
    
    if (window.ethereum?.providers?.length) {
      const metaMaskProvider = window.ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isPhantom
      );
      if (metaMaskProvider) {
        ethereum = metaMaskProvider;
      }
    }
    
    return ethereum?.isMetaMask ? ethereum : null;
  };

  const checkStatus = async () => {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(ethereum as any);
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

    const ethereum = getMetaMaskProvider();
    
    if (!ethereum && Platform.OS === 'web') {
      Alert.alert("Wallet not found", "Please install MetaMask.");
      return;
    }

    setClaiming(true);
    try {
      // Connect to MetaMask specifically
      const provider = new ethers.providers.Web3Provider(ethereum as any);
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
            <LinearGradient
              colors={['#ffffff', getPokemonTypeColor(primaryType)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.modalView,
                Platform.OS !== 'web' ? { width: '95%', height: '92%', maxHeight: Dimensions.get('window').height * 0.92 } : { width: '90%', height: '65%', maxWidth: 1200, maxHeight: 800 } 
              ]} 
              className={`${Platform.OS === 'web' ? "flex-col p-6 border-2" : "flex-col border-2"} border-type-${primaryType}`}
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
                  <View  className="flex-1">
                    <View style={{ width: 400, height: 400 }} className="w-full h-full border border-[#353840] rounded-xl overflow-hidden bg-[#262b2f] items-center justify-center">
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
                      <View className="flex-row items-center gap-1 mb-2 font-bold text-[32px]">
                        <Text className="text-[#2081e2] font-bold text-[32px]">Pokemon Collection</Text>
                        <MaterialCommunityIcons name="check-decagram" size={16} color="#2081e2" />
                      </View>
                      <Text style={{ fontSize: '22px', fontWeight: 'bold' }} className="text-[32px] font-bold text-gray-900 mb-2">{pokemon_name} #{pokemon_id}</Text>
                      <View className="flex-row items-center gap-2 mb-4 mt-2">
                        {isConnected ? (
                          <Text style={{ fontSize: '12px', fontWeight: 'bold' }} className="py-5 text-[#8a939b] shrink" numberOfLines={1} ellipsizeMode="middle">Your Address: <Text className="text-[#2081e2]">{address}</Text></Text> 
                        ) : (
                          <Text style={{ fontSize: '12px', fontWeight: 'bold' }} className="py-5 text-[#8a939b]">Connect wallet to view status</Text>
                        )}
                      </View>
                      
                      {/* Stats Row */}
                      {isConnected && (
                        <View className="flex-row gap-4 mb-4">
                          <View className="flex-row items-center bg-[#262b2f] px-3 py-1 rounded-lg border border-[#353840]">
                            <MaterialCommunityIcons name="trophy-outline" size={16} color="#ffd700" style={{marginRight: 6}} />
                            <Text className="text-gray-600">Total Claims: <Text className="text-gray-900 font-bold">{totalClaims}</Text></Text>
                          </View>
                          
                          {hasClaimed && (
                            <View className="flex-row pt-5 pb-5 items-center bg-[rgba(32,129,226,0.1)] px-3 py-1 rounded-lg border border-[#2081e2]">
                              <MaterialCommunityIcons name="check-circle" size={20} color="#2081e2" style={{marginRight: 6}} />
                              <Text  className="text-[#2081e2] p-6 m-6 font-bold">You own this!</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Price / Action Card */}
                    <View className="bg-[#262b2fa0] text-[#ffffff] border border-[#353840] rounded-xl p-4 mb-10 mt-4">
                      <View className="flex-row gap-3 text-[#ffffff] ">
                        <Pressable 
                          className="py-4 text-[#ffffff]  rounded-lg items-center active:opacity-90 border border-[#444] bg-[#510707]"
                          onPress={handleClaim}
                          disabled={claiming || hasClaimed}
                          style={{ 
                            backgroundColor: hasClaimed ? '#353840' : '#580505', 
                            opacity: (claiming || hasClaimed) ? 0.7 : 1, 
                            paddingHorizontal: 32 
                          }}
                        >
                          <Text className="text-white font-extrabold text-lg" style={{ color: 'white' }}>
                            {!isConnected ? (isConnecting ? "Connecting..." : "Connect Wallet") : 
                            (claiming ? "Claiming..." : hasClaimed ? "Already Claimed" : "Claim Pokemon")}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Traits Grid - High Fidelity OpenSea Colors */}
                    <View className="border border-[#353840] rounded-xl overflow-hidden py-6">
                      <View className="bg-[#262b2fa0] pt-8 pb-10 border-b border-[#353840] flex-row justify-center items-center">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-extrabold text-white tracking-wider text-xl">TRAITS</Text>
                        </View>
                      </View>
                      
                      <View className="p-8 pt-10 bg-[#202225a0] bottom-0 top-5">
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
                            <View key={`row-${rowIndex}`} className="flex-row gap-2 bottom-0 top-5  mb-2" style={{ width: '100%' }}>
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
                                      <Text className="text-white font-bold text-sm text-center">{item.value}</Text>
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
                // MOBILE LAYOUT - Vertical with ScrollView (Matching Web Styling)
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  <View className="px-4 pb-6 w-full">
                    {/* Image Card - Full Width on Mobile */}
                    <View style={{ width: '100%', height: 300, marginBottom: 16 }}>
                      <View className="w-full h-full border border-[#353840] rounded-xl overflow-hidden bg-[#262b2f] items-center justify-center">
                        <Image 
                          source={{ uri: pokemon_image }} 
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover" 
                        />
                      </View>
                    </View>

                    {/* Header Info - Matching Web Styling */}
                    <View className="mb-6">
                      <View className="flex-row items-center gap-1 mb-2">
                        <Text className="text-[#2081e2] font-bold text-base">Pokemon Collection</Text>
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#2081e2" />
                      </View>
                      <Text style={{ fontSize: 22, fontWeight: 'bold' }} className="text-gray-900 mb-2">{pokemon_name} #{pokemon_id}</Text>
                      <View className="flex-row items-center gap-2 mb-4 mt-2">
                        {isConnected ? (
                          <Text style={{ fontSize: 12, fontWeight: 'bold' }} className="text-[#8a939b]" numberOfLines={1}>Your Address: <Text className="text-[#2081e2]">{address?.slice(0,6)}...{address?.slice(-4)}</Text></Text> 
                        ) : (
                          <Text style={{ fontSize: 12, fontWeight: 'bold' }} className="text-[#8a939b]">Connect wallet to view status</Text>
                        )}
                      </View>
                      
                      {/* Stats Row - Matching Web */}
                      {isConnected && (
                        <View className="flex-row gap-3 mb-4 flex-wrap">
                          <View className="flex-row items-center bg-[#262b2f] px-3 py-1 rounded-lg border border-[#353840]">
                            <MaterialCommunityIcons name="trophy-outline" size={14} color="#ffd700" style={{marginRight: 6}} />
                            <Text className="text-gray-600">Total Claims: <Text className="text-gray-900 font-bold">{totalClaims}</Text></Text>
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

                    {/* Price / Action Card - Matching Web Dark Style */}
                    <View className="bg-[#262b2fa0] border border-[#353840] rounded-xl p-4 mb-6">
                      <Pressable 
                        className="py-4 rounded-lg items-center active:opacity-90 border border-[#444]"
                        onPress={handleClaim}
                        disabled={claiming || hasClaimed}
                        style={{ 
                          backgroundColor: hasClaimed ? '#353840' : '#580505', 
                          opacity: (claiming || hasClaimed) ? 0.7 : 1,
                          paddingHorizontal: 24
                        }}
                      >
                        <Text className="text-white font-extrabold text-lg" style={{ color: 'white' }}>
                          {!isConnected ? (isConnecting ? "Connecting..." : "Connect Wallet") : 
                          (claiming ? "Claiming..." : hasClaimed ? "Already Claimed" : "Claim Pokemon")}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Traits Grid - Matching Web High Fidelity Style */}
                    <View className="border border-[#353840] rounded-xl overflow-hidden">
                      <View className="bg-[#262b2fa0] pt-6 pb-6 border-b border-[#353840] flex-row justify-center items-center">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-extrabold text-white tracking-wider text-xl">TRAITS</Text>
                        </View>
                      </View>
                      <View className="p-4 bg-[#202225a0]">
                        {(() => {
                          const allTraits = [
                            ...(pokemon_stats?.slice(0, 6).map(s => ({ type: 'stat', name: s.name, value: s.value })) || []),
                            ...(pokemon_types?.map(t => ({ type: 'type', value: t })) || [])
                          ];
                          
                          const rows = [];
                          for (let i = 0; i < allTraits.length; i += 3) {
                            rows.push(allTraits.slice(i, i + 3));
                          }

                          return rows.map((row, rowIndex) => (
                            <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, width: '100%' }}>
                              {row.map((item, index) => (
                                <View 
                                  key={`trait-${rowIndex}-${index}`} 
                                  style={{ 
                                    width: '31%', 
                                    backgroundColor: 'rgba(21, 178, 229, 0.06)', 
                                    borderColor: '#15b2e5', 
                                    borderWidth: 1, 
                                    borderRadius: 8, 
                                    paddingVertical: 12,
                                    paddingHorizontal: 6,
                                    alignItems: 'center' 
                                  }}
                                >
                                  {item.type === 'stat' ? (
                                    <>
                                      <Text style={{ color: '#15b2e5', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>{item.name}</Text>
                                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>{item.value}</Text>
                                    </>
                                  ) : (
                                    <>
                                      <Text style={{ color: '#15b2e5', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>Type</Text>
                                      <Text style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: 16, textTransform: 'capitalize' }}>{item.value}</Text>
                                    </>
                                  )}
                                </View>
                              ))}
                              {/* Fill empty slots if row has less than 3 items */}
                              {row.length < 3 && Array(3 - row.length).fill(null).map((_, i) => (
                                <View key={`empty-${i}`} style={{ width: '31%' }} />
                              ))}
                            </View>
                          ));
                        })()}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </View>
          
        </Modal>
        <Pressable
          style={[styles.button, Platform.OS !== 'web' && styles.buttonOpen]}
          className={Platform.OS === 'web' ? "glow-on-hover justify-center items-center mt-6" : ""}
          onPress={() => setModalVisible(true)}>
          <Text style={[styles.textStyle, Platform.OS === 'web' && { fontWeight: 'normal' }]}>Show NFT</Text>
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
    padding: 0,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#111',
    marginTop: 4,
    width: 80,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default App;