import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, DollarSign, Users } from 'lucide-react';
import { SquadPlayerSlot } from '../types';

interface BudgetTrackerBarProps {
  slots: SquadPlayerSlot[];
  maxBudget?: number; // 100M COP default
}

export const BudgetTrackerBar: React.FC<BudgetTrackerBarProps> = ({
  slots,
  maxBudget = 100.0,
}) => {
  // Calculate total spent
  const filledSlots = slots.filter((s) => s.player !== null);
  const totalSpent = slots.reduce((sum, s) => sum + (s.player ? s.player.price : 0), 0);
  const remainingBudget = maxBudget - totalSpent;
  const emptySlotsCount = slots.length - filledSlots.length;
  const avgPerEmptySlot = emptySlotsCount > 0 ? remainingBudget / emptySlotsCount : 0;

  const isOverBudget = remainingBudget < -0.01;

  // Club limits: Max 3 players per real club
  const clubCounts: Record<string, number> = {};
  slots.forEach((s) => {
    if (s.player) {
      clubCounts[s.player.club] = (clubCounts[s.player.club] || 0) + 1;
    }
  });

  const clubViolations = Object.entries(clubCounts).filter(([_, count]) => count > 3);
  const hasClubViolation = clubViolations.length > 0;

  const percentageSpent = Math.min(100, Math.max(0, (totalSpent / maxBudget) * 100));

  return (
    <div className="bg-[#0C1D16] border border-[#143426] rounded-2xl p-3.5 sm:p-4 shadow-lg mb-4">
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        {/* Budget stats */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[11px] font-mono text-gray-400 block uppercase tracking-wider">
              Presupuesto Restante
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                  isOverBudget ? 'text-[#FF7A59]' : 'text-[#C9F04D]'
                }`}
              >
                ${remainingBudget.toFixed(1)}M
              </span>
              <span className="text-xs text-gray-400 font-mono">
                / ${maxBudget.toFixed(1)}M COP
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-[#143426]" />

          <div className="hidden sm:block">
            <span className="text-[11px] font-mono text-gray-400 block uppercase tracking-wider">
              Gastado
            </span>
            <span className="font-mono text-base font-semibold text-white">
              ${totalSpent.toFixed(1)}M COP
            </span>
          </div>

          {emptySlotsCount > 0 && (
            <div className="hidden md:block">
              <span className="text-[11px] font-mono text-gray-400 block uppercase tracking-wider">
                Prom. por cupo libre
              </span>
              <span className="font-mono text-base font-semibold text-[#54C3BB]">
                ${avgPerEmptySlot > 0 ? avgPerEmptySlot.toFixed(1) : '0.0'}M
              </span>
            </div>
          )}
        </div>

        {/* Squad Count & Club limit status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#143426] text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-[#54C3BB]" />
            <span className="text-gray-300">Plantilla:</span>
            <span className={`font-bold ${filledSlots.length === 15 ? 'text-[#C9F04D]' : 'text-[#E6BE55]'}`}>
              {filledSlots.length}/15
            </span>
          </div>

          {hasClubViolation ? (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FF7A59]/20 border border-[#FF7A59] text-xs text-[#FF7A59] font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>&gt;3 por club</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#7AC492]/15 border border-[#7AC492]/30 text-xs text-[#7AC492]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Máx 3/club OK</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#071410] h-2.5 rounded-full overflow-hidden border border-[#143426] relative">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isOverBudget
              ? 'bg-[#FF7A59]'
              : percentageSpent > 90
              ? 'bg-gradient-to-r from-[#54C3BB] to-[#C9F04D]'
              : 'bg-[#54C3BB]'
          }`}
          style={{ width: `${Math.min(100, percentageSpent)}%` }}
        />
      </div>

      {/* Warnings & Active Club counts pill row */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {isOverBudget ? (
          <div className="flex items-center gap-1.5 text-[#FF7A59] font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Presupuesto excedido por ${(Math.abs(remainingBudget)).toFixed(1)}M COP. Vende jugadores para validar tu alineación.</span>
          </div>
        ) : hasClubViolation ? (
          <div className="flex items-center gap-1.5 text-[#FF7A59] font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Límite superado: {clubViolations.map(([c, count]) => `${c} (${count})`).join(', ')}. Máximo 3 por club.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7AC492]" />
            <span>Reglas vigentes: 100M COP máx, 15 jugadores (11 titulares + 4 suplentes).</span>
          </div>
        )}

        {/* Club breakdown pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
          {Object.entries(clubCounts).map(([club, count]) => (
            <span
              key={club}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                count > 3
                  ? 'bg-[#FF7A59] text-[#071410] font-bold animate-bounce'
                  : count === 3
                  ? 'bg-[#E6BE55]/20 text-[#E6BE55] border border-[#E6BE55]/40'
                  : 'bg-[#0F2319] text-gray-400 border border-[#143426]'
              }`}
              title={`${club}: ${count}/3 jugadores`}
            >
              {club.split(' ')[0]}: {count}/3
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
