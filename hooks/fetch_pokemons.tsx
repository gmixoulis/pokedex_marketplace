export interface Pokemon {
    id: number;
    name: string;
    url: string;
    image: string;
    types: string[];
    description: string;
    stats: {
        name: string;
        value: number;
    }[];
}

export const fetchPokemons = async (limit: number = 10): Promise<Pokemon[]> => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
        const data = await response.json();

        const detailedPokemons: Pokemon[] = await Promise.all(
            data.results.map(async (item: { name: string; url: string }) => {
                const detailsResponse = await fetch(item.url);
                const details = await detailsResponse.json();

                const speciesResponse = await fetch(details.species.url);
                const speciesData = await speciesResponse.json();

                const descriptionEntry = speciesData.flavor_text_entries.find(
                    (entry: any) => entry.language.name === 'en'
                );
                const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';

                return {
                    id: details.id,
                    name: item.name,
                    url: item.url,
                    image: details.sprites.front_default,
                    types: details.types.map((t: any) => t.type.name),
                    description: description,
                    stats: details.stats.map((s: any) => ({
                        name: s.stat.name,
                        value: s.base_stat
                    }))
                };
            })
        );

        return detailedPokemons;
    } catch (error) {
        console.error('Error fetching pokemons:', error);
        throw error;
    }
}