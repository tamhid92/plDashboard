
import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import type { Player } from '../../api/types';

interface IdentityRadarProps {
    player: Player;
    color: string;
}

const normalize = (value: number, max: number) => Math.min(100, Math.max(0, (value / max) * 100));

export const IdentityRadar: React.FC<IdentityRadarProps> = ({ player, color }) => {

    // Position-specific logic for chart axes
    const data = useMemo(() => {
        const s = player.stats;
        if (!s) return [];

        switch (player.position) {
            case 'Goalkeeper':
                return [
                    { subject: 'Shot Stopping', value: normalize(s.savesMade, 100), fullMark: 100 }, // Scaled vs ~100 saves
                    { subject: 'Box Command', value: normalize(s.catches + s.punches + (s.totalClearances * 2), 50), fullMark: 100 },
                    { subject: 'Distribution', value: normalize(s.successfulLongPasses + s.successfulShortPasses, 1000), fullMark: 100 },
                    { subject: 'Sweeping', value: normalize(s.recoveries + s.totalClearances, 80), fullMark: 100 },
                    { subject: 'Reliability', value: normalize(100 - (s.errorLeadingToGoal || 0) * 20, 100), fullMark: 100 },
                ];
            case 'Defender':
                return [
                    { subject: 'Aerial', value: normalize(s.aerialDuelsWon, 80), fullMark: 100 },
                    { subject: 'Tackling', value: normalize(s.tacklesWon, 50), fullMark: 100 },
                    { subject: 'Interceptions', value: normalize(s.interceptions, 50), fullMark: 100 },
                    { subject: 'Ball Prog', value: normalize(s.forwardPasses, 400), fullMark: 100 },
                    { subject: 'Discipline', value: normalize(100 - (s.totalFoulsConceded * 2), 100), fullMark: 100 },
                ];
            case 'Midfielder':
                return [
                    { subject: 'Creativity', value: normalize(s.keyPassesAttemptAssists, 60), fullMark: 100 },
                    { subject: 'Control', value: normalize(s.successfulPassesOppositionHalf, 800), fullMark: 100 },
                    { subject: 'Goal Threat', value: normalize(s.totalShots, 60), fullMark: 100 },
                    { subject: 'Defensive', value: normalize(s.recoveries + s.interceptions, 150), fullMark: 100 },
                    { subject: 'Dribbling', value: normalize(s.successfulDribbles, 40), fullMark: 100 },
                ];
            case 'Forward':
                return [
                    { subject: 'Finishing', value: normalize(s.goals, 20), fullMark: 100 },
                    { subject: 'Volume', value: normalize(s.totalShots, 80), fullMark: 100 },
                    { subject: 'Link-up', value: normalize(s.goalAssists + (s.keyPassesAttemptAssists / 2), 15), fullMark: 100 },
                    { subject: 'Aerial', value: normalize(s.aerialDuelsWon, 50), fullMark: 100 },
                    { subject: 'Box Pres', value: normalize(s.totalTouchesInOppositionBox, 150), fullMark: 100 },
                ];
            default:
                return [];
        }
    }, [player]);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-2">
                <h3 className="font-bold text-slate-800 text-lg">Player DNA</h3>
                <p className="text-xs text-slate-500">Role fingerprint based on season performance</p>
            </div>

            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Performance"
                            dataKey="value"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: color, strokeWidth: 1 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
