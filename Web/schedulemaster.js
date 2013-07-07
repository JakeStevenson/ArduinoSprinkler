var 	schedule = require('node-schedule'),
	arduinoInterface = require("./arduinoInterface.js");

var scheduledRequests = [];
var manualRequest;
var schedulemaster = exports;

//var run=900000;
//var pause = 30000;
var run=5000;
var pause=1000;

schedulemaster.turnOffZone = function(zone){
	clearCycle();
	arduinoInterface.setZone(zone, "OFF");
};
schedulemaster.runZoneFor = function(zone){
	clearCycle();
	scheduledRequests = [];
	arduinoInterface.setZone(zone, "ON");
	var endTime = new Date(new Date().getTime() + run);
	manualRequest = schedule.scheduleJob(endTime, function(){
		arduinoInterface.setZone(zone, "OFF");
	});
};
schedulemaster.runAllZones = function(){

	clearCycle();

	//Any better way to loop these?
	var startTime = new Date();
	var end1 = addTime(startTime, run);

	var start2 = addTime(end1, pause);
	var end2 = addTime(start2, run);

	var start3 = addTime(end2, pause);
	var end3 = addTime(start3, run);

	var start4 = addTime(end3, pause);
	var end4 = addTime(start4, run);

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
		arduinoInterface.setZone(zone, onOrOff);
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
