var arduinoInfo = exports;

exports.hostname = "192.168.1.237";
exports.port = 80;
exports.defaultrunMinutes = 10;
exports.conversion = 60000;

exports.schedule = {
	at: {
		hour: [07, 21],
		minute: 0 
	},
	zones: [25,20,20,20]
};
