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

export interface FetchResult {
    pokemons: Pokemon[];
    totalCount: number;
    hasMore: boolean;
}

export const fetchPokemons = async (limit: number = 10, offset: number = 0): Promise<FetchResult> => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        
        const totalCount = data.count;
        const hasMore = offset + limit < totalCount;

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

        return {
            pokemons: detailedPokemons,
            totalCount,
            hasMore
        };
    } catch (error) {
        console.error('Error fetching pokemons:', error);
        throw error;
    }
}