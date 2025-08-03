const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 98;
const BALL_RADIUS = 12;
const PADDLE_SPEED = 7;
const COMPUTER_EASE = 0.11; // Smoother AI

let successCount = 0;
let errorCount = 0;

const playerPaddle = {
  x: 20,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const computerPaddle = {
  x: WIDTH - 20 - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  speed: 7,
  dx: 7 * (Math.random() < 0.5 ? 1 : -1),
  dy: (Math.random() * 4 - 2)
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.save();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 16]);
  ctx.beginPath();
  ctx.moveTo(WIDTH/2, 0);
  ctx.lineTo(WIDTH/2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function draw() {
  // Background
  ctx.fillStyle = "#181818";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawNet();

  // Paddles
  drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, "#c5f7d6");
  drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, "#ffe0e0");

  // Ball
  drawCircle(ball.x, ball.y, ball.radius, "#fff");
}

function resetBall(direction = null) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.dx = ball.speed * ((direction !== null) ? direction : (Math.random() < 0.5 ? 1 : -1));
  ball.dy = (Math.random() * 4 - 2);
}

function update() {
  // Move player paddle
  playerPaddle.y += playerPaddle.dy;
  playerPaddle.y = Math.max(0, Math.min(HEIGHT - playerPaddle.height, playerPaddle.y));

  // Computer AI
  let targetY = ball.y - computerPaddle.height/2;
  let delta = targetY - computerPaddle.y;
  computerPaddle.y += delta * COMPUTER_EASE;
  computerPaddle.y = Math.max(0, Math.min(HEIGHT - computerPaddle.height, computerPaddle.y));

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  } else if (ball.y + ball.radius > HEIGHT) {
    ball.y = HEIGHT - ball.radius;
    ball.dy = -ball.dy;
  }

  // Player paddle collision
  if (
    ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
    ball.x > playerPaddle.x &&
    ball.y > playerPaddle.y &&
    ball.y < playerPaddle.y + playerPaddle.height
  ) {
    ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
    let collidePoint = (ball.y - (playerPaddle.y + playerPaddle.height/2)) / (playerPaddle.height/2);
    let angle = collidePoint * Math.PI/4;
    ball.dx = ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);
    if (ball.dx < 0) ball.dx = -ball.dx;
    successCount++;
    updateStats();
  }

  // Computer paddle collision
  if (
    ball.x + ball.radius > computerPaddle.x &&
    ball.x < computerPaddle.x + computerPaddle.width &&
    ball.y > computerPaddle.y &&
    ball.y < computerPaddle.y + computerPaddle.height
  ) {
    ball.x = computerPaddle.x - ball.radius;
    let collidePoint = (ball.y - (computerPaddle.y + computerPaddle.height/2)) / (computerPaddle.height/2);
    let angle = collidePoint * Math.PI/4;
    ball.dx = -ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);
    if (ball.dx > 0) ball.dx = -ball.dx;
  }

  // Ball out (error)
  if (ball.x - ball.radius < 0) {
    errorCount++;
    updateStats();
    resetBall(1);
  }
  if (ball.x + ball.radius > WIDTH) {
    resetBall(-1);
  }
}

function updateStats() {
  document.getElementById('success-count').textContent = successCount;
  document.getElementById('error-count').textContent = errorCount;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') playerPaddle.dy = -PADDLE_SPEED;
  if (e.key === 'ArrowDown') playerPaddle.dy = PADDLE_SPEED;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerPaddle.dy = 0;
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerPaddle.y = mouseY - playerPaddle.height/2;
  playerPaddle.y = Math.max(0, Math.min(HEIGHT - playerPaddle.height, playerPaddle.y));
});

// Start game
updateStats();
gameLoop();