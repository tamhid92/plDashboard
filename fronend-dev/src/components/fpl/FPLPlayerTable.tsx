
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { FPLPlayer } from '../../hooks/useFPLData';
import { Search } from 'lucide-react';
import { getTeamLogoUrl } from '../../utils/teamLogos';

interface Props {
    players: FPLPlayer[];
    onSelectPlayer: (player: FPLPlayer) => void;
    selectedPlayerId?: number;
}

type SortField = 'total_points' | 'now_cost' | 'form' | 'value_season' | 'selected_by_percent';

export const FPLPlayerTable: React.FC<Props> = ({ players, onSelectPlayer, selectedPlayerId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('form');
    const [sortDesc, setSortDesc] = useState(true);
    const [positionFilter, setPositionFilter] = useState<string>('All');
    const [costFilter, setCostFilter] = useState<number>(20); // Max cost

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDesc(!sortDesc);
        } else {
            setSortField(field);
            setSortDesc(true);
        }
    };

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            const matchesSearch = p.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.team_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPos = positionFilter === 'All' || p.position === positionFilter;
            const matchesCost = p.derived.now_cost <= costFilter;
            return matchesSearch && matchesPos && matchesCost;
        }).sort((a, b) => {
            let valA, valB;

            if (sortField === 'total_points') {
                valA = a.derived.total_points || 0;
                valB = b.derived.total_points || 0;
            } else if (sortField === 'now_cost') {
                valA = a.derived.now_cost;
                valB = b.derived.now_cost;
            } else {
                valA = (a.derived as unknown as Record<string, number>)[sortField];
                valB = (b.derived as unknown as Record<string, number>)[sortField];
            }

            return sortDesc ? valB - valA : valA - valB;
        }); // Limit for performance if needed, but lets try 50
    }, [players, searchTerm, sortField, sortDesc, positionFilter, costFilter]);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[800px]">
            {/* Controls */}
            <div className="p-4 border-b border-gray-100 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search players or teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pl-purple"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {/* Position Tabs */}
                    {['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map(pos => (
                        <button
                            key={pos}
                            onClick={() => setPositionFilter(pos)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${positionFilter === pos
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {pos === 'All' ? 'All Positions' : pos}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="whitespace-nowrap">Max Price: £{costFilter}m</span>
                    <input
                        type="range"
                        min="3.5"
                        max="20"
                        step="0.1"
                        value={costFilter}
                        onChange={(e) => setCostFilter(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pl-purple"
                    />
                </div>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 bg-slate-50 p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <div className="col-span-4 pl-2 cursor-pointer" onClick={() => handleSort('total_points')}>Player</div>
                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('total_points')}>Pts</div>
                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('form')}>Form</div>
                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('now_cost')}>£</div>
                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('value_season')}>Val</div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
                {filteredPlayers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No players found matching filters.</div>
                ) : (
                    filteredPlayers.map((p) => {
                        const isSelected = p.player_id === selectedPlayerId;
                        return (
                            <div
                                key={p.player_id}
                                onClick={() => onSelectPlayer(p)}
                                className={`grid grid-cols-12 p-3 items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-pl-purple/5 border-l-4 border-l-pl-purple' : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="col-span-4 pl-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 p-1 flex-shrink-0">
                                        <img src={getTeamLogoUrl(p.team_name)} alt={p.team_abbr} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <Link
                                            to={`/player/${p.player_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-bold text-sm text-slate-800 leading-tight truncate hover:text-pl-purple hover:underline"
                                        >
                                            {p.player_name}
                                        </Link>
                                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                                            {p.team_abbr} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {p.position.substring(0, 3)}
                                            {!p.derived.is_available && (
                                                <span className="text-red-500 font-bold ml-1">⚠️</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center font-bold text-slate-900">{p.derived.total_points}</div>
                                <div className="col-span-2 text-center text-slate-500">
                                    <div className={`font-bold ${p.derived.form > 5 ? 'text-green-600' : ''}`}>
                                        {p.derived.form}
                                    </div>
                                </div>
                                <div className="col-span-2 text-center text-slate-500 font-mono">£{p.derived.now_cost}</div>
                                <div className="col-span-2 text-center text-slate-400">{p.derived.value_season.toFixed(1)}</div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
