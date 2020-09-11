var http = require("http");
var fs = require("fs");
var mime = require("mime");

var MAX_GAME_TURN = 12;
var TOTAL_DICES = 5;
var TOTAL_AVATAR = 13;

var SUCCESS = 0;
var NOT_YOUR_TURN = 1;
var code = NOT_YOUR_TURN;

var NORMAL = 0;
var ROLL = 1;
var KEEP = 2;

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
	players: [],
	status: NORMAL,
	sequence: 1
};

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
];

function init() {
	
}

function join(parameters) {
	var JOIN_SUCCESS = 0;
	var JOIN_NO_ID = 1;
	var JOIN_ALREADY_EXISTS = 2;
	
	var code = JOIN_SUCCESS;
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
	code = NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = SUCCESS;
		gamedata.status = ROLL;
		gamedata.diceCounts = [0, 0, 0, 0, 0, 0];
		gamedata.rollDices = [0, 0, 0, 0, 0];
		gamedata.leftChance--;
		gamedata.sequence++;
		
		for(var i = 0; i < gamedata.keepDices.length; i++) {
			if(gamedata.keepDices[i] != 0) {
				gamedata.diceCounts[gamedata.keepDices[i] - 1]++;
				gamedata.resultDices[i] = gamedata.keepDices[i];
				continue;
			}
			
			var random = randomNumber();
			
			gamedata.rollDices[i] = random;
			gamedata.resultDices[i] = random;
			gamedata.diceCounts[random - 1]++;
		}
		
		gamedata.rollDices.sort();
		gamedata.resultDices.sort();
	}
	
	return {
		code: code
	}
}

function keepDice(parameter) {
	code = NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = SUCCESS;
		gamedata.status = KEEP;
		gamedata.sequence++;
		
		var index = parameter.index;
		
		for(var i = 0; i < gamedata.keepDices.length; i++) {
			if(gamedata.keepDices[i] == 0) {
				gamedata.keepDices[i] = gamedata.rollDices[index];
				gamedata.rollDices[index] = 0;
				break;
			}
		}
	}
	
	return {
		code: code
	}
}

function unkeepDice(parameter) {
	code = NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = SUCCESS;
		gamedata.status = KEEP;
		gamedata.sequence++;
		
		var index = parameter.index;
		
		for(var i = 0; i < gamedata.rollDices.length; i++) {
			if(gamedata.rollDices[i] == 0) {
				gamedata.rollDices[i] = gamedata.keepDices[index];
				gamedata.keepDices[index] = 0;
				gamedata.rollDices.sort();
				break;
			}
		}
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
	var parameter = getUrlParameters(request.url);
	
	switch(urlPath) {
		case "/data":
			jsonResponse(response, gamedata);
			return;
			
		case "/join":
			jsonResponse(response, join(parameter));
			return;
			
		case "/roll":
			jsonResponse(response, randomDices(parameter));
			return;
			
		case "/keep":
			jsonResponse(response, keepDice(parameter));
			return;
			
		case "/unkeep":
			jsonResponse(response, unkeepDice(parameter));
			return;
			
		case "/score":
			jsonResponse(response, score(parameter));
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
console.log("서버 on");

// ---------------------------------------------

function score(parameter) {
	code = NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		var category = parameter.category;
		gamedata.sequence++;
		gamedata.status = NORMAL;
	
		var result = [
			getDiceDotCount(1), 
			getDiceDotCount(2), 
			getDiceDotCount(3), 
			getDiceDotCount(4), 
			getDiceDotCount(5), 
			getDiceDotCount(6),
			getChoiceScore(), 
			get4OfKindScore(), 
			getFullHouseScore(), 
			getSSrtaightScore(), 
			getLSrtaightScore(),
			getYachtScore()
		];
		
		for(var i = 0; i < categories.length; i++) {
			if(categories[i] != category) continue;
			
			var player = gamedata.players[gamedata.turn];
			
			if(i < 6) {
				player.subtotal += result[i];
				if(!player.isBonus && player.subtotal >= 63) {
					player.isBonus = true;
					player.total += 35;
				}
			}
			
			player.categories[i].fixed = true;
			player.categories[i].score = result[i];
			player.total += result[i];
			
			increaseTurn();
		}
	}
	
	return {
		code: code
	}
}

function increaseTurn() {
	gamedata.turn++;
	
	if(gamedata.turn >= gamedata.players.length) {
		gamedata.turn %= gamedata.players.length;
		gamedata.gameTurn++;
	}
	
	gamedata.leftChance = 3;
	gamedata.rollDices = [0, 0, 0, 0, 0];
	gamedata.keepDices = [0, 0, 0, 0, 0];
	gamedata.resultDices = [];
	gamedata.diceCounts = [0, 0, 0, 0, 0, 0];
}

function getDiceDotCount(number) {
	var index = number - 1;
	if(index < 0 || index >= gamedata.diceCounts.length) return 0;
	return gamedata.diceCounts[index] * number;
}

function getChoiceScore() {
	var sum = 0;
	
	for(var i = 0; i < gamedata.resultDices.length; i++) {
		sum += gamedata.resultDices[i];
	}
	
	return sum;
}

function get4OfKindScore() {
	for(var i = 0; i < gamedata.diceCounts.length; i++) {
		if(gamedata.diceCounts[i] == 4) return getChoiceScore();
	}
	
	return 0;
}

function getFullHouseScore() {
	var pair, triple;
	
	for(var i = 0; i < gamedata.diceCounts.length; i++) {
		if(gamedata.diceCounts[i] == 2) pair = true;
		else if(gamedata.diceCounts[i] == 3) triple = true;
	}
	
	return (pair && triple) ? getChoiceScore() : 0;
}

function getSSrtaightScore() {
	return checkStraight(false) ? 15 : 0;
}

function getLSrtaightScore() {
	return checkStraight(true) ? 30 : 0;
}

function getYachtScore() {
	for(var i = 0; i < gamedata.diceCounts.length; i++) {
		if(gamedata.diceCounts[i] == 5) return 50;
	}
	
	return 0;
}

function checkStraight(large) {
	var count = 0;
	var number = large ? 5 : 4;
	
	for(var i = 0; i < gamedata.diceCounts.length; i++) {
		if(gamedata.diceCounts[i] == 0) count = 0;
		else {
			count++;
			if(count == number) return true;
		}
	}
	
	return false;
}

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

function isYourTurn(parameter) {
	return gamedata.players[gamedata.turn].id == parameter.id;
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}

function randomNumber() {
	return Math.floor(Math.random() * 6 + 1);
}