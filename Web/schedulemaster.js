var 	schedule = require('node-schedule'),
	arduinoInterface = require("./arduinoInterface.js");



var manualRequest;
var schedulemaster = exports;


schedulemaster.runZoneFor = function(zone, time){
	arduinoInterface.setZone(zone, "ON");
	var endTime = new Date(new Date().getTime() + time);
	manualRequest = schedule.scheduleJob(endTime, function(){
		arduinoInterface.setZone(zone, "OFF");
	});
};

