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
  const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],];
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
      hardCpuMode()
    }
    checkWin(board, setWin);
  }

}

function easyCpuMode(board: ticBoard, setBoard: (board: ticBoard) => void) {
  const emptyIndexes = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  board[randomIndex] = 'O'
  setBoard(board)


}

function isCpuCanWin() {
  return false
}

function isPlayerCanWin() {
  return false
}

function mediumCpuMode(board: ticBoard, setBoard: (board: ticBoard) => void) {
  if (isCpuCanWin()) {
    return
  } else if (isPlayerCanWin()) {
    return
  } else {
    easyCpuMode(board, setBoard)
  }
  return
}
function hardCpuMode() {
  return
}




function makeMove(index: number, board: ticBoard, setBoard: (board: ticBoard) => void, turn: ticPlayer, setTurn: (turn: ticPlayer) => void, winner: winer, setWin: (winer: winer) => void, mode: mode, difficulty: difficulty) {
  if (!winner && !board[index] && mode === 'local') {
    localMakeMove(index,board,setBoard,turn,setTurn,setWin)

  }
  if (mode === 'cpu' && difficulty) {
    cpuMakeMove(index, board, setBoard, winner, setWin, difficulty)
  }
}

export {makeMove}