document.addEventListener("keydown", function (e) {
	if (e.key === "c" || e.key === "C") {
		if (typeof bricks !== "undefined") {
			let bonus = 0;

			bricks.forEach((brick) => {
				if (brick.visible) {
					brick.visible = false;
					bonus += 10; // 벽돌 하나당 10점
				}
			});

			if (typeof window.score !== "undefined") {
				window.score += bonus;
				document.getElementById("score").textContent = window.score;
				document.getElementById("score-value").textContent = window.score;
			}

			alert(`💣 치트 발동! ${bonus}점 추가`);

			if (typeof checkLevelClear === "function") {
				checkLevelClear();
			}
		}
	}
});
