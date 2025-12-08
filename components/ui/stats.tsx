import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StatProps {
    name: string;
    value: number;
}

interface StatsListProps {
    stats: StatProps[];
    className?: string;
    compact?: boolean;
    tiny?: boolean;
}

const getIconName = (statName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (statName.toLowerCase()) {
        case 'hp': return 'heart';
        case 'attack': return 'sword';
        case 'defense': return 'shield';
        case 'special-attack': return 'flash';
        case 'special-defense': return 'shield-plus';
        case 'speed': return 'run';
        default: return 'circle-small';
    }
};

const getColor = (statName: string): string => {
    switch (statName.toLowerCase()) {
        case 'hp': return '#ef4444'; // red-500
        case 'attack': return '#f97316'; // orange-500
        case 'defense': return '#3b82f6'; // blue-500
        case 'special-attack': return '#eab308'; // yellow-500
        case 'special-defense': return '#8b5cf6'; // violet-500
        case 'speed': return '#10b981'; // emerald-500
        default: return '#6b7280'; // gray-500
    }
}

export function StatsList({ stats, className, compact = false, tiny = false }: StatsListProps) {
    const firstRow = stats.slice(0, 3);
    const secondRow = stats.slice(3);

    const iconSize = tiny ? 10 : (compact ? 14 : 24);
    const textSize = tiny ? 'text-[8px]' : (compact ? 'text-xs' : 'text-base');

    return (
        <View className={`flex-col items-center justify-center ${tiny ? 'gap-0.5' : (compact ? 'gap-1' : 'gap-4')} w-full ${className}`}>
            {/* First Row */}
            <View className="flex-row justify-between w-auto">
                {firstRow.map((stat, index) => (
                    <View key={index} className="flex-row items-center gap-1">
                        <MaterialCommunityIcons
                            name={getIconName(stat.name)}
                            size={iconSize}
                            color={getColor(stat.name)}
                        />
                        <Text className={`font-bold ${textSize}`}>{stat.value}</Text>
                    </View>
                ))}
            </View>
            {/* Second Row */}
            <View className="flex-row justify-between w-auto">
                {secondRow.map((stat, index) => (
                    <View key={index} className="flex-row items-center gap-1">
                        <MaterialCommunityIcons
                            name={getIconName(stat.name)}
                            size={iconSize}
                            color={getColor(stat.name)}
                        />
                        <Text className={`font-bold ${textSize}`}>{stat.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}
