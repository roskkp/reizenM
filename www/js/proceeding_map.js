$(function(){
	$('#content').off('click').on('click', '#btn_pro_current', function(){
		$('.proceeding_map').gmap('getCurrentPosition', function(position, status){
			if(status=='OK'){
				var current = new google.maps.LatLng(
					position.coords.latitude, position.coords.longitude	
				);
				$('.proceeding_map').gmap('get', 'map').panTo(current);
				$('.proceeding_map').gmap('addMarker', {'position':current});
			}else{
				alert('현재 위치를 찾을 수 없습니다.');
			}
		});
	});
	
	$('#content').on('click', '#btn_pro_back', function(){
		$('#content').load('proceeding.html');
	});
	
});

function initMap(){
	
	var spots = [];

	for(var i=0; i<routes.length; i++){
		var map1 = parseFloat(routes[i].mapY);
		var map2 = parseFloat(routes[i].mapX);
		spots[i]={
				lat: map1, 
				lng: map2
		}
	}

	var bound = new google.maps.LatLngBounds();
	for (i = 0; i < spots.length; i++) {
		bound.extend( new google.maps.LatLng(spots[i]));
	}
	var centerp = bound.getCenter();
	map = new google.maps.Map(document.getElementById('pro_map'), {
		zoom: 13,
		center: centerp, 
		animation: google.maps.Animation.DROP,
		disableDefaultUI: true
	});
	
	map.fitBounds(bound);
	var spotPath = new google.maps.Polyline({
		path: spots,
		geodesic: true,
		strokeColor: '#4682b4',
		strokeOpacity: 0.8,
		strokeWeight: 3
	});
	
	for(var i=0; i<spots.length; i++){
		var marker=[];
		marker[i] = new google.maps.Marker({
			position: spots[i],
			map: map,
			icon: {	url: '/resources/images/marker.png',
						size: new google.maps.Size(100, 100),
						scaledSize: new google.maps.Size(40, 40),
						anchor: new google.maps.Point(20,40),
						labelOrigin: new google.maps.Point(20,15)	},
			label:{
				text: 	(i+1)+'',
				color: '#ff0000',
		        fontWeight: 'bold',
				fontSize: '16px'
			}
		});
	}
	spotPath.setMap(map);
	
//	console.log('centerp : '+centerp)
//	var point = new google.maps.LatLng(37.30981, 126.87560);
//	console.log('point : '+point);
//	if(navigator.geolocation){
//		$('.proceeding_map').gmap({
//			'center' : centerp,
//			'zoom' : 16
//		});
//		$('.proceeding_map').gmap('addMarker', {'position':point});
//	}else {
//		alert('브라우저가 GeoLocation을 지원하지 않음');
//	}
}

function showPosition(position){
	alert('위도 : '+position.coords.latitude+', 경도 : '+position.coords.longitude);
}

function handleError(e){
	alert(e.message);
}