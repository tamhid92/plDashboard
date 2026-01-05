import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LabelList, Cell } from 'recharts';
import { useTeams } from '../../../api/queries';

export const DominanceMatrix: React.FC = () => {
    const { data: teams, isLoading } = useTeams();

    if (isLoading || !teams) return <div className="h-64 animate-pulse bg-slate-100 rounded-2xl"></div>;

    const data = teams.map(t => ({
        name: t.abbr,
        possession: Number(t.stats.possessionPercentage || 50),
        xG: Number(t.stats.expectedGoals || 0),
    }));

    const avgPossession = 50;
    const avgxG = data.reduce((acc, c) => acc + c.xG, 0) / data.length;

    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Dominance Matrix</h3>
                <p className="text-sm text-slate-500">Territorial control (Possession) vs Chance Creation (xG).</p>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            dataKey="possession"
                            name="Possession"
                            domain={[30, 70]}
                            label={{ value: 'Avg Possession %', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="xG"
                            name="xG"
                            label={{ value: 'Total xG', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                        <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                                        <p className="text-gray-500">Possession: <span className="font-mono text-slate-900">{d.possession}%</span></p>
                                        <p className="text-gray-500">xG: <span className="font-mono text-slate-900">{d.xG.toFixed(2)}</span></p>
                                    </div>
                                );
                            }
                            return null;
                        }} />

                        {/* Quadrant Lines */}
                        <ReferenceLine x={avgPossession} stroke="#cbd5e1" strokeWidth={2} />
                        <ReferenceLine y={avgxG} stroke="#cbd5e1" strokeWidth={2} />

                        {/* Quadrant Labels - Moved to be less intrusive */}
                        <text x="98%" y="2%" textAnchor="end" dominantBaseline="hanging" className="text-[10px] font-black fill-pl-purple opacity-40">DOMINANT FORCE</text>
                        <text x="2%" y="2%" textAnchor="start" dominantBaseline="hanging" className="text-[10px] font-black fill-emerald-600 opacity-40">EFFICIENT COUNTER</text>
                        <text x="2%" y="98%" textAnchor="start" dominantBaseline="auto" className="text-[10px] font-black fill-red-400 opacity-40">STRUGGLING</text>
                        <text x="98%" y="98%" textAnchor="end" dominantBaseline="auto" className="text-[10px] font-black fill-slate-400 opacity-40">STERILE POSSESSION</text>

                        <Scatter name="Teams" data={data} fill="#3b82f6">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.xG > avgxG && entry.possession > avgPossession ? '#7c3aed' : // Dominant
                                            entry.xG > avgxG && entry.possession <= avgPossession ? '#059669' : // Counter
                                                entry.xG <= avgxG && entry.possession > avgPossession ? '#94a3b8' : // Sterile
                                                    '#ef4444' // Struggling
                                    }
                                    fillOpacity={0.8}
                                />
                            ))}
                            <LabelList dataKey="name" position="top" fontSize={10} fontWeight="bold" />
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
