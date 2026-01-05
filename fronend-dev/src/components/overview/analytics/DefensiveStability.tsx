import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useTeams } from '../../../api/queries';

export const DefensiveStability: React.FC = () => {
    const { data: teams, isLoading } = useTeams();

    if (isLoading || !teams) return <div className="h-64 animate-pulse bg-slate-100 rounded-2xl"></div>;

    const defenseData = teams.map(t => ({
        name: t.abbr,
        xGC: Number(t.stats.expectedGoalsOnTargetConceded || 0),
        conceded: Number(t.stats.goalsConceded || 0),
        diff: Number(t.stats.expectedGoalsOnTargetConceded || 0) - Number(t.stats.goalsConceded || 0)
    })).sort((a, b) => b.diff - a.diff); // Best defense first

    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Defensive Stability</h3>
                <p className="text-sm text-slate-500">Goals Prevented (xGOT - Conceded). Higher is better.</p>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defenseData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={40} tick={{ fontSize: 10, fontWeight: 'bold' }} interval={0} />
                        <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                        <p className="font-bold mb-1">{d.name}</p>
                                        <p>Expected Conceded (xGOT): {d.xGC.toFixed(2)}</p>
                                        <p>Actual Conceded: {d.conceded}</p>
                                        <p className={d.diff > 0 ? "text-green-600" : "text-red-600"}>
                                            {d.diff > 0 ? `Prevented ${d.diff.toFixed(2)}` : `Allowed ${Math.abs(d.diff).toFixed(2)} Extra`}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Bar dataKey="diff" name="Goals Prevented" radius={[0, 4, 4, 0]}>
                            {defenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#059669' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
