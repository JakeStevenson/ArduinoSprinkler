//Holder for what was last reported from the UI
var currentZoneSet;
var currentZone;

//Wire up UI
$(function(){
	//Get current sprinkler state in case of refresh
	socket.emit('checkAll');
	socket.emit('showNext');

	$(".zoneButton").click(function(){
		currentZone = $(this).val();
		if($(this).hasClass("btn-inverse")){
			callZone(currentZone, 'OFF');
			return;
		}
		callZone(currentZone, 'ON');
	});
	$("#RunAll").click(function(){
		socket.emit("cycle");
	});
	$("#btnCancel").click(function(){
		socket.emit("cancel");
	});

	function callZone(zone, onOrOff){
		socket.emit('setZone', { zone: zone, onOrOff: onOrOff});
	}
});

//Wire up websockets
var socket = io.connect("/");
socket.on("zoneChange", function(data){
	setZones(data);
});
socket.on("serverError", function(data){
	alert("Server error: " + data.code);
});
socket.on("nextScheduled", function(data){
	if(data){
		$("#nextRunView").show();
		var nextRun = new Date(data);
		$("#nextRun").html(nextRun.format());
	}
	else{
		$("#nextRunView").hide();
	}
});

//Reset all the buttons to normal
function clearZoneButtons(){
	$(".zoneButton").each(function(){
		$(this).removeClass('btn-inverse');
	});
}
//Handle progress bar updates when a zone is running
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
		//Make sure we should keep updating progress bar
		if(percentage<100 && currentZoneSet[zone.id-1].status===1){
			setTimeout(function(){
				progressBarFor(zone);
			}, 1);
		}
		else{
			setTimeout(function(){
				$("#zoneProgress").hide();
				bar.width("0%");
			}, 1000);
		}
	}
};

//Handler for whenever the server reports new zone status
function setZones(data){
	clearZoneButtons();
	currentZoneSet = data.zones;
	for(var i=0; i< currentZoneSet.length;i++){
		zone = currentZoneSet[i];
		zoneID = zone.id;
		status = zone.status;
		zoneButton = $("#Zone"+zoneID);
		if(status==1){
			currentZone = zone;
			zoneButton.addClass("btn-inverse");
			progressBarFor(zone);
		}
		else{
			zoneButton.removeClass("btn-inverse");
		}
	};

};
