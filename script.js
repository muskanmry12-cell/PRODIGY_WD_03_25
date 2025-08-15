const board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;

const mode = localStorage.getItem("mode");
const level = localStorage.getItem("level");
const statusDisplay = document.getElementById("status");
const boardElement = document.getElementById("gameBoard");

function createBoard() {
  boardElement.innerHTML = "";
  board.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.addEventListener("click", handleCellClick);
    boardElement.appendChild(cell);
  });
  updateStatus();
}

function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWin(currentPlayer)) {
    statusDisplay.textContent = `${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  if (board.every(cell => cell)) {
    statusDisplay.textContent = "Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();

  if (mode === "pvc" && currentPlayer === "O") {
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  let index;
  if (level === "easy") {
    const empty = board.map((val, i) => val === "" ? i : null).filter(v => v !== null);
    index = empty[Math.floor(Math.random() * empty.length)];
  } else if (level === "medium") {
    index = findWinningMove("O") || findWinningMove("X") || randomMove();
  } else {
    index = minimax(board, "O").index;
  }

  if (index !== undefined) {
    board[index] = "O";
    renderBoard();
    if (checkWin("O")) {
      statusDisplay.textContent = "O wins!";
      gameActive = false;
    } else if (board.every(cell => cell)) {
      statusDisplay.textContent = "Draw!";
      gameActive = false;
    } else {
      currentPlayer = "X";
      updateStatus();
    }
  }
}

function randomMove() {
  const empty = board.map((val, i) => val === "" ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function findWinningMove(player) {
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWin(player)) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  return null;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

  if (checkStaticWin(newBoard, "X")) return { score: -10 };
  if (checkStaticWin(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (const m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }

  return bestMove;
}

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
  });
}

function checkWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(comb => comb.every(i => board[i] === player));
}

function checkStaticWin(bd, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(comb => comb.every(i => bd[i] === player));
}

function restartGame() {
  for (let i = 0; i < board.length; i++) board[i] = "";
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

function updateStatus() {
  statusDisplay.textContent = `${currentPlayer}'s Turn (${mode.toUpperCase()}, ${level.toUpperCase()})`;
}

createBoard();
