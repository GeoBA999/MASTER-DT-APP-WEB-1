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
import { OnboardingFlow } from './components/OnboardingFlow';
import { calculatePlayerScore } from './utils/scoring';
import { UserDTProfile, TournamentCategory, SelectedLeagueInfo } from './types';

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
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2 | 3>(1);

  // Tournament Category
  const [tournament, setTournament] = useState<TournamentCategory>(() => {
    return userProfile?.selectedLeague?.category || 'LIGA_BETPLAY';
  });

  // Navigation tabs ('squad' corresponds to "Mi Once")
  const [activeTab, setActiveTab] = useState<'squad' | 'leagues' | 'rules' | 'live' | 'wallet' | 'agent'>('squad');

  // Joined leagues state
  const [joinedLeagueIds, setJoinedLeagueIds] = useState<string[]>(() => {
    const ids = ['leg-1'];
    if (userProfile?.selectedLeague?.id) {
      ids.push(userProfile.selectedLeague.id);
    }
    if (userProfile?.registeredLeagues) {
      userProfile.registeredLeagues.forEach((l) => {
        if (!ids.includes(l.id)) ids.push(l.id);
      });
    }
    return ids;
  });

  // Squad State
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [isWorstXIMode, setIsWorstXIMode] = useState<boolean>(() => {
    return userProfile?.selectedLeague?.isWorstXI || false;
  });

  // Initial Squad population
  const [slots, setSlots] = useState<SquadPlayerSlot[]>(() => {
    const config = FORMATION_CONFIGS['4-3-3'];
    const pPOR = MOCK_PLAYERS.filter((p) => p.position === 'POR');
    const pDEF = MOCK_PLAYERS.filter((p) => p.position === 'DEF');
    const pMED = MOCK_PLAYERS.filter((p) => p.position === 'MED');
    const pDEL = MOCK_PLAYERS.filter((p) => p.position === 'DEL');

    const result: SquadPlayerSlot[] = [];

    // Starters
    result.push({ slotId: 'starter-por-1', position: 'POR', isStarter: true, player: pPOR[0] || null });
    for (let i = 0; i < config.def; i++) {
      result.push({ slotId: `starter-def-${i + 1}`, position: 'DEF', isStarter: true, player: pDEF[i] || null });
    }
    for (let i = 0; i < config.med; i++) {
      result.push({ slotId: `starter-med-${i + 1}`, position: 'MED', isStarter: true, player: pMED[i] || null });
    }
    for (let i = 0; i < config.del; i++) {
      result.push({ slotId: `starter-del-${i + 1}`, position: 'DEL', isStarter: true, player: pDEL[i] || null });
    }

    // Bench
    result.push({ slotId: 'bench-por-1', position: 'POR', isStarter: false, player: pPOR[1] || null });
    for (let i = 0; i < 5 - config.def; i++) {
      result.push({ slotId: `bench-def-${i + 1}`, position: 'DEF', isStarter: false, player: pDEF[config.def + i] || null });
    }
    for (let i = 0; i < 5 - config.med; i++) {
      result.push({ slotId: `bench-med-${i + 1}`, position: 'MED', isStarter: false, player: pMED[config.med + i] || null });
    }
    for (let i = 0; i < 3 - config.del; i++) {
      result.push({ slotId: `bench-del-${i + 1}`, position: 'DEL', isStarter: false, player: pDEL[config.del + i] || null });
    }

    return result;
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

  // Captains & Chips
  const [captainId, setCaptainId] = useState<string | null>('p-del-1'); // Dayro Moreno default
  const [viceCaptainId, setViceCaptainId] = useState<string | null>('p-del-2'); // Falcao
  const [hiddenCaptainId, setHiddenCaptainId] = useState<string | null>('p-med-1'); // Mackalister
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
      amountCOP: amountTokens * 1000,
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
      setUserTokens((prev) => Math.max(prev, profile.initialTokensBonus!));
    } else if (profile.isFreemium) {
      setUserTokens((prev) => Math.max(prev, 450));
    }
    setTournament(profile.selectedLeague.category);
    setIsWorstXIMode(Boolean(profile.selectedLeague.isWorstXI));
    setIsOnboardingOpen(false);
    setActiveTab('squad'); // Direct user to "Mi Once"
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

    // 4. Apply squad choice
    if (choice === 'fresh') {
      handleClearSquad();
    } else if (choice === 'autofill') {
      handleAutoFillSquad();
    }
    // if 'duplicate', keep current slots

    // 5. Deduct tokens if applicable
    if (league.entryTokens && league.entryTokens > 0) {
      setUserTokens((prev) => Math.max(0, prev - league.entryTokens));
    }

    // 6. Navigate to squad view
    setActiveTab('squad');
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
          setIsOnboardingOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: PITCH VIEW & SQUAD BUILDER ("Mi Once") */}
        {activeTab === 'squad' && (
          <div className="space-y-4">
            {/* Real-Time Budget & Squad Limits Tracker */}
            <BudgetTrackerBar slots={slots} maxBudget={100.0} />

            {/* Tactical Pitch with Players, Formations & Chips */}
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
        allPlayers={MOCK_PLAYERS}
        currentSlots={slots}
        onSelectPlayer={handleSelectPlayerFromDrawer}
        maxBudget={100.0}
      />

      <ScoreBreakdownModal
        player={inspectedPlayer?.player || null}
        score={inspectedPlayer?.score || null}
        onClose={() => setInspectedPlayer(null)}
      />

      {/* ONBOARDING FLOW: 1. Login -> 2. Nombre DT/Equipo -> 3. Elegir Liga -> 4. Seleccionar Equipo */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={userProfile ? () => setIsOnboardingOpen(false) : undefined}
        currentProfile={userProfile}
        initialStep={onboardingInitialStep}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
