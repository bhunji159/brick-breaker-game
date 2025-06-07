function startLevel2() {
	const ctx = canvas.getContext("2d");
	window.isGameOver = false;

	if (typeof window.score !== "number") {
		window.score = 0;
	}
	window.remainingTime = 60;
	window.animationId = null;
	window.timerId = null;
	window.isPaused = false;

	const particles = [];

	const hitSound = new Audio("assets/sounds/hit_block.mp3");
	hitSound.volume = 0.5;

	let bgm = null;
	if (window.currentMusic !== "off") {
		bgm = new Audio(`assets/sounds/${window.currentMusic}.mp3`);
		bgm.loop = true;
		bgm.volume = 0.3;
		bgm.play();
	} else {
		bgm = new Audio("assets/sounds/bgm1.mp3");
		bgm.loop = true;
		bgm.volume = 0.3;
		bgm.play();
	}

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
	const brickColumnCount = 7;
	const brickWidth = 90;
	const brickHeight = 20;
	const brickPadding = 10;
	const brickOffsetTop = 50;
	const brickOffsetLeft = 40;

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
				color: "#888",
				hitsRemaining: 2,
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
			showResultModal(true, window.score, 2);
		}
	};

	window.showResultModal = function (success, finalScore, currentLevel) {
		const modal = document.getElementById("result-modal");
		const title = document.getElementById("result-title");
		const scoreValue = document.getElementById("score-value");
		const btnMain = document.getElementById("btn-to-main");
		const btnAction = document.getElementById("btn-next-or-retry");

		title.textContent = success ? "🎉 스테이지 클리어!" : "💥 게임 오버!";
		scoreValue.textContent = finalScore;
		btnAction.textContent = success ? "다음 스테이지" : "다시 플레이";

		btnMain.onclick = () => {
			modal.classList.add("hidden");
			window.location.reload();
		};

		btnAction.onclick = () => {
			modal.classList.add("hidden");
			if (success) {
				startLevel(currentLevel + 1);
			} else {
				window.score = 0;
				startLevel(currentLevel);
			}
		};

		modal.classList.remove("hidden");
	};

	function drawPaddle() {
		ctx.fillStyle = "white";
		ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	}

	function drawBall() {
		const img = window.ballImages[window.currentBallType];
		if (img && img.complete && img.naturalWidth > 0) {
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.closePath();

			ctx.drawImage(
				window.ballImages[window.currentBallType],
				ball.x - ball.radius,
				ball.y - ball.radius,
				ball.radius * 2,
				ball.radius * 2
			);
		} else {
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.closePath();
		}
	}

	function drawBricks() {
		bricks.forEach((brick) => {
			if (brick.visible) {
				ctx.fillStyle = brick.color;
				ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
			}
		});
	}

	function drawScore() {
		document.getElementById("score").textContent = window.score;
		ctx.fillStyle = "white";
		ctx.font = "16px Arial";
		ctx.fillText(`점수: ${window.score}`, 10, 20);
		ctx.fillText(`남은 시간: ${window.remainingTime}s`, 10, 40);
	}

	function createParticles(x, y, color) {
		for (let i = 0; i < 10; i++) {
			particles.push({
				x,
				y,
				dx: (Math.random() - 0.5) * 4,
				dy: (Math.random() - 0.5) * 4,
				life: 30,
				color,
			});
		}
	}

	function updateParticles() {
		particles.forEach((p) => {
			p.x += p.dx;
			p.y += p.dy;
			p.life -= 1;
		});
		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].life <= 0) {
				particles.splice(i, 1);
			}
		}
	}

	function drawParticles() {
		particles.forEach((p) => {
			ctx.fillStyle = p.color;
			ctx.fillRect(p.x, p.y, 2, 2);
		});
	}

	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function update() {
		clear();

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
			showResultModal(false, window.score, 2);
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
			if (brick.visible) {
				if (
					ball.x > brick.x &&
					ball.x < brick.x + brick.width &&
					ball.y > brick.y &&
					ball.y < brick.y + brick.height
				) {
					ball.dy *= -1;
					brick.hitsRemaining--;
					if (brick.hitsRemaining === 1) {
						brick.color = "#f97316";
					} else if (brick.hitsRemaining <= 0) {
						brick.visible = false;
						window.score += 20;
						document.getElementById("score").textContent = window.score;
						document.getElementById("score-value").textContent = window.score;
						createParticles(ball.x, ball.y, brick.color);
						hitSound.currentTime = 0;
						hitSound.play();
					}
				}
			}
		});

		window.checkLevelClear();
		if (window.isGameOver) return;

		updateParticles();

		drawPaddle();
		drawBall();
		drawBricks();
		drawScore();
		drawParticles();

		window.animationId = requestAnimationFrame(update);
	}

	window.timerId = setInterval(() => {
		window.remainingTime--;
		if (window.remainingTime <= 0) {
			clearInterval(window.timerId);
			cancelAnimationFrame(window.animationId);
			bgm.pause();
			failSound.play();
			showResultModal(false, window.score, 2);
		}
	}, 1000);

	update();
}
