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
		startStory(1); // 시나리오 1번을 인자로 전달하여 시작
	});

	settingsButton.addEventListener("click", function () {
		mainMenu.classList.add("hidden");
		settingsMenu.classList.remove("hidden");
	});

	const stageButtons = document.querySelectorAll(".stage-select");
	stageButtons.forEach((btn) => {
		btn.addEventListener("click", function () {
			const level = parseInt(this.dataset.stage);
			stageMenu.classList.add("hidden");
			activateGameCanvas();
			startStory(level); // 해당 레벨(시나리오)의 스토리를 시작
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

// 원본 시나리오 데이터
const scenarioData = [
    {
        scenario : 1, id: 1, end : 0, background: "assets/images/story/sc1/sc1.png", bgm: "assets/sounds/sc1.mp3",
        message: "어느 먼 미래의 지구, 레이싱 도박에 빠져 있던 \n 어느 부자는 새로운 취미를 찾기 위해 \n 지구 땅굴 탐사 대회를 개최하기로 결정한다"
    },
    {
        scenario : 1, id: 2, end : 0, background: "assets/images/story/sc1/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "지구를 탐사했다는 증거를 가져오는 연구팀에게는 그에 따른 포상을,\n 가장 먼저 내핵에 다녀온 연구팀에게는 막대한 우승 상금을 수여하는 이 대회는\n 세계 지질 연구자들에게 엄청난 관심을 얻었다."
    },
    {
        scenario : 1, id : 3, end : 0, background: "assets/images/story/sc1/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "지구에 각종 현상을 측정하여 기록하던 어느 K 대학의 지질 연구팀은 \n최근 여태껏 보지 못한 값들이 꾸준히 측정되었지만 이를 확인할 방법이 없어 막막해왔다."
    },
    {
        scenario : 1, id : 4, end : 0, background: "assets/images/story/sc1/sc4.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이런 상황에서 지구 탐사 대회 소식은 그들에게 있어 \n두번 다시 오지 않을 마지막 기회였기에 \n연구팀은 고민의 시간도 없이 참가를 신청했다."
    },
    {
        scenario : 1, id : 5, end : 1, background: "assets/images/story/sc1/sc5.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "부푼 기대를 품으며 한편으론 걱정도 많았던 연구팀은\n 우승 상금을 위해 누구보다 빨리 내핵 탐사를 끝내는 것을 목표로 탐사를 떠난다"
    },
    {
        scenario : 2, id: 1, end : 0, background: "assets/images/story/sc2/sc1.png", bgm: "assets/sounds/sc2.mp3",
        message: "얼마전 연구소 근처에서 발견한 수상한 공은 어째선지 손쉽게 땅을 파낼 수 있었고\n그 공의 위력에 연구 팀은 매우 놀라웠다"
    },
    {
        scenario : 2, id: 2, end : 0, background: "assets/images/story/sc2/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "연구팀은 이 공의 위력을 잊지 않고 이번 탐사때 들고 내려와\n 아주 손쉽게 남들보다 빨리 땅을 파내며 내려올 수 있었다"
    },
    {
        scenario : 2, id : 3, end : 1, background: "assets/images/story/sc2/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "탐사할 때 같이 들고온 측정기는 점점 깊이 내려갈 수록 \n요동 치는 정도가 점점 심해지고 있었고 연구팀에 얼굴엔 긴장한 표정이 가득이었다."
    },
    {
        scenario : 2, id : 4, end : 1, background: "assets/images/story/sc2/sc3.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "돈을 바라보며 시작한 탐사였지만\n 이 이상 현상의 원인이 무엇인지 더욱 궁금증이 늘어났기에\n 맨틀층을 파내기 준비하는 연구팀이었다."
    },
    {
        scenario : 3, id: 1, end : 0, background: "assets/images/story/sc3/sc1.png", bgm: "assets/sounds/sc3.mp3",
        message: "맨틀층을 지나 외핵층에 도달했을땐 측정기가 출력하는 값은 해석할 수 없을 정도로 이상 현상의 영향력이 커졌다"
    },
    {
        scenario : 3, id: 2, end : 0, background: "assets/images/story/sc3/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "측정기가 동작하는 것 조차 간신히인 상태에서\n 연구팀은 궁금증을 넘어 두려움이 느껴질 정도로 이상함을 느꼈다"
    },
    {
        scenario : 3, id : 3, end : 1, background: "assets/images/story/sc3/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "측정기 상태 만큼 외핵의 상태도 만만치 않았는데\n기존에 알고 있던 외핵층의 액체 상태 뿐만 아니라\n 광물이라 할 것들이 눈 앞에 둥둥 떠다니고 있었다." 
    },
    {
        scenario : 3, id : 4, end : 1, background: "assets/images/story/sc3/sc2.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "거기에 더해 기묘한 느낌까지 들고 있었기에\n지금이라도 돌아갈까란 공포가 들었지만\n이에 마음을 다잡으며 다시 전진하는 연구팀이었다." 
    },
    {
        scenario : 4, id: 1, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/sc4.mp3",
        message: "내핵에 도착하며 측정기는 더욱더 요란을 떨기 시작했고 곧이어 이 사태의 원인을 확인할 수 있었다."
    },
    {
        scenario : 4, id: 2, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "지구 최심부에는 있을리가 없는 의문의 돌덩이가 둥둥 떠다니고 있었다."
    },
    {
        scenario : 4, id : 3, end : 0, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "돌덩이에서부터 온갖 에너지파와 신호들이 방출되고 있었으며\n연구팀은 이 돌덩이의 존재가 곧 이상 현상의 원인이라는 것을 알 수 있었다"
    },
    {
        scenario : 4, id : 4, end : 1, background: "assets/images/story/sc4/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "상금을 위해서도, 그리고 지구의 안정을 위해서도\n하루 빨리 돌덩이를 부순 다음\n지상으로 돌아가 이번 탐사를 끝내기 위해 결의를 다졌다."
    },
    {
        scenario : 5, id: 1, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/ending.mp3",
        message: "긴 사투 끝에 연구팀은 돌덩이를 산산조각내는데 성공하였다"
    },
    {
        scenario : 5, id: 2, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message: "계속 느껴졌던 기묘한 느낌도 사라지고 측정기도 곧 안정화된 값을 측정하기 시작하였다"
    },
    {
        scenario : 5, id : 3, end : 0, background: "assets/images/story/ending/sc1.png", bgm: "assets/sounds/05. INTRUSION.mp3",
        message : "이제 여태 지하를 파고 내려오며 챙긴 여러 채집물들과 연구 자료와 함께\n지상으로 돌아가 대회 상금을 타고 앞으로도 계속 지구를 위한 연구를 이어나가는 일 만이 남았다."
    }
];

// [수정] BGM 재생 로직을 startStory 함수로 이동
/**
 * 특정 번호의 시나리오를 시작하는 진입점 함수.
 * @param {number} scenarioNumber - 시작할 시나리오의 번호.
 */
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

    // --- [추가] BGM 재생 로직 ---
    // 기존에 재생되던 BGM이 있다면 정지
    if (ScenarioManager.bgm) {
        ScenarioManager.bgm.pause();
    }
    
    // 시나리오의 첫 번째 대사 BGM을 해당 시나리오의 대표 BGM으로 설정하고 재생
    const firstDialogue = ScenarioManager.currentScenarioData[0];
    ScenarioManager.bgm = new Audio(firstDialogue.bgm);
    ScenarioManager.bgm.loop = true;
    ScenarioManager.bgm.volume = 0.3;
    ScenarioManager.bgm.play().catch(e => console.error("BGM 재생 오류:", e));
    // --- BGM 로직 끝 ---
    
    runDialogue(0);
}

/**
 * 현재 시나리오 내에서 특정 인덱스의 대사를 실행합니다.
 */
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
    
    // [수정] 이제 배경 이미지 로딩만 담당
    await loadScenarioAssets(dialogue);
    
    hideNextButton();
    showSkipButton();
    
    const textElement = createTextElement();
    await createTypewriterEffect(textElement, dialogue.message);
    
    if (dialogue.end !== 1) {
        showNextButton();
    } else {
        setTimeout(endCurrentScenario, 1500); 
    }
}

/**
 * 현재 진행 중인 시나리오를 종료하고, 해당 레벨을 시작합니다.
 */
function endCurrentScenario() {
    if (ScenarioManager.bgm) {
        ScenarioManager.bgm.pause();
        ScenarioManager.bgm = null;
    }
    
    hideSkipButton();
    hideNextButton();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log(`시나리오 ${ScenarioManager.currentScenarioNumber} 완료. 레벨을 시작합니다.`);
    startLevel(ScenarioManager.currentScenarioNumber);
}

// [수정] BGM 관련 코드를 제거하고 배경 이미지 로드 기능만 남김
/**
 * 시나리오에 필요한 배경 이미지를 로드하고 설정합니다.
 * @param {object} dialogue - 현재 대사 정보 객체
 */
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

// UI 버튼 생성 및 제어 함수 (이하 변경 없음)
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
        font-family: 'Arial', sans-serif;
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
        font-family: 'Arial', sans-serif;
    `;
    
    button.addEventListener('click', () => {
        runDialogue(ScenarioManager.currentDialogueIndex + 1);
    });
    
    return button;
}

// 타이핑 효과 관련 함수
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

