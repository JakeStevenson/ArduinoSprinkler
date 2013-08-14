var arduinoInfo = exports;

exports.hostname = "localhost";
exports.port = 8000;
//In minutes
exports.run = .1;

exports.schedule = {
	at: {hour:16, minute:07},
	zones: [.2,.1,.1,.1]
};
