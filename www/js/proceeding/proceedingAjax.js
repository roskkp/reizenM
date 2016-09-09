function listPage(result){
	var getMonth = currentDate.getMonth()+1;
	var getDate = currentDate.getDate();
	var getDay = currentDate.getDay();
	for (var i = 0; i < result.list.length; i++) {
		routes.push(result.list[i].routeNo);
	}
	if(getMonth < 10){
		getMonth = '0' + getMonth;
	}
	if(getDate < 10){
		getDate = '0' + getDate;
	}
	switch (getDay) {
	case 0:
		getDay = '일';
		break;
	case 1:
		getDay = '월';
		break;
	case 2:
		getDay = '화';
		break;
	case 3:
		getDay = '수';
		break;
	case 4:
		getDay = '목';
		break;
	case 5:
		getDay = '금';
		break;
	case 6:
		getDay = '토';
		break;
	default:
		break;
	}
	$('.date').html(currentDate.getFullYear()+'.'+getMonth+'.'+getDate);
	$('.day').html(' '+getDay);
	if (result.list[0].day > 1) {
		$('#btn_prev').css('opacity','').attr('data-day',result.list[0].day-1);
	} else {
		$('#btn_prev').css('opacity','0.7').attr('data-day',-1);
	}
	if (result.list[0].day == totalPage) { 
		$('#btn_next').css('opacity','0.7'); 
		$('#btn_next').removeAttr('data-day');
	} else {
		$('#btn_next').attr('data-day',result.list[0].day+1).css('opacity','');
	}
	currentDay = result.list[0].day;
	$('.location').html('DAY'+result.list[0].day).css('opacity','').attr('data-day',result.list[0].day);
	$('.events > ol').children().remove();
	$('.events > ol').append(timeTemplate(result));
	$('.events > ol > li:first > a').addClass('selected');
	$("#sortable").children().remove();
	$("#sortable").append(cardTemplate(result));
	
	$('body').append('<script src="../resources/js/proceeding/timeline.js"></script>');
	$i = $('i');
	for (var i = 0; i < $i.size(); i++) {
		if ($($i[i]).attr('data-type') != null) {
			switch ($($i[i]).attr('data-type')) {
			case '12': // 관광
				$($i[i]).addClass('fa-camera');
				break; 
			case '14': // 문화
				$($i[i]).addClass('fa-university');
				break;
			case '15': // 축제
				$($i[i]).addClass('fa-star');
				break;
			case '28': // 레포츠
				$($i[i]).addClass('fa-motorcycle');
				break;
			case '32': // 숙박
				$($i[i]).addClass('fa-hotel');
				break;
			case '38': // 쇼핑
				$($i[i]).addClass('fa-shopping-bag');
				break;
			case '39': // 음식
				$($i[i]).addClass('fa-cutlery');
				break;
			}
		}
	};
	makeList(result);
}

function makeList(result){
	var mapList = new Array();
	var lat = result.list[0].location.mapY-0;
	var lon = result.list[0].location.mapX-0;
	/*getWeather(lat,lon);*/

	for(var j=0; j<result.list.length; j++){
		var first = result.list[j].location.mapY;
		var second = result.list[j].location.mapX;
		mapList[j] = first+","+second;
	}

	initProceedingMap(mapList);
}

function indexAjax(data){
	$.ajax({
		url: reizenUrl+'scheduler/arrayUpdate.do',
		method:'post',
		data: JSON.stringify(data),
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({data:data, currentDate:currentDate, scheduleNo:scheduleNo, day:currentDay}),
		dataType:'json',
		headers: {
			"Content-Type":"application/json"
		},
		success: function(result){
			if (result.status != 'success') {
				console.log('일정 변경 에러');
			}
			console.log('일정 변경 성공');
			moveDayAjax($('.location'));
		}
	});
}

function memoAjax(cid){
	$.ajax({
		url: reizenUrl+'scheduler/memo.do?contentId='+cid,
		dataType: 'json',
		method: 'get',
		success: function(result){
			if (result.status != 'success') {
				console.log("메모 로딩 실패");
				return;
			}
			console.log("메모 로딩 성공");
			if(result.data.length == 0){ // 메모 데이터가 없다면
				$(".panel-body").empty().append('<i class="fa fa-github-alt" aria-hidden="true"></i><span> 아직 작성된 메모가 없어요⋯ </span>');
				return;
			} else {
				$(".panel-body").empty().append(memoTemplate(result));
			}
		}
	})
}

function removeAjax($panel){
	$.ajax({
		dataType: 'json',
		url: reizenUrl+'scheduler/routeDelete.do?routeNo='+$panel.attr("data-routeno")+'&scheduleNo='+scheduleNo+'&day='+currentDay+'&currentDate='+currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate(),
		method: 'get',
		success : function(result){
			if (result.status != 'success') {
				console.log('일정 삭제 에러');
			}
			console.log('일정 삭제 성공');
			$panel.remove();
			swal({
				type: "success",
				title: "삭제 완료",
				text: "일정이 변경 됩니다.",
				confirmButtonText: "확인"
			});
			moveDayAjax($('.location'));
		}
	})
}

function serchInfo(path , cid) {
	var sparqlPath = 'http://data.visitkorea.or.kr/sparql?format=json&query='+encodeURIComponent(path);
	$.ajax({
		url : reizenUrl +'location/searchDetail.do',
		method : 'post',
		data : {
			'path': sparqlPath,
			'contentId': cid
		},
		dataType : 'json',
		success : function(result) {
			var data = result.data.results.bindings;
			var realData = [];
			var dataMap = new Map();
			$.each(data[0], function(key, value) {
				if (key != 'resource' && key != 'name' && key != '상세설명' && key != 'img') {
					realData.push({
						cate : key,
						data : value.value
					});
				} else if ( key == 'name') {
					$('.info-title').text(value.value);
				} else if ( key == '상세설명') {
					$('.info-overview').html(value.value);
				}
			});
			dataMap.put("data",realData);
			$('.info-box').append(infoTemplate(dataMap.map));

			$('.info-img1').attr("src",'');
			$('.firstImgBox').addClass('active');
			
			$('.delItem').detach();
			
			for (var i = 1; i <= data.length; i++) {
				$.each(data[i], function(key, value){
					if ( key == 'img' && i == 1 ) {
						$('.info-img1').attr("src",value.value);
					} else if ( key == 'img' && i > 1) {
						console.log('img'+i+' : '+value.value)
						$('.carousel-inner').append('<div class="item delItem"><img class="info-img'+i+'" src="'+value.value+'" alt="'+i+'"><!-- 이미지'+i+' --><div class="carousel-caption"></div></div>')
					}
				})
			}
		}
	})
}

function searchAjax(){
	var keyword = $('#searchInput').val();
	var areaCode;

	if( ! $radio1.is(':checked') ){
		areaCode = $('#citySelect option:selected').val();
	}	
	
	var date = $('span.date').text().replace(/[.]/gi, '-');
	
	console.log('search debug: '+keyword+', '+areaCode+', '+category);
	
	$.ajax({
		url: reizenUrl+"location/searchkeyword.do",
		method: 'post',
		dataType: 'json',
		data: {
			'keyword': keyword,
			'areaCode': areaCode,
			'category' :  category,
			'date' : date,
			'page': page,
			'size': 15
		},
		success: function(result){
			if (result.status != 'success') {
				console.log('search error');
				return;
			}else{
				var data = result.data;
				if( data[0] != null ){
					var source = $('#resultList').text();
					var template = Handlebars.compile(source);
					var resultset = template(result);
					$('.resultList').append(resultset);
				}else {
					return;
				}
			}
		}
	});	// ajax
}	// searchAjax

function addRouteAjax(contentId,time){
	$.ajax({
		dataType: 'json',
		url: reizenUrl+'scheduler/addRoute.do?location.contentId='+contentId+'&travelSequence='+9999+'&time='+currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate()+' '+time+'&scheduleNo='+scheduleNo+'&day='+currentDay+'&currentDate='+currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate(),
		method: 'get',
		success : function(result){
			if (result.status != 'success') {
				console.log('일정 추가 에러');
			}
			console.log('일정 추가 성공');
			moveDayAjax($('.location'));
		}
	})
}

function moveDayAjax($value){
	$.ajax({
		url: reizenUrl+'scheduler/proceeding.do?scheduleNo='+scheduleNo+'&day='+$value.attr('data-day'),
		dataType: 'json',
		method: 'get',
		success: function(result){
			listPage(result);
		}
	})
}

function listAjax(){
	$.ajax({
		url: reizenUrl+'scheduler/proceeding.do?scheduleNo='+scheduleNo,
		dataType: 'json',
		method: 'get',
		success: function(result){
			totalPage = result.total;
			currentDate = new Date();
			listPage(result);
		}
	})
}

function getWeather(lat, lon){
	$.ajax({
		url : 'http://apis.skplanetx.com/weather/current/minutely?version=1&lat='+lon+'&lon='+lat,
		dataType : 'json',
		headers : {
			"Accept" : "application/json",
			"Content-Type" : "application/json",
			"appKey" : "fdab6f83-841b-38b8-9d50-42aa7ff2ae11"
				/*"appKey" : "66519a1c-037d-3259-9201-3dd9cefd3bf4"*/
		},
		method : 'get',
		success : function(result) {
			var sky_code = result.weather.minutely[0].sky.code;
			var temp = result.weather.minutely[0].temperature.tc;
			$('#weather_tc').text(temp + "℃");

			switch (sky_code.split("_")[1]) {
			case "A01":
				$('#sun').show();
				break;
			case "A02":
				$('#cloudSun').show();
				break;
			case "A03":
				$('#cloud').show();
				break;
			case "A04":
			case "A08":
				$('#cloudDrizzle').show();
				break;
			case "A05":
			case "A09":
				$('#cloudSnowAlt').show();
				break;
			case "A06":
			case "A10":
				$('#cloudHailAlt').show();
				break;
			case "A07":
				$('#cloudFog').show();
				break;
			case "A11":
			case "A12":
			case "A13":
			case "A14":
				$('#cloudLightning').show();
			}
			;
		}
	});
}
	
function aroundSearch(){
	$.ajax({
		url : reizenUrl+'location/aroundList.do?mapX='+centerLng+'&mapY='+centerLat+'&tid='+typeId+'&size='+size+'&page='+page,
		method: 'GET',
		dataType: 'json',
		success: function(result){
			if (result.status != 'success') {
				console.log('search error');
				return;
			}else{
				var data = result.data;
				var maps = []; 
				if( data[0] != null && data.length<=size ){
					var source = $('#resultList').text();
					var template = Handlebars.compile(source);
					var resultset = template(result);
					$('ul.resultList').append(resultset);
					$('li.resultContent').each(function(index){
						$(this).append('<span class="index">'+(index+1)+'</span>');
					});
					for(var i=0; i<result.data.length; i++){
						var lat = parseFloat(result.data[i].mapY);
						var lng = parseFloat(result.data[i].mapX);
						maps.push({lat:lat, lng:lng});
					}
					modalMap(centerLat, centerLng, maps);
				}else {
					return; 
				}
			}
		}
	});
}

function aroundCountAjax(){
	$('.resultCount').empty();
	$.getJSON(reizenUrl+'location/countAround.do?mapX='+centerLng+'&mapY='+centerLat+'&tid='+typeId,
			function(result){
				if(result.status == 'success'){
					aroundCount = result.count;
					$('span.resultCount').text(aroundCount);
				}
	});
}

function viewAlarm(routeNo){
	$.getJSON(reizenUrl+'location/clearMemoAlarm.do?routeNo='+routeNo,function(result){
		if (result.status != 'success') {
			console.log('error')
		}
	})
}

function checkAlarm(){
	$.ajax({
		url : reizenUrl+'location/checkAlarm.do',
		method: 'GET',
		data : {
			data : JSON.stringify(routes),
		},
		dataType: 'json',
		success: function(result){
			if (result.status != 'success') {
				console.log('error')
			}
			if (result.data != null) {
				for (var i = 0; i < $('.memoBtn').length; i++) {
					for (var j = 0; j < result.data.length; j++) {
						if ($($('.memoBtn')[i]).attr('data-routeNo') == result.data[j].RNO) {
							$($('.memoBtn')[i]).addClass('alarm');
						}
					}
				}
			}
		}
	})
}