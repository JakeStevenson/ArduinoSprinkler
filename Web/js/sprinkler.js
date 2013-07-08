function clearZones(){
	$(".zoneButton").each(function(){
		$(this).removeClass('btn-inverse');
	});
}
function progressBarFor(zone){
	if(zone.startTime!=undefined){
		$("#zoneProgress").show();
		var startTime = new Date(zone.startTime);
		var endTime = new Date(new Date(zone.startTime).getTime() + zone.runTime);
		var bar = $(".bar");
		var current = new Date();
		var totalTime = endTime - startTime;
		var passedTime = current - startTime;
		var percentage = Math.round((passedTime/totalTime) * 100);
		bar.width(percentage + '%');
		bar.html(percentage+'%');
		if(percentage<100){
			setTimeout(function(){
				progressBarFor(zone);
			}, 10);
		}
		else{
			setTimeout(function(){
				$("#zoneProgress").hide();
				bar.width("0%");
			}, 1000);
		}
	}
};

function setZones(data){
	clearZones();
	var zoneInfo = data;
	for(var i=0; i< zoneInfo.zones.length;i++){
		zoneID = zoneInfo.zones[i].id;
		status = zoneInfo.zones[i].status;
		zoneButton = $("#Zone"+zoneID);
		if(status==1){
			zoneButton.addClass("btn-inverse");
			progressBarFor(zoneInfo.zones[i]);
		}
		else{
			zoneButton.removeClass("btn-inverse");
		}
	};

};

$(function(){
	//Get current sprinkler state in case of refresh
	socket.emit('checkAll');

	$(".zoneButton").click(function(){
		var zone = $(this).val();
		if($(this).hasClass("btn-inverse")){
			callZone(zone, 'OFF');
			return;
		}
		callZone(zone, 'ON');
	});
	$("#RunAll").click(function(){
		socket.emit("cycle");
	});

	function callZone(zone, onOrOff){
		socket.emit('setZone', { zone: zone, onOrOff: onOrOff});
	}
});

var socket = io.connect("/");
socket.on("zoneChange", function(data){
	setZones(data);
});
socket.on("serverError", function(data){
	debugger;
	alert("Server error: " + data.code);
});

