export interface Standing {
    teamid: number;
    teamname: string;
    shortname: string;
    teamabbr: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsfor: number;
    goalsagainst: number;
    goaldifference: number;
    points: number;
    position: number;
    home: StandingSplit;
    away: StandingSplit;
}

export interface StandingSplit {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    position: number;
}

export interface Fixture {
    match_id: number;
    kickoff_time: string; // ISO string
    kickoff_timezone: string;
    gameweek: number;
    venue: string;
    home_team_id: number;
    home_team_name: string;
    home_team_abbr: string;
    away_team_id: number;
    away_team_name: string;
    away_team_abbr: string;
}

export interface CompletedFixture extends Fixture {
    home_team_score: number;
    away_team_score: number;
    home_team_redcard: number;
    away_team_redcard: number;
    home_stats: TeamMatchStats;
    away_stats: TeamMatchStats;
    events: MatchEvents;
    home_team_lineup: TeamLineup;
    away_team_lineup: TeamLineup;
    match_report: string;
}

export interface TeamLineup {
    teamId: number;
    lineup: string[][];
    players: number[];
    subs: number[];
    formation: string;
}

export interface TeamMatchStats {
    goals: number;
    possessionPercentage: number;
    totalPass: number;
    ontargetScoringAtt: number;
    totalScoringAtt: number;
    expectedGoals: number;
    wonCorners: number;
    fkFoulLost: number; // Fouls conceded
    duelWon: number;
    aerialWon: number;
    // Add more as needed
}

export interface MatchEvents {
    homeTeam: TeamEvents;
    awayTeam: TeamEvents;
}

export interface TeamEvents {
    id: string;
    name: string;
    goals: GoalEvent[];
    cards: CardEvent[];
    subs: SubEvent[];
}

export interface GoalEvent {
    time: string;
    goalType: string;
    playerId: string;
    assistPlayerId?: string;
}

export interface CardEvent {
    time: string;
    type: string;
    playerId: string;
}

export interface SubEvent {
    time: string;
    playerOnId: string;
    playerOffId: string;
}

export interface Team {
    id: number;
    team_id?: number; // Sometimes redundant
    name: string;
    abbr: string;
    stats: AggregatedTeamStats;
    stadium?: string;
    fpl_data?: {
        position: number;
        [key: string]: unknown;
    };
}

export interface AggregatedTeamStats {
    goals: number;
    goalsConceded: number;
    possessionAvg: number;
    shots: number;
    totalShots: number;
    shotsOnTargetIncGoals: number;
    successfulShortPasses: number;
    successfulLongPasses: number;
    homeGoals: number;
    awayGoals: number;
    cleanSheets: number;
    expectedGoals: number;
    expectedGoalsOnTargetConceded: number;
    possessionPercentage: number;
    passingAccuracy: number;
    interceptions: number;
    duelsWon: number;
    duelsLost: number;
    groundDuelsWon: number;
    groundDuelsLost: number;
    aerialDuelsWon: number;
    aerialDuelsLost: number;
    strength_attack_home: number;
    strength_defence_home: number;
    strength_attack_away: number;
    strength_defence_away: number;
    // Granular Goal Stats
    headedGoals: number;
    leftFootGoals: number;
    rightFootGoals: number;
    penaltyGoals: number;
    goalsConcededInsideBox: number;
    goalsConcededOutsideBox: number;
    totalShotsConceded: number;
    shotsOnConcededInsideBox: number;
    shotsOnConcededOutsideBox: number;
    // Passing/Possession Granular
    successfulPassesOwnHalf: number;
    successfulPassesOppositionHalf: number;
    touchesInOppBox: number;
    cornersWon: number;
    [key: string]: number | string; // Fallback
}

export interface Player {
    player_id: number;
    player_name: string;
    team_id: number;
    position: string;
    first_name: string;
    last_name: string;
    shirt_num: number;
    height: number;
    weight: number;
    preferred_foot: string;
    dob: string;
    country: string;
    goals: number; // Derived from stats usually, but kept for compatibility
    assists: number;
    minutes_played: number;

    // FPL Specific Stats
    fpl_stats?: {
        id: number;
        code: number;
        team: number;
        element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
        now_cost: number;
        total_points: number;
        event_points: number;
        points_per_game: string;
        selected_by_percent: string;
        form: string;
        transfers_in: number;
        transfers_in_event: number;
        transfers_out: number;
        transfers_out_event: number;
        value_season: string;
        minutes: number;
        goals_scored: number;
        assists: number;
        clean_sheets: number;
        goals_conceded: number;
        own_goals: number;
        penalties_saved: number;
        penalties_missed: number;
        yellow_cards: number;
        red_cards: number;
        saves: number;
        bonus: number;
        bps: number;
        influence: string;
        creativity: string;
        threat: string;
        ict_index: string;
        expected_goals: string;
        expected_assists: string;
        expected_goal_involvements: string;
        expected_goals_conceded: string;
        news: string;
        status: string; // 'a' = available, 'd' = doubt, 'i' = injured, etc.
        chance_of_playing_next_round: number | null;
        chance_of_playing_this_round: number | null;
    };

    // Granular Performance Stats (Opta/Backend)
    stats: {
        appearances: number;
        starts: number;
        timePlayed: number;

        // Attacking
        goals: number;
        goalAssists: number;
        totalShots: number;
        shotsOnTargetIncGoals: number;
        shotsOffTargetIncWoodwork: number;
        hitWoodwork: number;
        bigChancesCreated?: number; // Check availability
        successfulDribbles: number;
        unsuccessfulDribbles: number;
        totalTouchesInOppositionBox: number;

        // Passing & Creation
        totalPasses: number;
        openPlayPasses: number;
        successfulShortPasses: number;
        unsuccessfulShortPasses: number;
        successfulLongPasses: number;
        unsuccessfulLongPasses: number;
        successfulPassesOppositionHalf: number;
        successfulPassesOwnHalf: number;
        successfulCrossesOpenPlay: number;
        keyPassesAttemptAssists: number;
        throughBalls: number;
        forwardPasses: number;
        backwardPasses: number;
        leftsidePasses: number;
        rightsidePasses: number;

        // Defense
        cleanSheets: number;
        goalsConceded: number;
        goalsConcededInsideBox: number;
        goalsConcededOutsideBox: number;
        tacklesWon: number;
        tacklesLost: number;
        totalTackles: number;
        interceptions: number;
        totalClearances: number;
        blocks: number;
        recoveries: number;
        duelsWon: number;
        duelsLost: number;
        aerialDuelsWon: number;
        aerialDuelsLost: number;
        groundDuelsWon: number;
        groundDuelsLost: number;
        totalFoulsConceded: number;

        // Goalkeeping (Specific)
        savesMade: number;
        savesMadeFromInsideBox: number;
        savesMadeFromOutsideBox: number;
        catches: number;
        punches: number;
        drops: number;
        goalKicks: number;
        gkSuccessfulDistribution: number;
        gkUnsuccessfulDistribution: number;
        penaltiesFaced: number;
        penaltyGoalsConceded: number;

        // Mistakes/Discipline
        yellowCards: number;
        totalRedCards: number;
        straightRedCards: number;
        errorLeadingToGoal?: number;
        ownGoals?: number;
    }
}

export interface WeeklyStanding {
    gameweek: number;
    team_name: string;
    points: number;
    position?: number; // Might need to calculate this
    goal_difference: number;
    goals_for: number;
    goals_against: number;
}
