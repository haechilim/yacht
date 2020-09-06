var ACES_INDEX = 0;
var SIXES_INDEX = 5;
var CHOICE_INDEX = 6;
var YACHT_INDEX = 11;

var categorieNames = [
	"Aces", "Deuces", "Threes", "Fours", "Fives", "Sixes",
	"Choice", "4 fo a kind", "Full House", "S. Straight", "L. Straight", "Yacht"
];

var categorieIcons = [
	"dice1", "dice2", "dice3", "dice4", "dice5", "dice6",
	"choice", "kind", "fullhouse", "sstraight", "lstraight", "yacht"
];


// ---------------------------------------------

function updateScore(categoryName, value) {
	var category = getCategory(players[turn], categoryName);
	
	if(category) {
		category.fixed = true;
		category.score = value;
	}
}

function updateSubtotal() {
	var player = players[turn];
	var category = player.categories;
	var subtotal = 0;
	
	for(var i = ACES_INDEX; i <= SIXES_INDEX; i++) {
		if(!category[i].fixed) continue;
		subtotal += category[i].score;
	}
	
	player.subtotal = subtotal;
	player.isBonus = player.subtotal >= 63;
}

function updateTotal() {
	var player = players[turn];
	var category = player.categories;
	var total = player.isBonus ? 35 : 0;
	
	for(var i = 0; i < category.length; i++) {
		if(!category[i].fixed) continue;
		total += category[i].score;
	}
	
	player.total = total;
}

// ---------------------------------------------

function redrawGameTurn() {
	document.querySelector(".progress").innerText = gameTurn + "/12";
}

function redrawTable() {
	var html;
	
	html = headerHtml();
	html += upperHtml();
	html += subtotalHtml();
	html += lowerHtml();
	html += totalHtml();
	document.querySelector("#score-container").innerHTML = html;
	
	bindScoreEvents();
}

function headerHtml() {
	return '<table class="score">' +
				'<tr>' +
					'<th class="turn bottom-tborder">' + 
						'<div class="turn">Turn</div>' +
						'<div class="progress">' + gameTurn + '/12</div>' +
						'<div class="categories">Categories</div>' +
					'</th>' +
					playersHtml() +
				'</tr>';
				
	function playersHtml() {
		var html = "";
		
		for(var index = 0; index < players.length; index++) {
			var style = "player top-tborder bottom-border";
			if(index == 0) style += " left-tborder";
			if(index == players.length - 1) style += " right-tborder";
			if(index > 0 && index < players.length) style += " left-border";
			
			html += '<th class="' + style + '">' +
						'<img src="image/avatar/avatar' + players[index].avatar + '.png"/>' +
					'</th>';
		}
		
		return html;
	}
}

function upperHtml() {
	return scoreHtml(ACES_INDEX, SIXES_INDEX);
}

function lowerHtml() {
	return scoreHtml(CHOICE_INDEX, YACHT_INDEX);
}

function scoreHtml(startIndex, endIndex) {
	var html = "";
	
	for(var cindex = startIndex; cindex <= endIndex; cindex++) {
		var name;
		
		html += '<tr class="' + categories[cindex] + '">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/' + getCategoryIcon(cindex) + '.png"/>' + getCategoryName(cindex) +
					'</td>' +
					playersHtml(cindex) +
				'</tr>';
	}
	
	return html;
	
	function playersHtml(cindex) {
		var html = "";
			
		for(var pindex = 0; pindex < players.length; pindex++) {
			var player = players[pindex];
			var style = "number";
			var value = player.categories[cindex].fixed ? player.categories[cindex].score : "";
			
			if(player.categories[cindex].fixed) style += " fixed";
			if(player.categories[cindex].selectable) style += " selectable";
			if(pindex == turn) style += " turn";
			if(pindex == players.length - 1) style += " right-tborder";
			
			html += '<td class="' + style + '">' + value + '</td>';
		}
		
		return html;
	}
}

function subtotalHtml() {
	return '<tr class="subtotal">' +
				'<td class="category left-tborder">' +
					'<div class="subtotal">Subtotal</div>' +
					'<div class="bonus">+35 Bonus</div>' +
				'</td>' +
				playersHtml() +
			'</tr>';
			
	function playersHtml() {
		var html = "";
		
		for(var pindex = 0; pindex < players.length; pindex++) {
			var player = players[pindex];
			var style = "number";
			
			if(pindex == players.length - 1) style += " right-tborder";
			
			html += '<td class="' + style + '">' +
						'<div class="subtotal">' + player.subtotal + '/63</div>' +
						'<div class="bonus">' + (player.isBonus ? "+35" : "+0") + '</div>' +
					'</td>';
		}
		
		return html;
	}
}

function totalHtml() {
	return '<tr class="total">' +
				'<td class="category bottom-tborder left-tborder">Total</td>' +
				playersHtml() +
			'</tr>';
			
	function playersHtml() {
		var html = "";
		
		for(var pindex = 0; pindex < players.length; pindex++) {
			var player = players[pindex];
			var style = "number bottom-tborder";
			
			if(pindex == turn) style += " turn";
			if(pindex == players.length - 1) style += " right-tborder";
			
			html += '<td class="' + style + '">' + player.total + '</td>';
		}
		
		return html;
	}
}

function getCategoryName(index) {
	return (index >= 0 && index < categorieNames.length) ? categorieNames[index] : "";
}

function getCategoryIcon(index) {
	return (index >= 0 && index < categorieIcons.length) ? categorieIcons[index] : "";
}

// ---------------------------------------------

function showGuideNumber(visible) {
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
		var category = document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")");
		
		if(result[i] === undefined || category.classList.contains("fixed")) continue;
		
		category.innerText = result[i];
	}
}

function clearScores() {
	for(var i = 0; i < categories.length; i++) {
		var element = document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")");
		
		if(element.classList.contains("fixed")) continue;
		element.innerText = "";
	}
}

// ---------------------------------------------

function bindScoreEvents() {
	document.querySelectorAll(".score .selectable").forEach(function(element) {
		element.addEventListener('click', function() {
			var category = this.parentElement.className;
			var value = parseInt(this.innerText);
			
			updateScore(category, value);
			updateSubtotal();
			updateTotal();
			showGuideNumber(false);
			nextTurn();
			redrawTable();
		});
	});
}