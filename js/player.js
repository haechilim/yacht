function updateSelectable(selectable) {
	var categories = data.players[data.turn].categories;
	
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