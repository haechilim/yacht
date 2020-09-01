var TOTAL_DICES = 5;

var BOARD_WIDTH = 1903;
var BOARD_HEIGHT = 1077;

var FLOOR_LEFT = -301;
var FLOOR_TOP = -254;
var FLOOR_RIGHT = 285;
var FLOOR_BOTTOM = 283;

var DICE_WIDTH = 110;
var DICE_HEIGHT = 108;
var DICE_TOP = -412;
var DICE_LEFTS = [ -314, -186, -56, 72, 204 ];

var RDICE_WIDTH = 130;//157;
var RDICE_HEIGHT = 130;//157;

var center = {};
var floorPosition = {};
var dicePositions = [];
var diceSize = {};
var rdiceSize = {};



document.addEventListener("DOMContentLoaded", function() {
	determinePositions();
	resize();
	reroll(TOTAL_DICES);
});

window.addEventListener('resize', function() {
	determinePositions();
	resize();
});

function determinePositions() {
	var board = document.querySelector("#board");
	var ratio = window.innerHeight / BOARD_HEIGHT;
	
	center.x = board.offsetWidth / 2;
	center.y = window.innerHeight / 2
	
	diceSize.width = DICE_WIDTH * ratio;
	diceSize.height = DICE_HEIGHT * ratio;
	
	rdiceSize.width = RDICE_WIDTH * ratio;
	rdiceSize.height = RDICE_HEIGHT * ratio;
	
	for(var i = 0; i< TOTAL_DICES; i++) {
		var position = {};
		
		position.left = DICE_LEFTS[i] * ratio;
		position.top = DICE_TOP * ratio;
		
		dicePositions.push(position);
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
		var dice = document.querySelector(".keepDiceContainer .diceImage" + (i + 1));
		var pdice = document.querySelector(".rollDiceContainer .diceImage" + (i + 1));	
		
		pdice.style.width = rdiceSize.width + "px";
		pdice.style.height = rdiceSize.height + "px";
		
		dice.style.left = (center.x + dicePositions[i].left) + "px";
		dice.style.top = (center.y + dicePositions[i].top) + "px";
		dice.style.width = diceSize.width + "px";
		dice.style.height = diceSize.height + "px";
	}
}

function reroll(count) {
	var MAX_RETRY_COUNT = 100;
	var positions = [];

	for(var i = 0; i < count; i++) {
		var rollDice = document.querySelector(".rollDiceContainer .diceImage" + (i + 1));
		
		for(var j = 0; j < MAX_RETRY_COUNT; j++) {
			var position = randomPosition();
			
			if(j >= MAX_RETRY_COUNT -1 || !isOverlapped(position)) {
				rollDice.style.left = position.left + "px";
				rollDice.style.top = position.top + "px";

				positions.push(position);
				break;
			}
		}
	}

	function randomPosition() {
		var left = Math.floor(Math.random() * (floorPosition.width - rdiceSize.width)) + floorPosition.left;
		var top = Math.floor(Math.random() * (floorPosition.height - rdiceSize.height)) + floorPosition.top;
		
		return {
			left: left,
			top: top,
			right: left + rdiceSize.width,
			bottom: top + rdiceSize.height
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