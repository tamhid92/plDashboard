import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface PlayerNameProps {
    playerId: number | string;
    name: string;
    className?: string;
}

export const PlayerName: React.FC<PlayerNameProps> = ({ playerId, name, className }) => {
    const navigate = useNavigate();

    // If no valid ID, just render text
    if (!playerId) return <span className={className}>{name}</span>;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent parent clicks (like card navigation)
                navigate(`/player/${playerId}`);
            }}
            className={clsx(
                "hover:text-pl-purple hover:underline decoration-pl-purple/50 underline-offset-2 transition-all text-left",
                className
            )}
        >
            {name}
        </button>
    );
};
