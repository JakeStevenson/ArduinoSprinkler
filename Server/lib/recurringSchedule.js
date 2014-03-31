var later = require('later');
var storage = require('node-localstorage').LocalStorage;
var path = require('path');
var schedulemaster = require("./schedulemaster.js");
var config = require("../config/config.js");
var app = require("../app.js");

var recurringSchedule = exports;
var todayCancelled = false;
var jobs = [];

//Startup
//Load cron jobs from localstorage
var localStorage = new storage(path.join(process.cwd(), "storedSchedule"));
var storedSchedule = JSON.parse(localStorage.getItem('schedule'));

later.date.localTime();

console.log("Loading schedule from disk: " );
console.log(storedSchedule);
if(storedSchedule){
	storedSchedule.forEach(function(schedule)
	{
		var job = later.parse.cron(schedule.cron);
		jobs.push(job);
		var timer = job.setTimeout(function(){
			console.log("Beginning scheduled run");
			//Pass in the config array to runZoneTimes
			schedulemaster.runZoneTimes.apply(undefined, schedule.zones);
			app.io.sockets.emit('nextScheduled', recurringSchedule.nextScheduled());
		}, job);
	});
}

//Exports
recurringSchedule.nextScheduled = function(){
	if(jobs.length>0){
		//Find next actual scheduled
		var nextInvocations = [];
		jobs.forEach(function(job){
			nextInvocations.push(job.next(1));
		});
		nextInvocations.sort();
		return nextInvocations[0];
	}
	return "";
};

recurringSchedule.cancelToday = function(){
	return;
	if(!todayCancelled){
		todayCancelled = true;
		var today = new Date();
		var resetTime = new Date();
		resetTime.setDate(today.getDate()+1);
		var reset = scheduler.scheduleJob(resetTime, function(){
			todayCancelled = false;
			console.log("New day, reset scheduling");
		});
		console.log("Cancelled today, will reset at " + resetTime);
	}
};
