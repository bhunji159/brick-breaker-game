function startLevel4() {
	// --- 이미지 및 사운드 로드 ---
	const bgImage = new Image();
	bgImage.src = "assets/images/coreBG.png";
	const brickImage = new Image();
	brickImage.src = "assets/images/coreBrick1.png";
	const bossBrickImage = new Image();
	bossBrickImage.src = "assets/images/coreBossBrick.png";
	const paddleImage = new Image();
	paddleImage.src = "assets/images/paddle.png";

	const hitSound = new Audio("assets/sounds/hit_block.mp3");
	hitSound.volume = 0.4;
	const bgm = new Audio("assets/sounds/bgm4.mp3");
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
	window.remainingTime = window.gameSettings.gameTime;
	window.animationId = null;
	window.timerId = null;
	window.isPaused = false;
	let brickSpawnerId = null;

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
		y: canvas.height - 100,
		radius: 10,
		speed: 4,
		dx: 0,
		dy: -4,
	}, ];

	let ballSizeLevel = 0;

	const bossBrick = {
		width: 400,
		height: 300,
		x: canvas.width  / 2 - 200,
		y: 10,
		maxHits: 40,
		hitsRemaining: 40,
		visible: true,
	};

	window.bricks = [];
	const bricks = window.bricks;
	const brickWidth = 80;
	const brickHeight = 40;

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
				ctx.drawImage(brickImage, brick.x, brick.y, brick.width, brick.height);
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
			ctx.fillStyle = "#FF1744";
			ctx.globalAlpha = p.life / p.maxLife;
			ctx.fillRect(p.x, p.y, p.size, p.size);
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

	function drawBossBrick() {
		if (bossBrick.visible) {
			ctx.globalAlpha = 0.5 + (bossBrick.hitsRemaining / bossBrick.maxHits) * 0.5;
			ctx.drawImage(bossBrickImage, bossBrick.x, bossBrick.y, bossBrick.width, bossBrick.height);
			ctx.globalAlpha = 1.0;
			ctx.fillStyle = 'white';
			ctx.font = 'bold 30px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			//ctx.fillText(bossBrick.hitsRemaining, bossBrick.x + bossBrick.width / 2, bossBrick.y + bossBrick.height / 2);
		}
	}


	// --- 생성 및 업데이트 함수 ---
	function createParticles(x, y, count = 15) {
		for (let i = 0; i < count; i++) {
			particles.push({
				x,
				y,
				dx: (Math.random() - 0.5) * (Math.random() * 8),
				dy: (Math.random() - 0.5) * (Math.random() * 8),
				life: Math.random() * 40 + 20,
				maxLife: 60,
				size: Math.random() * 3 + 1
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
		if (Math.random() < 0.2) {
			const itemType = Math.random() < 0.5 ? 'multi-ball' : 'big-ball';
			items.push({ x, y, width: 35, height: 35, speed: 2, type: itemType });
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
				balls.forEach(ball => { ball.radius += 5; });
			}
		}
	}

	// [핵심 변경] 벽돌 생성 로직 수정
	function spawnBricks() {
		if (isGameOver || !bossBrick.visible) return;

		bricks.length = 0;

		const spawnCount = 8;
		const brickGap = 30; // 세로 간격 조정

		// 1. 왼쪽 라인 (세로로 생성)
		const leftX = bossBrick.x - brickWidth - 40; // 보스와의 간격
		const verticalStartY = bossBrick.y;
		for (let i = 0; i < spawnCount/2; i++) {
			bricks.push({
				x: leftX,
				y: verticalStartY + i * (brickHeight + brickGap),
				width: brickWidth,
				height: brickHeight,
				visible: true
			});
		}

		for (let i = 0; i < spawnCount/2; i++) {
			bricks.push({
				x: leftX - brickWidth - 20 ,
				y: verticalStartY + i * (brickHeight + brickGap),
				width: brickWidth,
				height: brickHeight,
				visible: true
			});
		}
		
		// 2. 오른쪽 라인 (세로로 생성)
		const rightX = bossBrick.x + bossBrick.width + 40; // 보스와의 간격
		for (let i = 0; i < spawnCount/2; i++) {
			bricks.push({
				x: rightX,
				y: verticalStartY + i * (brickHeight + brickGap),
				width: brickWidth,
				height: brickHeight,
				visible: true
			});
		}
		
		for (let i = 0; i < spawnCount/2; i++) {
			bricks.push({
				x: rightX + brickWidth + 20,
				y: verticalStartY + i * (brickHeight + brickGap),
				width: brickWidth,
				height: brickHeight,
				visible: true
			});
		}

		// 3. 아래쪽 라인 (기존과 동일하게 가로로 생성)
		const bottomStartY = bossBrick.y + bossBrick.height + 40;
		const bottomStartX = bossBrick.x + bossBrick.width / 2 - (spawnCount * (brickWidth + brickGap) - brickGap) / 2;
		for (let i = 0; i < spawnCount; i++) {
			bricks.push({
				x: bottomStartX + i * (brickWidth + brickGap),
				y: bottomStartY,
				width: brickWidth,
				height: brickHeight,
				visible: true
			});
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
		drawBricks();
		drawBossBrick();
		drawItems();
		balls.forEach(drawBall);
		drawParticles();
		drawScore();
		window.animationId = requestAnimationFrame(update);
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

			if (ball.y + ball.radius > paddle.y &&
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

			if (bossBrick.visible && isColliding(ball, bossBrick)) {
				handleCollision(ball, bossBrick);
				bossBrick.hitsRemaining--;
				window.score += 50;
				hitSound.currentTime = 0;
				hitSound.play();
				createParticles(ball.x, ball.y, 30);
				if (bossBrick.hitsRemaining <= 0) {
					bossBrick.visible = false;
					gameOver(true);
					return;
				}
			}

			for (let j = bricks.length - 1; j >= 0; j--) {
				const brick = bricks[j];
				if (brick.visible && isColliding(ball, brick)) {
					handleCollision(ball, brick);
					brick.visible = false;
					bricks.splice(j, 1);
					window.score += 10;
					createParticles(ball.x, ball.y);
					createItem(brick.x + brick.width / 2, brick.y + brick.height / 2);
					hitSound.currentTime = 0;
					hitSound.play();
				}
			}
		}
		if (balls.length === 0 && !isGameOver) gameOver(false);
	}

	function isColliding(ball, rect) {
		return ball.x + ball.radius > rect.x && ball.x - ball.radius < rect.x + rect.width && ball.y + ball.radius > rect.y && ball.y - ball.radius < rect.y + rect.height;
	}

	function handleCollision(ball, brick) {
		const overlapX = (ball.x - (brick.x + brick.width / 2)) / (brick.width / 2);
		const overlapY = (ball.y - (brick.y + brick.height / 2)) / (brick.height / 2);
		if (Math.abs(overlapX) > Math.abs(overlapY)) {
			ball.dx *= -1;
			ball.x = ball.x < brick.x ? brick.x - ball.radius : brick.x + brick.width + ball.radius;
		} else {
			ball.dy *= -1;
			ball.y = ball.y < brick.y ? brick.y - ball.radius : brick.y + brick.height + ball.radius;
		}
	}


	// --- 게임 상태 관리 ---
	function gameOver(isSuccess) {
		if (isGameOver) return;
		isGameOver = true;
		cancelAnimationFrame(window.animationId);
		clearInterval(timerId);
		clearInterval(brickSpawnerId);
		bgm.pause();
		if (isSuccess) {
			window.score += remainingTime * 10;
			clearSound.play();
		} else {
			failSound.play();
		}
		showResultModal(isSuccess, window.score, 4);
	}

	window.showResultModal = function (success, finalScore, currentLevel) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const modal = document.getElementById("result-modal");
		const title = document.getElementById("result-title");
		const scoreValue = document.getElementById("score-value");
		const btnMain = document.getElementById("btn-to-main");
		const btnAction = document.getElementById("btn-next-or-retry");
		title.textContent = success ? "탐사 완료!!!" : "실패...";
		scoreValue.textContent = finalScore;
		btnAction.textContent = success ? "마무리" : "재도전";
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

	brickSpawnerId = setInterval(spawnBricks, 8000);

	// --- 게임 시작 ---
	update();
}
