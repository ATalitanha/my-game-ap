/**
 * Game History Component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { GameResult } from '@/types/game';

export default function GameHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session, page]);

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/game/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setHistory(data.games);
        } else {
          setHistory(prev => [...prev, ...data.games]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-600 bg-green-50';
      case 'loss': return 'text-red-600 bg-red-50';
      case 'draw': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'Win';
      case 'loss': return 'Loss';
      case 'draw': return 'Draw';
      default: return result;
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Game History</h3>
        <p className="text-gray-600">Sign in to view your game history</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Game History</h3>
      
      {loading && history.length === 0 ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-600">No games played yet</p>
      ) : (
        <div className="space-y-4">
          {history.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800 capitalize">
                      {game.variant.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(game.result)}`}>
                      {getResultText(game.result)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>Opponent: {game.opponentName || 'Anonymous'}</div>
                    <div>Duration: {Math.round(game.duration / 1000)}s</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(game.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}