import React from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Fixture, CompletedFixture } from '../../api/types';
import { getTeamLogoUrl } from '../../utils/teamLogos';

interface MatchCardProps {
    match: Fixture | CompletedFixture;
    variant?: 'upcoming' | 'completed';
    onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, variant = 'upcoming', onClick }) => {
    const isCompleted = variant === 'completed';
    const completedMatch = match as CompletedFixture;

    const getScoreColor = (score: number, opponentScore: number) => {
        if (score > opponentScore) return 'text-slate-900 font-bold';
        if (score < opponentScore) return 'text-gray-400';
        return 'text-gray-500 font-medium';
    };

    return (
        <div
            onClick={onClick}
            className={clsx(
                "glass-card border border-gray-100 rounded-lg p-3 hover:shadow-lg transition-all group",
                onClick ? "cursor-pointer hover:border-pl-purple/50 hover:scale-[1.02]" : ""
            )}
        >
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex justify-between">
                <span className="group-hover:text-pl-purple transition-colors">{format(new Date(match.kickoff_time), 'EEE d MMM • HH:mm')}</span>
                {isCompleted && <span className="text-pl-text-green font-bold">FT</span>}
            </div>

            <div className="space-y-2">
                {/* Home Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img
                            src={getTeamLogoUrl(match.home_team_name)}
                            alt={match.home_team_abbr}
                            className="w-6 h-6 object-contain bg-white rounded-full p-0.5 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logos/epl.png'; }}
                        />
                        <span className={clsx("text-sm font-semibold transition-colors", isCompleted ? getScoreColor(completedMatch.home_team_score, completedMatch.away_team_score) : "text-slate-700")}>
                            {match.home_team_name}
                        </span>
                    </div>
                    {isCompleted && (
                        <span className={clsx("text-sm font-mono", getScoreColor(completedMatch.home_team_score, completedMatch.away_team_score))}>
                            {completedMatch.home_team_score}
                        </span>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img
                            src={getTeamLogoUrl(match.away_team_name)}
                            alt={match.away_team_abbr}
                            className="w-6 h-6 object-contain bg-white rounded-full p-0.5 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logos/epl.png'; }}
                        />
                        <span className={clsx("text-sm font-semibold transition-colors", isCompleted ? getScoreColor(completedMatch.away_team_score, completedMatch.home_team_score) : "text-slate-700")}>
                            {match.away_team_name}
                        </span>
                    </div>
                    {isCompleted && (
                        <span className={clsx("text-sm font-mono", getScoreColor(completedMatch.away_team_score, completedMatch.home_team_score))}>
                            {completedMatch.away_team_score}
                        </span>
                    )}
                </div>
            </div>

            {!isCompleted && (
                <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500 text-center truncate group-hover:text-pl-purple transition-colors">
                    {match.venue}
                </div>
            )}
        </div>
    );
};
