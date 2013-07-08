var 	schedule = require('node-schedule'),
	config = require("./config/config.js"),
	arduinoInterface = require("./arduinoInterface.js"),
	app = require("./app.js");

var scheduledRequests = [];
var manualRequest;
var schedulemaster = exports;
var scheduledZones = {};

//Set up our initial data structure from what's happening on the arduino on startup
scheduledZones = arduinoInterface.checkAll(function(response){
	scheduledZones = JSON.parse(response);
});

function addTimesToArduinoResponse(response){
	var arduinoZones = JSON.parse(response);
	for(var i=0;i<arduinoZones.zones.length;i++){
		zone = arduinoZones.zones[i];
		scheduled = scheduledZones.zones[i];

		if(zone.status!=1){
			scheduled.startTime = undefined;
			scheduled.runTime = undefined;
		}
		zone.startTime = scheduled.startTinme;
		zone.runTime = scheduled.runTime;
	};
	console.log(arduinoZones);
	return arduinoZones;
};


schedulemaster.checkAll = function(callback){
	arduinoInterface.checkAll(function(response){
		response = addTimesToArduinoResponse(response);
		if(callback){
			callback(response);
		};
	});
};
schedulemaster.turnOffZone = function(zone){
	clearCycle();
	arduinoInterface.setZone(zone, "OFF", function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
	});
};
schedulemaster.runZoneFor = function(zone){
	clearCycle();
	scheduledRequests = [];
	arduinoInterface.setZone(zone, "ON", function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
	});
	var endTime = new Date(new Date().getTime() + config.run);
	scheduledZones.zones[zone-1].startTime = new Date();
	scheduledZones.zones[zone-1].runTime = config.run;
	manualRequest = schedule.scheduleJob(endTime, function(){

		scheduledZones.zones[zone-1].startTime = undefined;
		scheduledZones.zones[zone-1].runTime = undefined;

		arduinoInterface.setZone(zone, "OFF", function(response){
			response = addTimesToArduinoResponse(response);
			app.io.sockets.emit("zoneChange", response);
		});
	});
};
schedulemaster.runAllZones = function(){
	clearCycle();

	//Any better way to loop these?
	var startTime = new Date();
	var end1 = addTime(startTime, config.run);

	var start2 = addTime(end1, config.pause);
	var end2 = addTime(start2, config.run);

	var start3 = addTime(end2, config.pause);
	var end3 = addTime(start3, config.run);

	var start4 = addTime(end3, config.pause);
	var end4 = addTime(start4, config.run);

	setSchedule('1', startTime, "ON");
	setSchedule('1', end1, "OFF");

	setSchedule('2', start2, "ON");
	setSchedule('2', end2, "OFF");

	setSchedule('3', start3, "ON");
	setSchedule('3', end3, "OFF");

	setSchedule('4', start4, "ON");
	setSchedule('4', end4, "OFF");
};

function setSchedule(zone, time, onOrOff){
	scheduledRequests.push(schedule.scheduleJob(time, function(){
		arduinoInterface.setZone(zone, onOrOff, function(response){
			response = addTimesToArduinoResponse(response);
			app.io.sockets.emit("zoneChange", response);
		});
	}));
}
function addTime(start, time){
	return new Date(start.getTime() + time);
};

function clearCycle(){
	//Clear anything waiting to be turned off.
	if(manualRequest != undefined){
		manualRequest.cancel();
		manualRequest = undefined;
	};
	//Interrupt any cycles running
	for(var i=0; i< scheduledRequests.length; i++){
		scheduledRequests[i].cancel();
	}
};
