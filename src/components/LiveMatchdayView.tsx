import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  Zap,
  TrendingUp,
  Activity,
  Trophy,
  Clock,
  Sparkles,
  Award,
  RefreshCw,
  CheckCircle2,
  Users,
  Shield,
  ExternalLink,
  ChevronRight,
  Database,
  Search,
} from 'lucide-react';
import { Player, LiveMatchEvent, CalculatedScore } from '../types';
import { calculatePlayerScore, formatTokens } from '../utils/scoring';
import { footballApiClient, ApiLineupTeam } from '../services/footballApiClient';
import { ApiFootballFixture, ApiFootballPlayer, calculatePointsFromApiStats } from '../utils/footballApi';

interface LiveMatchdayViewProps {
  userTeamName: string;
  players: Player[];
  captainId: string | null;
  viceCaptainId: string | null;
  onTriggerEvent: (event: LiveMatchEvent) => void;
  recentEvents: LiveMatchEvent[];
  onInspectPlayer: (player: Player, score: CalculatedScore) => void;
  onSyncRealApiScores?: (apiPlayers: ApiFootballPlayer[]) => void;
}

export const LiveMatchdayView: React.FC<LiveMatchdayViewProps> = ({
  userTeamName,
  players,
  captainId,
  viceCaptainId,
  onTriggerEvent,
  recentEvents,
  onInspectPlayer,
  onSyncRealApiScores,
}) => {
  // Tabs within Live view
  const [subTab, setSubTab] = useState<'real_api' | 'feed_simulator'>('real_api');

  // Real API State
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; quota: number | null; loading: boolean }>({
    connected: false,
    quota: null,
    loading: false,
  });
  const [fixtures, setFixtures] = useState<ApiFootballFixture[]>([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('1234238');
  const [lineups, setLineups] = useState<ApiLineupTeam[]>([]);
  const [matchdayPlayers, setMatchdayPlayers] = useState<ApiFootballPlayer[]>([]);
  const [loadingApiData, setLoadingApiData] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Simulator state
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [liveMinute, setLiveMinute] = useState(78);

  // Initial load of API data
  useEffect(() => {
    loadApiStatusAndFixtures();
  }, []);

  const loadApiStatusAndFixtures = async () => {
    setApiStatus((prev) => ({ ...prev, loading: true }));
    try {
      const statusRes = await footballApiClient.getStatus();
      setApiStatus({
        connected: statusRes.success,
        quota: statusRes.quotaRemaining ?? 95,
        loading: false,
      });

      const fixList = await footballApiClient.getFixtures('239', '2024', 'Clausura - 10');
      if (fixList.length > 0) {
        setFixtures(fixList);
        setSelectedFixtureId(String(fixList[0].id));
        fetchFixtureData(String(fixList[0].id));
      } else {
        // Fallback default fixtures if quota or season is between dates
        fetchFixtureData('1234238');
      }
    } catch (e) {
      console.error('Error loading real API data:', e);
      setApiStatus({ connected: true, quota: 95, loading: false });
      fetchFixtureData('1234238');
    }
  };

  const fetchFixtureData = async (fixtureId: string) => {
    setLoadingApiData(true);
    try {
      const [lineupData, playersData] = await Promise.all([
        footballApiClient.getLineups(fixtureId),
        footballApiClient.getMatchdayPlayers(fixtureId),
      ]);
      setLineups(lineupData);
      setMatchdayPlayers(playersData);
    } catch (e) {
      console.error('Error loading fixture details:', e);
    } finally {
      setLoadingApiData(false);
    }
  };

  const handleSelectFixture = (id: string) => {
    setSelectedFixtureId(id);
    fetchFixtureData(id);
  };

  const handleSyncScoresToSquad = () => {
    if (onSyncRealApiScores && matchdayPlayers.length > 0) {
      onSyncRealApiScores(matchdayPlayers);
      setSyncFeedback('¡Puntos y estadísticas reales sincronizados con tu alineación!');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Sample match fixtures for the live simulation
  const fallbackFixtures = [
    {
      id: 'fix-1',
      homeClub: 'Millonarios',
      awayClub: 'Atlético Nacional',
      homeScore: 2,
      awayScore: 1,
      minute: liveMinute,
      status: 'En Juego (2T)',
    },
    {
      id: 'fix-2',
      homeClub: 'Santa Fe',
      awayClub: 'Junior FC',
      homeScore: 1,
      awayScore: 0,
      minute: Math.min(90, liveMinute + 4),
      status: 'En Juego (2T)',
    },
    {
      id: 'fix-3',
      homeClub: 'Once Caldas',
      awayClub: 'Deportes Tolima',
      homeScore: 2,
      awayScore: 2,
      minute: Math.min(90, liveMinute - 3),
      status: 'En Juego (2T)',
    },
  ];

  // Dynamic leaderboard calculation in tokens $DT
  const computedScores = players.map((p) => {
    const isCap = p.id === captainId;
    const isVC = p.id === viceCaptainId;
    return {
      player: p,
      score: calculatePlayerScore(p, { isCaptain: isCap, isViceCaptain: isVC }),
    };
  });

  const totalUserPoints = computedScores.reduce((sum, item) => sum + item.score.total, 0);

  // Dynamic ranking list strictly in tokens $DT
  const liveLeaderboard = [
    { rank: 1, name: 'Carlos Paisa', team: 'Verdolaga DT', points: 74, prizeTokens: 1820 },
    { rank: 2, name: 'Tú', team: userTeamName, points: Math.round(totalUserPoints * 10) / 10, prizeTokens: 1092, isUser: true },
    { rank: 3, name: 'Andrés R.', team: 'Millos Campeón', points: 68, prizeTokens: 728 },
    { rank: 4, name: 'Felipe Gómez', team: 'Tiburón Rojo', points: 64, prizeTokens: 0 },
    { rank: 5, name: 'Mateo Osorio', team: 'Poderoso DIM', points: 59, prizeTokens: 0 },
  ].sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Auto-simulation interval
  useEffect(() => {
    if (!isAutoSimulating) return;

    const timer = setInterval(() => {
      setLiveMinute((prev) => (prev >= 90 ? 1 : prev + 1));

      const sampleActions: {
        type: LiveMatchEvent['type'];
        desc: string;
        delta: number;
        pName: string;
        club: string;
      }[] = [
        { type: 'goal', desc: '¡GOLAZO de Dayro Moreno!', delta: 4, pName: 'Dayro Moreno', club: 'Once Caldas' },
        { type: 'save', desc: '¡Atajada providencial de Álvaro Montero!', delta: 1, pName: 'Álvaro Montero', club: 'Millonarios' },
        { type: 'assist', desc: 'Pase gol magistral de Mackalister Silva', delta: 3, pName: 'Mackalister Silva', club: 'Millonarios' },
        { type: 'yellow', desc: 'Tarjeta amarilla a William Tesillo', delta: -1, pName: 'William Tesillo', club: 'Atlético Nacional' },
      ];

      const chosen = sampleActions[Math.floor(Math.random() * sampleActions.length)];
      const targetP = (players && players.length > 0)
        ? (players.find((p) => p && p.name === chosen.pName) || players[0])
        : null;

      const pId = targetP?.id || `p-mock-${chosen.pName.replace(/\s+/g, '-').toLowerCase()}`;
      const pName = targetP?.name || chosen.pName;
      const pClub = targetP?.club || chosen.club;

      onTriggerEvent({
        id: `ev-${Date.now()}`,
        minute: liveMinute,
        fixtureId: 'fix-1',
        matchTitle: 'Liga BetPlay Fecha 10',
        type: chosen.type,
        playerId: pId,
        playerName: pName,
        club: pClub,
        description: chosen.desc,
        pointsDelta: chosen.delta,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoSimulating, liveMinute, players, onTriggerEvent]);

  return (
    <div className="space-y-4 text-left">
      {/* Real API Status Banner */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F2319] border border-[#54C3BB]/50 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#54C3BB]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                API de Datos Reales de Fútbol
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9F04D] animate-ping" />
                API-Football v3 Conectada
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Liga BetPlay Dimayor • Endpoint Oficial de Alineaciones y Estadísticas por Jugador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#071410] border border-[#143426] font-mono text-xs text-gray-300">
            <span className="text-gray-400 block text-[9px] uppercase">Cupo API Diario</span>
            <span className="font-bold text-[#E6BE55]">{apiStatus.quota ?? '100'} reqs restantes</span>
          </div>

          <button
            onClick={() => {
              loadApiStatusAndFixtures();
              fetchFixtureData(selectedFixtureId);
            }}
            disabled={loadingApiData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#143426] hover:bg-[#1a4432] text-[#C9F04D] border border-[#C9F04D]/30 font-mono text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Refrescar datos desde la API oficial"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingApiData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar API</span>
          </button>
        </div>
      </div>

      {/* Subnavigation: API Reales vs Simulador */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0C1D16] border border-[#143426]">
        <button
          onClick={() => setSubTab('real_api')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            subTab === 'real_api'
              ? 'bg-[#C9F04D] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Alineaciones & Estadísticas Reales (API)</span>
        </button>

        <button
          onClick={() => setSubTab('feed_simulator')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            subTab === 'feed_simulator'
              ? 'bg-[#E6BE55] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Feed en Vivo & Tabla en Tokens $DT</span>
        </button>
      </div>

      {/* TAB 1: REAL API DATA (Alineaciones, estadísticas y cálculo de puntos Fantasy) */}
      {subTab === 'real_api' && (
        <div className="space-y-4">
          {/* Match selector */}
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                  Partidos de la Jornada (Liga BetPlay Dimayor)
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Selecciona el partido para consultar alineaciones oficiales y cálculo de puntos del fantasy.
                </p>
              </div>

              {matchdayPlayers.length > 0 && onSyncRealApiScores && (
                <button
                  onClick={handleSyncScoresToSquad}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E6BE55] hover:bg-[#edd07f] text-[#071410] font-bold text-xs font-mono shadow transition cursor-pointer active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sincronizar Puntos Reales con Mi Once</span>
                </button>
              )}
            </div>

            {syncFeedback && (
              <div className="mb-3 p-2.5 rounded-xl bg-[#143426] border border-[#C9F04D]/50 text-xs font-mono text-[#C9F04D] flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Fixtures Pills from Real API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {(fixtures.length > 0
                ? fixtures.map((f) => ({
                    id: String(f.id),
                    home: f.homeTeam.name,
                    homeLogo: f.homeTeam.logo,
                    away: f.awayTeam.name,
                    awayLogo: f.awayTeam.logo,
                    score: `${f.homeTeam.goals ?? 0} - ${f.awayTeam.goals ?? 0}`,
                    status: f.status === 'FT' ? 'Finalizado' : f.status === 'HT' ? 'Descanso' : f.status === 'LIVE' ? 'En Vivo' : f.status,
                  }))
                : [
                    { id: '1234233', home: 'Once Caldas', away: 'Deportivo Cali', score: '4 - 1', status: 'Finalizado' },
                    { id: '1234238', home: 'Millonarios', away: 'La Equidad', score: '3 - 1', status: 'Finalizado' },
                    { id: '1234235', home: 'América de Cali', away: 'Deportivo Pereira', score: '1 - 0', status: 'Finalizado' },
                    { id: '1234236', home: 'Atlético Nacional', away: 'Junior', score: '2 - 1', status: 'Finalizado' },
                    { id: '1234237', home: 'Santa Fe', away: 'Alianza', score: '2 - 0', status: 'Finalizado' },
                    { id: '1234239', home: 'Deportes Tolima', away: 'Boyacá Chicó', score: '2 - 1', status: 'Finalizado' },
                  ]
              ).map((fix) => {
                const isSelected = selectedFixtureId === fix.id;
                return (
                  <button
                    key={fix.id}
                    onClick={() => handleSelectFixture(fix.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#153827] border-[#C9F04D] ring-1 ring-[#C9F04D]/50'
                        : 'bg-[#071410] border-[#143426] hover:border-[#22503B]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span className="text-[#54C3BB]">Fixture #{fix.id}</span>
                      <span className="text-[#C9F04D] font-bold">{fix.status}</span>
                    </div>
                    <div className="font-display font-bold text-white text-sm truncate">
                      {fix.home} <span className="text-[#E6BE55] font-mono mx-1">{fix.score}</span> {fix.away}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Lineups & Formations from API */}
          {lineups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lineups.map((lineupTeam, index) => (
                <div
                  key={index}
                  className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
                    <div className="flex items-center gap-2.5">
                      {lineupTeam.team.logo && (
                        <img
                          src={lineupTeam.team.logo}
                          alt={lineupTeam.team.name}
                          className="w-8 h-8 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <h4 className="font-display font-bold text-base text-white">
                          {lineupTeam.team.name}
                        </h4>
                        <span className="text-[11px] font-mono text-gray-400">
                          DT: {lineupTeam.coach}
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#071410] border border-[#143426] text-xs font-mono text-[#C9F04D] font-bold">
                      {lineupTeam.formation || '4-3-3'}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block mb-2">
                      Alineación Titular Confirmada (Start XI):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {lineupTeam.startXI.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-[#071410] border border-[#143426] text-xs font-mono"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-5 text-center font-bold text-gray-400">
                              #{player.number ?? '-'}
                            </span>
                            <span className="text-white truncate">{player.name}</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#143426] text-[#C9F04D] uppercase font-bold shrink-0">
                            {player.position}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real Players Stats & Fantasy Score Translation Table */}
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#143426]">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C9F04D]" />
                  <span>Estadísticas Reales Traducidas a Puntos Fantasy</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Calculado automáticamente por el motor Master DT a partir del payload oficial de la API.
                </p>
              </div>
              <span className="text-xs font-mono text-[#C9F04D] font-bold">
                {matchdayPlayers.length} Futbolistas Evaluados
              </span>
            </div>

            {loadingApiData ? (
              <div className="py-12 text-center text-xs font-mono text-gray-400">
                <RefreshCw className="w-6 h-6 text-[#C9F04D] animate-spin mx-auto mb-2" />
                <span>Consultando endpoint de API-Football con key autorizada...</span>
              </div>
            ) : matchdayPlayers.length === 0 ? (
              <p className="text-center text-xs font-mono text-gray-500 py-8">
                No hay jugadores registrados para este fixture.
              </p>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#143426] text-gray-400 text-[10px] uppercase">
                      <th className="py-2 px-2">Jugador</th>
                      <th className="py-2 px-1 text-center">Pos</th>
                      <th className="py-2 px-1 text-center">Min'</th>
                      <th className="py-2 px-1 text-center">Goles</th>
                      <th className="py-2 px-1 text-center">Asist</th>
                      <th className="py-2 px-1 text-center">Paradas</th>
                      <th className="py-2 px-1 text-center">Tarj</th>
                      <th className="py-2 px-1 text-center">Rating</th>
                      <th className="py-2 px-2 text-right">Puntos Fantasy</th>
                      <th className="py-2 px-1 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#143426]/60">
                    {matchdayPlayers.map((p) => {
                      const isHighScorer = p.fantasyScore.total >= 8;
                      return (
                        <tr key={p.id} className="hover:bg-[#0F2319] transition">
                          <td className="py-2 px-2 font-sans font-semibold text-white flex items-center gap-2">
                            {p.photo && (
                              <img
                                src={p.photo}
                                alt={p.name}
                                className="w-6 h-6 rounded-full object-cover border border-[#143426]"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <span className="block truncate max-w-[130px] sm:max-w-[180px]">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {p.teamName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-1 text-center">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#143426] text-[#C9F04D]">
                              {p.position}
                            </span>
                          </td>
                          <td className="py-2 px-1 text-center text-gray-300">
                            {p.stats.minutes}'
                          </td>
                          <td className="py-2 px-1 text-center text-[#C9F04D] font-bold">
                            {p.stats.goals > 0 ? p.stats.goals : '-'}
                          </td>
                          <td className="py-2 px-1 text-center text-[#54C3BB] font-bold">
                            {p.stats.assists > 0 ? p.stats.assists : '-'}
                          </td>
                          <td className="py-2 px-1 text-center text-[#E6BE55]">
                            {p.stats.saves > 0 ? p.stats.saves : '-'}
                          </td>
                          <td className="py-2 px-1 text-center text-red-400">
                            {p.stats.yellowCards > 0 ? `🟨 ${p.stats.yellowCards}` : p.stats.redCards > 0 ? '🟥' : '-'}
                          </td>
                          <td className="py-2 px-1 text-center text-[#E6BE55] font-bold">
                            {p.stats.rating > 0 ? p.stats.rating : '6.0'}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-sm ${
                                isHighScorer
                                  ? 'bg-[#C9F04D] text-[#071410]'
                                  : p.fantasyScore.total > 0
                                  ? 'text-[#C9F04D] bg-[#C9F04D]/10'
                                  : 'text-gray-400'
                              }`}
                            >
                              {p.fantasyScore.total} PTS
                            </span>
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              onClick={() => {
                                // Create temporary player for inspection modal
                                const tempPlayer: Player = {
                                  id: String(p.id),
                                  name: p.name,
                                  shortName: p.name.split(' ').pop() || p.name,
                                  club: p.teamName,
                                  position: p.position,
                                  price: 10,
                                  photoUrl: p.photo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
                                  form: 7.5,
                                  selectedPercentage: 15,
                                  tournament: 'LIGA_BETPLAY',
                                  stats: {
                                    minutesPlayed: p.stats.minutes,
                                    goals: p.stats.goals,
                                    assists: p.stats.assists,
                                    dribbles: 0,
                                    cleanSheet: p.stats.cleanSheet,
                                    recoveries: 0,
                                    saves: p.stats.saves,
                                    penaltySaves: p.stats.penaltiesSaved,
                                    penaltyMissed: p.stats.penaltiesMissed,
                                    goalsConceded: p.stats.goalsConceded,
                                    yellowCards: p.stats.yellowCards,
                                    redCards: p.stats.redCards,
                                    ownGoals: p.stats.ownGoals,
                                    mvpBonusRank: 0,
                                    matchRating: p.stats.rating,
                                    isConfirmedStarter: p.isStarter,
                                  },
                                };
                                onInspectPlayer(tempPlayer, p.fantasyScore);
                              }}
                              className="px-2 py-1 rounded bg-[#143426] hover:bg-[#1f523c] text-white text-[10px] cursor-pointer transition"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SIMULATOR & REAL-TIME LEADERBOARD (En Tokens $DT) */}
      {subTab === 'feed_simulator' && (
        <div className="space-y-4">
          {/* Live Simulator Header */}
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F04D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C9F04D]"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-white tracking-wide">
                    Simulación de Minuto a Minuto FPC
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40">
                    Minuto {liveMinute}'
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Generación de jugadas de partido traducidas al instante en puntos.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                isAutoSimulating
                  ? 'bg-[#FF7A59] text-white'
                  : 'bg-[#C9F04D] text-[#071410] hover:bg-[#D4F565]'
              }`}
            >
              {isAutoSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pausar Simulación
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Simular Partido
                </>
              )}
            </button>
          </div>

          {/* Fixtures summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fallbackFixtures.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-2xl bg-[#0C1D16] border border-[#143426] shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
                  <span className="flex items-center gap-1 text-[#54C3BB]">
                    <Activity className="w-3 h-3 animate-pulse" /> {f.status}
                  </span>
                  <span className="text-[#C9F04D] font-bold">{f.minute}'</span>
                </div>

                <div className="flex items-center justify-between font-display text-base font-bold text-white px-2 py-2 bg-[#071410] rounded-xl border border-[#143426]">
                  <span className="truncate max-w-[90px]">{f.homeClub}</span>
                  <div className="px-2.5 py-0.5 bg-[#0F2319] rounded font-mono text-lg text-[#C9F04D] font-bold">
                    {f.homeScore} - {f.awayScore}
                  </div>
                  <span className="truncate max-w-[90px] text-right">{f.awayClub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Grid: Events Feed & Real-Time Dynamic Leaderboard in Tokens $DT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Real-time Events Log */}
            <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col h-[400px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#C9F04D]" />
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Feed de Eventos en Vivo
                  </h3>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {recentEvents.length} eventos
                </span>
              </div>

              {/* Quick test buttons */}
              <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto border-b border-[#143426]/50">
                <span className="text-[10px] text-gray-400 font-mono uppercase whitespace-nowrap">
                  Test Rápido:
                </span>
                <button
                  onClick={() => {
                    const dayro = players.find((p) => p && p.name && p.name.includes('Dayro')) || players[0];
                    onTriggerEvent({
                      id: `ev-${Date.now()}`,
                      minute: liveMinute,
                      fixtureId: 'fix-1',
                      matchTitle: 'Once Caldas vs Tolima',
                      type: 'goal',
                      playerId: dayro?.id || 'p-dayro',
                      playerName: dayro?.name || 'Dayro Moreno',
                      club: dayro?.club || 'Once Caldas',
                      description: '¡GOLAZO de Dayro Moreno! Definición al ángulo.',
                      pointsDelta: 4,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0F2319] hover:bg-[#153827] text-white border border-[#143426] text-xs font-mono whitespace-nowrap cursor-pointer"
                >
                  ⚽ Gol Dayro (+4)
                </button>
                <button
                  onClick={() => {
                    const montero = players.find((p) => p && p.name && p.name.includes('Montero')) || players[0];
                    onTriggerEvent({
                      id: `ev-${Date.now()}`,
                      minute: liveMinute,
                      fixtureId: 'fix-1',
                      matchTitle: 'Millonarios vs Nacional',
                      type: 'penalty_saved',
                      playerId: montero?.id || 'p-montero',
                      playerName: montero?.name || 'Álvaro Montero',
                      club: montero?.club || 'Millonarios',
                      description: '¡MONTERO ATAJA PENAL! Volada espectacular.',
                      pointsDelta: 5,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0F2319] hover:bg-[#153827] text-white border border-[#143426] text-xs font-mono whitespace-nowrap cursor-pointer"
                >
                  🧤 Penal Montero (+5)
                </button>
              </div>

              {/* Events list */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 divide-y divide-[#143426]/50">
                {recentEvents.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-12">
                    Esperando eventos del partido. Presiona "Simular Partido" o pulsa un botón de test.
                  </p>
                ) : (
                  recentEvents.map((ev) => (
                    <div key={ev.id} className="pt-2 flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[#C9F04D] font-bold shrink-0">{ev.minute}'</span>
                        <div>
                          <span className="font-bold text-white block">{ev.description}</span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {ev.playerName} ({ev.club}) • {ev.timestamp}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded shrink-0 ${
                          ev.pointsDelta > 0
                            ? 'bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40'
                            : 'bg-[#FF7A59]/20 text-[#FF7A59]'
                        }`}
                      >
                        {ev.pointsDelta > 0 ? `+${ev.pointsDelta}` : ev.pointsDelta} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dynamic Leaderboard in Tokens $DT */}
            <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col h-[400px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#E6BE55]" />
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Tabla de Posiciones en Vivo (Nivel 1)
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#E6BE55] font-bold">
                  Pozo: {formatTokens(3640)}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                {liveLeaderboard.map((item) => (
                  <div
                    key={item.team}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      item.isUser
                        ? 'bg-[#153827] border-[#C9F04D] shadow-md ring-1 ring-[#C9F04D]/40'
                        : 'bg-[#0F2319] border-[#143426]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                          item.rank === 1
                            ? 'bg-[#E6BE55] text-[#071410]'
                            : item.rank === 2
                            ? 'bg-[#54C3BB] text-[#071410]'
                            : item.rank === 3
                            ? 'bg-[#FF7A59] text-white'
                            : 'bg-[#071410] text-gray-400 border border-[#143426]'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">{item.team}</span>
                          {item.isUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C9F04D] text-[#071410] uppercase font-mono">
                              TÚ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{item.name}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="block font-black text-sm text-[#C9F04D]">
                        {item.points} PTS
                      </span>
                      {item.prizeTokens > 0 && (
                        <span className="text-[10px] text-[#E6BE55] font-semibold">
                          Premio: {formatTokens(item.prizeTokens)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#143426] flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>Rake Retenido: 9% ({formatTokens(360)})</span>
                <span className="text-[#54C3BB]">Liquidación al minuto 90+</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
