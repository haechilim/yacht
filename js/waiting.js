
function showWaitingPopup(visible) {
	var owner = AmIOwner();
	var container = document.querySelector("#container");
	var blocker = document.querySelector("#blocker");
	var waiting = document.querySelector("#waiting");
	var waitingPopup = document.querySelector("#waiting .popup");
	var ownerDesc = document.querySelector("#waiting .desc.owner");
	var othersDesc = document.querySelector("#waiting .desc.others");
	var start = document.querySelector("#start");

	if(visible) {
		container.classList.add("blur");
		document.querySelector("#waiting .avatars").innerHTML = getAvatarsHtml();
	}
	else container.classList.remove("blur");

	if(!owner) document.querySelector("#waiting .desc .owner").innerText = decodeURIComponent(data.players[0].name);

	ownerDesc.style.display = owner ? "flex" : "none";
	othersDesc.style.display = !owner ? "flex" : "none";
	start.style.display = owner ? "flex" : "none";
	waitingPopup.style.height = owner ? "340px" : "245px";

	blocker.style.display = visible ? "block" : "none";
	waiting.style.display = visible ? "flex" : "none";
}

function getAvatarsHtml(maxScore) {
	var html = "";

	data.players.forEach(function(player, index) {
		html += '<div class="player">';
			html += '<div class="avatar">'
				html += '<img src="image/avatar/avatar' + player.avatar + '.png"/>';
			html += '</div>';
			html += '<div class="name">' + decodeURIComponent(player.name) + '</div>';
		html += '</div>';
	});

	return html;
}