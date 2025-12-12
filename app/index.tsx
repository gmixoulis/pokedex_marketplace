import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatsList } from "@/components/ui/stats";
import { fetchPokemons, Pokemon } from "@/hooks/fetch_pokemons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../components/ui/modal";
type ViewMode = 'gallery' | 'list' | 'single';

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  useEffect(() => {
    fetchPokemons().then((pokemon: Pokemon[]) => setPokemons(pokemon));
  }, [])

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

  return (
    <SafeAreaView className="flex-1 bg-background-foreground" >
   
      <View className="px-4  flex-row justify-end items-center z-10">
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

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        contentContainerClassName={`p-4 gap-6  ${viewMode === 'gallery' ? 'flex-row flex-wrap justify-center' : 'items-center'}`}
      >
        {pokemons.map((pokemon, index) => {
          if (viewMode === 'gallery') {
            return (
              <View key={index} style={{ width: '39%', minWidth: 100 }}>
                {renderCard(pokemon, index, { width: '100%', height: 210 })}
              </View>
            )
          }

          if (viewMode === 'list') {
            // Original List Mode
            // Using fixed width 72 as per original code
            return (
              <View key={index} className="w-72 h-[450px]">
                {renderCard(pokemon, index, { width: '100%', height: '100%' })}
              </View>
            );
          }

          if (viewMode === 'single') {
            // Single Mode (One Each) - For now same as list but maybe intended to be paging?
            // User said "one each". I'll treat it as full screen width for now or keep similar to list until specified.
            // Actually, "one each" likely implies swiping, but for now scrolling big cards is a start.
            return (
              <View key={index} className="w-full h-[600px]">
                {renderCard(pokemon, index, { width: '100%', height: '100%' })}
              </View>
            );
          }
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
