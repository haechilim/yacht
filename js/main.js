var TOTAL_DICES = 5;

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

var SDICES_POPUP_DELAY = 1000;

var center = {};
var floorPosition = {};
var kDicePositions = [];
var kDiceSize = {};
var rDiceSize = {};
var sDiceSize = {};

var leftChance = 3;
var rollDices = [0, 0, 0, 0, 0];
var keepDices = [];


function init() {
	showAllKeepDices(false);
	showAllFloorDices(false);
}

function reroll(oncomplete) {
	var positions = [];
	
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

function keepDice(number, index) {
	if(index < 0 || index >= rollDices.length) return;
	
	rollDices.splice(index, 1);
	keepDices.push(number);
	
	redrawFloatDices();
	redrawKeepDices();
}

function unkeepDice(number, index) {
	if(index < 0 || index >= keepDices.length) return;
	
	keepDices.splice(index, 1);
	rollDices.push(number);
	rollDices.sort();
	
	redrawFloatDices();
	redrawKeepDices();
}

function decreaseChance() {
	leftChance--;
	updateChance(leftChance);
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
	
	board.style.height = window.innerHeight + "px";
	document.querySelector("#score-container").style.lineHeight = window.innerHeight / 19.2 + "px";
	
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

function redrawFloatDices() {
	showAllFloatDices(false);
	
	for(var index = 0; index < rollDices.length; index++) {
		updateFloatDice(index, rollDices[index]);
		showFloatDice(index, true);
	}
}

function redrawKeepDices() {
	showAllKeepDices(false);
	
	for(var index = 0; index < keepDices.length; index++) {
		updateKeepDice(index, keepDices[index]);
		showKeepDice(index, true);
	}
}

// ---------------------------------------------

function updateChance(chance) {
	document.querySelector(".textLeftChanceText").innerHTML = chance + " left";
}

function updateFloorDice(index, number, position) {
	var dice = document.querySelector(".rollDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute( 'src', 'image/pdice' + number + '.png' );
	dice.style.left = position.left + "px";
	dice.style.top = position.top + "px";
}

function updateFloatDice(index, number) {
	var dice = document.querySelector(".selectDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute('src', 'image/dice' + number + '.png');
	dice.setAttribute('number', number);
	dice.setAttribute('index', index);
}

function updateKeepDice(index, number) {
	var dice = document.querySelector(".keepDiceContainer .dice:nth-child(" + (index + 1) + ")");
	dice.setAttribute('src', 'image/dice' + number + '.png');
	dice.setAttribute('number', number);
	dice.setAttribute('index', index);
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
	document.querySelector("#reroll").addEventListener('click', function() {
		if(leftChance <= 0) return;
		
		reroll(function() {
			setTimeout(function() {
				showAllFloorDices(false);
				redrawFloatDices();
			}, SDICES_POPUP_DELAY);
		});
		
		decreaseChance();
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
}