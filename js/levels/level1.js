function startLevel1() {
	const bgImage = new Image();
	bgImage.src = "assets/images/background/gi0.png"; // 배경 이미지 파일명
	const brickImage = new Image();
	brickImage.src = "assets/images/brick/br0.png"; // 벽돌 이미지 파일명

	const ctx = canvas.getContext("2d");
	window.isGameOver = false;

	if (typeof window.score !== "number") {
		window.score = 0;
	}
	console.log(window.score);
	window.remainingTime =120;
	window.animationId = null;
	window.timerId = null;
	window.isPaused = false;
	window.failSound = new Audio("assets/sounds/game_over.mp3");

	const particles = [];

	const hitSound = new Audio("assets/sounds/hit_block.mp3");
	hitSound.volume = 0.3;

	const bgm = new Audio("assets/sounds/bgm.mp3");
	bgm.loop = true;
	bgm.volume = 0.3;
	bgm.play();

	const clearSound = new Audio("assets/sounds/game_clear.mp3");
	const failSound = new Audio("assets/sounds/game_over.mp3");

	const paddle = {
		x: canvas.width / 2 - 50,
		y: canvas.height - 30,
		width: 150,
		height: 15,
		speed: 7,
	};

	const ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: 10,
		speed: 2,
		dx: 2,
		dy: -2,
	};

	const brickRowCount = 4;
	const brickColumnCount = 10;
	const brickWidth = 100;
	const brickHeight = 50;
	const brickPadding = 10;
	const brickOffsetTop = 50;
	const brickOffsetLeft = 60;
	const brickColor = "#888";

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
				color: brickColor,
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
		if (window.isGameOver) return; // 이미 종료된 상태면 무시
		const remaining = bricks.filter((b) => b.visible).length;
		if (remaining === 0) {
			window.isGameOver = true; // 종료 플래그 설정
			cancelAnimationFrame(window.animationId);
			clearInterval(timerId);
			bgm.pause();
			clearSound.play();
			window.score += remainingTime * 5;
			document.getElementById("score").textContent = window.score;
			document.getElementById("score-value").textContent = window.score;
			showResultModal(true, window.score, 1);
		}
	};

	window.showResultModal = function (success, finalScore, currentLevel) {

		ctx.clearRect(0,0,canvas.width,canvas.height);
		
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
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

	function drawBricks() {
	  bricks.forEach((brick) => {
	    if (brick.visible) {
	      // 이미지를 벽돌 위치에 그림
	      ctx.drawImage(brickImage, brick.x, brick.y, brick.width, brick.height);
	      // 필요하다면, 아래 fillRect는 주석 처리 또는 삭제
	      // ctx.fillStyle = brick.color;
	      // ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
	    }
	  });
	}

	function drawScore() {
		document.getElementById("score").textContent = window.score;
		ctx.fillStyle = "white";
		ctx.font = "16px Arial";
		ctx.fillText(`점수: ${window.score}`, 10, 20);
		ctx.fillText(`남은 시간: ${remainingTime}s`, 10, 40);
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
 		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
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
			isFading = true;
			ctx.clearRect(0,0,canvas.width,canvas.height);
			cancelAnimationFrame(animationId);
			clearInterval(timerId);
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
			if (brick.visible) {
				if (
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
					createParticles(ball.x, ball.y, brick.color);
					hitSound.currentTime = 0;
					hitSound.play();
				}
			}
		});

		window.checkLevelClear();
		if (window.isGameOver)return;
		updateParticles();

		drawPaddle();
		drawBall();
		drawBricks();
		drawScore();
		drawParticles();

		window.animationId = requestAnimationFrame(update);
	}

	timerId = setInterval(() => {
		remainingTime--;
		if (remainingTime <= 0) {
			clearInterval(timerId);
			cancelAnimationFrame(animationId);
			bgm.pause();
			failSound.play();
			showResultModal(false, window.score, 1);
		}
	}, 1000);

	update();
}
