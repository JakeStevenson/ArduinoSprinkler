var 	http = require("http"),
	app = require("http").createServer(onRequest),
	io = require("socket.io").listen(app, { log: false }),
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

var socket;

function callZone(zone, onOrOff){
	var options={
		host: arduinoInfo.hostname,
		port: arduinoInfo.port,
		path: "/" + zone + "/" + onOrOff
		}
		http.request(options, function(response){
			 var str = ''
			response.on('data', function (chunk) {
			    str += chunk;
			});

			response.on('end', function () {
			    socket.emit("zoneChange", str);
			});
		}).end();	
	return;
}

function cycleZones(time){
	//Ghetto chained timeouts!
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
	
	//Ghetto default route!
	if(uri === "/"){filename = path.join(process.cwd(), "sprinkler.html")};

	//We look to see if a file matches the request
	fs.exists(filename, function(exists) {
		if(!exists) {
			//This is not a file request, we consider it an API request
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
			//Spit out the actual file
			//MIME TYPES IGNORED FOR NOW
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


app.listen(8888);
io.sockets.on("connection", function(socketin){
	socket = socketin;
});
