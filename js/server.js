var http = require("http");
var fs = require("fs");

var server = http.createServer(function(request, response) {
	console.log("요청 URL", request.url);
		
	var str = getstr(request.url);
		
	if(isText(str))	{
		fs.readFile(str, "utf-8", function(error, data) {
			content(data);
		});
	}
	else {
		fs.readFile(str, function(error, data) {
			content(data);
		});
	}
	
	function content(data) {
		response.writeHead(200, {
			"content-type": getContentType(str) + (isText(str) ? "; charset=utf-8" : ""),
			"cache-control": isText(str) ? "no-cache" : "max-age=31536000"
		});
			
		response.end(data);
	}
});

server.listen(8888);

console.log("나 듣고 있다!");

function getstr(request) {
	if(request == "/") return "yacht.html";
	
	return request.substr(1, request.length - 1);
}

function getContentType(str) {
	var arr = str.split(".");
	
	var extension = arr[arr.length - 1];
	
	if(extension == "html") return "text/html";
	else if(extension == "css") return "text/css";
	else if(extension == "js") return "application/javascript";
	else if(extension == "png") return "image/png";
	else if(extension == "ico") return "image/x-icon";
	else if(extension == "m4a") return "audio/mp4";
}

function isText(str) {
	return getContentType(str) == "text/html" || getContentType(str) == "text/css" || getContentType(str) == "application/javascript";
}