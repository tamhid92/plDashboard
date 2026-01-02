import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { usePlayers, useTeams } from '../../../api/queries';

export const TopPlayersScatter: React.FC = () => {
    const { data: players, isLoading: isLoadingPlayers } = usePlayers();
    const { data: teams, isLoading: isLoadingTeams } = useTeams();

    if (isLoadingPlayers || isLoadingTeams || !players || !teams) return <div className="h-64 animate-pulse bg-slate-100 rounded-2xl"></div>;

    const topPlayers = players
        .filter(p => (p.goals + p.assists) > 8) // Higher threshold for cleaner chart
        .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
        .slice(0, 15)
        .map(p => ({
            name: p.player_name.split(' ').pop(), // Last name roughly
            goals: p.goals,
            assists: p.assists,
            team: teams.find(t => t.id === p.team_id)?.abbr
        }));

    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Top Creators & Finishers</h3>
                <p className="text-sm text-slate-500">Most productive players (Goals + Assists {'>'} 8).</p>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" dataKey="assists" name="Assists" label={{ value: 'Assists', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 600 }} />
                        <YAxis type="number" dataKey="goals" name="Goals" label={{ value: 'Goals', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                        <p className="font-bold mb-1">{d.name} <span className="text-gray-400">({d.team})</span></p>
                                        <p>Goals: {d.goals}</p>
                                        <p>Assists: {d.assists}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Scatter name="Players" data={topPlayers} fill="#8b5cf6">
                            <LabelList dataKey="name" position="top" fontSize={10} fontWeight="bold" />
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
