var schedule = require('node-schedule');
var schedulemaster = require("./schedulemaster.js");
var config = require("../config/config.js");
var app = require("../app.js");

var recurringSchedule = exports;
var todayCancelled = false;

//Startup
//If a daily job is defined in the config, set it up
if(config.schedule){
	var dailyJob = new schedule.scheduleJob(config.schedule.at, function(){
		//Pass in the config array to runZoneTimes
		schedulemaster.runZoneTimes.apply(undefined, config.schedule.zones);
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
	if(!todayCancelled){
		if(dailyJob){
			dailyJob.cancelNext();
			app.io.sockets.emit('nextScheduled', recurringSchedule.nextScheduled());
			todayCancelled = true;
			var today = new Date();
			var resetTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
			var reset = schedule.scheduleJob(resetTime, function(){
				todayCancelled = false;
				console.log("New day, reset scheduling");
			});
			console.log("Cancelled today, will reset at " + resetTime);
		}
	}
};
