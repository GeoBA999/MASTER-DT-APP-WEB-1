import React, { useState } from 'react';
import {
  BookOpen,
  Trophy,
  Shield,
  Zap,
  TrendingDown,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Sparkles,
  RefreshCw,
  Gift,
  Target,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const RulesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'base' | 'scoring' | 'innovations' | 'peor_once' | 'chips' | 'vip' | 'tokens'
  >('base');

  const TABS = [
    {
      id: 'base' as const,
      label: '1. Reglas Base',
      icon: Shield,
      bgActive: 'bg-[#C9F04D] text-[#071410] font-bold shadow-md ring-1 ring-[#C9F04D]',
    },
    {
      id: 'scoring' as const,
      label: '2. Tabla Puntos',
      icon: Zap,
      bgActive: 'bg-[#E6BE55] text-[#071410] font-bold shadow-md ring-1 ring-[#E6BE55]',
    },
    {
      id: 'chips' as const,
      label: '3. Capitanes & Chips',
      icon: Sparkles,
      bgActive: 'bg-[#54C3BB] text-[#071410] font-bold shadow-md ring-1 ring-[#54C3BB]',
    },
    {
      id: 'innovations' as const,
      label: '4. Cómo Ganar',
      icon: Flame,
      bgActive: 'bg-[#7AC492] text-[#071410] font-bold shadow-md ring-1 ring-[#7AC492]',
    },
    {
      id: 'peor_once' as const,
      label: '5. El Peor Once',
      icon: TrendingDown,
      bgActive: 'bg-[#FF7A59] text-white font-bold shadow-md ring-1 ring-[#FF7A59]',
    },
    {
      id: 'vip' as const,
      label: '6. Modalidades VIP',
      icon: Trophy,
      bgActive: 'bg-[#E6BE55] text-[#071410] font-bold shadow-md ring-1 ring-[#E6BE55]',
    },
    {
      id: 'tokens' as const,
      label: '7. Tokens & COP',
      icon: Coins,
      bgActive: 'bg-[#54C3BB] text-[#071410] font-bold shadow-md ring-1 ring-[#54C3BB]',
    },
  ];

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="space-y-5 text-left animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C1D16] via-[#0F2319] to-[#071410] border border-[#1E4333] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#C9F04D]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30 uppercase tracking-wide">
                Guía Oficial del Jugador DT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E6BE55]/20 text-[#E6BE55] border border-[#E6BE55]/30">
                100% Jornada a Jornada
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
              Reglamento y Tabla de Puntos — Master DT
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Todo lo que necesitas saber como mánager: plantilla de 15 futbolistas, matriz oficial de puntuación con recuperaciones y regates, capitanes, chips, innovaciones semanales, modo "El Peor Once" y modalidades de torneo.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#071410]/80 border border-[#143426] shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#C9F04D]/20 border border-[#C9F04D] flex items-center justify-center text-[#C9F04D]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Juego de Habilidad</span>
              <span className="text-xs font-bold text-white">Reglas Claras & Transparentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Responsive Grid (No items lost or clipped) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0C1D16] border border-[#143426] shadow-xl space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-center w-full ${
                  tab.id === 'tokens' ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isActive
                    ? tab.bgActive
                    : 'bg-[#071410] text-gray-300 hover:text-white hover:bg-[#143426] border border-[#1E4333]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? '' : 'text-gray-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chapter Breadcrumb & Fast Navigation */}
        <div className="flex items-center justify-between px-1 pt-1 border-t border-[#143426]/60 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9F04D] animate-pulse" />
            <span>
              Capítulo {currentTabIndex + 1} de 7:{' '}
              <strong className="text-white">{TABS[currentTabIndex]?.label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentTabIndex === 0}
              onClick={() => {
                if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#071410] border border-[#1E4333] text-gray-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition text-[11px]"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              disabled={currentTabIndex === TABS.length - 1}
              onClick={() => {
                if (currentTabIndex < TABS.length - 1) setActiveTab(TABS[currentTabIndex + 1].id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#071410] border border-[#1E4333] text-gray-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition text-[11px]"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: REGLAS BASE */}
      {activeTab === 'base' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9F04D]/20 border border-[#C9F04D] flex items-center justify-center text-[#C9F04D]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  1. Plantilla y Presupuesto
                </h3>
                <span className="text-xs text-gray-400">
                  Límites de conformación de tu equipo para cada jornada
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426]">
                <span className="text-gray-400 block text-[10px] uppercase">Plantilla</span>
                <span className="text-base font-bold text-white">15 Jugadores</span>
                <span className="text-[11px] text-[#C9F04D] block mt-1">2 GK • 5 DEF • 5 MED • 3 DEL</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426]">
                <span className="text-gray-400 block text-[10px] uppercase">Presupuesto Virtual</span>
                <span className="text-base font-bold text-[#E6BE55]">$100.0M</span>
                <span className="text-[11px] text-gray-400 block mt-1">Moneda del juego (no tokens)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426]">
                <span className="text-gray-400 block text-[10px] uppercase">Límite por Club</span>
                <span className="text-base font-bold text-[#FF7A59]">Máx. 3 por Club</span>
                <span className="text-[11px] text-gray-400 block mt-1">Fuerza diversificación táctica</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426]">
                <span className="text-gray-400 block text-[10px] uppercase">Deadline</span>
                <span className="text-base font-bold text-[#54C3BB]">1 hora antes</span>
                <span className="text-[11px] text-gray-400 block mt-1">Del primer partido de la fecha</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2 text-xs text-gray-300">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9F04D]" />
                <span>Formaciones Habilitadas en Cancha:</span>
              </h4>
              <p className="leading-relaxed">
                Tu alineación titular consta de <strong>11 titulares + 4 suplentes</strong> en la banca. Son válidas las formaciones: 
                <span className="font-mono text-[#C9F04D] font-bold ml-1">
                  3-4-3, 3-5-2, 4-4-2, 4-3-3, 4-5-1, 5-3-2 y 5-4-1
                </span>.
                Siempre debe haber un mínimo de <strong>1 GK, 3 DEF, 2 MED y 1 DEL</strong> en cancha.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2 text-xs text-gray-300">
              <h4 className="font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#54C3BB]" />
                <span>Transferencias entre Jornadas:</span>
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-gray-300">
                <li><strong className="text-white">2 transferencias gratuitas</strong> por cada jornada.</li>
                <li>Son <strong className="text-white">acumulables hasta un máximo de 5</strong> si decides guardarlas para una fecha futura.</li>
                <li>Cada <strong className="text-[#FF7A59]">transferencia adicional</strong> cuesta una deducción fija de <strong>-4 puntos</strong> o en tokens (mecanismo a elección del jugador).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLA DE PUNTOS OFICIAL */}
      {activeTab === 'scoring' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  2. Tabla Oficial de Puntuación
                </h3>
                <p className="text-xs text-gray-400">
                  Desglose exacto de puntos otorgados por cada acción de los futbolistas según su posición en cancha
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30">
                Categorías Distintivas Exclusivas
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#143426]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#071410] text-gray-400 font-mono text-[11px] uppercase border-b border-[#143426]">
                  <tr>
                    <th className="py-3 px-4 text-white">Acción en Partido</th>
                    <th className="py-3 px-3 text-center text-[#E6BE55]">GK (Arquero)</th>
                    <th className="py-3 px-3 text-center text-[#54C3BB]">DEF (Defensa)</th>
                    <th className="py-3 px-3 text-center text-[#C9F04D]">MED (Volante)</th>
                    <th className="py-3 px-3 text-center text-[#FF7A59]">DEL (Delantero)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#143426] font-mono">
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Jugar hasta 60 minutos</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Jugar 60+ minutos</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-bold">+2</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-bold">+2</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-bold">+2</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-bold">+2</td>
                  </tr>
                  <tr className="bg-[#0F2319]/40 hover:bg-[#0F2319] transition">
                    <td className="py-2.5 px-4 text-white font-sans font-bold flex items-center gap-1.5">
                      <span>⚽ Gol anotado</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-black">+6</td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-black">+6</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-black">+5</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-black">+4</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">👟 Asistencia de gol</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+3</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+3</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+3</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+3</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">🛡️ Portería en cero (jugando 60+ min)</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+4</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-bold">+4</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">0</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">🧤 Cada 3 atajadas (GK)</td>
                    <td className="py-2.5 px-3 text-center text-white">+1</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">🧤 Penal atajado por arquero</td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-black">+5</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">❌ Penal fallado por el ejecutor</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Cada 2 goles encajados en contra</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-1</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-1</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">0</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">0</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">🟨 Tarjeta amarilla</td>
                    <td className="py-2.5 px-3 text-center text-yellow-400 font-bold">-1</td>
                    <td className="py-2.5 px-3 text-center text-yellow-400 font-bold">-1</td>
                    <td className="py-2.5 px-3 text-center text-yellow-400 font-bold">-1</td>
                    <td className="py-2.5 px-3 text-center text-yellow-400 font-bold">-1</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">🟥 Tarjeta roja (directa o doble amarilla)</td>
                    <td className="py-2.5 px-3 text-center text-red-500 font-black">-3</td>
                    <td className="py-2.5 px-3 text-center text-red-500 font-black">-3</td>
                    <td className="py-2.5 px-3 text-center text-red-500 font-black">-3</td>
                    <td className="py-2.5 px-3 text-center text-red-500 font-black">-3</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Autogol</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                    <td className="py-2.5 px-3 text-center text-red-400 font-bold">-2</td>
                  </tr>
                  <tr className="bg-[#143426]/40 hover:bg-[#143426]/70 transition">
                    <td className="py-2.5 px-4 text-[#C9F04D] font-sans font-bold">
                      ⚔️ Recuperaciones (cada 6) — ¡Nueva Categoría!
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-black">+1</td>
                    <td className="py-2.5 px-3 text-center text-[#C9F04D] font-black">+1</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                  </tr>
                  <tr className="bg-[#143426]/40 hover:bg-[#143426]/70 transition">
                    <td className="py-2.5 px-4 text-[#54C3BB] font-sans font-bold">
                      🪄 Regates exitosos (cada 3) — ¡Nueva Categoría!
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">—</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-black">+1</td>
                    <td className="py-2.5 px-3 text-center text-[#54C3BB] font-black">+1</td>
                  </tr>
                  <tr className="bg-[#0F2319] hover:bg-[#143426] transition">
                    <td className="py-2.5 px-4 text-[#E6BE55] font-sans font-bold">
                      ⭐ MVP de Bonus (Top 3 rating del partido vía datos)
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-bold">+3 / +2 / +1</td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-bold">+3 / +2 / +1</td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-bold">+3 / +2 / +1</td>
                    <td className="py-2.5 px-3 text-center text-[#E6BE55] font-bold">+3 / +2 / +1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] text-xs text-gray-300 space-y-1.5">
              <span className="font-bold text-[#C9F04D] block">
                ¿Por qué recuperaciones y regates exitosos son distintivos en Master DT?
              </span>
              <p className="leading-relaxed">
                Los juegos fantasy tradicionales premian casi con exclusividad a goleadores y porteros de clubes punteros. Al computar 
                <strong> recuperaciones (+1 cada 6 para DEF y MED)</strong> y <strong>regates exitosos (+1 cada 3 para MED y DEL)</strong>, 
                le damos puntaje real y valor competitivo a volantes de contención, marcadores aguerridos y extremos habilidosos de equipos chicos. 
                Hay variedad de estrategias ganadoras, no solo fichar a los delanteros obvios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAPITANES & CHIPS */}
      {activeTab === 'chips' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-xl font-bold text-white">
              3. Capitán, Vicecapitán y Comodines (Chips)
            </h3>
            <p className="text-xs text-gray-400">
              El modelo de Master DT es 100% jornada a jornada. Los chips se gestionan por ventanas de fechas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capitán Tradicional */}
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#E6BE55] text-[#071410] font-black text-xs flex items-center justify-center">
                    C
                  </span>
                  <h4 className="font-bold text-white text-sm">Capitán y Vicecapitán</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  El <strong>Capitán duplica sus puntos (x2)</strong> en la jornada. Si no juega ni un solo minuto, el <strong>Vicecapitán se activa automáticamente</strong> y asume el multiplicador x2.
                </p>
              </div>

              {/* Innovación: Capitán Oculto */}
              <div className="p-4 rounded-xl bg-[#0F2319] border border-[#C9F04D]/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#C9F04D] text-[#071410] font-black text-xs flex items-center justify-center">
                    HC
                  </span>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm">Innovación: Capitán Oculto</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#C9F04D] text-[#071410] font-bold">1 por ventana</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Disponible una vez por bloque de fechas. Te permite asignar tu capitán en secreto hasta 1 hora antes del cierre, <strong>sin que aparezca en el ranking de capitanes más elegidos en tiempo real</strong>. Rompe el efecto manada de copiar al mánager rival.
                </p>
              </div>
            </div>

            {/* Chips Especiales */}
            <div className="space-y-3 pt-2">
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#54C3BB]" />
                <span>Chips Tácticos (Uno por Ventana de Jornadas)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>🃏 Wildcard</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                      Puntos o Tokens
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Rehaces tu plantilla completa de 15 futbolistas sin penalización de puntos. Ya no es gratuito: se paga con deducción fija de puntos o mediante tokens de juego.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>⚡ Triple Captain</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                      Costo menor a Wildcard
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Tu capitán <strong>triplica sus puntos (x3)</strong> en lugar de duplicar. Se abona en puntos o tokens con tarifa reducida al tener impacto acotado a un solo jugador.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#071410] border border-[#C9F04D]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C9F04D] text-sm flex items-center gap-1.5">
                      <span>🛡️ Bench Boost</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#143426] text-[#C9F04D] border border-[#C9F04D]/40 font-bold">
                      100% Gratuito
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Los 4 futbolistas suplentes de tu banca puntúan también en esa fecha. Se mantiene <strong>completamente gratuito</strong> (uno por ventana).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#071410] border border-[#54C3BB]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#54C3BB] text-sm flex items-center gap-1.5">
                      <span>🇨🇴 Comodín Regional</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#54C3BB]/20 text-[#54C3BB] border border-[#54C3BB]/30 font-bold">
                      Conmebol x1.5
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Durante semanas de Copa Libertadores y Sudamericana, los jugadores de clubes colombianos en competencia internacional <strong>reciben puntos x1.5</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INNOVACIONES PARA QUE GANE GENTE DISTINTA */}
      {activeTab === 'innovations' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7AC492]/20 border border-[#7AC492] flex items-center justify-center text-[#7AC492]">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  4. Innovaciones: Para que Gane Gente Distinta Cada Jornada
                </h3>
                <span className="text-xs text-gray-400">
                  Rompemos el monopolio de las ballenas y los mismos ganadores de siempre
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              En el fantasy clásico, el usuario que compró a los goleadores costosos desde la primera fecha domina todo el torneo. En Master DT incorporamos 5 mecánicas de producto diseñadas para que cualquier jugador enfocado pueda ganar cada semana:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 1. MVP de la Jornada */}
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <div className="flex items-center gap-2 text-[#E6BE55] font-bold text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>MVP de la Jornada Independiente</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Premio y tokens para quien más puntos saca en <strong>esa fecha específica</strong>, sin importar si va último en la tabla general acumulada. ¡Si acertaste esa fecha, cobras!
                </p>
              </div>

              {/* 2. Liga por Presupuesto Usado */}
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <div className="flex items-center gap-2 text-[#C9F04D] font-bold text-sm">
                  <Target className="w-4 h-4" />
                  <span>Liga por Presupuesto Real Usado</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Rankings segmentados según tu nivel de gasto en tokens. Un <strong>ranking orgánico</strong> exclusivo para usuarios free o de bajo ticket, compitiendo en igualdad contra pares.
                </p>
              </div>

              {/* 3. Jornada Temática Rotativa */}
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <div className="flex items-center gap-2 text-[#54C3BB] font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Jornada Temática Rotativa (Sorpresa 24h antes)</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Cada 3-4 jornadas se revela un bono especial 24 horas antes del cierre:
                  <span className="block text-gray-400 mt-1 font-mono text-[11px]">
                    • "Jornada de porteros": atajadas y penales valen doble.<br />
                    • "Jornada de la garra": recuperaciones y regates x2.<br />
                    • "Jornada de underdogs": puntos x1.5 para jugadores de los 3 coleros.
                  </span>
                </p>
              </div>

              {/* 4. Bono de Diferencial */}
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <div className="flex items-center gap-2 text-[#FF7A59] font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Bono de Diferencial (+2 Puntos)</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Si alineas un jugador con <strong>menos del 5% de titularidad</strong> entre todos los mánagers y suma 8+ puntos esa jornada, recibes un <strong>bono adicional de +2 puntos</strong> por ir contra la corriente.
                </p>
              </div>
            </div>

            {/* Jackpot Lineup Perfecto & Draft Social */}
            <div className="p-4 rounded-xl bg-[#0F2319] border border-[#1E4333] space-y-2 text-xs text-gray-300">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#E6BE55]" />
                <span>Jackpot Dinámico de "Lineup Perfecto" & Draft Social en Ligas Privadas:</span>
              </h4>
              <p className="leading-relaxed">
                Cada jornada el pozo jackpot exige una condición dinámica anunciada con el bono (ej. 0 tarjetas en tu 11 titular, o capitán con doble dígito). El pozo se reparte entre <strong>todos los mánagers que cumplan la condición</strong>. Además, en ligas privadas de hasta 12 amigos puedes activar el <strong>Draft Social en Vivo</strong> semanal por turnos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EL PEOR ONCE */}
      {activeTab === 'peor_once' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#FF7A59]/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF7A59]/20 border border-[#FF7A59] flex items-center justify-center text-[#FF7A59]">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FF7A59] text-[#071410] uppercase">
                  Modo Anti-Fantasy Oficial
                </span>
                <h3 className="font-display text-2xl font-black text-white tracking-wide mt-0.5">
                  El Peor Once (Liga de la Vergüenza)
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              En esta liga paralela, el objetivo es deliberadamente armar el equipo con <strong>peor puntaje</strong>. Para que sea un juego de habilidad real y evitar la trampa aburrida de convocar suplentes que no van a jugar (lo que garantizaría 0 puntos), aplican reglas estrictas:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#071410] border border-[#FF7A59]/40 space-y-1.5">
                <div className="flex items-center gap-2 text-[#FF7A59] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>1. Regla de Titularidad Confirmada Obligatoria</span>
                </div>
                <p className="text-xs text-gray-300">
                  Solo se pueden convocar jugadores confirmados en el <strong>once titular real</strong> al cierre de la plantilla. Queda prohibido convocar banca, lesionados o sancionados.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#071410] border border-[#FF7A59]/40 space-y-1.5">
                <div className="flex items-center gap-2 text-[#FF7A59] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Regla de Sustitución Temprana (Anti-Lesiones de Conveniencia)</span>
                </div>
                <p className="text-xs text-gray-300">
                  Si un jugador convocado no completa el partido (cambio temprano o lesión sin faltas), se le asigna la <strong>mediana de puntos de su posición esa jornada</strong> en lugar de 0 puntos. Se elimina el incentivo de elegir a alguien que saquen rápido.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-1.5">
                <div className="flex items-center gap-2 text-[#C9F04D] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Condición de Victoria y Reglas Salariales</span>
                </div>
                <p className="text-xs text-gray-300">
                  Aplica el mismo presupuesto de $100.0M y máximo 3 jugadores por club. <strong>Gana quien MENOS puntos totales obtenga</strong> entre futbolistas que cumplieron su condición de titular completo. Tarjetas (-1/-3), penales fallados (-2), autogoles (-2) y goles recibidos te ayudan a ganar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MODALIDADES VIP & LIGAS */}
      {activeTab === 'vip' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6BE55]/20 border border-[#E6BE55] flex items-center justify-center text-[#E6BE55]">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  6. Modalidades de Competición & Ligas VIP
                </h3>
                <span className="text-xs text-gray-400">
                  Estructura de buy-ins en pesos colombianos (COP), torneos y botes garantizados
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#143426]">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#071410] text-gray-400 text-[11px] uppercase border-b border-[#143426]">
                  <tr>
                    <th className="py-3 px-4 text-white">Nivel VIP</th>
                    <th className="py-3 px-3 text-[#E6BE55]">Buy-in Mínimo</th>
                    <th className="py-3 px-3">Tamaño Liga</th>
                    <th className="py-3 px-3 text-[#54C3BB]">Rake</th>
                    <th className="py-3 px-4">Perfil & Beneficios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#143426]">
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Nivel 1</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$200.000 COP</td>
                    <td className="py-2.5 px-3">Hasta 50 mánagers</td>
                    <td className="py-2.5 px-3 text-[#54C3BB] font-bold">9%</td>
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Entrada al Club VIP • Soporte dedicado</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Nivel 2</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$500.000 COP</td>
                    <td className="py-2.5 px-3">Hasta 35 mánagers</td>
                    <td className="py-2.5 px-3 text-[#54C3BB] font-bold">8%</td>
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Jugadores recurrentes de alta competencia</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Nivel 3</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$1.000.000 COP</td>
                    <td className="py-2.5 px-3">Hasta 20 mánagers</td>
                    <td className="py-2.5 px-3 text-[#54C3BB] font-bold">7%</td>
                    <td className="py-2.5 px-4 text-gray-300 font-sans">Pool mayor • Host de cuenta exclusivo</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Nivel 4+</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$2.000.000+ COP</td>
                    <td className="py-2.5 px-3">Reducida / Heads-Up</td>
                    <td className="py-2.5 px-3 text-[#54C3BB] font-bold">6%</td>
                    <td className="py-2.5 px-4 text-gray-300 font-sans">High Roller • Límites extendidos por demanda</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426] space-y-1">
                <span className="font-bold text-[#E6BE55] block">Torneos GTD (Bote Garantizado)</span>
                <p className="text-gray-300">
                  El premio se anuncia de antemano (ej. $10M COP garantizados). Payout escalonado que premia entre el 15% y 20% de los mánagers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#143426] space-y-1">
                <span className="font-bold text-[#C9F04D] block">Torneo de Eficiencia</span>
                <p className="text-gray-300">
                  Gana quien logre el mejor índice: <em>Puntos del once titular ÷ Costo de plantilla</em>. Premia a quien encuentra gangas baratas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#071410] border border-[#54C3BB] space-y-1">
                <span className="font-bold text-[#54C3BB] block">Duelos Heads-Up (1v1)</span>
                <p className="text-gray-300">
                  Enfrentamiento directo mano a mano entre 2 mánagers con rake reducido (5%). Gana quien sume más puntos esa fecha.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TOKENS & BILLETERA */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#54C3BB]/20 border border-[#54C3BB] flex items-center justify-center text-[#54C3BB]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  7. Sistema de Tokens, Recargas y Billetera en COP
                </h3>
                <span className="text-xs text-gray-400">
                  Moneda virtual 100% en pesos colombianos con soporte Nequi, Daviplata y PSE
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#143426]">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#071410] text-gray-400 text-[11px] uppercase border-b border-[#143426]">
                  <tr>
                    <th className="py-3 px-4 text-white">Paquete</th>
                    <th className="py-3 px-3 text-[#E6BE55]">Precio (COP)</th>
                    <th className="py-3 px-3">Tokens Base</th>
                    <th className="py-3 px-3 text-[#C9F04D]">Bonus</th>
                    <th className="py-3 px-3 text-white">Tokens Totales</th>
                    <th className="py-3 px-3 text-gray-400">COP / Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#143426]">
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Starter</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$9.900</td>
                    <td className="py-2.5 px-3">900</td>
                    <td className="py-2.5 px-3 text-gray-500">—</td>
                    <td className="py-2.5 px-3 font-bold text-white">900</td>
                    <td className="py-2.5 px-3 text-gray-400">~11.0</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Plus</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$19.900</td>
                    <td className="py-2.5 px-3">2.000</td>
                    <td className="py-2.5 px-3 text-[#C9F04D] font-bold">+10%</td>
                    <td className="py-2.5 px-3 font-bold text-white">2.200</td>
                    <td className="py-2.5 px-3 text-gray-400">~9.0</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Pro</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$39.900</td>
                    <td className="py-2.5 px-3">4.300</td>
                    <td className="py-2.5 px-3 text-[#C9F04D] font-bold">+20%</td>
                    <td className="py-2.5 px-3 font-bold text-white">5.160</td>
                    <td className="py-2.5 px-3 text-gray-400">~7.7</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Elite</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$69.900</td>
                    <td className="py-2.5 px-3">8.000</td>
                    <td className="py-2.5 px-3 text-[#C9F04D] font-bold">+32%</td>
                    <td className="py-2.5 px-3 font-bold text-white">10.560</td>
                    <td className="py-2.5 px-3 text-gray-400">~6.6</td>
                  </tr>
                  <tr className="hover:bg-[#071410]/50 transition">
                    <td className="py-2.5 px-4 font-bold text-white">Whale</td>
                    <td className="py-2.5 px-3 text-[#E6BE55] font-bold">$149.900</td>
                    <td className="py-2.5 px-3">18.000</td>
                    <td className="py-2.5 px-3 text-[#C9F04D] font-bold">+45%</td>
                    <td className="py-2.5 px-3 font-bold text-white">26.100</td>
                    <td className="py-2.5 px-3 text-gray-400">~5.7</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-1.5">
                <span className="font-bold text-[#54C3BB] block">Top-up Sueltos (Tokens Individuales)</span>
                <p className="text-gray-300 leading-relaxed">
                  ¿Solo necesitas completar tokens exactos para un torneo? Puedes comprar desde <strong>100 tokens a $18 COP/token</strong> sin comprar paquetes enteros.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#071410] border border-[#143426] space-y-1.5">
                <span className="font-bold text-[#C9F04D] block">Política KYC Diferida (Cero Fricción)</span>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Sin KYC para jugar, comprar tokens o crear ligas</strong>. La verificación de documento se solicita únicamente al momento de retirar dinero o premios en efectivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
