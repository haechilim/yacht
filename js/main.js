var TOTAL_DICES = 5;
var CATEGORY_COUNT = 15;

var BOARD_WIDTH = 1903;
var BOARD_HEIGHT = 1077;

var FLOOR_LEFT = -301;
var FLOOR_TOP = -254;
var FLOOR_RIGHT = 285;
var FLOOR_BOTTOM = 283;

var KDICE_WIDTH = 110;
var KDICE_HEIGHT = 108;
var KDICE_TOP = -412;
var KDICE_LEFTS = [ -314, -186, -56, 72, 204 ];

var RDICE_WIDTH = 130;//157;
var RDICE_HEIGHT = 130;//157;

var SDICE_WIDTH = 170;
var SDICE_HEIGHT = 170;

var SCORE_LINE_HEIGHT_RATIO = 21;//19.2;

var SDICES_POPUP_DELAY = 1000;

var CUP_ANIMATION_TIME = 1000;
var CUP_SHAKING_INTERVAL = 100;

var center = {};
var floorPosition = {};
var kDicePositions = [];
var kDiceSize = {};
var rDiceSize = {};
var sDiceSize = {};

var leftChance = 3;
var rollDices = [0, 0, 0, 0, 0];
var keepDices = [0, 0, 0, 0, 0];
var resultDices = [0, 0, 0, 0, 0];

var turn = 0;

function init() {
	showAllKeepDices(false);
	showAllFloorDices(false);
	nextTurn();
}

function rollWithAnimation() {
	if(leftChance <= 0) return;
		
	showAllFloatDices(false);

	animateCup(function() {
		roll(function() {
			setTimeout(function() {
				showAllFloorDices(false);
				redrawFloatDices(true);
				animateFloatDices();
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
	
	updateResult();
	resultDices.sort();
	rollDices.sort();
	
	markGuideNumber();
	
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
}

// ---------------------------------------------

function markGuideNumber() {
	var playerCategory = turn + 1;
	
	for(var number = 2; number <= 7; number++) {
		document.querySelector(".score tr:nth-child(" + number + ") td:nth-child(" + playerCategory + ")").innerHTML = getDiceDotCount(number - 1);
	}
	
	document.querySelector(".score tr:nth-child(9) td:nth-child(" + playerCategory + ")").innerHTML = getChoiceScore();
	document.querySelector(".score tr:nth-child(10) td:nth-child(" + playerCategory + ")").innerHTML = get_4_of_kind_score();
	document.querySelector(".score tr:nth-child(11) td:nth-child(" + playerCategory + ")").innerHTML = getFullHouseScore();
	document.querySelector(".score tr:nth-child(12) td:nth-child(" + playerCategory + ")").innerHTML = get_S_srtaight_score();
	document.querySelector(".score tr:nth-child(13) td:nth-child(" + playerCategory + ")").innerHTML = get_L_srtaight_score();
	document.querySelector(".score tr:nth-child(14) td:nth-child(" + playerCategory + ")").innerHTML = getYachtScore();
}

function removeGuideNumber() {
	for(var i = 2; i < CATEGORY_COUNT; i++) {
		if(i == 8) continue;
		
		var playerCategory = document.querySelector(".score tr:nth-child(" + i + ") td:nth-child(" + (turn + 1) + ")");
		
		if(playerCategory.contains('fixed')) continue;
		
		playerCategory.innerHTML = "";
	}
}

function getDiceDotCount(number) {
	var count = 0;
	
	for(var i = 0; i < resultDices.length; i++) {
		if(resultDices[i] == number) count += number;
	}
	
	return count;
}

function getChoiceScore() {
	var sum = 0;
	
	for(var i = 0; i < resultDices.length; i++) {
		sum += resultDices[i];
	}
	
	return sum;
}

function get_4_of_kind_score() {
	var count = 1;
	var number = 0;
	var is_4_of_kind = false;
	
	for(var i = 0; i < resultDices.length; i++) {
		if(resultDices[i] == number) {
			count++;
			if(count >= 4) is_4_of_kind = true;
		}
		else {
			number = resultDices[i]; 
			count = 1;
		}
	}
	
	return is_4_of_kind ? getChoiceScore() : 0;
}

function getFullHouseScore() {
	var number = 0;
	var count = 1;
	var temp = 0;
	var isDouble = false;
	var isTriple = false;
	
	for(var i = 0; i < resultDices.length; i++) {
		if(resultDices[i] == number) {
			count++;
			
			if(count == 3) {
				if(number == temp) isDouble = false;
				
				isTriple = true;
			}
			else if(count == 2 &&  !isDouble) {
				temp = number;
				isDouble = true;
			}
		}
		else {
			number = resultDices[i];
			count = 1;
		}
	}
	
	return isDouble && isTriple ? getChoiceScore() : 0;
}

function get_S_srtaight_score() {
	var count = 1;
	
	for(var i = 0; i <= resultDices.length; i++) {
		if(resultDices[i] + 1 == resultDices[i + 1]) count++;
		else count = 1;
	}
	
	return count >= 4 ? 15 : 0;
}

function get_L_srtaight_score() {
	for(var i = 0; i <= resultDices.length; i++) {
		if(resultDices[i] + 1 != resultDices[i + 1]) return 0;
	}
	
	return 30;
}

function getYachtScore() {
	for(var i = 0; i <= resultDices.length; i++) {
		if(resultDices[i] != resultDices[i + 1]) return 0;
	}
	
	return 50;
}

// ---------------------------------------------

function hideRerollButton() {
	if(leftChance <= 0) {
		showRollButton(false);
		return;
	}
	
	for(var i = 0; i < rollDices.length; i++) {
		if(rollDices[i] != 0) {
			showRollButton(true);
			return;
		}
	}
	
	showRollButton(false);
}

function keepDice(number, index) {
	if(index < 0 || index >= rollDices.length) return;
	
	rollDices.splice(index, 1);
	
	keepDicePush(number);
	
	redrawFloatDices();
	redrawKeepDices();
	hideRerollButton();
}

function unkeepDice(number, index) {
	if(index < 0 || index >= keepDices.length) return;
	
	keepDices[index] = 0;
	rollDices.push(number);
	rollDices.sort();
	
	redrawFloatDices();
	redrawKeepDices();
	hideRerollButton();
}

function nextTurn() {
	rollDices = [0, 0, 0, 0, 0];
	keepDices = [0, 0, 0, 0, 0];
	
	increaseTurn();
	
	showRollButton(true);
	showAllFloatDices(false);
	showAllKeepDices(false);
	
	markPlayerBoard(false);
	updateChance(leftChance);
	markAllPlayerBoard(false);
	markPlayerBoard(true);
}

function markPlayerBoard() {
	for(var i = 2; i <= CATEGORY_COUNT; i++) {
		document.querySelector(".score tr:nth-child(" + i + ") td:nth-child(" + (turn + 1) + ")").classList.add('turn');
	}
}

function markAllPlayerBoard(visible) {
	for(var i = 2; i <= CATEGORY_COUNT; i++) {
		var playerBorad = document.querySelector(".score tr:nth-child(" + i + ")");
		
		for(var j = 2; j <= 4; j++) {
			if(visible) playerBorad.querySelector("td:nth-child(" + j + ")").classList.add('turn');
			else playerBorad.querySelector("td:nth-child(" + j + ")").classList.remove('turn');
		}
	}
}

function increaseTurn() {
	turn++;
	turn = turn % 4 == 0 ? 1 : turn % 4;
	leftChance = 3;
}

function decreaseChance() {
	leftChance--;
	updateChance(leftChance);
}

function keepDicePush(number) {
	for(var i = 0; i < keepDices.length; i++) {
		if(keepDices[i] == 0) {
			keepDices[i] = number;
			break;
		}
	}
}

// ---------------------------------------------

function determinePositions() {
	var board = document.querySelector("#board");
	var ratio = window.innerHeight / BOARD_HEIGHT;
	
	center.x = board.offsetWidth / 2;
	center.y = window.innerHeight / 2
	
	kDiceSize.width = KDICE_WIDTH * ratio;
	kDiceSize.height = KDICE_HEIGHT * ratio;
	
	rDiceSize.width = RDICE_WIDTH * ratio;
	rDiceSize.height = RDICE_HEIGHT * ratio;
	
	sDiceSize.width = SDICE_WIDTH * ratio;
	sDiceSize.height = SDICE_HEIGHT * ratio;
	
	for(var i = 0; i< TOTAL_DICES; i++) {
		var position = {};
		
		position.left = KDICE_LEFTS[i] * ratio;
		position.top = KDICE_TOP * ratio;
		
		kDicePositions.push(position);
	}
	
	floorPosition.left = center.x + FLOOR_LEFT * ratio;
	floorPosition.right = center.x + FLOOR_RIGHT * ratio;
	floorPosition.top = center.y + FLOOR_TOP * ratio;
	floorPosition.bottom = center.y + FLOOR_BOTTOM * ratio;
	floorPosition.width = floorPosition.right - floorPosition.left + 1;
	floorPosition.height = floorPosition.bottom - floorPosition.top + 1;
}

function resize() {
	var board = document.querySelector("#board");
	var cup = document.querySelector("#cupImage");
	var score = document.querySelector("#score-container");
	
	board.style.height = window.innerHeight + "px";
	cup.style.height = (window.innerHeight / 2) + "px";
	score.style.lineHeight = window.innerHeight / SCORE_LINE_HEIGHT_RATIO + "px";
	
	for(var i = 0; i < TOTAL_DICES; i++) {
		var index = i + 1;
		var dice = document.querySelector(".keepDiceContainer .dice:nth-child(" + index + ")");
		var pdice = document.querySelector(".rollDiceContainer .dice:nth-child(" + index + ")");	
		var selectDice = document.querySelector(".selectDiceContainer .dice:nth-child(" + index + ")");	
		
		pdice.style.width = rDiceSize.width + "px";
		pdice.style.height = rDiceSize.height + "px";
		
		selectDice.style.width = sDiceSize.width + "px";
		selectDice.style.height = sDiceSize.height + "px";
		
		dice.style.left = (center.x + kDicePositions[i].left) + "px";
		dice.style.top = (center.y + kDicePositions[i].top) + "px";
		dice.style.width = kDiceSize.width + "px";
		dice.style.height = kDiceSize.height + "px";
	}
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

function animateFloatDices() {
	setTimeout(function() {
		document.querySelectorAll(".selectDiceContainer .dice").forEach(function(element) {
		    element.classList.remove("initial");
		});
	}, 10);
}

function animateCup(oncomplete) {
	var time = 0;
	var cup = document.querySelector("#cupImage");

	showCup(true);

	var timer = setInterval(function() {
		cup.classList.toggle("shake");
		time += CUP_SHAKING_INTERVAL;
		
		if(time >= CUP_ANIMATION_TIME) {
			clearInterval(timer);
			if(oncomplete) oncomplete();
		}
	}, CUP_SHAKING_INTERVAL);
}

// ---------------------------------------------

function updateChance(chance) {
	document.querySelector("#leftChance").innerHTML = chance;
}

function updateFloorDice(index, number, position) {
	var dice = document.querySelector(".rollDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute( 'src', 'image/pdice' + number + '.png' );
	dice.style.left = position.left + "px";
	dice.style.top = position.top + "px";
}

function updateFloatDice(index, number, readyForAnimimation) {
	var dice = document.querySelector(".selectDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute('src', 'image/dice' + number + '.png');
	dice.setAttribute('number', number);
	dice.setAttribute('index', index);

	if(readyForAnimimation) dice.classList.add("initial");
}

function updateKeepDice(index, number) {
	var dice = document.querySelector(".keepDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute('src', 'image/dice' + number + '.png');
	dice.setAttribute('number', number);
	dice.setAttribute('index', index);
}

function updateResult() {
	var index = 0;
	
	for(var i = 0; i < rollDices.length; i++) {
		if(rollDices[i] == 0) continue;
		
		resultDices[index] = rollDices[i];
		index++;
	}
	
	for(var i = 0; i < keepDices.length; i++) {
		if(keepDices[i] == 0) continue;
		
		resultDices[index] = keepDices[i];
		index++;
	}
}

// ---------------------------------------------

function showAllKeepDices(visible) {
	for(var i = 0; i < TOTAL_DICES; i++) {
		showKeepDice(i, visible);
	}
}

function showAllFloorDices(visible) {
	for(var i = 0; i < TOTAL_DICES; i++) {
		showFloorDice(i, visible);
	}
}

function showAllFloatDices(visible) {
	for(var i = 0; i < TOTAL_DICES; i++) {
		showFloatDice(i, visible);
	}
}

function showKeepDice(index, visible) {
	document.querySelector(".keepDiceContainer .dice:nth-child(" + (index + 1) + ")").style.display = visible ? "inline" : "none";
}

function showFloorDice(index, visible) {
	document.querySelector(".rollDiceContainer .dice:nth-child(" + (index + 1) + ")").style.display = visible ? "inline" : "none";
}

function showFloatDice(index, visible) {
	document.querySelector(".selectDiceContainer .dice:nth-child(" + (index + 1) + ")").style.display = visible ? "inline" : "none";
}

function showRollButton(visible) {
	document.querySelector("#roll").style.display = visible ? "flex" : "none";
}

function showCup(visible) {
	document.querySelector("#cup").style.display = visible ? "flex" : "none";
}

// ---------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
	init();
	determinePositions();
	resize();
	bindEvents();
});

window.addEventListener('resize', function() {
	determinePositions();
	resize();
});

function bindEvents() {
	document.querySelector("#roll").addEventListener('click', function() {
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
	
	document.querySelectorAll(".category").forEach(function(element) {
		element.addEventListener('click', function() {
			nextTurn();
		});
	});	
}