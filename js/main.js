// main.js: 버튼과 메뉴 전환, 레벨 시작 진입점

// 공 이미지, BGM 설정
window.ballImages = {
    basic: new Image(),
    star: new Image(),
    eye: new Image()
};
window.ballImages.basic.src = "assets/images/ball_basic.png";
window.ballImages.star.src = "assets/images/ball_star.png";
window.ballImages.eye.src = "assets/images/ball_eye.png";
window.currentBallType = "basic";

const musicSelect = document.getElementById("music-select");
window.currentMusic = musicSelect.value;  
musicSelect.addEventListener("change", () => {
	window.currentMusic = musicSelect.value;
	console.log("선택된 BGM:", window.currentMusic);
});

//const startButton = document.getElementById("start-button");
const stageButton = document.getElementById("stage-button");
const settingsButton = document.getElementById("settings-button");


// const exitButton = document.getElementById("exit-button");

// 뒤로가기 
//const senarioBackArrow = document.getElementById("senario-back-arrow");
const stageBackArrow = document.getElementById("stage-back-arrow");
const settingBackArrow = document.getElementById("settings-back-arrow");

// DOM 요소
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("main-menu");
const stageMenu = document.getElementById("stage-menu");
const settingsMenu = document.getElementById("settings-menu");
const storyMenu = document.getElementById("story-menu");

const storyButton = document.getElementById("story-button");

// [추가] 설정 메뉴 UI 요소
const paddleWidthSelect = document.getElementById("paddle-width-select");
const gameTimeSelect = document.getElementById("game-time-select");
const backToMainButton = document.getElementById("back-to-main-button");

window.gameSettings = {
    paddleWidth: 200, // 기본값
    gameTime: 90      // 기본값
};

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
		activateGameCanvas();
		startStory(1);
	});

	// startButton.addEventListener("click", function () {
	// 	mainMenu.classList.add("hidden");
	// 	stageMenu.classList.remove("hidden");
	// });

    stageButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		stageMenu.classList.remove("hidden");
	});

	settingsButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		settingsMenu.classList.remove("hidden");
	});

    backToMainButton.addEventListener('click', () => {
        settingsMenu.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    // [추가] 패들 너비 설정 변경 시 gameSettings 객체 업데이트
    paddleWidthSelect.addEventListener('change', (e) => {
        window.gameSettings.paddleWidth = parseInt(e.target.value, 10);
        console.log(`패들 너비 변경: ${window.gameSettings.paddleWidth}`);
    });

    // [추가] 제한 시간 설정 변경 시 gameSettings 객체 업데이트
    gameTimeSelect.addEventListener('change', (e) => {
        window.gameSettings.gameTime = parseInt(e.target.value, 10);
        console.log(`제한 시간 변경: ${window.gameSettings.gameTime}`);
    });

    // 뒤로 가기 버튼
	// senarioBackArrow.addEventListener("click", function () {
	// 	storyMenu.classList.add("hidden");
	// 	mainMenu.classList.remove("hidden");
	// });

	stageBackArrow.addEventListener("click", function () {
		stageMenu.classList.add("hidden");
		mainMenu.classList.remove("hidden");
	});

	settingBackArrow.addEventListener("click", function () {
		settingsMenu.classList.add("hidden");
		mainMenu.classList.remove("hidden");
	});

	const stageButtons = document.querySelectorAll(".stage-select");
	stageButtons.forEach((btn) => {
		btn.addEventListener("click", function () {
			const level = parseInt(this.dataset.stage);
			stageMenu.classList.add("hidden");
			activateGameCanvas();
			startStory(level);
		});
	});

	// 라디오버튼으로 공 종류 변경
	const ballRadios = document.querySelectorAll('input[name="ball"]');
	ballRadios.forEach(radio => {
		radio.addEventListener('change', function () {
			if (this.checked) {
				window.currentBallType = this.value; 
				console.log("currentBallType:", window.currentBallType);
			}
		});
	});
});

/**
 * 시나리오 번호를 인자로 받아 해당하는 시나리오 데이터 배열을 반환합니다.
 */
const getScenarioByNumber = (scenarioNumber) => {
    return scenarioData.filter(item => item.scenario === scenarioNumber);
};

// ScenarioManager 객체: 시나리오 진행 상태를 관리
const ScenarioManager = {
    currentScenarioNumber: 0,
    currentDialogueIndex: 0,
    currentScenarioData: [],
    isTyping: false,
    isSkipped: false,
    typingTimer: null,
    bgm: null,
    skipButton: null,
    nextButton: null,
    canvas: null,
    ctx: null,
    textContainer: null,
    currentTextElement: null
};

// 원본 시나리오 데이터 (제공된 내용과 동일)
const scenarioData = [
    { scenario : 1, id: 1, end : 0, background: "assets/images/story/sc1/sc1.png", bgm: "assets/sounds/sc1.mp3",
        message: "어느 먼 미래의 지구, 레이싱 도박에 빠져 있던 \n 어느 부자는 새로운 취미를 찾기 위해 \n 지구 땅굴 탐사 대회를 개최하기로 결정한다" },
    { scenario : 1, id: 2, end : 0, background: "assets/images/story/sc1/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "지구를 탐사했다는 증거를 가져오는 연구팀에게는 그에 따른 포상을,\n 가장 먼저 내핵에 다녀온 연구팀에게는 막대한 우승 상금을 수여하는 이 대회는\n 세계 지질 연구자들에게 엄청난 관심을 얻었다." },
    { scenario : 1, id : 3, end : 0, background: "assets/images/story/sc1/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "지구에 각종 현상을 측정하여 기록하던 어느 K 대학의 지질 연구팀은 \n최근 여태껏 보지 못한 값들이 꾸준히 측정되었지만 이를 확인할 방법이 없어 막막해왔다." },
    { scenario : 1, id : 4, end : 0, background: "assets/images/story/sc1/sc4.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이런 상황에서 지구 탐사 대회 소식은 그들에게 있어 \n두번 다시 오지 않을 마지막 기회였기에 \n연구팀은 고민의 시간도 없이 참가를 신청했다." },
    { scenario : 1, id : 5, end : 1, background: "assets/images/story/sc1/sc5.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "부푼 기대를 품으며 한편으론 걱정도 많았던 연구팀은\n 우승 상금을 위해 누구보다 빨리 내핵 탐사를 끝내는 것을 목표로 탐사를 떠난다" },
    { scenario : 2, id: 1, end : 0, background: "assets/images/story/sc2/sc1.png", bgm: "assets/sounds/sc2.mp3",
        message: "단순히 공을 튀기며 땅을 파내려 간다는 것은\n믿을 수 없을 정도로 놀라운 성능을 보여줬다" },
    { scenario : 2, id: 2, end : 0, background: "assets/images/story/sc2/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "얼마전 연구소 근처에서 발견한 이 공은\n어디서 왔는지도 어떤 물질로 되있는지도 모르겠지만\n땅을 잘판다는 결과만은 잘 보여주었다" },
    { scenario : 2, id : 3, end : 0, background: "assets/images/story/sc2/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "탐사할 때 같이 들고온 측정기는 점점 깊이 내려갈 수록 \n측정 값이 요동 치는 정도가 점점 심해지고 있었고\n연구팀은 아직까지도 원인이 무엇인지 알 수 없었다." },
    { scenario : 2, id : 4, end : 1, background: "assets/images/story/sc2/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이 이상 현상의 원인이 무엇인지 더욱 궁금증이 늘어났기에\n 하루 빨리 가장 아래까지 탐사를 마치고\n집에 돌아가고 싶은 연구팀은 더 깊은 곳으로 내려가기 위해 다시 공을 던졌다." },
    { scenario : 3, id: 1, end : 0, background: "assets/images/story/sc3/sc1.png", bgm: "assets/sounds/sc3.mp3", 
        message: "더 깊이 내려와 외핵층 무렵까지 도착했을 땐\n 더이상 측정기가 무언가를 측정한다고 볼 수 없을 정도로\n 이상한 값만을 출력하고 있었다." },
    { scenario : 3, id: 2, end : 0, background: "assets/images/story/sc3/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "측정기가 전원이 켜진다는 것만이 간신히인 상태에서\n 연구팀은 궁금증을 넘어 두려움이 느껴질 정도로 이상함을 느꼈다" },
    { scenario : 3, id : 3, end : 0, background: "assets/images/story/sc3/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "창 밖을 바라봐도 외핵의 상태도 무언가 기묘했다." },
    { scenario : 3, id : 4, end : 0, background: "assets/images/story/sc3/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "외핵층의 액체 상태를 이용하여 아니라\n묘한 광물들이 눈 앞에 둥둥 떠다니고 있었기 때문이다." },
    { scenario : 3, id : 5, end : 1, background: "assets/images/story/sc3/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이런 해석할 수 없는 상황은 연구팀에게\n지금이라도 돌아갈까란 공포를 보다도\n일을 해결하고 싶다는 의지만을 북돋아줄 뿐이었다." },
    { scenario : 4, id: 1, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/sc4.mp3",
        message: "가장 깊은 곳이라고 생각되는 곳에 도착했을 땐 \n 눈 앞엔 의문의 돌덩이가 둥둥떠다니고 있었다." },
    { scenario : 4, id: 2, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "돌덩이에서부터 온갖 에너지파와 신호들이 방출되고 있는 듯 보였으며\n이를 증명하듯 측정기가 여태껏과 비교할 수 없을 정도로 날뛰었다." },
    { scenario : 4, id : 3, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "연구팀은 이 돌덩이의 존재가 곧 이상 현상의 원인이라는 것을 직감적으로 파악할 수 있었고\n금방 자신들이 해야할 일을 알 수 있었다."},
    { scenario : 4, id : 4, end : 1, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이 돌덩이를 부수는 것이 자신들의 목표이며\n 지금 마지막 발굴을 위해 이윽고 공을 다시 던진다" },
    { scenario : 5, id: 1, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/ending.mp3",
        message: "긴 사투 끝에 연구팀은 돌덩이를 산산조각내는데 성공하였다" },
    { scenario : 5, id: 2, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "계속 느껴졌던 기묘한 느낌도 사라지고 측정기도 곧 안정화된 값을 측정하기 시작하였다" },
    { scenario : 5, id : 3, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "짧은 듯 하면서도 길게 느껴진 이번 탐사는\n연구팀에게 적잖은 연구 성과와 결과물을 남겨주었다." },
    { scenario : 5, id : 4, end : 1, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "돌덩이를 부수며 지구에 안정도 가져오고\n누구보다도 빨리 최심층에 도착한 연구팀은\n이제 지상으로 올라가 대회 상금을 받는 것 만이 남았을 뿐이다." }
];

function startStory(scenarioNumber) {
    ScenarioManager.canvas = canvas;
    ScenarioManager.ctx = ctx;
    
    ScenarioManager.currentScenarioNumber = scenarioNumber;
    ScenarioManager.currentScenarioData = getScenarioByNumber(scenarioNumber);
    ScenarioManager.currentDialogueIndex = 0;
    
    if (ScenarioManager.currentScenarioData.length === 0) {
        console.error(`Scenario ${scenarioNumber} 데이터를 찾을 수 없습니다.`);
        endCurrentScenario();
        return;
    }

    if (ScenarioManager.bgm) {
        ScenarioManager.bgm.pause();
    }
    
    const firstDialogue = ScenarioManager.currentScenarioData[0];
    ScenarioManager.bgm = new Audio(firstDialogue.bgm);
    ScenarioManager.bgm.loop = true;
    ScenarioManager.bgm.volume = 0.3;
    ScenarioManager.bgm.play().catch(e => console.error("BGM 재생 오류:", e));
    
    runDialogue(0);
}

async function runDialogue(dialogueIndex) {
    if (ScenarioManager.textContainer) {
        ScenarioManager.textContainer.innerHTML = '';
    }
    
    const dialogue = ScenarioManager.currentScenarioData[dialogueIndex];
    ScenarioManager.currentDialogueIndex = dialogueIndex;
    ScenarioManager.isSkipped = false;

    if (!dialogue) {
        endCurrentScenario();
        return;
    }

    await loadScenarioAssets(dialogue);
    
    hideNextButton();
    showSkipButton();
    
    const textElement = createTextElement();
    await createTypewriterEffect(textElement, dialogue.message);
    
    if (dialogue.end !== 1) {
        showNextButton();
    } else {
        showSkipButton();
    }
}

// [핵심 변경] endCurrentScenario 함수 수정
function endCurrentScenario() {
    if (ScenarioManager.bgm) {
        ScenarioManager.bgm.pause();
        ScenarioManager.bgm = null;
    }
    
    hideSkipButton();
    hideNextButton();
    
    // 시나리오 5(엔딩)일 경우, 페이드 아웃 효과를 실행합니다.
    if (ScenarioManager.currentScenarioNumber == 5) {
        console.log(`시나리오 5 완료. 메인 메뉴로 페이드 아웃합니다.`);
        fadeOutToMainMenu(); // 기존 returnToMainMenu() 대신 호출
        return;
    }
    
    // 그 외 시나리오는 캔버스를 즉시 비우고 다음 레벨을 시작합니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(`시나리오 ${ScenarioManager.currentScenarioNumber} 완료. 레벨을 시작합니다.`);
    startLevel(ScenarioManager.currentScenarioNumber);
}

// [추가] 페이드 아웃 효과를 위한 함수
function fadeOutToMainMenu() {
    const duration = 3000;
    let startTime = null;

    function fadeStep(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }

        const elapsedTime = timestamp - startTime;
        let alpha = elapsedTime / duration;
        alpha = Math.min(alpha, 1); // alpha 값이 1을 넘지 않도록 함

        // 캔버스 위에 점점 진해지는 검은색 사각형을 그림
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (elapsedTime < duration) {
            // 아직 5초가 안 지났으면 다음 프레임 요청
            requestAnimationFrame(fadeStep);
        } else {
            // 5초가 지나면 메인 메뉴로 돌아감
            returnToMainMenu();
        }
    }

    // 페이드 아웃 애니메이션 시작
    requestAnimationFrame(fadeStep);
}

function loadScenarioAssets(dialogue) {
    return new Promise((resolve) => {
        const bgImage = new Image();
        bgImage.onload = () => {
            ScenarioManager.ctx.clearRect(0, 0, canvas.width, canvas.height);
            ScenarioManager.ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            resolve();
        };
        bgImage.src = dialogue.background;
    });
}


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
    button.textContent = '탐사 시작';
    button.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 10px 20px;
        background: rgba(0,0,0,0.7); color: white; border: none;
        border-radius: 5px; cursor: pointer; z-index: 1000; font-family: 'Arial', sans-serif;
    `;
    button.addEventListener('click', () => {
        skipTyping();
        endCurrentScenario();
    });
    return button;
}

function createNextButton() {
    const button = document.createElement('button');
    button.textContent = '다음';
    button.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; padding: 10px 20px;
        background: rgba(0,100,200,0.8); color: white; border: none;
        border-radius: 5px; cursor: pointer; z-index: 1000; font-family: 'Arial', sans-serif;
    `;
    button.addEventListener('click', () => {
        runDialogue(ScenarioManager.currentDialogueIndex + 1);
    });
    return button;
}

function skipTyping() {
    if (ScenarioManager.typingTimer) {
        clearTimeout(ScenarioManager.typingTimer);
        ScenarioManager.typingTimer = null;
    }
    ScenarioManager.isSkipped = true;
}

function createTypewriterEffect(element, text, speed = 60) {
    return new Promise((resolve) => {
        let typingIndex = 0;
        ScenarioManager.isTyping = true;
        
        function typeCharacter() {
            if (ScenarioManager.isSkipped || typingIndex >= text.length) {
                const fullText = text.replace(/\\n/g, '\n');
                element.ctx.clearRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
                element.ctx.fillStyle = "rgba(60, 60, 60, 0.5)";
                element.ctx.fillRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
                drawMultilineText(element.ctx, fullText, element.x, element.y, 24);
                ScenarioManager.isTyping = false;
                resolve();
                return;
            }
            
            const currentTypedText = text.substring(0, typingIndex + 1).replace(/\\n/g, '\n');
            element.ctx.clearRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
            element.ctx.fillStyle = "rgba(60, 60, 60, 0.3)";
            element.ctx.fillRect(element.boxX, element.boxY, element.boxWidth, element.boxHeight);
            drawMultilineText(element.ctx, currentTypedText, element.x, element.y, 24);
            
            typingIndex++;
            ScenarioManager.typingTimer = setTimeout(typeCharacter, speed);
        }
        
        typeCharacter();
    });
}

function drawMultilineText(ctx, text, x, y, lineHeight) {
    ctx.fillStyle = "#ffffff";
    const lines = text.split('\n');
    const totalTextHeight = lines.length * lineHeight;
    const startY = y - (totalTextHeight / 2) + (lineHeight / 2);

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, startY + (i * lineHeight));
    }
}

function createTextElement() {
    const ctx = ScenarioManager.ctx;
    const boxWidth = canvas.width;
    const boxHeight = canvas.height / 4;
    const boxX = 0;
    const boxY = canvas.height - boxHeight;
    ctx.font = '24px Arial';
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const textX = canvas.width / 2;
    const textY = boxY + boxHeight / 2;
    return { ctx: ctx, x: textX, y: textY, boxX: boxX, boxY: boxY, boxWidth: boxWidth, boxHeight: boxHeight };
}

function returnToMainMenu() {
    // 게임 캔버스 숨기기
    canvas.classList.add("hidden");
    // 메인 메뉴 보이기
    mainMenu.classList.remove("hidden");
    // body의 배경을 메인 이미지로 확실하게 변경
    document.body.style.background = 'url("assets/images/clearBG.png") no-repeat center center fixed';
    document.body.style.backgroundSize = 'cover';
}
