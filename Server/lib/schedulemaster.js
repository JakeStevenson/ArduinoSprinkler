var 	later = require('later'),
	config = require("../config/config.js"),
	arduinoInterface = require("./arduinoInterface.js"),
	app = require("../app.js"),
	progressBar = require('./progress'),
	Q = require('q');

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
schedulemaster.runZone = function(zone, minutes){
	var deferred = Q.defer();
	clearSchedule();
	arduinoInterface.setZone(zone, "ON", function(response){
		response = addTimesToArduinoResponse(response);
		app.io.sockets.emit("zoneChange", response);
	});
	var endTimer = setTimeout(function(){
		clearZoneTime(zone);
		arduinoInterface.setZone(zone, "OFF", function(response){
			response = addTimesToArduinoResponse(response);
			app.io.sockets.emit("zoneChange", response);
		});
		deferred.resolve();
	}, minutes * config.minuteConversion);
	progressBar.runBar(minutes * config.minuteConversion, zone);
	return deferred.promise;
};
schedulemaster.runZoneTimes = function(one, two, three, four){
	schedulemaster.runZone( '1', one )
	.then(function(){
		return schedulemaster.runZone( '2', two);
	})
	.then(function(){
		return schedulemaster.runZone( '3', three);
	})
	.then(function(){
		return schedulemaster.runZone('4', four);
	});
};
schedulemaster.runAllZones = function(){
	schedulemaster.runZoneTimes(config.defaultrunMinutes,config.defaultrunMinutes, config.defaultrunMinutes, config.defaultrunMinutes);
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
function addTime(start, time){
	return new Date(start.getTime() + time);
};

function clearSchedule(){
	//Clear anything waiting to be turned off.
	if(manualRequest != undefined){
		clearTimeout(manualRequest);
		manualRequest = undefined;
	};
	//Interrupt any cycles running
	for(var i=0; i< scheduledRequests.length; i++){
		scheduledRequests[i].cancel();
	}
	scheduledRequests = [];
};
