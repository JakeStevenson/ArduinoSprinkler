var 	http = require("http"),
	app = require("http").createServer(onRequest),
	io = require("socket.io").listen(app, { log: false }),
	arduinoInterface = require("./arduinoInterface.js"),
	schedulemaster = require("./schedulemaster.js"),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	fs = require('fs');


//Allow other modules to reach our sockets
exports.io = io;
	
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
			response.writeHead(200, {'Content-Type':mime.lookup(filename)});
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


//Start http server
app.listen(8888);

//Wire up socket commands
io.sockets.on("connection", function(socket){
	socket.on('checkAll', function(){
		arduinoInterface.checkAll();
	});
	socket.on('setZone', function(data){
		if(data.onOrOff === "OFF"){
			schedulemaster.turnOffZone(data.zone);
			arduinoInterface.setZone(data.zone, data.onOrOff);
		}
		else{
			schedulemaster.runZoneFor(data.zone);
		}
	});
	socket.on('cycle', function(data){
		schedulemaster.runAllZones();
	});
});
