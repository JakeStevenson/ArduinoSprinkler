var 	schedule = require('node-schedule'),
	config = require("../config/config.js"),
	arduinoInterface = require("./arduinoInterface.js"),
	app = require("../app.js"),
	progressBar = require('./progress');

var scheduledRequests = [];
var manualRequest;
var schedulemaster = exports;
var scheduledZones = {};

//Get the initial state from the arduino
scheduledZones = arduinoInterface.checkAll(function(response){
	scheduledZones = JSON.parse(response);
});

//Exports
schedulemaster.checkAll = function(callback){
	arduinoInterface.checkAll(function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
		if(callback){
			callback(response);
		};
	});
};
schedulemaster.turnOffZone = function(zone){
	clearSchedule();
	progressBar.cancelBar();
	arduinoInterface.setZone(zone, "OFF", function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
	});
};
schedulemaster.runZone = function(zone){
	clearSchedule();
	arduinoInterface.setZone(zone, "ON", function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
	});
	var endTime = new Date(new Date().getTime() + config.run * 60000);
	setZoneTime(zone, new Date(), config.run * 60000);
	progressBar.runBar(config.run * 60000, zone);
	manualRequest = schedule.scheduleJob(endTime, function(){
		clearZoneTime(zone);
		arduinoInterface.setZone(zone, "OFF", function(response){
			response = addTimesToArduinoResponse(response);
			app.io.sockets.emit("zoneChange", response);
		});
	});
};
schedulemaster.cancelAll = function(){
	schedulemaster.checkAll(function(data){
		data.zones.forEach(function(zone){
			if(zone.status===1){
				schedulemaster.turnOffZone(zone.id);
			}
		});
		clearSchedule();
		schedulemaster.checkAll();
	});
};
schedulemaster.runZoneTimes = function(one, two, three, four){
	clearSchedule();

	//Any better way to loop these?
	var startTime = new Date();
	var start2 = addTime(startTime, one * 60000);
	var start3 = addTime(start2, two * 60000);
	var start4 = addTime(start3, three * 60000);
	var end4 = addTime(start4, four * 60000);

	setSchedule('1', startTime, one * 60000,  "ON");
	setSchedule('2', start2, two * 60000, "ON");
	setSchedule('3', start3, three * 60000, "ON");
	setSchedule('4', start4, four * 60000, "ON");
	setSchedule('4', end4, "", "OFF");
};
schedulemaster.runAllZones = function(){
	//Run each zone for the minutes specified in the config file
	schedulemaster.runZoneTimes(config.run,config.run,config.run,config.run);
};


//Arduino code is too dumb to keep up with when a zone was turned on and 
//	will be turned off.  So we modify the responses and match up
//	our internal knowledge
function addTimesToArduinoResponse(response){
	var arduinoZones = JSON.parse(response);
	for(var i=0;i<arduinoZones.zones.length;i++){
		zone = arduinoZones.zones[i];
		scheduled = scheduledZones.zones[i];

		if(zone.status!=1){
			scheduled.startTime = undefined;
			scheduled.runTime = undefined;
		}
		zone.startTime = scheduled.startTime;
		zone.runTime = scheduled.runTime;
	};
	return arduinoZones;
};


//Convenience funtion to schedule a job for a zone
function setSchedule(zone, time, runtime, onOrOff){
	scheduledRequests.push(schedule.scheduleJob(time, function(){
		if(onOrOff==="ON"){
			setZoneTime(zone, time, runtime);
			progressBar.runBar(runtime, zone);
		}
		arduinoInterface.setZone(zone, onOrOff, function(response){
			response = addTimesToArduinoResponse(response);
			app.io.sockets.emit("zoneChange", response);
		});
	}));
}
function clearZoneTime(zone){
	scheduledZones.zones[zone-1].startTime = undefined;
	scheduledZones.zones[zone-1].runTime = undefined;
}
function setZoneTime(zone, startTime, runTime){
	scheduledZones.zones[zone-1].startTime = startTime;
	scheduledZones.zones[zone-1].runTime = runTime;
}
function addTime(start, time){
	return new Date(start.getTime() + time);
};

function clearSchedule(){
	//Clear anything waiting to be turned off.
	if(manualRequest != undefined){
		manualRequest.cancel();
		manualRequest = undefined;
	};
	//Interrupt any cycles running
	for(var i=0; i< scheduledRequests.length; i++){
		scheduledRequests[i].cancel();
	}
	scheduledRequests = [];
};
