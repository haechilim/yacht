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

var CUP_ANIMATION_TIME = 1000;
var CUP_SHAKING_INTERVAL = 100;

var center = {};
var floorPosition = {};
var kDicePositions = [];
var kDiceSize = {};
var rDiceSize = {};
var sDiceSize = {};

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

function updateChance() {
	document.querySelector("#leftChance").innerText = leftChance;
}

function updateRollButtonVisibility() {
	showRollButton(!(leftChance <= 0 || rollDices.length == 0));
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

window.addEventListener('resize', function() {
	determinePositions();
	resize();
});