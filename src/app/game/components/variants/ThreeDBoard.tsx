/**
 * 3D Tic Tac Toe Board Component
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Move } from '@/types/game';

interface ThreeDBoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  disabled?: boolean;
}

export const ThreeDBoard: React.FC<ThreeDBoardProps> = ({
  gameState,
  onMove,
  disabled = false,
}) => {
  const LAYERS = 3;
  const SIZE = 3;
  const [activeLayer, setActiveLayer] = useState(0);

  const getCellContent = (layer: number, row: number, col: number) => {
    const cell = gameState.board[layer]?.[row]?.[col];
    if (!cell) return '';
    
    return cell === 'X' ? '❌' : '⭕';
  };

  const handleCellClick = (layer: number, row: number, col: number) => {
    if (disabled || gameState.status !== 'playing') return;
    
    const cell = gameState.board[layer]?.[row]?.[col];
    if (cell) return; // Cell already occupied

    const move: Move = {
      layer,
      row,
      col,
      player: gameState.players[gameState.currentPlayer].id,
      symbol: gameState.players[gameState.currentPlayer].symbol,
      timestamp: Date.now(),
    };

    onMove(move);
  };

  const isWinningCell = (layer: number, row: number, col: number) => {
    if (!gameState.winningLine) return false;
    
    return gameState.winningLine.some(pos => 
      pos.layer === layer && pos.row === row && pos.col === col
    );
  };

  const renderLayer = (layerIndex: number) => {
    const isActive = layerIndex === activeLayer;
    
    return (
      <motion.div
        key={layerIndex}
        className={`
          absolute inset-0
          ${isActive ? 'opacity-100' : 'opacity-30'}
          transition-opacity duration-300
        `}
        style={{
          transform: `translateZ(${layerIndex * 10}px)`,
        }}
      >
        <div 
          className="grid gap-2 p-4 bg-white rounded-lg shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: SIZE }, (_, row) =>
            Array.from({ length: SIZE }, (_, col) => {
              const content = getCellContent(layerIndex, row, col);
              const isWinning = isWinningCell(layerIndex, row, col);
              
              return (
                <motion.button
                  key={`${layerIndex}-${row}-${col}`}
                  onClick={() => handleCellClick(layerIndex, row, col)}
                  disabled={disabled || gameState.status !== 'playing' || !!content}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14
                    bg-gray-50 rounded-lg shadow-md
                    flex items-center justify-center
                    text-lg sm:text-xl font-bold
                    transition-all duration-200
                    hover:shadow-lg hover:scale-105
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${
                      isWinning 
                        ? 'ring-4 ring-purple-400 bg-purple-50' 
                        : 'hover:bg-gray-100'
                    }
                  `}
                  whileHover={{ scale: content ? 1 : 1.05 }}
                  whileTap={{ scale: content ? 1 : 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (layerIndex * SIZE * SIZE + row * SIZE + col) * 0.02 }}
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
      </motion.div>
    );
  };

  return (
    <div className="relative">
      {/* Layer Controls */}
      <div className="flex justify-center mb-4 gap-2">
        {Array.from({ length: LAYERS }, (_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveLayer(index)}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-all
              ${
                activeLayer === index
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Layer {index + 1}
          </motion.button>
        ))}
      </div>

      {/* 3D Board Container */}
      <div className="relative h-80 sm:h-96 perspective-1000">
        <motion.div
          className="absolute inset-0"
          animate={{ rotateX: 5, rotateY: 5 }}
          transition={{ duration: 0.5 }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <AnimatePresence>
            {Array.from({ length: LAYERS }, (_, index) => renderLayer(index))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Layer Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Active Layer: {activeLayer + 1} of {LAYERS}
        </p>
        <p className="text-xs text-gray-500">
          Click on any cell to place your mark in the active layer
        </p>
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