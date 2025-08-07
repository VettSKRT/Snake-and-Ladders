const diceDisplay = document.getElementById("dice");
const turnDisplay = document.getElementById("turn");
const pawnsContainer = document.getElementById("pawns-container");
const diceImg = document.getElementById("dice-img");

let players = [];
let currentPlayer = 0;
let bonusTurn = false; // Untuk melacak bonus jalan jika dapat 6
let playerCount = 4; // Default 4 pemain

// Warna untuk semua pemain
const playerColors = {
  1: { background: 'linear-gradient(45deg, #e74c3c, #c0392b)', boxShadow: '0 4px 12px rgba(231, 76, 60, 0.6)' },
  2: { background: 'linear-gradient(45deg, #3498db, #2980b9)', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.6)' },
  3: { background: 'linear-gradient(45deg, #2ecc71, #27ae60)', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.6)' },
  4: { background: 'linear-gradient(45deg, #caed2b, #caed2b)', boxShadow: '0 4px 12px rgba(202, 237, 43, 0.6)' },
  5: { background: 'linear-gradient(45deg, #f39c12, #e67e22)', boxShadow: '0 4px 12px rgba(243, 156, 18, 0.6)' },
  6: { background: 'linear-gradient(45deg, #1abc9c, #16a085)', boxShadow: '0 4px 12px rgba(26, 188, 156, 0.6)' }
};

// Warna untuk box game info
const playerBoxColors = {
  1: 'linear-gradient(45deg, #e74c3c, #c0392b)',
  2: 'linear-gradient(45deg, #3498db, #2980b9)',
  3: 'linear-gradient(45deg, #2ecc71, #27ae60)',
  4: 'linear-gradient(45deg, #caed2b, #caf411)',
  5: 'linear-gradient(45deg, #f39c12, #e67e22)',
  6: 'linear-gradient(45deg, #1abc9c, #16a085)'
};

// Snake & Ladder
const snakesAndLadders = {
  3: 24,
  5: 14,
  11: 28,
  20: 43,
  37: 83,
  41: 61,
  45: 16,
  56: 75,
  70: 91,
  80: 99,
  27: 9,
  17: 4,
  28: 11,
  54: 32,
  74: 69,
  87: 26,
  93: 72,
  95: 76,
  97: 78,
  83: 2,
};

function initializePlayers() {
  // Ambil jumlah pemain dari localStorage
  const storedPlayerCount = localStorage.getItem('playerCount');
  if (storedPlayerCount) {
    playerCount = parseInt(storedPlayerCount);
  }
  
  // Bersihkan container pion
  pawnsContainer.innerHTML = '';
  
  // Buat array pemain sesuai jumlah yang dipilih
  players = [];
  for (let i = 1; i <= playerCount; i++) {
    players.push({ id: i, pos: 1, el: null });
  }
  
  // Inisialisasi pion
  players.forEach(p => {
    const pawn = document.createElement("div");
    pawn.classList.add("player", `p${p.id}`);
    pawnsContainer.appendChild(pawn);
    p.el = pawn;
    
    // Set warna pion sesuai pemain
    const color = playerColors[p.id];
    if (color) {
      pawn.style.background = color.background;
      pawn.style.boxShadow = color.boxShadow;
    }
    
    updatePosition(p, 1);
  });
  
  console.log(`Game dimulai dengan ${playerCount} pemain`);
}

function rollDice() {
  // Tambahkan efek rolling pada dadu - lebih ringan
  const diceImg = document.getElementById('dice-img');
  diceImg.style.transform = 'scale(1.1)';
  
  const dice = Math.floor(Math.random() * 6) + 1;
  
  // Update tampilan dadu
  diceDisplay.textContent = dice;
  diceImg.src = `dice/dice-${dice}.png`;
  
  console.log('Dice Result:', dice);
  console.log('Dice Image Path:', `dice/dice-${dice}.png`);

  // Memastikan gambar ter-load
  diceImg.onload = function() {
    console.log('Dice image loaded successfully');
    // Reset efek rolling
    setTimeout(() => {
      diceImg.style.transform = 'scale(1)';
    }, 200);
  };
  
  diceImg.onerror = function() {
    console.log('Error loading dice image, using fallback');
    diceImg.src = 'dice/dice-1.png';
    diceImg.style.transform = 'scale(1)';
  };

  let player = players[currentPlayer];
  let originalTarget = player.pos + dice;
  let target = originalTarget;
  
  console.log(`Pemain ${currentPlayer + 1} di posisi ${player.pos}, dadu ${dice}`);
  console.log(`Target awal: ${originalTarget}`);
  
  // Logika baru: jika melebihi 100, hitung mundur
  if (target > 100) {
    const excess = target - 100;
    target = 100 - excess;
    console.log(`Pion melebihi 100! Mundur dari 100 ke ${target}`);
  }
  
  console.log(`Target akhir: ${target}`);

  animateMove(player, player.pos, target, () => {
    if (snakesAndLadders[target]) {
      const dest = snakesAndLadders[target];
      console.log(`Mendarat di snake/ladder! Dari ${target} ke ${dest}`);
      setTimeout(() => {
        updatePosition(player, dest);
        player.pos = dest;
        if (!checkWin(player)) {
          checkBonusTurn(dice);
        }
      }, 500);
    } else {
      player.pos = target;
      if (!checkWin(player)) {
        checkBonusTurn(dice);
      }
    }
  });
}

function checkBonusTurn(dice) {
  if (dice === 6) {
    bonusTurn = true;
    turnDisplay.textContent = `Pemain ${currentPlayer + 1} 🎲 Bonus!`;
    turnDisplay.classList.add('bonus-turn');
    console.log(`Pemain ${currentPlayer + 1} dapat bonus jalan lagi!`);
    
    // Hapus efek bonus setelah 2 detik
    setTimeout(() => {
      turnDisplay.classList.remove('bonus-turn');
    }, 2000);
  } else {
    bonusTurn = false;
    nextTurn();
  }
}

function nextTurn() {
  if (!bonusTurn) {
    currentPlayer = (currentPlayer + 1) % playerCount;
  }
  updateTurnDisplay();
}

function updateTurnDisplay() {
  turnDisplay.textContent = "Pemain " + (currentPlayer + 1);
  
  // Update warna box sesuai pemain
  const gameInfo = document.getElementById('game-info');
  gameInfo.className = ''; // Reset semua class
  gameInfo.classList.add(`player-${currentPlayer + 1}`);
  
  // Set background color secara dinamis
  const boxColor = playerBoxColors[currentPlayer + 1];
  if (boxColor) {
    gameInfo.style.background = boxColor;
  }
}

function animateMove(player, from, to, callback) {
  if (from === to) return callback();
  
  let next;
  if (from < to) {
    // Bergerak maju
    next = from + 1;
  } else {
    // Bergerak mundur
    next = from - 1;
  }
  
  updatePosition(player, next);
  setTimeout(() => animateMove(player, next, to, callback), 200);
}

function updatePosition(player, pos) {
  player.pos = pos;
  const { x, y } = getXY(pos);
  player.el.style.left = `${x}px`;
  player.el.style.top = `${y}px`;
}

function getXY(pos) {
  // Mendeteksi ukuran board berdasarkan lebar container
  const boardContainer = document.getElementById('board-container');
  const boardWidth = boardContainer.offsetWidth;
  
  // Menyesuaikan cellSize berdasarkan ukuran board
  let cellSize;
  if (boardWidth <= 500) {
    cellSize = 50; // Untuk board 500x500px
  } else {
    cellSize = 70; // Untuk board 700x700px
  }
  
  const row = Math.floor((pos - 1) / 10);
  const col = (row % 2 === 0)
    ? (pos - 1) % 10
    : 9 - (pos - 1) % 10;

  // Menyesuaikan offset berdasarkan ukuran board
  const offset = boardWidth <= 500 ? 15 : 20;

  return {
    x: col * cellSize + offset,
    y: (9 - row) * cellSize + offset
  };
}

function startGame() {
  currentPlayer = 0;
  bonusTurn = false;
  initializePlayers();
  updateTurnDisplay();
  diceDisplay.textContent = "-";
  diceImg.src = "dice/dice-1.png";
}

function checkWin(player) {
  if (player.pos === 100) {
    setTimeout(() => {
      alert(`🎉 Selamat! Pemain ${player.id} menang! 🎉`);
      startGame(); // Reset game setelah menang
    }, 500);
    return true;
  }
  return false;
}

// Inisialisasi game saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  initializePlayers();
  updateTurnDisplay();
});