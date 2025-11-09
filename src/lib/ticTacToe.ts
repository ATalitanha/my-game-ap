import { ticPlayer, ticBoard, winer } from './type'

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

function makeMove(index: number, board: ticBoard, setBoard: (board: ticBoard) => void, turn: ticPlayer,setTurn: (turn: ticPlayer) => void,winner:ticPlayer|null,setWin:(winer:winer)=> void) {
  if (!winner && !board[index]) {
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    checkWin(newBoard, setWin);
    howsTurn(turn,setTurn)
  }
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


export { resetBoard, makeMove, checkWin }

// cpu mode