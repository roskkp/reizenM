$(function(){
	
	$('#content').off('click').on('click', '#btn_spot_current', function(){
		$('.spot_map').gmap('getCurrentPosition', function(position, status){
			if(status=='OK'){
				var current = new google.maps.LatLng(
					position.coords.latitude, position.coords.longitude	
				);
				$('.spot_map').gmap('get', 'map').panTo(current);
				$('.spot_map').gmap('addMarker', {'position':current});
			}else{
				alert('현재 위치를 찾을 수 없습니다.');
			}
		});
	});
	
	$('#content').on('click', '#btn_spot_back', function(){
		$('#content').load('spot.html');
	});
	
});

function initMap(){
	
	var point = new google.maps.LatLng(mapY, mapX);
	if(navigator.geolocation){
		$('.spot_map').gmap({
			'center' : point,
			'zoom' : 16
		});
		$('.spot_map').gmap('addMarker', {'position':point});
	}else {
		alert('브라우저가 GeoLocation을 지원하지 않음');
	}
}

function showPosition(position){
	alert('위도 : '+position.coords.latitude+', 경도 : '+position.coords.longitude);
}

function handleError(e){
	alert(e.message);
}