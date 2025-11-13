import { winPatterns } from './lib';
import { ticPlayer, ticBoard, winer, difficulty, mode } from './type';

// 🟢 Reset board
function resetBoard(setBoard: (board: ticBoard) => void) {
  setBoard(Array(9).fill(null));
}

// 🟢 Switch player turn
function howsTurn(turn: ticPlayer, setTurn: (turn: ticPlayer) => void) {
  setTurn(turn === 'X' ? 'O' : 'X');
}

// 🟢 Local (offline) move handler
function localMakeMove(
  index: number,
  board: ticBoard,
  setBoard: (board: ticBoard) => void,
  turn: ticPlayer,
  setTurn: (turn: ticPlayer) => void,
  setWin: (w: winer) => void
) {
  const newBoard = [...board];
  newBoard[index] = turn;
  setBoard(newBoard);
  checkWin(newBoard, setWin);
  howsTurn(turn, setTurn);
}

// 🟢 Win Checker
function checkWin(board: ticBoard, setWin: (w: winer) => void) {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      setWin(board[a]);
      return;
    }
  }
  if (!board.includes(null)) {
    setWin('Draw');
  }
}

export { resetBoard, checkWin };

// 🧠 AI (CPU) LOGIC

// --- Utility: find empty spots ---
function getEmptyIndexes(board: ticBoard): number[] {
  return board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
}

function getRandomEmptyIndex(board: ticBoard): number {
  const empties = getEmptyIndexes(board);
  if (empties.length === 0) return -1;
  return empties[Math.floor(Math.random() * empties.length)];
}

// --- EASY mode ---
function easyCpuMove(board: ticBoard): number {
  return getRandomEmptyIndex(board);
}

// --- MEDIUM mode ---
function mediumCpuMove(board: ticBoard): number {
  for (const [a, b, c] of winPatterns) {
    if (board[a] === 'O' && board[b] === 'O' && board[c] === null) return c;
    if (board[a] === 'O' && board[c] === 'O' && board[b] === null) return b;
    if (board[b] === 'O' && board[c] === 'O' && board[a] === null) return a;
  }

  for (const [a, b, c] of winPatterns) {
    if (board[a] === 'X' && board[b] === 'X' && board[c] === null) return c;
    if (board[a] === 'X' && board[c] === 'X' && board[b] === null) return b;
    if (board[b] === 'X' && board[c] === 'X' && board[a] === null) return a;
  }

  return getRandomEmptyIndex(board);
}

// --- HARD mode: Minimax ---
function evaluate(board: ticBoard): number {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === 'O') return -10;
      if (board[a] === 'X') return 10;
    }
  }
  return 0;
}

function isMovesLeft(board: ticBoard): boolean {
  return board.some((cell) => cell === null);
}

function minimax(board: ticBoard, depth: number, isMax: boolean): number {
  const score = evaluate(board);
  if (score === 10 || score === -10) return score;
  if (!isMovesLeft(board)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function findBestMove(board: ticBoard): number {
  let bestVal = Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const moveVal = minimax(board, 0, true);
      board[i] = null;
      if (moveVal < bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

// --- Main CPU handler ---
function cpuMakeMove(
  index: number,
  board: ticBoard,
  setBoard: (board: ticBoard) => void,
  winner: winer,
  setWin: (w: winer) => void,
  difficulty: difficulty
) {
  if (winner || board[index]) return;

  const newBoard = [...board];
  newBoard[index] = 'X';
  setBoard([...newBoard]);
  checkWin(newBoard, setWin);

  const playerWon = winPatterns.some(([a, b, c]) => {
    return (
      newBoard[a] &&
      newBoard[a] === 'X' &&
      newBoard[a] === newBoard[b] &&
      newBoard[a] === newBoard[c]
    );
  });
  if (playerWon) return;

  let moveIndex = -1;
  switch (difficulty) {
    case 'easy':
      moveIndex = easyCpuMove(newBoard);
      break;
    case 'medium':
      moveIndex = mediumCpuMove(newBoard);
      break;
    case 'hard':
      moveIndex = findBestMove(newBoard);
      break;
  }

  if (moveIndex === -1) return;

  const updated = [...newBoard];
  updated[moveIndex] = 'O';
  setBoard(updated);
  checkWin(updated, setWin);
}

// 🟢 Public interface
function makeMove(
  index: number,
  board: ticBoard,
  setBoard: (board: ticBoard) => void,
  turn: ticPlayer,
  setTurn: (turn: ticPlayer) => void,
  winner: winer,
  setWin: (w: winer) => void,
  mode: mode,
  difficulty: difficulty
) {
  if (winner || board[index]) return;

  if (mode === 'local') {
    localMakeMove(index, board, setBoard, turn, setTurn, setWin);
  } else if (mode === 'cpu' && difficulty) {
    cpuMakeMove(index, board, setBoard, winner, setWin, difficulty);
  }
}

export { makeMove };
