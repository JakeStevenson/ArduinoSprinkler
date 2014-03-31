var arduinoInfo = exports;

exports.hostname = "localhost";
exports.port = 8000;
//In minutes
exports.defaultrunMinutes = 1;
exports.minuteConversion = 6000;

exports.schedule = {
	at: {
		hour: [07, 21],
		minute: 0 
	},
	zones: [.2,.1,.1,.1]
};
