
import React from 'react';
import type { Player } from '../../../api/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
    player: Player;
    color: string;
}

export const GKStatsModule: React.FC<Props> = ({ player, color }) => {
    const s = player.stats;
    if (!s) return null;

    const saveRate = s.savesMade / (s.savesMade + s.goalsConceded) * 100;
    const boxSaveRate = s.savesMadeFromInsideBox / (s.savesMadeFromInsideBox + s.goalsConcededInsideBox) * 100;

    const distributionData = [
        { name: 'Short', value: s.successfulShortPasses, total: s.successfulShortPasses + s.unsuccessfulShortPasses },
        { name: 'Long', value: s.successfulLongPasses, total: s.successfulLongPasses + s.unsuccessfulLongPasses },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Shot Stopping Reliability */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-4">Shot Stopping Reality</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Save Rate</p>
                        <p className="text-2xl font-black text-slate-900">{saveRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Box Save %</p>
                        <p className="text-2xl font-black text-slate-900">{boxSaveRate.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${saveRate}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                    <span>Saves ({s.savesMade})</span>
                    <span>Goals ({s.goalsConceded})</span>
                </div>
            </div>

            {/* Distribution Profile */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-2">Distribution Profile</h3>
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData} layout="vertical" barSize={20}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} width={40} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="value" name="Successful" stackId="a" fill={color} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="total" name="Total Attempts" stackId="b" fill="#f1f5f9" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-xs text-slate-500 mt-2 text-center">
                    <span className="font-bold text-slate-900">{s.gkSuccessfulDistribution}</span> successful distributions total
                </div>
            </div>
        </div>
    );
};
