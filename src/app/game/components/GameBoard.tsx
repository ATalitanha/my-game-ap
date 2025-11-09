/**
 * Main Game Board component that renders different game variants
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GameState, Move, GameVariant } from '@/types/game';
import { ClassicBoard } from './variants/ClassicBoard';
import { ConnectFourBoard } from './variants/ConnectFourBoard';
import { ThreeDBoard } from './variants/ThreeDBoard';

interface GameBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  disabled?: boolean;
  currentPlayerId?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onMove,
  disabled = false,
  currentPlayerId,
}) => {
  const isPlayerTurn = currentPlayerId 
    ? gameState.players[gameState.currentPlayer]?.id === currentPlayerId
    : true;

  const renderBoard = () => {
    const commonProps = {
      gameState,
      onMove,
      disabled: disabled || !isPlayerTurn,
    };

    switch (gameState.variant) {
      case '3x3':
      case '4x4':
      case '5x5':
        return <ClassicBoard {...commonProps} />;
      
      case 'connect-four':
        return <ConnectFourBoard {...commonProps} />;
      
      case '3d':
        return <ThreeDBoard {...commonProps} />;
      
      default:
        return <ClassicBoard {...commonProps} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Game Status */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {gameState.variant.toUpperCase()} Tic Tac Toe
          </h2>
          
          <div className="flex justify-center items-center gap-4">
            {gameState.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  gameState.currentPlayer === index
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="font-semibold">
                  {player.symbol === 'X' ? '❌' : '⭕'}
                </span>
                <span>{player.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status Message */}
        <div className="mb-4 text-center">
          {gameState.status === 'playing' && (
            <p className="text-lg text-gray-600">
              {isPlayerTurn ? 'Your turn!' : 'Waiting for opponent...'}
            </p>
          )}
          
          {gameState.status === 'finished' && (
            <div className="text-lg">
              {gameState.winner ? (
                <span className="text-green-600 font-semibold">
                  🎉 {gameState.winner.playerName} wins!
                </span>
              ) : (
                <span className="text-yellow-600 font-semibold">
                  It's a draw!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          {renderBoard()}
        </div>

        {/* Move Counter */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Moves: {gameState.moves.length}
        </div>
      </div>
    </motion.div>
  );
};