function startLevel1() {
  const ctx = canvas.getContext("2d");
  window.isGameOver = false;

  if (typeof window.score !== "number") window.score = 0;
  window.remainingTime = 60;
  window.animationId = null;
  window.timerId = null;
  window.isPaused = false;

  const particles = [];

  const hitSound = new Audio("assets/sounds/hit_block.mp3");
  hitSound.volume = 0.5;
  const bgm = new Audio("assets/sounds/bgm.mp3");
  bgm.loop = true;
  bgm.volume = 0.3;
  bgm.play();
  const clearSound = new Audio("assets/sounds/game_clear.mp3");
  const failSound = new Audio("assets/sounds/game_over.mp3");

  const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 15,
    speed: 7,
  };

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: -4,
  };

  const brickRowCount = 3;
  const brickColumnCount = 6;
  const brickWidth = 100;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 50;
  const brickOffsetLeft = 60;

  const bgImage = new Image();
  bgImage.src = "assets/images/groundBG.png";

  const brickImage = new Image();
  brickImage.src = "assets/images/groundBrick1.png";

  const paddleImage = new Image();
  paddleImage.src = "assets/images/paddle.png";

  window.bricks = [];
  const bricks = window.bricks;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const x = brickOffsetLeft + c * (brickWidth + brickPadding);
      const y = brickOffsetTop + r * (brickHeight + brickPadding);
      bricks.push({
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        visible: true,
      });
    }
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width)
      paddle.x = canvas.width - paddle.width;
  });

  window.checkLevelClear = function () {
    if (window.isGameOver) return;
    const remaining = bricks.filter((b) => b.visible).length;
    if (remaining === 0) {
      window.isGameOver = true;
      cancelAnimationFrame(window.animationId);
      clearInterval(window.timerId);
      bgm.pause();
      clearSound.play();
      window.score += window.remainingTime * 5;
      document.getElementById("score").textContent = window.score;
      document.getElementById("score-value").textContent = window.score;
      showResultModal(true, window.score, 1);
    }
  };

  function drawBackground() {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  }

  function drawBricks() {
    bricks.forEach((brick) => {
      if (brick.visible) {
        ctx.drawImage(brickImage, brick.x, brick.y, brick.width, brick.height);
      }
    });
  }

  function drawPaddle() {
    ctx.drawImage(paddleImage, paddle.x, paddle.y, paddle.width, paddle.height);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }

  function drawScore() {
    document.getElementById("score").textContent = window.score;
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`점수: ${window.score}`, 10, 20);
    ctx.fillText(`남은 시간: ${window.remainingTime}s`, 10, 40);
  }

  function update() {
    drawBackground();
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
      ball.dx *= -1;
    }
    if (ball.y < ball.radius) {
      ball.dy *= -1;
    }

    if (ball.y > canvas.height - ball.radius) {
      cancelAnimationFrame(window.animationId);
      clearInterval(window.timerId);
      bgm.pause();
      failSound.play();
      showResultModal(false, window.score, 1);
      return;
    }

    if (
      ball.y + ball.radius > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.dy *= -1;
      ball.y = paddle.y - ball.radius;
    }

    bricks.forEach((brick) => {
      if (
        brick.visible &&
        ball.x > brick.x &&
        ball.x < brick.x + brick.width &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.height
      ) {
        ball.dy *= -1;
        brick.visible = false;
        window.score += 10;
        document.getElementById("score").textContent = window.score;
        document.getElementById("score-value").textContent = window.score;
        hitSound.currentTime = 0;
        hitSound.play();
      }
    });

    window.checkLevelClear();
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    window.animationId = requestAnimationFrame(update);
  }

  window.timerId = setInterval(() => {
    window.remainingTime--;
    if (window.remainingTime <= 0) {
      clearInterval(window.timerId);
      cancelAnimationFrame(window.animationId);
      bgm.pause();
      failSound.play();
      showResultModal(false, window.score, 1);
    }
  }, 1000);

  update();
}
