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
var cancelledTimes = [];

later.date.localTime();

console.log("Loading schedule from disk: " );
console.log(storedSchedule);
if(storedSchedule){
	storedSchedule.forEach(function(schedule)
	{
		var job = later.parse.cron(schedule.cron);
		jobs.push(job);
		var timer = later.setInterval(function(){
			var time = later.schedule(job).next(1);
			if(cancelledTimes.indexOf(time.valueOf())>-1){
				console.log("Ignore scheduled task-- it was cancelled");
				return;
			}
			console.log("Beginning scheduled run");
			//schedulemaster.runZoneTimes.apply(undefined, schedule.zones);
		}, job);
	});
}

//Exports
recurringSchedule.nextScheduled = function(){
	if(jobs.length>0){
		//Find next actual scheduled
		var nextInvocations = [];
		jobs.forEach(function(job){
			var nextIndex = 1;
			var time = later.schedule(job).next(nextIndex);
			while(cancelledTimes.indexOf(time.valueOf()) > -1){
				nextIndex++;
				var allListed = later.schedule(job).next(nextIndex);
				time = allListed[nextIndex-1];
			}
			nextInvocations.push(time);
		});
		nextInvocations.sort();
		var next = nextInvocations[0];
		return nextInvocations[0];
	}
	return "";
};

recurringSchedule.cancelToday = function(){
	var nextScheduledJob = recurringSchedule.nextScheduled();
	cancelledTimes.push(nextScheduledJob.valueOf());
	var afterCancelled = recurringSchedule.nextScheduled();
	app.io.sockets.emit("nextScheduled", afterCancelled);
	return;
};
