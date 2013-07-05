var 	http = require("http"),
	url = require('url'),
	path = require('path'),
	fs = require('fs');
var exec=require('child_process').exec;

var zones = {"zones": [
	{
		"id": 1,
		 "status": 0
	},
	{
		"id": 2,
		 "status": 0
	},
	{
		"id": 3,
		 "status": 0
	},
	{
		"id": 4,
		 "status": 0
	},
 ]};
 	

function onRequest(request, response){
	var uri = url.parse(request.url).pathname;
	console.log("uri:" + uri);
	var pathSet = uri.split('/');
	if(pathSet.length>2){
		var zoneToSet = parseInt(pathSet[1])-1;
		var onOrOff = pathSet[2];
		console.log('zone to set:' + zoneToSet);

		for(var i=0;i<4;i++){
			zones.zones[i].status=0;
		}	
		var setTo = 0;
		if(onOrOff==="ON"){
			setTo = 1;
		}
		zones.zones[zoneToSet].status = setTo;
		exec('afplay STICKHIT.WAV');
	}
	console.log("request: " + uri);
	console.log(JSON.stringify(zones));
	response.write(JSON.stringify(zones));
	response.end();

};


http.createServer(onRequest).listen(8000);
