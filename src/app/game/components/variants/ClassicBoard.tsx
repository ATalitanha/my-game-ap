/**
 * Classic Tic Tac Toe Board (3x3, 4x4, 5x5)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GameState, Move } from '@/types/game';

interface ClassicBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  disabled?: boolean;
}

export const ClassicBoard: React.FC<ClassicBoardProps> = ({
  gameState,
  onMove,
  disabled = false,
}) => {
  const boardSize = gameState.variant === '3x3' ? 3 : 
                   gameState.variant === '4x4' ? 4 : 5;

  const getCellContent = (row: number, col: number) => {
    const cell = gameState.board[row]?.[col];
    if (!cell) return '';
    
    return cell === 'X' ? '❌' : '⭕';
  };

  const handleCellClick = (row: number, col: number) => {
    if (disabled || gameState.status !== 'playing') return;
    
    const cell = gameState.board[row]?.[col];
    if (cell) return; // Cell already occupied

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
      <div 
        className="grid gap-2 p-4 bg-gray-100 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: boardSize }, (_, row) =>
          Array.from({ length: boardSize }, (_, col) => {
            const content = getCellContent(row, col);
            const isWinning = isWinningCell(row, col);
            
            return (
              <motion.button
                key={`${row}-${col}`}
                onClick={() => handleCellClick(row, col)}
                disabled={disabled || gameState.status !== 'playing' || !!content}
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                  bg-white rounded-lg shadow-md
                  flex items-center justify-center
                  text-2xl sm:text-3xl md:text-4xl font-bold
                  transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${
                    isWinning 
                      ? 'ring-4 ring-green-400 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }
                `}
                whileHover={{ scale: content ? 1 : 1.05 }}
                whileTap={{ scale: content ? 1 : 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (row * boardSize + col) * 0.05 }}
              >
                {content && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {content}
                  </motion.span>
                )}
              </motion.button>
            );
          })
        ).flat()}
      </div>
      
      {/* Winning animation overlay */}
      {gameState.winningLine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="w-full h-full relative">
            {/* Simple celebration effect */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="text-6xl animate-bounce">🎉</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};