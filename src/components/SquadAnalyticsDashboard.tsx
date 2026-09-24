import React, { useState, useMemo } from 'react';
import {
  SquadPlayerSlot,
  PlayerPosition,
} from '../types';
import {
  getPlayerHistoricalData,
  getSquadAnalyticsSummary,
} from '../utils/historicalStats';
import { HistoricalTrendChart } from './d3/HistoricalTrendChart';
import { PlayerRadarChart } from './d3/PlayerRadarChart';
import { EfficiencyBarChart } from './d3/EfficiencyBarChart';
import {
  TrendingUp,
  Activity,
  Award,
  Zap,
  ShieldAlert,
  BarChart3,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Info,
} from 'lucide-react';

interface SquadAnalyticsDashboardProps {
  slots: SquadPlayerSlot[];
  onInspectPlayer?: (player: any, score: any) => void;
  onNavigateToBuilder?: () => void;
}

export const SquadAnalyticsDashboard: React.FC<SquadAnalyticsDashboardProps> = ({
  slots,
  onInspectPlayer,
  onNavigateToBuilder,
}) => {
  const [activeView, setActiveView] = useState<'trend' | 'radar' | 'efficiency' | 'table'>('trend');
  const [selectedMetric, setSelectedMetric] = useState<'points' | 'rating' | 'minutes' | 'xgXa'>('points');
  const [positionFilter, setPositionFilter] = useState<'ALL' | PlayerPosition>('ALL');
  const [starterOnlyFilter, setStarterOnlyFilter] = useState<boolean>(true);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [radarPrimaryId, setRadarPrimaryId] = useState<string>('');
  const [radarSecondaryId, setRadarSecondaryId] = useState<string>('');
  const [efficiencySort, setEfficiencySort] = useState<'pointsPerMillion' | 'totalPointsLast5' | 'consistencyScore'>('pointsPerMillion');

  // Compute all historical data for filled slots
  const filledSlots = useMemo(() => slots.filter((s) => s.player !== null), [slots]);

  const allPlayersHistorical = useMemo(() => {
    return filledSlots.map((s) => getPlayerHistoricalData(s.player!));
  }, [filledSlots]);

  const summary = useMemo(() => {
    return getSquadAnalyticsSummary(slots);
  }, [slots]);

  // Filtered players according to position and starter filter
  const filteredPlayers = useMemo(() => {
    return allPlayersHistorical.filter((p) => {
      const slot = filledSlots.find((s) => s.player?.id === p.player.id);
      if (starterOnlyFilter && slot && !slot.isStarter) return false;
      if (positionFilter !== 'ALL' && p.player.position !== positionFilter) return false;
      return true;
    });
  }, [allPlayersHistorical, filledSlots, positionFilter, starterOnlyFilter]);

  // Sync selected player IDs on initial load or change
  React.useEffect(() => {
    if (filteredPlayers.length > 0 && selectedPlayerIds.length === 0) {
      // Default: select top 4 players by points for clean readability
      const initialTop = [...filteredPlayers]
        .sort((a, b) => b.totalPointsLast5 - a.totalPointsLast5)
        .slice(0, 4)
        .map((p) => p.player.id);
      setSelectedPlayerIds(initialTop);
    }
  }, [filteredPlayers, selectedPlayerIds.length]);

  // Set default radar comparisons
  React.useEffect(() => {
    if (allPlayersHistorical.length > 0) {
      if (!radarPrimaryId || !allPlayersHistorical.some((p) => p.player.id === radarPrimaryId)) {
        setRadarPrimaryId(allPlayersHistorical[0].player.id);
      }
      if (!radarSecondaryId && allPlayersHistorical.length > 1) {
        setRadarSecondaryId(allPlayersHistorical[1].player.id);
      }
    }
  }, [allPlayersHistorical, radarPrimaryId, radarSecondaryId]);

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const selectAllFiltered = () => {
    setSelectedPlayerIds(filteredPlayers.map((p) => p.player.id));
  };

  const selectTopFiltered = () => {
    const top = [...filteredPlayers]
      .sort((a, b) => b.totalPointsLast5 - a.totalPointsLast5)
      .slice(0, 4)
      .map((p) => p.player.id);
    setSelectedPlayerIds(top);
  };

  // If squad has fewer than 3 players, show informative onboarding state
  if (filledSlots.length < 3) {
    return (
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#0F2319] border border-[#C9F04D]/30 flex items-center justify-center mx-auto mb-4 text-[#C9F04D]">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">
          Dashboard de Estadísticas Avanzadas D3
        </h3>
        <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
          Completa al menos 3 jugadores en tu alineación táctica para calcular y proyectar el rendimiento histórico de las últimas 5 jornadas con gráficos D3 interactivos.
        </p>
        {onNavigateToBuilder && (
          <button
            onClick={onNavigateToBuilder}
            className="px-5 py-2.5 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-bold text-xs uppercase tracking-wider font-mono transition shadow-lg cursor-pointer"
          >
            Ir a Armar mi Once
          </button>
        )}
      </div>
    );
  }

  const primaryRadarPlayer = allPlayersHistorical.find((p) => p.player.id === radarPrimaryId) || allPlayersHistorical[0];
  const secondaryRadarPlayer = allPlayersHistorical.find((p) => p.player.id === radarSecondaryId) || null;

  return (
    <div className="space-y-4 text-left">
      {/* Top Header Card with Metric Highlights */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#C9F04D]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#143426] text-[#C9F04D] border border-[#1E4333]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-black text-white tracking-wide">
                  Analítica Avanzada del Once
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9F04D]/15 text-[#C9F04D] border border-[#C9F04D]/30 uppercase">
                  D3 Engine
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Rendimiento histórico real en las últimas 5 fechas (J1 a J5)
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#071410] border border-[#1E4333] self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveView('trend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'trend'
                  ? 'bg-[#C9F04D] text-[#071410] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Evolución (Línea)</span>
            </button>
            <button
              onClick={() => setActiveView('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'radar'
                  ? 'bg-[#C9F04D] text-[#071410] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Radar Spider</span>
            </button>
            <button
              onClick={() => setActiveView('efficiency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'efficiency'
                  ? 'bg-[#C9F04D] text-[#071410] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Eficiencia ($M)</span>
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                activeView === 'table'
                  ? 'bg-[#C9F04D] text-[#071410] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Detalle J1-J5</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total & Average Points */}
          <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426] relative">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Puntos del Once (5 Fechas)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-mono text-2xl font-black text-[#C9F04D]">
                {summary.totalPointsLast5}
              </span>
              <span className="text-xs font-mono text-gray-400">PTS</span>
            </div>
            <span className="text-[11px] text-gray-300 font-mono mt-1 block">
              Promedio: <strong className="text-white">{summary.averagePerMatchday} pts</strong> / jornada
            </span>
          </div>

          {/* Card 2: MVP of Last 5 */}
          <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426] relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                MVP Histórico del Once
              </span>
              <Award className="w-3.5 h-3.5 text-[#E6BE55]" />
            </div>
            {summary.topPerformer ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={summary.topPerformer.player.photoUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-[#E6BE55] shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {summary.topPerformer.player.name}
                  </span>
                  <span className="text-[10px] text-[#E6BE55] font-mono font-bold">
                    {summary.topPerformer.totalPointsLast5} pts ({summary.topPerformer.averagePoints} / fecha)
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-1 block">Sin datos</span>
            )}
          </div>

          {/* Card 3: Best Value (Pts / $M) */}
          <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426] relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Rey de la Rentabilidad
              </span>
              <Zap className="w-3.5 h-3.5 text-[#54C3BB]" />
            </div>
            {summary.bestValuePlayer ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={summary.bestValuePlayer.player.photoUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-[#54C3BB] shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {summary.bestValuePlayer.player.name}
                  </span>
                  <span className="text-[10px] text-[#54C3BB] font-mono font-bold">
                    {summary.bestValuePlayer.pointsPerMillion} pts / $M COP
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-1 block">Sin datos</span>
            )}
          </div>

          {/* Card 4: Most Consistent */}
          <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426] relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Mayor Regularidad
              </span>
              <Flame className="w-3.5 h-3.5 text-[#FF5E5B]" />
            </div>
            {summary.mostConsistentPlayer ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={summary.mostConsistentPlayer.player.photoUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-[#FF5E5B] shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {summary.mostConsistentPlayer.player.name}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono">
                    Índice: <strong className="text-[#C9F04D]">{summary.mostConsistentPlayer.consistencyScore}/100</strong>
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-1 block">Sin datos</span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: D3 MULTI-LINE / AREA TREND */}
      {activeView === 'trend' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 sm:p-5 shadow-xl">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#143426]">
            {/* Metric Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-gray-400 uppercase mr-1">
                Métrica Eje Y:
              </span>
              {(
                [
                  { id: 'points', label: 'Puntos Fantasy' },
                  { id: 'rating', label: 'Rating Partido' },
                  { id: 'minutes', label: 'Minutos' },
                  { id: 'xgXa', label: 'xG + xA' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMetric(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    selectedMetric === m.id
                      ? 'bg-[#C9F04D] text-[#071410] shadow'
                      : 'bg-[#0F2319] text-gray-300 hover:text-white border border-[#143426]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Position and Starters Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Position Filter */}
              <div className="flex items-center gap-1">
                {(['ALL', 'POR', 'DEF', 'MED', 'DEL'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                      positionFilter === pos
                        ? 'bg-[#54C3BB] text-[#071410]'
                        : 'bg-[#071410] text-gray-400 hover:text-gray-200 border border-[#143426]'
                    }`}
                  >
                    {pos === 'ALL' ? 'Todos' : pos}
                  </button>
                ))}
              </div>

              {/* Starter vs All Toggle */}
              <button
                onClick={() => setStarterOnlyFilter(!starterOnlyFilter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border ${
                  starterOnlyFilter
                    ? 'bg-[#153827] text-[#C9F04D] border-[#C9F04D]/40'
                    : 'bg-[#071410] text-gray-400 border-[#143426]'
                }`}
              >
                {starterOnlyFilter ? 'Solo Titulares (11)' : 'Incluir Suplentes (15)'}
              </button>
            </div>
          </div>

          {/* Player Toggle Chips */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Selecciona jugadores para trazar curvas en D3 ({selectedPlayerIds.length} activos):
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectTopFiltered}
                  className="text-[10px] font-mono text-[#C9F04D] hover:underline cursor-pointer"
                >
                  Top 4 Rendimiento
                </button>
                <span className="text-gray-600">•</span>
                <button
                  onClick={selectAllFiltered}
                  className="text-[10px] font-mono text-gray-300 hover:underline cursor-pointer"
                >
                  Ver Todos
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {filteredPlayers.map((p) => {
                const isSelected = selectedPlayerIds.includes(p.player.id);
                return (
                  <button
                    key={p.player.id}
                    onClick={() => togglePlayerSelection(p.player.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#143426] text-white border-[#C9F04D] shadow-sm'
                        : 'bg-[#071410] text-gray-500 border-[#143426] hover:border-gray-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.player.position === 'POR'
                          ? 'bg-[#60A5FA]'
                          : p.player.position === 'DEF'
                          ? 'bg-[#54C3BB]'
                          : p.player.position === 'MED'
                          ? 'bg-[#E6BE55]'
                          : 'bg-[#C9F04D]'
                      }`}
                    />
                    <span className="font-bold">{p.player.shortName}</span>
                    <span className="text-[10px] text-gray-400">({p.totalPointsLast5}p)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D3 SVG Chart */}
          <HistoricalTrendChart
            playersData={filteredPlayers}
            selectedPlayerIds={selectedPlayerIds}
            metric={selectedMetric}
            showSquadAverage={true}
          />

          {/* Chart Guide Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#143426] text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#C9F04D]" />
                <span>DEL (Lima)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#E6BE55]" />
                <span>MED (Oro)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#54C3BB]" />
                <span>DEF (Cyan)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#60A5FA]" />
                <span>POR (Azul)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-[#A78BFA]" />
                <span className="text-[#A78BFA]">Promedio Colectivo</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">
              * Pasa el cursor sobre cualquier nodo para ver rival y desglose
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: D3 SPIDER / RADAR CHART */}
      {activeView === 'radar' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#143426]">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Perfil Táctico Hexagonal (Spider Radar)
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Compara 6 dimensiones clave: Ataque, Defensa, Regularidad, Forma, Eficiencia y Rating
              </p>
            </div>

            {/* Selectors for 2 players */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Primary Player */}
              <div>
                <span className="text-[10px] font-mono text-[#C9F04D] block uppercase">
                  Jugador Principal:
                </span>
                <select
                  value={radarPrimaryId}
                  onChange={(e) => setRadarPrimaryId(e.target.value)}
                  className="bg-[#071410] border border-[#C9F04D] text-white text-xs font-mono rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none"
                >
                  {allPlayersHistorical.map((p) => (
                    <option key={p.player.id} value={p.player.id}>
                      {p.player.name} ({p.player.position} - {p.player.club})
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Player */}
              <div>
                <span className="text-[10px] font-mono text-[#54C3BB] block uppercase">
                  Comparar con (Opcional):
                </span>
                <select
                  value={radarSecondaryId}
                  onChange={(e) => setRadarSecondaryId(e.target.value)}
                  className="bg-[#071410] border border-[#54C3BB] text-white text-xs font-mono rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none"
                >
                  <option value="">Ninguno (Solo principal)</option>
                  {allPlayersHistorical
                    .filter((p) => p.player.id !== radarPrimaryId)
                    .map((p) => (
                      <option key={p.player.id} value={p.player.id}>
                        {p.player.name} ({p.player.position} - {p.player.club})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* The D3 Radar SVG */}
            <PlayerRadarChart
              primaryPlayer={primaryRadarPlayer}
              secondaryPlayer={secondaryRadarPlayer}
            />

            {/* Metric Comparison Table */}
            <div className="space-y-3 font-mono">
              <div className="p-3 rounded-xl bg-[#071410] border border-[#143426]">
                <span className="text-xs font-bold text-white block mb-2">
                  Desglose de Puntuaciones (0 - 100)
                </span>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'attacking', label: 'Potencial Ofensivo (xG/Goles)' },
                    { key: 'defending', label: 'Capacidad Defensiva (Recuperaciones/CS)' },
                    { key: 'consistency', label: 'Índice de Regularidad' },
                    { key: 'form', label: 'Estado de Forma Reciente' },
                    { key: 'efficiency', label: 'Eficiencia Puntos / Millón' },
                    { key: 'influence', label: 'Influencia en Partido (Rating)' },
                  ].map((axis) => {
                    const val1 = (primaryRadarPlayer.radarMetrics as any)[axis.key];
                    const val2 = secondaryRadarPlayer
                      ? (secondaryRadarPlayer.radarMetrics as any)[axis.key]
                      : null;

                    return (
                      <div key={axis.key} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">{axis.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#C9F04D] font-bold">{val1}</span>
                            {val2 !== null && (
                              <>
                                <span className="text-gray-600">vs</span>
                                <span className="text-[#54C3BB] font-bold">{val2}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Comparison Progress Bar */}
                        <div className="w-full h-1.5 bg-[#0F2319] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#C9F04D] h-full"
                            style={{ width: `${val1}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Recommendation pill */}
              <div className="p-3 rounded-xl bg-[#0F2319] border border-[#C9F04D]/30 flex items-start gap-2.5 text-xs">
                <Info className="w-4 h-4 text-[#C9F04D] shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  {primaryRadarPlayer.trend === 'up'
                    ? `🔥 ${primaryRadarPlayer.player.name} viene con tendencia alcista notable en las últimas 2 jornadas.`
                    : primaryRadarPlayer.consistencyScore >= 75
                    ? `⭐ ${primaryRadarPlayer.player.name} es uno de tus futbolistas más regulares para garantizar piso de puntos.`
                    : `⚠️ ${primaryRadarPlayer.player.name} presenta oscilaciones de puntaje según el rival.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: D3 EFFICIENCY HORIZONTAL BAR RANKING */}
      {activeView === 'efficiency' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#143426]">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Ranking de Rentabilidad y Eficiencia Salarial
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Determina qué jugadores rinden más por cada millón invertido
              </p>
            </div>

            {/* Sort Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-gray-400 uppercase">
                Ordenar por:
              </span>
              <button
                onClick={() => setEfficiencySort('pointsPerMillion')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  efficiencySort === 'pointsPerMillion'
                    ? 'bg-[#C9F04D] text-[#071410]'
                    : 'bg-[#0F2319] text-gray-300 border border-[#143426]'
                }`}
              >
                Pts / $M COP
              </button>
              <button
                onClick={() => setEfficiencySort('totalPointsLast5')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  efficiencySort === 'totalPointsLast5'
                    ? 'bg-[#C9F04D] text-[#071410]'
                    : 'bg-[#0F2319] text-gray-300 border border-[#143426]'
                }`}
              >
                Total Puntos
              </button>
              <button
                onClick={() => setEfficiencySort('consistencyScore')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  efficiencySort === 'consistencyScore'
                    ? 'bg-[#C9F04D] text-[#071410]'
                    : 'bg-[#0F2319] text-gray-300 border border-[#143426]'
                }`}
              >
                Consistencia %
              </button>
            </div>
          </div>

          <EfficiencyBarChart
            playersData={allPlayersHistorical}
            sortBy={efficiencySort}
            onSelectPlayer={(pData) => {
              if (onInspectPlayer) {
                onInspectPlayer(pData.player, {
                  total: pData.totalPointsLast5,
                  breakdown: [],
                  multiplier: 1,
                  multiplierReason: 'Histórico 5 Fechas',
                });
              }
            }}
          />
        </div>
      )}

      {/* VIEW 4: DETAILED MATCHDAY TABLE (J1 to J5) */}
      {activeView === 'table' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#143426]">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Planilla Detallada Fecha a Fecha (J1 - J5)
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Puntos exactos por partido, rivales y tendencia
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1E4333] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Jugador</th>
                  <th className="py-2.5 px-2">Pos</th>
                  <th className="py-2.5 px-2 text-right">Precio</th>
                  <th className="py-2.5 px-2 text-center">J1</th>
                  <th className="py-2.5 px-2 text-center">J2</th>
                  <th className="py-2.5 px-2 text-center">J3</th>
                  <th className="py-2.5 px-2 text-center">J4</th>
                  <th className="py-2.5 px-2 text-center">J5</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-2 text-center">Tendencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#143426]">
                {allPlayersHistorical.map((p) => {
                  return (
                    <tr
                      key={p.player.id}
                      className="hover:bg-[#0F2319] transition cursor-pointer"
                      onClick={() => {
                        if (onInspectPlayer) {
                          onInspectPlayer(p.player, {
                            total: p.totalPointsLast5,
                            breakdown: [],
                            multiplier: 1,
                            multiplierReason: 'Últimas 5 Fechas',
                          });
                        }
                      }}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <img
                          src={p.player.photoUrl}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-[#1E4333]"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">
                            {p.player.shortName}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {p.player.club}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.player.position === 'POR'
                              ? 'bg-blue-900/60 text-blue-300'
                              : p.player.position === 'DEF'
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : p.player.position === 'MED'
                              ? 'bg-amber-900/60 text-amber-300'
                              : 'bg-lime-900/60 text-lime-300'
                          }`}
                        >
                          {p.player.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-300">
                        ${p.player.price}M
                      </td>
                      {p.history.map((h) => (
                        <td key={h.matchday} className="py-2.5 px-2 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                h.points >= 8
                                  ? 'bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40'
                                  : h.points >= 5
                                  ? 'bg-emerald-900/30 text-emerald-300'
                                  : 'text-gray-300'
                              }`}
                            >
                              {h.points}
                            </span>
                            <span className="text-[9px] text-gray-500 mt-0.5">
                              vs {h.opponent.slice(0, 3)}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-black text-[#C9F04D] text-sm">
                          {p.totalPointsLast5}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {p.trend === 'up' ? (
                          <span className="inline-flex items-center text-xs text-[#C9F04D] font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5" /> +
                          </span>
                        ) : p.trend === 'down' ? (
                          <span className="inline-flex items-center text-xs text-rose-400 font-bold">
                            <ArrowDownRight className="w-3.5 h-3.5" /> -
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">━</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
