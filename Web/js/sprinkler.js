function clearZones(){
	$(".zoneButton").each(function(){
		$(this).removeClass('btn-inverse');
	});
}
function setZones(data){
	clearZones();
	console.log('zoneInfo: ' + data);
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
	$.ajax({
		type: 'GET',
		url: '/ALL',
		success: setZones
	});

	window.setInterval(function(){
		console.log('TICK');
		$.ajax({
			type: 'GET',
			url: '/ALL',
			success: setZones
		});
	}, 4000);

	$("#all").click(function(){
		var minutes = $("#txtMinutes").val() * 60000;
		$.ajax({
			type: 'GET',
			url: '/cycle/'+minutes,
			success: setZones
		});

	});

	$(".zoneButton").click(function(){
		var zone = $(this).val();
		if($(this).hasClass("btn-inverse")){
			callZone(zone, 'OFF');
			return;
		}
		callZone(zone, 'ON');
	});

	function callZone(zone, onOrOff){
		console.log(zone);
		$.ajax({
			type: 'GET',
			url: '/'+zone+'/'+onOrOff,
			success: setZones
		});

	}
});
