
import React from 'react';
import type { Player } from '../../../api/types';
import { ShieldAlert } from 'lucide-react';

interface Props {
    player: Player;
}

export const RiskProfile: React.FC<Props> = ({ player }) => {
    const s = player.stats;
    const fpl = player.fpl_stats;

    if (!s) return null;

    const cardsColor = s.yellowCards > 4 || s.totalRedCards > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700';

    // Ownership Trend (simulated trend logic for now)
    const transferNet = (fpl?.transfers_in_event || 0) - (fpl?.transfers_out_event || 0);
    const momentum = transferNet > 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                <ShieldAlert size={20} className="text-orange-500" />
                Risk & Stability
            </h3>

            <div className="space-y-4">
                {/* Discipline */}
                <div className={`p-4 rounded-xl border ${cardsColor} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-yellow-400 rounded shadow-sm flex items-center justify-center font-bold text-yellow-800 text-sm">
                            {s.yellowCards}
                        </div>
                        <div className="w-8 h-10 bg-red-500 rounded shadow-sm flex items-center justify-center font-bold text-white text-sm">
                            {s.totalRedCards}
                        </div>
                        <span className="font-medium text-sm ml-2">Discipline Record</span>
                    </div>
                </div>

                {/* Foul Trouble */}
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Fouls Conceded</span>
                    <span className="font-bold text-slate-900">{s.totalFoulsConceded}</span>
                </div>

                {/* Errors (if any) */}
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Errors Leading to Goal</span>
                    <span className={`font-bold ${s.errorLeadingToGoal ? 'text-red-500' : 'text-green-500'}`}>
                        {s.errorLeadingToGoal || 0}
                    </span>
                </div>

                {/* Market Sentinel */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Market Sentiment</p>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Net Transfers (GW)</span>
                        <span className={`font-black font-mono text-lg ${momentum}`}>
                            {transferNet > 0 ? '+' : ''}{transferNet.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full ${transferNet > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(transferNet) / 1000, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
