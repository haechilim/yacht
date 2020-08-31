var BOARD_WIDTH = 1903;
var BOARD_HEIGHT = 1077;
var DICE_WIDTH = 110;
var DICE_HEIGHT = 108;
var DICE_POS_Y = -412;

var dicesPosX = [ -314, -186, -56, 72, 204 ];


document.addEventListener("DOMContentLoaded", function() {
	resize();
});

window.addEventListener('resize', function() {
	resize();
});

function resize() {
	var board = document.querySelector("#board");
	
	board.style.height = window.innerHeight + "px";
	document.querySelector("#score-container").style.lineHeight = window.innerHeight / 19.2 + "px";
	
	var centerX = board.offsetWidth / 2;
	var centerY = board.offsetHeight / 2
	var ratio = BOARD_HEIGHT / board.offsetHeight;
	
	for(var i = 0; i < dicesPosX.length; i++) {
		var dice = document.querySelector(".keepDiceContainer .diceImage" + (i + 1));
		var pDice = document.querySelector(".rollDiceContainer .diceImage" + (i + 1));
		
		pDice.style.width = (DICE_WIDTH / ratio) + "px";
		pDice.style.height = (DICE_HEIGHT / ratio) + "px";
		
		dice.style.left = (centerX + dicesPosX[i] / ratio) + "px";
		dice.style.top = (centerY + DICE_POS_Y / ratio) + "px";
		dice.style.width = (DICE_WIDTH / ratio) + "px";
		dice.style.height = (DICE_HEIGHT / ratio) + "px";
	}
}