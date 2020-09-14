var SDICES_POPUP_DELAY = 1000;
var SDICES_ANIMATION_DELAY = 1000;

// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;

// 참가요청에 대한 응답코드
var JOIN_SUCCESS = 0;
var JOIN_NO_ID = 1;
var JOIN_ALREADY_EXISTS = 2;

// 게임 상태(Game Status)
var GS_NORMAL = 0;
var GS_ROLL = 1;
var GS_KEEP = 2;
var GS_WAITING = 3;
var GS_RESULT = 4;

// 게임 데이터 요청 주기
var GAME_DATA_REQUEST_INTERVAL = 1000;

var soundTimer;
var myId;
var sequence = 0;

var data;

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
	"total"
];

function init() {	
	requestJoin(function(json) {
		console.log(json);
		if(json.code != JOIN_NO_ID) myId = json.id;
		setInterval(requestGameData, GAME_DATA_REQUEST_INTERVAL);
	});	
}

function requestGameData() {
	requestData(function(json) {
		if(sequence >= json.sequence) return;
		data = json;
		sequence = data.sequence;
		
		console.log(data);
		
		redrawScoreTable();
		redrawGameBoard();
		determinePositions();
		resize();
		
		console.log(data.players[0].lastResponse);
	});
}

// ---------------------- 서버 요청 -----------------------

function requestJoin(callback) {
	request("/join" + location.search, callback);
}

function requestStart(callback) {
	request("/start?id=" + myId, callback);
}


function requestAbort(callback) {
	request("/abort?id=" + myId, callback);
}

function requestRoll(callback) {
	request("/roll?id=" + myId, callback);
}

function requestKeep(index, callback) {
	request("/keep?id=" + myId + "&index=" + index, callback);
}

function requestUnkeep(index, callback) {
	request("/unkeep?id=" + myId + "&index=" + index, callback);
}

function requestScore(category, callback) {
	request("/score?id=" + myId + "&category=" + category, callback);
}

function requestData(callback) {
	request("/data?id=" + myId, callback);
}

function request(url, callback) {
	var xhr = new XMLHttpRequest();
		
	xhr.addEventListener("load", function() {
		var json = JSON.parse(xhr.responseText);
		if(callback) callback(json);
	});
	
	xhr.open("GET", url, true);
	xhr.send();
}

// -------------------- 주사위 굴리기 -------------------------

function rollWithAnimation() {
	if(leftChance <= 0) return;
		
	showAllFloatDices(false);
	showRollButton(false);
	redrawKeepDices();
	clearGuideScores();
	stopDingSound();

	animateCup(function() {
		roll(function() {
			setTimeout(function() {
				showAllFloorDices(false);
				redrawFloatDices(true);
				animateFloatDices();
				
				setTimeout(function() {
					redrawScoreTable();
					updateRollButtonVisibility();
					if(isMyTurn()) startDingSound();
				}, SDICES_ANIMATION_DELAY);
			}, SDICES_POPUP_DELAY);
		});
	});
}

function roll(oncomplete) {
	var positions = [];
	
	showCup(false);
	showAllFloatDices(false);

	for(var index = 0; index < data.rollDices.length; index++) {
		if(data.rollDices[index] <= 0) {
			showFloorDice(index, false);
			continue;
		}
		
		var position = randomPosition();
		positions.push(position);
		
		redrawFloorDice(index, data.rollDices[index], position);
		showFloorDice(index, true);
	}
	
	playThrowSound();
	
	if(oncomplete) oncomplete();
	
	function randomPosition() {
		var MAX_RETRY_COUNT = 100;
		
		for(var i = 0; i < MAX_RETRY_COUNT; i++) {
			position = _randomPosition();
			if(i >= MAX_RETRY_COUNT -1 || !isOverlapped(position)) break;
		}
		
		return position;
	}
	
	function _randomPosition() {
		var left = Math.floor(Math.random() * (floorPosition.width - rDiceSize.width)) + floorPosition.left;
		var top = Math.floor(Math.random() * (floorPosition.height - rDiceSize.height)) + floorPosition.top;
		
		return {
			left: left,
			top: top,
			right: left + rDiceSize.width,
			bottom: top + rDiceSize.height
		};
	}

	function isOverlapped(position) {		
		for(var i = 0; i < positions.length; i++) {
			if((position.left >= positions[i].left && position.left <= positions[i].right) || (position.right >= positions[i].left && position.right <= positions[i].right)){
				if((position.top >= positions[i].top && position.top <= positions[i].bottom) || (position.bottom >= positions[i].top && position.bottom <= positions[i].bottom)) {
					return true;
				}
			}
		}
		
		return false;
	}
}

// -------------------- 주사위 킵/언킵 -------------------------

function keepDice(number, index) {
	if(index < 0 || index >= data.rollDices.length) return;
	
	data.rollDices.splice(index, 1);
	fillAtEmptySlot(number);
	
	playKeepSound();
	redrawFloatDices();
	redrawKeepDices();
	updateRollButtonVisibility();
	
	function fillAtEmptySlot(number) {
		for(var i = 0; i < data.keepDices.length; i++) {
			if(data.keepDices[i] == 0) {
				data.keepDices[i] = number;
				break;
			}
		}
	}
}

function unkeepDice(number, index) {
	if(index < 0 || index >= keepDices.length) return;
	
	keepDices[index] = 0;
	rollDices.push(number);
	rollDices.sort();
	
	playKeepSound();
	redrawFloatDices();
	redrawKeepDices();
	updateRollButtonVisibility();
}

// ---------------------------------------------

function isMyTurn() {
	return data.players[data.turn].id == myId;
}

function AmIOwner() {
	return getPlayerById(myId).owner;
}

function getPlayerById(id) {
	for(var i = 0; i < data.players.length; i++) {
		var player = data.players[i];
		if(player.id == id) return player;
	}
	
	return null;
}

// -------------------- 소리 재생 -------------------------

function playShakeSound() {
	playSound("shake");
}

function playThrowSound() {
	playSound("result");
}

function playKeepSound() {
	playSound("keep");
}

function playApplauseSound() {
	playSound("applause", ".mp3");
}

function startDingSound() {
	soundTimer = setInterval(function() {
		playSound("ding");
	}, 2000);
}

function stopDingSound() {
	if(soundTimer) clearInterval(soundTimer);
}

function playSound(filename, extension) {
	if(!extension) extension = ".m4a";
	new Audio("sound/" + filename + extension).play();
}

// -------------------- 이벤트 바인딩 -------------------------

document.addEventListener("DOMContentLoaded", function() {
	init();
	bindEvents();
});

function bindEvents() {
	document.querySelector(".bottom-controls #start").addEventListener('click', function() {
		requestStart(function(json) {
			requestGameData();
		});
	});
	
	document.querySelector(".bottom-controls #abort").addEventListener('click', function() {
		requestAbort(function(json) {
			requestGameData();
		});
	});
	
	document.querySelector("#roll").addEventListener('click', function() {
		showAllFloatDices(false);
		showRollButton(false);
		stopDingSound();
		
		requestRoll(function(json) {
			requestGameData();
		});
	});
	
	document.querySelectorAll(".selectDiceContainer .dice").forEach(function(element) {
		element.addEventListener('click', function() {
			if(!isMyTurn()) return;
			
			var index = parseInt(this.getAttribute("index"));
			
			requestKeep(index, function(json) {
				requestGameData();
			});
		});
	});
	
	document.querySelectorAll(".keepDiceContainer .dice").forEach(function(element) {
		element.addEventListener('click', function() {
			if(!isMyTurn()) return;
			
			var index = parseInt(this.getAttribute("index"));
			
			requestUnkeep(index, function(json) {
				requestGameData();
			});
		});
	});	
	
	document.addEventListener("contextmenu", function(event) {
		event.preventDefault();
	});
	
	document.addEventListener("selectstart", function(event) {
		event.preventDefault();
	});
	
	document.addEventListener("dragstart", function(event) {
		event.preventDefault();
	});
}