/**
 * Core game logic utilities for Tic Tac Toe variants
 */

import { Player, GameState, Position, Move, GameVariant, WinPattern, MoveValidationResult, GameVariantConfig } from '@/types/game';

/**
 * Game variant configurations
 */
export const GAME_VARIANTS: Record<GameVariant, GameVariantConfig> = {
  classic: {
    name: 'Classic Tic Tac Toe',
    description: 'Traditional 3×3 grid',
    boardSize: { rows: 3, cols: 3 },
    winLength: 3,
    allowDiagonals: true,
    allow3D: false,
  },
  extended4: {
    name: 'Extended 4×4',
    description: 'Larger 4×4 grid',
    boardSize: { rows: 4, cols: 4 },
    winLength: 4,
    allowDiagonals: true,
    allow3D: false,
  },
  extended5: {
    name: 'Extended 5×5',
    description: 'Large 5×5 grid',
    boardSize: { rows: 5, cols: 5 },
    winLength: 4,
    allowDiagonals: true,
    allow3D: false,
  },
  connect4: {
    name: 'Connect Four',
    description: 'Drop pieces vertically',
    boardSize: { rows: 6, cols: 7 },
    winLength: 4,
    allowDiagonals: true,
    allow3D: false,
  },
  '3d': {
    name: '3D Tic Tac Toe',
    description: 'Three layered boards',
    boardSize: { rows: 3, cols: 3, layers: 3 },
    winLength: 3,
    allowDiagonals: true,
    allow3D: true,
  },
};

/**
 * Create a new game board based on variant
 */
export function createBoard(variant: GameVariant): Player[][] | Player[][][] {
  const config = GAME_VARIANTS[variant];
  
  if (config.allow3D && config.boardSize.layers) {
    // 3D board
    return Array(config.boardSize.layers)
      .fill(null)
      .map(() =>
        Array(config.boardSize.rows)
          .fill(null)
          .map(() => Array(config.boardSize.cols).fill(null))
      );
  } else {
    // 2D board
    return Array(config.boardSize.rows)
      .fill(null)
      .map(() => Array(config.boardSize.cols).fill(null));
  }
}

/**
 * Create a new game state
 */
export function createGameState(
  variant: GameVariant,
  mode: GameState['mode'],
  gameId?: string
): GameState {
  const id = gameId || generateGameId();
  const now = Date.now();
  
  return {
    id,
    variant,
    mode,
    status: 'waiting',
    board: createBoard(variant),
    currentPlayer: 'X',
    winner: null,
    moves: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate a move
 */
export function validateMove(
  gameState: GameState,
  position: Position,
  player: Player
): MoveValidationResult {
  if (!player) {
    return { isValid: false, error: 'Invalid player' };
  }

  if (gameState.status !== 'playing') {
    return { isValid: false, error: 'Game is not active' };
  }

  if (gameState.currentPlayer !== player) {
    return { isValid: false, error: 'Not your turn' };
  }

  const config = GAME_VARIANTS[gameState.variant];
  
  // Check bounds
  if (position.row < 0 || position.row >= config.boardSize.rows ||
      position.col < 0 || position.col >= config.boardSize.cols) {
    return { isValid: false, error: 'Position out of bounds' };
  }

  // Check 3D layer bounds
  if (config.allow3D && config.boardSize.layers) {
    if (position.layer === undefined || 
        position.layer < 0 || 
        position.layer >= config.boardSize.layers) {
      return { isValid: false, error: 'Invalid layer' };
    }
  }

  // Check if position is already occupied
  if (config.allow3D && config.boardSize.layers) {
    const board3D = gameState.board as Player[][][];
    if (board3D[position.layer!][position.row][position.col] !== null) {
      return { isValid: false, error: 'Position already occupied' };
    }
  } else {
    const board2D = gameState.board as Player[][];
    if (board2D[position.row][position.col] !== null) {
      return { isValid: false, error: 'Position already occupied' };
    }
  }

  // Special validation for Connect Four
  if (gameState.variant === 'connect4') {
    const board = gameState.board as Player[][];
    // Must place in bottom-most empty position in column
    let canPlace = false;
    for (let row = config.boardSize.rows - 1; row >= 0; row--) {
      if (board[row][position.col] === null) {
        if (row === position.row) {
          canPlace = true;
        }
        break;
      }
    }
    if (!canPlace) {
      return { isValid: false, error: 'Must place in bottom-most empty position' };
    }
  }

  return { isValid: true };
}

/**
 * Make a move on the board
 */
export function makeMove(gameState: GameState, position: Position, player: Player): GameState {
  const validation = validateMove(gameState, position, player);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const newGameState = { ...gameState };
  const config = GAME_VARIANTS[gameState.variant];
  
  // Make the move
  if (config.allow3D && config.boardSize.layers) {
    const board3D = [...newGameState.board as Player[][][]];
    board3D[position.layer!] = board3D[position.layer!].map((row, r) =>
      r === position.row ? [...row] : row
    );
    board3D[position.layer!][position.row][position.col] = player;
    newGameState.board = board3D;
  } else {
    const board2D = [...newGameState.board as Player[][]];
    board2D[position.row] = [...board2D[position.row]];
    board2D[position.row][position.col] = player;
    newGameState.board = board2D;
  }

  // Add move to history
  const move: Move = {
    player,
    position,
    timestamp: Date.now(),
  };
  newGameState.moves = [...newGameState.moves, move];

  // Check for winner
  const winPattern = checkWinner(newGameState, position, player);
  if (winPattern) {
    newGameState.winner = player;
    newGameState.status = 'finished';
  } else if (isBoardFull(newGameState)) {
    newGameState.status = 'draw';
  } else {
    // Switch player
    newGameState.currentPlayer = player === 'X' ? 'O' : 'X';
  }

  newGameState.updatedAt = Date.now();
  return newGameState;
}

/**
 * Check if there's a winner after a move
 */
export function checkWinner(gameState: GameState, lastMove: Position, player: Player): WinPattern | null {
  const config = GAME_VARIANTS[gameState.variant];
  const winLength = config.winLength;

  if (config.allow3D && config.boardSize.layers) {
    return check3DWinner(gameState, lastMove, player, winLength);
  } else {
    return check2DWinner(gameState, lastMove, player, winLength);
  }
}

/**
 * Check for winner in 2D games
 */
function check2DWinner(gameState: GameState, lastMove: Position, player: Player, winLength: number): WinPattern | null {
  const board = gameState.board as Player[][];
  const { row, col } = lastMove;

  // Check horizontal
  const horizontal = checkLine(board, row, col, 0, 1, player, winLength);
  if (horizontal) return horizontal;

  // Check vertical
  const vertical = checkLine(board, row, col, 1, 0, player, winLength);
  if (vertical) return vertical;

  // Check diagonal (top-left to bottom-right)
  const diagonal = checkLine(board, row, col, 1, 1, player, winLength);
  if (diagonal) return diagonal;

  // Check anti-diagonal (top-right to bottom-left)
  const antiDiagonal = checkLine(board, row, col, 1, -1, player, winLength);
  if (antiDiagonal) return antiDiagonal;

  return null;
}

/**
 * Check for winner in 3D games
 */
function check3DWinner(gameState: GameState, lastMove: Position, player: Player, winLength: number): WinPattern | null {
  const board = gameState.board as Player[][][];
  const { row, col, layer } = lastMove;

  // Check 2D patterns on current layer
  const layerWinner = check2DWinner({ ...gameState, board: board[layer!] }, { row, col }, player, winLength);
  if (layerWinner) {
    return {
      ...layerWinner,
      positions: layerWinner.positions.map(pos => ({ ...pos, layer })),
    };
  }

  // Check vertical through layers
  const vertical3D = check3DVertical(board, row, col, player, winLength);
  if (vertical3D) return vertical3D;

  // Check 3D diagonals
  const diagonal3D = check3DDiagonals(board, row, col, layer!, player, winLength);
  if (diagonal3D) return diagonal3D;

  return null;
}

/**
 * Check a line in a specific direction
 */
function checkLine(
  board: Player[][],
  startRow: number,
  startCol: number,
  rowDir: number,
  colDir: number,
  player: Player,
  winLength: number
): WinPattern | null {
  const positions: Position[] = [];
  const rows = board.length;
  const cols = board[0].length;

  // Find the start of the line
  let row = startRow;
  let col = startCol;
  while (
    row >= 0 &&
    col >= 0 &&
    row < rows &&
    col < cols &&
    board[row][col] === player
  ) {
    row -= rowDir;
    col -= colDir;
  }
  row += rowDir;
  col += colDir;

  // Count consecutive pieces
  let count = 0;
  const startPos = { row, col };
  while (
    row >= 0 &&
    col >= 0 &&
    row < rows &&
    col < cols &&
    board[row][col] === player
  ) {
    positions.push({ row, col });
    count++;
    row += rowDir;
    col += colDir;
  }

  if (count >= winLength) {
    return {
      type: getLineType(rowDir, colDir),
      positions: positions.slice(0, winLength),
    };
  }

  return null;
}

/**
 * Check vertical lines in 3D
 */
function check3DVertical(board: Player[][][], row: number, col: number, player: Player, winLength: number): WinPattern | null {
  const layers = board.length;
  const positions: Position[] = [];
  let count = 0;

  for (let layer = 0; layer < layers; layer++) {
    if (board[layer][row][col] === player) {
      positions.push({ row, col, layer });
      count++;
    } else {
      count = 0;
      positions.length = 0;
    }

    if (count >= winLength) {
      return {
        type: 'vertical',
        positions: positions.slice(-winLength),
      };
    }
  }

  return null;
}

/**
 * Check 3D diagonal lines
 */
function check3DDiagonals(board: Player[][][], row: number, col: number, layer: number, player: Player, winLength: number): WinPattern | null {
  const layers = board.length;
  const rows = board[0].length;
  const cols = board[0][0].length;

  // Check main 3D diagonal (layer, row, col all increasing)
  let positions: Position[] = [];
  let count = 0;
  
  // Find start
  let l = layer, r = row, c = col;
  while (l >= 0 && r >= 0 && c >= 0) {
    l--; r--; c--;
  }
  l++; r++; c++;

  // Count
  while (l < layers && r < rows && c < cols) {
    if (board[l][r][c] === player) {
      positions.push({ row: r, col: c, layer: l });
      count++;
    } else {
      count = 0;
      positions.length = 0;
    }

    if (count >= winLength) {
      return {
        type: 'diag',
        positions: positions.slice(-winLength),
      };
    }
    l++; r++; c++;
  }

  return null;
}

/**
 * Get line type from direction
 */
function getLineType(rowDir: number, colDir: number): WinPattern['type'] {
  if (rowDir === 0 && colDir === 1) return 'row';
  if (rowDir === 1 && colDir === 0) return 'col';
  if (rowDir === 1 && colDir === 1) return 'diag';
  if (rowDir === 1 && colDir === -1) return 'anti-diag';
  return 'row';
}

/**
 * Check if the board is full (draw)
 */
export function isBoardFull(gameState: GameState): boolean {
  const config = GAME_VARIANTS[gameState.variant];
  
  if (config.allow3D && config.boardSize.layers) {
    const board = gameState.board as Player[][][];
    return board.every(layer =>
      layer.every(row => row.every(cell => cell !== null))
    );
  } else {
    const board = gameState.board as Player[][];
    return board.every(row => row.every(cell => cell !== null));
  }
}

/**
 * Get available moves for Connect Four
 */
export function getAvailableMoves(gameState: GameState): Position[] {
  if (gameState.variant !== 'connect4') {
    return [];
  }

  const board = gameState.board as Player[][];
  const moves: Position[] = [];
  const rows = board.length;
  const cols = board[0].length;

  for (let col = 0; col < cols; col++) {
    for (let row = rows - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        moves.push({ row, col });
        break;
      }
    }
  }

  return moves;
}

/**
 * Reset game state
 */
export function resetGame(gameState: GameState): GameState {
  return createGameState(gameState.variant, gameState.mode, gameState.id);
}