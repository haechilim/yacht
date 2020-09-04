function updateTable() {
	var html;
	
	html = header();
	html += upper();
	html += lower();
	
	document.querySelector("#score-container").innerHTML = html;
	bindScoreEvents();
}

function header() {
	return '<table class="score">' +
				'<tr>' +
					'<th class="turn bottom-tborder">' + 
						'<div class="turn">Turn</div>' +
						'<div class="progress">' + gameTurn + '/12</div>' +
						'<div class="categories">Categories</div>' +
					'</th>' +
					'<th class="player top-tborder bottom-border left-tborder">' +
						'<img src="image/avatar/avatar' + players[0].avatar + '.png"/>' +
					'</th>' +
					'<th class="player top-tborder bottom-border left-border">' +
						'<img src="image/avatar/avatar' + players[1].avatar + '.png"/>' +
					'</th>' +
					'<th class="player top-tborder bottom-border left-border right-tborder">' +
						'<img src="image/avatar/avatar' + players[2].avatar + '.png"/>' +
					'</th>' +
				'</tr>';
}
 
function upper() {
	return '<tr class="aces">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice1.png"/>Aces' +
					'</td>' +
					'<td class="number ' + (players[0].categories[0].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[0].selectable ? "selectable" : "") + '">' + (players[0].categories[0].fixed ? players[0].categories[0].score : "") + '</td>' + 
					'<td class="number ' + (players[1].categories[0].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[0].selectable ? "selectable" : "") + '">' + (players[1].categories[0].fixed ? players[1].categories[0].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[0].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[0].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[0].fixed ? players[2].categories[0].score : "") + '</td>' +
				'</tr>' +
				'<tr class="deuces">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice2.png"/>Deuces' +
					'</td>' +
					'<td class="number ' + (players[0].categories[1].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[1].selectable ? "selectable" : "") + '">' + (players[0].categories[1].fixed ? players[0].categories[1].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[1].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[1].selectable ? "selectable" : "") + '">' + (players[1].categories[1].fixed ? players[1].categories[1].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[1].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[1].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[1].fixed ? players[2].categories[1].score : "") + '</td>' +
				'</tr>' +
				'<tr class="threes">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice3.png"/>Threes' +
					'</td>' +
					'<td class="number ' + (players[0].categories[2].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[2].selectable ? "selectable" : "") + '">' + (players[0].categories[2].fixed ? players[0].categories[2].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[2].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[2].selectable ? "selectable" : "") + '">' + (players[1].categories[2].fixed ? players[1].categories[2].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[2].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[2].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[2].fixed ? players[2].categories[2].score : "") + '</td>' +
				'</tr>' +
				'<tr class="fours">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice4.png"/>Fours' +
					'</td>' +
					'<td class="number ' + (players[0].categories[3].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[3].selectable ? "selectable" : "") + '">' + (players[0].categories[3].fixed ? players[0].categories[3].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[3].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[3].selectable ? "selectable" : "") + '">' + (players[1].categories[3].fixed ? players[1].categories[3].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[3].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[3].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[3].fixed ? players[2].categories[3].score : "") + '</td>' +
				'</tr>' +
				'<tr class="fives">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice5.png"/>Fives' +
					'</td>' +
					'<td class="number ' + (players[0].categories[4].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[4].selectable ? "selectable" : "") + '">' + (players[0].categories[4].fixed ? players[0].categories[4].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[4].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[4].selectable ? "selectable" : "") + '">' + (players[1].categories[4].fixed ? players[1].categories[4].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[4].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[4].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[4].fixed ? players[2].categories[4].score : "") + '</td>' +
				'</tr>' +
				'<tr class="sixes">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/dice6.png"/>Sixes' +
					'</td>' +
					'<td class="number ' + (players[0].categories[5].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[5].selectable ? "selectable" : "") + '">' + (players[0].categories[5].fixed ? players[0].categories[5].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[5].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[5].selectable ? "selectable" : "") + '">' + (players[1].categories[5].fixed ? players[1].categories[5].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[5].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[5].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[5].fixed ? players[2].categories[5].score : "") + '</td>' +
				'</tr>' +
				
				'<tr class="subtotal">' +
					'<td class="category left-tborder">' +
						'<div class="subtotal">Subtotal</div>' +
						'<div class="bonus">+35 Bonus</div>' +
					'</td>' +
					'<td class="number">' +
						'<div class="subtotal">' + players[0].subtotal + '/63</div>' +
						'<div class="bonus">' + (players[0].isBonus ? "+35" : "+0") + '</div>' +
					'</td>' +
					'<td class="number">' +
						'<div class="subtotal">' + players[1].subtotal + '/63</div>' +
						'<div class="bonus">' + (players[1].isBonus ? "+35" : "+0") + '</div>' +
					'</td>' +
					'<td class="number right-tborder">' +
						'<div class="subtotal">' + players[2].subtotal + '/63</div>' +
						'<div class="bonus">' + (players[2].isBonus ? "+35" : "+0") + '</div>' +
					'</td>' +
				'</tr>';
}

function lower() {
	return '<tr class="choice">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/choice.png"/>Choice' +
					'</td>' +
					'<td class="number ' + (players[0].categories[6].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[6].selectable ? "selectable" : "") + '">' + (players[0].categories[6].fixed ? players[0].categories[6].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[6].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[6].selectable ? "selectable" : "") + '">' + (players[1].categories[6].fixed ? players[1].categories[6].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[6].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[6].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[6].fixed ? players[2].categories[6].score : "") + '</td>' +
				'</tr>' +
				'<tr class="kind">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/kind.png"/>4 of a kind' +
					'</td>' +
					'<td class="number ' + (players[0].categories[7].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[7].selectable ? "selectable" : "") + '">' + (players[0].categories[7].fixed ? players[0].categories[7].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[7].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[7].selectable ? "selectable" : "") + '">' + (players[1].categories[7].fixed ? players[1].categories[7].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[7].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[7].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[7].fixed ? players[2].categories[7].score : "") + '</td>' +
				'</tr>' +
				'<tr class="full-house">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/fullhouse.png"/>Full House' +
					'</td>' +
					'<td class="number ' + (players[0].categories[8].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[8].selectable ? "selectable" : "") + '">' + (players[0].categories[8].fixed ? players[0].categories[8].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[8].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[8].selectable ? "selectable" : "") + '">' + (players[1].categories[8].fixed ? players[1].categories[8].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[8].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[8].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[8].fixed ? players[2].categories[8].score : "") + '</td>' +
				'</tr>' +
				'<tr class="s-straight">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/sstraight.png"/>S. Straight' +
					'</td>' +
					'<td class="number ' + (players[0].categories[9].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[9].selectable ? "selectable" : "") + '">' + (players[0].categories[9].fixed ? players[0].categories[9].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[9].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[9].selectable ? "selectable" : "") + '">' + (players[1].categories[9].fixed ? players[1].categories[9].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[9].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[9].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[9].fixed ? players[2].categories[9].score : "") + '</td>' +
				'</tr>' +
				'<tr class="l-straight">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/lstraight.png"/>L. Straight' +
					'</td>' +
					'<td class="number ' + (players[0].categories[10].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[10].selectable ? "selectable" : "") + '">' + (players[0].categories[10].fixed ? players[0].categories[10].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[10].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[10].selectable ? "selectable" : "") + '">' + (players[1].categories[10].fixed ? players[1].categories[10].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[10].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[10].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[10].fixed ? players[2].categories[10].score : "") + '</td>' +
				'</tr>' +
				'<tr class="yacht">' +
					'<td class="category left-tborder">' +
						'<img src="image/deco/yacht.png"/>Yacht' +
					'</td>' +
					'<td class="number ' + (players[0].categories[11].fixed ? "fixed" : "") + ' ' + (turn == 0 ? "turn" : "") + ' ' + (players[0].categories[11].selectable ? "selectable" : "") + '">' + (players[0].categories[11].fixed ? players[0].categories[11].score : "") + '</td>' +
					'<td class="number ' + (players[1].categories[11].fixed ? "fixed" : "") + ' ' + (turn == 1 ? "turn" : "") + ' ' + (players[1].categories[11].selectable ? "selectable" : "") + '">' + (players[1].categories[11].fixed ? players[1].categories[11].score : "") + '</td>' +
					'<td class="number ' + (players[2].categories[11].fixed ? "fixed" : "") + ' ' + (turn == 2 ? "turn" : "") + ' ' + (players[2].categories[11].selectable ? "selectable" : "") + ' right-tborder">' + (players[2].categories[11].fixed ? players[2].categories[11].score : "") + '</td>' +
				'</tr>' +
				
				'<tr class="total">' +
					'<td class="category bottom-tborder left-tborder">Total</td>' +
					'<td class="number ' + (turn == 0 ? "turn" : "") + ' bottom-tborder">' + players[0].total + '</td>' +
					'<td class="number ' + (turn == 1 ? "turn" : "") + ' bottom-tborder">' + players[1].total + '</td>' +
					'<td class="number ' + (turn == 2 ? "turn" : "") + ' bottom-tborder right-tborder">' + players[2].total + '</td>' +
				'</tr>' +
			'</table>';
}

// ---------------------------------------------

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

/*function updateFixed() {
	for(var playerIndex = 0; playerIndex < players.length; playerIndex++) {
		var index = playerIndex + 2;
		
		for(var categoryIndex = 0; categoryIndex < players[playerIndex].categories.length; categoryIndex++) {
			var category = players[playerIndex].categories[categoryIndex];
			
			if(category.fixed) document.querySelector(".score .number:nth-child(" + index + ")").classList.add("fixed");
			
			index += 3;
		}
	}
}

function updateTotalScore() {
	var categories = players[turn].categories;
	
	for(var i = 0; i < categories.length; i++) {
		if(categories[i].fixed) players[turn].total += categories[i].score;
	}
	
	document.querySelector(".total td:nth-child(" + (turn + 2) + ")").innerText = players[turn].total;
}

function highlightTurn() {
	document.querySelectorAll(".score td").forEach(function(element) {
		element.classList.remove("turn");
	});
	
	for(var i = 0; i < categories.length; i++) {
		document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (turn + 2) + ")").classList.add('turn');
	}
}*/

function updateSelectable(visible) {
	for(var categoryIndex = 0; categoryIndex < players[turn].categories.length; categoryIndex++) {
		players[turn].categories[categoryIndex].selectable = visible ? true : false;
	}
}

function updateScore(element) {
	var category = document.querySelectorAll(".score .selectable");
	
	for(var index = 0; index < category.length; index++) {
		if(element != category[index]) continue;
		
		players[turn].categories[index].fixed = true;
		players[turn].categories[index].score = parseInt(category[index].innerText);
	}
}

function updateTotal() {
	players[turn].total = players[turn].isBonus ? 35 : 0;
	
	var category = players[turn].categories;
	
	for(var i = 0; i < category.length; i++) {
		if(category[i].fixed) players[turn].total += category[i].score;
	}
}

function updateSubtotal() {
	players[turn].subtotal = 0;
	
	var category = players[turn].categories;
	
	for(var i = 0; i < 6; i++) {
		if(category[i].fixed) players[turn].subtotal += category[i].score;
	}
	
	players[turn].isBonus = players[turn].subtotal >= 63;
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

function bindScoreEvents() {
	document.querySelectorAll(".score .selectable").forEach(function(element) {
		element.addEventListener('click', function() {
			updateScore(element);
			updateSubtotal();
			updateTotal();
			showGuideNumber(false);
			nextTurn();
			updateTable();
		});
	});
}