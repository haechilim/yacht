function initPlayers() {
	for(var i = 0; i < PLAYER_COUNT; i++) {
		players.push(newPlayer(i, i + 1));
	}
}

function newPlayer(id, avatar) {
	var result = {
		id: id,
		avatar: avatar,
		isBonus: false,
		subtotal: 0,
		total: 0,
		categories: []
	};
	
	for(var i = 0; i < categories.length; i++) {
		result.categories.push({
			name: categories[i],
			fixed: false,
			selectable: false,
			score: 0
		});
	}
	
	return result;
}

function updateSelectable(selectable) {
	var categories = players[turn].categories;
	
	categories.forEach(function(category) {
		category.selectable = category.fixed ? false : selectable;
	});
}

function getCategory(player, category) {
	var categories = player.categories;
	
	for(var index = 0; index < categories.length; index++) {
		if(category == categories[index].name) return categories[index];
	}
	
	return null;
}

function getCategoryIndex(player, category) {
	var categories = player.categories;
	
	for(var index = 0; index < categories.length; index++) {
		if(category == categories[index].name) return index;
	}
	
	return -1;
}