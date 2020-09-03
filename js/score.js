var categories = [ 
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
	"total"
];
		
function initScoreBoard() {
	for(var i = 0; i < categories.length; i++) {
		document.querySelectorAll(".score tr." + categories[i] + " td.number").forEach(function(element) {
			element.classList.remove("fixed");
			element.classList.remove("selectable");
			element.innerText = "";
		});
	}
}

function updateGameTurn() {
	document.querySelector(".progress").innerText = gameTurn + "/12";
}

function highlightTurn() {
	document.querySelectorAll(".score td").forEach(function(element) {
		element.classList.remove("turn");
	});
	
	for(var i = 0; i < categories.length; i++) {
		document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")").classList.add('turn');
	}
}

function markSelectable(visible) {
	for(var i = 0; i < categories.length; i++) {
		var element = document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")");
		
		if(element.classList.contains("fixed")) continue;
		if(visible) element.classList.add("selectable");
		else element.classList.remove("selectable");
	}
}

// ---------------------------------------------

function showGuidNumber(visible) {
	visible ? markScores() : clearScores();
}

function markScores() {
	var playerCategory = turn + 2;
	var result = [
		getDiceDotCount(1), 
		getDiceDotCount(2), 
		getDiceDotCount(3), 
		getDiceDotCount(4), 
		getDiceDotCount(5), 
		getDiceDotCount(6),
		getChoiceScore(), 
		get4OfKindScore(), 
		getFullHouseScore(), 
		getSSrtaightScore(), 
		getLSrtaightScore(),
		getYachtScore()
	];
	
	for(var i = 0; i < categories.length; i++) {
		if(result[i] === undefined) continue;
		document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")").innerText = result[i];
	}
}

function clearScores() {
	for(var i = 0; i < categories.length; i++) {
		var element = document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")");
		
		if(element.classList.contains("fixed")) continue;
		element.innerText = "";
	}
}