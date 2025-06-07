function startLevel2() {
	// --- 이미지 및 사운드 로드 ---
	const bgImage = new Image();
	bgImage.src = "assets/images/crustBG.png";
	const brickImg1 = new Image();
	brickImg1.src = "assets/images/crustBrick1.png"; // 내구도 2일 때 이미지
	const brickImg2 = new Image();
	brickImg2.src = "assets/images/crustBrick2.png"; // 내구도 1일 때 이미지

	const paddleImage = new Image();
	paddleImage.src = "assets/images/paddle.png";

	const hitSound = new Audio("assets/sounds/hit_block.mp3");
	hitSound.volume = 0.5;
	const bgm = new Audio("assets/sounds/bgm.mp3");
	bgm.loop = true;
	bgm.volume = 0.3;
	bgm.play();
	const clearSound = new Audio("assets/sounds/game_clear.mp3");
	const failSound = new Audio("assets/sounds/game_over.mp3");

	// --- 게임 환경 설정 ---
	const ctx = canvas.getContext("2d");
	window.isGameOver = false;

	if (typeof window.score !== "number") {
		window.score = 0;
	}
	window.remainingTime = 120;
	window.animationId = null;
	window.timerId = null;
	window.isPaused = false;

	// --- 게임 객체 및 변수 ---
	const particles = [];
	const items = []; // [추가] 아이템 배열

	const paddle = {
		x: canvas.width / 2 - 100,
		y: canvas.height - 30,
		width: 200,
		height: 15,
		speed: 7,
	};

	let balls = [{
		x: canvas.width / 2,
		y: canvas.height - 100, // 아래에서 시작
		radius: 10,
		speed: 3,
		dx: 0,
		dy: -3, // 위로 발사
	}, ];

	let ballSizeLevel = 0; // [추가] 공 크기 파워업 레벨

	const brickRowCount = 3;
	const brickColumnCount = 8;
	const brickWidth = 120;
	const brickHeight = 50;
	const brickPadding = 20;
	const brickOffsetTop = 50;
	const brickOffsetLeft = 60;

	window.bricks = [];
	const bricks = window.bricks;
	// [수정] 벽돌에 내구도(hitsRemaining) 속성 추가
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
				hitsRemaining: 2, // 2번 맞아야 파괴
			});
		}
	}

	// --- 이벤트 리스너 ---
	canvas.addEventListener("mousemove", (e) => {
		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		paddle.x = mouseX - paddle.width / 2;
		if (paddle.x < 0) paddle.x = 0;
		if (paddle.x + paddle.width > canvas.width)
			paddle.x = canvas.width - paddle.width;
	});

	// --- 그리기 함수들 ---
	function drawPaddle() {
		ctx.drawImage(paddleImage, paddle.x, paddle.y, paddle.width, paddle.height);
	}

	function drawBall(ball) {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

	// [수정] 내구도에 따라 다른 벽돌 이미지를 그리도록 수정
	function drawBricks() {
		bricks.forEach((brick) => {
			if (brick.visible) {
				const image = brick.hitsRemaining === 2 ? brickImg1 : brickImg2;
				ctx.drawImage(image, brick.x, brick.y, brick.width, brick.height);
			}
		});
	}

	function drawScore() {
		document.getElementById("score").textContent = window.score;
	}

	function drawParticles() {
		particles.forEach((p) => {
			ctx.fillStyle = "#FFC107"; // 파티클 색상
			ctx.globalAlpha = p.life / 30;
			ctx.fillRect(p.x, p.y, 3, 3);
			ctx.globalAlpha = 1.0;
		});
	}

	// [추가] 아이템을 도형과 텍스트로 그리는 함수
	function drawItems() {
		items.forEach(item => {
			ctx.save();
			let color, text;
			if (item.type === 'multi-ball') {
				color = '#4CAF50';
				text = 'M';
			} else {
				color = '#FF9800';
				text = 'B';
			}
			ctx.fillStyle = color;
			ctx.fillRect(item.x, item.y, item.width, item.height);
			ctx.fillStyle = 'white';
			ctx.font = 'bold 20px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, item.x + item.width / 2, item.y + item.height / 2);
			ctx.restore();
		});
	}


	// --- 파티클 및 아이템 생성/업데이트 ---
	function createParticles(x, y) {
		for (let i = 0; i < 15; i++) {
			particles.push({
				x,
				y,
				dx: (Math.random() - 0.5) * 4,
				dy: (Math.random() - 0.5) * 4,
				life: 30,
			});
		}
	}

	function updateParticles() {
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.x += p.dx;
			p.y += p.dy;
			p.life -= 1;
			if (p.life <= 0) {
				particles.splice(i, 1);
			}
		}
	}

	// [추가] 아이템 생성 함수
	function createItem(x, y) {
		if (Math.random() < 0.25) { // 25% 확률로 아이템 생성
			const itemType = Math.random() < 0.5 ? 'multi-ball' : 'big-ball';
			items.push({
				x,
				y,
				width: 35,
				height: 35,
				speed: 2,
				type: itemType
			});
		}
	}

	// [추가] 파워업 활성화 함수
	function activatePowerUp(type) {
		if (type === 'multi-ball') {
			const angles = [Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6];
			const newBallSpeed = 4;
			angles.forEach(angle => {
				balls.push({
					x: paddle.x + paddle.width / 2,
					y: paddle.y - 10,
					radius: 10 + (ballSizeLevel * 5),
					speed: newBallSpeed,
					dx: Math.cos(angle) * newBallSpeed,
					dy: -Math.sin(angle) * newBallSpeed,
				});
			});
		} else if (type === 'big-ball') {
			if (ballSizeLevel < 3) {
				ballSizeLevel++;
				balls.forEach(ball => {
					ball.radius += 5;
				});
			}
		}
	}


	// --- 메인 게임 루프 ---
	function update() {
		if (isGameOver) return;

		updateBall();
		updateItems();
		updateParticles();

		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
		drawPaddle();
		balls.forEach(drawBall);
		drawBricks();
		drawItems();
		drawParticles();
		drawScore();

		window.animationId = requestAnimationFrame(update);
	}

	function updateItems() {
		for (let i = items.length - 1; i >= 0; i--) {
			const item = items[i];
			item.y += item.speed;

			if (
				item.x < paddle.x + paddle.width &&
				item.x + item.width > paddle.x &&
				item.y < paddle.y + paddle.height &&
				item.y + item.height > paddle.y
			) {
				activatePowerUp(item.type);
				items.splice(i, 1);
				continue;
			}
			if (item.y > canvas.height) {
				items.splice(i, 1);
			}
		}
	}


	function updateBall() {
		for (let i = balls.length - 1; i >= 0; i--) {
			const ball = balls[i];
			ball.x += ball.dx;
			ball.y += ball.dy;

			if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx *= -1;
			if (ball.y - ball.radius < 0) ball.dy *= -1;

			if (ball.y + ball.radius > canvas.height) {
				balls.splice(i, 1);
				continue;
			}

			if (
				ball.y + ball.radius > paddle.y &&
				ball.y - ball.radius < paddle.y + paddle.height &&
				ball.x + ball.radius > paddle.x &&
				ball.x - ball.radius < paddle.x + paddle.width
			) {
				ball.dy *= -1;
				ball.y = paddle.y - ball.radius;
                let collidePoint = ball.x - (paddle.x + paddle.width / 2);
                collidePoint = collidePoint / (paddle.width / 2);
                let angle = collidePoint * (Math.PI / 3);
                const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = currentSpeed * Math.sin(angle);
                ball.dy = -currentSpeed * Math.cos(angle);
			}

			// [수정] 벽돌 충돌 로직
			bricks.forEach((brick) => {
				if (brick.visible) {
					const isColliding = ball.x + ball.radius > brick.x &&
						ball.x - ball.radius < brick.x + brick.width &&
						ball.y + ball.radius > brick.y &&
						ball.y - ball.radius < brick.y + brick.height;
						
					if (isColliding) {
						ball.dy *= -1;
						brick.hitsRemaining--;
						hitSound.currentTime = 0;
						hitSound.play();

						// [수정] 벽돌이 파괴되었을 때만 점수, 파티클, 아이템 생성
						if (brick.hitsRemaining <= 0) {
							brick.visible = false;
							window.score += 20; // Stage 2 점수
							createParticles(ball.x, ball.y);
							// 아이템 생성 함수 호출
							createItem(brick.x + brick.width / 2, brick.y + brick.height / 2);
						}
						checkLevelClear();
					}
				}
			});
		}

		if (balls.length === 0 && !isGameOver) {
			gameOver(false);
		}
	}


	// --- 게임 상태 관리 ---
	function checkLevelClear() {
		if (isGameOver) return;
		const remaining = bricks.filter((b) => b.visible).length;
		if (remaining === 0) {
			window.score += remainingTime * 5;
			gameOver(true);
		}
	};

	function gameOver(isSuccess) {
		if (isGameOver) return;
		isGameOver = true;
		cancelAnimationFrame(window.animationId);
		clearInterval(timerId);
		bgm.pause();
		if (isSuccess) {
			clearSound.play();
		} else {
			failSound.play();
		}
		showResultModal(isSuccess, window.score, 2);
	}

	window.showResultModal = function (success, finalScore, currentLevel) {
		// ... (기존 showResultModal 함수와 동일)
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
				startStory(currentLevel + 1);
			} else {
				window.score = 0;
				startLevel(currentLevel); // startLevel2() 대신 범용 함수 호출
			}
		};
		modal.classList.remove("hidden");
	};

	// --- 타이머 ---
	timerId = setInterval(() => {
		if (isGameOver) return;
		remainingTime--;
		document.getElementById("time").textContent = remainingTime;
		if (remainingTime <= 0) {
			gameOver(false);
		}
	}, 1000);

	// --- 게임 시작 ---
	update();
}
