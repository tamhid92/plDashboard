
import React from 'react';
import type { Player } from '../../../api/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
    player: Player;
    color: string;
}

export const OutfieldStatsModule: React.FC<Props> = ({ player, color }) => {
    const s = player.stats;
    if (!s) return null;

    // --- DEFENDER LOGIC ---
    if (player.position === 'Defender') {
        const duelData = [
            { name: 'Ground', won: s.groundDuelsWon, lost: s.groundDuelsLost },
            { name: 'Aerial', won: s.aerialDuelsWon, lost: s.aerialDuelsLost },
            { name: 'Tackles', won: s.tacklesWon, lost: s.tacklesLost },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4">Duel Dominance</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={duelData} layout="vertical" barSize={24} margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} width={60} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="won" name="Won" stackId="a" fill={color} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="lost" name="Lost" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4">Defensive Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-3xl font-black text-slate-800">{s.interceptions}</span>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Interceptions</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-3xl font-black text-slate-800">{s.totalClearances}</span>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Clearances</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-3xl font-black text-slate-800">{s.recoveries}</span>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Recoveries</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-3xl font-black text-slate-800">{s.blocks}</span>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Blocks</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MIDFIELDER LOGIC ---
    if (player.position === 'Midfielder') {
        const passingData = [
            { name: 'Forward', value: s.forwardPasses },
            { name: 'Backward', value: s.backwardPasses },
            { name: 'Left', value: s.leftsidePasses },
            { name: 'Right', value: s.rightsidePasses },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4">Passing Direction</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={passingData} margin={{ top: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-1">Creative Engine</h3>
                        <p className="text-xs text-slate-500 mb-6">Key metrics for chance creation</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-sm font-medium text-slate-600">Key Passes</span>
                            <span className="text-xl font-black text-slate-900">{s.keyPassesAttemptAssists}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-sm font-medium text-slate-600">Through Balls</span>
                            <span className="text-xl font-black text-slate-900">{s.throughBalls}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-sm font-medium text-slate-600">Dribbles Completed</span>
                            <span className="text-xl font-black text-slate-900">{s.successfulDribbles}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-medium text-slate-600">Passes into Opp. Half</span>
                            <span className="text-xl font-black text-slate-900">{s.successfulPassesOppositionHalf}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- FORWARD LOGIC ---
    if (player.position === 'Forward') {
        const shotData = [
            { name: 'On Target', value: s.shotsOnTargetIncGoals, fill: color },
            { name: 'Off Target', value: s.shotsOffTargetIncWoodwork, fill: '#e2e8f0' },
            { name: 'Goals', value: s.goals, fill: '#10b981' },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4">Finishing Output</h3>
                    <div className="flex items-center justify-center h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shotData} margin={{ top: 10 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                    {shotData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4">Box Presence</h3>
                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-sm opacity-60 font-medium uppercase tracking-wider mb-1">Touches in Opp. Box</p>
                            <p className="text-5xl font-black tracking-tight">{s.totalTouchesInOppositionBox}</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Mins per Goal</span>
                            <span className="font-bold text-slate-900">{s.goals > 0 ? Math.round(s.timePlayed / s.goals) : 'N/A'} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Aerial Duels Won</span>
                            <span className="font-bold text-slate-900">{s.aerialDuelsWon}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
