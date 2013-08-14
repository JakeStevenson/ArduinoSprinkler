var Forecast = require('forecast.io');
var app = require('../../app.js');
var schedule = require('../recurringSchedule.js');
var options = {
	  APIKey: "SECRET"
};

var weather = exports;
var summary;
var icon;
var fullForecast;
forecast = new Forecast(options);


weather.conditions = function(){
	return fullForecast;
};
weather.getForecast = function(){
	app.io.sockets.emit('weatherForecast', weather.conditions());
};

var fetchForecast = function(){
	forecast.get(29.7750, -95.6130,function (err, res, data) {
		console.log("Fetched forecast");
		fullForecast = data;
		var precipProbability = data["currently"]["precipProbability"];
		var precipIntensity = data["currently"]["precipIntensity"];
		weather.getForecast();

		if(precipProbability==1 && precipIntensity > 0){
			console.log("Cancelling because of rain.");
			schedule.cancelNext();
		}
	});
};

fetchForecast();
setInterval(fetchForecast, 3600000);
