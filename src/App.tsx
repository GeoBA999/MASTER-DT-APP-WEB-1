import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Users,
  Wallet,
  Shield,
  Activity,
  Zap,
  TrendingDown,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  Formation,
  Player,
  PlayerPosition,
  SquadPlayerSlot,
  ChipType,
  CalculatedScore,
  PrivateLeague,
  TokenPackage,
  PaymentMethod,
  KYCRecord,
  AgentTransaction,
  LiveMatchEvent,
} from './types';
import {
  MOCK_PLAYERS,
  INITIAL_PRIVATE_LEAGUES,
  INITIAL_AGENT_TRANSACTIONS,
  DEFAULT_KYC_RECORD,
  FORMATION_CONFIGS,
} from './data/mockFootballData';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BudgetTrackerBar } from './components/BudgetTrackerBar';
import { PitchView } from './components/PitchView';
import { PlayerDrawer } from './components/PlayerDrawer';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { GameModesView } from './components/GameModesView';
import { LiveMatchdayView } from './components/LiveMatchdayView';
import { WalletView } from './components/WalletView';
import { AgentPortal } from './components/AgentPortal';
import { RulesView } from './components/RulesView';
import { BetaAuthModal } from './components/BetaAuthModal';
import { SquadAnalyticsDashboard } from './components/SquadAnalyticsDashboard';
import { calculatePlayerScore } from './utils/scoring';
import { UserDTProfile, TournamentCategory, SelectedLeagueInfo } from './types';
import { ApiFootballPlayer } from './utils/footballApi';
import { footballApiClient } from './services/footballApiClient';

export default function App() {
  // User Profile & Onboarding State
  const [userProfile, setUserProfile] = useState<UserDTProfile | null>(() => {
    try {
      const saved = localStorage.getItem('master_dt_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading profile', e);
    }
    return null;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('master_dt_user_profile');
    } catch {
      return true;
    }
  });
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2 | 3>(1);
  const [squadSubView, setSquadSubView] = useState<'pitch' | 'analytics'>('pitch');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setActiveTab('leagues'); // "al dar clic en registro o en login debe abrir la pestaña de ligas"
    setAuthModalMode(mode);
    setIsOnboardingOpen(true);
  };

  // Tournament Category
  const [tournament, setTournament] = useState<TournamentCategory>(() => {
    return userProfile?.selectedLeague?.category || 'LIGA_BETPLAY';
  });

  // Navigation tabs ('squad' corresponds to "Mi Once", default 'leagues' in Beta)
  const [activeTab, setActiveTab] = useState<'squad' | 'leagues' | 'rules' | 'live' | 'wallet' | 'agent'>('leagues');

  // Real player list loaded from API (with MOCK_PLAYERS as fallback)
  const [allPlayers, setAllPlayers] = useState<Player[]>(MOCK_PLAYERS);

  // Fetch real player data from API on mount
  React.useEffect(() => {
    footballApiClient
      .getAllPlayers()
      .then((apiPlayers) => {
        if (apiPlayers && apiPlayers.length > 0) {
          setAllPlayers(apiPlayers);
        }
      })
      .catch((err) => {
        console.warn('Could not load players from API, using fallback data', err);
      });
  }, []);

  // Joined leagues state (Beta Freemium defaults to Liga BetPlay Freemium Bienvenida)
  const [joinedLeagueIds, setJoinedLeagueIds] = useState<string[]>(() => {
    const ids = ['leg-freemium-betplay'];
    if (userProfile?.selectedLeague?.id && !ids.includes(userProfile.selectedLeague.id)) {
      ids.push(userProfile.selectedLeague.id);
    }
    if (userProfile?.registeredLeagues) {
      userProfile.registeredLeagues.forEach((l) => {
        if (!ids.includes(l.id)) ids.push(l.id);
      });
    }
    return ids;
  });

  // Helper to create completely blank slots
  const createBlankSquadSlots = (form: Formation): SquadPlayerSlot[] => {
    const config = FORMATION_CONFIGS[form];
    const result: SquadPlayerSlot[] = [];

    // Starters (11) - completely blank
    result.push({ slotId: 'starter-por-1', position: 'POR', isStarter: true, player: null });
    for (let i = 0; i < config.def; i++) {
      result.push({ slotId: `starter-def-${i + 1}`, position: 'DEF', isStarter: true, player: null });
    }
    for (let i = 0; i < config.med; i++) {
      result.push({ slotId: `starter-med-${i + 1}`, position: 'MED', isStarter: true, player: null });
    }
    for (let i = 0; i < config.del; i++) {
      result.push({ slotId: `starter-del-${i + 1}`, position: 'DEL', isStarter: true, player: null });
    }

    // Bench (4) - completely blank
    result.push({ slotId: 'bench-por-1', position: 'POR', isStarter: false, player: null });
    for (let i = 0; i < 5 - config.def; i++) {
      result.push({ slotId: `bench-def-${i + 1}`, position: 'DEF', isStarter: false, player: null });
    }
    for (let i = 0; i < 5 - config.med; i++) {
      result.push({ slotId: `bench-med-${i + 1}`, position: 'MED', isStarter: false, player: null });
    }
    for (let i = 0; i < 3 - config.del; i++) {
      result.push({ slotId: `bench-del-${i + 1}`, position: 'DEL', isStarter: false, player: null });
    }

    return result;
  };

  // Squad State
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [isWorstXIMode, setIsWorstXIMode] = useState<boolean>(() => {
    return userProfile?.selectedLeague?.isWorstXI || false;
  });

  // Initial Squad population - completely blank for new BETA managers
  const [slots, setSlots] = useState<SquadPlayerSlot[]>(() => {
    return createBlankSquadSlots('4-3-3');
  });

  // Re-adjust slots when formation changes while preserving players
  const handleFormationChange = (newFormation: Formation) => {
    setFormation(newFormation);
    const config = FORMATION_CONFIGS[newFormation];

    // Gather existing players by position
    const currentPOR = slots.filter((s) => s.position === 'POR').map((s) => s.player);
    const currentDEF = slots.filter((s) => s.position === 'DEF').map((s) => s.player);
    const currentMED = slots.filter((s) => s.position === 'MED').map((s) => s.player);
    const currentDEL = slots.filter((s) => s.position === 'DEL').map((s) => s.player);

    const newSlots: SquadPlayerSlot[] = [];

    // Starters
    newSlots.push({ slotId: 'starter-por-1', position: 'POR', isStarter: true, player: currentPOR[0] || null });
    for (let i = 0; i < config.def; i++) {
      newSlots.push({ slotId: `starter-def-${i + 1}`, position: 'DEF', isStarter: true, player: currentDEF[i] || null });
    }
    for (let i = 0; i < config.med; i++) {
      newSlots.push({ slotId: `starter-med-${i + 1}`, position: 'MED', isStarter: true, player: currentMED[i] || null });
    }
    for (let i = 0; i < config.del; i++) {
      newSlots.push({ slotId: `starter-del-${i + 1}`, position: 'DEL', isStarter: true, player: currentDEL[i] || null });
    }

    // Bench
    newSlots.push({ slotId: 'bench-por-1', position: 'POR', isStarter: false, player: currentPOR[1] || null });
    for (let i = 0; i < 5 - config.def; i++) {
      newSlots.push({ slotId: `bench-def-${i + 1}`, position: 'DEF', isStarter: false, player: currentDEF[config.def + i] || null });
    }
    for (let i = 0; i < 5 - config.med; i++) {
      newSlots.push({ slotId: `bench-med-${i + 1}`, position: 'MED', isStarter: false, player: currentMED[config.med + i] || null });
    }
    for (let i = 0; i < 3 - config.del; i++) {
      newSlots.push({ slotId: `bench-del-${i + 1}`, position: 'DEL', isStarter: false, player: currentDEL[config.del + i] || null });
    }

    setSlots(newSlots);
  };

  // Captains & Chips - start unassigned for blank squad
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);
  const [hiddenCaptainId, setHiddenCaptainId] = useState<string | null>(null);
  const [isHiddenCaptainActive, setIsHiddenCaptainActive] = useState<boolean>(false);
  const [activeChip, setActiveChip] = useState<ChipType>('none');

  // Modals & Drawers
  const [drawerTargetSlot, setDrawerTargetSlot] = useState<SquadPlayerSlot | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<{ player: Player; score: CalculatedScore } | null>(null);

  // User Wallet & Economy
  const [userTokens, setUserTokens] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('master_dt_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.initialTokensBonus) return parsed.initialTokensBonus;
        if (parsed.isFreemium) return 450;
      }
    } catch (e) {
      console.error(e);
    }
    return 450; // 450 tokens DT iniciales para jugar gratis en versión freemium
  });
  const [kycRecord, setKycRecord] = useState<KYCRecord>(DEFAULT_KYC_RECORD);
  const [agentTransactions, setAgentTransactions] = useState<AgentTransaction[]>(INITIAL_AGENT_TRANSACTIONS);

  // Live Match Events
  const [liveEvents, setLiveEvents] = useState<LiveMatchEvent[]>([
    {
      id: 'init-ev-1',
      minute: 74,
      fixtureId: 'fix-1',
      matchTitle: 'Millonarios vs Nacional',
      type: 'goal',
      playerId: 'p-del-1',
      playerName: 'Dayro Moreno',
      club: 'Once Caldas',
      description: '¡GOLAZO de Dayro Moreno! Definición al segundo palo.',
      pointsDelta: 4,
      timestamp: '18:42',
    },
    {
      id: 'init-ev-2',
      minute: 68,
      fixtureId: 'fix-1',
      matchTitle: 'Millonarios vs Nacional',
      type: 'penalty_saved',
      playerId: 'p-por-1',
      playerName: 'Álvaro Montero',
      club: 'Millonarios',
      description: '¡MONTERO ATAJA PENAL! Adivina la trayectoria.',
      pointsDelta: 5,
      timestamp: '18:36',
    },
  ]);

  // Handlers
  const handleSelectSlotForReplacement = (slot: SquadPlayerSlot) => {
    setDrawerTargetSlot(slot);
  };

  const handleSelectPlayerFromDrawer = (slotId: string, player: Player) => {
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, player } : s))
    );
  };

  const handleSwapSlots = (slotId1: string, slotId2: string) => {
    setSlots((prev) => {
      const s1 = prev.find((s) => s.slotId === slotId1);
      const s2 = prev.find((s) => s.slotId === slotId2);
      if (!s1 || !s2) return prev;
      return prev.map((s) => {
        if (s.slotId === slotId1) return { ...s, player: s2.player };
        if (s.slotId === slotId2) return { ...s, player: s1.player };
        return s;
      });
    });
  };

  const handleSetCaptain = (id: string) => {
    if (id === viceCaptainId) setViceCaptainId(captainId);
    setCaptainId(id);
  };

  const handleSetViceCaptain = (id: string) => {
    if (id === captainId) setCaptainId(viceCaptainId);
    setViceCaptainId(id);
  };

  const handleToggleHiddenCaptain = (id: string) => {
    if (hiddenCaptainId === id && isHiddenCaptainActive) {
      setIsHiddenCaptainActive(false);
    } else {
      setHiddenCaptainId(id);
      setIsHiddenCaptainActive(true);
    }
  };

  const handleActivateChip = (chip: ChipType) => {
    setActiveChip(chip);
  };

  const handleBuyTokens = (pkg: TokenPackage, method: PaymentMethod) => {
    const totalNew = pkg.tokens + (pkg.bonusTokens || 0);
    setUserTokens((prev) => prev + totalNew);

    const newTx: AgentTransaction = {
      id: `tx-${Date.now()}`,
      userId: 'usr-user-me',
      userName: 'Mi Usuario DT',
      userPhone: '312 849 2011',
      amountTokens: totalNew,
      amountCOP: pkg.priceCOP,
      method,
      referenceCode: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      agentId: 'agt-col-01',
      agentName: 'Agente Oficial Medellín / Bogotá',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
      notes: `Compra de paquete ${pkg.tokens} DT`,
      type: 'deposit',
    };

    setAgentTransactions([newTx, ...agentTransactions]);
    alert(`¡Compra exitosa! Se han acreditado ${totalNew} DT Tokens a tu billetera vía ${method}.`);
  };

  const handleMintAgentTokens = (newTxData: Omit<AgentTransaction, 'id' | 'timestamp'>) => {
    const fullTx: AgentTransaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (fullTx.userId === 'usr-user-me') {
      setUserTokens((prev) => prev + fullTx.amountTokens);
    }
    setAgentTransactions([fullTx, ...agentTransactions]);
  };

  const handleWithdrawalRequest = (amountTokens: number, destination: string) => {
    setUserTokens((prev) => Math.max(0, prev - amountTokens));
    const newTx: AgentTransaction = {
      id: `tx-wd-${Date.now()}`,
      userId: 'usr-user-me',
      userName: kycRecord.fullName || 'Mi Usuario DT',
      userPhone: kycRecord.phone || '312 849 2011',
      amountTokens,
      amountCOP: amountTokens,
      method: 'Nequi',
      referenceCode: `WD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      agentId: 'agt-col-01',
      agentName: 'Agente Oficial Medellín / Bogotá',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
      notes: `Retiro hacia ${destination}`,
      type: 'withdrawal',
    };
    setAgentTransactions([newTx, ...agentTransactions]);
  };

  const handleTriggerLiveEvent = (event: LiveMatchEvent) => {
    setLiveEvents((prev) => [event, ...prev]);
  };

  const handleClearSquad = () => {
    setSlots((prev) => prev.map((s) => ({ ...s, player: null })));
    setCaptainId(null);
    setViceCaptainId(null);
    setHiddenCaptainId(null);
  };

  const handleAutoFillSquad = () => {
    const config = FORMATION_CONFIGS[formation];
    const pPOR = MOCK_PLAYERS.filter((p) => p.position === 'POR');
    const pDEF = MOCK_PLAYERS.filter((p) => p.position === 'DEF');
    const pMED = MOCK_PLAYERS.filter((p) => p.position === 'MED');
    const pDEL = MOCK_PLAYERS.filter((p) => p.position === 'DEL');

    const newSlots: SquadPlayerSlot[] = [];

    // Starters
    newSlots.push({ slotId: 'starter-por-1', position: 'POR', isStarter: true, player: pPOR[0] || null });
    for (let i = 0; i < config.def; i++) {
      newSlots.push({ slotId: `starter-def-${i + 1}`, position: 'DEF', isStarter: true, player: pDEF[i] || null });
    }
    for (let i = 0; i < config.med; i++) {
      newSlots.push({ slotId: `starter-med-${i + 1}`, position: 'MED', isStarter: true, player: pMED[i] || null });
    }
    for (let i = 0; i < config.del; i++) {
      newSlots.push({ slotId: `starter-del-${i + 1}`, position: 'DEL', isStarter: true, player: pDEL[i] || null });
    }

    // Bench
    newSlots.push({ slotId: 'bench-por-1', position: 'POR', isStarter: false, player: pPOR[1] || null });
    for (let i = 0; i < 5 - config.def; i++) {
      newSlots.push({ slotId: `bench-def-${i + 1}`, position: 'DEF', isStarter: false, player: pDEF[config.def + i] || null });
    }
    for (let i = 0; i < 5 - config.med; i++) {
      newSlots.push({ slotId: `bench-med-${i + 1}`, position: 'MED', isStarter: false, player: pMED[config.med + i] || null });
    }
    for (let i = 0; i < 3 - config.del; i++) {
      newSlots.push({ slotId: `bench-del-${i + 1}`, position: 'DEL', isStarter: false, player: pDEL[config.del + i] || null });
    }

    setSlots(newSlots);
    setCaptainId(pDEL[0]?.id || null);
    setViceCaptainId(pDEL[1]?.id || null);
  };

  const handleCompleteOnboarding = (profile: UserDTProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('master_dt_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
    if (profile.initialTokensBonus) {
      setUserTokens(profile.initialTokensBonus);
    } else if (profile.isFreemium) {
      setUserTokens(10);
    }
    // Set completely blank squad for the manager
    handleClearSquad();
    setTournament(profile.selectedLeague.category);
    setIsWorstXIMode(Boolean(profile.selectedLeague.isWorstXI));
    setIsOnboardingOpen(false);
    setActiveTab('leagues'); // Direct user to "Ligas" upon login/register
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('master_dt_user_profile');
    } catch (e) {
      console.error('Error removing profile on logout', e);
    }
    setUserProfile(null);
    handleClearSquad();
    setIsOnboardingOpen(true);
  };

  const handleJoinLeagueWithSquadChoice = ({
    league,
    choice,
  }: {
    league: SelectedLeagueInfo;
    choice: 'fresh' | 'duplicate' | 'autofill';
    sourceLeagueId?: string;
  }) => {
    // 1. Add to joinedLeagueIds
    setJoinedLeagueIds((prev) => (prev.includes(league.id) ? prev : [...prev, league.id]));

    // 2. Update user profile
    setUserProfile((prev) => {
      if (!prev) return prev;
      const updatedRegistered = prev.registeredLeagues ? [...prev.registeredLeagues] : [];
      if (!updatedRegistered.some((l) => l.id === league.id)) {
        updatedRegistered.push(league);
      }
      const updated = {
        ...prev,
        selectedLeague: league,
        registeredLeagues: updatedRegistered,
      };
      try {
        localStorage.setItem('master_dt_user_profile', JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating profile with league', e);
      }
      return updated;
    });

    // 3. Update category and mode
    setTournament(league.category);
    setIsWorstXIMode(Boolean(league.isWorstXI));

    // 4. In BETA Freemium: When registering/joining the league, the team must be completely blank
    handleClearSquad();

    // 5. Deduct tokens if applicable
    if (league.entryTokens && league.entryTokens > 0) {
      setUserTokens((prev) => Math.max(0, prev - league.entryTokens));
    }

    // 6. Navigate to squad view
    setActiveTab('squad');
  };

  const handleSyncRealApiScores = (apiPlayers: ApiFootballPlayer[]) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (!slot.player) return slot;
        const currentName = slot.player.name.toLowerCase();
        // Match player by full name or last name
        const match = apiPlayers.find((ap) => {
          const apName = ap.name.toLowerCase();
          const apLastName = apName.split(' ').pop() || apName;
          const currentLastName = currentName.split(' ').pop() || currentName;
          return (
            apName === currentName ||
            currentName.includes(apLastName) ||
            apName.includes(currentLastName)
          );
        });

        if (match) {
          return {
            ...slot,
            player: {
              ...slot.player,
              stats: {
                ...slot.player.stats,
                minutesPlayed: match.stats.minutes,
                goals: match.stats.goals,
                assists: match.stats.assists,
                saves: match.stats.saves,
                yellowCards: match.stats.yellowCards,
                redCards: match.stats.redCards,
                cleanSheet: match.stats.cleanSheet,
                penaltySaves: match.stats.penaltiesSaved,
                penaltyMissed: match.stats.penaltiesMissed,
                goalsConceded: match.stats.goalsConceded,
                matchRating: match.stats.rating,
              },
            },
          };
        }
        return slot;
      })
    );
  };

  const sourceLeaguesForDuplicate = [
    {
      leagueId: userProfile?.selectedLeague?.id || 'current-league',
      leagueName: userProfile?.selectedLeague?.name || 'Mi Once Actual',
      formation,
      count: slots.filter((s) => s.player !== null).length,
      captainName: slots.find((s) => s.player?.id === captainId)?.player?.name,
    },
  ];

  return (
    <div className="min-h-screen bg-[#071410] text-gray-100 flex flex-col selection:bg-[#C9F04D] selection:text-[#071410]">
      {/* Offline Alert Bar */}
      <OfflineIndicator />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userTokens={userTokens}
        tournament={tournament}
        setTournament={setTournament}
        userProfile={userProfile}
        onOpenProfileOrOnboarding={() => {
          setOnboardingInitialStep(1);
          handleOpenAuth('login');
        }}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: PITCH VIEW & SQUAD BUILDER ("Mi Once") */}
        {activeTab === 'squad' && (
          <div className="space-y-4">
            {/* Real-Time Budget & Squad Limits Tracker */}
            <BudgetTrackerBar slots={slots} maxBudget={120.0} />

            {/* Sub-view Switcher: Tactical Pitch vs D3 Advanced Analytics */}
            <div className="flex items-center justify-between bg-[#0C1D16] border border-[#143426] p-1.5 rounded-2xl shadow-md">
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <button
                  onClick={() => setSquadSubView('pitch')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    squadSubView === 'pitch'
                      ? 'bg-[#C9F04D] text-[#071410] shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm">🏟️</span>
                  <span>Alineación Táctica</span>
                </button>
                <button
                  onClick={() => setSquadSubView('analytics')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer relative ${
                    squadSubView === 'analytics'
                      ? 'bg-[#C9F04D] text-[#071410] shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm">📊</span>
                  <span>Analítica D3 (5 Jornadas)</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#54C3BB]/25 text-[#54C3BB] border border-[#54C3BB]/40">
                    D3
                  </span>
                </button>
              </div>

              {/* Quick tip on desktop */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 pr-2">
                <span>Rendimiento histórico real</span>
              </div>
            </div>

            {squadSubView === 'pitch' ? (
              /* Tactical Pitch with Players, Formations & Chips */
              <PitchView
                formation={formation}
                setFormation={handleFormationChange}
                slots={slots}
                captainId={captainId}
                viceCaptainId={viceCaptainId}
                hiddenCaptainId={hiddenCaptainId}
                isHiddenCaptainActive={isHiddenCaptainActive}
                activeChip={activeChip}
                onSetCaptain={handleSetCaptain}
                onSetViceCaptain={handleSetViceCaptain}
                onToggleHiddenCaptain={handleToggleHiddenCaptain}
                onActivateChip={handleActivateChip}
                onSelectSlotForReplacement={handleSelectSlotForReplacement}
                onSwapSlots={handleSwapSlots}
                onOpenAnalytics={() => setSquadSubView('analytics')}
                onInspectPlayer={(player, score) => setInspectedPlayer({ player, score })}
                isWorstXIMode={isWorstXIMode}
                userProfile={userProfile}
                onOpenOnboarding={() => {
                  setOnboardingInitialStep(3); // direct to change league/DT
                  setIsOnboardingOpen(true);
                }}
                onClearSquad={handleClearSquad}
                onAutoFillSquad={handleAutoFillSquad}
              />
            ) : (
              /* D3 Advanced Historical Analytics Dashboard */
              <SquadAnalyticsDashboard
                slots={slots}
                onInspectPlayer={(player, score) => setInspectedPlayer({ player, score })}
                onNavigateToBuilder={() => setSquadSubView('pitch')}
              />
            )}
          </div>
        )}

        {/* TAB 2: GAME MODES & PRIVATE LEAGUES */}
        {activeTab === 'leagues' && (
          <GameModesView
            userTokens={userTokens}
            joinedLeagueIds={joinedLeagueIds}
            registeredLeagues={userProfile?.registeredLeagues || []}
            onJoinLeagueWithSquadChoice={handleJoinLeagueWithSquadChoice}
            onJoinLeague={(league: any) => {
              handleJoinLeagueWithSquadChoice({
                league: {
                  id: league.id || 'league-default',
                  name: league.name || 'Liga Privada',
                  category: league.tournament || 'LIGA_BETPLAY',
                  description: league.fixtureName || '',
                  prizePoolCOP: league.prizePoolCOP || 0,
                  entryTokens: league.entryTokens || Math.max(1, Math.round((league.buyInCOP || 0) / 1000)),
                  entryFeeCOP: league.buyInCOP || 0,
                  deadlineText: 'Cierre antes del primer partido',
                  badge: '🇨🇴',
                  tag: `NIVEL ${league.level || 1}`,
                  isWorstXI: false,
                },
                choice: 'duplicate',
              });
            }}
            onGoToLeagueSquad={(leagueId) => {
              const target = userProfile?.registeredLeagues?.find((l) => l.id === leagueId);
              if (target) {
                setTournament(target.category);
                setIsWorstXIMode(Boolean(target.isWorstXI));
              }
              setActiveTab('squad');
            }}
            onSelectWorstXIMode={() => {
              setIsWorstXIMode(!isWorstXIMode);
              setActiveTab('squad');
            }}
            isWorstXIModeActive={isWorstXIMode}
            sourceLeaguesForDuplicate={sourceLeaguesForDuplicate}
          />
        )}

        {/* TAB: REGLAMENTO & TABLA DE PUNTOS OFICIAL */}
        {activeTab === 'rules' && <RulesView />}

        {/* TAB 3: LIVE MATCHDAY SIMULATOR */}
        {activeTab === 'live' && (
          <LiveMatchdayView
            userTeamName={userProfile?.teamName || "Verde & Oro DT"}
            players={slots.map((s) => s.player).filter((p): p is Player => p !== null)}
            captainId={captainId}
            viceCaptainId={viceCaptainId}
            onTriggerEvent={handleTriggerLiveEvent}
            recentEvents={liveEvents}
            onInspectPlayer={(player, score) => setInspectedPlayer({ player, score })}
            onSyncRealApiScores={handleSyncRealApiScores}
          />
        )}

        {/* TAB 4: WALLET & DEFERRED KYC */}
        {activeTab === 'wallet' && (
          <WalletView
            userTokens={userTokens}
            onBuyTokens={handleBuyTokens}
            kycRecord={kycRecord}
            onUpdateKYC={(updated) => {
              setKycRecord((prev) => ({ ...prev, ...updated }));
              alert('Datos KYC actualizados y validados correctamente.');
            }}
            onRequestWithdrawal={handleWithdrawalRequest}
          />
        )}

        {/* TAB 5: AGENT PORTAL & AUDIT LOG */}
        {activeTab === 'agent' && (
          <AgentPortal
            transactions={agentTransactions}
            onMintTokens={handleMintAgentTokens}
            kycRecord={kycRecord}
            onApproveKYC={() => {
              setKycRecord((prev) => ({ ...prev, status: 'verified' }));
              alert('Solicitud KYC aprobada exitosamente por el Agente.');
            }}
            onRejectKYC={(reason) => {
              setKycRecord((prev) => ({ ...prev, status: 'rejected' }));
              alert(`Solicitud KYC rechazada: ${reason}`);
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#143426] bg-[#071410] py-4 px-4 text-center text-xs font-mono text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white tracking-wider">MASTER DT</span>
            <span>• Daily Fantasy Football Colombia (Liga BetPlay & Conmebol)</span>
          </div>
          <div className="text-gray-400 text-[11px]">
            Modelo de Red de Agentes & Token Economy ClubGG • Juego de Destreza
          </div>
        </div>
      </footer>

      {/* DRAWERS & MODALS */}
      <PlayerDrawer
        isOpen={Boolean(drawerTargetSlot)}
        onClose={() => setDrawerTargetSlot(null)}
        targetSlot={drawerTargetSlot}
        allPlayers={allPlayers}
        currentSlots={slots}
        onSelectPlayer={handleSelectPlayerFromDrawer}
        maxBudget={120.0}
      />

      <ScoreBreakdownModal
        player={inspectedPlayer?.player || null}
        score={inspectedPlayer?.score || null}
        onClose={() => setInspectedPlayer(null)}
      />

      {/* BETA AUTH MODAL: Login sencillo y Registro con Nombre, Correo y Clave */}
      <BetaAuthModal
        key={authModalMode}
        isOpen={isOnboardingOpen}
        initialMode={authModalMode}
        onClose={userProfile ? () => setIsOnboardingOpen(false) : undefined}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
