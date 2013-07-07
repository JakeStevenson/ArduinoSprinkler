var 	arduinoInfo = require("./arduinoinfo.js"),
	http = require("http");
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
	.on("error", function(){console.log('ERROR');})
	.end();	
};

//Set a specific zone
exports.setZone = function(zone, onOrOff, callback){
	var uri =  "/" + zone + "/" + onOrOff;
	arduinoRequest(uri, function(response){
		callback(response);
	});
}
//Request current zone info
exports.checkAll = function(callback){
	arduinoRequest("/ALL", function(response){
		callback(response);
	});
};
