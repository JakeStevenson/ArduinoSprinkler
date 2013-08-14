var arduinoInfo = exports;

exports.hostname = "192.168.1.237";
exports.port = 80;
//In minutes
exports.run = 20;

exports.schedule = {
	at: {hour:21, minute:0},
	zones: [25,20,20,20]
};
