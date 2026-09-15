import React, { useState } from 'react';
import {
  Trophy,
  Shield,
  Zap,
  Users,
  Flame,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Award,
  Copy,
  Plus,
  X,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  PrivateLeague,
  VIPTournament,
  LeagueLevel,
  SelectedLeagueInfo,
  Formation,
} from '../types';
import { INITIAL_PRIVATE_LEAGUES, INITIAL_VIP_TOURNAMENTS } from '../data/mockFootballData';
import { formatCOP } from '../utils/scoring';

interface GameModesViewProps {
  userTokens: number;
  joinedLeagueIds?: string[];
  registeredLeagues?: SelectedLeagueInfo[];
  onJoinLeagueWithSquadChoice?: (params: {
    league: SelectedLeagueInfo;
    choice: 'fresh' | 'duplicate' | 'autofill';
    sourceLeagueId?: string;
  }) => void;
  onJoinLeague?: (league: SelectedLeagueInfo | PrivateLeague) => void;
  onGoToLeagueSquad?: (leagueId: string) => void;
  onSelectWorstXIMode: () => void;
  isWorstXIModeActive: boolean;
  sourceLeaguesForDuplicate?: {
    leagueId: string;
    leagueName: string;
    formation: Formation;
    count: number;
    captainName?: string;
  }[];
}

export const GameModesView: React.FC<GameModesViewProps> = ({
  userTokens,
  joinedLeagueIds = ['leg-1'],
  registeredLeagues = [],
  onJoinLeagueWithSquadChoice,
  onJoinLeague,
  onGoToLeagueSquad,
  onSelectWorstXIMode,
  isWorstXIModeActive,
  sourceLeaguesForDuplicate = [],
}) => {
  const [leagues, setLeagues] = useState<PrivateLeague[]>(INITIAL_PRIVATE_LEAGUES);
  const [vipTournaments, setVipTournaments] = useState<VIPTournament[]>(INITIAL_VIP_TOURNAMENTS);
  const [selectedTab, setSelectedTab] = useState<'private' | 'vip' | 'peor_once'>('private');

  // Inscription modal state
  const [enrollTarget, setEnrollTarget] = useState<SelectedLeagueInfo | null>(null);
  const [squadChoice, setSquadChoice] = useState<'fresh' | 'duplicate' | 'autofill'>('fresh');
  const [selectedSourceLeagueId, setSelectedSourceLeagueId] = useState<string>('');

  const handleOpenEnroll = (leagueInfo: SelectedLeagueInfo) => {
    setEnrollTarget(leagueInfo);
    if (sourceLeaguesForDuplicate.length > 0) {
      setSelectedSourceLeagueId(sourceLeaguesForDuplicate[0].leagueId);
      setSquadChoice('duplicate');
    } else {
      setSquadChoice('fresh');
    }
  };

  const handleConfirmEnroll = () => {
    if (!enrollTarget) return;
    if (typeof onJoinLeagueWithSquadChoice === 'function') {
      onJoinLeagueWithSquadChoice({
        league: enrollTarget,
        choice: squadChoice,
        sourceLeagueId: squadChoice === 'duplicate' ? selectedSourceLeagueId : undefined,
      });
    } else if (typeof onJoinLeague === 'function') {
      onJoinLeague(enrollTarget);
    }
    setEnrollTarget(null);
  };

  return (
    <div className="space-y-5 text-left">
      {/* Subnavigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0C1D16] border border-[#143426]">
        <button
          onClick={() => setSelectedTab('private')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            selectedTab === 'private'
              ? 'bg-[#E6BE55] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ligas Privadas (Niveles 1 a 4+)</span>
        </button>

        <button
          onClick={() => setSelectedTab('peor_once')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            selectedTab === 'peor_once'
              ? 'bg-[#FF7A59] text-white font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>El Peor Once</span>
          <span className="hidden sm:inline px-1 py-0.2 rounded text-[9px] bg-[#071410] text-[#FF7A59] font-mono">
            INVERTIDO
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('vip')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            selectedTab === 'vip'
              ? 'bg-[#54C3BB] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Torneos VIP & 1v1</span>
        </button>
      </div>

      {/* TAB 1: PRIVATE LEAGUES (NIVEL 1 A 4+) */}
      {selectedTab === 'private' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-wide">
                  Ligas Privadas por Niveles (Reset en Cada Fecha)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sin desgaste de temporada completa. Compite con buy-ins en pesos colombianos y comisiones competitivas de rake (9% a 6%).
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0F2319] border border-[#E6BE55]/30 text-xs text-[#E6BE55] font-mono shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Liquidación Automática al Terminar Fecha</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagues.map((league) => {
              const isJoined = joinedLeagueIds.includes(league.id);
              const levelBadgeColors: Record<LeagueLevel, string> = {
                1: 'bg-[#54C3BB]/20 text-[#54C3BB] border-[#54C3BB]/40',
                2: 'bg-[#C9F04D]/20 text-[#C9F04D] border-[#C9F04D]/40',
                3: 'bg-[#E6BE55]/20 text-[#E6BE55] border-[#E6BE55]/40',
                4: 'bg-[#FF7A59]/20 text-[#FF7A59] border-[#FF7A59]/40',
              };

              return (
                <div
                  key={league.id}
                  className="bg-[#0C1D16] border border-[#143426] hover:border-[#22503B] rounded-2xl p-4 shadow-lg flex flex-col justify-between transition"
                >
                  <div>
                    {/* Header with Level Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                          levelBadgeColors[league.level]
                        }`}
                      >
                        Nivel {league.level} ({league.rakePercentage}% Rake)
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {league.fixtureName}
                      </span>
                    </div>

                    <h4 className="font-display text-lg font-bold text-white tracking-wide">
                      {league.name}
                    </h4>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-[#071410] border border-[#143426] text-center font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Buy-in</span>
                        <span className="text-sm font-bold text-white">
                          {formatCOP(league.buyInCOP)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Pozo Premios</span>
                        <span className="text-sm font-bold text-[#E6BE55]">
                          {formatCOP(league.prizePoolCOP)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Cupos</span>
                        <span className="text-sm font-bold text-[#54C3BB]">
                          {league.currentParticipants}/{league.maxParticipants}
                        </span>
                      </div>
                    </div>

                    {/* Leaderboard preview if live */}
                    {league.leaderboard.length > 0 && (
                      <div className="space-y-1.5 my-2">
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">
                          Líderes de la fecha:
                        </span>
                        {league.leaderboard.slice(0, 3).map((item) => (
                          <div
                            key={item.userId}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#0F2319] border border-[#143426]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-center font-bold text-[#E6BE55]">
                                #{item.rank}
                              </span>
                              <img
                                src={item.avatar}
                                alt={item.userName}
                                className="w-5 h-5 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-medium text-gray-200">{item.teamName}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[#C9F04D] font-bold">{item.points} pts</span>
                              {item.prizeCOP && (
                                <span className="text-[#E6BE55] text-[10px]">
                                  {formatCOP(item.prizeCOP)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#143426] flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">
                      Estado: <strong className="text-[#7AC492] uppercase">{league.status}</strong>
                    </span>

                    {isJoined ? (
                      <button
                        type="button"
                        onClick={() => onGoToLeagueSquad && onGoToLeagueSquad(league.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#143426] hover:bg-[#1a4432] text-[#C9F04D] font-bold text-xs font-mono border border-[#C9F04D]/40 flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inscrito • Ver Mi Once</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEnroll({
                            id: league.id,
                            name: league.name,
                            category: 'LIGA_BETPLAY',
                            description: `${league.fixtureName} • Rake: ${league.rakePercentage}%`,
                            prizePoolCOP: league.prizePoolCOP,
                            entryTokens: Math.max(1, Math.round(league.buyInCOP / 1000)),
                            entryFeeCOP: league.buyInCOP,
                            deadlineText: 'Cierre antes del primer partido',
                            badge: '🇨🇴',
                            tag: `NIVEL ${league.level}`,
                            isWorstXI: false,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-[#E6BE55] hover:bg-[#F2CE6E] text-[#071410] font-bold text-xs font-mono shadow transition cursor-pointer active:scale-95"
                      >
                        Inscribirse ({formatCOP(league.buyInCOP)})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EL PEOR ONCE (THE WORST XI MODE) */}
      {selectedTab === 'peor_once' && (
        <div className="bg-[#0C1D16] border border-[#FF7A59]/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A59]/20 border border-[#FF7A59] flex items-center justify-center shrink-0">
              <TrendingDown className="w-6 h-6 text-[#FF7A59]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FF7A59] text-[#071410] uppercase">
                  Modo Invertido
                </span>
                <span className="text-xs font-mono text-[#E6BE55]">
                  Pozo Garantizado: $2.500.000 COP
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-white tracking-wide mt-1">
                El Peor Once: Gana con el Menor Puntaje
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                El modo más táctico y despiadado. Diseña una alineación de jugadores propensos a errores, autogoles, tarjetas y goles en contra.
              </p>
            </div>
          </div>

          {/* Anti-Exploit System Card */}
          <div className="p-4 rounded-xl bg-[#071410] border border-[#FF7A59]/40 space-y-2">
            <div className="flex items-center gap-2 text-[#FF7A59] font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Regla Anti-Exploit Estricta de Master DT:</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Está <strong>terminantemente prohibido</strong> seleccionar futbolistas que no jueguen o suplentes sin minutos garantizados.
              Solo son válidos jugadores <strong>titulares confirmados en la planilla oficial de Dimayor / Conmebol</strong>.
              Si un jugador seleccionado sufre una sustitución temprana o lesión en los primeros minutos, el sistema le asigna
              automáticamente <strong>el puntaje de la mediana posicional de la fecha</strong> (evitando explotar futbolistas inactivos).
            </p>
          </div>

          {/* Scoring in Worst XI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426]">
              <span className="text-[#C9F04D] font-bold block mb-1">Puntos Negativos (¡Suman a tu victoria!)</span>
              <ul className="space-y-1 text-gray-400 text-[11px]">
                <li>• Autogoles (-2)</li>
                <li>• Tarjetas Rojas (-3)</li>
                <li>• Penales Fallados (-2)</li>
                <li>• Goles Recibidos c/2 (-1)</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426]">
              <span className="text-[#FF7A59] font-bold block mb-1">Lo que te perjudica</span>
              <ul className="space-y-1 text-gray-400 text-[11px]">
                <li>• Goles anotados (+4 a +6)</li>
                <li>• Vallas invictas (+4)</li>
                <li>• Asistencias (+3)</li>
                <li>• Bonus MVP (+1 a +3)</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-[#0F2319] border border-[#143426]">
              <span className="text-[#54C3BB] font-bold block mb-1">Condiciones de Entrada</span>
              <ul className="space-y-1 text-gray-400 text-[11px]">
                <li>• Buy-in: $150.000 COP</li>
                <li>• Rake: 7%</li>
                <li>• Formato: 11 Titulares + 4 Banca</li>
                <li>• Criterio: Menor puntuación total</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400">
              {joinedLeagueIds.includes('peor-once-fpc')
                ? 'Ya estás inscrito en El Peor Once. Puedes gestionar su alineación independiente en Mi Once.'
                : 'Inscríbete y configura tu peor once para competir por el pozo de $2.500.000 COP.'}
            </span>
            {joinedLeagueIds.includes('peor-once-fpc') ? (
              <button
                type="button"
                onClick={() => onGoToLeagueSquad && onGoToLeagueSquad('peor-once-fpc')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm font-mono bg-[#143426] text-[#C9F04D] border border-[#C9F04D] flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Inscrito • Ir al Peor Once</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleOpenEnroll({
                    id: 'peor-once-fpc',
                    name: 'El Peor Once (Anti-Fantasy FPC)',
                    category: 'LIGA_BETPLAY',
                    description: 'Modalidad invertida oficial • Rake: 7%',
                    prizePoolCOP: 2500000,
                    entryTokens: 150,
                    entryFeeCOP: 150000,
                    deadlineText: 'Cierre Fecha 10',
                    badge: '📉',
                    tag: 'MODO INVERTIDO',
                    isWorstXI: true,
                  })
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm font-mono bg-[#FF7A59] hover:bg-[#FF8F73] text-white active:scale-95 transition cursor-pointer shadow-lg"
              >
                Inscribirse al Peor Once ($150.000 COP)
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VIP TOURNAMENTS (GTD, EFFICIENCY, HEADS-UP) */}
      {selectedTab === 'vip' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-4">
            <h3 className="font-display text-xl font-bold text-white tracking-wide">
              Variaciones de Torneos VIP & Duelos Heads-Up
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Torneos con protección contra overlay, torneos de eficiencia técnica (Puntos / Costo) y duelos 1v1 directos con mínimo rake del 5%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vipTournaments.map((tourney) => {
              const isTourneyJoined = joinedLeagueIds.includes(tourney.id);
              return (
                <div
                  key={tourney.id}
                  className="bg-[#0C1D16] border border-[#143426] hover:border-[#54C3BB]/50 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#54C3BB]/20 text-[#54C3BB] border border-[#54C3BB]/30 uppercase">
                        {tourney.type === 'gtd'
                          ? 'GTD Garantizado'
                          : tourney.type === 'efficiency'
                          ? 'Eficiencia DT'
                          : tourney.type === 'heads_up'
                          ? '1v1 Duelo'
                          : 'Peor Once'}
                      </span>
                      {tourney.overlayProtection && (
                        <span className="text-[10px] font-mono text-[#E6BE55] flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Overlay Protegido
                        </span>
                      )}
                    </div>

                    <h4 className="font-display text-lg font-bold text-white tracking-wide">
                      {tourney.title}
                    </h4>

                    <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                      {tourney.description}
                    </p>

                    <div className="my-3 p-2.5 rounded-xl bg-[#071410] border border-[#143426] space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Buy-in:</span>
                        <span className="text-white font-bold">{formatCOP(tourney.buyInCOP)}</span>
                      </div>
                      {tourney.guaranteedPrizeCOP && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pozo GTD:</span>
                          <span className="text-[#E6BE55] font-bold">
                            {formatCOP(tourney.guaranteedPrizeCOP)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rake:</span>
                        <span className="text-[#54C3BB] font-bold">{tourney.rakePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inscritos:</span>
                        <span className="text-gray-200">
                          {tourney.participantsCount} / {tourney.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isTourneyJoined ? (
                    <button
                      type="button"
                      onClick={() => onGoToLeagueSquad && onGoToLeagueSquad(tourney.id)}
                      className="w-full py-2.5 rounded-xl bg-[#143426] hover:bg-[#1a4432] text-[#C9F04D] font-bold text-xs font-mono border border-[#C9F04D]/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Inscrito • Ver Mi Once</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEnroll({
                          id: tourney.id,
                          name: tourney.title,
                          category: 'LIGA_BETPLAY',
                          description: tourney.description,
                          prizePoolCOP: tourney.guaranteedPrizeCOP || tourney.buyInCOP * tourney.maxParticipants,
                          entryTokens: Math.max(1, Math.round(tourney.buyInCOP / 1000)),
                          entryFeeCOP: tourney.buyInCOP,
                          deadlineText: 'Cierre de inscripciones VIP',
                          badge: '🏆',
                          tag: 'VIP MASTER',
                          isWorstXI: tourney.type === 'worst_xi',
                        })
                      }
                      className="w-full py-2.5 rounded-xl bg-[#54C3BB] hover:bg-[#68D8D0] text-[#071410] font-bold text-xs font-mono transition cursor-pointer active:scale-95"
                    >
                      Unirse al Torneo ({formatCOP(tourney.buyInCOP)})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE INSCRIPCIÓN Y ELECCIÓN DE ONCE */}
      {enrollTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0C1D16] border border-[#1E4333] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#143426]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#C9F04D]/20 border border-[#C9F04D] flex items-center justify-center text-[#C9F04D] font-bold text-lg">
                  {enrollTarget.badge || '🏆'}
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-black text-white tracking-wide">
                    Inscripción a {enrollTarget.name}
                  </h3>
                  <span className="text-[11px] font-mono text-[#E6BE55]">
                    Pozo: {formatCOP(enrollTarget.prizePoolCOP)} • Entrada: {formatCOP(enrollTarget.entryFeeCOP)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnrollTarget(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C9F04D]" />
                  <span>¿Cómo deseas armar tu Once para esta competición?</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  En Master DT compites con alineaciones independientes por liga. Puedes crear una desde cero o duplicar una existente.
                </p>
              </div>

              {/* Choice 1: Armar Once Nuevo */}
              <div
                onClick={() => setSquadChoice('fresh')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  squadChoice === 'fresh'
                    ? 'bg-[#0F2319] border-[#C9F04D] shadow-md'
                    : 'bg-[#071410] border-[#143426] hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center text-xs shrink-0 ${
                    squadChoice === 'fresh'
                      ? 'border-[#C9F04D] bg-[#C9F04D] text-[#071410] font-bold'
                      : 'border-gray-600'
                  }`}
                >
                  {squadChoice === 'fresh' && '✓'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    🆕 Armar Once Nuevo desde cero
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Plantilla en blanco para seleccionar tácticamente cada una de las 11 posiciones y 4 suplentes desde la cancha.
                  </span>
                </div>
              </div>

              {/* Choice 2: Duplicar Once de otra liga */}
              <div
                onClick={() => setSquadChoice('duplicate')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col gap-2 ${
                  squadChoice === 'duplicate'
                    ? 'bg-[#0F2319] border-[#54C3BB] shadow-md'
                    : 'bg-[#071410] border-[#143426] hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center text-xs shrink-0 ${
                      squadChoice === 'duplicate'
                        ? 'border-[#54C3BB] bg-[#54C3BB] text-[#071410] font-bold'
                        : 'border-gray-600'
                    }`}
                  >
                    {squadChoice === 'duplicate' && '✓'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      📋 Duplicar Once de otra de tus ligas
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Copia la táctica, los 15 jugadores y los capitanes para competir con el mismo equipo sin volver a seleccionarlo.
                    </span>
                  </div>
                </div>

                {squadChoice === 'duplicate' && (
                  <div className="pl-8 pt-1">
                    <label className="block text-[11px] font-mono text-gray-400 mb-1">
                      Selecciona la liga de origen a clonar:
                    </label>
                    {sourceLeaguesForDuplicate.length === 0 ? (
                      <span className="text-[11px] text-amber-400 font-mono block">
                        Aún no tienes otra liga con once guardado. Se creará una plantilla nueva.
                      </span>
                    ) : (
                      <select
                        value={selectedSourceLeagueId}
                        onChange={(e) => setSelectedSourceLeagueId(e.target.value)}
                        className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#54C3BB] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      >
                        {sourceLeaguesForDuplicate.map((s) => (
                          <option key={s.leagueId} value={s.leagueId}>
                            {s.leagueName} ({s.formation} • {s.count}/15 Jugadores)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Choice 3: Autocompletar Plantilla Sugerida */}
              <div
                onClick={() => setSquadChoice('autofill')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  squadChoice === 'autofill'
                    ? 'bg-[#0F2319] border-[#E6BE55] shadow-md'
                    : 'bg-[#071410] border-[#143426] hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center text-xs shrink-0 ${
                    squadChoice === 'autofill'
                      ? 'border-[#E6BE55] bg-[#E6BE55] text-[#071410] font-bold'
                      : 'border-gray-600'
                  }`}
                >
                  {squadChoice === 'autofill' && '✓'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    ⚡ Autocompletar Plantilla Balanceada
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Llena inmediatamente los 15 cupos con futbolistas recomendados dentro del límite salarial de $100.0M.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#143426]">
              <button
                type="button"
                onClick={() => setEnrollTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#071410] hover:bg-[#143426] text-gray-300 text-xs font-mono font-bold cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmEnroll}
                className="px-5 py-2.5 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <span>Confirmar e Ir a Mi Once</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
