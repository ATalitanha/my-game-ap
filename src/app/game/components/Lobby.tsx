/**
 * Game Lobby Component for online multiplayer
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';
import { GameVariant } from '@/types/game';

interface LobbyProps {
  onStartGame: (variant: GameVariant, mode: 'online' | 'offline') => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
  const { data: session } = useSession();
  const {
    socket,
    isConnected,
    rooms,
    currentRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    error,
  } = useSocket();

  const [selectedVariant, setSelectedVariant] = useState<GameVariant>('3x3');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const variants: { value: GameVariant; label: string; icon: string }[] = [
    { value: '3x3', label: 'Classic 3x3', icon: '⭕' },
    { value: '4x4', label: '4x4 Grid', icon: '🔲' },
    { value: '5x5', label: '5x5 Grid', icon: '🔳' },
    { value: 'connect-four', label: 'Connect Four', icon: '🔴' },
    { value: '3d', label: '3D Tic Tac Toe', icon: '🧊' },
  ];

  const handleCreateRoom = () => {
    createRoom(selectedVariant);
    setShowCreateRoom(false);
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
  };

  const handleStartOfflineGame = () => {
    onStartGame(selectedVariant, 'offline');
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Please sign in to play online
        </h2>
        <button
          onClick={() => window.location.href = '/api/auth/signin'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tic Tac Toe Lobby
          </h1>
          <p className="text-gray-600">
            Welcome, {session.user?.name || session.user?.email}!
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Room */}
        {currentRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Current Room: {currentRoom.name}
            </h3>
            <p className="text-blue-600 mb-3">
              Variant: {currentRoom.variant.toUpperCase()} | 
              Players: {currentRoom.players.length}/{currentRoom.maxPlayers} | 
              Status: {currentRoom.status}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Room
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Mode Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Choose Game Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartOfflineGame}
              className="p-4 bg-green-100 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎮</div>
                <h3 className="font-semibold text-green-800">Play Offline</h3>
                <p className="text-sm text-green-600 mt-1">
                  Practice against yourself or with a friend locally
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateRoom(true)}
              disabled={!isConnected}
              className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="font-semibold text-blue-800">Play Online</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Join multiplayer games with players worldwide
                </p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Variant Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Choose Game Variant
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {variants.map((variant) => (
              <motion.button
                key={variant.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVariant(variant.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedVariant === variant.value
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{variant.icon}</div>
                <div className="text-sm font-medium">{variant.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Available Rooms */}
        {!currentRoom && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Available Rooms
            </h2>
            
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏠</div>
                <p>No rooms available. Create one to start playing!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{room.name}</h3>
                      <span className="text-sm text-gray-500">
                        {room.variant.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {room.players}/2 players
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinRoom(room.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};