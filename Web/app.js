var 	http = require("http"),
	app = require("http").createServer(onRequest),
	io = require("socket.io").listen(app, { log: false }),
	arduinoInfo = require("./arduinoinfo.js");
	url = require('url'),
	path = require('path'),
	fs = require('fs');


//Basic web server pumps out our files
function onRequest(request, response){
	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);
	
	//Ghetto default route!
	if(uri === "/"){filename = path.join(process.cwd(), "sprinkler.html")};

	//We look to see if a file matches the request
	fs.exists(filename, function(exists) {
		if(exists) {
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



function setZone(zone, onOrOff){
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
				io.sockets.emit("zoneChange", str);
			});
		})
		.on("error", function(){console.log('ERROR');})
		.end();	
	return;
}
function checkAll(){
	var options={
		host: arduinoInfo.hostname,
		port: arduinoInfo.port,
		path: "/ALL"
		}
		http.request(options, function(response){
			 var str = ''
			response.on('data', function (chunk) {
			    str += chunk;
			});

			response.on('end', function () {
				io.sockets.emit("zoneChange", str);
			});
		})
		.on("error", function(){
			console.log('ERROR');
		})
		.end();	
};
app.listen(8888);
io.sockets.on("connection", function(socket){
	socket.on('checkAll', function(){
		checkAll();
	});
	socket.on('setZone', function(data){
		setZone(data.zone, data.onOrOff);	
	});
	socket.on('disconnect', function () {
	});
});
