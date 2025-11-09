/**
 * Leaderboard Component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameVariant } from '@/types/game';

type LeaderboardEntry = {
  id: string;
  userId: string;
  username: string;
  wins: number;
  totalGames: number;
  winRate: number;
  lastActive: string;
};

type TimeRange = 'week' | 'month' | 'year' | 'all';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<GameVariant>('classic');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [variant, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams({
        variant,
        timeRange,
        limit: '50'
      });
      
      const response = await fetch(`/api/game/leaderboard?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const variants: { value: GameVariant; label: string }[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'four_by_four', label: '4x4' },
    { value: 'five_by_five', label: '5x5' },
    { value: 'connect_four', label: 'Connect Four' },
    { value: 'three_d', label: '3D' }
  ];

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-300';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-orange-100 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">Leaderboard</h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as GameVariant)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {variants.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {timeRanges.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No players found for this category</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-2 rounded-lg p-4 flex items-center justify-between ${getRankColor(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-700 w-8">
                  {getRankIcon(index + 1)}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-800">{entry.username}</div>
                  <div className="text-sm text-gray-500">
                    Last active: {new Date(entry.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">
                  {entry.wins} wins
                </div>
                <div className="text-sm text-gray-600">
                  {entry.totalGames} games • {entry.winRate}% win rate
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}