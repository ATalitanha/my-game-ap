/**
 * Custom hook for managing offline game state with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameVariant, Position, Move } from '@/types/game';
import { createGameState, makeMove, resetGame } from '@/lib/gameLogic';
import { 
  saveGameToLocalStorage, 
  loadGameFromLocalStorage, 
  clearCurrentGame, 
  saveGameResult,
  autoSaveGame,
  hasSavedGame 
} from '@/lib/localStorage';

export interface UseOfflineGameReturn {
  gameState: GameState | null;
  isLoading: boolean;
  hasSavedGame: boolean;
  makeMove: (position: Position) => boolean;
  resetGame: () => void;
  loadSavedGame: () => void;
  clearSavedGame: () => void;
  startNewGame: (variant: GameVariant) => void;
}

export function useOfflineGame(): UseOfflineGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSavedGameState, setHasSavedGame] = useState(false);

  // Load saved game on mount
  useEffect(() => {
    const loadInitialGame = () => {
      setIsLoading(true);
      
      const savedGame = loadGameFromLocalStorage();
      const hasSaved = hasSavedGame();
      
      setHasSavedGame(hasSaved);
      
      if (savedGame && savedGame.status === 'playing') {
        setGameState(savedGame);
      } else {
        // Start with a default game if no saved game or game was finished
        const defaultGame = createGameState('classic', 'offline');
        setGameState(defaultGame);
      }
      
      setIsLoading(false);
    };

    loadInitialGame();
  }, []);

  /**
   * Make a move in the game
   */
  const handleMakeMove = useCallback((position: Position): boolean => {
    if (!gameState || gameState.status !== 'playing') {
      return false;
    }

    try {
      const newGameState = makeMove(gameState, position, gameState.currentPlayer);
      setGameState(newGameState);
      
      // Auto-save the game
      autoSaveGame(newGameState);
      
      // If game is finished, save the result
      if (newGameState.status === 'finished' || newGameState.status === 'draw') {
        const duration = Math.floor((Date.now() - newGameState.createdAt) / 1000);
        const result = {
          gameId: newGameState.id,
          variant: newGameState.variant,
          winner: newGameState.winner,
          players: ['Player X', 'Player O'],
          moves: newGameState.moves.length,
          duration,
          timestamp: Date.now(),
        };
        saveGameResult(result);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to make move:', error);
      return false;
    }
  }, [gameState]);

  /**
   * Reset the current game
   */
  const handleResetGame = useCallback(() => {
    if (!gameState) return;

    const resetGameState = resetGame(gameState);
    setGameState(resetGameState);
    saveGameToLocalStorage(resetGameState);
  }, [gameState]);

  /**
   * Load a saved game
   */
  const handleLoadSavedGame = useCallback(() => {
    const savedGame = loadGameFromLocalStorage();
    if (savedGame) {
      setGameState(savedGame);
    }
  }, []);

  /**
   * Clear saved game
   */
  const handleClearSavedGame = useCallback(() => {
    clearCurrentGame();
    setHasSavedGame(false);
    
    // Start a new game
    if (gameState) {
      const newGame = createGameState(gameState.variant, 'offline');
      setGameState(newGame);
    }
  }, [gameState]);

  /**
   * Start a new game with specified variant
   */
  const handleStartNewGame = useCallback((variant: GameVariant) => {
    const newGame = createGameState(variant, 'offline');
    setGameState(newGame);
    saveGameToLocalStorage(newGame);
    setHasSavedGame(true);
  }, []);

  return {
    gameState,
    isLoading,
    hasSavedGame: hasSavedGameState,
    makeMove: handleMakeMove,
    resetGame: handleResetGame,
    loadSavedGame: handleLoadSavedGame,
    clearSavedGame: handleClearSavedGame,
    startNewGame: handleStartNewGame,
  };
}