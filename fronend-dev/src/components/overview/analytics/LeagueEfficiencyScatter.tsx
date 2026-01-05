import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LabelList, Cell } from 'recharts';
import { useTeams } from '../../../api/queries';

export const LeagueEfficiencyScatter: React.FC = () => {
    const { data: teams, isLoading } = useTeams();

    if (isLoading || !teams) return <div className="h-64 animate-pulse bg-slate-100 rounded-2xl"></div>;

    const data = teams.map(t => ({
        name: t.abbr,
        xG: Number(t.stats.expectedGoals || 0),
        goals: Number(t.stats.goals || 0),
        diff: Number(t.stats.goals || 0) - Number(t.stats.expectedGoals || 0),
    }));

    // Round up the max value to the nearest 5 to allow nice integer ticks
    const maxVal = Math.ceil(Math.max(...data.map(d => Math.max(d.goals, d.xG))) / 5) * 5;

    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Clinical vs Wasteful</h3>
                <p className="text-sm text-slate-500">Comparing chances created (xG) against actual goals scored.</p>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            dataKey="xG"
                            name="xG"
                            domain={[0, maxVal]}
                            tickCount={maxVal / 5 + 1}
                            interval={0}
                            allowDecimals={false}
                            label={{ value: 'Expected Goals (xG)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="goals"
                            name="Goals"
                            domain={[0, maxVal]}
                            tickCount={maxVal / 5 + 1}
                            interval={0}
                            allowDecimals={false}
                            label={{ value: 'Actual Goals', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                        <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                                        <div className="space-y-1">
                                            <p className="text-gray-500">Goals: <span className="font-mono font-bold text-slate-900">{d.goals}</span></p>
                                            <p className="text-gray-500">xG: <span className="font-mono font-bold text-slate-900">{d.xG.toFixed(2)}</span></p>
                                            <p className={d.diff > 0 ? "text-pl-green font-bold" : "text-red-500 font-bold"}>
                                                {d.diff > 0 ? '+' : ''}{d.diff.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }} />

                        {/* Reference Line showing xG = Goals */}
                        <ReferenceLine
                            segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]}
                            stroke="#94a3b8"
                            strokeDasharray="4 4"
                            label={{ position: 'top', value: 'Expected Performance', fontSize: 10, fill: '#94a3b8' }}
                        />

                        <Scatter name="Teams" data={data} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.diff > 0 ? '#059669' : '#ef4444'}
                                    fillOpacity={0.8}
                                />
                            ))}
                            <LabelList dataKey="name" position="top" fontSize={10} fontWeight="bold" />
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-400 font-medium px-4">
                <span>Wasteful Finishing</span>
                <span>Clinical Finishing</span>
            </div>
        </div>
    );
};
