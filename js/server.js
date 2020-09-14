var http = require("http");
var fs = require("fs");
var mime = require("mime");

var MAX_GAME_TURN = 12;
var TOTAL_DICES = 5;
var TOTAL_AVATAR = 13;


var SESSION_TIMEOUT = 10000; // 세션 유지시간 (ms)
var RESULT_SHOWING_TIME = 5000; // 점수화면 노출시간

// 카테고리 인덱스
var ACES_INDEX = 0;
var SIXES_INDEX = 5;
var CHOICE_INDEX = 6;
var YACHT_INDEX = 11;

// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;
var RC_NO_PERMISSION = 2;

// 참가요청에 대한 응답코드
var JOIN_SUCCESS = 0;
var JOIN_NO_NAME = 1;
var JOIN_ALREADY_EXISTS = 2;

// 게임 상태(Game Status)
var GS_NORMAL = 0;
var GS_ROLL = 1;
var GS_KEEP = 2;
var GS_WAITING = 3;
var GS_RESULT = 4;

var gamedata = {
	totalDices: TOTAL_DICES,
	maxGameTurn: MAX_GAME_TURN,
	gameTurn: 1,
	turn: 0,
	leftChance: 3,
	rollDices: [-1, -1, -1, -1, -1],
	keepDices: [0, 0, 0, 0, 0],
	resultDices: [],
	diceCounts: [0, 0, 0, 0, 0, 0],
	players: [],
	status: GS_WAITING,
	sequence: 1
};

var lastId = 0;

var categories = [
	"aces", "deuces", "threes", "fours", "fives", "sixes",
	"choice", "kind", "full-house", "s-straight", "l-straight", "yacht",
];

// ------------------- 데이터 init --------------------------

function init() {
	gamedata.totalDices = TOTAL_DICES;
	gamedata.maxGameTurn = MAX_GAME_TURN;
	gamedata.gameTurn = 1;
	gamedata.turn = 0;
	gamedata.leftChance = 3;
	gamedata.rollDices = [-1, -1, -1, -1, -1];
	gamedata.keepDices = [0, 0, 0, 0, 0];
	gamedata.resultDices = [];
	gamedata.diceCounts = [0, 0, 0, 0, 0, 0];
	gamedata.status = GS_WAITING;
	
	gamedata.players.forEach(function(element) {
		element.playing = true;
		element.isBonus = false;
		element.subtotal = 0;
		element.total = 0;
		
		var categories = element.categories;
		
		for(var i = 0; i < categories.length; i++) {
			categories[i].fixed = false;
			categories[i].score = 0;
		}
	});
}

// ------------------- 전송 요청 처리 (주로직) --------------------------

function join(parameters) {
	var code = JOIN_SUCCESS;
	var id = -1;
	var name = parameters.name;
	var avatar = makeValidAvatar(parameters.avatar);
	
	if(!name) code = JOIN_NO_NAME;
	else {
		var player = getPlayerByName(name);
		
		if(player) code = JOIN_ALREADY_EXISTS;
		else {
			player = newPlayer(name, avatar);
			gamedata.players.push(player);
			setOwner();
			gamedata.sequence++;
		}
		
		id = player.id;
	}
	
	return {
		code: code,
		id: id
	};
}

function start(parameter) {
	var code = RC_NO_PERMISSION;
	
	if(isOwner(parameter.id)) {
		code = RC_SUCCESS;
		gamedata.status = GS_NORMAL;
		gamedata.sequence++;
	}
	
	return {
		code: code
	};
}

function abort(parameter) {
	var code = RC_NO_PERMISSION;
	
	if(isOwner(parameter.id)) {
		code = RC_SUCCESS;
		init();
		gamedata.sequence++;
	}
	
	return {
		code: code
	};
}

function roll(parameter) {
	var code = RC_NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = RC_SUCCESS;
		gamedata.status = GS_ROLL;
		gamedata.leftChance--;
		gamedata.sequence++;
		
		reroll();
		updateResult();
		updateDiceCount();
		calculateGuideScores();
	}
	
	return {
		code: code
	};
	
	function reroll() {
		// 남아 있는 주사위만 다시 굴림
		for(var i = 0; i < gamedata.rollDices.length; i++) {
			if(gamedata.rollDices[i] == 0) continue;
			gamedata.rollDices[i] = randomNumber();
		}
	}
	
	function updateResult() {
		gamedata.resultDices = [];
		
		gamedata.keepDices.forEach(function(number) {
			if(number == 0) return;
			gamedata.resultDices.push(number);
		});
		
		gamedata.rollDices.forEach(function(number) {
			if(number == 0) return;
			gamedata.resultDices.push(number);
		});
		
		gamedata.resultDices.sort();
	}

	function updateDiceCount() {
		gamedata.diceCounts = [0, 0, 0, 0, 0, 0];
		
		gamedata.resultDices.forEach(function(number) {
			gamedata.diceCounts[number - 1]++;
		});
		
		gamedata.rollDices.sort();
	}
}

function keep(parameter) {
	var code = RC_NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = RC_SUCCESS;
		gamedata.status = GS_KEEP;
		gamedata.sequence++;
		
		addToEmptySlot(parameter.index);
	}
	
	return {
		code: code
	};
	
	function addToEmptySlot(index) {
		// 킵 주사위 영역 앞에서부터 빈 칸에 넣기
		for(var i = 0; i < gamedata.keepDices.length; i++) {
			if(gamedata.keepDices[i] == 0) {
				gamedata.keepDices[i] = gamedata.rollDices[index];
				gamedata.rollDices[index] = 0;
				break;
			}
		}
	}
}

function unkeep(parameter) {
	var code = RC_NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = RC_SUCCESS;
		gamedata.status = GS_KEEP;
		gamedata.sequence++;
		
		moveToRollDices(parameter.index);
	}
	
	return {
		code: code
	};
	
	function moveToRollDices(index) {
		// 떠있는 주사위쪽으로 다시 옮기기
		gamedata.rollDices.sort();
		gamedata.rollDices[0] = gamedata.keepDices[index];
		gamedata.keepDices[index] = 0;
		gamedata.rollDices.sort();
	}
}

function score(parameter) {
	var code = RC_NOT_YOUR_TURN;
	
	if(isYourTurn(parameter)) {
		code = RC_SUCCESS;
		gamedata.status = GS_NORMAL;
		gamedata.sequence++;
	
		fixPlayerScore(parameter.category);
		calculateScore();
		increaseTurn();
	}
	
	return {
		code: code
	};
	
	function fixPlayerScore(categoryName) {
		// 가이드 점수에 있는 값을 실제 플레이어 점수로 반영
		var player = currentPlayer();
		var categories = player.categories;
		
		for(var i = 0; i < categories.length; i++) {
			var category = categories[i];
			
			if(category.name == categoryName) category.fixed = true;
			else if(!category.fixed) category.score = 0;
		}
	}
}

// --------------------- 점수 계산 ------------------------

function calculateScore() {
	calculateSubtotal();
	calculateTotal();
}

function calculateSubtotal() {
	var sum = 0;
	var player = currentPlayer();
	
	for(var i = ACES_INDEX; i <= SIXES_INDEX; i++) {
		 sum += player.categories[i].score;
	}
	
	player.subtotal = sum;
	player.isBonus = player.subtotal >= 63;
}

function calculateTotal() {
	var player = currentPlayer();
	
	player.total = player.subtotal;
	if(player.isBonus) player.total += 35;
	
	for(var i = CHOICE_INDEX; i <= YACHT_INDEX; i++) {
		 player.total += player.categories[i].score;
	}
}

function calculateGuideScores() {
	var player = currentPlayer();
	var guideScores = [
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
	
	for(var i = 0; i < player.categories.length; i++) {
		var category = player.categories[i];
		if(category.fixed) continue;
		category.score = guideScores[i];
	}
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

function newPlayer(name, avatar) {
	var result = {
		id: lastId++,
		name: name,
		avatar: avatar,
		playing: gamedata.status == GS_WAITING,
		owner: false,
		isBonus: false,
		subtotal: 0,
		total: 0,
		categories: [],
		time: new Date()
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

function setOwner() {
	if(gamedata.players.length <= 0) return;
	
	gamedata.players[0].owner = true;
}

function currentPlayer() {
	return gamedata.players[gamedata.turn];
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

function randomNumber() {
	return Math.floor(Math.random() * 6 + 1);
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

function isYourTurn(parameter) {
	return gamedata.players[gamedata.turn].id == parameter.id;
}

function isOwner(id) {
	return getPlayerById(id).owner;
}

function increaseTurn() {
	for(var i = 0; i < gamedata.players.length; i++) {
		nextTurn();
		
		var player = getPlayerByIndex(gamedata.turn);
		
		if(player && player.playing) break;
	}
	
	gamedata.leftChance = 3;
	gamedata.rollDices = [-1, -1, -1, -1, -1];
	gamedata.keepDices = [0, 0, 0, 0, 0];
	gamedata.resultDices = [];
	gamedata.diceCounts = [0, 0, 0, 0, 0, 0];
	
	function nextTurn() {
		gamedata.turn++;
	
		if(gamedata.turn >= gamedata.players.length) {
			gamedata.turn %= gamedata.players.length;
			if(gamedata.gameTurn < 12) gamedata.gameTurn++;
			else {
				gamedata.status = GS_RESULT;
				
				setTimeout(function() {
					init();
					gamedata.sequence++;
				}, RESULT_SHOWING_TIME);
			}
		}
	}
}

// ------------------ 플레이어 관련 ---------------------------

function getPlayerById(id) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];
		if(player.id == id) return player;
	}
	
	return null;
}

function getPlayerByName(name) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];
		if(player.name == name) return player;
	}
	
	return null;
}

function getPlayerByIndex(index) {
	return (index >= 0 && index < gamedata.players.length) ? gamedata.players[index] : null;
}

// ------------------ 카테고리 관련 ---------------------------

function getCategoryIndex(name) {
	for(var i = 0; i < categories.length; i++) {
		if(categories[i] == name) return i;
	}
	
	return -1;
}	

// ------------------- 전송 요청 처리 --------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);
	
	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	var parameter = getUrlParameters(request.url);
	
	switch(urlPath) {
		case "/data":
			updateSessionTime(parameter.id);
			jsonResponse(response, gamedata);
			return;
			
		case "/join":
			jsonResponse(response, join(parameter));
			return;
			
		case "/start":
			jsonResponse(response, start(parameter));
			return;
			
		case "/abort":
			jsonResponse(response, abort(parameter));
			return;
			
		case "/roll":
			jsonResponse(response, roll(parameter));
			return;
			
		case "/keep":
			jsonResponse(response, keep(parameter));
			return;
			
		case "/unkeep":
			jsonResponse(response, unkeep(parameter));
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
				
			response.end("File Not Found");
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
checkSessionTimeout();
console.log("서버 on");

// ------------------- 세션 관련 --------------------------

function checkSessionTimeout() {
	setInterval(function() {
		var now = new Date().getTime();
		
		for(var i = 0; i < gamedata.players.length; i++) {
			var player = gamedata.players[i];
			
			if(now - player.time >= SESSION_TIMEOUT) {
				if(gamedata.turn == i && i == gamedata.players.length - 1) gamedata.turn = 0;
				else if(gamedata.turn > i) gamedata.turn--;
				gamedata.players.splice(i, 1);
				setOwner();
				gamedata.sequence++;
			}
		}
	}, SESSION_TIMEOUT);
}

function updateSessionTime(id) {
	var player = getPlayerById(id);
	if(player) player.time = new Date().getTime();
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
		var tokens = url.split("?");
		return tokens.length > 1 ? tokens[1] : "";
	}
}

function getFilePath(urlPath) {
	if(urlPath == "/") return "join.html";
	else if(urlPath == "/game") return "yacht.html";
	
	return urlPath.substr(1, urlPath.length - 1);
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}
