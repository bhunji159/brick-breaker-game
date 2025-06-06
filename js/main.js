// main.js: 버튼과 메뉴 전환, 레벨 시작 진입점

// DOM 요소
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("main-menu");
const stageMenu = document.getElementById("stage-menu");
const settingsMenu = document.getElementById("settings-menu");
const storyMenu = document.getElementById("story-menu");

const storyButton = document.getElementById("story-button");
const startButton = document.getElementById("start-button");
const settingsButton = document.getElementById("settings-button");

// const stageButton = document.getElementById("stage-button");
// const exitButton = document.getElementById("exit-button");

const backButtonImage = document.getElementById("back-button-image");

// 캔버스를 표시하고 스타일 적용
function activateGameCanvas() {
	canvas.classList.remove("hidden");
	canvas.style.backgroundColor = "#111";
	canvas.style.border = "2px solid #444";
}

// 메인 버튼 이벤트 바인딩
document.addEventListener("DOMContentLoaded", function () {

	storyButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		storyMenu.classList.remove("hidden");
	});

	startButton.addEventListener("click", function () {
		// mainMenu.classList.add("hidden");
		// activateGameCanvas();
		// startLevel(1); // 기본은 level 1부터 시작
		mainMenu.classList.add("hidden");
		stageMenu.classList.remove("hidden");
	});

	settingsButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		settingsMenu.classList.remove("hidden");
	});

	// stageButton.addEventListener("click", function () {
	// 	mainMenu.classList.add("hidden");
	// 	stageMenu.classList.remove("hidden");
	// });

	// exitButton.addEventListener("click", function () {
	// 	alert("게임을 종료하려면 브라우저를 닫으세요.");
	// });

	backButtonImage.addEventListener("click", function () {
		storyMenu.classList.add("hidden");
		mainMenu.classList.remove("hidden");
	});

	// 스테이지 선택 버튼
	const stageButtons = document.querySelectorAll(".stage-select");
	stageButtons.forEach((btn) => {
		btn.addEventListener("click", function () {
			const level = parseInt(this.dataset.stage);
			stageMenu.classList.add("hidden");
			activateGameCanvas();
			startLevel(level);
		});
	});
});
