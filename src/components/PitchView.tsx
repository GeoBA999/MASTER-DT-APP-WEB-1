import React, { useState } from 'react';
import {
  Shield,
  Star,
  EyeOff,
  Zap,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Plus,
  ArrowRightLeft,
  Info,
  Check,
  Trophy,
  Trash2,
  Sparkles,
  Edit3,
  Copy,
  Layers,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  Formation,
  Player,
  PlayerPosition,
  SquadPlayerSlot,
  ChipType,
  CalculatedScore,
  UserDTProfile,
  SelectedLeagueInfo,
} from '../types';
import { FORMATIONS } from '../data/mockFootballData';
import { calculatePlayerScore } from '../utils/scoring';

interface PitchViewProps {
  formation: Formation;
  setFormation: (f: Formation) => void;
  slots: SquadPlayerSlot[];
  captainId: string | null;
  viceCaptainId: string | null;
  hiddenCaptainId: string | null;
  isHiddenCaptainActive: boolean;
  activeChip: ChipType;
  onSetCaptain: (id: string) => void;
  onSetViceCaptain: (id: string) => void;
  onToggleHiddenCaptain: (id: string) => void;
  onActivateChip: (chip: ChipType) => void;
  onSelectSlotForReplacement: (slot: SquadPlayerSlot) => void;
  onInspectPlayer: (player: Player, score: CalculatedScore) => void;
  isWorstXIMode?: boolean;
  userProfile?: UserDTProfile | null;
  onOpenOnboarding?: () => void;
  onClearSquad?: () => void;
  onAutoFillSquad?: () => void;
  registeredLeagues?: SelectedLeagueInfo[];
  activeLeagueId?: string;
  onSelectActiveLeague?: (leagueId: string) => void;
  onDuplicateSquadFromLeague?: (sourceLeagueId: string) => void;
  onNavigateToLeagues?: () => void;
  sourceLeaguesForDuplicate?: {
    leagueId: string;
    leagueName: string;
    formation: Formation;
    count: number;
    captainName?: string;
  }[];
}

export const PitchView: React.FC<PitchViewProps> = ({
  formation,
  setFormation,
  slots,
  captainId,
  viceCaptainId,
  hiddenCaptainId,
  isHiddenCaptainActive,
  activeChip,
  onSetCaptain,
  onSetViceCaptain,
  onToggleHiddenCaptain,
  onActivateChip,
  onSelectSlotForReplacement,
  onInspectPlayer,
  isWorstXIMode = false,
  userProfile,
  onOpenOnboarding,
  onClearSquad,
  onAutoFillSquad,
  registeredLeagues = [],
  activeLeagueId,
  onSelectActiveLeague,
  onDuplicateSquadFromLeague,
  onNavigateToLeagues,
  sourceLeaguesForDuplicate = [],
}) => {
  const [selectedPlayerForAction, setSelectedPlayerForAction] = useState<{
    slot: SquadPlayerSlot;
    player: Player;
    score: CalculatedScore;
  } | null>(null);

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedSourceLeagueId, setSelectedSourceLeagueId] = useState<string>('');
  const [duplicateSuccessMessage, setDuplicateSuccessMessage] = useState<string>('');

  const starterSlots = slots.filter((s) => s.isStarter);
  const benchSlots = slots.filter((s) => !s.isStarter);
  const selectedPlayersCount = slots.filter((s) => s.player !== null).length;

  // Group starters by line
  const porSlots = starterSlots.filter((s) => s.position === 'POR');
  const defSlots = starterSlots.filter((s) => s.position === 'DEF');
  const medSlots = starterSlots.filter((s) => s.position === 'MED');
  const delSlots = starterSlots.filter((s) => s.position === 'DEL');

  // Compute total squad points
  const totalStarterPoints = starterSlots.reduce((acc, slot) => {
    if (!slot.player) return acc;
    const isCap = slot.player?.id === captainId;
    const isVC = slot.player?.id === viceCaptainId;
    const score = calculatePlayerScore(slot.player, {
      isCaptain: isCap,
      isViceCaptain: isVC,
      isCaptainInactive: false,
      activeChip,
      isWorstXIMode,
    });
    return acc + score.total;
  }, 0);

  const benchBonusPoints = activeChip === 'bench_boost'
    ? benchSlots.reduce((acc, slot) => {
        if (!slot.player) return acc;
        const score = calculatePlayerScore(slot.player, { activeChip, isWorstXIMode });
        return acc + score.total;
      }, 0)
    : 0;

  const totalPoints = totalStarterPoints + benchBonusPoints;

  const renderPlayerCard = (slot: SquadPlayerSlot) => {
    const player = slot.player;

    if (!player) {
      return (
        <button
          key={slot.slotId}
          onClick={() => onSelectSlotForReplacement(slot)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0F2319]/80 border-2 border-dashed border-[#54C3BB]/40 hover:border-[#C9F04D] hover:bg-[#153827] transition w-18 sm:w-22 min-h-[95px] sm:min-h-[110px] group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#071410] border border-[#54C3BB]/60 flex items-center justify-center text-[#54C3BB] group-hover:text-[#C9F04D] group-hover:scale-110 transition">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold text-gray-400 mt-1 uppercase">
            {slot.position}
          </span>
          <span className="text-[9px] text-[#54C3BB] group-hover:text-[#C9F04D]">
            Añadir
          </span>
        </button>
      );
    }

    const isCap = player?.id === captainId;
    const isVC = player?.id === viceCaptainId;
    const isHiddenCap = isHiddenCaptainActive && player?.id === hiddenCaptainId;

    const score = calculatePlayerScore(player, {
      isCaptain: isCap,
      isViceCaptain: isVC,
      isCaptainInactive: false,
      activeChip,
      isWorstXIMode,
    });

    return (
      <div
        key={slot.slotId}
        onClick={() => setSelectedPlayerForAction({ slot, player, score })}
        className={`relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition cursor-pointer group select-none w-18 sm:w-22 ${
          isCap
            ? 'bg-[#0F2319] ring-2 ring-[#E6BE55] shadow-lg shadow-[#E6BE55]/10'
            : isVC
            ? 'bg-[#0F2319] ring-1 ring-[#54C3BB]'
            : isHiddenCap
            ? 'bg-[#0F2319] ring-2 ring-[#C9F04D]'
            : 'bg-[#0C1D16]/90 hover:bg-[#12281E] border border-[#143426]'
        }`}
      >
        {/* Badges: Captain (C), Vice Captain (V), Hidden Captain (HC) */}
        <div className="absolute -top-2 -right-1 flex gap-0.5 z-10">
          {isCap && (
            <span
              className="w-5 h-5 rounded-full bg-[#E6BE55] text-[#071410] font-black text-[10px] flex items-center justify-center shadow-md font-mono"
              title="Capitán (2x puntos)"
            >
              C
            </span>
          )}
          {isVC && (
            <span
              className="w-5 h-5 rounded-full bg-[#54C3BB] text-[#071410] font-black text-[10px] flex items-center justify-center shadow-md font-mono"
              title="Vice-Capitán (reemplazo automático si C no juega)"
            >
              V
            </span>
          )}
          {isHiddenCap && (
            <span
              className="w-5 h-5 rounded-full bg-[#C9F04D] text-[#071410] font-black text-[10px] flex items-center justify-center shadow-md font-mono"
              title="Hidden Captain (oculto a rivales hasta 1h antes del cierre)"
            >
              HC
            </span>
          )}
        </div>

        {/* Club Mini Badge on Top Left */}
        <span className="absolute -top-1.5 -left-1 px-1 py-0.2 rounded text-[8px] font-bold bg-[#071410] border border-[#143426] text-gray-300">
          {player.position}
        </span>

        {/* Player Avatar */}
        <div className="relative mt-1">
          <img
            src={player.photoUrl}
            alt={player.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#1E4333] group-hover:border-[#C9F04D] transition shadow"
            referrerPolicy="no-referrer"
          />
          {player.isLibertadoresColombian && (
            <span
              className="absolute -bottom-1 -right-1 text-[10px] bg-[#071410] rounded-full p-0.5 border border-[#E6BE55]"
              title="Jugador colombiano en torneo Conmebol"
            >
              🇨🇴
            </span>
          )}
        </div>

        {/* Name & Club */}
        <span className="text-[11px] font-bold text-white tracking-tight truncate max-w-[70px] sm:max-w-[80px] mt-1 text-center">
          {player.shortName}
        </span>
        <span className="text-[9px] text-gray-400 truncate max-w-[70px] text-center">
          {player.club.split(' ')[0]}
        </span>

        {/* Price & Points Row */}
        <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-[#143426]/70 text-[10px] font-mono">
          <span className="text-gray-400 font-semibold">${player.price}M</span>
          <span
            className={`font-bold px-1 rounded ${
              score.total > 0
                ? 'bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30'
                : score.total < 0
                ? 'bg-[#FF7A59]/20 text-[#FF7A59]'
                : 'text-gray-400'
            }`}
          >
            {score.total} pts
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Registered Leagues Selector Tabs Strip */}
      {registeredLeagues && registeredLeagues.length > 0 && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#54C3BB]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Competición:</span>
            </div>
            {registeredLeagues.map((leg) => {
              const isActive = leg.id === activeLeagueId;
              return (
                <button
                  key={leg.id}
                  type="button"
                  onClick={() => onSelectActiveLeague && onSelectActiveLeague(leg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#143426] text-[#C9F04D] border-[#C9F04D] shadow-md'
                      : 'bg-[#071410] text-gray-300 hover:text-white border-[#1E4333] hover:border-gray-500'
                  }`}
                >
                  <span>{leg.badge || '🏆'}</span>
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{leg.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9F04D] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {onNavigateToLeagues && (
            <button
              type="button"
              onClick={onNavigateToLeagues}
              className="px-2.5 py-1.5 rounded-xl bg-[#0F2319] hover:bg-[#153827] text-gray-300 hover:text-[#E6BE55] border border-[#1E4333] hover:border-[#E6BE55] transition text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#E6BE55]" />
              <span>Inscribirse en otra Liga</span>
            </button>
          )}
        </div>
      )}

      {/* Success Notification Toast */}
      {duplicateSuccessMessage && (
        <div className="p-3 rounded-xl bg-[#143426] border border-[#C9F04D] text-[#C9F04D] text-xs font-mono flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{duplicateSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setDuplicateSuccessMessage('')}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Franchise & Tournament Banner */}
      <div className="bg-gradient-to-r from-[#0C1D16] via-[#0F2319] to-[#071410] border border-[#1E4333] rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#071410] border-2 border-[#E6BE55] flex items-center justify-center text-2xl shadow-md">
              {userProfile?.shieldBadge || '🦁'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-none">
                  {userProfile?.teamName || 'Mi Equipo DT'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30">
                  {selectedPlayersCount === 15 ? '✓ ONCE COMPLETO' : `${selectedPlayersCount}/15 SELECCIONADOS`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-gray-300">
                <span className="text-[#E6BE55] font-bold">
                  DT: {userProfile?.managerName || 'Director Técnico'}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-[#54C3BB]">
                  {registeredLeagues?.find((l) => l.id === activeLeagueId)?.name ||
                    userProfile?.selectedLeague?.name ||
                    'Liga BetPlay Dimayor (Fecha 10)'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* DUPLICATE SQUAD BUTTON */}
            {onDuplicateSquadFromLeague && sourceLeaguesForDuplicate && sourceLeaguesForDuplicate.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const eligible = sourceLeaguesForDuplicate.filter((s) => s.leagueId !== activeLeagueId);
                  if (eligible.length > 0) setSelectedSourceLeagueId(eligible[0].leagueId);
                  setIsDuplicateModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#0F2319] hover:bg-[#153827] text-[#54C3BB] hover:text-[#C9F04D] border border-[#54C3BB]/40 hover:border-[#C9F04D] transition text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Copiar alineación de otra liga a esta"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar Once</span>
              </button>
            )}

            {onClearSquad && (
              <button
                type="button"
                onClick={onClearSquad}
                className="px-2.5 py-1.5 rounded-xl bg-[#0F2319] hover:bg-red-950/40 text-gray-400 hover:text-red-300 border border-[#143426] hover:border-red-800 transition text-xs font-mono flex items-center gap-1 cursor-pointer"
                title="Vaciar jugadores para elegir desde cero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar Once</span>
              </button>
            )}

            {onAutoFillSquad && selectedPlayersCount < 15 && (
              <button
                type="button"
                onClick={onAutoFillSquad}
                className="px-2.5 py-1.5 rounded-xl bg-[#143426] hover:bg-[#1a4432] text-[#C9F04D] border border-[#C9F04D]/40 transition text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                title="Llenar puestos vacíos con jugadores sugeridos"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autocompletar</span>
              </button>
            )}

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="px-3 py-1.5 rounded-xl bg-[#0F2319] hover:bg-[#153827] text-gray-200 hover:text-white border border-[#1E4333] hover:border-[#E6BE55] transition text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#E6BE55]" />
                <span>Cambiar Liga / DT</span>
              </button>
            )}
          </div>
        </div>

        {/* Guided Tip when incomplete */}
        {selectedPlayersCount < 15 && (
          <div className="mt-2.5 pt-2 border-t border-[#143426]/60 flex items-center gap-2 text-xs text-[#C9F04D] font-mono">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              Tienes {15 - selectedPlayersCount} posiciones vacías en este torneo. Toca cualquier casilla punteada con <span className="font-bold">"+"</span> en la cancha o la banca para fichar un jugador.
            </span>
          </div>
        )}
      </div>

      {/* MODAL: DUPLICAR ONCE */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0C1D16] border border-[#1E4333] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#54C3BB]/20 border border-[#54C3BB] flex items-center justify-center text-[#54C3BB]">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-wide">
                    Duplicar Once de otra Liga
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400">
                    Clona formación, 11 titulares y 4 suplentes
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Vas a copiar la alineación a{' '}
              <strong className="text-[#C9F04D]">
                {registeredLeagues?.find((l) => l.id === activeLeagueId)?.name || 'esta competición'}
              </strong>
              . Podrás editarla libremente sin afectar la plantilla original.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-400 uppercase">
                Selecciona la alineación de origen:
              </label>
              {sourceLeaguesForDuplicate.filter((s) => s.leagueId !== activeLeagueId).length === 0 ? (
                <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] text-center text-xs text-gray-400 font-mono">
                  No tienes otras ligas con alineaciones creadas para copiar.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {sourceLeaguesForDuplicate
                    .filter((s) => s.leagueId !== activeLeagueId)
                    .map((source) => (
                      <button
                        key={source.leagueId}
                        type="button"
                        onClick={() => setSelectedSourceLeagueId(source.leagueId)}
                        className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                          selectedSourceLeagueId === source.leagueId
                            ? 'bg-[#143426] border-[#C9F04D] text-white shadow-md'
                            : 'bg-[#071410] border-[#143426] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block text-white">
                            {source.leagueName}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-400">
                            <span className="text-[#E6BE55]">Táctica: {source.formation}</span>
                            <span>•</span>
                            <span className="text-[#54C3BB]">{source.count}/15 Jugadores</span>
                            {source.captainName && (
                              <>
                                <span>•</span>
                                <span className="text-gray-300">Cap: {source.captainName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            selectedSourceLeagueId === source.leagueId
                              ? 'border-[#C9F04D] bg-[#C9F04D] text-[#071410] font-bold'
                              : 'border-gray-600'
                          }`}
                        >
                          {selectedSourceLeagueId === source.leagueId && '✓'}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#143426]">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#071410] hover:bg-[#143426] text-gray-300 text-xs font-mono font-bold cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedSourceLeagueId}
                onClick={() => {
                  if (onDuplicateSquadFromLeague && selectedSourceLeagueId) {
                    onDuplicateSquadFromLeague(selectedSourceLeagueId);
                    const srcName = sourceLeaguesForDuplicate.find(
                      (s) => s.leagueId === selectedSourceLeagueId
                    )?.leagueName;
                    setDuplicateSuccessMessage(
                      `¡Once duplicado exitosamente desde ${srcName || 'la otra liga'}!`
                    );
                    setIsDuplicateModalOpen(false);
                    setTimeout(() => setDuplicateSuccessMessage(''), 4000);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-lg ${
                  selectedSourceLeagueId
                    ? 'bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar a Esta Liga</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls: Formations & Chips Header */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Formations Pills */}
        <div>
          <span className="text-[11px] font-mono text-gray-400 block mb-1.5 uppercase tracking-wider">
            Esquema Táctico ({formation})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['3-4-3', '3-5-2', '4-4-2', '4-3-3', '4-5-1', '5-3-2', '5-4-1'] as Formation[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    formation === f
                      ? 'bg-[#C9F04D] text-[#071410] shadow'
                      : 'bg-[#0F2319] text-gray-300 hover:text-white border border-[#143426]'
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        {/* Live Total Score Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#C9F04D]/40 text-right">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">
              {isWorstXIMode ? 'Puntaje Peor Once' : 'Puntaje Total Provisorio'}
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="font-mono text-xl font-black text-[#C9F04D]">
                {totalPoints.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 font-mono">PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chips System Row */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E6BE55]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Chips Disponibles (Ventana Actual)
            </h3>
          </div>
          {activeChip !== 'none' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40 animate-pulse">
              Chip Activo
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Wildcard */}
          <button
            onClick={() => onActivateChip(activeChip === 'wildcard' ? 'none' : 'wildcard')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeChip === 'wildcard'
                ? 'bg-[#153827] border-[#C9F04D] text-white shadow-md'
                : 'bg-[#0F2319] border-[#143426] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wide">
                Wildcard
              </span>
              <RefreshCw className={`w-3.5 h-3.5 ${activeChip === 'wildcard' ? 'text-[#C9F04D]' : 'text-gray-400'}`} />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 leading-snug">
              Reconstrucción total de plantilla ilimitada.
            </span>
            <span className="text-[9px] font-mono text-[#E6BE55] mt-1 font-semibold">
              Costo: 20 DT
            </span>
          </button>

          {/* Triple Captain */}
          <button
            onClick={() => onActivateChip(activeChip === 'triple_captain' ? 'none' : 'triple_captain')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeChip === 'triple_captain'
                ? 'bg-[#153827] border-[#E6BE55] text-white shadow-md'
                : 'bg-[#0F2319] border-[#143426] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wide">
                Triple Capitán
              </span>
              <Star className={`w-3.5 h-3.5 ${activeChip === 'triple_captain' ? 'text-[#E6BE55]' : 'text-gray-400'}`} />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 leading-snug">
              Multiplicador 3x en tu capitán de la fecha.
            </span>
            <span className="text-[9px] font-mono text-[#E6BE55] mt-1 font-semibold">
              Costo: 15 DT
            </span>
          </button>

          {/* Bench Boost */}
          <button
            onClick={() => onActivateChip(activeChip === 'bench_boost' ? 'none' : 'bench_boost')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeChip === 'bench_boost'
                ? 'bg-[#153827] border-[#54C3BB] text-white shadow-md'
                : 'bg-[#0F2319] border-[#143426] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wide">
                Bench Boost
              </span>
              <TrendingUp className={`w-3.5 h-3.5 ${activeChip === 'bench_boost' ? 'text-[#54C3BB]' : 'text-gray-400'}`} />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 leading-snug">
              Los 4 suplentes del banco suman puntos.
            </span>
            <span className="text-[9px] font-mono text-[#7AC492] mt-1 font-semibold">
              GRATIS (1 uso)
            </span>
          </button>

          {/* Regional Wildcard */}
          <button
            onClick={() => onActivateChip(activeChip === 'regional_wildcard' ? 'none' : 'regional_wildcard')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeChip === 'regional_wildcard'
                ? 'bg-[#153827] border-[#C9F04D] text-white shadow-md'
                : 'bg-[#0F2319] border-[#143426] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wide">
                Regional Wildcard
              </span>
              <span className="text-xs">🇨🇴</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 leading-snug">
              Multiplicador 1.5x a colombianos en Conmebol.
            </span>
            <span className="text-[9px] font-mono text-[#7AC492] mt-1 font-semibold">
              GRATIS (1 uso)
            </span>
          </button>
        </div>
      </div>

      {/* TACTICAL PITCH CONTAINER */}
      <div className="relative rounded-3xl p-3 sm:p-6 overflow-hidden border-2 border-[#193F2E] shadow-2xl pitch-grass min-h-[580px] sm:min-h-[640px] flex flex-col justify-between">
        {/* Pitch Tactical Markings (Vector Lines) */}
        <div className="absolute inset-2 sm:inset-4 border-2 border-white/10 rounded-2xl pointer-events-none" />
        {/* Halfway Line */}
        <div className="absolute left-2 right-2 sm:left-4 sm:right-4 top-1/2 -translate-y-1/2 border-t-2 border-white/10 pointer-events-none" />
        {/* Center Circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/10 pointer-events-none" />
        {/* Center Spot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20 pointer-events-none" />
        {/* Top Penalty Box */}
        <div className="absolute left-1/2 top-2 sm:top-4 -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-24 border-b-2 border-x-2 border-white/10 pointer-events-none" />
        {/* Bottom Penalty Box */}
        <div className="absolute left-1/2 bottom-2 sm:bottom-4 -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-24 border-t-2 border-x-2 border-white/10 pointer-events-none" />

        {/* PORTERO (POR) ROW - TOP (Primer jugador en elegirse) */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 py-2">
            {porSlots.map(renderPlayerCard)}
          </div>
        </div>

        {/* DEFENSAS (DEF) ROW */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2">
            {defSlots.map(renderPlayerCard)}
          </div>
        </div>

        {/* MEDIOCAMPISTAS (MED) ROW */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap py-2">
            {medSlots.map(renderPlayerCard)}
          </div>
        </div>

        {/* DELANTEROS (DEL) ROW - BOTTOM */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-6 flex-wrap py-2">
            {delSlots.map(renderPlayerCard)}
          </div>
        </div>
      </div>

      {/* SUPLENTES / BANCA ROW (4 PLAYERS) */}
      <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#54C3BB]" />
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Banca de Suplentes (4 Jugadores)
            </h3>
          </div>
          {activeChip === 'bench_boost' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#54C3BB]/20 text-[#54C3BB] border border-[#54C3BB]/40">
              ⚡ Bench Boost Activo (+{benchBonusPoints} pts)
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-mono">
              Auto-sustituyen titulares ausentes
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {benchSlots.map(renderPlayerCard)}
        </div>
      </div>

      {/* PLAYER ACTION MODAL (When tapping any player on pitch) */}
      {selectedPlayerForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0C1D16] border border-[#1E4333] p-5 shadow-2xl text-left relative">
            <div className="flex items-start gap-3 mb-4">
              <img
                src={selectedPlayerForAction.player.photoUrl}
                alt={selectedPlayerForAction.player.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#54C3BB]"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#143426] text-[#C9F04D] uppercase">
                    {selectedPlayerForAction.player.position}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {selectedPlayerForAction.player.club}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-wide">
                  {selectedPlayerForAction.player.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                  <span className="text-[#E6BE55] font-bold">
                    ${selectedPlayerForAction.player.price}M COP
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-[#C9F04D] font-bold">
                    {selectedPlayerForAction.score.total} PTS
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="space-y-2">
              {/* Captain (C) */}
              <button
                onClick={() => {
                  if (selectedPlayerForAction?.player?.id) {
                    onSetCaptain(selectedPlayerForAction.player.id);
                  }
                  setSelectedPlayerForAction(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  captainId === selectedPlayerForAction?.player?.id
                    ? 'bg-[#E6BE55] text-[#071410] border-[#E6BE55] font-bold'
                    : 'bg-[#0F2319] text-white border-[#143426] hover:border-[#E6BE55]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E6BE55] text-[#071410] font-mono font-bold flex items-center justify-center text-xs">
                    C
                  </span>
                  <span>Asignar como Capitán (2x Puntos)</span>
                </div>
                {captainId === selectedPlayerForAction?.player?.id && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              {/* Vice Captain (VC) */}
              <button
                onClick={() => {
                  if (selectedPlayerForAction?.player?.id) {
                    onSetViceCaptain(selectedPlayerForAction.player.id);
                  }
                  setSelectedPlayerForAction(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  viceCaptainId === selectedPlayerForAction?.player?.id
                    ? 'bg-[#54C3BB] text-[#071410] border-[#54C3BB] font-bold'
                    : 'bg-[#0F2319] text-white border-[#143426] hover:border-[#54C3BB]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#54C3BB] text-[#071410] font-mono font-bold flex items-center justify-center text-xs">
                    V
                  </span>
                  <span>Asignar como Vice-Capitán</span>
                </div>
                {viceCaptainId === selectedPlayerForAction?.player?.id && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              {/* Hidden Captain (HC) */}
              <button
                onClick={() => {
                  if (selectedPlayerForAction?.player?.id) {
                    onToggleHiddenCaptain(selectedPlayerForAction.player.id);
                  }
                  setSelectedPlayerForAction(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  hiddenCaptainId === selectedPlayerForAction?.player?.id && isHiddenCaptainActive
                    ? 'bg-[#C9F04D] text-[#071410] border-[#C9F04D] font-bold'
                    : 'bg-[#0F2319] text-white border-[#143426] hover:border-[#C9F04D]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-[#C9F04D]" />
                  <div>
                    <span className="block">Capitán Oculto (Hidden Captain)</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      Secreto para rivales hasta 1h antes del deadline
                    </span>
                  </div>
                </div>
                {hiddenCaptainId === selectedPlayerForAction?.player?.id && isHiddenCaptainActive && (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
              </button>

              {/* Inspect Points Breakdown */}
              <button
                onClick={() => {
                  onInspectPlayer(selectedPlayerForAction.player, selectedPlayerForAction.score);
                  setSelectedPlayerForAction(null);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F2319] text-white border border-[#143426] hover:border-gray-500 text-sm font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#54C3BB]" />
                  <span>Ver Desglose de Puntos Detallado</span>
                </div>
              </button>

              {/* Replace Player */}
              <button
                onClick={() => {
                  const slot = selectedPlayerForAction.slot;
                  setSelectedPlayerForAction(null);
                  onSelectSlotForReplacement(slot);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143426] text-[#C9F04D] border border-[#C9F04D]/40 hover:brightness-110 text-sm font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transferir / Cambiar Jugador</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setSelectedPlayerForAction(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#071410] text-gray-400 hover:text-white text-xs font-mono border border-[#143426] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
