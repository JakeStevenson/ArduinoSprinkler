var schedule = require('node-schedule');
var schedulemaster = require("./schedulemaster.js");
var config = require("../config/config.js");
var app = require("../app.js");

var recurringSchedule = exports;

//Startup
//If a daily job is defined in the config, set it up
if(config.schedule){
	var dailyJob = new schedule.scheduleJob(config.schedule, function(){
		schedulemaster.runAllZones();
		app.io.sockets.emit('nextScheduled', recurringSchedule.nextScheduled());
	});
}

//Exports
recurringSchedule.nextScheduled = function(){
	if(dailyJob){
		return dailyJob.showNextRun();
	}
	return "";
};

recurringSchedule.cancelNext = function(){
	if(dailyJob){
		dailyJob.cancelNext();
		app.io.sockets.emit('nextScheduled', recurringSchedule.nextScheduled());
	}
};
