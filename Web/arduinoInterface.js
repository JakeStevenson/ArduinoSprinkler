var 	config = require("./config/config.js"),
	http = require("http"),
	app = require("./app.js");
var arduinoInterface = exports;

//Basic request to our arduino REST interface
arduinoInterface.arduinoRequest = function (uri, callback){
	var options={
		host: config.hostname,
		port: config.port,
		path: uri
	}
	http.request(options, function(response){
		var str = '';
		response.on('data', function (chunk) {
		    str += chunk;
		});

		response.on('end', function () {
			callback(str);
		});
	})
	.on("error", function(error){
		app.io.sockets.emit("serverError", error);
	})
	.end();	
};

//Set a specific zone
exports.setZone = function(zone, onOrOff, callback){
	var uri =  "/" + zone + "/" + onOrOff;
	arduinoInterface.arduinoRequest(uri, function(response){
		//notify all clients
		if(callback){
			callback(response);
		};
	});
}
//Request current zone info
exports.checkAll = function(callback){
	arduinoInterface.arduinoRequest("/ALL", function(response){
		//notify all clients
		if(callback){
			callback(response);
		};
	});
};
