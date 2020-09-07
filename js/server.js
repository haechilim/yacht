var http = require("http");
var fs = require("fs");
var mime = require("mime");

var server = http.createServer(function(request, response) {
	var filepath = getfilepath(request.url);
	var contentType = mime.getType(filepath);
	
	console.log("요청 URL: " + request.url + " " + contentType);
		
	if(isText(contentType))	{
		fs.readFile(filepath, "utf-8", function(error, data) {
			content(data);
		});
	}
	else {
		fs.readFile(filepath, function(error, data) {
			content(data);
		});
	}
	
	function content(data) {
		response.writeHead(200, {
			"content-type": contentType + (isText(contentType) ? "; charset=utf-8" : ""),
			"cache-control": isText(contentType) ? "no-cache" : "max-age=31536000"
		});
			
		response.end(data);
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