/* eslint-disable @typescript-eslint/no-unused-vars */
import { winPatterns } from './lib';
import { ticPlayer, ticBoard, winer, difficulty, mode } from './type'
// ofline mode
function resetBoard(setBoard: (board: ticBoard) => void) {
  setBoard(Array(9).fill(null))
}



function howsTurn(turn: ticPlayer, setTurn: (turn: ticPlayer) => void) {
  if (turn === 'X') {
    setTurn('O')
  } else {
    setTurn('X')
  }
}

function localMakeMove(index: number, board: ticBoard, setBoard: (board: ticBoard) => void, turn: ticPlayer, setTurn: (turn: ticPlayer) => void, setWin: (winer: winer) => void) {
  const newBoard = [...board];
  newBoard[index] = turn;
  setBoard(newBoard);
  checkWin(newBoard, setWin);
  howsTurn(turn, setTurn)

}


function checkWin(board: ticBoard, setWin: (winer: winer) => void) {
  winPatterns.forEach(pattern => {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      setWin(board[a]);
      return
    }
  });
  if (!board.includes(null)) {
    setWin('Draw');
  }
}


export { resetBoard, checkWin }

// cpu mode



function easyCpuMode(board: ticBoard, setBoard: (board: ticBoard) => void) {
  const emptyIndexes = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  board[randomIndex] = 'O'
  setBoard(board)


}

function isCpuCanWin(board: ticBoard): [boolean, number] {
  for (const [a, b, c] of winPatterns) {
    if (board[a] === 'O' && board[b] === 'O' && board[c] === null) return [true, c];
    if (board[a] === 'O' && board[c] === 'O' && board[b] === null) return [true, b];
    if (board[b] === 'O' && board[c] === 'O' && board[a] === null) return [true, a];
  }
  return [false, -1];
}

function isPlayerCanWin(board: ticBoard): [boolean, number] {
  for (const [a, b, c] of winPatterns) {
    if (board[a] === 'X' && board[b] === 'X' && board[c] === null) return [true, c];
    if (board[a] === 'X' && board[c] === 'X' && board[b] === null) return [true, b];
    if (board[b] === 'X' && board[c] === 'X' && board[a] === null) return [true, a];
  }
  return [false, -1];
}

function mediumCpuMode(board: ticBoard, setBoard: (board: ticBoard) => void) {
  const [cpuCanWin, winIndex] = isCpuCanWin(board);
  const [playerCanWin, blockIndex] = isPlayerCanWin(board);

  if (cpuCanWin && winIndex !== -1) {
    board[winIndex] = 'O';
  } else if (playerCanWin && blockIndex !== -1) {
    board[blockIndex] = 'O';
  } else {
    easyCpuMode(board, setBoard);
    return;
  }
}

function evaluate(board: ticBoard): number {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === 'O') {
        return -10
      } else {
        return 10
      }
    }
  };
  return 0
}

function isMovesLeft(board: ticBoard): boolean {
  for (const p of board) {
    if (!p) return true
  }
  return false
}

function minimax(board: ticBoard, depth: number, isMax: boolean): number {
  const s = evaluate(board);
  const isMove = isMovesLeft(board);

  // حالت پایانی (برد یا مساوی)
  if (s === 10 || s === -10) return s;
  if (!isMove) return 0;

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
  let bestMove = -1

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const moveVal = minimax(board, 0, true)
      board[i] = null
      if (moveVal < bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }

  return bestMove
}

function hardCpuMode(board: ticBoard, setBoard: (board: ticBoard) => void) {
  const bestMove = findBestMove(board);
  board[bestMove] = 'O';
  setBoard([...board])
  return
}

function cpuMakeMove(index: number, board: ticBoard, setBoard: (board: ticBoard) => void, winner: winer, setWin: (winer: winer) => void, difficulty: difficulty) {
  if (!winner && !board[index]) {
    // handel player move
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    checkWin(newBoard, setWin);

    // handle cpu move
    if (difficulty === 'easy') {
      easyCpuMode(newBoard, setBoard)
    } else if (difficulty === 'medium') {
      mediumCpuMode(newBoard, setBoard)
    } else if (difficulty === 'hard') {
      hardCpuMode(board, setBoard)
    }
    setBoard([...board]);
    checkWin(board, setWin);
  }

}


function makeMove(index: number, board: ticBoard, setBoard: (board: ticBoard) => void, turn: ticPlayer, setTurn: (turn: ticPlayer) => void, winner: winer, setWin: (winer: winer) => void, mode: mode, difficulty: difficulty) {
  if (!winner && !board[index] && mode === 'local') {
    localMakeMove(index, board, setBoard, turn, setTurn, setWin)

  }
  if (mode === 'cpu' && difficulty) {
    cpuMakeMove(index, board, setBoard, winner, setWin, difficulty)
  }
}

export { makeMove }