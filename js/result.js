
function showResult(visible) {
	var container = document.querySelector("#container");
	var blocker = document.querySelector("#blocker");
	var result = document.querySelector("#result");

	if(visible) {
		container.classList.add("blur");

		drawResult();
		playApplauseSound();
	}
	else container.classList.remove("blur");

	blocker.style.display = visible ? "block" : "none";
	result.style.display = visible ? "flex" : "none";

	function drawResult() {
		result.innerHTML = getResultHtml(getMaxScore());
	}
}

function getMaxScore() {
	var max = 0;

	data.players.forEach(function(player) {
		max = Math.max(max, player.total);
	});

	return max;
}

function getResultHtml(maxScore) {
	var html = "";

	data.players.forEach(function(player, index) {
		var winner = player.total == maxScore;

		html += '<div class="player">';
			html += '<div class="top">'
				if(winner) html += '<img class="trophy" src="image/result/trophy.png"/>';
				html += '<div class="name' + (winner ? ' winner' : '') + '">' + decodeURIComponent(player.name) + '</div>';
				if(winner) html += '<img class="trophy" src="image/result/trophy.png"/>';
			html += '</div>';

			html += '<div class="middle' + (winner ? ' winner' : '') + '">';
				html += '<div class="avatar">';
					html += '<img src="image/avatar/avatar' + player.avatar + '.png"/>';
				html += '</div>';
			html += '</div>';

			html += '<div class="bottom">';
				html += '<div class="score">' + player.total + '</div>';
			html += '</div>';
		html += '</div>';
	});

	return html;
}