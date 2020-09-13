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

function redrawScoreTable() {
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
						'<div class="progress">' + data.gameTurn + '/12</div>' +
						'<div class="categories">Categories</div>' +
					'</th>' +
					playersHtml() +
				'</tr>';
				
	function playersHtml() {
		var html = "";
		
		for(var index = 0; index < data.players.length; index++) {
			var player = data.players[index];
			var style = "player top-tborder bottom-border";

			if(index == 0) style += " left-tborder";
			if(index == data.players.length - 1) style += " right-tborder";
			if(index > 0 && index < data.players.length) style += " left-border";
			
			html += '<th class="' + style + '">' +
						'<img src="image/avatar/avatar' + player.avatar + '.png"/><br/>' + 
						decodeURIComponent(player.id)
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
		var normal = data.status == GS_NORMAL || data.status == GS_WAITING;
			
		for(var pindex = 0; pindex < data.players.length; pindex++) {
			var player = data.players[pindex];
			var category = player.categories[cindex];
			var style = "number";
			var value;
			
			if(normal) value = category.fixed ? category.score : "";
			else value = (category.fixed || pindex == data.turn) ? category.score : "";
			
			if(category.fixed) style += " fixed";
			else if(!normal && pindex == data.turn && isMyTurn()) style += " selectable";
			
			if(pindex == data.turn) style += " turn";
			if(pindex == data.players.length - 1) style += " right-tborder";
			
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
		
		for(var pindex = 0; pindex < data.players.length; pindex++) {
			var player = data.players[pindex];
			var style = "number";
			
			if(pindex == data.players.length - 1) style += " right-tborder";
			
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
		
		for(var pindex = 0; pindex < data.players.length; pindex++) {
			var player = data.players[pindex];
			var style = "number bottom-tborder";
			
			if(pindex == data.turn) style += " turn";
			if(pindex == data.players.length - 1) style += " right-tborder";
			
			html += '<td class="' + style + '">' + player.total + '</td>';
		}
		
		return html;
	}
}

// ---------------------------------------------

function clearGuideScores() {
	for(var i = 0; i < categories.length - 1; i++) {
		var element = document.querySelector(".score tr." + categories[i] + " td:nth-child(" + (data.turn + 2) + ")");
		
		if(!element || element.classList.contains("fixed")) continue;
		element.classList.remove("selectable");
		element.innerText = "";
	}
}

// ---------------------------------------------

function getCategoryName(index) {
	return (index >= 0 && index < categorieNames.length) ? categorieNames[index] : "";
}

function getCategoryIcon(index) {
	return (index >= 0 && index < categorieIcons.length) ? categorieIcons[index] : "";
}

// ---------------------------------------------

function bindScoreEvents() {
	document.querySelectorAll(".score .selectable").forEach(function(element) {
		element.addEventListener('click', function() {
			var category = this.parentElement.className;
			
			requestScore(category, function(json) {
				requestGameData();
				stopDingSound();
			});
		});
	});
}