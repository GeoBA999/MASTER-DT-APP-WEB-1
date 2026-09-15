import React from 'react';
import { X, CheckCircle, ShieldAlert, Award, Zap, HelpCircle } from 'lucide-react';
import { Player, CalculatedScore } from '../types';

interface ScoreBreakdownModalProps {
  player: Player | null;
  score: CalculatedScore | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  player,
  score,
  onClose,
}) => {
  if (!player || !score) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#0C1D16] border border-[#1E4333] p-5 shadow-2xl text-left max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#143426]">
          <div className="flex items-center gap-3">
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#54C3BB]"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#143426] text-[#C9F04D] uppercase font-mono">
                  {player.position}
                </span>
                <span className="text-xs text-gray-400 font-mono">{player.club}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                {player.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#0F2319] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner */}
        <div className="my-3 p-3 rounded-xl bg-gradient-to-r from-[#0F2319] to-[#153827] border border-[#1E4333] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-gray-400 block uppercase">
              Puntaje Fixture Final
            </span>
            <span className="text-xs text-[#54C3BB] font-mono">
              Multiplicador: {score.multiplierReason}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-black text-[#C9F04D]">
              {score.total}
            </span>
            <span className="text-xs font-mono text-gray-400">PTS</span>
          </div>
        </div>

        {/* Breakdown Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-[#143426]/50">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block pt-1">
            Desglose de Estadísticas Oficiales
          </span>

          {score.breakdown.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">
              Sin acciones registradas en el fixture actual.
            </p>
          ) : (
            score.breakdown.map((item, index) => {
              const isPositive = item.points > 0;
              const isNegative = item.points < 0;

              return (
                <div key={index} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-200 block">{item.category}</span>
                    <span className="text-gray-400 text-[11px]">{item.detail}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      isPositive
                        ? 'text-[#C9F04D] bg-[#C9F04D]/10'
                        : isNegative
                        ? 'text-[#FF7A59] bg-[#FF7A59]/10'
                        : 'text-gray-400'
                    }`}
                  >
                    {isPositive ? `+${item.points}` : item.points} pts
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Match Stats Summary Pill Box */}
        <div className="mt-3 pt-3 border-t border-[#143426] grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
          <div className="p-1.5 rounded-lg bg-[#071410] border border-[#143426]">
            <span className="text-gray-400 block">Minutos</span>
            <span className="text-white font-bold">{player.stats.minutesPlayed}'</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#071410] border border-[#143426]">
            <span className="text-gray-400 block">Goles</span>
            <span className="text-[#C9F04D] font-bold">{player.stats.goals}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#071410] border border-[#143426]">
            <span className="text-gray-400 block">Asist</span>
            <span className="text-[#54C3BB] font-bold">{player.stats.assists}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#071410] border border-[#143426]">
            <span className="text-gray-400 block">Rating</span>
            <span className="text-[#E6BE55] font-bold">{player.stats.matchRating}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-[#143426] hover:bg-[#1C4835] text-[#C9F04D] text-xs font-bold font-mono transition cursor-pointer"
        >
          Cerrar Desglose
        </button>
      </div>
    </div>
  );
};
