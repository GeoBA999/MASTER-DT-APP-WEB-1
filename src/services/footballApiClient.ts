import { ApiFootballFixture, ApiFootballPlayer, calculatePointsFromApiStats } from '../utils/footballApi';
import { Player } from '../types';

export interface ApiStatusResponse {
  success: boolean;
  quotaRemaining: number | null;
  data?: any;
  error?: string;
}

export interface ApiLineupTeam {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  coach: string;
  coachPhoto?: string;
  formation: string;
  startXI: {
    id: number;
    name: string;
    number?: number;
    position: string;
    grid?: string;
  }[];
  substitutes: {
    id: number;
    name: string;
    number?: number;
    position: string;
  }[];
}

export const footballApiClient = {
  async getStatus(): Promise<ApiStatusResponse> {
    try {
      const res = await fetch('/api/football/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, quotaRemaining: null, error: e.message };
    }
  },

  async getFixtures(league = '239', season = '2024', round = 'Clausura - 10'): Promise<ApiFootballFixture[]> {
    try {
      const res = await fetch(`/api/football/fixtures?league=${league}&season=${season}&round=${encodeURIComponent(round)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.fixtures || [];
    } catch (e) {
      console.error('Error fetching fixtures from API:', e);
      return [];
    }
  },

  async getLineups(fixtureId: number | string): Promise<ApiLineupTeam[]> {
    try {
      const res = await fetch(`/api/football/lineups/${fixtureId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.lineups || [];
    } catch (e) {
      console.error('Error fetching lineups from API:', e);
      return [];
    }
  },

  async getMatchdayPlayers(fixtureId?: number | string): Promise<ApiFootballPlayer[]> {
    try {
      const url = fixtureId ? `/api/football/matchday-fantasy?fixtureId=${fixtureId}` : '/api/football/matchday-fantasy';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.players || [];
    } catch (e) {
      console.error('Error fetching matchday players from API:', e);
      return [];
    }
  },

  async getAllPlayers(): Promise<Player[]> {
    try {
      const res = await fetch('/api/football/all-players');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.players || [];
    } catch (e) {
      console.error('Error fetching all players from API:', e);
      return [];
    }
  },
};
