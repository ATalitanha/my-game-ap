/**
 * Player Statistics Component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { PlayerStats } from '@/types/game';

export default function Stats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/game/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Player Statistics</h3>
        <p className="text-gray-600">Sign in to view your statistics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Player Statistics</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Player Statistics</h3>
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Player Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalGames}</div>
          <div className="text-sm text-gray-600">Total Games</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.gamesWon}</div>
          <div className="text-sm text-gray-600">Games Won</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.gamesDrawn}</div>
          <div className="text-sm text-gray-600">Games Drawn</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Games by Variant</h4>
        {Object.entries(stats.gamesByVariant).map(([variant, count]) => (
          <div key={variant} className="flex justify-between items-center">
            <span className="text-gray-600 capitalize">{variant.replace('_', ' ')}</span>
            <span className="font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}