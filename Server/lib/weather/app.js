var Forecast = require('forecast.io');
var options = {
	  APIKey: "SECRET"
};

var weather = exports;
forecast = new Forecast(options);

	forecast.get(29.7750, -95.6130,function (err, res, data) {
		var summary = (data["minutely"]["summary"]);
		var icon = (data["icon"]);
		var precipProbability = data["currently"]["precipProbability"];
		var precipIntensity = data["currently"]["precipIntensity"];
	});



