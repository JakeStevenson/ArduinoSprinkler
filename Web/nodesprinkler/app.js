var 	http = require("http"),
	url = require('url'),
	path = require('path'),
	fs = require('fs');

/*
var 	arduinoInfo = {
		"hostname" : "192.168.1.237",
		"port" : 80
	};
*/

var 	arduinoInfo = {
		"hostname" : "localhost",
		"port" : 8000
	};

function cycleZones(time){
	callZone(1, "ON");
	setTimeout(function(){
		callZone(2, "ON");
		setTimeout(function(){
			callZone(3, "ON");
			setTimeout(function(){
				callZone(4, "ON");
				setTimeout(function(){
					callZone(4, "OFF");
				}, time);
			}, time);
		}, time);
	}, time);
};
function callZone(zone, onOrOff){
	var options={
		host: arduinoInfo.hostname,
		port: arduinoInfo.port,
		path: "/" + zone + "/" + onOrOff
		}
	http.request(options, callback).end();	
	return;
}
function onRequest(request, response){
	callback = function(callresponse){
		var str = '';
		//another chunk of data has been recieved, so append it to `str`
		callresponse.on('data', function (chunk) {
		  str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		callresponse.on('end', function () {
		  response.write(str);
		  response.end();
		});
	};

	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);
	if(uri === "/"){filename = path.join(process.cwd(), "sprinkler.html")};

	fs.exists(filename, function(exists) {
	if(!exists) {
		if(uri.indexOf('cycle')>=0){
			var time = uri.substring(uri.lastIndexOf("/")+1);
			cycleZones(time);
		}
		else{
			var options={
				host: arduinoInfo.hostname,
				port: arduinoInfo.port,
				path: uri
				}
			http.request(options, callback).end();	
			return;
			}
		}
	else{
		response.writeHead(200, {'Content-Type':'text/html'});
		var fileStream = fs.createReadStream(filename);
		fileStream.on('data', function (data) {
			response.write(data);
			});
		fileStream.on('end', function() {
			response.end();
			});
		}
	})



};


http.createServer(onRequest).listen(8888);
