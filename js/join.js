
function init() {
	resize();
}

// ---------------------------------------------

function bindEvents() {
	var avatars = document.querySelectorAll(".avatars .avatar");

	avatars.forEach(function(element) {
		element.addEventListener("click", function() {
			avatars.forEach(function(element) {
				element.classList.remove("selected");
			});
			this.classList.add("selected");
		});
	});

	document.querySelector("#join").addEventListener("click", function() {
		var name = document.querySelector("#name").value;
		var avatar = document.querySelector(".avatars .selected").getAttribute("avatar");
		var url = "/?name=" + name + "&avatar=" + avatar;

		if(name) location.href = url;
	});
}

function resize() {
	document.querySelectorAll(".full-screen").forEach(function(element) {
		element.style.width = window.innerWidth + "px";
		element.style.height = window.innerHeight + "px";
	})
}

// ---------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
	init();
	bindEvents();
});

window.addEventListener('resize', function() {
	resize();
});
