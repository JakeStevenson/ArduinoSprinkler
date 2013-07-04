var 	http = require("http"),
	url = require('url'),
	path = require('path'),
	fs = require('fs');



function onRequest(request, response){
	callback = function(callresponse){
		var str = '';
		//another chunk of data has been recieved, so append it to `str`
		callresponse.on('data', function (chunk) {
		  str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		callresponse.on('end', function () {
		  console.log(str);
		  response.write(str);
		  response.end();
		});

	};
	var uri = url.parse(request.url).pathname;
	console.log(uri);
	var filename = path.join(process.cwd(), uri);
	if(uri === "/"){filename = path.join(process.cwd(), "sprinkler.html")};
	console.log(filename);

	path.exists(filename, function(exists) {
	if(!exists) {
		var options={
			host: '192.168.1.237',
			path: uri
		}
		http.request(options, callback).end();	
		return;
		}
	else{
		response.writeHead(200, {'Content-Type':'text/html'});
		var fileStream = fs.createReadStream(filename);
		fileStream.on('data', function (data) {
			response.write(data);
		});
		fileStream.on('end', function() {
			response.end();
		});
		console.log('done');
		}
	})



};


http.createServer(onRequest).listen(8888);
