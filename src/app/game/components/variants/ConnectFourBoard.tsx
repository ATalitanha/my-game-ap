/**
 * Connect Four Board Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GameState, Move } from '@/types/game';

interface ConnectFourBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  disabled?: boolean;
}

export const ConnectFourBoard: React.FC<ConnectFourBoardProps> = ({
  gameState,
  onMove,
  disabled = false,
}) => {
  const ROWS = 6;
  const COLS = 7;

  const getCellContent = (row: number, col: number) => {
    const cell = gameState.board[row]?.[col];
    if (!cell) return null;
    
    return cell === 'X' ? '🔴' : '🟡';
  };

  const getLowestEmptyRow = (col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!gameState.board[row]?.[col]) {
        return row;
      }
    }
    return -1; // Column is full
  };

  const handleColumnClick = (col: number) => {
    if (disabled || gameState.status !== 'playing') return;
    
    const row = getLowestEmptyRow(col);
    if (row === -1) return; // Column is full

    const move: Move = {
      row,
      col,
      player: gameState.players[gameState.currentPlayer].id,
      symbol: gameState.players[gameState.currentPlayer].symbol,
      timestamp: Date.now(),
    };

    onMove(move);
  };

  const isWinningCell = (row: number, col: number) => {
    if (!gameState.winningLine) return false;
    
    return gameState.winningLine.some(pos => pos.row === row && pos.col === col);
  };

  return (
    <div className="relative">
      {/* Column hover indicators */}
      <div className="grid grid-cols-7 gap-2 mb-2 px-4">
        {Array.from({ length: COLS }, (_, col) => {
          const canDrop = getLowestEmptyRow(col) !== -1 && !disabled && gameState.status === 'playing';
          
          return (
            <motion.button
              key={`drop-${col}`}
              onClick={() => handleColumnClick(col)}
              disabled={!canDrop}
              className={`
                w-12 h-8 rounded-lg flex items-center justify-center
                transition-all duration-200
                ${
                  canDrop
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              whileHover={canDrop ? { scale: 1.1 } : {}}
              whileTap={canDrop ? { scale: 0.9 } : {}}
            >
              ⬇️
            </motion.button>
          );
        })}
      </div>

      {/* Game Board */}
      <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
        <div 
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const content = getCellContent(row, col);
              const isWinning = isWinningCell(row, col);
              
              return (
                <motion.div
                  key={`${row}-${col}`}
                  className={`
                    w-12 h-12 sm:w-16 sm:h-16
                    bg-white rounded-full shadow-inner
                    flex items-center justify-center
                    text-xl sm:text-2xl
                    ${
                      isWinning 
                        ? 'ring-4 ring-yellow-400 bg-yellow-50' 
                        : ''
                    }
                  `}
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ 
                    delay: content ? (col * 0.1 + row * 0.05) : 0,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {content && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.1,
                        type: 'spring',
                        stiffness: 200
                      }}
                    >
                      {content}
                    </motion.span>
                  )}
                </motion.div>
              );
            })
          ).flat()}
        </div>
      </div>

      {/* Player indicators */}
      <div className="mt-4 flex justify-center gap-8">
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              gameState.currentPlayer === index
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-2xl">
              {player.symbol === 'X' ? '🔴' : '🟡'}
            </span>
            <span className="font-semibold">{player.name}</span>
          </div>
        ))}
      </div>

      {/* Winning animation */}
      {gameState.winningLine && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="text-8xl animate-bounce">🎉</div>
        </motion.div>
      )}
    </div>
  );
};