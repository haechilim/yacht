var SDICES_POPUP_DELAY = 1000;
var SDICES_ANIMATION_DELAY = 1000;

var soundTimer;
var myId;
var isMyTurn;
var sequence = 0;

var data;

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
	"total"
];

function init() {
	requestJoin(function(json) {
		myId = json.id;
		console.log(json);
		
		var timer = setInterval(function() {
			requestData(function(json) {
				data = json;
				
				if(sequence >= data.sequence) return;
				sequence = data.sequence;
				isMyTurn = data.players[data.turn].id == myId;
				
				updateRollButtonVisibility();
				
				console.log("그렸어");
				console.log(json);
					
				redrawTable();
				redrawBoard();
				//showAllKeepDices(false);
				showAllFloorDices(false);
				
				determinePositions();
				resize();
				bindEvents();
				
				//if(isMyTurn) clearInterval(timer);
			});
		}, 1000);
	});	
}

// ---------------------------------------------

function requestJoin(callback) {
	request("/join" + location.search, callback);
}

function requestRoll(callback) {
	request("/roll?id=" + myId, callback);
}

function requestData(callback) {
	request("/data", callback);
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

// ---------------------------------------------

function rollWithAnimation() {
	if(leftChance <= 0) return;
		
	showAllFloatDices(false);
	showRollButton(false);
	stopDingSound();

	animateCup(function() {
		roll(function() {
			setTimeout(function() {
				showAllFloorDices(false);
				redrawFloatDices(true);
				animateFloatDices();
				
				setTimeout(function() {
					updateSelectable(true);
					redrawTable();
					showGuideNumber(true);
					updateRollButtonVisibility();
					startDingSound();
				}, SDICES_ANIMATION_DELAY);
			}, SDICES_POPUP_DELAY);
		});
	});
	
	decreaseChance();
}

function roll(oncomplete) {
	var positions = [];
	
	showCup(false);
	showAllFloatDices(false);

	for(var index = 0; index < data.rollDices.length; index++) {
		var position = randomPosition();
		positions.push(position);
		
		redrawFloorDice(index, data.rollDices[index], position);
		showFloorDice(index, true);
	}
	
	updateResultDices();
	calculateDiceCounts();
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
	
	function updateResultDices() {
		data.resultDices = data.rollDices.concat([]);
		
		data.keepDices.forEach(function(number) {
			if(number > 0) data.resultDices.push(number);
		});
		
		data.resultDices.sort();
	}
}

// ---------------------------------------------

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

//-------------------------------------------------

function nextTurn() {
	rollDices = [0, 0, 0, 0, 0];
	keepDices = [0, 0, 0, 0, 0];
	
	updateSelectable(false);
	stopDingSound();
	
	if(increaseTurn()) {
		redrawGameTurn();
	
		resetChance();
		showRollButton(true);
		showAllFloatDices(false);
		showAllKeepDices(false);
	}
	else {
		// 최종 결과 출력
		showRollButton(false);
	}
}

function increaseTurn() {
	turn++;
	
	if(turn >= data.players.length) {
		gameTurn++;
		if(gameTurn > MAX_GAME_TURN) return false;
	}
	
	turn %= data.players.length;
	
	return true;
}

// ---------------------------------------------

function resetChance() {
	leftChance = 3;
	redrawChance(leftChance);
}
	
function decreaseChance() {
	leftChance--;
	redrawChance(leftChance);
}

// ---------------------------------------------

function playShakeSound() {
	playSound("shake");
}

function playThrowSound() {
	playSound("result");
}

function playKeepSound() {
	playSound("keep");
}

function startDingSound() {
	soundTimer = setInterval(function() {
		playSound("ding");
	}, 2000);
}

function stopDingSound() {
	if(soundTimer) clearInterval(soundTimer);
}

function playSound(filename) {
	new Audio("sound/" + filename + ".m4a").play();
}

// ---------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
	init();
});

function bindEvents() {
	document.querySelector("#roll").addEventListener('click', function() {
		requestRoll(function(json) {
		});
		/*updateSelectable(false);
		redrawTable();
		rollWithAnimation();*/
	});
	
	document.querySelectorAll(".selectDiceContainer .dice").forEach(function(element) {
		element.addEventListener('click', function() {
			var number = parseInt(this.getAttribute("number"));
			var index = parseInt(this.getAttribute("index"));
			keepDice(number, index);
		});
	});
	
	document.querySelectorAll(".keepDiceContainer .dice").forEach(function(element) {
		element.addEventListener('click', function() {
			var number = parseInt(this.getAttribute("number"));
			var index = parseInt(this.getAttribute("index"));
			unkeepDice(number, index);
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