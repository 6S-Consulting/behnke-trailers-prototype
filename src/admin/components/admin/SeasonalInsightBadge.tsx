import { Cloud, Sun, Snowflake, Leaf } from "lucide-react";
import { cn } from "@/admin/lib/utils";

type DemandLevel = 'high' | 'medium' | 'low' | 'declining';

interface SeasonalInsightBadgeProps {
    demandLevel: DemandLevel;
    seasonalFactor: 'peak' | 'off-season' | 'stable';
    className?: string;
}

interface SeasonalConfig {
    text: string;
    icon: React.ReactNode;
    colorClasses: string;
}

/**
 * Generates context-aware seasonal insight based on demand level and seasonal factor
 */
function getSeasonalInsight(
    demandLevel: DemandLevel,
    seasonalFactor: 'peak' | 'off-season' | 'stable'
): SeasonalConfig {
    // Peak season insights
    if (seasonalFactor === 'peak') {
        switch (demandLevel) {
            case 'high':
                return {
                    text: 'Peak season driving strong demand',
                    icon: <Sun className="h-3 w-3" />,
                    colorClasses: 'bg-green-500/10 border-green-500/25 text-green-400'
                };
            case 'medium':
                return {
                    text: 'Peak season with steady performance',
                    icon: <Sun className="h-3 w-3" />,
                    colorClasses: 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                };
            case 'low':
                return {
                    text: 'Underperforming despite peak season',
                    icon: <Cloud className="h-3 w-3" />,
                    colorClasses: 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                };
            case 'declining':
                return {
                    text: 'Declining despite peak season – review needed',
                    icon: <Cloud className="h-3 w-3" />,
                    colorClasses: 'bg-red-500/10 border-red-500/25 text-red-400'
                };
        }
    }

    // Off-season insights
    if (seasonalFactor === 'off-season') {
        switch (demandLevel) {
            case 'high':
                return {
                    text: 'Strong demand despite off-season',
                    icon: <Snowflake className="h-3 w-3" />,
                    colorClasses: 'bg-green-500/10 border-green-500/25 text-green-400'
                };
            case 'medium':
                return {
                    text: 'Off-season with stable demand',
                    icon: <Snowflake className="h-3 w-3" />,
                    colorClasses: 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                };
            case 'low':
                return {
                    text: 'Low activity typical for off-season',
                    icon: <Snowflake className="h-3 w-3" />,
                    colorClasses: 'bg-slate-500/10 border-slate-500/25 text-slate-400'
                };
            case 'declining':
                return {
                    text: 'Seasonal slowdown impacting demand',
                    icon: <Snowflake className="h-3 w-3" />,
                    colorClasses: 'bg-red-500/10 border-red-500/25 text-red-400'
                };
        }
    }

    // Stable/neutral season insights
    switch (demandLevel) {
        case 'high':
            return {
                text: 'Consistent high performer',
                icon: <Leaf className="h-3 w-3" />,
                colorClasses: 'bg-green-500/10 border-green-500/25 text-green-400'
            };
        case 'medium':
            return {
                text: 'Stable demand pattern',
                icon: <Leaf className="h-3 w-3" />,
                colorClasses: 'bg-blue-500/10 border-blue-500/25 text-blue-400'
            };
        case 'low':
            return {
                text: 'Below average performance',
                icon: <Cloud className="h-3 w-3" />,
                colorClasses: 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            };
        case 'declining':
            return {
                text: 'Downward trend detected',
                icon: <Cloud className="h-3 w-3" />,
                colorClasses: 'bg-red-500/10 border-red-500/25 text-red-400'
            };
    }
}

/**
 * Determines seasonal factor based on seasonal trend text
 */
export function parseSeasonalFactor(seasonalTrend: string): 'peak' | 'off-season' | 'stable' {
    const lowerTrend = seasonalTrend.toLowerCase();
    if (lowerTrend.includes('peak') || lowerTrend.includes('high demand')) {
        return 'peak';
    }
    if (lowerTrend.includes('off-season') || lowerTrend.includes('lower')) {
        return 'off-season';
    }
    return 'stable';
}

/**
 * SeasonalInsightBadge - A context-aware badge that shows seasonal insights
 * aligned with the product's demand level
 */
export function SeasonalInsightBadge({
    demandLevel,
    seasonalFactor,
    className
}: SeasonalInsightBadgeProps) {
    const config = getSeasonalInsight(demandLevel, seasonalFactor);

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap",
                config.colorClasses,
                className
            )}
        >
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
}

export default SeasonalInsightBadge;
