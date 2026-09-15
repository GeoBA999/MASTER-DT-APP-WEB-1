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
} from 'lucide-react';
import { Player, LiveMatchEvent, CalculatedScore } from '../types';
import { calculatePlayerScore, formatCOP } from '../utils/scoring';

interface LiveMatchdayViewProps {
  userTeamName: string;
  players: Player[];
  captainId: string | null;
  viceCaptainId: string | null;
  onTriggerEvent: (event: LiveMatchEvent) => void;
  recentEvents: LiveMatchEvent[];
  onInspectPlayer: (player: Player, score: CalculatedScore) => void;
}

export const LiveMatchdayView: React.FC<LiveMatchdayViewProps> = ({
  userTeamName,
  players,
  captainId,
  viceCaptainId,
  onTriggerEvent,
  recentEvents,
  onInspectPlayer,
}) => {
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [liveMinute, setLiveMinute] = useState(78);

  // Sample match fixtures
  const fixtures = [
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

  // Dynamic leaderboard calculation
  const computedScores = players.map((p) => {
    const isCap = p.id === captainId;
    const isVC = p.id === viceCaptainId;
    return {
      player: p,
      score: calculatePlayerScore(p, { isCaptain: isCap, isViceCaptain: isVC }),
    };
  });

  const totalUserPoints = computedScores.reduce((sum, item) => sum + item.score.total, 0);

  // Dynamic ranking list
  const liveLeaderboard = [
    { rank: 1, name: 'Carlos Paisa', team: 'Verdolaga DT', points: 74, prize: '$1.820.000 COP' },
    { rank: 2, name: 'Tú', team: userTeamName, points: Math.round(totalUserPoints * 10) / 10, prize: '$1.092.000 COP', isUser: true },
    { rank: 3, name: 'Andrés R.', team: 'Millos Campeón', points: 68, prize: '$728.000 COP' },
    { rank: 4, name: 'Felipe Gómez', team: 'Tiburón Rojo', points: 64, prize: '-' },
    { rank: 5, name: 'Mateo Osorio', team: 'Poderoso DIM', points: 59, prize: '-' },
  ].sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Auto-simulation interval
  useEffect(() => {
    if (!isAutoSimulating) return;

    const timer = setInterval(() => {
      setLiveMinute((prev) => (prev >= 90 ? 1 : prev + 1));

      // Randomly trigger events every few ticks
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
      {/* Live Matchday Banner */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F04D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C9F04D]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white tracking-wide">
                Liga BetPlay Dimayor — Fecha 10 En Vivo
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40">
                Minuto {liveMinute}'
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Eventos en tiempo real procesados por el motor de puntuación oficial de Master DT.
            </p>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="flex items-center gap-2">
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
      </div>

      {/* Live Fixtures Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {fixtures.map((f) => (
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

            <div className="flex items-center justify-between font-display text-base font-bold text-white px-1 py-2 bg-[#071410] rounded-xl border border-[#143426]">
              <span className="truncate max-w-[90px]">{f.homeClub}</span>
              <div className="px-2 py-0.5 bg-[#0F2319] rounded font-mono text-lg text-[#C9F04D] font-bold">
                {f.homeScore} - {f.awayScore}
              </div>
              <span className="truncate max-w-[90px] text-right">{f.awayClub}</span>
            </div>

            <span className="text-[10px] text-gray-500 font-mono mt-2 text-center block">
              Estadio Nemesio Camacho El Campín / Atanasio Girardot
            </span>
          </div>
        ))}
      </div>

      {/* Split Grid: Live Event Feed vs Real-Time Dynamic Leaderboard */}
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

          {/* Quick manual event buttons */}
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
            <button
              onClick={() => {
                const cardona = players.find((p) => p && p.name && p.name.includes('Cardona')) || players[0];
                onTriggerEvent({
                  id: `ev-${Date.now()}`,
                  minute: liveMinute,
                  fixtureId: 'fix-1',
                  matchTitle: 'Nacional vs Millonarios',
                  type: 'assist',
                  playerId: cardona?.id || 'p-cardona',
                  playerName: cardona?.name || 'Edwin Cardona',
                  club: cardona?.club || 'Atlético Nacional',
                  description: 'Asistencia quirúrgica de Edwin Cardona.',
                  pointsDelta: 3,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-[#0F2319] hover:bg-[#153827] text-white border border-[#143426] text-xs font-mono whitespace-nowrap cursor-pointer"
            >
              🎯 Asist Cardona (+3)
            </button>
          </div>

          {/* Events list */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 divide-y divide-[#143426]/50">
            {recentEvents.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-12">
                Esperando eventos del partido. Presiona "Simular Partido" o pulsa un botón de test arriba.
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

        {/* Dynamic Updating Leaderboard */}
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 shadow-lg flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#E6BE55]" />
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Tabla de Posiciones en Vivo (Nivel 1)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#E6BE55] font-bold">
              Pozo: $3.640.000 COP
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
                  {item.prize !== '-' && (
                    <span className="text-[10px] text-[#E6BE55] font-semibold">
                      {item.prize}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#143426] flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Rake Retenido: 9% ($360.000 COP)</span>
            <span className="text-[#54C3BB]">Liquidación al minuto 90+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
