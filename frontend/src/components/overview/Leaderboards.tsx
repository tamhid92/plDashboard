import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers, useTeams } from '../../api/queries';
import type { Player } from '../../api/types';

const PlayerList = ({ title, players, metric, teamMap }: { title: string, players: Player[], metric: 'goals' | 'assists', teamMap: Record<number, string> }) => {
    const navigate = useNavigate();
    return (
        <div className="glass-card rounded-3xl border border-gray-100 p-6 shadow-sm h-full flex flex-col">
            <h4 className="font-black text-xl text-slate-900 tracking-tight mb-6">{title}</h4>
            <div className="space-y-3 flex-1">
                {players.slice(0, 5).map((p, i) => (
                    <div
                        key={p.player_id}
                        onClick={() => navigate(`/player/${p.player_id}`)}
                        className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-all"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-bold text-gray-400 w-4 group-hover:text-pl-neon-pink transition-colors">{i + 1}</span>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-pl-purple transition-colors">{p.player_name}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{teamMap[p.team_id] || 'Unknown'}</p>
                            </div>
                        </div>
                        <span className="font-mono text-lg font-black text-slate-900 group-hover:text-pl-purple transition-colors">{p[metric]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Leaderboards: React.FC = () => {
    const { data: players, isLoading } = usePlayers();
    const { data: teams } = useTeams();

    const teamMap = useMemo(() => {
        if (!teams) return {};
        return teams.reduce((acc, t) => ({ ...acc, [t.team_id || t.id]: t.name }), {} as Record<number, string>);
    }, [teams]);

    const topScorers = useMemo(() =>
        players ? [...players].sort((a, b) => b.goals - a.goals) : [],
        [players]);

    const topAssisters = useMemo(() =>
        players ? [...players].sort((a, b) => b.assists - a.assists) : [],
        [players]);

    if (isLoading) return <div className="h-48 animate-pulse bg-slate-100 rounded-lg"></div>;

    return (
        <div className="grid grid-cols-1 gap-6">
            <PlayerList title="Golden Boot Race" players={topScorers} metric="goals" teamMap={teamMap} />
            <PlayerList title="Top Playmakers" players={topAssisters} metric="assists" teamMap={teamMap} />
        </div>
    );
};
