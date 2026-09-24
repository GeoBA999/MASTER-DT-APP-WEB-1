import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Football API Config
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || 'dde4cab91e7ee21dfa6b0c3147fa6dd0';
const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';

// In-memory cache to respect API-Football rate limits (100 req/day on Free tier)
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function fetchFromFootballApi(endpoint: string): Promise<any> {
  const cached = apiCache.get(endpoint);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(`${FOOTBALL_API_BASE}${endpoint}`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors && Object.keys(json.errors).length > 0 && !Array.isArray(json.errors)) {
    console.warn('API-Football warning/error:', json.errors);
  }

  apiCache.set(endpoint, { data: json, timestamp: now });
  return json;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Status & Remaining Quota
app.get('/api/football/status', async (req, res) => {
  try {
    const data = await fetchFromFootballApi('/status');
    res.json({
      success: true,
      data: data.response || null,
      errors: data.errors || [],
      quotaRemaining: data.response?.requests
        ? data.response.requests.limit_day - data.response.requests.current
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching football API status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fixtures for League / Round
// Default: Liga BetPlay (id: 239), season: 2024, round: 'Clausura - 10'
app.get('/api/football/fixtures', async (req, res) => {
  try {
    const league = req.query.league || '239';
    const season = req.query.season || '2024';
    const round = req.query.round || 'Clausura - 10';

    const endpoint = `/fixtures?league=${league}&season=${season}&round=${encodeURIComponent(String(round))}`;
    const data = await fetchFromFootballApi(endpoint);

    const fixtures = (data.response || []).map((item: any) => ({
      id: item.fixture.id,
      date: item.fixture.date,
      timestamp: item.fixture.timestamp,
      status: item.fixture.status.short,
      statusLong: item.fixture.status.long,
      elapsed: item.fixture.status.elapsed,
      venue: item.fixture.venue.name || 'Estadio Principal',
      city: item.fixture.venue.city || 'Colombia',
      referee: item.fixture.referee,
      homeTeam: {
        id: item.teams.home.id,
        name: item.teams.home.name,
        logo: item.teams.home.logo,
        goals: item.goals.home,
        winner: item.teams.home.winner,
      },
      awayTeam: {
        id: item.teams.away.id,
        name: item.teams.away.name,
        logo: item.teams.away.logo,
        goals: item.goals.away,
        winner: item.teams.away.winner,
      },
    }));

    res.json({
      success: true,
      league: { id: league, season, round },
      count: fixtures.length,
      fixtures,
    });
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lineups for a specific fixture
app.get('/api/football/lineups/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const endpoint = `/fixtures/lineups?fixture=${fixtureId}`;
    const data = await fetchFromFootballApi(endpoint);

    const lineups = (data.response || []).map((teamData: any) => ({
      team: {
        id: teamData.team.id,
        name: teamData.team.name,
        logo: teamData.team.logo,
        colors: teamData.team.colors,
      },
      coach: teamData.coach?.name || 'Director Técnico',
      coachPhoto: teamData.coach?.photo,
      formation: teamData.formation,
      startXI: (teamData.startXI || []).map((entry: any) => ({
        id: entry.player.id,
        name: entry.player.name,
        number: entry.player.number,
        position: entry.player.pos, // 'G', 'D', 'M', 'F'
        grid: entry.player.grid,
      })),
      substitutes: (teamData.substitutes || []).map((entry: any) => ({
        id: entry.player.id,
        name: entry.player.name,
        number: entry.player.number,
        position: entry.player.pos,
      })),
    }));

    res.json({
      success: true,
      fixtureId,
      lineups,
    });
  } catch (error: any) {
    console.error('Error fetching lineups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual player statistics for a fixture
app.get('/api/football/player-stats/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const endpoint = `/fixtures/players?fixture=${fixtureId}`;
    const data = await fetchFromFootballApi(endpoint);

    const teams = (data.response || []).map((teamData: any) => {
      const players = (teamData.players || []).map((p: any) => {
        const stats = p.statistics?.[0] || {};
        const pos = stats.games?.position;
        // Position mapping to Master DT positions (POR, DEF, MED, DEL)
        let normalizedPos: 'POR' | 'DEF' | 'MED' | 'DEL' = 'MED';
        if (pos === 'G') normalizedPos = 'POR';
        else if (pos === 'D') normalizedPos = 'DEF';
        else if (pos === 'M') normalizedPos = 'MED';
        else if (pos === 'F') normalizedPos = 'DEL';

        const minutes = stats.games?.minutes || 0;
        const goals = stats.goals?.total || 0;
        const assists = stats.goals?.assists || 0;
        const saves = stats.goals?.saves || 0;
        const conceded = stats.goals?.conceded || 0;
        const cleanSheet = minutes >= 60 && conceded === 0;
        const yellowCards = stats.cards?.yellow || 0;
        const redCards = stats.cards?.red || 0;
        const penaltiesSaved = stats.penalty?.saved || 0;
        const penaltiesMissed = stats.penalty?.missed || 0;
        const penaltiesCommitted = stats.penalty?.commited || 0;
        const rating = stats.games?.rating ? parseFloat(stats.games.rating) : 6.0;

        return {
          id: p.player.id,
          name: p.player.name,
          photo: p.player.photo,
          number: stats.games?.number,
          position: normalizedPos,
          isStarter: !stats.games?.substitute,
          captain: stats.games?.captain || false,
          stats: {
            minutes,
            rating,
            goals,
            assists,
            saves,
            goalsConceded: conceded,
            yellowCards,
            redCards,
            penaltiesSaved,
            penaltiesMissed,
            penaltiesCommitted,
            cleanSheet,
            shotsOnTarget: stats.shots?.on || 0,
            passesAccuracy: stats.passes?.accuracy ? parseInt(stats.passes.accuracy, 10) : 0,
          },
        };
      });

      return {
        teamId: teamData.team.id,
        teamName: teamData.team.name,
        teamLogo: teamData.team.logo,
        players,
      };
    });

    res.json({
      success: true,
      fixtureId,
      teams,
    });
  } catch (error: any) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Consolidate live matchday data with calculated fantasy points
app.get('/api/football/matchday-fantasy', async (req, res) => {
  try {
    const fixtureId = req.query.fixtureId ? String(req.query.fixtureId) : '1234238'; // Default Millonarios vs Equidad
    const statsEndpoint = `/fixtures/players?fixture=${fixtureId}`;
    const statsData = await fetchFromFootballApi(statsEndpoint);

    const playersWithScores: any[] = [];

    (statsData.response || []).forEach((teamData: any) => {
      (teamData.players || []).forEach((p: any) => {
        const stats = p.statistics?.[0] || {};
        const pos = stats.games?.position;
        let normalizedPos: 'POR' | 'DEF' | 'MED' | 'DEL' = 'MED';
        if (pos === 'G') normalizedPos = 'POR';
        else if (pos === 'D') normalizedPos = 'DEF';
        else if (pos === 'M') normalizedPos = 'MED';
        else if (pos === 'F') normalizedPos = 'DEL';

        const minutes = stats.games?.minutes || 0;
        const goals = stats.goals?.total || 0;
        const assists = stats.goals?.assists || 0;
        const saves = stats.goals?.saves || 0;
        const conceded = stats.goals?.conceded || 0;
        const cleanSheet = minutes >= 60 && conceded === 0;
        const yellowCards = stats.cards?.yellow || 0;
        const redCards = stats.cards?.red || 0;
        const penaltiesSaved = stats.penalty?.saved || 0;
        const penaltiesMissed = stats.penalty?.missed || 0;
        const penaltiesCommitted = stats.penalty?.commited || 0;
        const rating = stats.games?.rating ? parseFloat(stats.games.rating) : 6.0;

        // Calculate fantasy points
        let basePoints = 0;
        const breakdown: { category: string; detail: string; points: number }[] = [];

        // Minutes
        if (minutes >= 60) {
          basePoints += 2;
          breakdown.push({ category: 'Minutos', detail: `${minutes}' en cancha`, points: 2 });
        } else if (minutes > 0) {
          basePoints += 1;
          breakdown.push({ category: 'Minutos', detail: `${minutes}' en cancha`, points: 1 });
        }

        // Goals
        if (goals > 0) {
          const ptsPerGoal = normalizedPos === 'DEL' ? 4 : normalizedPos === 'MED' ? 5 : 6;
          const totalGoalPts = goals * ptsPerGoal;
          basePoints += totalGoalPts;
          breakdown.push({
            category: 'Goles',
            detail: `${goals} gol(es) (${normalizedPos})`,
            points: totalGoalPts,
          });
        }

        // Assists
        if (assists > 0) {
          const assistPts = assists * 3;
          basePoints += assistPts;
          breakdown.push({
            category: 'Asistencias',
            detail: `${assists} asistencia(s)`,
            points: assistPts,
          });
        }

        // Clean Sheet
        if (cleanSheet && (normalizedPos === 'POR' || normalizedPos === 'DEF')) {
          basePoints += 4;
          breakdown.push({ category: 'Valla invicta', detail: '0 goles recibidos', points: 4 });
        } else if (cleanSheet && normalizedPos === 'MED') {
          basePoints += 1;
          breakdown.push({ category: 'Valla invicta', detail: '0 goles recibidos', points: 1 });
        }

        // Goalkeeper Saves
        if (normalizedPos === 'POR' && saves > 0) {
          const savePts = Math.floor(saves / 3);
          if (savePts > 0) {
            basePoints += savePts;
            breakdown.push({
              category: 'Paradas',
              detail: `${saves} atajadas (+1 c/3)`,
              points: savePts,
            });
          }
        }

        // Penalty Saved
        if (penaltiesSaved > 0) {
          const penPts = penaltiesSaved * 5;
          basePoints += penPts;
          breakdown.push({
            category: 'Penal atajado',
            detail: `${penaltiesSaved} penal(es) atajado(s)`,
            points: penPts,
          });
        }

        // Penalty Missed
        if (penaltiesMissed > 0) {
          const penMissPts = -(penaltiesMissed * 2);
          basePoints += penMissPts;
          breakdown.push({
            category: 'Penal fallado',
            detail: `${penaltiesMissed} penal(es) errado(s)`,
            points: penMissPts,
          });
        }

        // Conceded
        if ((normalizedPos === 'POR' || normalizedPos === 'DEF') && conceded >= 2) {
          const concPts = -Math.floor(conceded / 2);
          basePoints += concPts;
          breakdown.push({
            category: 'Goles encajados',
            detail: `${conceded} goles recibidos`,
            points: concPts,
          });
        }

        // Cards
        if (yellowCards > 0) {
          const ycPts = -(yellowCards * 1);
          basePoints += ycPts;
          breakdown.push({
            category: 'Tarjeta amarilla',
            detail: `${yellowCards} amarilla(s)`,
            points: ycPts,
          });
        }
        if (redCards > 0) {
          basePoints += -3;
          breakdown.push({ category: 'Tarjeta roja', detail: 'Expulsión', points: -3 });
        }

        // Rating Bonus
        if (rating >= 8.5) {
          basePoints += 3;
          breakdown.push({ category: 'Bonus MVP', detail: `Rating ${rating}`, points: 3 });
        } else if (rating >= 7.5) {
          basePoints += 2;
          breakdown.push({ category: 'Bonus Destacado', detail: `Rating ${rating}`, points: 2 });
        } else if (rating >= 7.0) {
          basePoints += 1;
          breakdown.push({ category: 'Bonus Rendimiento', detail: `Rating ${rating}`, points: 1 });
        }

        playersWithScores.push({
          id: p.player.id,
          name: p.player.name,
          photo: p.player.photo,
          teamName: teamData.team.name,
          teamLogo: teamData.team.logo,
          number: stats.games?.number,
          position: normalizedPos,
          isStarter: !stats.games?.substitute,
          captain: stats.games?.captain || false,
          stats: {
            minutes,
            rating,
            goals,
            assists,
            saves,
            conceded,
            yellowCards,
            redCards,
            penaltiesSaved,
          },
          fantasyScore: {
            rawPoints: basePoints,
            total: basePoints,
            breakdown,
            multiplierReason: 'Puntos oficiales en vivo (1x)',
          },
        });
      });
    });

    res.json({
      success: true,
      fixtureId,
      players: playersWithScores,
    });
  } catch (error: any) {
    console.error('Error fetching matchday fantasy points:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real BetPlay Players with real-time stats and market prices in Millions of USD
app.get('/api/football/all-players', async (req, res) => {
  try {
    // Collect from cached or live fixtures
    const primaryFixtureIds = ['1234233', '1234238', '1234235', '1234236'];
    const collectedPlayers: any[] = [];
    const seenPlayerIds = new Set<string>();

    for (const fixId of primaryFixtureIds) {
      try {
        const statsEndpoint = `/fixtures/players?fixture=${fixId}`;
        const statsData = await fetchFromFootballApi(statsEndpoint);

        (statsData.response || []).forEach((teamData: any) => {
          const clubName = teamData.team.name || 'Liga BetPlay';
          const clubLogo = teamData.team.logo;

          (teamData.players || []).forEach((p: any) => {
            const playerId = `api-${p.player.id}`;
            if (seenPlayerIds.has(playerId)) return;
            seenPlayerIds.add(playerId);

            const stats = p.statistics?.[0] || {};
            const pos = stats.games?.position;
            let normalizedPos: 'POR' | 'DEF' | 'MED' | 'DEL' = 'MED';
            if (pos === 'G') normalizedPos = 'POR';
            else if (pos === 'D') normalizedPos = 'DEF';
            else if (pos === 'M') normalizedPos = 'MED';
            else if (pos === 'F') normalizedPos = 'DEL';

            const minutes = stats.games?.minutes || 0;
            const goals = stats.goals?.total || 0;
            const assists = stats.goals?.assists || 0;
            const saves = stats.goals?.saves || 0;
            const conceded = stats.goals?.conceded || 0;
            const rating = stats.games?.rating ? parseFloat(stats.games.rating) : 6.5;

            // Generate realistic market valuation in Millions of Dollars ($M USD)
            let basePrice = 6.0;
            if (normalizedPos === 'DEL') basePrice = 8.0 + goals * 1.5;
            else if (normalizedPos === 'MED') basePrice = 7.0 + assists * 1.2;
            else if (normalizedPos === 'DEF') basePrice = 6.0;
            else if (normalizedPos === 'POR') basePrice = 5.5 + saves * 0.4;
            if (rating > 7.5) basePrice += 1.5;
            const price = Math.round(Math.min(14.0, Math.max(4.5, basePrice)) * 10) / 10;

            const nameParts = (p.player.name || 'Jugador').split(' ');
            const shortName = nameParts.length > 1 ? `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}` : nameParts[0];

            collectedPlayers.push({
              id: playerId,
              name: p.player.name,
              shortName,
              club: clubName,
              clubLogo,
              position: normalizedPos,
              price, // in Millions of USD
              photoUrl: p.player.photo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=180&q=80',
              form: Math.round(rating * 10) / 10,
              selectedPercentage: Math.floor(10 + Math.random() * 45),
              tournament: 'LIGA_BETPLAY',
              stats: {
                minutesPlayed: minutes,
                goals,
                assists,
                dribbles: 0,
                cleanSheet: minutes >= 60 && conceded === 0,
                recoveries: 3,
                saves,
                penaltySaves: stats.penalty?.saved || 0,
                penaltyMissed: stats.penalty?.missed || 0,
                goalsConceded: conceded,
                yellowCards: stats.cards?.yellow || 0,
                redCards: stats.cards?.red || 0,
                ownGoals: 0,
                mvpBonusRank: rating >= 8.0 ? 1 : rating >= 7.5 ? 2 : 0,
                matchRating: rating,
                isConfirmedStarter: !stats.games?.substitute,
              },
            });
          });
        });
      } catch (err) {
        console.warn(`Could not load fixture ${fixId} players:`, err);
      }
    }

    res.json({
      success: true,
      count: collectedPlayers.length,
      players: collectedPlayers,
    });
  } catch (error: any) {
    console.error('Error fetching all players from API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Master DT server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
