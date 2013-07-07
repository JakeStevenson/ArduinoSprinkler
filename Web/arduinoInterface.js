var 	arduinoInfo = require("./arduinoinfo.js"),
	http = require("http");
	app = require("./app.js");
var arduinoInterface = exports;

//Basic request to our arduino REST interface
var arduinoRequest = function (uri, callback){
	var options={
		host: arduinoInfo.hostname,
		port: arduinoInfo.port,
		path: uri
	}
	http.request(options, function(response){
		var str = ''
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
exports.setZone = function(zone, onOrOff){
	var uri =  "/" + zone + "/" + onOrOff;
	arduinoRequest(uri, function(response){
		//notify all clients
		app.io.sockets.emit("zoneChange", response);
	});
}
//Request current zone info
exports.checkAll = function(){
	arduinoRequest("/ALL", function(response){
		//notify all clients
		app.io.sockets.emit("zoneChange", response);
	});
};
