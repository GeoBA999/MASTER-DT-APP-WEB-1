import { PlayerPosition, CalculatedScore } from '../types';

export interface ApiFootballPlayerStats {
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
  saves: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  penaltiesCommitted: number;
  cleanSheet: boolean;
  shotsOnTarget?: number;
  passesAccuracy?: number;
}

export interface ApiFootballPlayer {
  id: number;
  name: string;
  number?: number;
  position: PlayerPosition;
  grid?: string | null;
  photo?: string;
  teamName: string;
  teamLogo?: string;
  isStarter: boolean;
  stats: ApiFootballPlayerStats;
  fantasyScore: CalculatedScore;
}

export interface ApiFootballFixture {
  id: number;
  date: string;
  timestamp: number;
  status: string;
  elapsed?: number;
  venue: string;
  city: string;
  referee?: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    goals: number | null;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    goals: number | null;
  };
}

/**
 * Traduce las estadísticas reales de un jugador obtenidas de la API de fútbol
 * en los puntos oficiales del sistema Master DT.
 */
export function calculatePointsFromApiStats(
  stats: ApiFootballPlayerStats,
  position: PlayerPosition,
  options: {
    isWorstXI?: boolean;
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    isTripleCaptain?: boolean;
    hasDefensiveMasteryChip?: boolean;
    hasGoalrushChip?: boolean;
  } = {}
): CalculatedScore {
  const breakdown: { category: string; detail: string; points: number }[] = [];
  const {
    isWorstXI = false,
    isCaptain = false,
    isTripleCaptain = false,
    hasDefensiveMasteryChip = false,
    hasGoalrushChip = false,
  } = options;

  let basePoints = 0;

  // 1. Minutos Jugados
  if (stats.minutes >= 60) {
    const pts = isWorstXI ? 0 : 2;
    breakdown.push({
      category: 'Minutos jugados',
      detail: `Jugó ${stats.minutes} min (>=60')`,
      points: pts,
    });
    basePoints += pts;
  } else if (stats.minutes > 0) {
    const pts = isWorstXI ? 1 : 1;
    breakdown.push({
      category: 'Minutos jugados',
      detail: `Jugó ${stats.minutes} min (<60')`,
      points: pts,
    });
    basePoints += pts;
  } else {
    breakdown.push({
      category: 'Sin minutos',
      detail: 'No disputó minutos en el partido',
      points: 0,
    });
  }

  // 2. Goles anotados según posición
  if (stats.goals > 0) {
    let ptsPerGoal = 4;
    if (position === 'DEF' || position === 'POR') {
      ptsPerGoal = 6;
    } else if (position === 'MED') {
      ptsPerGoal = 5;
    }

    if (hasGoalrushChip && position === 'DEL') {
      ptsPerGoal += 2;
    }

    const goalPts = isWorstXI ? -(stats.goals * 4) : stats.goals * ptsPerGoal;
    breakdown.push({
      category: 'Goles anotados',
      detail: `${stats.goals} gol(es) (${position})`,
      points: goalPts,
    });
    basePoints += goalPts;
  }

  // 3. Asistencias de gol
  if (stats.assists > 0) {
    const assistPts = isWorstXI ? -(stats.assists * 3) : stats.assists * 3;
    breakdown.push({
      category: 'Asistencias',
      detail: `${stats.assists} asistencia(s) clave(s)`,
      points: assistPts,
    });
    basePoints += assistPts;
  }

  // 4. Portería a Cero (Valla Invicta)
  if (stats.cleanSheet && stats.minutes >= 60) {
    let csPts = 0;
    if (position === 'POR' || position === 'DEF') {
      csPts = hasDefensiveMasteryChip ? 6 : 4;
    } else if (position === 'MED') {
      csPts = 1;
    }

    if (csPts > 0) {
      const finalCs = isWorstXI ? -csPts : csPts;
      breakdown.push({
        category: 'Valla invicta',
        detail: `Portería a cero (${stats.minutes}' jugados)`,
        points: finalCs,
      });
      basePoints += finalCs;
    }
  }

  // 5. Paradas del Portero (POR)
  if (position === 'POR' && stats.saves > 0) {
    const savePts = Math.floor(stats.saves / 3);
    if (savePts > 0) {
      const finalSavePts = isWorstXI ? -savePts : savePts;
      breakdown.push({
        category: 'Atajadas / Paradas',
        detail: `${stats.saves} tiros atajados (+1 cada 3)`,
        points: finalSavePts,
      });
      basePoints += finalSavePts;
    }
  }

  // 6. Penalti Atajado (POR)
  if (stats.penaltiesSaved > 0) {
    const penSavedPts = isWorstXI ? -(stats.penaltiesSaved * 5) : stats.penaltiesSaved * 5;
    breakdown.push({
      category: 'Penal atajado',
      detail: `${stats.penaltiesSaved} penal(es) atajado(s)`,
      points: penSavedPts,
    });
    basePoints += penSavedPts;
  }

  // 7. Penalti Fallado
  if (stats.penaltiesMissed > 0) {
    const penMissedPts = isWorstXI ? stats.penaltiesMissed * 3 : -(stats.penaltiesMissed * 2);
    breakdown.push({
      category: 'Penal fallado',
      detail: `${stats.penaltiesMissed} penal(es) errado(s)`,
      points: penMissedPts,
    });
    basePoints += penMissedPts;
  }

  // 8. Autogoles
  if (stats.ownGoals > 0) {
    const ogPts = isWorstXI ? stats.ownGoals * 4 : -(stats.ownGoals * 2);
    breakdown.push({
      category: 'Autogol',
      detail: `${stats.ownGoals} gol(es) en contra`,
      points: ogPts,
    });
    basePoints += ogPts;
  }

  // 9. Goles Recibidos (POR y DEF)
  if ((position === 'POR' || position === 'DEF') && stats.goalsConceded >= 2) {
    const concededCount = Math.floor(stats.goalsConceded / 2);
    const concededPts = isWorstXI ? concededCount * 2 : -concededCount;
    breakdown.push({
      category: 'Goles recibidos',
      detail: `${stats.goalsConceded} goles encajados (-1 cada 2)`,
      points: concededPts,
    });
    basePoints += concededPts;
  }

  // 10. Tarjetas Amarillas
  if (stats.yellowCards > 0) {
    const ycPts = isWorstXI ? stats.yellowCards * 2 : -(stats.yellowCards * 1);
    breakdown.push({
      category: 'Tarjeta amarilla',
      detail: `${stats.yellowCards} tarjeta(s) amarilla(s)`,
      points: ycPts,
    });
    basePoints += ycPts;
  }

  // 11. Tarjetas Rojas
  if (stats.redCards > 0) {
    const rcPts = isWorstXI ? stats.redCards * 5 : -(stats.redCards * 3);
    breakdown.push({
      category: 'Tarjeta roja',
      detail: 'Expulsión directa o doble amarilla',
      points: rcPts,
    });
    basePoints += rcPts;
  }

  // 12. Rendimiento / Bonus de Rating Sofascore / API
  if (stats.rating >= 8.5) {
    const bonus = isWorstXI ? -3 : 3;
    breakdown.push({
      category: 'Bonus Rating MVP',
      detail: `Rating sobresaliente: ${stats.rating}`,
      points: bonus,
    });
    basePoints += bonus;
  } else if (stats.rating >= 7.5) {
    const bonus = isWorstXI ? -2 : 2;
    breakdown.push({
      category: 'Bonus Rating',
      detail: `Rating destacado: ${stats.rating}`,
      points: bonus,
    });
    basePoints += bonus;
  } else if (stats.rating >= 7.0 && !isWorstXI) {
    breakdown.push({
      category: 'Bonus Rendimiento',
      detail: `Rating positivo: ${stats.rating}`,
      points: 1,
    });
    basePoints += 1;
  } else if (isWorstXI && stats.rating > 0 && stats.rating < 6.0) {
    // En El Peor Once, ratings muy bajos otorgan puntos
    breakdown.push({
      category: 'Desempeño Deficiente (Peor Once)',
      detail: `Rating bajo: ${stats.rating}`,
      points: 3,
    });
    basePoints += 3;
  }

  // Multiplicador de capitán
  let multiplier = 1;
  let multiplierReason = 'Puntos directos (1x)';

  if (isTripleCaptain) {
    multiplier = 3;
    multiplierReason = 'Chip Triple Capitán (3x)';
  } else if (isCaptain) {
    multiplier = 2;
    multiplierReason = 'Capitán titular (2x)';
  }

  const finalTotal = basePoints * multiplier;

  return {
    total: finalTotal,
    breakdown,
    multiplier,
    multiplierReason,
  };
}
