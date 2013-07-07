function clearZones(){
	$(".zoneButton").each(function(){
		$(this).removeClass('btn-inverse');
	});
}
function setZones(data){
	clearZones();
	var zoneInfo = $.parseJSON(data);
	for(var i=0; i< zoneInfo.zones.length;i++){
		zoneID = zoneInfo.zones[i].id;
		status = zoneInfo.zones[i].status;
		zoneButton = $("#Zone"+zoneID);
		if(status==1){
			zoneButton.addClass("btn-inverse");
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

	function callZone(zone, onOrOff){
		socket.emit('setZone', { zone: zone, onOrOff: onOrOff});
	}
});

var socket = io.connect("/");
socket.on("zoneChange", function(data){
	setZones(data);
});

