var MAX_GAME_TURN = 12;
var TOTAL_DICES = 5;
var PLAYER_COUNT = 2;

var SDICES_POPUP_DELAY = 1000;
var SDICES_ANIMATION_DELAY = 1000;

var playerIndex = 0;

var gameTurn = 1;
var turn = 0;

var leftChance = 3;
var rollDices = [0, 0, 0, 0, 0];
var keepDices = [0, 0, 0, 0, 0];
var resultDices = [];
var diceCounts = [0, 0, 0, 0, 0, 0];

var soundTimer;

var players = [];

function player(id, avatar) {
	return {
		id: id,
		avatar: avatar,
		categories: [
			{	
				name: "aces",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "deuces",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "threes",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "fours",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "fives",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "sixes",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "choice",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "kind",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "full_house",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "S_straight",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "L_straight",
				fixed: false,
				selectable: false,
				score: 0
			},
			{	
				name: "yacht",
				fixed: false,
				selectable: false,
				score: 0
			},
		],
		subtotal: 0,
		isBonus: false,
		total: 0,
	}
}

function updatePlayers() {
	for(var i = 0; i < PLAYER_COUNT; i++) {
		players.push(player(i, i + 1));
	}
}

function init() {
	updatePlayers();
	updateTable();
	//initScoreBoard();
	//highlightTurn();
	showAllKeepDices(false);
	showAllFloorDices(false);
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
					updateTable();
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
	showAllFloorDices(false);
	showAllFloatDices(false);

	for(var index = 0; index < rollDices.length; index++) {
		var number = randomNumber();
		var position = randomPosition();
		
		rollDices[index] = number;
		positions.push(position);
		
		updateFloorDice(index, number, position);
		showFloorDice(index, true);
	}
	
	rollDices.sort();
	updateResultDices();
	calculateDiceCounts();
	playThrowSound();
	
	if(oncomplete) oncomplete();
	

	function randomNumber() {
		return Math.floor(Math.random() * 6 + 1);
	}
	
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
		resultDices = rollDices.concat([]);
		
		keepDices.forEach(function(number) {
			if(number > 0) resultDices.push(number);
		});
		
		resultDices.sort();
	}
}

// ---------------------------------------------

function keepDice(number, index) {
	if(index < 0 || index >= rollDices.length) return;
	
	rollDices.splice(index, 1);
	fillAtEmptySlot(number);
	
	playKeepSound();
	redrawFloatDices();
	redrawKeepDices();
	updateRollButtonVisibility();
	
	function fillAtEmptySlot(number) {
		for(var i = 0; i < keepDices.length; i++) {
			if(keepDices[i] == 0) {
				keepDices[i] = number;
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
		updateGameTurn();
		//highlightTurn();
		
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
	
	if(turn >= PLAYER_COUNT) {
		gameTurn++;
		if(gameTurn > MAX_GAME_TURN) return false;
	}
	
	turn %= PLAYER_COUNT;
	
	return true;
}

// ---------------------------------------------

function resetChance() {
	leftChance = 3;
	updateChance(leftChance);
}
	
function decreaseChance() {
	leftChance--;
	updateChance(leftChance);
}

// ---------------------------------------------

function redrawFloatDices(readyForAnimimation) {
	showAllFloatDices(false);
	
	for(var index = 0; index < rollDices.length; index++) {
		updateFloatDice(index, rollDices[index], readyForAnimimation);
		showFloatDice(index, true);
	}
}

function redrawKeepDices() {
	showAllKeepDices(false);
	
	for(var index = 0; index < keepDices.length; index++) {
		if(keepDices[index] == 0) continue;
		
		updateKeepDice(index, keepDices[index]);
		showKeepDice(index, true);
	}
}

// ---------------------------------------------

function getDiceDotCount(number) {
	var index = number - 1;
	if(index < 0 || index >= diceCounts.length) return 0;
	return diceCounts[index] * number;
}

function getChoiceScore() {
	var sum = 0;
	
	for(var i = 0; i < resultDices.length; i++) {
		sum += resultDices[i];
	}
	
	return sum;
}

function get4OfKindScore() {
	for(var i = 0; i < diceCounts.length; i++) {
		if(diceCounts[i] == 4) return getChoiceScore();
	}
	
	return 0;
}

function getFullHouseScore() {
	var pair, triple;
	
	for(var i = 0; i < diceCounts.length; i++) {
		if(diceCounts[i] == 2) pair = true;
		else if(diceCounts[i] == 3) triple = true;
	}
	
	return (pair && triple) ? getChoiceScore() : 0;
}

function getSSrtaightScore() {
	return checkStraight(false) ? 15 : 0;
}

function getLSrtaightScore() {
	return checkStraight(true) ? 30 : 0;
}

function getYachtScore() {
	for(var i = 0; i < diceCounts.length; i++) {
		if(diceCounts[i] == 5) return 50;
	}
	
	return 0;
}

function checkStraight(large) {
	var count = 0;
	var number = large ? 5 : 4;
	
	for(var i = 0; i < diceCounts.length; i++) {
		if(diceCounts[i] == 0) count = 0;
		else {
			count++;
			if(count == number) return true;
		}
	}
	
	return false;
}

function calculateDiceCounts() {
	diceCounts = [0, 0, 0, 0, 0, 0];
	
	for(var i = 0; i < resultDices.length; i++) {
		var index = resultDices[i] - 1;
		diceCounts[index]++;
	}
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
	determinePositions();
	resize();
	bindEvents();
});

function bindEvents() {
	document.querySelector("#roll").addEventListener('click', function() {
		updateSelectable(false);
		updateTable();
		rollWithAnimation();
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