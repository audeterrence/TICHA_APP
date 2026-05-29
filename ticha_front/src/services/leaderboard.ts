// ticha_front/src/services/leaderboard.ts
import { api } from './api';

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  points: number;
  streak: number;
  level: string;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // We will build this route in FastAPI shortly to fetch the top 10 users by points
  const response = await api.get('/profiles/leaderboard');
  return response.data;
};