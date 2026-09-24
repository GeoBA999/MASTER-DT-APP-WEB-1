export type PlayerPosition = 'POR' | 'DEF' | 'MED' | 'DEL';

export type Formation = '3-4-3' | '3-5-2' | '4-4-2' | '4-3-3' | '4-5-1' | '5-3-2' | '5-4-1';

export type ChipType = 'none' | 'wildcard' | 'triple_captain' | 'bench_boost' | 'regional_wildcard';

export type TournamentCategory =
  | 'LIGA_BETPLAY'
  | 'LIBERTADORES'
  | 'SURAMERICANA'
  | 'CHAMPIONS'
  | 'LALIGA'
  | 'PREMIER_LEAGUE'
  | 'CALCIO'
  | 'BUNDESLIGA';

export interface PlayerStats {
  minutesPlayed: number;
  goals: number;
  assists: number;
  dribbles: number;
  cleanSheet: boolean;
  recoveries: number;
  saves: number;
  penaltySaves: number;
  penaltyMissed: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  mvpBonusRank: 0 | 1 | 2 | 3; // 1 = +3, 2 = +2, 3 = +1, 0 = none
  matchRating: number;
  isConfirmedStarter: boolean;
  wasEarlySubstituted?: boolean;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  club: string;
  clubLogo?: string;
  position: PlayerPosition;
  price: number; // in Millions COP, e.g., 9.5
  photoUrl: string;
  form: number; // 0 - 10
  selectedPercentage: number;
  tournament: TournamentCategory;
  isLibertadoresColombian?: boolean;
  stats: PlayerStats;
}

export interface SquadPlayerSlot {
  slotId: string;
  position: PlayerPosition;
  isStarter: boolean;
  benchIndex?: number; // 0: GK, 1: DEF, 2: MED, 3: DEL
  player: Player | null;
}

export interface SquadState {
  id: string;
  name: string;
  formation: Formation;
  slots: SquadPlayerSlot[];
  captainId: string | null;
  viceCaptainId: string | null;
  hiddenCaptainId: string | null;
  isHiddenCaptainActive: boolean;
  activeChip: ChipType;
  chipsUsed: {
    wildcard: boolean;
    triple_captain: boolean;
    bench_boost: boolean;
    regional_wildcard: boolean;
  };
  totalPoints: number;
  fixtureDeadline: string; // ISO string
}

export interface ScoringBreakdownItem {
  category: string;
  detail: string;
  points: number;
}

export interface CalculatedScore {
  total: number;
  breakdown: ScoringBreakdownItem[];
  multiplier: number;
  multiplierReason: string;
}

export type LeagueLevel = 1 | 2 | 3 | 4;

export interface PrivateLeague {
  id: string;
  name: string;
  level: LeagueLevel;
  buyInCOP: number;
  rakePercentage: number;
  prizePoolCOP: number;
  currentParticipants: number;
  maxParticipants: number;
  tournament: TournamentCategory;
  fixtureName: string;
  status: 'open' | 'live' | 'completed';
  leaderboard: {
    rank: number;
    userId: string;
    userName: string;
    avatar: string;
    teamName: string;
    points: number;
    squadCost: number;
    prizeCOP?: number;
  }[];
}

export type VIPTournamentType = 'gtd' | 'efficiency' | 'heads_up' | 'peor_once';

export interface VIPTournament {
  id: string;
  title: string;
  type: VIPTournamentType;
  buyInCOP: number;
  rakePercentage: number;
  guaranteedPrizeCOP?: number;
  overlayProtection: boolean;
  participantsCount: number;
  maxParticipants: number;
  description: string;
  status: 'registering' | 'live' | 'finished';
}

export interface TokenPackage {
  id: string;
  tokens: number;
  priceCOP: number;
  badge?: string;
  bonusTokens?: number;
}

export type PaymentMethod = 'Nequi' | 'Daviplata' | 'Bancolombia' | 'Efecty / Cash';

export type KYCStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export interface KYCRecord {
  fullName: string;
  documentType: 'CC' | 'CE' | 'Pasaporte';
  documentNumber: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  documentFrontUploaded: boolean;
  documentBackUploaded: boolean;
  submittedAt: string;
  status: KYCStatus;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AgentTransaction {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userPhone: string;
  amountTokens: number;
  amountCOP: number;
  method: PaymentMethod;
  referenceCode: string;
  agentId: string;
  agentName: string;
  status: 'approved' | 'pending' | 'rejected';
  notes: string;
  type: 'deposit' | 'withdrawal';
}

export interface LiveMatchEvent {
  id: string;
  minute: number;
  fixtureId: string;
  matchTitle: string;
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'save' | 'clean_sheet' | 'penalty_saved' | 'penalty_missed' | 'mvp';
  playerId: string;
  playerName: string;
  club: string;
  description: string;
  pointsDelta: number;
  timestamp: string;
}

export interface SelectedLeagueInfo {
  id: string;
  name: string;
  category: TournamentCategory;
  description: string;
  prizePoolCOP: number;
  entryTokens: number;
  entryFeeCOP: number;
  deadlineText: string;
  badge: string;
  tag: string;
  isWorstXI?: boolean;
}

export type UserRole = 'player' | 'agent';

export interface UserDTProfile {
  isLoggedIn: boolean;
  role: UserRole;
  phoneOrEmail: string;
  agentId?: string;
  managerName: string;
  teamName: string;
  avatarIcon: string;
  shieldBadge: string;
  teamColors: {
    primary: string;
    secondary: string;
  };
  selectedLeague: SelectedLeagueInfo;
  registeredLeagues?: SelectedLeagueInfo[];
  createdAt: string;
  isFreemium?: boolean;
  initialTokensBonus?: number;
}

export interface LeagueSquadData {
  leagueId: string;
  leagueName: string;
  formation: Formation;
  slots: SquadPlayerSlot[];
  captainId: string | null;
  viceCaptainId: string | null;
  hiddenCaptainId: string | null;
  isHiddenCaptainActive: boolean;
  activeChip: ChipType;
  chipsUsed: {
    wildcard: boolean;
    triple_captain: boolean;
    bench_boost: boolean;
    regional_wildcard: boolean;
  };
}

export interface MatchdayHistoricalPerformance {
  matchday: number;
  label: string; // 'J1', 'J2', 'J3', 'J4', 'J5'
  opponent: string;
  isHome: boolean;
  points: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  rating: number; // e.g., 7.8
  saves?: number;
  recoveries: number;
  yellowCards: number;
  xG: number;
  xA: number;
}

export interface PlayerHistoricalData {
  player: Player;
  history: MatchdayHistoricalPerformance[];
  averagePoints: number;
  totalPointsLast5: number;
  pointsPerMillion: number;
  consistencyScore: number; // 0-100 (inverse of std dev)
  trend: 'up' | 'down' | 'stable';
  bestMatchday: { matchday: number; points: number; opponent: string };
  radarMetrics: {
    attacking: number;   // 0-100
    defending: number;   // 0-100
    consistency: number; // 0-100
    form: number;        // 0-100
    efficiency: number;  // 0-100
    influence: number;   // 0-100
  };
}

export interface SquadAnalyticsSummary {
  matchdays: {
    matchday: number;
    label: string;
    totalStarterPoints: number;
    totalSquadPoints: number;
    averageRating: number;
  }[];
  totalPointsLast5: number;
  averagePerMatchday: number;
  topPerformer: PlayerHistoricalData | null;
  bestValuePlayer: PlayerHistoricalData | null;
  mostConsistentPlayer: PlayerHistoricalData | null;
  positionalBreakdown: {
    position: PlayerPosition;
    totalPoints: number;
    sharePercentage: number;
  }[];
}
