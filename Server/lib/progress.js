var ProgressBar = require("progress");

var timer;

exports.runBar = function(timeToRun, zone){
	exports.cancelBar();
	var bar = new ProgressBar('[:bar] :percent', {total: timeToRun/100, width: 60});
	console.log("Running zone " + zone);
	timer = setInterval(function(){
		bar.tick();
		if(bar.complete){
			exports.cancelBar();
		};
	}, 100);
};

exports.cancelBar = function(){
	console.log("\rComplete" + Array(70).join(" ") + "\n");
	clearInterval(timer);
};
