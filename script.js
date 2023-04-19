// テトリミノの形状を定義する
const TETROMINOS = {
  I: {
    shape: [
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
    ],
    color: "#00FFFF",
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "#0000FF",
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "#FFA500",
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "#FFFF00",
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "#00FF00",
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "#800080",
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "#FF0000",
  },
};

// テトリスのグリッドを定義する
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const grid = [];
for (let row = 0; row < GRID_HEIGHT; row++) {
  grid[row] = [];
  for (let col = 0; col < GRID_WIDTH; col++) {
    grid[row][col] = 0;
  }
}

// テトリミノの落下速度を定義する
let dropStart = Date.now();
let dropSpeed = 1000; // 1秒ごとに落下する

// テトリミノを表示するための関数を定義する
function draw() {
  // ゲーム画面をクリアする
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // テトリミノを描画する
  drawMatrix(player.matrix, player.pos);
}

// テトリミノを描画するための関数を定義する
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = TETROMINOS[value].color;
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// テトリミノを移動させるための関数を定義する
function playerMove(offset) {
  player.pos.x += offset;
  if (collide(grid, player)) {
    player.pos.x -= offset;
  }
}

// テトリミノを回転させるための関数を定義する
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(grid, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// テトリミノを回転させるための関数を定義する
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

// テトリミノが衝突したかどうかを判定するための関数を定義する
function collide(grid, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// テトリミノを下に移動させるための関数を定義する
function playerDrop() {
  const now = Date.now();
  const delta = now - dropStart;
  if (delta > dropSpeed) {
    player.pos.y++;
    if (collide(grid, player)) {
      player.pos.y--;
      merge(grid, player);
      playerReset();
      arenaSweep();
    }
    dropStart = Date.now();
  }
}

// テトリミノをリセットするための関数を定義する
function playerReset() {
  const pieces = "ILJOTSZ";
  player.matrix = TETROMINOS[pieces[(pieces.length * Math.random()) | 0]].shape;
  player.pos.y = 0;
  player.pos.x = ((GRID_WIDTH / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(grid, player)) {
    grid.forEach((row) => row.fill(0));
  }
}

// テトリミノをマージするための関数を定義する
function merge(grid, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        grid[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// フィールドを描画するための関数を定義する
function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(grid, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

// テトリスを実行するための関数を定義する
function gameLoop() {
  playerDrop();
  draw();
  requestAnimationFrame(gameLoop);
}

// フィールドの行を削除するための関数を定義する
function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = grid.length - 1; y > 0; --y) {
    for (let x = 0; x < grid[y].length; ++x) {
      if (grid[y][x] === 0) {
        continue outer;
      }
    }

    const row = grid.splice(y, 1)[0].fill(0);
    grid.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

// キーボードの入力を受け取るための関数を定義する
document.addEventListener("keydown", (event) => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  }
});

// プレイヤーオブジェクトを初期化する
playerReset();

// テトリスを開始する
gameLoop();
