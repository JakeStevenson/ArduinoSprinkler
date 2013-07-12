var	httpServer = require("./lib/httpServer.js"),
	schedulemaster = require("./lib/schedulemaster.js");

//Start http server
app = httpServer.server;

//Start socket.io server
io = require("socket.io").listen(app, { log: false }),

//Allow other modules to reach our sockets
exports.io = io;

//Wire up socket commands
io.sockets.on("connection", function(socket){
	//Status check
	socket.on('checkAll', function(){
		schedulemaster.checkAll();
	});

	//Set a specific zone
	socket.on('setZone', function(data){
		if(data.onOrOff === "OFF"){
			schedulemaster.turnOffZone(data.zone);
		}
		else{
			schedulemaster.runZone(data.zone);
		}
	});

	//Run all the zones in order
	socket.on('cycle', function(data){
		schedulemaster.runAllZones();
	});

	//Cancel whatever we're doing
	socket.on('cancel', function(data){
		schedulemaster.cancelAll();
	});
	//Tell UI when the next run will be
	socket.on('showNext', function(){
		socket.emit('nextScheduled', schedulemaster.nextScheduled());
	});
});
