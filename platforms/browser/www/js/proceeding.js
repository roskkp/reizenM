var day = 1;
var totalPage;
var	currentDate;
var alarm = true;
var routes = [];

$(function() {
	
	$("body>[data-role='panel']").panel();

	$('.pro_weather').load("weather.html");
	listAjax();

	setInterval(checkAlarm(), 1000*60*3);
	
	$('#content').off('click').on('click','.pro_memo_icon',function(){
		if (!$(this).hasClass('pro_memo_active')){
			$(this).parents('a').append('<div class="pro_memos" style="border: solid;">memoBox</div>');
			$(this).addClass('pro_memo_active');
		} else {
			$(this).parents('a').children('.pro_memos').remove();
			$(this).removeClass('pro_memo_active');
		}
	})
	
	$('#content').on('click','.pro_move_dayR',function(){
		if (day != totalPage) {
			day++;
			listAjax();	
		} else {
			swal("End of plan", "더 이상 계획된 일정이 없습니다. ", "warning");
		}
	})
	$('#content').on('click','.pro_move_dayL',function(){
		if (day != 1) {
			day--;
			listAjax();	
		} else {
			swal("First Day", "첫째날 입니다.", "warning");
		}
	})
	
	// 메모 알람!
	$('#content').on('click','.pro_alarm',function(){
		$(this).removeClass('pro_alarm').removeClass('alarmOn');
		viewAlarm($(this).attr('data-routeNo'));
	})
	
	setInterval(() => {
		if (alarm) {
			$('.pro_alarm').addClass('pro_alarmOn',100);	
			alarm = false;
		} else {
			$('.pro_alarm').removeClass('pro_alarmOn',100);
			alarm = true;
		}
			
	}, 1000);
});


//<!-- ajax 부분 -->
function listAjax(){
	var dayInfo = '';
	if (day != 1) {
		dayInfo = '&day='+day;
	};
	$.ajax({
		url: reizenUrl+'scheduler/proceeding.do?scheduleNo='+pro_sdno+dayInfo,
		dataType: 'json',
		method: 'get',
		success: function(result){
			if (result.total != null) {
				totalPage = result.total;
		      	currentDate = new Date();	
			}
			for (var i = 0; i < result.list.length; i++) {
				routes.push(result.list[i].routeNo);
			}
	      	var pro_routeBoxSource = $('#pro_routeBox').text();
			var pro_routeBoxTemplate = Handlebars.compile(pro_routeBoxSource);
			var lat;
			var lon;
			var date_now = new Date();
			var temp = 24;
			for (var i = 0; i < result.list.length; i++) {
				if (temp > Math.abs(parseInt(result.list[i].time.substr(0,2)) - date_now.getHours())) {
					temp = Math.abs(parseInt(result.list[i].time.substr(0,2)) - date_now.getHours());
					lat = result.list[i].location.mapY-0;
					lon = result.list[i].location.mapX-0;
				}
				switch (result.list[i].location.typeId) {
				case 12: // 관광
					result.list[i].icon = 'fa-camera';
					break; 
				case 14: // 문화
					result.list[i].icon = 'fa-university';
					break;
				case 15: // 축제
					result.list[i].icon = 'fa-star';
					break;
				case 28: // 레포츠
					result.list[i].icon = 'fa-motorcycle';
					break;
				case 32: // 숙박
					result.list[i].icon = 'fa-hotel';
					break;
				case 38: // 쇼핑
					result.list[i].icon = 'fa-shopping-bag';
					break;
				case 39: // 음식
					result.list[i].icon = 'fa-cutlery';
					break;
				}
			};
			day = result.list[0].day;
			$('.pro_day').text('day '+result.list[0].day);
			$('.pro_listview').empty().append(pro_routeBoxTemplate(result));
			$( ".pro_listview" ).listview();
			$( ".pro_listview" ).listview('refresh');
//			getWeather(lat,lon);
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
			$('.pro_weather_tc').text(parseInt(temp) + "℃");
			;
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
				for (var i = 0; i < $('.pro_memo_icon').length; i++) {
					for (var j = 0; j < result.data.length; j++) {
						if ($($('.pro_memo_icon')[i]).attr('data-routeNo') == result.data[j].RNO) {
							$($('.pro_memo_icon')[i]).addClass('pro_alarm');
						}
					}
				}
			}
		}
	})
}