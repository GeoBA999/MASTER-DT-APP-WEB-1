import React from 'react';
import { Shield, Coins, Users, Trophy, Radio, Wallet, Clock, Sparkles, User, ChevronDown, BookOpen, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { TournamentCategory, UserDTProfile } from '../types';

interface HeaderProps {
  activeTab: 'squad' | 'leagues' | 'rules' | 'live' | 'wallet' | 'agent';
  setActiveTab: (tab: 'squad' | 'leagues' | 'rules' | 'live' | 'wallet' | 'agent') => void;
  userTokens: number;
  tournament: TournamentCategory;
  setTournament: (t: TournamentCategory) => void;
  userProfile: UserDTProfile | null;
  onOpenProfileOrOnboarding: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onOpenQuickDeposit?: () => void;
  liveMatchCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userTokens,
  tournament,
  setTournament,
  userProfile,
  onOpenProfileOrOnboarding,
  onOpenAuth,
  onOpenQuickDeposit,
  liveMatchCount = 3,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#071410]/95 backdrop-blur-md border-b border-[#143426]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#0F2319] to-[#071410] border border-[#E6BE55] flex items-center justify-center shadow-lg shadow-[#071410] shrink-0">
            <span className="font-display font-black text-lg sm:text-xl text-[#E6BE55] tracking-tighter">DT</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base sm:text-xl md:text-2xl font-black tracking-wide sm:tracking-wider text-white uppercase leading-none whitespace-nowrap">
                MASTER <span className="text-[#C9F04D]">DT</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-400 font-mono whitespace-nowrap">
              <span className="flex items-center gap-1 text-[#54C3BB]">
                <Clock className="w-3 h-3" /> Cierre: 02h 45m
              </span>
              <span className="text-gray-600 hidden xs:inline">•</span>
              <span className="text-gray-300 hidden md:inline">
                {userProfile?.selectedLeague?.name || 'Fecha 10 BetPlay'}
              </span>
            </div>
          </div>
        </div>

        {/* DT User Profile Pill / Login Trigger */}
        <div className="flex items-center gap-2">
          {userProfile?.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfileOrOnboarding}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0C1D16] border border-[#1E4333] hover:border-[#C9F04D] transition shadow-sm cursor-pointer group"
                title="Ver perfil de DT y cambiar de liga"
              >
                <span className="text-lg leading-none">{userProfile.shieldBadge || '🦁'}</span>
                <div className="text-left hidden xs:block sm:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white group-hover:text-[#C9F04D] transition truncate max-w-[110px] sm:max-w-[150px] leading-tight block">
                      {userProfile.teamName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono block leading-tight">
                    {userProfile.managerName}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-white transition" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#1a0f12] border border-red-900/40 hover:border-red-500 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition text-xs font-mono cursor-pointer"
                  title="Cerrar sesión para entrar con otro usuario"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('login');
                  else onOpenProfileOrOnboarding();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0F2319] hover:bg-[#153827] text-gray-200 hover:text-white border border-[#1E4333] hover:border-[#54C3BB] text-xs font-mono font-bold transition shadow-sm cursor-pointer"
                title="Iniciar sesión en tu cuenta DT"
              >
                <User className="w-3.5 h-3.5 text-[#54C3BB]" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('register');
                  else onOpenProfileOrOnboarding();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-bold text-xs tracking-wide transition shadow cursor-pointer font-mono"
                title="Crear cuenta nueva y abrir ligas"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Registro</span>
              </button>
            </div>
          )}

          {/* Tokens Pill */}
          <button
            onClick={onOpenQuickDeposit || (() => setActiveTab('wallet'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#E6BE55]/40 hover:border-[#E6BE55] transition shadow-sm group cursor-pointer"
            title="Ver billetera de tokens y recargas"
          >
            <Coins className="w-4 h-4 text-[#E6BE55] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block text-xs font-mono font-bold text-[#E6BE55] leading-none whitespace-nowrap">
                {userTokens.toLocaleString('es-CO')} $DT
              </span>
              <span className="block text-[9px] text-gray-400 font-mono whitespace-nowrap">
                Tokens DT
              </span>
            </div>
            <span className="ml-1 w-4 h-4 rounded-full bg-[#E6BE55] text-[#071410] flex items-center justify-center font-bold text-xs leading-none">
              +
            </span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>

      {/* Main Navigation Bar - 2 lines on mobile, single flex line on desktop */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 py-1.5 border-t border-[#143426]/60">
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-start gap-1.5 sm:gap-2">
          {/* Row 1, Col 1 on mobile */}
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'squad'
                ? 'bg-[#143426] text-[#C9F04D] border border-[#C9F04D]/60 shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#0C1D16] border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Mi Once</span>
          </button>

          {/* Row 1, Col 2 on mobile */}
          <button
            onClick={() => setActiveTab('leagues')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'leagues'
                ? 'bg-[#143426] text-[#E6BE55] border border-[#E6BE55]/60 shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#0C1D16] border border-transparent'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Ligas & Modos</span>
          </button>

          {/* Row 1, Col 3 on mobile */}
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#143426] text-[#C9F04D] border border-[#C9F04D]/60 shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#0C1D16] border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Reglamento</span>
          </button>

          {/* Row 2, Col 1 on mobile */}
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#143426] text-[#54C3BB] border border-[#54C3BB]/60 shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#0C1D16] border border-transparent'
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F04D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9F04D]"></span>
            </span>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">En Vivo</span>
            {liveMatchCount > 0 && (
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/40">
                {liveMatchCount}
              </span>
            )}
          </button>

          {/* Row 2, Col 2 on mobile */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-[#143426] text-[#E6BE55] border border-[#E6BE55]/60 shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#0C1D16] border border-transparent'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Billetera</span>
          </button>

          {/* Row 2, Col 3 on mobile: Agentes (Desactivado en BETA Freemium) */}
          <button
            disabled={true}
            title="Pestaña de agentes desactivada en esta prueba BETA Freemium"
            className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-500 bg-[#071410]/60 border border-[#143426]/40 cursor-not-allowed opacity-60"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-500" />
            <span className="truncate">Agentes</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">BETA</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
