var http = require("http");
var fs = require("fs");
var mime = require("mime");

var MAX_GAME_TURN = 12;
var TOTAL_DICES = 5;
var PLAYER_COUNT = 3;

var gamedata = {
	totalDices: TOTAL_DICES,
	maxGameTurn: MAX_GAME_TURN,
	gameTurn: 1,
	turn: 0,
	leftChance: 3,
	rollDices: [0, 0, 0, 0, 0],
	keepDices: [0, 0, 0, 0, 0],
	resultDices: [],
	diceCounts: [0, 0, 0, 0, 0, 0],
	players: []
};

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
	"total"
];

function initPlayers() {
	gamedata.players.length = 0;
	
	for(var i = 0; i < PLAYER_COUNT; i++) {
		gamedata.players.push(newPlayer(i, i + 1));
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

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);
	
	var filepath = getfilepath(request.url);
	var contentType = mime.getType(filepath);

	
	//console.log(contentType + " " + isText(contentType));
	
	if(request.url == "/data") {
		response.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-cache"
		});
			
		initPlayers();
		response.end(JSON.stringify(gamedata));
		return;
	}
		
	if(isText(contentType))	{
		fs.readFile(filepath, "utf-8", function(error, data) {
			content(error, data);
		});
	}
	else {
		fs.readFile(filepath, function(error, data) {
			content(error, data);
		});
	}
	
	function content(error, data) {
		if(error) {
			response.writeHead(404, {
				"content-type": contentType + (isText(contentType) ? "; charset=utf-8" : "")
			});
				
			response.end("그런 파일 없다!");
		}
		else {
			response.writeHead(200, {
				"content-type": contentType + (isText(contentType) ? "; charset=utf-8" : ""),
				"cache-control": isText(contentType) ? "no-cache" : "max-age=31536000"
			});
				
			response.end(data);
		}
	}
});

server.listen(8888);

console.log("나 듣고 있다!");

function getfilepath(request) {
	if(request == "/") return "yacht.html";
	
	return request.substr(1, request.length - 1);
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}