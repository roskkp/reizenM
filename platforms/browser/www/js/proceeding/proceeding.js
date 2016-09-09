
// 권한 검사 

$(function(){
	var user = sessionStorage.getItem('userNo');
	if( user ){
		var no = $(location).attr('search').substring(12);
		$.ajax({
			url : reizenUrl+'scheduler/scCheck.do?sc='+no,
			method : 'GET',
			dataType: 'json',
			success : function(result){
				if(result.status=='success'){
					if(result.pass=='false'){
						swal("Access Denied", "You do not have permission", "warning"); 
						$('body').hide();
						setTimeout(function(){ // 3초뒤 자동 이동
							window.location.href='main.html';
						},3000);
					}else if(result.pass=='right'){
						$('body').show();
						load();
					}
				}else{ // 세션에 데이터가 없을때
					sessionStorage.clear();
					sessionCheck();
					swal("세션 만료", "세션이 만료되었습니다. 다시 로그인 해 주세요.", "warning"); 
					setTimeout(function(){ // 2초뒤 자동 이동
						window.location.href='main.html';
					},2000);
				}
			}, error  : function(){
				alert('ajax error');
			}
		});
	}else {
		swal("Access Denied", "You do not have permission , Please Login", "warning"); 
		$('body').hide();
		setTimeout(function(){ // 3초뒤 자동 이동
			window.location.href='main.html';
		},3000);
	}
});

var $radio1;
var $radio2;
var $citySelect;
var category;

var cancelFollow = true;
var memoSource = null;
var memoTemplate = null;
var list = null;
var cardSource = null;
var cardTemplate = null;
var timeSource = null;
var timeTemplate = null;
var searchSource = null;
var searchTemplate = null;
var infoSource = null;
var infoTemplate = null;
var totalPage = null;
var currentDate =null;
var currentDay = null;
var scheduleNo = null;
var areaCode;
var localCode;
var page=1;
var size=10;
var alarm = true;
var routes = [];

var h; // map height
var lat;
var lng;
var centerLat;
var centerLng;
var routeNo;

var typeId='';

var aroundCount;

var title=null;

$(window).resize(function() {

	var size = $('#carousel-example-generic').css('width').replace('px','');
	if (size != '0') {
		var imgWidth = size-46;
		$('.carousel-inner').css('margin-left',(imgWidth/2)*-1+'px');
		$('.carousel-inner > .item > img').css('width',imgWidth+'px');
	}

}).resize();


function init(){ // 변수 초기화 
	$('#weather').load("weather.html");
	list = new Array();
	cardSource = $('#cardBox').text();
	cardTemplate = Handlebars.compile(cardSource);
	timeSource = $('#timelineBox').text();
	timeTemplate = Handlebars.compile(timeSource);
	memoSource = $('#memoBox').text();
	memoTemplate = Handlebars.compile(memoSource);
	infoSource = $('#infoBox').text();
	infoTemplate = Handlebars.compile(infoSource);
	scheduleNo = (location.href.substr(location.href.lastIndexOf('=') + 1)).replace("#","");
}

//시간 업데이터 function 
function updateTime(){
	var $time = $('#sortable li span.time');
	var data=[];
	var times;
	var routeNo;

	for(var i=0; i<$time.length; i++){
		times = $time.eq(i).text();
		routeNo = $('#sortable > li').eq(i).attr('data-routeno');
		data.push({
			time : times,
			routeNo : routeNo
		});
	}

	indexAjax(data);
}

// 접근 허용 
function load() {
		init(); // 전역변수 초기화
		listAjax(); // 카드 리스트 호출 
		$(document).on('click','.panel-heading',function() { // 좌측 카드 클릭 이벤트
			if (cancelFollow) {
				var scale = $($('.events-wrapper .events ol li a')[$(this).attr("data-index")-1]).attr("data-scale");
				var scaleV = 'scaleX('+scale/100+')';
				$('.filling-line').css('transform', scaleV);
				$('.panel-heading').not($(this)).parents('.ui-state-default').removeClass('panel-active');
				$(this).parents('.ui-state-default').addClass('panel-active');
			}
		});		
		
		setInterval(checkAlarm(), 1000*60*3);
		(function ($) { //좌측 카드 드래그 document ready 가 아님 
			$("#sortable").sortable({
				revert : true,
				start : function(e, ui) {
					cancelFollow = false; 
				},
				stop : function(e, ui) {
					cancelFollow = true;
				},
				update : function(e, ui) {

					$('#updateHour').empty();
					$('.adm-form-group').show();
					for(var i=0; i<24; i++){ // 00시 ~ 23시30분 까지 지원 *db가 24시를 거부합니다.
						if(i<10){
							$('#updateHour').append('<option value='+'0'+i+'>'+'0'+i+'</option>');
							continue;
						}
						$('#updateHour').append('<option value='+i+'>'+i+'</option>');
					}
					$('#timeModal').modal('show').on('hidden.bs.modal',function(e){
						updateTime();
					}); // 모달 비활성화시 발생하는 이벤트, 아래의 캔슬버튼 처리 이걸로 통일함 
					$('#btnTimeSubmit').off('click').on('click', function(){
						var contentId = $target.data('contentid');
						var time = $('#updateHour option:selected').val()+':'+$('#updateMin option:selected').val();
						$.getJSON('http://reizen.com:8890/scheduler/checkTime.do?scheduleNo='+scheduleNo+'&day='+currentDay+'&time='+time, function(result){
							if(result.status=='exist'){
								$('.control-label').remove();
								$('div.form-group').append('<label class="control-label" for="inputError1">중복된 시간입니다.</label>');
								$('div.form-group').addClass('has-error');
							} else {
								addRouteAjax(contentId,time);
								$('#timeModal, #insertRoute').modal('hide');
							} //else
						});
					});
					$('#btnSubmit, #btnCancel').off('click').on('click', function(){
						var hour = $('#updateTime input:first').val();
						if ( hour >= 1 && hour <= 24){

							if(this.id == 'btnSubmit'){

								var min = $('#updateMin').val();
								var time = hour+":"+min;
								var list = ui.item;
								list.find('span.time').text(time);

								updateTime();
								return;
							}
						} swal("Time Error", "올바른 시간을 입력하세요", "warning");
					});
				}
			});
		})(jQuery);
		$("ul, li").disableSelection();    //무슨 기능 하는지 모르겠음 
		
		$(document).on('click','.memoBtn',function(e){		// 메모버튼 클릭 이벤트 리스너
			$panelHeading = $(this).parents('.panel-heading');
			if ($panelHeading.next().hasClass('in')) {
				$panelHeading.next().removeClass('in');
				e.stopPropagation();
				return;
			}
			for (var i = 0; i < $('.panel-heading').length; i++) {
				$($('.panel-heading')[i]).next().removeClass('in');
			}
			
			$panelHeading.next().addClass('in');
			$('.list-group-item').remove();
			memoAjax($panelHeading.attr("data-contentId"));
			
		})

		$(document).on('click','.removeBtn', function(e) { // 삭제버튼 클릭 이벤트 리스너
			$this = $(this);
			if($('#sortable li').length==1){
				swal("", "더 이상 삭제할 수 없습니다.", "warning");
				return;
			}
			swal({   
				title: "해당 일정을 삭제하시겠습니까?",   
				text: "삭제 버튼을 누르시면 일정이 삭제됩니다.",   
				type: "warning",   
				showCancelButton: true,   
				confirmButtonColor: "#DD6B55",   
				confirmButtonText: "삭제",      
				cancelButtonText: "취소",
				closeOnConfirm: false }, 
				function(){
					removeAjax($this.parents('.ui-state-default'));
			});
			e.preventDefault();
		});

		$(document).on('click', '.moveDay', function(){ // 날짜 이동 버튼 이벤트 리스너 
			var day = $(this).attr('data-day');
			if ( day >= 1 && day <= totalPage){
				if( $(this).attr('data-pre') == $('#btn_prev').attr('data-pre')){
					currentDate.setDate(currentDate.getDate()-1);
				} else {
					currentDate.setDate(currentDate.getDate()+1);
				}
				moveDayAjax($(this));
			} else {
				if($(this).attr('id')=='btn_next'){
					swal("End of plan", "더 이상 계획된 일정이 없습니다. ", "warning");
				} else {
					swal("First Day", "첫째날 입니다.", "warning");
				}
			}
		});

		// 경로 버튼 클릭 이벤트 
		$(document).on('click', 'a.btn_way', function(){

			var $self = $(this).parent('div').parent('li');
			var $next = $self.next('li');

			var mapX1 = ($self.children('input.mapX').val())-0;
			var mapY1 = ($self.children('input.mapY').val())-0;
			var mapX2 = ($next.children('input.mapX').val())-0;
			var mapY2 = ($next.children('input.mapY').val())-0;

			if($(this).parent().parent('li').next('li').length>0){
				$('#findMap').modal();
				if($('#findMap').is($('#findMap').show()) ){
					initMapTransit(mapX1, mapY1, mapX2, mapY2);
				}		
				return;
			}else {
				swal("", "다음 일정이 없습니다.", "warning");
				return;
			}
		});

		
		var radius = false;
		// 일정 추가 이벤트
		$(document).on('click','.btn_plus',function(){
			var $li = $(this).parent().parent('li');
			centerLat = parseFloat($li.find('.mapY').val());
			centerLng = parseFloat($li.find('.mapX').val());
			routeNo = $li.data('routeno');
			title = $li.find('div.scheduleTitle').text();
			page = 1;
			$('#insertRoute').modal('show');
			$('#insertRoute').on('shown.bs.modal', function(){
				$('.resultList').empty();
				radius = false;
				h = $('.leftWrap').height();
				$('#modalMap').height(h);
				modalMap(centerLat, centerLng);
			});
		});

	/**		검색 조건 처리 		**/
	$radio1 = $('#inlineRadio1');
	$radio2 = $('#inlineRadio2');
	$citySelect = $('#citySelect');

	$radio1.off('click').on('click', function(event){
		$radio1.attr('checked', true);
		$radio2.attr('checked', false);
		$citySelect.attr('disabled', true);
	});
	$radio2.off('click').on('click', function(event){
		$radio1.attr('checked', false);
		$radio2.attr('checked', true);
		$citySelect.attr('disabled', false);
	});
		
	/********** search *********/
	$('#searchInput').on('keydown', function(event){
		if( event.keyCode == 13 ){
			$('ul.resultList').removeClass('resultListUp');
			$('.resultCount').empty();
			$('.resultList').empty();
			radius = false;
			page = 1;
			searchAjax();
		}
	});	// searchBar

	$('#btnSearch').on('click', function(){
		$('ul.resultList').removeClass('resultListUp');
		$('.resultCount').empty();
		$('.resultList').empty();
		radius = false;
		page = 1;
		searchAjax();
	});	// btnSearch

	var size = 10;
	$('#btnRadius').off('click').on('click', function(){
		radius = true;
		page=1;
		if(page==1){
			$('.resultList').empty();
			category='';
			aroundSearch();
			aroundCountAjax();
			$('ul.resultList').addClass('resultListUp');
		} // if page==1
	}); //btnRadius
	
	$('.resultWrap').off('click').on('click', 'a#btnPrev, a#btnNext', function(){
		var btn = $(this).attr('id');
		var totalPage = Math.ceil(aroundCount/size);
		if(btn=='btnPrev'){
			if(page!=1){
				page--;
				$('.resultList').empty();
				aroundSearch();
			}
		}else{
			if(page!=totalPage){
				page++;
				$('.resultList').empty();
				aroundSearch();
			}
		}
	});

	$('.searchIcon').not('#btnLocation').off('click').on('click', function(){
		$('.resultList').empty();
		page = 1;
		var id = $(this).attr('id');
		if(radius){
			switch(id){
			case 'btnHotel' :	typeId = 32;
									break;
			case 'btnEat' :	typeId = 39;
									break;
			case 'btnSpot' :	typeId = 12;
									break;
			case 'btnActive' : typeId = 28;
									break;
			case 'btnShop' :	typeId = 38;
									break;
			case 'btnFestival' :	typeId = 15;
									break;
			default : break;
			}
			aroundCountAjax();
			aroundSearch();
		}else{
			category=$(this).attr('data-cate');
			$('.resultList').empty();
			searchAjax();
		}
	});

	$('.resultList').scroll(function(){
		if(!radius){
			var scrolltop = parseInt($('.resultList').scrollTop());
			var scrollWhere =$('.resultList')[0].scrollHeight-parseInt($('.resultList').css('height').replace('px',''));
			if( $(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight ){
				page ++;
				searchAjax();
			}
		}
	});
	
	$('.resultList').off('click').on('click', 'a.infoBtn', function(){                // info버튼
		var $target = $(this).parent().parent('li');
		window.open('spot.html?cid='+$target.data('contentid')+'&tid='+$target.data('typeid'), '_blank');
	}).on('click', 'a.plusBtn', function(){                // plus버튼
		var $target = $(this).parent().parent('li');
		$('#timeModal').css('z-index', '9000').modal();
		$('#updateHour').empty();
		$('.adm-form-group').show();
		for(var i=0; i<24; i++){ // 00시 ~ 23시30분 까지 지원 *db가 24시를 거부합니다.
			if(i<10){
				$('#updateHour').append('<option value='+'0'+i+'>'+'0'+i+'</option>');
				continue;
			}
			$('#updateHour').append('<option value='+i+'>'+i+'</option>');
		}
		$('.modal-backdrop:last').css('z-index', '8000');
		$('#btnTimeSubmit').off('click').on('click', function(){
			var contentId = $target.data('contentid');
			var time = $('#updateHour option:selected').val()+':'+$('#updateMin option:selected').val();
			$.getJSON('http://reizen.com:8890/scheduler/checkTime.do?scheduleNo='+scheduleNo+'&day='+currentDay+'&time='+time, function(result){
				if(result.status=='exist'){
					$('.control-label').remove();
					$('div.form-group').append('<label class="control-label" for="inputError1">중복된 시간입니다.</label>');
					$('div.form-group').addClass('has-error');
				} else {
					addRouteAjax(contentId,time);
					$('#timeModal, #insertRoute').modal('hide');
				} //else
			});
		});
	}).on('click', 'a.mapBtn', function(){                // map버튼
		var $li = $(this).parent().parent('li');
		lat = parseFloat($li.data('mapy'));
		lng = parseFloat($li.data('mapx'));
		title = $(this).parent().prev('.resultTextBox').children('h3').text();
		modalMap(lat, lng);
	});
	
	// 메모 알람!
	$(document).on('click','.alarm',function(){
		$(this).removeClass('alarm').removeClass('alarmOn');
		viewAlarm($(this).attr('data-routeNo'));
	})
	
	setInterval(() => {
		if (alarm) {
			$('.alarm').addClass('alarmOn',100);	
			alarm = false;
		} else {
			$('.alarm').removeClass('alarmOn',100);
			alarm = true;
		}
			
	}, 1000);
	
}



var map=null;

// proceeding 지도 부분
function initProceedingMap(mapList) {
	var spots = [];

	for(var i=0; i<mapList.length; i++){
		var location = mapList[i].split(",");
		var map1 = parseFloat(location[0]);
		var map2 = parseFloat(location[1]);
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
	map = new google.maps.Map(document.getElementById('map'), {
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
				color: '#ffffff',
		        fontWeight: 'bold',
				fontSize: '16px'
			}
		});
	}
	spotPath.setMap(map);
}

function initMapTransit(mapX1, mapY1, mapX2, mapY2){

	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();

	var start = new google.maps.LatLng(mapY1, mapX1);
	var end =  new google.maps.LatLng(mapY2, mapX2);

	var bound = new google.maps.LatLngBounds();
	bound.extend( start );
	bound.extend( end );

	var centerp = bound.getCenter();

	var mapOptions = {
			zoom:10,
			center: centerp,
			disableDefaultUI: true
	}

	var miniMap = new google.maps.Map(document.getElementById("initMap"), mapOptions);

	miniMap.fitBounds(bound);

	var request = {
			origin:start,
			destination:end,
			travelMode: google.maps.TravelMode.TRANSIT
	};

	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		}else {
			console.log("길찾기 오류!");
		}
	});

	directionsDisplay.setMap(miniMap);
	directionsDisplay.setPanel(document.getElementById('panel'));
}

function modalMap(lat, lng, maps){
	if(arguments.length==2){
		console.log('2');
		var point = {lat:lat, lng:lng};
		
		map = new google.maps.Map(document.getElementById('modalMap'), {
			zoom: 10,
			center: point,
			disableDefaultUI: true
		});

	    var marker = new google.maps.Marker({
	      map: map,
	      position: point,
	      icon: '/resources/images/marker.png'
	    });
	    
	    var infowindow = new google.maps.InfoWindow({
	    	  content:title
	    });

	    infowindow.open(map, marker);
	    
	} else if(arguments.length==3){
		
		var point = {lat:lat, lng:lng};
		
		map = new google.maps.Map(document.getElementById('modalMap'), {
			zoom: 12,
			center: point,
		    disableDefaultUI: true
		});

		maps.push(point);
		
		for (var i = 0; i < maps.length; i++) {
			var mapses = maps[i];
			var lat = mapses.lat;
			var lng = mapses.lng;
			var index = (i+1).toString();
			if(i==maps.length-1){
				index=' ';
			}
			var marker = new google.maps.Marker({
				position: {lat: lat, lng: lng},
				map: map,
				icon: '/resources/images/marker.png',
				label:{
					text: 	index,
					color: '#ffffff',
			        fontWeight: 'bold',
					fontSize: '16px'
				}
			});
		}
	    
	    var radius = new google.maps.Circle({
	    	  center:point,
	    	  radius:5000,
	    	  strokeColor:"#666",
	    	  strokeOpacity:0.5,
	    	  strokeWeight:1,
	    	  fillColor:"#666",
	    	  fillOpacity:0.2
	    	});
	    
	    radius.setMap(map);
	    
	    var infowindow = new google.maps.InfoWindow({
	    	  content:title
	    });

	    infowindow.open(map,marker);
	}
}

function markers(map, maps){
	
}

