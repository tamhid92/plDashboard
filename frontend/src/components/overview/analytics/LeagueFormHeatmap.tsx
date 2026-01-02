import React from 'react';
import { useStandings, useTeamForm } from '../../../api/queries';

export const LeagueFormHeatmap: React.FC = () => {
    const { data: standings, isLoading } = useStandings();
    const teamForm = useTeamForm();

    if (isLoading || !standings) return <div className="h-64 animate-pulse bg-slate-100 rounded-2xl"></div>;

    const sortedTeams = [...standings].sort((a, b) => a.position - b.position);

    const getResultColor = (result: string) => {
        switch (result) {
            case 'W': return 'bg-pl-green text-pl-purple';
            case 'D': return 'bg-slate-200 text-slate-600';
            case 'L': return 'bg-red-100 text-red-500';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Momentum Tracker</h3>
                <p className="text-sm text-slate-500">Last 5 matches for every team, ordered by league position.</p>
            </div>

            <div className="overflow-x-auto">
                <div className="overflow-x-auto">
                    {/* Refactored to use a single grid for perfect column alignment */}
                    <div className="min-w-[200px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-[30px_50px_1fr] gap-4 mb-2 border-b border-gray-100 pb-2 items-center">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Pos</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Club</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right pr-1">Form</div>
                        </div>

                        <div className="space-y-1">
                            {sortedTeams.map((team) => {
                                const form = teamForm[team.teamid] || [];
                                const recentForm = [...form].reverse().slice(0, 5);
                                while (recentForm.length < 5) recentForm.push('-');

                                return (
                                    <div key={team.teamid} className="grid grid-cols-[30px_50px_1fr] gap-4 items-center hover:bg-slate-50 rounded p-1 transition-colors">
                                        {/* Pos */}
                                        <div className="text-[10px] font-bold text-slate-400 text-center">{team.position}</div>

                                        {/* Club */}
                                        <div className="text-xs font-bold text-slate-900 text-left">{team.teamabbr}</div>

                                        {/* Form (Dots) */}
                                        <div className="flex space-x-1 justify-end">
                                            {recentForm.map((result, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black ${getResultColor(result)}`}
                                                    title={result === '-' ? 'No Game' : result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                                                >
                                                    {result}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
