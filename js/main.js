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
var randomDices = [];

var keepDiceCount = 0;
var rollDiceCount = TOTAL_DICES - keepDiceCount;

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
	document.querySelector(".rerollButton").addEventListener('click', function() {
		reroll(rollDiceCount);
		console.log(randomDices);
	});
	
	document.querySelector(".rollDiceContainer .diceImage1").addEventListener('click', function() {
		keepDice(1);
	});
	
	document.querySelector(".rollDiceContainer .diceImage2").addEventListener('click', function() {
		keepDice(2);
	});
	
	document.querySelector(".rollDiceContainer .diceImage3").addEventListener('click', function() {
		keepDice(3);
	});
	
	document.querySelector(".rollDiceContainer .diceImage4").addEventListener('click', function() {
		keepDice(4);
	});
	
	document.querySelector(".rollDiceContainer .diceImage5").addEventListener('click', function() {
		keepDice(5);
	});
}

function keepDice(number) {
	var randomDiceIndex = number - 1;
	
	if(randomDiceIndex < 0 || randomDiceIndex >= randomDices.length) return;
	
	showPdice(number, false);
	showDice(keepDiceCount + 1, true);
	
	document.querySelector(".keepDiceContainer .diceImage" + (keepDiceCount + 1)).setAttribute( 'src', 'image/dice' + randomDices[randomDiceIndex] + '.png');
	keepDiceCount++;
	rollDiceCount--;
}

function init() {
	for(var i = 1; i <= TOTAL_DICES; i++) {
		showDice(i, false);
		showPdice(i, false);
	}
}

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
	
	showAllPdices(false);

	for(var i = 0; i < count; i++) {
		showPdice(i + 1, true);
		
		var rollDice = document.querySelector(".rollDiceContainer .diceImage" + (i + 1));
		
		randomDices[i] = randomDice();
		
		rollDice.setAttribute( 'src', 'image/pdice' + randomDices[i] + '.png' );
		
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
	
	function randomDice() {
		return Math.floor(Math.random() * 6 + 1);
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

function showAllDices(visible) {
	for(var i = 1; i <= TOTAL_DICES; i++) {
		document.querySelector(".keepDiceContainer .diceImage" + i).style.display = visible ? "inline" : "none";
	}
}

function showAllPdices(visible) {
	for(var i = 1; i <= TOTAL_DICES; i++) {
		document.querySelector(".rollDiceContainer .diceImage" + i).style.display = visible ? "inline" : "none";
	}
}

function showDice(number, visible) {
	document.querySelector(".keepDiceContainer .diceImage" + number).style.display = visible ? "inline" : "none";
}

function showPdice(number, visible) {
	document.querySelector(".rollDiceContainer .diceImage" + number).style.display = visible ? "inline" : "none";
}