/**
 * LocalStorage utilities for offline game persistence
 */

import { GameState, LocalStorageGame, GameResult } from '@/types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'tictactoe_current_game',
  GAME_HISTORY: 'tictactoe_game_history',
  PLAYER_STATS: 'tictactoe_player_stats',
  SETTINGS: 'tictactoe_settings',
} as const;

/**
 * Save current game to localStorage
 */
export function saveGameToLocalStorage(gameState: GameState): void {
  if (typeof window === 'undefined') return;

  try {
    const gameData: LocalStorageGame = {
      gameState,
      lastSaved: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameData));
  } catch (error) {
    console.error('Failed to save game to localStorage:', error);
  }
}

/**
 * Load current game from localStorage
 */
export function loadGameFromLocalStorage(): GameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!stored) return null;

    const gameData: LocalStorageGame = JSON.parse(stored);
    
    // Validate the loaded data
    if (!gameData.gameState || !gameData.gameState.id) {
      return null;
    }

    return gameData.gameState;
  } catch (error) {
    console.error('Failed to load game from localStorage:', error);
    return null;
  }
}

/**
 * Clear current game from localStorage
 */
export function clearCurrentGame(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.error('Failed to clear current game:', error);
  }
}

/**
 * Save game result to history
 */
export function saveGameResult(result: GameResult): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getGameHistory();
    history.unshift(result); // Add to beginning
    
    // Keep only last 50 games
    const trimmedHistory = history.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(trimmedHistory));
    
    // Update player stats
    updatePlayerStats(result);
  } catch (error) {
    console.error('Failed to save game result:', error);
  }
}

/**
 * Get game history
 */
export function getGameHistory(): GameResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!stored) return [];

    const history: GameResult[] = JSON.parse(stored);
    return history;
  } catch (error) {
    console.error('Failed to load game history:', error);
    return [];
  }
}

/**
 * Clear game history
 */
export function clearGameHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
  } catch (error) {
    console.error('Failed to clear game history:', error);
  }
}

/**
 * Player statistics interface
 */
export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  winStreak: number;
  bestWinStreak: number;
  favoriteVariant: string;
  totalPlayTime: number; // in seconds
  lastPlayed: number;
}

/**
 * Update player statistics
 */
function updatePlayerStats(result: GameResult): void {
  if (typeof window === 'undefined') return;

  try {
    const stats = getPlayerStats();
    
    stats.gamesPlayed++;
    stats.lastPlayed = result.timestamp;
    stats.totalPlayTime += result.duration;

    if (result.winner === 'draw') {
      stats.gamesDrawn++;
      stats.winStreak = 0;
    } else {
      // Assuming current player is always X in offline mode
      const isWin = result.winner === 'X';
      if (isWin) {
        stats.gamesWon++;
        stats.winStreak++;
        stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.winStreak);
      } else {
        stats.gamesLost++;
        stats.winStreak = 0;
      }
    }

    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update player stats:', error);
  }
}

/**
 * Get player statistics
 */
export function getPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') {
    return getDefaultPlayerStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (!stored) {
      const defaultStats = getDefaultPlayerStats();
      localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(defaultStats));
      return defaultStats;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load player stats:', error);
    return getDefaultPlayerStats();
  }
}

/**
 * Get default player statistics
 */
function getDefaultPlayerStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    winStreak: 0,
    bestWinStreak: 0,
    favoriteVariant: 'classic',
    totalPlayTime: 0,
    lastPlayed: 0,
  };
}

/**
 * Game settings interface
 */
export interface GameSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSaveEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  preferredVariant: string;
  showCoordinates: boolean;
}

/**
 * Get game settings
 */
export function getGameSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return getDefaultGameSettings();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      const defaultSettings = getDefaultGameSettings();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load game settings:', error);
    return getDefaultGameSettings();
  }
}

/**
 * Save game settings
 */
export function saveGameSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save game settings:', error);
  }
}

/**
 * Get default game settings
 */
function getDefaultGameSettings(): GameSettings {
  return {
    soundEnabled: true,
    animationsEnabled: true,
    autoSaveEnabled: true,
    theme: 'auto',
    preferredVariant: 'classic',
    showCoordinates: false,
  };
}

/**
 * Auto-save game if enabled
 */
export function autoSaveGame(gameState: GameState): void {
  if (typeof window === 'undefined') return;

  try {
    const settings = getGameSettings();
    if (settings.autoSaveEnabled) {
      saveGameToLocalStorage(gameState);
    }
  } catch (error) {
    console.error('Failed to auto-save game:', error);
  }
}

/**
 * Check if there's a saved game
 */
export function hasSavedGame(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    return stored !== null;
  } catch (error) {
    console.error('Failed to check for saved game:', error);
    return false;
  }
}

/**
 * Export game data for backup
 */
export function exportGameData(): string {
  if (typeof window === 'undefined') return '';

  try {
    const data = {
      currentGame: loadGameFromLocalStorage(),
      gameHistory: getGameHistory(),
      playerStats: getPlayerStats(),
      settings: getGameSettings(),
      exportedAt: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export game data:', error);
    return '';
  }
}

/**
 * Import game data from backup
 */
export function importGameData(jsonData: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = JSON.parse(jsonData);

    if (data.currentGame) {
      saveGameToLocalStorage(data.currentGame);
    }

    if (data.gameHistory && Array.isArray(data.gameHistory)) {
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(data.gameHistory));
    }

    if (data.playerStats) {
      localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(data.playerStats));
    }

    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }

    return true;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return false;
  }
}