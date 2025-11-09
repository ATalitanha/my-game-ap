/**
 * Game type definitions for Tic Tac Toe variants
 */

export type Player = 'X' | 'O' | null;
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';
export type GameMode = 'offline' | 'online';
export type GameVariant = 'classic' | 'extended4' | 'extended5' | 'connect4' | '3d';

export interface Position {
  row: number;
  col: number;
  layer?: number; // For 3D games
}

export interface Move {
  player: Player;
  position: Position;
  timestamp: number;
}

export interface GameState {
  id: string;
  variant: GameVariant;
  mode: GameMode;
  status: GameStatus;
  board: Player[][] | Player[][][]; // 2D or 3D board
  currentPlayer: Player;
  winner: Player;
  moves: Move[];
  createdAt: number;
  updatedAt: number;
  playerX?: string; // Player ID for online mode
  playerO?: string; // Player ID for online mode
}

export interface GameRoom {
  id: string;
  name: string;
  variant: GameVariant;
  players: PlayerInfo[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  gameState?: GameState;
}

export interface PlayerInfo {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  isOnline: boolean;
}

export interface GameSettings {
  variant: GameVariant;
  mode: GameMode;
  roomName?: string;
  maxPlayers?: number;
}

export interface GameResult {
  gameId: string;
  variant: GameVariant;
  winner: Player;
  players: string[];
  moves: number;
  duration: number; // in seconds
  timestamp: number;
}

export interface WinPattern {
  type: 'row' | 'col' | 'diag' | 'anti-diag' | 'vertical' | 'horizontal';
  positions: Position[];
}

export interface GameVariantConfig {
  name: string;
  description: string;
  boardSize: { rows: number; cols: number; layers?: number };
  winLength: number;
  allowDiagonals: boolean;
  allow3D: boolean;
}

export interface LocalStorageGame {
  gameState: GameState;
  lastSaved: number;
}

export interface SocketEvents {
  'game:join': { roomId: string; playerId: string };
  'game:leave': { roomId: string; playerId: string };
  'game:move': { roomId: string; move: Move };
  'game:state': { roomId: string; gameState: GameState };
  'room:update': { room: GameRoom };
  'player:ready': { roomId: string; playerId: string };
  'game:start': { roomId: string };
  'game:end': { roomId: string; result: GameResult };
}

export type SocketEventName = keyof SocketEvents;

// Validation types
export interface MoveValidationResult {
  isValid: boolean;
  error?: string;
}

export interface GameValidationResult {
  isValid: boolean;
  errors: string[];
}

// Component prop types
export interface GameBoardProps {
  gameState: GameState;
  onMove: (position: Position) => void;
  disabled?: boolean;
  showCoordinates?: boolean;
}

export interface GameControlsProps {
  gameState: GameState;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export interface PlayerInfoProps {
  player: PlayerInfo;
  isCurrentPlayer: boolean;
  isWinner?: boolean;
}

// API types
export interface CreateGameRequest {
  variant: GameVariant;
  mode: GameMode;
  roomName?: string;
  maxPlayers?: number;
}

export interface CreateGameResponse {
  success: boolean;
  gameId?: string;
  roomId?: string;
  error?: string;
}

export interface MakeMoveRequest {
  gameId: string;
  move: Move;
}

export interface MakeMoveResponse {
  success: boolean;
  gameState?: GameState;
  error?: string;
}

export interface JoinRoomRequest {
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: GameRoom;
  error?: string;
}