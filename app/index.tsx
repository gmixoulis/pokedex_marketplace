import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatsList } from "@/components/ui/stats";
import { fetchPokemons, Pokemon } from "@/hooks/fetch_pokemons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PokeballIcon from "../components/icons/PokeballIcon";
import Modal from "../components/ui/modal";
import { setWalletAddress } from "../store/walletStore";

type ViewMode = 'gallery' | 'list' | 'single';

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadPokemons = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    
    setLoading(true);
    try {
      const currentOffset = isInitial ? 0 : offset;
      const result = await fetchPokemons(LIMIT, currentOffset);
      
      if (isInitial) {
        setPokemons(result.pokemons);
      } else {
        setPokemons(prev => [...prev, ...result.pokemons]);
      }
      
      setHasMore(result.hasMore);
      setOffset(currentOffset + LIMIT);
      
      if (!result.hasMore && !isInitial) {
        Alert.alert("That's all!", "No more Pokemon to fetch.");
      }
    } catch (error) {
      console.error('Error loading pokemons:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  useEffect(() => {
    loadPokemons(true);
    
    // Auto-connect on web if already authorized
    if (Platform.OS === 'web' && window.ethereum) {
       window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        })
        .catch(console.error);

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setWalletAddress(null);
          }
        });
    }
  }, []);
  const renderCard = (pokemon: Pokemon, index: number, styles: any = {}) => {
    const isGallery = viewMode === 'gallery';
    return (
      <Card
        className={`border-primary-foreground ${isGallery ? 'py-1 border-[1px]' : 'py-4 border-[3px]'} border-solid bg-opacity-${90 - 20 * (index % 3)} rounded-xl bg-type-` + pokemon.types[0]}
        key={index}
        style={styles}
      >
        <CardHeader style={isGallery ? { paddingHorizontal: 2, paddingVertical: 2 } : {}}>
          <CardTitle className={`text-primary-foreground border-primary-foreground text-center ${isGallery ? 'text-[10px] py-0.5' : 'py-6'}`}>
            {pokemon.name}
          </CardTitle>
        </CardHeader>
        <Separator className={`my-1 border-primary-foreground border-[1px] bg-white ${isGallery ? 'h-[0.5px]' : ''}`} />
        <CardContent style={isGallery ? { paddingHorizontal: 2, gap: 2 } : {}} className={`flex-1 justify-center text-center flex-col items-center w-full ${isGallery ? 'gap-1' : 'gap-2'}`}>
          <Image source={{ uri: pokemon.image }} className={isGallery ? 'w-16 h-16' : 'w-40 min-h-24'} />
          <CardDescription className={`text-black justify-center text-center mx-2 bg-white/90 ${isGallery ? 'p-1 rounded-sm' : 'p-3 rounded-xl'} w-[90%]`}>
            <View className={isGallery ? 'mb-0.5' : 'mb-2'}>
              <Text className={`${isGallery ? 'text-[8px]' : 'text-sm'} font-medium text-center`} numberOfLines={isGallery ? 2 : undefined}>
                {pokemon.description}
              </Text>
            </View>
            <StatsList stats={pokemon.stats} tiny={isGallery} />
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-row justify-between w-full px-2 pb-2">
          {/* <Button variant="secondary" size="sm" className="px-2 w-[50%] h-6" onPress={() => console.log('pressed')}>
            <Text className="text-[14px] ">Left</Text>
          </Button>
          <Button variant="default" size="sm" className="px-2 w-[50%] h-6" onPress={() => console.log('pressed')}>
            <Text className="text-[14px] ">Right</Text>
          </Button> */}
          <Modal pokemon_url={pokemon.url} pokemon_name={pokemon.name} pokemon_stats={pokemon.stats} pokemon_image={pokemon.image} pokemon_types={pokemon.types} pokemon_description={pokemon.description} pokemon_id={pokemon.id}/>
          
        </CardFooter>
     
          
      </Card >
    );
  };

  const renderItem = useCallback(({ item, index }: { item: Pokemon; index: number }) => {
    return (
      <View style={viewMode === 'gallery' ? { width: '48%', marginBottom: 12 } : viewMode === 'list' ? { width: 288, height: 450, marginBottom: 16 } : { width: '100%', height: 600, marginBottom: 16 }}>
        {renderCard(item, index, { width: '100%', height: viewMode === 'gallery' ? 210 : '100%' })}
      </View>
    );
  }, [viewMode]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={{ color: isDark ? '#fff' : '#000', marginTop: 8 }}>Loading more Pokemon...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-foreground" style={{ position: 'relative' }}>
      {/* Pokeball Watermark Background */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', zIndex: 0 }]} pointerEvents="none">
        {[...Array(25)].map((_, i) => {
          const left = ((i * 37) % 100);
          const top = ((i * 53) % 100);
          const size = 40 + ((i * 17) % 60);
          const rotation = (i * 29) % 360;
          const opacity = isDark ? 0.15 : 0.12;
          
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                transform: [{ rotate: `${rotation}deg` }],
              }}
            >
              <PokeballIcon size={size} opacity={opacity} />
            </View>
          );
        })}
      </View>
   
      <View className="px-4 flex-row justify-end items-center z-10">
        <View className="flex-row gap-2 bg-muted/20 p-1 rounded-lg">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary/20' : ''}`}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={viewMode === 'list' ? '#3b82f6' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('single')}
            className={`p-2 rounded-md ${viewMode === 'single' ? 'bg-primary/20' : ''}`}
          >
            <MaterialCommunityIcons name="card-account-details-outline" size={24} color={viewMode === 'single' ? '#3b82f6' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('gallery')}
            className={`p-2 rounded-md ${viewMode === 'gallery' ? 'bg-primary/20' : ''}`}
          >
            <MaterialCommunityIcons name="view-grid" size={24} color={viewMode === 'gallery' ? '#f6673bff' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={pokemons}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={viewMode === 'gallery' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={{ 
          padding: 16, 
          gap: 12,
          alignItems: viewMode === 'gallery' ? undefined : 'center'
        }}
        columnWrapperStyle={viewMode === 'gallery' ? { justifyContent: 'space-between' } : undefined}
        onEndReached={() => loadPokemons(false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        style={{ zIndex: 1 }}
      />
    </SafeAreaView>
  );
}

