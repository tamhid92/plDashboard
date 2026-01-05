export const getTeamLogoUrl = (teamName: string): string => {
    // Normalize mapping
    const map: Record<string, string> = {
        "Arsenal": "Arsenal.png",
        "Aston Villa": "Aston Villa.png",
        "Bournemouth": "Bournemouth.png",
        "Brentford": "Brentford.png",
        "Brighton and Hove Albion": "Brighton.png",
        "Brighton & Hove Albion": "Brighton.png", // Just in case
        "Burnley": "Burnley.png",
        "Chelsea": "Chelsea.png",
        "Crystal Palace": "Crystal Palace.png",
        "Everton": "Everton.png",
        "Fulham": "Fulham.png",
        "Leeds United": "Leeds.png",
        "Liverpool": "Liverpool.png",
        "Manchester City": "Manchester City.png",
        "Man City": "Manchester City.png",
        "Manchester United": "Manchester United.png",
        "Man Utd": "Manchester United.png",
        "Newcastle United": "Newcastle United.png",
        "Nottingham Forest": "Nottingham Forest.png",
        "Sunderland": "Sunderland.png",
        "Tottenham Hotspur": "Tottenham.png",
        "Spurs": "Tottenham.png",
        "West Ham United": "West Ham.png",
        "West Ham": "West Ham.png",
        "Wolverhampton Wanderers": "Wolverhampton Wanderers.png",
        "Wolves": "Wolverhampton Wanderers.png"
    };

    const filename = map[teamName] || "epl.png";
    return `/logos/${filename}`;
};
