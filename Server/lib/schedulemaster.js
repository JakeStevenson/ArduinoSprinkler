var 	later = require('later'),
	config = require("../config/config.js"),
	arduinoInterface = require("./arduinoInterface.js"),
	app = require("../app.js"),
	progressBar = require('./progress'),
	Q = require('q');

var schedulemaster = exports;
var cancelCurrent = function(){};
var runningTimer;

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
schedulemaster.cancelAll = function(){
	if(cancelCurrent != undefined){
		cancelCurrent();
		console.log("Cancelled run.");
	};
};
schedulemaster.runZone = function(zone, minutes){
	var deferred = Q.defer();
	var startTime = new Date();
	var runTime = minutes * config.minuteConversion;
	arduinoInterface.setZone(zone, "ON", function(response){
		response = addTimesToArduinoResponse(response, startTime, runTime);
		app.io.sockets.emit("zoneChange", response);
	});
	var stopCurrent = function(){
		arduinoInterface.setZone(zone, "OFF", function(response){
			response = addTimesToArduinoResponse(response, startTime, runTime);
			app.io.sockets.emit("zoneChange", response);
		});
		clearTimeout(runningTimer);
		runningTimer = undefined;
		completeCurrent = function(){};
	};
	cancelCurrent = function(){
		stopCurrent();
		progressBar.cancelBar();
		deferred.reject();
	};
	runningTimer = setTimeout(function(){
		stopCurrent();
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
function addTimesToArduinoResponse(response, startTime, runTime){
	var arduinoZones = JSON.parse(response);
	for(var i=0;i<arduinoZones.zones.length;i++){
		zone = arduinoZones.zones[i];
		if(zone.status===1){
			zone.startTime = startTime;
			zone.runTime = runTime;
		}
	};
	return arduinoZones;
};

function addTime(start, time){
	return new Date(start.getTime() + time);
};
