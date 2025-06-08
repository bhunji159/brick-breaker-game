// levelManager.js: 레벨 번호에 따라 해당 레벨 시작

function startLevel(level) {
	if (level === 1) {
		startLevel1();
	} else if (level === 2) {
		startLevel2();
	} else if (level === 3) {
		startLevel3();
	} else if (level === 4) {
		startLevel4();
	} else {
		alert("존재하지 않는 레벨입니다.");
	}
}
