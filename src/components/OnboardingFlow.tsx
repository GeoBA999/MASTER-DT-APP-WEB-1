import React, { useState } from 'react';
import {
  Shield,
  Trophy,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Sparkles,
  Flame,
  Star,
  Zap,
  TrendingDown,
  X,
  ChevronRight,
  Users,
  Briefcase,
  Gift,
} from 'lucide-react';
import { TournamentCategory, SelectedLeagueInfo, UserDTProfile } from '../types';

export const AVAILABLE_LEAGUES: SelectedLeagueInfo[] = [
  {
    id: 'leg-freemium-betplay',
    name: 'Liga BetPlay Freemium Bienvenida',
    category: 'LIGA_BETPLAY',
    description: '¡Entrada con tus 10 Tokens DT de regalo de bienvenida! Juega gratis por 500 $DT garantizados.',
    prizePoolCOP: 500000,
    entryTokens: 10,
    entryFeeCOP: 10000,
    deadlineText: 'Cierre en 02h 45m',
    badge: '🎁',
    tag: 'FREEMIUM REGALO',
    isWorstXI: false,
  },
  {
    id: 'league-betplay-10',
    name: 'Duelos Cafeteros BetPlay Pro',
    category: 'LIGA_BETPLAY',
    description: 'Torneo Oficial del Fútbol Colombiano • Fecha 10 Dimayor. Rake oficial 9%.',
    prizePoolCOP: 2500000,
    entryTokens: 50,
    entryFeeCOP: 50000,
    deadlineText: 'Cierre en 02h 45m',
    badge: '🇨🇴',
    tag: 'OFICIAL FPC',
    isWorstXI: false,
  },
  {
    id: 'league-libertadores',
    name: 'Gladiadores de América Libertadores',
    category: 'LIBERTADORES',
    description: 'Fase de Grupos • Multiplicador Regional 1.5x a futbolistas colombianos. Rake 9%.',
    prizePoolCOP: 2400000,
    entryTokens: 40,
    entryFeeCOP: 40000,
    deadlineText: 'Cierre hoy 19:30',
    badge: '🏆',
    tag: 'CONTINENTAL',
    isWorstXI: false,
  },
  {
    id: 'league-suramericana',
    name: 'Orgullo Conmebol Gran Suramericana',
    category: 'SURAMERICANA',
    description: 'Fase Preliminar • La otra mitad de la gloria sudamericana. Rake 9%.',
    prizePoolCOP: 1200000,
    entryTokens: 20,
    entryFeeCOP: 20000,
    deadlineText: 'Cierre mañana 18:00',
    badge: '🌎',
    tag: 'SUDAMÉRICA',
    isWorstXI: false,
  },
  {
    id: 'league-champions',
    name: 'Noches Mágicas UEFA Champions',
    category: 'CHAMPIONS',
    description: 'Fase de Liga UEFA • Los mejores clubes del mundo en acción. Rake 9%.',
    prizePoolCOP: 3500000,
    entryTokens: 50,
    entryFeeCOP: 50000,
    deadlineText: 'Cierre Martes 14:00',
    badge: '⭐',
    tag: 'ELITE EUROPEA',
    isWorstXI: false,
  },
  {
    id: 'league-laliga',
    name: 'Furia Ibérica LaLiga Stars',
    category: 'LALIGA',
    description: 'Jornada Española • Real Madrid, Barcelona, Atlético y más. Rake 9%.',
    prizePoolCOP: 1500000,
    entryTokens: 25,
    entryFeeCOP: 25000,
    deadlineText: 'Cierre Sábado 09:00',
    badge: '🇪🇸',
    tag: 'ESPAÑA',
    isWorstXI: false,
  },
  {
    id: 'league-premier',
    name: 'Batalla de Titanes Premier League',
    category: 'PREMIER_LEAGUE',
    description: 'El fútbol más rápido y disputado de Europa. Rake 9%.',
    prizePoolCOP: 1800000,
    entryTokens: 30,
    entryFeeCOP: 30000,
    deadlineText: 'Cierre Sábado 06:30',
    badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tag: 'PREMIER',
    isWorstXI: false,
  },
  {
    id: 'league-calcio',
    name: 'Derby Della Madonnina Serie A Calcio',
    category: 'CALCIO',
    description: 'Táctica, rigor defensivo y delanteros implacables. Rake 9%.',
    prizePoolCOP: 1600000,
    entryTokens: 25,
    entryFeeCOP: 25000,
    deadlineText: 'Cierre Domingo 08:00',
    badge: '🇮🇹',
    tag: 'CALCIO',
    isWorstXI: false,
  },
  {
    id: 'league-bundesliga',
    name: 'Muralla Teutónica Bundesliga Máster',
    category: 'BUNDESLIGA',
    description: 'Goles por doquier y estadios colmados en Alemania. Rake 9%.',
    prizePoolCOP: 1400000,
    entryTokens: 20,
    entryFeeCOP: 20000,
    deadlineText: 'Cierre Sábado 08:30',
    badge: '🇩🇪',
    tag: 'ALEMANIA',
    isWorstXI: false,
  },
  {
    id: 'league-peor-once',
    name: 'El Peor Once (Anti-Fantasy)',
    category: 'LIGA_BETPLAY',
    description: '¡Gana el DT con MENOS puntos! Solo titulares confirmados (Regla Anti-Exploit).',
    prizePoolCOP: 400000,
    entryTokens: 10,
    entryFeeCOP: 10000,
    deadlineText: 'Cierre en 02h 45m',
    badge: '📉',
    tag: 'MODO INVERSO',
    isWorstXI: true,
  },
];

const SHIELD_OPTIONS = [
  { id: 'shield-lion', label: 'León', icon: '🦁', color: 'from-amber-600 to-red-800' },
  { id: 'shield-eagle', label: 'Águila', icon: '🦅', color: 'from-blue-600 to-indigo-900' },
  { id: 'shield-tiger', label: 'Tigre', icon: '🐅', color: 'from-yellow-500 to-amber-800' },
  { id: 'shield-shark', label: 'Tiburón', icon: '🦈', color: 'from-red-600 to-blue-900' },
  { id: 'shield-chiguiro', label: 'Chigüiro', icon: '⚡', color: 'from-emerald-600 to-[#071410]' },
  { id: 'shield-crown', label: 'Corona', icon: '👑', color: 'from-[#E6BE55] to-amber-700' },
];

const COLOR_OPTIONS = [
  { id: 'c-green-gold', name: 'Verde & Oro', primary: '#0F3822', secondary: '#C9F04D' },
  { id: 'c-blue-white', name: 'Azul & Blanco', primary: '#0A2540', secondary: '#54C3BB' },
  { id: 'c-red-white', name: 'Rojo & Blanco', primary: '#4A0E17', secondary: '#FF7A59' },
  { id: 'c-gold-black', name: 'Dorado & Negro', primary: '#1A180E', secondary: '#E6BE55' },
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose?: () => void;
  currentProfile: UserDTProfile | null;
  onComplete: (profile: UserDTProfile) => void;
  initialStep?: 1 | 2 | 3;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onComplete,
  initialStep = 1,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);

  // Profile Role: Player vs Agent
  const [userRole, setUserRole] = useState<'player' | 'agent'>(currentProfile?.role || 'player');
  const [isFreemium, setIsFreemium] = useState<boolean>(currentProfile?.isFreemium ?? true);

  // Step 1: Login
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>(
    currentProfile?.phoneOrEmail || '312 849 2011'
  );
  const [securityPin, setSecurityPin] = useState<string>('1234');
  const [agentId, setAgentId] = useState<string>(currentProfile?.agentId || 'AGT-7701-COL');
  const [agentPassword, setAgentPassword] = useState<string>('MasterDT@2026');
  const [authError, setAuthError] = useState<string>('');

  // Step 2: DT & Team Name
  const [managerName, setManagerName] = useState<string>(
    currentProfile?.managerName || 'Profe Geovanny'
  );
  const [teamName, setTeamName] = useState<string>(
    currentProfile?.teamName || 'Millos Galácticos DT'
  );
  const [selectedShield, setSelectedShield] = useState<string>(
    currentProfile?.shieldBadge || '🦁'
  );
  const [selectedColors, setSelectedColors] = useState<{ primary: string; secondary: string }>(
    currentProfile?.teamColors || { primary: '#0F3822', secondary: '#C9F04D' }
  );
  const [profileError, setProfileError] = useState<string>('');

  // Step 3: Selected League
  const [selectedLeague, setSelectedLeague] = useState<SelectedLeagueInfo>(() => {
    if (currentProfile?.selectedLeague && currentProfile.selectedLeague.id) {
      return currentProfile.selectedLeague;
    }
    return AVAILABLE_LEAGUES[0];
  });

  if (!isOpen) return null;

  const handleQuickDemoPlayerLogin = () => {
    setUserRole('player');
    setPhoneOrEmail('igeovab@gmail.com');
    setSecurityPin('2026');
    setManagerName('DT Geovanny');
    setTeamName('Chigüiro Power FC');
    setAuthError('');
    setStep(2);
  };

  const handleFreemiumLogin = () => {
    setUserRole('player');
    setIsFreemium(true);
    setPhoneOrEmail('jugador.freemium@masterdt.co');
    setSecurityPin('2026');
    setManagerName('DT Crack');
    setTeamName('Fútbol Total DT');
    setAuthError('');
    setStep(2);
  };

  const handleQuickDemoAgentLogin = () => {
    setUserRole('agent');
    const agentProfile: UserDTProfile = {
      isLoggedIn: true,
      role: 'agent',
      phoneOrEmail: 'agente.bogota@masterdt.co',
      agentId: 'AGT-7701-COL',
      managerName: 'Carlos Pardo (Agente Bogotá)',
      teamName: 'Agencia Master DT #7701',
      avatarIcon: '💼',
      shieldBadge: '💼',
      teamColors: { primary: '#143426', secondary: '#7AC492' },
      selectedLeague: AVAILABLE_LEAGUES[0],
      registeredLeagues: [AVAILABLE_LEAGUES[0]],
      createdAt: new Date().toISOString(),
    };
    onComplete(agentProfile);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'agent') {
      if (!agentId.trim()) {
        setAuthError('Por favor ingresa tu ID de Agente o Usuario.');
        return;
      }
      if (!agentPassword.trim() || agentPassword.length < 4) {
        setAuthError('La clave de Agente debe tener al menos 4 caracteres.');
        return;
      }
      setAuthError('');
      // Log in directly as agent
      const agentProfile: UserDTProfile = {
        isLoggedIn: true,
        role: 'agent',
        phoneOrEmail: agentId.trim(),
        agentId: agentId.trim(),
        managerName: `Agente ${agentId.trim()}`,
        teamName: `Caja Agente ${agentId.trim()}`,
        avatarIcon: '💼',
        shieldBadge: '💼',
        teamColors: { primary: '#143426', secondary: '#7AC492' },
        selectedLeague: AVAILABLE_LEAGUES[0],
        registeredLeagues: [AVAILABLE_LEAGUES[0]],
        createdAt: new Date().toISOString(),
      };
      onComplete(agentProfile);
      return;
    }

    // Player validation
    if (!phoneOrEmail.trim()) {
      setAuthError('Por favor ingresa tu celular o correo.');
      return;
    }
    if (!securityPin.trim() || securityPin.length < 4) {
      setAuthError('El PIN o clave debe tener al menos 4 dígitos.');
      return;
    }
    setAuthError('');
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim()) {
      setProfileError('Ingresa el nombre o apodo del Director Técnico.');
      return;
    }
    if (!teamName.trim()) {
      setProfileError('Ingresa un nombre para tu equipo de fantasía.');
      return;
    }
    setProfileError('');
    setStep(3);
  };

  const handleStep3Confirm = () => {
    const finalProfile: UserDTProfile = {
      isLoggedIn: true,
      role: 'player',
      phoneOrEmail,
      managerName: managerName.trim(),
      teamName: teamName.trim(),
      avatarIcon: selectedShield,
      shieldBadge: selectedShield,
      teamColors: selectedColors,
      selectedLeague,
      registeredLeagues: currentProfile?.registeredLeagues || [selectedLeague],
      isFreemium,
      initialTokensBonus: isFreemium ? 450 : undefined,
      createdAt: new Date().toISOString(),
    };

    onComplete(finalProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-[#0C1D16] border-2 border-[#1E4333] shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-[#071410] px-5 py-4 border-b border-[#143426] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F2319] border border-[#E6BE55] flex items-center justify-center">
              <span className="font-display font-black text-sm text-[#E6BE55]">DT</span>
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black tracking-wide text-white uppercase leading-none whitespace-nowrap">
                MASTER <span className="text-[#C9F04D]">DT</span>
              </h2>
              <span className="text-[10px] text-gray-400 font-mono">
                Paso a Paso de Configuración de Franquicia
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0F2319] hover:bg-[#143426] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="bg-[#091812] px-6 py-3 border-b border-[#143426]/70">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className={step >= 1 ? 'text-[#C9F04D] font-bold' : 'text-gray-500'}>
              1. Login de Usuario
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className={step >= 2 ? 'text-[#C9F04D] font-bold' : 'text-gray-500'}>
              2. Nombre DT & Equipo
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className={step >= 3 ? 'text-[#C9F04D] font-bold' : 'text-gray-500'}>
              3. Elegir Liga
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-500">4. Mi Once</span>
          </div>

          <div className="w-full bg-[#143426] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#54C3BB] via-[#C9F04D] to-[#E6BE55] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* ================= STEP 1: USER & ROLE LOGIN ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30 uppercase tracking-wide">
                  Paso 1 de 3 • Acceso al Sistema
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                  Selecciona tu Perfil e Ingresa
                </h3>
                <p className="text-xs text-gray-400">
                  Elige si deseas ingresar como <strong>Jugador DT</strong> (para armar tus onces y ganar premios) o como <strong>Agente Autorizado</strong> (para gestión de saldos y caja).
                </p>
              </div>

              {/* Profile / Role Selector */}
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-[#071410] border border-[#143426]">
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('player');
                    setAuthError('');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center sm:items-start text-left transition cursor-pointer ${
                    userRole === 'player'
                      ? 'bg-[#0F2319] border-[#C9F04D] text-white shadow-lg'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        userRole === 'player' ? 'bg-[#C9F04D] text-[#071410] font-bold' : 'bg-[#143426]'
                      }`}
                    >
                      ⚽
                    </div>
                    <span className="font-bold text-xs sm:text-sm">Perfil Jugador / DT</span>
                  </div>
                  <span className="text-[10px] text-gray-400 hidden sm:block">
                    Crea tu equipo, compite en ligas y cobra pozos de premios.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserRole('agent');
                    setAuthError('');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center sm:items-start text-left transition cursor-pointer ${
                    userRole === 'agent'
                      ? 'bg-[#0F2319] border-[#7AC492] text-white shadow-lg'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        userRole === 'agent' ? 'bg-[#7AC492] text-[#071410] font-bold' : 'bg-[#143426]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm">Perfil Agente Master</span>
                  </div>
                  <span className="text-[10px] text-gray-400 hidden sm:block">
                    Consola de cajero, recargas Nequi y liquidación de retiros.
                  </span>
                </button>
              </div>

              {/* Fast 1-Click Demo Button according to role */}
              {userRole === 'player' ? (
                <div className="space-y-2.5">
                  {/* Freemium Login Card (No KYC + 450 DT Tokens) */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0C2417] via-[#0F3020] to-[#16432C] border-2 border-[#C9F04D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C9F04D] text-[#071410] font-black flex items-center justify-center shrink-0 shadow mt-0.5">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wide">
                            Acceso Freemium Gratis
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C9F04D] text-[#071410]">
                            +450 DT REGALO
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-300 block mt-0.5">
                          Juega 100% gratis <strong>sin verificación KYC</strong>. Recibe 450 tokens DT de bienvenida para armar tu plantilla en cualquiera de las 8 ligas.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleFreemiumLogin}
                      className="px-4 py-2.5 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-mono font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      Jugar Gratis (450 DT)
                    </button>
                  </div>

                  {/* Fast 1-Click Demo Button */}
                  <div className="p-2.5 rounded-xl bg-[#0F2319] border border-[#143426] flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C9F04D]/20 border border-[#C9F04D]/60 flex items-center justify-center text-[#C9F04D] shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Ingreso Rápido de Prueba DT
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Demo: igeovab@gmail.com • Clave: 2026
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickDemoPlayerLogin}
                      className="px-3 py-1.5 rounded-xl bg-[#143426] hover:bg-[#1b4331] text-[#C9F04D] border border-[#C9F04D]/40 font-bold text-xs tracking-wide transition shadow cursor-pointer whitespace-nowrap"
                    >
                      Entrar Demo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0F2319] to-[#143426] border border-[#7AC492]/40 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#7AC492]/20 border border-[#7AC492] flex items-center justify-center text-[#7AC492] shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Ingreso Rápido Consola Agente
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Agente Bogotá (AGT-7701) • Carlos Pardo
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoAgentLogin}
                    className="px-3 py-1.5 rounded-xl bg-[#7AC492] hover:bg-[#68b380] text-[#071410] font-bold text-xs tracking-wide transition shadow cursor-pointer whitespace-nowrap"
                  >
                    Entrar Agente (1 Clic)
                  </button>
                </div>
              )}

              {/* FORM BASED ON ROLE */}
              <form onSubmit={handleStep1Next} className="space-y-3.5">
                {userRole === 'player' ? (
                  <>
                    {/* Method selector */}
                    <div className="flex bg-[#071410] p-1 rounded-xl border border-[#143426] text-xs">
                      <button
                        type="button"
                        onClick={() => setAuthMethod('phone')}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer ${
                          authMethod === 'phone'
                            ? 'bg-[#143426] text-[#C9F04D]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Celular Colombia (+57)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('email')}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer ${
                          authMethod === 'email'
                            ? 'bg-[#143426] text-[#C9F04D]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Correo Electrónico</span>
                      </button>
                    </div>

                    {/* Input 1: Usuario */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        {authMethod === 'phone' ? 'Usuario (Número de Celular Nequi/Daviplata)' : 'Usuario (Correo Electrónico)'}
                      </label>
                      <div className="relative">
                        <input
                          type={authMethod === 'phone' ? 'tel' : 'email'}
                          value={phoneOrEmail}
                          onChange={(e) => setPhoneOrEmail(e.target.value)}
                          placeholder={authMethod === 'phone' ? '312 849 2011' : 'tu-correo@ejemplo.com'}
                          className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#C9F04D] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Input 2: Password / PIN */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        Clave de Acceso o PIN de Seguridad
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          maxLength={16}
                          value={securityPin}
                          onChange={(e) => setSecurityPin(e.target.value)}
                          placeholder="••••"
                          className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#C9F04D] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-mono tracking-widest"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                        Protege tu cuenta, compras de tokens y cobros de premios.
                      </span>
                    </div>

                    {authError && (
                      <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer mt-2"
                    >
                      <span>Ingresar como Jugador DT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Input 1: Agent ID */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        ID de Agente o Usuario Master DT
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={agentId}
                          onChange={(e) => setAgentId(e.target.value)}
                          placeholder="AGT-7701-COL"
                          className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#7AC492] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-mono uppercase"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                        Identificador de franquicia asignado por el operador.
                      </span>
                    </div>

                    {/* Input 2: Agent Password */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        Clave de Seguridad de Agente
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={agentPassword}
                          onChange={(e) => setAgentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#7AC492] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#7AC492] hover:bg-[#68b380] text-[#071410] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer mt-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Ingresar a Consola de Agente</span>
                    </button>
                  </>
                )}
              </form>
            </div>
          )}

          {/* ================= STEP 2: DT & TEAM NAME ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6BE55]/20 text-[#E6BE55] border border-[#E6BE55]/30 uppercase tracking-wide">
                  Paso 2 de 3
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                  Tu Identidad como Director Técnico
                </h3>
                <p className="text-xs text-gray-400">
                  ¿Cómo quieres que te reconozcan tus rivales en la tabla de posiciones?
                </p>
              </div>

              <form onSubmit={handleStep2Next} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    Nombre o Apodo del DT (Director Técnico)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="Ej. Profe Geovanny, Carlos Gómez"
                      className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#E6BE55] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    Nombre de tu Equipo de Fantasía
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 w-4 h-4 text-[#E6BE55]" />
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ej. Millos Galácticos DT, Verde & Oro FC"
                      className="w-full bg-[#071410] border border-[#1E4333] focus:border-[#E6BE55] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Choose Shield / Badge */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5">
                    Elige el Escudo de tu Club
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {SHIELD_OPTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedShield(item.icon)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition border cursor-pointer ${
                          selectedShield === item.icon
                            ? 'bg-[#153827] border-[#C9F04D] ring-2 ring-[#C9F04D]'
                            : 'bg-[#071410] border-[#143426] hover:border-gray-600'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-mono">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color theme */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5">
                    Colores del Uniforme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map((c) => {
                      const isSel =
                        selectedColors.primary === c.primary &&
                        selectedColors.secondary === c.secondary;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setSelectedColors({ primary: c.primary, secondary: c.secondary })
                          }
                          className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer text-left ${
                            isSel
                              ? 'bg-[#143426] border-[#E6BE55] text-white'
                              : 'bg-[#071410] border-[#143426] text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <div className="flex -space-x-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/40"
                              style={{ backgroundColor: c.primary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/40"
                              style={{ backgroundColor: c.secondary }}
                            />
                          </div>
                          <span className="text-xs font-mono truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {profileError && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono">
                    {profileError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-[#0F2319] hover:bg-[#143426] text-gray-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#E6BE55] hover:bg-[#d9b048] text-[#071410] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <span>Continuar a Elegir Liga</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= STEP 3: CHOOSE LEAGUE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#54C3BB]/20 text-[#54C3BB] border border-[#54C3BB]/30 uppercase tracking-wide">
                  Paso 3 de 3
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                  Elige la Liga o Competición
                </h3>
                <p className="text-xs text-gray-400">
                  Selecciona el torneo donde competirás con tu equipo de fantasía hoy.
                </p>
              </div>

              {/* League Cards Grid */}
              <div className="space-y-2.5">
                {AVAILABLE_LEAGUES.map((league) => {
                  const isSelected = selectedLeague?.id === league.id;
                  return (
                    <div
                      key={league.id}
                      onClick={() => setSelectedLeague(league)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#153827] border-[#C9F04D] shadow-lg shadow-[#C9F04D]/10 ring-2 ring-[#C9F04D]'
                          : 'bg-[#071410] border-[#143426] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl mt-0.5">{league.badge}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display text-base font-bold text-white">
                                {league.name}
                              </h4>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D] border border-[#C9F04D]/30">
                                {league.tag}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {league.description}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#C9F04D] text-[#071410] flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center" />
                        )}
                      </div>

                      {/* Prize & Entry stats */}
                      <div className="mt-3 pt-2.5 border-t border-[#1E4333]/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Bolsa de Premios:</span>
                          <span className="text-[#E6BE55] font-bold text-sm">
                            {(league.prizePoolCOP / 1000).toLocaleString('es-CO')} $DT
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-400 block text-[10px]">Entrada:</span>
                          <span className="text-[#54C3BB] font-bold">
                            {league.entryTokens} $DT
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 block text-[10px]">Límite:</span>
                          <span className="text-white font-medium">{league.deadlineText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 rounded-xl bg-[#0F2319] hover:bg-[#143426] text-gray-300 font-semibold text-xs transition cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleStep3Confirm}
                  className="flex-1 py-3.5 rounded-xl bg-[#C9F04D] hover:bg-[#b8de3f] text-[#071410] font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#C9F04D]/20 transition cursor-pointer"
                >
                  <span>Confirmar y Seleccionar Mi Once</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
