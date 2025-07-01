const board = document.getElementById("board");
const messageElement = document.getElementById("message");
const timerElement = document.getElementById("timer");
const resultElement = document.getElementById("result");
const resetBtn = document.getElementById("reset-btn");

const ROWS = 6;
const COLUMNS = 7;
const PLAYER_1 = "player1"; // Rood
const PLAYER_2 = "player2"; // Geel (Computer)

let boardState;
let currentPlayer;
let gameInProgress;
let timeElapsed = 0;
let timerInterval;

// Maak het bord aan
function createBoard() {
  boardState = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
  board.innerHTML = '';
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      board.appendChild(cell);
    }
  }
}

function startGame() {
  currentPlayer = PLAYER_1;
  gameInProgress = true;
  timeElapsed = 0;
  timerElement.textContent = "00:00";
  resultElement.textContent = '';
  messageElement.textContent = "it's your turn!";
  createBoard();
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const seconds = (timeElapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function handleCellClick(event) {
  if (!gameInProgress) return;
  const col = event.target.dataset.col;
  if (makeMove(col, currentPlayer)) {
    if (checkWin(currentPlayer)) {
      endGame(currentPlayer);
      return;
    }
    switchPlayer();
    if (currentPlayer === PLAYER_2) {
      setTimeout(computerMove, 500);  // Computer pauzeert kort voor meer realisme
    }
  }
}

function makeMove(col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!boardState[row][col]) {
      boardState[row][col] = player;
      animateMove(row, col, player);  // Voeg animatie toe
      return true;
    }
  }
  return false;
}

function animateMove(row, col, player) {
  for (let r = 0; r <= row; r++) {
    setTimeout(() => {
      const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
      cell.classList.remove(PLAYER_1, PLAYER_2);
      if (r === row) {
        cell.classList.add(player);  // Voeg spelerkleur toe als hij is gevallen
      }
    }, r * 100);  // Vertraging voor het vallen
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
  messageElement.textContent = currentPlayer === PLAYER_1 ? "it's your turn!" : "Computers turn...";
}

function computerMove() {
  // Eenvoudige AI-strategie: Eerst controleren of computer kan winnen
  let move = findWinningMove(PLAYER_2);
  if (!move) {
    // Vervolgens controleren of de speler kan winnen, en blokkeer dat
    move = findWinningMove(PLAYER_1);
  }
  if (!move) {
    // Anders doe een willekeurige zet
    move = Math.floor(Math.random() * COLUMNS);
  }
  
  makeMove(move, PLAYER_2);
  if (checkWin(PLAYER_2)) {
    endGame(PLAYER_2);
  } else {
    switchPlayer();
  }
}

function findWinningMove(player) {
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!boardState[row][col]) {
        // Simuleer de zet
        boardState[row][col] = player;
        const isWinningMove = checkWin(player);
        boardState[row][col] = null;  // Zet ongedaan maken
        if (isWinningMove) return col;  // Winnende kolom gevonden
        break;
      }
    }
  }
  return null;
}

function checkWin(player) {
  return checkDirection(player, 1, 0) || // Horizontaal
         checkDirection(player, 0, 1) || // Verticaal
         checkDirection(player, 1, 1) || // Diagonaal naar rechts
         checkDirection(player, 1, -1);  // Diagonaal naar links
}

function checkDirection(player, deltaRow, deltaCol) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (checkLine(player, row, col, deltaRow, deltaCol)) {
        return true;
      }
    }
  }
  return false;
}

function checkLine(player, row, col, deltaRow, deltaCol) {
  for (let i = 0; i < 4; i++) {
    const r = row + i * deltaRow;
    const c = col + i * deltaCol;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLUMNS || boardState[r][c] !== player) {
      return false;
    }
  }
  return true;
}

function endGame(winner) {
  gameInProgress = false;
  clearInterval(timerInterval);
  resultElement.textContent = winner === PLAYER_1 ? "You won! 🥳" : "The computer won! 😢";
}

resetBtn.addEventListener("click", startGame);

// Start het spel bij het laden
startGame();
