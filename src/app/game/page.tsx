/**
 * Main Game Page
 */

'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import GameHistory from './components/GameHistory';
import Leaderboard from './components/Leaderboard';
import { useOfflineGame } from '@/hooks/useOfflineGame';
import { useSocket } from '@/hooks/useSocket';
import { GameMode, GameVariant, GameState } from '@/types/game';

type GameView = 'lobby' | 'game' | 'stats' | 'history' | 'leaderboard';

function GameContent() {
  const [currentView, setCurrentView] = useState<GameView>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('offline');
  const [gameVariant, setGameVariant] = useState<GameVariant>('classic');
  
  const offlineGame = useOfflineGame(gameVariant);
  const socket = useSocket();

  const handleStartGame = (mode: GameMode, variant: GameVariant) => {
    setGameMode(mode);
    setGameVariant(variant);
    setCurrentView('game');
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
  };

  const getCurrentGameState = (): GameState => {
    if (gameMode === 'offline') {
      return offlineGame.gameState;
    }
    return socket.gameState;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('lobby')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              🎯 Tic Tac Toe
            </motion.button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('lobby')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'lobby' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Play
              </button>
              <button
                onClick={() => setCurrentView('stats')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'stats' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Stats
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'leaderboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Lobby onStartGame={handleStartGame} />
            </motion.div>
          )}
          
          {currentView === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GameBoard
                gameState={getCurrentGameState()}
                gameMode={gameMode}
                gameVariant={gameVariant}
                onBackToLobby={handleBackToLobby}
                onMakeMove={gameMode === 'offline' ? offlineGame.makeMove : socket.makeMove}
                connectionStatus={gameMode === 'online' ? socket.connectionStatus : 'connected'}
              />
            </motion.div>
          )}
          
          {currentView === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Stats />
            </motion.div>
          )}
          
          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GameHistory />
            </motion.div>
          )}
          
          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <SessionProvider>
      <GameContent />
    </SessionProvider>
  );
}