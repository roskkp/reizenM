var size = 20;
var gpsPosition;
var typeId = '';
var beforeFilter ='';
var radius = true;
var totalPage;
var currentPage=1;
var category='';
$(function(){

/*	navigator.geolocation.getCurrentPosition (function (pos){
		  var lat = pos.coords.latitude;
		  var lng = pos.coords.longitude;
		  gpsPosition = new google.maps.LatLng(lat,lng)
	});*/
	
	$('#keyword').keypress(function(e){
		if(e.keyCode == 13){
			$('#keyword').text();
			searchKeyword();
		}
	})
	$('.radiusWrap').off().on('click', '#btnPrev, #btnNext', function(event){
		var btn = $(this).attr('id');
		if(btn=='btnPrev'){
			if(currentPage!=1){
				currentPage--;
				if(radius){
					aroundSearch(gpsPosition,typeId,currentPage);
				}else{
					searchKeyword();
				}
			}
		}else{
			if(currentPage!=totalPage){
				currentPage++;
				if(radius){
					aroundSearch(gpsPosition,typeId,currentPage);
				}else{
					searchKeyword();
				}
			}
		}
	});
	
	$('.category').off().not('#btnScrap').on('click', function(){
		var $this = $(this);
		var id = $this.attr('id');
		currentPage = 1;
		$('.category').not($this).removeClass('clicked');
		if(beforeFilter == id){
			$this.removeClass('clicked');
			typeId = '';
			beforeFilter='';
			if(radius){
				aroundSearch(gpsPosition,typeId,currentPage);
			}else{
				searchKeyword();
			}
			return ;
		}
		$this.addClass('clicked');
		beforeFilter = id;

		if(radius){ // around search
			switch(id){
			case 'btnHotel' :	typeId = 32;
									break;
			case 'btnEat' :	typeId = 39;
									break;
			case 'btnSpot' :	typeId = 12;
									break;
			case 'btnLeports' : typeId = 28;
									break;
			case 'btnShop' :	typeId = 38;
									break;
			case 'btnFestival' :	typeId = 15;
									break;
			default : break;
			}
			if(searchType=="around"){
				aroundSearch(gpsPosition,typeId,currentPage);
			}else if(searchType=="keyword"){
				searchKeyword();
			}
		}else{ //  search keyword
			category=$this.data('cate');
			searchKeyword();
		}
	});
});
function initialize() {
	$('#keyword').textinput();
	$('#spot_category').listview();
	
	$('#content').off('click').on('click', '#spot_nature', function(){
		$('#content').load('spot.html');
	});
	gpsPosition = new google.maps.LatLng('37.6152355573','126.7156852967');
	aroundSearch(gpsPosition,typeId,1);
}
function aroundSearch(position,typeId,page){
	$('#resultList').empty();
	searchType="around";
	$.ajax({
		url : reizenUrl+'location/aroundList.do?mapX='+position.lng()+'&mapY='+position.lat()+'&tid='+typeId+'&size='+size+'&page='+page,
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
						if(i%2 == 0){
							result.data[i].ab= 'b';
						}else{
							result.data[i].ab= 'a';
						}
						
					}
					var resultset = template(result);
					$('#resultList').append(resultset);
					$('#content').off('click').on('click','.contentWrap',function(){
						spot_cid = $(this).data('contentid');
						spot_typeId = $(this).data('typeid');
						$('#content').load('spot.html');
					})
					aroundCount(position);
				}else{
					swal("데이터가 없어요 :(", "", "error"); 
					return ;
				}
			}
		}
	});
}
function aroundCount(position){
	$('.resultCount').empty();
	$.getJSON(reizenUrl+'location/countAround.do?mapX='+position.lng()+'&mapY='+position.lat()+'&tid='+typeId,
		function(result){
			if(result.status == 'success'){
				totalPage = Math.ceil(result.count/size);
				$('span.resultCount').text(result.count);
			}
	});
}
function calcDistance(p1, p2) {
        var d = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
        return d;
}
function searchKeyword(){
	radius=false;
	$('#resultList').empty();
	$.ajax({
		url: reizenUrl+"location/searchkeyword.do",
		method: 'post',
		dataType: 'json',
		data: {
			'keyword': $('#keyword').val(),
			'category' :  category,
			'date' : moment().format("YYYY-MM-DD"),
			'page': currentPage,
			'size': size
		},
		success: function(result){
			if (result.status != 'success') {
				console.log('search error');
				return;
			}else{
				if(result.data.length>0){
					for(var i=1;i<result.data.length;i++){
						var targetPosition = new google.maps.LatLng(result.data[i].mapY,result.data[i].mapX);
						result.data[i].distance = calcDistance(gpsPosition,targetPosition);
						if(i%2 == 0){
							result.data[i].ab= 'b';
						}else{
							result.data[i].ab= 'a';
						}
					}
					var source = $('#searchResult').text();
					var template = Handlebars.compile(source);
					var resultset = template(result);
					$('#resultList').append(resultset);
				}else {
					return;
				}
			}
		}
	});	// ajax
}	// searchAjax
