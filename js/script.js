const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Responsive: adjust canvas size to parent container on resize
function resizeCanvas() {
  const parentWidth = canvas.parentElement.offsetWidth;
  // Maintain aspect ratio 900:550
  let width = parentWidth;
  let height = Math.round(width * (550 / 900));
  if (width > 900) {
    width = 900;
    height = 550;
  }
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getCanvasSize() {
  return {
    width: canvas.width,
    height: canvas.height
  };
}

function getConstants() {
  const { width, height } = getCanvasSize();
  return {
    WIDTH: width,
    HEIGHT: height,
    PADDLE_WIDTH: Math.round(width * 0.013),
    PADDLE_HEIGHT: Math.round(height * 0.18),
    BALL_RADIUS: Math.round(width * 0.013),
    PADDLE_SPEED: Math.max(5, Math.round(height * 0.014)),
    COMPUTER_EASE: 0.11,
  };
}

let successCount = 0;
let errorCount = 0;

let constants = getConstants();

let playerPaddle = {
  x: constants.WIDTH * 0.022,
  y: constants.HEIGHT / 2 - constants.PADDLE_HEIGHT / 2,
  width: constants.PADDLE_WIDTH,
  height: constants.PADDLE_HEIGHT,
  dy: 0
};

let computerPaddle = {
  x: constants.WIDTH - constants.WIDTH * 0.022 - constants.PADDLE_WIDTH,
  y: constants.HEIGHT / 2 - constants.PADDLE_HEIGHT / 2,
  width: constants.PADDLE_WIDTH,
  height: constants.PADDLE_HEIGHT,
  dy: 0
};

let ball = {
  x: constants.WIDTH / 2,
  y: constants.HEIGHT / 2,
  radius: constants.BALL_RADIUS,
  speed: Math.max(5, constants.WIDTH * 0.008),
  dx: Math.max(5, constants.WIDTH * 0.008) * (Math.random() < 0.5 ? 1 : -1),
  dy: (Math.random() * 4 - 2)
};

function updateConstantsAndObjects() {
  constants = getConstants();
  playerPaddle = {
    x: constants.WIDTH * 0.022,
    y: constants.HEIGHT / 2 - constants.PADDLE_HEIGHT / 2,
    width: constants.PADDLE_WIDTH,
    height: constants.PADDLE_HEIGHT,
    dy: 0
  };

  computerPaddle = {
    x: constants.WIDTH - constants.WIDTH * 0.022 - constants.PADDLE_WIDTH,
    y: constants.HEIGHT / 2 - constants.PADDLE_HEIGHT / 2,
    width: constants.PADDLE_WIDTH,
    height: constants.PADDLE_HEIGHT,
    dy: 0
  };

  ball = {
    x: constants.WIDTH / 2,
    y: constants.HEIGHT / 2,
    radius: constants.BALL_RADIUS,
    speed: Math.max(5, constants.WIDTH * 0.008),
    dx: Math.max(5, constants.WIDTH * 0.008) * (Math.random() < 0.5 ? 1 : -1),
    dy: (Math.random() * 4 - 2)
  };
}

window.addEventListener('resize', () => {
  resizeCanvas();
  updateConstantsAndObjects();
});

// Drawing helpers
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
  ctx.moveTo(constants.WIDTH/2, 0);
  ctx.lineTo(constants.WIDTH/2, constants.HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, constants.WIDTH, constants.HEIGHT);
  ctx.fillStyle = "#181818";
  ctx.fillRect(0, 0, constants.WIDTH, constants.HEIGHT);

  drawNet();

  // Paddles
  drawRect(
    playerPaddle.x,
    playerPaddle.y,
    playerPaddle.width,
    playerPaddle.height,
    "#c5f7d6"
  );
  drawRect(
    computerPaddle.x,
    computerPaddle.y,
    computerPaddle.width,
    computerPaddle.height,
    "#ffe0e0"
  );

  // Ball
  drawCircle(ball.x, ball.y, ball.radius, "#fff");
}

function resetBall(direction = null) {
  ball.x = constants.WIDTH / 2;
  ball.y = constants.HEIGHT / 2;
  ball.dx = ball.speed * ((direction !== null) ? direction : (Math.random() < 0.5 ? 1 : -1));
  ball.dy = (Math.random() * 4 - 2);
}

function update() {
  // Move player paddle
  playerPaddle.y += playerPaddle.dy;
  playerPaddle.y = Math.max(0, Math.min(constants.HEIGHT - playerPaddle.height, playerPaddle.y));

  // Computer AI
  let targetY = ball.y - computerPaddle.height/2;
  let delta = targetY - computerPaddle.y;
  computerPaddle.y += delta * constants.COMPUTER_EASE;
  computerPaddle.y = Math.max(0, Math.min(constants.HEIGHT - computerPaddle.height, computerPaddle.y));

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  } else if (ball.y + ball.radius > constants.HEIGHT) {
    ball.y = constants.HEIGHT - ball.radius;
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
  if (ball.x + ball.radius > constants.WIDTH) {
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

// Controls: Arrow keys for desktop
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') playerPaddle.dy = -constants.PADDLE_SPEED;
  if (e.key === 'ArrowDown') playerPaddle.dy = constants.PADDLE_SPEED;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerPaddle.dy = 0;
});

// Mouse controls: vertical movement
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerPaddle.y = mouseY - playerPaddle.height/2;
  playerPaddle.y = Math.max(0, Math.min(constants.HEIGHT - playerPaddle.height, playerPaddle.y));
});

// Touch controls for mobile: horizontal drag -> vertical paddle
function isMobile() {
  return window.innerWidth < 700 || 'ontouchstart' in window;
}

if (isMobile()) {
  canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      // Map horizontal position to vertical paddle position
      const x = touch.clientX - rect.left;
      // Normalized [0, 1]
      const xNorm = Math.max(0, Math.min(1, x / rect.width));
      playerPaddle.y = xNorm * (constants.HEIGHT - playerPaddle.height);
      playerPaddle.y = Math.max(0, Math.min(constants.HEIGHT - playerPaddle.height, playerPaddle.y));
      e.preventDefault();
    }
  }, {passive: false});
}

// On resize, update everything
resizeCanvas();
updateConstantsAndObjects();
updateStats();
gameLoop();