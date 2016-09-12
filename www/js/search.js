var size = 20;
var gpsPosition;
$(function(){

/*	navigator.geolocation.getCurrentPosition (function (pos){
		  var lat = pos.coords.latitude;
		  var lng = pos.coords.longitude;
		  gpsPosition = new google.maps.LatLng(lat,lng)
	});*/
	
});
function initialize() {
	$('#keyword').textinput();
	$('#spot_category').listview();
	
	$('#content').off('click').on('click', '#spot_nature', function(){
		$('#content').load('spot.html');
	});
	 gpsPosition = new google.maps.LatLng('37.6152355573','126.7156852967');
	aroundSearch(gpsPosition,'',1);
}
function aroundSearch(center,typeId,page){
	$.ajax({
		url : reizenUrl+'location/aroundList.do?mapX='+center.lng()+'&mapY='+center.lat()+'&tid='+typeId+'&size='+size+'&page='+page,
		method: 'GET',
		dataType: 'json',
		success: function(result){
			if (result.status != 'success') {
				console.log('search error');
				return;
			}else{
				if(result.data.length>0){
					var source = $('#searchResult').text();
					var template = Handlebars.compile(source);
					for(var i=1;i<result.data.length;i++){
						var targetPosition = new google.maps.LatLng(result.data[i].mapY,result.data[i].mapX);
						result.data[i].distance = calcDistance(gpsPosition,targetPosition);
						console.log("이름 : "+result.data[i].locateName + "거리"+result.data[i].distance);
						if(i%2 == 0){
							result.data[i].ab= 'b';
						}else{
							result.data[i].ab= 'a';
						}
						
					}
					var resultset = template(result);
					$('#resultList').append(resultset);
				}else{
					swal("데이터가 없어요 :(", "", "error"); 
					return ;
				}
			}
		}
	});
}
function calcDistance(p1, p2) {
        var d = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
        return d;
}
