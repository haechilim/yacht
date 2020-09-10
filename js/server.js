var http = require("http");
var fs = require("fs");
var mime = require("mime");

var MAX_GAME_TURN = 12;
var TOTAL_DICES = 5;
var TOTAL_AVATAR = 13;

var NORMAL = 0;
var ROLL = 1;

var gamedata = {
	totalDices: TOTAL_DICES,
	maxGameTurn: MAX_GAME_TURN,
	gameTurn: 1,
	turn: 0,
	leftChance: 3,
	rollDices: [0, 0, 0, 0, 0],
	keepDices: [0, 0, 0, 0, 0],
	players: [],
	status: NORMAL,
	sequence: 1
};

var resultDices: [];
var diceCounts: [0, 0, 0, 0, 0, 0];

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
	"total"
];

function init() {
	
}

function join(requestUrl) {
	var JOIN_SUCCESS = 0;
	var JOIN_NO_ID = 1;
	var JOIN_ALREADY_EXISTS = 2;
	
	var code = JOIN_SUCCESS;
	var parameters = getUrlParameters(requestUrl);
	var avatar = makeValidAvatar(parameters.avatar);
	
	if(!parameters.id) code = JOIN_NO_ID;
	else {
		if(playerExists(parameters.id)) code = JOIN_ALREADY_EXISTS;
		else {
			gamedata.players.push(newPlayer(parameters.id, avatar));
			gamedata.sequence++;
		}
	}
	
	return {
		code: code,
		id: parameters.id
	};
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

function makeValidAvatar(avatar) {
	return (!avatar || avatar < 1 || avatar > TOTAL_AVATAR) ? randomAvatar() : avatar;
}

function randomAvatar() {
	var usableAvatars = [];
	
	for(var index = 1; index <= TOTAL_AVATAR; index++) {
		if(!avatarExists(index)) usableAvatars.push(index);
	}
	
	if(usableAvatars.length > 0) {
		return usableAvatars[Math.floor(Math.random() * usableAvatars.length)];
	}
	
	return 1;
}

function randomDices(parameter) {
	var SUCCESS = 0;
	var NOT_YOUR_TURN = 1;
	var code = NOT_YOUR_TURN;
	
	if(isYourYurn(parameter)) {
		code = SUCCESS;
		
		for(var i = 0; i < TOTAL_DICES; i++) {
			var random = randomNumber();
			
			gamedata.rollDices[i] = random;
			gamedata.resultDices[i] = random;
			//gamedata.diceCounts[random - 1]++;
		}
		
		gamedata.rollDices.sort();
		gamedata.resultDices.sort();
		gamedata.sequence++;
	}
	
	return {
		code: code
	}
}

function playerExists(id) {
	for(var i = 0; i < gamedata.players.length; i++) {
		if(gamedata.players[i].id == id) return true;
	}
	
	return false;
}

function avatarExists(avatar) {
	for(var i = 0; i < gamedata.players.length; i++) {
		if(gamedata.players[i].avatar == avatar) return true;
	}

	return false;
}

init();

// ---------------------------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);
	
	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	
	//console.log(contentType + " " + isText(contentType));
	
	switch(urlPath) {
		case "/join":
			jsonResponse(response, join(request.url));
			return;
			
		case "/data":
			jsonResponse(response, gamedata);
			return;
			
		case "/roll":
			var parameter = getUrlParameters(request.url);
			gamedata.status = ROLL;
			
			jsonResponse(response, randomDices(parameter));
			return;
	}
		
	if(isText(contentType))	fs.readFile(filepath, "utf-8", content);
	else fs.readFile(filepath, content);
	
	function content(error, data) {
		if(error) {
			response.writeHead(404, {
				"content-type": "text/plain; charset=utf-8"
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

// ---------------------------------------------

function jsonResponse(response, data) {
	response.writeHead(200, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-cache"
	});
		
	response.end(JSON.stringify(data));
}

function getUrlPath(url) {
	var index = url.indexOf("?");
	return index < 0 ? url : url.substr(0, index);
}

function getUrlParameters(url) {
	var result = {};
	var part = parameterPart();
	var parameters = part.split("&");
	
	for(var i = 0; i < parameters.length; i++) {
		var tokens = parameters[i].split("=");
		
		if(tokens.length < 2) continue;
		
		result[tokens[0]] = tokens[1];
	}
	
	return result;
	
	
	function parameterPart() {
		/*
			/page?a=ddd&x=12342&y=333 -> a=ddd&x=12342&y=333
		*/
		var tokens = url.split("?");
		return tokens.length > 1 ? tokens[1] : "";
	}
}

function getFilePath(urlPath) {
	if(urlPath == "/") return "yacht.html";
	
	return urlPath.substr(1, urlPath.length - 1);
}

function isYourYurn(parameter) {
	return gamedata.players[gamedata.turn].id == parameter.id;
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}

function randomNumber() {
	return Math.floor(Math.random() * 6 + 1);
}