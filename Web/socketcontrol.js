var io;
var sockets;

var socketmodule = exports;

//Notify all clients that we have a new set of data
socketmodule.notifyChange =  function(data){
	for(var i = 0; i< sockets.length; i++){
	    sockets[i].emit("zoneChange", data);
	}
}

socketmodule.attachTo = function(app){
	io = require("socket.io").listen(app, { log: false });
	sockets = [];


	io.sockets.on("connection", function(socket){
		//Add these folks to our list
		sockets.push(socket);
		socket.on('disconnect', function () {
			sockets.remove(socket);
		});
	});
	return this;
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
