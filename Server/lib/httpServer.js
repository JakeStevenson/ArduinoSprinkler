var 	http = require("http"),
	auth = require("http-auth"),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	fs = require('fs');

var httpServer = exports;
exports.server = http.createServer(onRequest).listen(8888);
var basic = auth({
	authRealm: "Private area",
	authFile: path.join(process.cwd(), "htpasswd"),
	authType: "digest"
});


//Basic web server pumps out our files
function onRequest(request, response){
	basic.apply(request, response, function(username){
		var uri = url.parse(request.url).pathname;
		var filename = path.join(process.cwd(),'web', uri);
		
		//Ghetto default route!
		if(uri === "/"){filename = path.join(process.cwd(), "web", "sprinkler.html")};

		//We look to see if a file matches the request
		fs.exists(filename, function(exists) {
			if(exists) {
				//Spit out the actual file
				response.writeHead(200, {'Content-Type':mime.lookup(filename)});
				var fileStream = fs.createReadStream(filename);
				fileStream.on('data', function (data) {
					response.write(data);
				});
				fileStream.on('end', function() {
					response.end();
				});
			}
		})
	});
};
