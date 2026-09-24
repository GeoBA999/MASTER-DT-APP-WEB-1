import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Mail, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserDTProfile, SelectedLeagueInfo } from '../types';

export const FREEMIUM_WELCOME_LEAGUE: SelectedLeagueInfo = {
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
};

interface BetaAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete: (profile: UserDTProfile) => void;
  initialMode?: 'login' | 'register';
}

export const BetaAuthModal: React.FC<BetaAuthModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu Nombre o Correo.');
      return;
    }
    if (!password.trim() || password.length < 3) {
      setErrorMessage('Por favor ingresa tu Clave (mínimo 3 caracteres).');
      return;
    }

    setErrorMessage('');
    const profile: UserDTProfile = {
      isLoggedIn: true,
      role: 'player',
      managerName: name.trim().includes('@') ? name.trim().split('@')[0] : name.trim(),
      teamName: `${name.trim().split(' ')[0]} FC`,
      phoneOrEmail: name.trim(),
      avatarIcon: '⚡',
      shieldBadge: '🦁',
      teamColors: { primary: '#0F3822', secondary: '#C9F04D' },
      isFreemium: true,
      initialTokensBonus: 10,
      selectedLeague: FREEMIUM_WELCOME_LEAGUE,
      registeredLeagues: [FREEMIUM_WELCOME_LEAGUE],
      createdAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu Nombre.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un Correo electrónico válido.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('La Clave debe tener al menos 4 caracteres.');
      return;
    }

    setErrorMessage('');
    const profile: UserDTProfile = {
      isLoggedIn: true,
      role: 'player',
      managerName: name.trim(),
      teamName: `${name.trim().split(' ')[0]} DT`,
      phoneOrEmail: email.trim(),
      avatarIcon: '⚡',
      shieldBadge: '🦁',
      teamColors: { primary: '#0F3822', secondary: '#C9F04D' },
      isFreemium: true,
      initialTokensBonus: 10,
      selectedLeague: FREEMIUM_WELCOME_LEAGUE,
      registeredLeagues: [FREEMIUM_WELCOME_LEAGUE],
      createdAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  const handleQuickFreemiumDemo = () => {
    const profile: UserDTProfile = {
      isLoggedIn: true,
      role: 'player',
      managerName: 'DT Freemium Profe',
      teamName: 'Once Caldas Galáctico DT',
      phoneOrEmail: 'demo.freemium@masterdt.co',
      avatarIcon: '⚡',
      shieldBadge: '🦁',
      teamColors: { primary: '#0F3822', secondary: '#C9F04D' },
      isFreemium: true,
      initialTokensBonus: 10,
      selectedLeague: FREEMIUM_WELCOME_LEAGUE,
      registeredLeagues: [FREEMIUM_WELCOME_LEAGUE],
      createdAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] bg-[#0A1A12] border border-[#183928] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl text-left my-auto">
        
        {/* TOP HERO BANNER with soccer champions and arched bottom cut */}
        <div className="relative w-full h-44 sm:h-48 overflow-hidden">
          <img
            src="/soccer_stars_hero.jpg"
            alt="Champions Celebration"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Fallback to high quality champions photo if local file fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A12] via-transparent to-black/40" />

          {/* Back button on Register screen */}
          {mode === 'register' && (
            <button
              onClick={() => {
                setErrorMessage('');
                setMode('login');
              }}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white transition cursor-pointer border border-white/20"
              title="Volver a Iniciar Sesión"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Close button if optional */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-gray-300 hover:text-white flex items-center justify-center text-sm transition cursor-pointer border border-white/15"
            >
              ✕
            </button>
          )}

          {/* Freemium Beta Badge */}
          <div className="absolute bottom-3 right-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-[#C9F04D] text-[#071410] shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> BETA FREEMIUM
            </span>
          </div>
        </div>

        {/* BODY CONTAINER */}
        <div className="px-6 pb-6 pt-2 space-y-4">
          
          {/* SCREEN 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="text-center pt-1 pb-1">
                <h2 className="font-display text-3xl font-black tracking-wider text-white uppercase">
                  MASTER DT
                </h2>
                <p className="text-xs text-[#7AC492] font-mono mt-0.5">
                  Versión BETA • Liga BetPlay Freemium
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {forgotPasswordSent && (
                <div className="p-2.5 rounded-xl bg-[#143426] border border-[#7AC492]/50 text-xs text-[#C9F04D] flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Enlace de recuperación enviado a tu correo/móvil registrado.</span>
                </div>
              )}

              {/* Input NOMBRE */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  NOMBRE O CORREO
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre de DT o usuario"
                    className="w-full px-4 py-3 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Input CLAVE */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  CLAVE
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Button LOGIN */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#48a23d] hover:bg-[#52b545] text-white font-bold tracking-wider text-sm uppercase shadow-lg shadow-[#48a23d]/20 transition cursor-pointer active:scale-[0.98] mt-2"
              >
                LOGIN
              </button>

              {/* Forgot password and Register link */}
              <div className="text-center space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordSent(true)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('register');
                    }}
                    className="text-xs font-bold tracking-wider text-white hover:text-[#C9F04D] uppercase transition cursor-pointer inline-flex items-center gap-1"
                  >
                    CREAR CUENTA
                  </button>
                </div>
              </div>

              {/* 1-Click Quick Demo for tester convenience */}
              <div className="pt-2 border-t border-[#143426]/60 text-center">
                <button
                  type="button"
                  onClick={handleQuickFreemiumDemo}
                  className="text-[11px] font-mono text-[#7AC492] hover:text-[#C9F04D] hover:underline cursor-pointer"
                >
                  ⚡ Acceso rápido Freemium con 1 clic (Demo Beta)
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 2: CREAR PERFIL (REGISTRO) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="text-center pt-0.5 pb-1">
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
                  CREAR PERFIL
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('login');
                  }}
                  className="text-[11px] font-mono text-gray-400 hover:text-[#C9F04D] transition mt-1 uppercase tracking-wider block mx-auto cursor-pointer"
                >
                  ¿YA ESTÁS REGISTRADO? <span className="text-[#C9F04D] font-bold underline">INGRESA AQUÍ</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Field 1: NOMBRE */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  NOMBRE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: CORREO */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  CORREO (EMAIL)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: TELÉFONO */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  TELÉFONO
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 312 345 6789"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: CLAVE */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  CLAVE
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#13281E]/90 border border-[#204933] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9F04D] transition"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Button REGISTRO */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#48a23d] hover:bg-[#52b545] text-white font-bold tracking-wider text-sm uppercase shadow-lg shadow-[#48a23d]/20 transition cursor-pointer active:scale-[0.98] mt-2"
              >
                REGISTRO
              </button>

              <p className="text-[10px] font-mono text-center text-gray-400 pt-1">
                Incluye 🎁 <strong>10 Tokens DT de Regalo</strong> para la Liga BetPlay Freemium.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
