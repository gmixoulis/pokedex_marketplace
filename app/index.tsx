import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatsList } from "@/components/ui/stats";
import { fetchPokemons, Pokemon } from "@/hooks/fetch_pokemons";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    fetchPokemons().then((pokemon: Pokemon[]) => setPokemons(pokemon));

  }, [])



  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1"
      contentContainerClassName="p-4 gap-6 items-center pb-20"
    >
      {pokemons.map((pokemon, index) => (
        <Card className={`w-72 h-[450px] border-primary-foreground py-4 border-solid border-[3px] bg-opacity-${90 - 20 * (index % 3)} rounded-xl bg-type-` + pokemon.types[0]} key={index} >
          <CardHeader>
            <CardTitle className="text-primary-foreground border-primary-foreground text-center   py-6">{pokemon.name}</CardTitle>
          </CardHeader>
          <Separator className="my-1 border-primary-foreground border-[1px] bg-white" />
          <CardContent className="flex flex-col items-center w-full gap-4">
            <Image source={{ uri: pokemon.image }} className={'w-40  min-h-36 '} />
            <CardDescription className="text-black bg-white/90 p-3 rounded-xl w-full">
              <View className="mb-2">
                <Text className="text-sm font-medium text-center">{pokemon.description}</Text>
              </View>

              <StatsList stats={pokemon.stats} />
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );
}
