var scheduler = require('node-schedule');
var storage = require('node-localstorage').LocalStorage;
var path = require('path');
var schedulemaster = require("./schedulemaster.js");
var config = require("../config/config.js");
var app = require("../app.js");

var recurringSchedule = exports;
var todayCancelled = false;
var jobs = [];

//Startup
//If a daily job is defined in the config, set it up
var localStorage = new storage(path.join(process.cwd(), "scratch"));
var storedSchedule = JSON.parse(localStorage.getItem('schedule'));
console.log(storedSchedule);
if(storedSchedule){
	storedSchedule.forEach(function(schedule)
	{
		jobs.push(scheduler.scheduleJob(schedule.cron, function(){
			//Pass in the config array to runZoneTimes
			console.log("Beginning scheduled run");
			schedulemaster.runZoneTimes.apply(undefined, schedule.zones);
			app.io.sockets.emit('nextScheduled', recurringSchedule.nextScheduled())
		}));
	});
}

//Exports
recurringSchedule.nextScheduled = function(){
	if(jobs.length>0){
		return jobs[0].nextInvocation();
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
			var reset = scheduler.scheduleJob(resetTime, function(){
				todayCancelled = false;
				console.log("New day, reset scheduling");
			});
			console.log("Cancelled today, will reset at " + resetTime);
		}
	}
};
