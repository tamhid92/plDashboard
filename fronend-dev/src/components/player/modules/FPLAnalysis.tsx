
import React from 'react';
import type { Player } from '../../../api/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award } from 'lucide-react';

interface Props {
    player: Player;
}

export const FPLAnalysis: React.FC<Props> = ({ player }) => {
    const fpl = player.fpl_stats;
    if (!fpl) return null;

    const ictData = [
        { name: 'Influence', value: parseFloat(fpl.influence), max: 1000 },
        { name: 'Creativity', value: parseFloat(fpl.creativity), max: 1000 },
        { name: 'Threat', value: parseFloat(fpl.threat), max: 1000 },
    ];

    const valuePerMillion = (fpl.total_points / (fpl.now_cost / 10)).toFixed(1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* KPI Cards */}
            <div className="col-span-1 space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                    <Award size={64} className="absolute -bottom-4 -right-4 text-white/20" />
                    <p className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Total Points</p>
                    <p className="text-5xl font-black">{fpl.total_points}</p>
                    <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 text-xs font-medium">
                        <div>
                            <span className="block opacity-70">PPG</span>
                            <span className="text-lg">{fpl.points_per_game}</span>
                        </div>
                        <div>
                            <span className="block opacity-70">Bonus</span>
                            <span className="text-lg">{fpl.bonus}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Price</p>
                        <p className="text-2xl font-black text-slate-800">£{(fpl.now_cost / 10).toFixed(1)}m</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Value (Pts/£)</p>
                        <p className="text-2xl font-black text-pl-purple">{valuePerMillion}</p>
                    </div>
                </div>
            </div>

            {/* ICT Index Chart */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="mb-2 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">ICT Index Analysis</h3>
                        <p className="text-xs text-slate-500">Underlying statistical performance breakdown</p>
                    </div>
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                        Index: {fpl.ict_index}
                    </div>
                </div>

                <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ictData} layout="vertical" margin={{ left: 40, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} width={70} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px' }}
                                formatter={(val: number | undefined) => val ? val.toFixed(1) : '0'}
                            />
                            <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f8fafc' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {ictData.map(d => (
                        <div key={d.name} className="bg-slate-50 rounded-lg p-2">
                            <span className="block text-[10px] text-slate-400 uppercase">{d.name}</span>
                            <span className="font-bold text-slate-800">{d.value.toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
