import {
  Player,
  PlayerPosition,
  SquadPlayerSlot,
  MatchdayHistoricalPerformance,
  PlayerHistoricalData,
  SquadAnalyticsSummary,
} from '../types';

const OPPONENTS_POOL = [
  'Millonarios',
  'Atl. Nacional',
  'Junior',
  'América',
  'Santa Fe',
  'Dep. Cali',
  'Tolima',
  'Once Caldas',
  'Bucaramanga',
  'Medellín',
  'Pereira',
  'La Equidad',
];

// Simple deterministic hash to keep stats consistent for the same player & matchday
function pseudoRandom(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates 5 matchdays of realistic historical performance for a given player
 */
export function getPlayerHistoricalData(player: Player): PlayerHistoricalData {
  const matchdaysCount = 5;
  const history: MatchdayHistoricalPerformance[] = [];

  const clubOpponents = OPPONENTS_POOL.filter(
    (c) => !player.club.toLowerCase().includes(c.toLowerCase().slice(0, 4))
  );

  for (let m = 1; m <= matchdaysCount; m++) {
    const seed = `${player.id}-md-${m}`;
    const rand1 = pseudoRandom(seed + '-1');
    const rand2 = pseudoRandom(seed + '-2');
    const rand3 = pseudoRandom(seed + '-3');
    const rand4 = pseudoRandom(seed + '-4');

    const oppIndex = Math.floor(rand1 * clubOpponents.length);
    const opponent = clubOpponents[oppIndex] || 'Rival';
    const isHome = rand2 > 0.45;

    // Minutes: top players usually play 75-90 min unless rotation/injury
    let minutes = rand3 > 0.12 ? (rand4 > 0.3 ? 90 : Math.floor(65 + rand3 * 25)) : Math.floor(20 + rand4 * 40);

    let goals = 0;
    let assists = 0;
    let cleanSheet = false;
    let saves = 0;
    let recoveries = Math.floor(2 + rand2 * 6);
    let yellowCards = rand4 > 0.82 ? 1 : 0;
    let xG = 0;
    let xA = 0;
    let rating = +(6.3 + rand1 * 2.1).toFixed(1);

    // Position-tailored performance
    if (player.position === 'DEL') {
      const formBoost = (player.form || 7) / 10;
      xG = +(rand1 * 0.9 * formBoost).toFixed(2);
      xA = +(rand2 * 0.5 * formBoost).toFixed(2);
      if (rand1 > 0.55 && minutes >= 60) goals = rand3 > 0.85 ? 2 : 1;
      if (rand2 > 0.70 && minutes >= 60) assists = 1;
      recoveries = Math.floor(1 + rand3 * 3);
    } else if (player.position === 'MED') {
      const formBoost = (player.form || 7) / 10;
      xG = +(rand1 * 0.4 * formBoost).toFixed(2);
      xA = +(rand2 * 0.8 * formBoost).toFixed(2);
      if (rand1 > 0.75 && minutes >= 60) goals = 1;
      if (rand2 > 0.60 && minutes >= 60) assists = rand3 > 0.88 ? 2 : 1;
      recoveries = Math.floor(3 + rand3 * 8);
    } else if (player.position === 'DEF') {
      cleanSheet = rand1 > 0.48;
      if (rand2 > 0.90 && minutes >= 60) goals = 1;
      if (rand3 > 0.80 && minutes >= 60) assists = 1;
      recoveries = Math.floor(4 + rand4 * 8);
      xA = +(rand2 * 0.25).toFixed(2);
    } else if (player.position === 'POR') {
      cleanSheet = rand1 > 0.42;
      saves = Math.floor(2 + rand2 * 6);
      recoveries = Math.floor(1 + rand3 * 3);
    }

    // Points calculation based on Master DT fantasy scoring
    let points = 0;
    // Minutes played
    if (minutes >= 60) points += 2;
    else if (minutes > 0) points += 1;

    // Goals
    if (player.position === 'DEL') points += goals * 4;
    else if (player.position === 'MED') points += goals * 5;
    else if (player.position === 'DEF' || player.position === 'POR') points += goals * 6;

    // Assists
    points += assists * 3;

    // Clean sheet
    if (cleanSheet && minutes >= 60) {
      if (player.position === 'POR' || player.position === 'DEF') points += 4;
      else if (player.position === 'MED') points += 1;
    }

    // Saves for POR
    if (player.position === 'POR') {
      points += Math.floor(saves / 3);
    }

    // Discipline
    if (yellowCards > 0) points -= 1;

    // Match rating bonus
    if (rating >= 7.8) points += 2;
    else if (rating >= 7.3) points += 1;

    // Last matchday sync with current player's immediate match status
    if (m === 5 && player.stats) {
      minutes = player.stats.minutesPlayed;
      goals = player.stats.goals;
      assists = player.stats.assists;
      cleanSheet = player.stats.cleanSheet;
      saves = player.stats.saves;
      yellowCards = player.stats.yellowCards;
      rating = player.stats.matchRating;
      // Re-evaluate point for J5 to match app state closely
      points = Math.max(1, Math.round(
        (minutes >= 60 ? 2 : 1) +
        goals * (player.position === 'DEL' ? 4 : 5) +
        assists * 3 +
        (cleanSheet ? 4 : 0) +
        (saves ? Math.floor(saves / 3) : 0) -
        yellowCards +
        (rating >= 7.5 ? 2 : 0)
      ));
    }

    history.push({
      matchday: m,
      label: `J${m}`,
      opponent,
      isHome,
      points: Math.max(0, points),
      minutesPlayed: minutes,
      goals,
      assists,
      cleanSheet,
      rating,
      saves,
      recoveries,
      yellowCards,
      xG,
      xA,
    });
  }

  const totalPointsLast5 = history.reduce((sum, h) => sum + h.points, 0);
  const averagePoints = +(totalPointsLast5 / matchdaysCount).toFixed(1);

  // Standard deviation for consistency
  const variance =
    history.reduce((sum, h) => sum + Math.pow(h.points - averagePoints, 2), 0) /
    matchdaysCount;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(15, Math.min(98, Math.round(100 - stdDev * 12)));

  // Trend detection: compare J4+J5 vs J1+J2
  const recentAvg = (history[3].points + history[4].points) / 2;
  const earlierAvg = (history[0].points + history[1].points) / 2;
  const trend: 'up' | 'down' | 'stable' =
    recentAvg > earlierAvg + 1.2
      ? 'up'
      : recentAvg < earlierAvg - 1.2
      ? 'down'
      : 'stable';

  // Best matchday
  let best = history[0];
  for (const h of history) {
    if (h.points > best.points) best = h;
  }

  const pointsPerMillion = +(totalPointsLast5 / (player.price || 5.0)).toFixed(2);

  // Radar metrics (0 - 100)
  const totalGoals = history.reduce((s, h) => s + h.goals, 0);
  const totalAssists = history.reduce((s, h) => s + h.assists, 0);
  const avgRating = history.reduce((s, h) => s + h.rating, 0) / matchdaysCount;
  const totalRecoveries = history.reduce((s, h) => s + h.recoveries, 0);

  const attackingScore = Math.min(
    99,
    Math.round((totalGoals * 22 + totalAssists * 15 + (player.position === 'DEL' ? 35 : 15)))
  );

  const defendingScore = Math.min(
    99,
    Math.round(
      (player.position === 'POR' || player.position === 'DEF' ? 50 : 20) +
        totalRecoveries * 1.5 +
        (history.filter((h) => h.cleanSheet).length * 10)
    )
  );

  const formScore = Math.min(99, Math.round((player.form || 7) * 10));
  const efficiencyScore = Math.min(99, Math.round(pointsPerMillion * 14));
  const influenceScore = Math.min(99, Math.round((avgRating - 5.5) * 35));

  return {
    player,
    history,
    averagePoints,
    totalPointsLast5,
    pointsPerMillion,
    consistencyScore,
    trend,
    bestMatchday: {
      matchday: best.matchday,
      points: best.points,
      opponent: best.opponent,
    },
    radarMetrics: {
      attacking: Math.max(15, attackingScore),
      defending: Math.max(15, defendingScore),
      consistency: consistencyScore,
      form: Math.max(20, formScore),
      efficiency: Math.max(15, efficiencyScore),
      influence: Math.max(20, influenceScore),
    },
  };
}

/**
 * Computes collective squad historical metrics across the last 5 matchdays
 */
export function getSquadAnalyticsSummary(slots: SquadPlayerSlot[]): SquadAnalyticsSummary {
  const filledSlots = slots.filter((s) => s.player !== null);
  const historicalList = filledSlots.map((s) => getPlayerHistoricalData(s.player!));

  const matchdays = [1, 2, 3, 4, 5].map((md) => {
    let totalStarterPoints = 0;
    let totalSquadPoints = 0;
    let totalRating = 0;
    let ratingCount = 0;

    filledSlots.forEach((slot) => {
      const pHist = historicalList.find((h) => h.player.id === slot.player!.id);
      if (!pHist) return;
      const mdPerf = pHist.history.find((h) => h.matchday === md);
      if (!mdPerf) return;

      totalSquadPoints += mdPerf.points;
      if (slot.isStarter) {
        totalStarterPoints += mdPerf.points;
      }
      totalRating += mdPerf.rating;
      ratingCount++;
    });

    return {
      matchday: md,
      label: `J${md}`,
      totalStarterPoints,
      totalSquadPoints,
      averageRating: ratingCount > 0 ? +(totalRating / ratingCount).toFixed(1) : 0,
    };
  });

  const totalPointsLast5 = matchdays.reduce((s, m) => s + m.totalStarterPoints, 0);
  const averagePerMatchday = +(totalPointsLast5 / 5).toFixed(1);

  // Top performer (most total points in 5 matchdays)
  let topPerformer: PlayerHistoricalData | null = null;
  let bestValuePlayer: PlayerHistoricalData | null = null;
  let mostConsistentPlayer: PlayerHistoricalData | null = null;

  if (historicalList.length > 0) {
    topPerformer = [...historicalList].sort((a, b) => b.totalPointsLast5 - a.totalPointsLast5)[0];
    bestValuePlayer = [...historicalList].sort((a, b) => b.pointsPerMillion - a.pointsPerMillion)[0];
    mostConsistentPlayer = [...historicalList].sort((a, b) => b.consistencyScore - a.consistencyScore)[0];
  }

  // Positional breakdown
  const positions: PlayerPosition[] = ['POR', 'DEF', 'MED', 'DEL'];
  const positionalPoints: Record<PlayerPosition, number> = { POR: 0, DEF: 0, MED: 0, DEL: 0 };

  filledSlots.forEach((slot) => {
    if (!slot.isStarter) return;
    const pHist = historicalList.find((h) => h.player.id === slot.player!.id);
    if (pHist) {
      positionalPoints[slot.position] += pHist.totalPointsLast5;
    }
  });

  const positionalBreakdown = positions.map((pos) => {
    const pts = positionalPoints[pos];
    const share = totalPointsLast5 > 0 ? +((pts / totalPointsLast5) * 100).toFixed(1) : 0;
    return {
      position: pos,
      totalPoints: pts,
      sharePercentage: share,
    };
  });

  return {
    matchdays,
    totalPointsLast5,
    averagePerMatchday,
    topPerformer,
    bestValuePlayer,
    mostConsistentPlayer,
    positionalBreakdown,
  };
}
