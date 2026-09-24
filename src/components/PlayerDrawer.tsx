import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Check, AlertCircle, ArrowUpDown } from 'lucide-react';
import { Player, PlayerPosition, SquadPlayerSlot } from '../types';

interface PlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: SquadPlayerSlot | null;
  allPlayers: Player[];
  currentSlots: SquadPlayerSlot[];
  onSelectPlayer: (slotId: string, player: Player) => void;
  maxBudget?: number;
}

export const PlayerDrawer: React.FC<PlayerDrawerProps> = ({
  isOpen,
  onClose,
  targetSlot,
  allPlayers,
  currentSlots,
  onSelectPlayer,
  maxBudget = 120.0,
}) => {
  if (!isOpen || !targetSlot) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'form' | 'selected'>('price_desc');

  // Compute current spent and club counts excluding the current slot's player
  const currentSlotPlayer = targetSlot.player;
  const otherSlots = currentSlots.filter((s) => s.slotId !== targetSlot.slotId);

  const spentWithoutCurrent = otherSlots.reduce(
    (sum, s) => sum + (s.player ? s.player.price : 0),
    0
  );
  const remainingBudget = maxBudget - spentWithoutCurrent;

  const clubCounts: Record<string, number> = {};
  otherSlots.forEach((s) => {
    if (s.player) {
      clubCounts[s.player.club] = (clubCounts[s.player.club] || 0) + 1;
    }
  });

  // Unique clubs list
  const clubs = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => set.add(p.club));
    return Array.from(set).sort();
  }, [allPlayers]);

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    return allPlayers
      .filter((p) => {
        // Must match required position for this slot
        if (p.position !== targetSlot.position) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q);
          const matchClub = p.club.toLowerCase().includes(q);
          if (!matchName && !matchClub) return false;
        }

        // Club filter
        if (selectedClub !== 'all' && p.club !== selectedClub) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'form') return b.form - a.form;
        if (sortBy === 'selected') return b.selectedPercentage - a.selectedPercentage;
        return 0;
      });
  }, [allPlayers, targetSlot.position, searchQuery, selectedClub, sortBy]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0C1D16] border-l border-[#143426] h-full flex flex-col shadow-2xl text-left">
        {/* Header */}
        <div className="p-4 border-b border-[#143426] bg-[#071410] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#C9F04D] text-[#071410] uppercase font-mono">
                {targetSlot.position}
              </span>
              <h2 className="font-display text-lg font-bold text-white tracking-wide">
                Seleccionar {targetSlot.position === 'POR' ? 'Portero' : targetSlot.position === 'DEF' ? 'Defensa' : targetSlot.position === 'MED' ? 'Mediocampista' : 'Delantero'}
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Presupuesto Disponible: <strong className="text-[#C9F04D]">${remainingBudget.toFixed(1)}M USD</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#0F2319] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-3 border-b border-[#143426] space-y-2.5 bg-[#0A1813]">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o club (ej. Millonarios, Dayro, Falcao)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#54C3BB]"
            />
          </div>

          {/* Controls: Club Filter & Sort */}
          <div className="flex items-center gap-2">
            {/* Club select */}
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#1E4333] text-xs text-gray-200 focus:outline-none"
            >
              <option value="all">Todos los Clubes</option>
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#1E4333] text-xs text-gray-200 focus:outline-none"
            >
              <option value="price_desc">Mayor Precio ($)</option>
              <option value="price_asc">Menor Precio ($)</option>
              <option value="form">Mejor Estado Forma</option>
              <option value="selected">% Más Seleccionado</option>
            </select>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#143426]/50">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No se encontraron jugadores que coincidan con los filtros.</p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isSelectedHere = currentSlotPlayer?.id === player.id;
              const isAlreadyInSquad = currentSlots.some((s) => s.player?.id === player.id);
              const exceedsBudget = player.price > remainingBudget;
              const currentClubCount = clubCounts[player.club] || 0;
              const exceedsClubLimit = currentClubCount >= 3;

              const canSelect = !isAlreadyInSquad && !exceedsBudget && !exceedsClubLimit;

              return (
                <div
                  key={player.id}
                  className={`pt-2 pb-1 flex items-center justify-between gap-2 p-2 rounded-xl transition ${
                    isSelectedHere
                      ? 'bg-[#153827] border border-[#C9F04D]/40'
                      : canSelect
                      ? 'hover:bg-[#0F2319]'
                      : 'opacity-60 bg-[#071410]'
                  }`}
                >
                  {/* Avatar & Player Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#1E4333]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">
                          {player.name}
                        </span>
                        {player.isLibertadoresColombian && (
                          <span className="text-xs" title="Colombiano en Conmebol">🇨🇴</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                        <span className="text-[#54C3BB] font-semibold">{player.club}</span>
                        <span>•</span>
                        <span>Forma: {player.form}</span>
                        <span>•</span>
                        <span>{player.selectedPercentage}% DT</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="flex items-center gap-2.5">
                    <div className="text-right font-mono">
                      <span className={`block font-bold text-sm ${exceedsBudget ? 'text-[#FF7A59]' : 'text-[#E6BE55]'}`}>
                        ${player.price.toFixed(1)}M USD
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {currentClubCount}/3 club
                      </span>
                    </div>

                    {isSelectedHere ? (
                      <span className="px-3 py-1.5 rounded-xl bg-[#C9F04D] text-[#071410] font-bold text-xs font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Actual
                      </span>
                    ) : isAlreadyInSquad ? (
                      <span className="px-2.5 py-1 rounded-xl bg-[#0F2319] text-gray-400 text-xs font-mono border border-[#143426]">
                        En equipo
                      </span>
                    ) : exceedsBudget ? (
                      <span
                        className="px-2 py-1 rounded-xl bg-[#FF7A59]/20 text-[#FF7A59] text-[11px] font-mono border border-[#FF7A59]/40"
                        title="Sin presupuesto suficiente"
                      >
                        Sin fondos
                      </span>
                    ) : exceedsClubLimit ? (
                      <span
                        className="px-2 py-1 rounded-xl bg-[#FF7A59]/20 text-[#FF7A59] text-[11px] font-mono border border-[#FF7A59]/40"
                        title="Límite de 3 jugadores por club alcanzado"
                      >
                        Máx Club
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectPlayer(targetSlot.slotId, player);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#C9F04D] hover:bg-[#D5F565] text-[#071410] font-bold text-xs font-mono shadow transition cursor-pointer active:scale-95"
                      >
                        Fichar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
