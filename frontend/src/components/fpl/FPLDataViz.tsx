
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { FPLPlayer } from '../../hooks/useFPLData';

interface Props {
    players: FPLPlayer[];
    selectedPlayer?: FPLPlayer | null;
}

export const FPLValueScatter: React.FC<Props> = ({ players, selectedPlayer }) => {
    // Filter out low minutes for noise reduction
    const data = players
        .filter(p => p.derived.minutes_per_game > 45 && p.derived.total_points > 20)
        .map(p => ({
            x: p.derived.now_cost,
            y: p.derived.total_points,
            name: p.player_name,
            team: p.team_abbr,
            position: p.position
        }));

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-[400px]">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider mb-4">Value: Cost vs Points</h3>
            <ResponsiveContainer width="100%" height="90%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" dataKey="x" name="Cost" unit="m" domain={['dataMin', 'dataMax']} />
                    <YAxis type="number" dataKey="y" name="Points" unit="pts" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-xl">
                                        <div className="font-bold">{data.name}</div>
                                        <div>{data.team} • {data.position}</div>
                                        <div className="mt-1">£{data.x}m • {data.y} pts</div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter name="Players" data={data} fill="#8884d8">
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
