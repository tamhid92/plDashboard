import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useWeeklyStandings, useTeams } from '../../api/queries';
import clsx from 'clsx';
import { getTeamLogoUrl } from '../../utils/teamLogos';

export const SeasonBumpyChart: React.FC = () => {
    const { data: weeklyData, isLoading } = useWeeklyStandings();
    const { data: teams } = useTeams();
    const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
    const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

    const teamAbbrs = useMemo(() => teams?.map(t => t.abbr) || [], [teams]);

    // Map team abbr to full name for logos
    const abbrToName = useMemo(() => {
        if (!teams) return {};
        return teams.reduce((acc, t) => ({ ...acc, [t.abbr]: t.name }), {} as Record<string, string>);
    }, [teams]);

    const chartData = useMemo(() => {
        if (!weeklyData || !teams) return [];
        const maxGw = Math.max(...weeklyData.map(d => d.gameweek));
        const dataByGw: Record<number, any> = {};
        for (let i = 1; i <= maxGw; i++) {
            dataByGw[i] = { name: i };
        }

        weeklyData.forEach(ws => {
            const team = teams.find(t => t.name === ws.team_name);
            if (team && dataByGw[ws.gameweek]) {
                dataByGw[ws.gameweek][team.abbr] = ws.position || 0;
            }
        });

        return Object.values(dataByGw);
    }, [weeklyData, teams]);

    if (isLoading || !chartData.length) return <div>Loading Chart...</div>;

    const toggleTeam = (abbr: string) => {
        const newSet = new Set(selectedTeams);
        if (newSet.has(abbr)) {
            newSet.delete(abbr);
        } else {
            newSet.add(abbr);
        }
        setSelectedTeams(newSet);
    };

    const isHighlighted = (abbr: string) => selectedTeams.has(abbr) || hoveredTeam === abbr;
    const isDimmed = (abbr: string) => (selectedTeams.size > 0 || hoveredTeam) && !isHighlighted(abbr);

    // Generate a stable color for each team based on its index
    // Palette of distinct neon/bright colors
    const palette = [
        '#00ff85', // Neon Green
        '#00eaff', // Cyan
        '#ff0050', // Neon Pink
        '#fffb00', // Yellow
        '#ff9900', // Orange
        '#d300ff', // Purple
        '#ff00ff', // Magenta
        '#00ff00', // Lime
        '#adff2f', // GreenYellow
        '#ff1493', // DeepPink
        '#1e90ff', // DodgerBlue
        '#ffd700', // Gold
        '#ff4500', // OrangeRed
        '#32cd32', // LimeGreen
        '#00ced1', // DarkTurquoise
        '#9932cc', // DarkOrchid
        '#ff69b4', // HotPink
        '#7fffd4', // Aquamarine
        '#ffa500', // Orange
        '#8a2be2', // BlueViolet
    ];

    const getTeamColor = (abbr: string) => {
        const index = teamAbbrs.indexOf(abbr);
        if (index === -1) return '#00ff85';
        return palette[index % palette.length];
    };

    const LogoTick = ({ x, y, payload }: any) => {
        const lastGwData = chartData[chartData.length - 1];
        if (!lastGwData) return null;

        const rank = payload.value;
        const teamAbbr = Object.keys(lastGwData).find(key => {
            return key !== 'name' && lastGwData[key] === rank;
        });

        const teamName = teamAbbr ? abbrToName[teamAbbr] : null;

        if (!teamName) {
            return <text x={x} y={y} dy={4} fill="#666" fontSize={10} textAnchor="start">{rank}</text>;
        }

        const isSelected = teamAbbr && selectedTeams.has(teamAbbr);
        const color = teamAbbr ? getTeamColor(teamAbbr) : undefined;

        return (
            <g
                onClick={() => teamAbbr && toggleTeam(teamAbbr)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => teamAbbr && setHoveredTeam(teamAbbr)}
                onMouseLeave={() => setHoveredTeam(null)}
            >
                {/* Highlight circle if selected */}
                {isSelected && (
                    <circle cx={x + 12} cy={y} r={16} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1} />
                )}
                <circle cx={x + 12} cy={y} r={13} fill="white" />
                <image
                    x={x}
                    y={y - 12}
                    href={getTeamLogoUrl(teamName)}
                    height={24}
                    width={24}
                    preserveAspectRatio="xMidYMid meet"
                />
            </g>
        );
    };

    return (
        <div className="glass-card rounded-2xl border border-gray-100 overflow-hidden flex flex-col relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-pl-neon-pink to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">Season Progression</h3>
                    <p className="text-xs text-gray-500 mt-1">Click teams below or lines to compare paths.</p>
                </div>
                <div className="h-6 w-1 bg-pl-neon-pink rounded-full shadow-[0_0_10px_rgba(255,0,80,0.5)]"></div>
            </div>

            <div className="flex-1 w-full min-h-[600px] p-0 relative">
                {/* Subtle grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                <ResponsiveContainer width="100%" height={600}>
                    <LineChart data={chartData} margin={{ top: 40, right: 40, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />

                        <YAxis
                            yAxisId="left"
                            reversed
                            domain={[1, 20]}
                            tickCount={20}
                            interval={0}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            width={30}
                            padding={{ top: 20, bottom: 20 }}
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            reversed
                            domain={[1, 20]}
                            tickCount={20}
                            interval={0}
                            tick={<LogoTick />}
                            width={60}
                            axisLine={false}
                            tickLine={false}
                            padding={{ top: 20, bottom: 20 }}
                        />

                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const sorted = [...payload].sort((a, b) => (Number(a.value) - Number(b.value)));
                                    return (
                                        <div className="bg-white shadow-xl border border-gray-100 p-3 rounded-lg text-xs z-50 text-slate-800">
                                            <p className="font-bold mb-2 text-gray-500">Gameweek {label}</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {sorted.slice(0, 10).map((p: any) => (
                                                    <div key={p.name} className="flex justify-between w-24">
                                                        <span className={clsx("font-semibold", isHighlighted(p.name) ? "text-slate-900" : "text-gray-400")} style={{ color: isHighlighted(p.name) ? getTeamColor(p.name) : undefined }}>
                                                            {p.value}. {p.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {/* Dummy line to force Right Axis to render if needed (Recharts quirk) */}
                        <Line yAxisId="right" dataKey="name" display="none" />

                        {teamAbbrs.map(abbr => {
                            const isSelected = selectedTeams.has(abbr);
                            const isHovered = hoveredTeam === abbr;
                            const highlighted = isSelected || isHovered;
                            const dimmed = isDimmed(abbr);
                            const color = getTeamColor(abbr);

                            return (
                                <Line
                                    key={abbr}
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey={abbr}
                                    stroke={highlighted ? color : '#e5e7eb'}
                                    strokeOpacity={dimmed ? 0.1 : highlighted ? 1 : 0.8}
                                    strokeWidth={highlighted ? 4 : 2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: color }}
                                    onMouseEnter={() => setHoveredTeam(abbr)}
                                    onMouseLeave={() => setHoveredTeam(null)}
                                    onClick={() => toggleTeam(abbr)}
                                    className="transition-all duration-300 cursor-pointer"
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-[10px] text-gray-500">
                {teamAbbrs.map(abbr => {
                    const isSelected = selectedTeams.has(abbr);
                    const color = getTeamColor(abbr);

                    return (
                        <button
                            key={abbr}
                            onClick={() => toggleTeam(abbr)}
                            onMouseEnter={() => setHoveredTeam(abbr)}
                            onMouseLeave={() => setHoveredTeam(null)}
                            style={{
                                backgroundColor: isSelected ? color : 'transparent',
                                color: isSelected ? '#000' : undefined,
                                borderColor: isSelected ? color : undefined
                            }}
                            className={clsx(
                                "px-2 py-1 rounded transition-colors border",
                                isSelected
                                    ? "font-bold"
                                    : hoveredTeam === abbr
                                        ? "bg-gray-100 text-slate-900 border-gray-200"
                                        : "bg-transparent border-transparent hover:border-gray-200"
                            )}
                        >
                            {abbr}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
