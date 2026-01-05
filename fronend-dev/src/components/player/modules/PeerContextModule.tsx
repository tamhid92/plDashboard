import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../../api/types';
import type { PlayerContext } from '../../../hooks/usePlayerContext';
import { Info } from 'lucide-react';

interface Props {
    player: Player;
    context: PlayerContext;
    color: string;
}

export const PeerContextModule: React.FC<Props> = ({ player, context, color }) => {

    // Define which metrics to show based on position
    const getMetricsToShow = () => {
        switch (player.position) {
            case 'Goalkeeper':
                return [
                    { key: 'savesMade', label: 'Saves' },
                    { key: 'successfulLongPasses', label: 'Long Passes' },
                    { key: 'goalsConceded', label: 'Goals Conc.', inverse: true } // Inverse: Lower is better
                ];
            case 'Defender':
                return [
                    { key: 'tacklesWon', label: 'Tackles' },
                    { key: 'interceptions', label: 'Interceptions' },
                    { key: 'aerialDuelsWon', label: 'Aerials' },
                    { key: 'successfulShortPasses', label: 'Build-up' }
                ];
            case 'Midfielder':
                return [
                    { key: 'keyPassesAttemptAssists', label: 'Chance Creation' },
                    { key: 'totalPasses', label: 'Volume' },
                    { key: 'tacklesWon', label: 'Defensive Work' },
                    { key: 'successfulDribbles', label: 'Progression' }
                ];
            case 'Forward':
                return [
                    { key: 'expectedGoals', label: 'xG Threat' },
                    { key: 'shotsOnTargetIncGoals', label: 'Shooting Accuracy' },
                    { key: 'goals', label: 'Finishing' },
                    { key: 'successfulDribbles', label: 'Take-ons' }
                ];
            default:
                return [];
        }
    };

    const metrics = getMetricsToShow();

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    Positional Context
                    <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case tracking-normal">
                        vs {context.cohortSize} {player.position}s
                    </span>
                </h3>
                <Info size={14} className="text-slate-400" />
            </div>

            <div className="space-y-6">
                {metrics.map((m, i) => {
                    const percentile = context.percentiles[m.key] || 0;
                    const displayPercentile = m.inverse ? 100 - percentile : percentile; // Handle inverse

                    return (
                        <div key={m.key}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-600">{m.label}</span>
                                <div className="text-right">
                                    <span style={{ color }} className="text-sm font-bold">{Math.round(displayPercentile)}th</span>
                                    <span className="text-[10px] text-slate-400 ml-1">Percentile</span>
                                </div>
                            </div>

                            {/* Bar Container */}
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                                {/* Quartile Markers */}
                                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white z-10 opacity-50"></div>
                                <div className="absolute left-2/4 top-0 bottom-0 w-px bg-white z-10 opacity-50"></div>
                                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white z-10 opacity-50"></div>

                                {/* Progress Bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${displayPercentile}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    style={{ background: color }}
                                    className="h-full rounded-full relative"
                                >
                                    {/* Glow Effect at tip */}
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                </motion.div>
                            </div>

                            <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                                <span>Low</span>
                                <span>Avg</span>
                                <span>Elite</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Archetype Badge */}
            <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                        🧬
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Statistical Archetype</div>
                        <div className="text-sm font-bold text-slate-800">{context.archetype}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
