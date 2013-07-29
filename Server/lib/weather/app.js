var Forecast = require('forecast.io');
var options = {
	  APIKey: "SECRET"
};

var weather = exports;
forecast = new Forecast(options);

var getForecast = function(){
	console.log('fetching');
	forecast.get(29.7750, -95.6130,function (err, res, data) {
		var summary = (data["minutely"]["summary"]);
		var icon = (data["icon"]);
		var precipProbability = data["currently"]["precipProbability"];
		var precipIntensity = data["currently"]["precipIntensity"];
		console.log("Latest forecast: " + summary);
	});
};

getForecast();
setInterval(getForecast, 3600000);
