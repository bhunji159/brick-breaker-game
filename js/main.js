// main.js: 버튼과 메뉴 전환, 레벨 시작 진입점

// DOM 요소
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("main-menu");
const stageMenu = document.getElementById("stage-menu");
const settingsMenu = document.getElementById("settings-menu");
const storyMenu = document.getElementById("story-menu");

const startButton = document.getElementById("start-button");
const stageButton = document.getElementById("stage-button");
const settingsButton = document.getElementById("settings-button");
const storyButton = document.getElementById("story-button");

// 캔버스를 표시하고 스타일 적용
function activateGameCanvas() {
	canvas.classList.remove("hidden");
	canvas.style.backgroundColor = "#111";
	canvas.style.border = "2px solid #444";
}


// 메인 버튼 이벤트 바인딩
document.addEventListener("DOMContentLoaded", function () {
	startButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		activateGameCanvas();
		startLevel(1); // 기본은 level 1부터 시작
	});

	stageButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		stageMenu.classList.remove("hidden");
	});

	storyButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		activateGameCanvas();
		scenarioMain();
	});

	settingsButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		settingsMenu.classList.remove("hidden");
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

// 시나리오 구현 파트 시작
const ScenarioManager = {
    currentScenario: 0,
    scenarios: [],
    isTyping: false,
    isSkipped: false,
    typingTimer: null,
    bgm: null,
    bgmInitialized: false,  // BGM 초기화 상태를 추적하는 플래그 추가
    
    // 기존 UI 요소들
    skipButton: null,
    nextButton: null,
    canvas: null,
    ctx: null,
    textContainer: null,
    currentTextElement: null
};

const scenarioData = [
    {
        id: 1,
        background: "assets/images/story/sc1/sc1.png",
        bgm: "assets/sounds/sc1.mp3",
        message: "어느 먼 미래의 지구, 레이싱 도박에 빠져 있던 \n 어느 부자는 새로운 취미를 찾기 위해 \n 지구 땅굴 탐사 대회를 개최하기로 결정한다"
    },
    {
        id: 2,
        background: "assets/images/story/sc1/sc2.png",
        bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "지구를 탐사했다는 증거를 가져오는 연구팀에게는 그에 따른 포상을,\n 가장 먼저 내핵에 다녀온 연구팀에게는 막대한 우승 상금을 수여하는 이 대회는\n 세계 지질 연구자들에게 엄청난 관심을 얻었다."
    },
    {
        id : 3,
        background: "assets/images/story/sc1/sc3.png",
        bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "지구에 각종 현상을 측정하여 기록하던 어느 K 대학의 지질 연구팀은 \n최근 여태껏 보지 못한 값들이 꾸준히 측정되었지만 이를 확인할 방법이 없어 막막해왔다."
    },
    {
        id : 4,
        background: "assets/images/story/sc1/sc4.png",
        bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이런 상황에서 지구 탐사 대회 소식은 그들에게 있어 \n두번 다시 오지 않을 마지막 기회였기에 \n연구팀은 고민의 시간도 없이 참가를 신청했다."
    },
    {
        id : 5,
        background: "assets/images/story/sc1/sc5.png",
        bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "부푼 기대를 품으며 한편으론 걱정도 많았던 연구팀은\n 우승 상금을 위해 누구보다 빨리 내핵 탐사를 끝내는 것을 목표로 탐사를 떠난다"
    
    }

];

function scenarioMain(){
    // 캔버스 초기화
    ScenarioManager.canvas = document.getElementById('canvas');
    ScenarioManager.ctx = canvas.getContext('2d');
    
    // 첫 번째 시나리오 시작
    runScenario(0);
}

//버튼 생성, 위치, 기능 설정
function showSkipButton() {
    if (!ScenarioManager.skipButton) {
        ScenarioManager.skipButton = createSkipButton();
        document.body.appendChild(ScenarioManager.skipButton);
    }
    ScenarioManager.skipButton.style.display = 'block';
}

function hideSkipButton() {
    if (ScenarioManager.skipButton) {
        ScenarioManager.skipButton.style.display = 'none';
    }
}

function showNextButton() {
    if (!ScenarioManager.nextButton) {
        ScenarioManager.nextButton = createNextButton();
        document.body.appendChild(ScenarioManager.nextButton);
    }
    ScenarioManager.nextButton.style.display = 'block';
}

function hideNextButton() {
    if (ScenarioManager.nextButton) {
        ScenarioManager.nextButton.style.display = 'none';
    }
}

function createSkipButton() {
    const button = document.createElement('button');
    button.textContent = '스킵';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    
    button.addEventListener('click', () => {
        skipTyping();
        runScenario(ScenarioManager.currentScenario + 5);
    });
    
    return button;
}

function createNextButton() {
    const button = document.createElement('button');
    button.textContent = '다음';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: rgba(0,100,200,0.8);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    
    button.addEventListener('click', () => {
        runScenario(ScenarioManager.currentScenario + 1);
    });
    
    return button;
}

//시나리오 동작 함수
function loadScenarioAssets(scenario) {
    return new Promise((resolve) => {
        const bgImage = new Image();
        bgImage.onload = () => {
            // 캔버스에 배경 그리기
            ScenarioManager.ctx.clearRect(0, 0, canvas.width, canvas.height);
            ScenarioManager.ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            
            // BGM은 처음에만 초기화하고 재생
            if (!ScenarioManager.bgmInitialized) {
                // 첫 번째 시나리오에서만 BGM 초기화
                ScenarioManager.bgm = new Audio(scenario.bgm);
                ScenarioManager.bgm.loop = true;
                ScenarioManager.bgm.volume = 0.3;
                ScenarioManager.bgm.play();
                ScenarioManager.bgmInitialized = true;
            }
            // 이후 시나리오에서는 BGM을 건드리지 않음
            
            resolve();
        };
        bgImage.src = scenario.background;
    });
}

//시나리오 함수
async function runScenario(scenarioIndex) {
	if (ScenarioManager.textContainer) {
        ScenarioManager.textContainer.innerHTML = '';
    }
    if (scenarioIndex >= scenarioData.length) {
        // 모든 시나리오 완료
        endAllScenarios();
		startLevel(1);
        return;
    }
    
    const scenario = scenarioData[scenarioIndex];
    ScenarioManager.currentScenario = scenarioIndex;
    ScenarioManager.isSkipped = false;
    
    // 배경 및 BGM 설정
    await loadScenarioAssets(scenario);
    
    // UI 초기화
    hideNextButton();
    showSkipButton();
    
    // 타이핑 효과 실행
    const textElement = createTextElement();
    await createTypewriterEffect(textElement, scenario.message);
    
    // 타이핑 완료 후 다음 버튼 표시
    showNextButton();
}

function skipTyping() {
    if (ScenarioManager.typingTimer) {
        clearTimeout(ScenarioManager.typingTimer);
        ScenarioManager.typingTimer = null;
    }
    ScenarioManager.isSkipped = true;
}

function endAllScenarios() {
    // 모든 시나리오 완료 처리
    if (ScenarioManager.bgm) {
        ScenarioManager.bgm.pause();
        ScenarioManager.bgm = null;
        ScenarioManager.bgmInitialized = false; // 플래그 리셋
    }
    
    hideSkipButton();
    hideNextButton();
    // 게임 메인으로 돌아가거나 엔딩 처리
    console.log('모든 시나리오 완료');
}

function createTypewriterEffect(element, text, speed = 60) {
 return new Promise((resolve) => {
    let typingIndex = 0;
    ScenarioManager.isTyping = true;
    
    function typeCharacter() {
      if (ScenarioManager.isSkipped || typingIndex >= text.length) {
        // 모든 텍스트 표시 (스킵되었거나 모든 텍스트가 표시된 경우)
        const textToShow = text.replace(/\\n/g, '\n');
        element.ctx.clearRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
        element.ctx.fillStyle = "rgba(60, 60, 60, 0.5)";
        element.ctx.fillRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
        drawMultilineText(element.ctx, textToShow, element.x, element.y, 24);
        ScenarioManager.isTyping = false;
        resolve();
        return;
      }
      
      // 현재까지의 텍스트 가져오기
      const textToShow = text.substring(0, typingIndex + 1).replace(/\\n/g, '\n');
      
      // 배경 박스 다시 그리기
      element.ctx.clearRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
      element.ctx.fillStyle = "rgba(60, 60, 60, 0.3)";
      element.ctx.fillRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
      
      // 텍스트 그리기
      drawMultilineText(element.ctx, textToShow, element.x, element.y, 24);
      
      typingIndex++;
      ScenarioManager.typingTimer = setTimeout(typeCharacter, speed);
    }
    
    typeCharacter();
  });
}

// 여러 줄의 텍스트를 그리는 함수
function drawMultilineText(ctx, text, x, y, lineHeight) {

  ctx.fillStyle = "#ffffff"; // ← 이 줄을 반드시 추가
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight) - ((lines.length - 1) * lineHeight / 2));
  }
}


function createTextElement() {
  // Canvas 컨텍스트 가져오기
  const ctx = canvas.getContext("2d");
  
  // 반투명 배경 박스 크기 및 위치 계산
  const boxWidth = canvas.width;
  const boxHeight = canvas.height / 4;
  const boxX = 0;
  const boxY = canvas.height - boxHeight;
  
  // 반투명 배경 박스 그리기
  // ctx.fillStyle = "rgba(60, 60, 60, 0.3)";
  // ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  
  // 텍스트 스타일 설정
  ctx.font = '24px Arial';
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  
  // 텍스트 위치 계산
  const textX = canvas.width / 2;
  const textY = boxY + boxHeight / 2;
  
  // 텍스트 객체 반환
  return {
    ctx: ctx,
    x: textX,
    y: textY,
    boxX: boxX,
    boxY: boxY,
    boxWidth: boxWidth,
    boxHeight: boxHeight
  };
}

