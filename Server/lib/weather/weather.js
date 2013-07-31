var Forecast = require('forecast.io');
var app = require('../../app.js');
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
		fullForecast = data;
		var precipProbability = data["currently"]["precipProbability"];
		var precipIntensity = data["currently"]["precipIntensity"];
	});
};

fetchForecast();
setInterval(weather.getForecast, 3600000);
