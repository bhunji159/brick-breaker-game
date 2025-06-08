function startLevel3() {
	// --- 이미지 및 사운드 로드 ---
	const bgImage = new Image();
	bgImage.src = "assets/images/mantleBG.png";
	const brickImage1 = new Image();
	brickImage1.src = "assets/images/mantleBrick1.png";
	const brickImage2 = new Image();
	brickImage2.src = "assets/images/mantleBrick2.png";
	const paddleImage = new Image();
	paddleImage.src = "assets/images/paddle.png";

	// const hitSound = new Audio("assets/sounds/hit_block.mp3");
	// hitSound.volume = 0.3;
	// const bgm = new Audio("assets/sounds/bgm3.mp3");
	// bgm.loop = true;
	// bgm.volume = 0.3;
	// bgm.play();
	// const clearSound = new Audio("assets/sounds/game_clear.mp3");
	// const failSound = new Audio("assets/sounds/game_over.mp3");

	const hitSound = new Audio("assets/sounds/hit_block.mp3");
	hitSound.volume = 0.5;

	let bgm = null;
	if (window.currentMusic != null) {
		bgm = new Audio(`assets/sounds/${window.currentMusic}.mp3`);
		bgm.loop = true;
		bgm.volume = 0.3;
		bgm.play();
	} 

	const clearSound = new Audio("assets/sounds/game_clear.mp3");
	const failSound = new Audio("assets/sounds/game_over.mp3");

	// --- 게임 환경 설정 ---
	const ctx = canvas.getContext("2d");
	window.isGameOver = false;

	if (typeof window.score !== "number") {
		window.score = 0;
	}
	window.remainingTime = window.gameSettings.gameTime;
	window.animationId = null;
	window.timerId = null;
	window.isPaused = false;

	// --- 게임 객체 및 변수 ---
	const particles = [];
	const items = [];

	const paddle = {
		x: canvas.width / 2 - 100,
		y: canvas.height - 30,
		width: window.gameSettings.paddleWidth,
		height: 15,
		speed: 7,
	};

	let balls = [{
		x: canvas.width / 2,
		y: canvas.height - 100, // 아래에서 시작
		radius: 10,
		speed: 4,
		dx: 0,
		dy: -4, // 위로 발사
	}, ];

	let ballSizeLevel = 0;

	const brickRowCount = 9;
	const brickColumnCount = 9;
	const brickWidth = 100;
	const brickHeight = 50;
	const brickPadding = 0;
	const brickOffsetTop = 50;
	const brickOffsetLeft = 80;

	window.bricks = [];
	const bricks = window.bricks;
	// [수정] 벽돌 움직임 속성 변경 (initialX, moveRange 제거)
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
				dx: 1.5 * (r % 2 === 0 ? 1 : -1), // 이동 속도 및 방향
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
		// ctx.beginPath();
		// ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		// ctx.fillStyle = "white";
		// ctx.fill();
		// ctx.closePath();

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
				ctx.drawImage(brickImage1, brick.x, brick.y, brick.width, brick.height);
			}
		});
	}

	function drawScore() {
		const infoBarHeight = 40; // 상단 정보 바의 높이

		// 1. 검은색 배경 바 그리기
		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 반투명 검정
		ctx.fillRect(0, 0, canvas.width, infoBarHeight);

		// 2. 텍스트 스타일 설정
		ctx.font = '22px Arial';
		ctx.fillStyle = 'white';
		ctx.textBaseline = 'middle'; // 텍스트를 수직 중앙 정렬

		// 3. 점수 표시 (왼쪽 정렬)
		ctx.textAlign = 'left';
		ctx.fillText(`Score: ${window.score}`, 20, infoBarHeight / 2);

		// 4. 남은 시간 표시 (오른쪽 정렬)
		ctx.textAlign = 'right';
		ctx.fillText(`Time: ${window.remainingTime}`, canvas.width - 20, infoBarHeight / 2);
	}

	function drawParticles() {
		particles.forEach((p) => {
			ctx.fillStyle = "#FF5722";
			ctx.globalAlpha = p.life / 30;
			ctx.fillRect(p.x, p.y, 3, 3);
			ctx.globalAlpha = 1.0;
		});
	}

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


	// --- 생성 및 업데이트 함수 ---
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
			if (p.life <= 0) particles.splice(i, 1);
		}
	}

	function createItem(x, y) {
		if (Math.random() < 0.1) {
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

		updateBricks();
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

	// [수정] 벽돌이 캔버스 양 끝에 닿으면 방향을 바꾸도록 로직 변경
	function updateBricks() {
		bricks.forEach(brick => {
			if (brick.visible) {
				brick.x += brick.dx;
				// 벽돌의 왼쪽 끝이 캔버스 왼쪽을 벗어나거나, 오른쪽 끝이 캔버스 오른쪽을 벗어나면 방향 전환
				if (brick.x < 0 || brick.x + brick.width > canvas.width) {
					brick.dx *= -1;
				}
			}
		});
	}

	function updateItems() {
		for (let i = items.length - 1; i >= 0; i--) {
			const item = items[i];
			item.y += item.speed;
			if (item.x < paddle.x + paddle.width && item.x + item.width > paddle.x && item.y < paddle.y + paddle.height && item.y + item.height > paddle.y) {
				activatePowerUp(item.type);
				items.splice(i, 1);
				continue;
			}
			if (item.y > canvas.height) items.splice(i, 1);
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
				collidePoint /= (paddle.width / 2);
				let angle = collidePoint * (Math.PI / 3);
				const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
				ball.dx = currentSpeed * Math.sin(angle);
				ball.dy = -currentSpeed * Math.cos(angle);
			}

			bricks.forEach((brick) => {
				if (brick.visible) {
					if (ball.x + ball.radius > brick.x && ball.x - ball.radius < brick.x + brick.width && ball.y + ball.radius > brick.y && ball.y - ball.radius < brick.y + brick.height) {
						ball.dy *= -1;
						// // // [추가] 공과 벽돌의 x축 속도 차이를 공의 방향에 일부 반영하여 더 역동적인 충돌 효과
						// // if (Math.sign(ball.dx) !== Math.sign(brick.dx)) {
						// // 	ball.dx += brick.dx * 0.2;
						// // }
						brick.visible = false;
						window.score += 30;
						createParticles(ball.x, ball.y);
						createItem(brick.x + brick.width / 2, brick.y + brick.height / 2);
						hitSound.currentTime = 0;
						hitSound.play();
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
		if (bricks.every(b => !b.visible)) {
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
		if (isSuccess) clearSound.play();
		else failSound.play();
		showResultModal(isSuccess, window.score, 3);
	}

	window.showResultModal = function (success, finalScore, currentLevel) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const modal = document.getElementById("result-modal");
		const title = document.getElementById("result-title");
		const scoreValue = document.getElementById("score-value");
		const btnMain = document.getElementById("btn-to-main");
		const btnAction = document.getElementById("btn-next-or-retry");
		title.textContent = success ? "굴착 성공!" : "실패..";
		scoreValue.textContent = finalScore;
		btnAction.textContent = success ? "더 깊이 내려가기" : "다시 파기";
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
				startLevel(currentLevel);
			}
		};
		modal.classList.remove("hidden");
	};

	// --- 타이머 ---
	timerId = setInterval(() => {
		if (isGameOver) return;
		window.remainingTime--;
		if (window.remainingTime <= 0) gameOver(false);
	}, 1000);

	// --- 게임 시작 ---
	update();
}
