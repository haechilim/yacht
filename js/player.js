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