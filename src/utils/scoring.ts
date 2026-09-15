import { Player, PlayerPosition, PlayerStats, ChipType, CalculatedScore, ScoringBreakdownItem } from '../types';

/**
 * Custom Scoring Engine for Master DT Fantasy Football
 * Implementation of position-based scoring table accepting player match statistics.
 */
export function calculatePlayerScore(
  player: Player,
  options?: {
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    isCaptainInactive?: boolean;
    activeChip?: ChipType;
    isWorstXIMode?: boolean;
  }
): CalculatedScore {
  const stats: PlayerStats = player.stats;
  const position: PlayerPosition = player.position;
  const breakdown: ScoringBreakdownItem[] = [];

  let baseScore = 0;

  // Anti-Exploit Rule for "El Peor Once":
  // Early substitutes or unconfirmed starters receive the position's median score
  if (options?.isWorstXIMode && stats.wasEarlySubstituted) {
    const medianScoreByPosition: Record<PlayerPosition, number> = {
      POR: 3,
      DEF: 2,
      MED: 3,
      DEL: 2,
    };
    const medianPts = medianScoreByPosition[position] || 2;
    breakdown.push({
      category: 'Regla Anti-Exploit',
      detail: 'Sustitución temprana / Mediana posicional',
      points: medianPts,
    });
    return {
      total: medianPts,
      breakdown,
      multiplier: 1,
      multiplierReason: 'El Peor Once (Mediana aplicada)',
    };
  }

  // 1. Base Minutes Played
  if (stats.minutesPlayed >= 60) {
    breakdown.push({
      category: 'Minutos',
      detail: `${stats.minutesPlayed} mins jugados (>=60)`,
      points: 2,
    });
    baseScore += 2;
  } else if (stats.minutesPlayed > 0) {
    breakdown.push({
      category: 'Minutos',
      detail: `${stats.minutesPlayed} mins jugados (<60)`,
      points: 1,
    });
    baseScore += 1;
  }

  // 2. Offense
  if (stats.goals > 0) {
    let goalPts = 4;
    if (position === 'POR' || position === 'DEF') goalPts = 6;
    else if (position === 'MED') goalPts = 5;

    const totalGoalPts = stats.goals * goalPts;
    breakdown.push({
      category: 'Ataque',
      detail: `${stats.goals} gol${stats.goals > 1 ? 'es' : ''} (+${goalPts} c/u)`,
      points: totalGoalPts,
    });
    baseScore += totalGoalPts;
  }

  if (stats.assists > 0) {
    const totalAssistPts = stats.assists * 3;
    breakdown.push({
      category: 'Ataque',
      detail: `${stats.assists} asistencia${stats.assists > 1 ? 's' : ''} (+3 c/u)`,
      points: totalAssistPts,
    });
    baseScore += totalAssistPts;
  }

  if ((position === 'MED' || position === 'DEL') && stats.dribbles >= 3) {
    const dribblePts = Math.floor(stats.dribbles / 3);
    breakdown.push({
      category: 'Ataque',
      detail: `${stats.dribbles} regates exitosos (+1 por c/3)`,
      points: dribblePts,
    });
    baseScore += dribblePts;
  }

  // 3. Defense
  if (stats.cleanSheet && stats.minutesPlayed >= 60) {
    if (position === 'POR' || position === 'DEF') {
      breakdown.push({
        category: 'Defensa',
        detail: 'Valla invicta (>=60 min)',
        points: 4,
      });
      baseScore += 4;
    } else if (position === 'MED') {
      breakdown.push({
        category: 'Defensa',
        detail: 'Valla invicta (>=60 min)',
        points: 1,
      });
      baseScore += 1;
    }
  }

  if ((position === 'DEF' || position === 'MED') && stats.recoveries >= 6) {
    const recoveryPts = Math.floor(stats.recoveries / 6);
    breakdown.push({
      category: 'Defensa',
      detail: `${stats.recoveries} balones recuperados (+1 por c/6)`,
      points: recoveryPts,
    });
    baseScore += recoveryPts;
  }

  if (position === 'POR' && stats.saves >= 3) {
    const savePts = Math.floor(stats.saves / 3);
    breakdown.push({
      category: 'Defensa',
      detail: `${stats.saves} atajadas (+1 por c/3)`,
      points: savePts,
    });
    baseScore += savePts;
  }

  if (stats.penaltySaves > 0) {
    const penSavePts = stats.penaltySaves * 5;
    breakdown.push({
      category: 'Defensa',
      detail: `${stats.penaltySaves} penal${stats.penaltySaves > 1 ? 'es' : ''} atajado (+5 c/u)`,
      points: penSavePts,
    });
    baseScore += penSavePts;
  }

  // 4. Penalties / Negative Actions
  if (stats.penaltyMissed > 0) {
    const penMissPts = stats.penaltyMissed * -2;
    breakdown.push({
      category: 'Sanciones',
      detail: `${stats.penaltyMissed} penal fallado (-2 c/u)`,
      points: penMissPts,
    });
    baseScore += penMissPts;
  }

  if ((position === 'POR' || position === 'DEF') && stats.goalsConceded >= 2) {
    const concededPts = Math.floor(stats.goalsConceded / 2) * -1;
    breakdown.push({
      category: 'Sanciones',
      detail: `${stats.goalsConceded} goles recibidos (-1 por c/2)`,
      points: concededPts,
    });
    baseScore += concededPts;
  }

  if (stats.yellowCards > 0) {
    const yellowPts = stats.yellowCards * -1;
    breakdown.push({
      category: 'Sanciones',
      detail: `${stats.yellowCards} tarjeta amarilla (-1)`,
      points: yellowPts,
    });
    baseScore += yellowPts;
  }

  if (stats.redCards > 0) {
    const redPts = stats.redCards * -3;
    breakdown.push({
      category: 'Sanciones',
      detail: 'Tarjeta roja directa / doble amarilla (-3)',
      points: redPts,
    });
    baseScore += redPts;
  }

  if (stats.ownGoals > 0) {
    const ogPts = stats.ownGoals * -2;
    breakdown.push({
      category: 'Sanciones',
      detail: `${stats.ownGoals} autogol (-2 c/u)`,
      points: ogPts,
    });
    baseScore += ogPts;
  }

  // 5. Bonus MVP
  if (stats.mvpBonusRank === 1) {
    breakdown.push({ category: 'Bonus MVP', detail: 'Figura del partido (Puesto 1)', points: 3 });
    baseScore += 3;
  } else if (stats.mvpBonusRank === 2) {
    breakdown.push({ category: 'Bonus MVP', detail: 'Puesto 2 en Match Rating', points: 2 });
    baseScore += 2;
  } else if (stats.mvpBonusRank === 3) {
    breakdown.push({ category: 'Bonus MVP', detail: 'Puesto 3 en Match Rating', points: 1 });
    baseScore += 1;
  }

  // Multipliers (Captain & Chips)
  let multiplier = 1;
  let multiplierReason = 'Estándar 1x';

  const shouldGetCaptainBonus =
    options?.isCaptain || (options?.isViceCaptain && options?.isCaptainInactive);

  if (shouldGetCaptainBonus) {
    if (options?.activeChip === 'triple_captain') {
      multiplier = 3;
      multiplierReason = 'Capitán + Chip Triple Capitán (3x)';
    } else {
      multiplier = 2;
      multiplierReason = options?.isCaptain ? 'Capitán (2x)' : 'Vice-Capitán activado por suplencia (2x)';
    }
  } else if (options?.activeChip === 'regional_wildcard' && player.isLibertadoresColombian) {
    multiplier = 1.5;
    multiplierReason = 'Chip Regional Wildcard (1.5x colombiano en torneo Conmebol)';
  }

  const finalTotal = Math.round(baseScore * multiplier * 10) / 10;

  return {
    total: finalTotal,
    breakdown,
    multiplier,
    multiplierReason,
  };
}

/**
 * Formats COP currency nicely
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Millions COP (e.g. 8.5M COP)
 */
export function formatCOPPrice(millions: number): string {
  return `$${millions.toFixed(1)}M`;
}
