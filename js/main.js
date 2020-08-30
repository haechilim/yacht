document.addEventListener("DOMContentLoaded", function() {
	resize();
});

window.addEventListener('resize', function() {
	resize();
});

function resize() {
	document.querySelector("#board").style.height = window.innerHeight + "px";
}