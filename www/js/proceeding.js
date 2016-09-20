var pro_day = 0;
var pro_totalPage;
var	pro_currentDate;
var pro_alarm = true;
var pro_routes = [];
var pro_updateTarget;

$(function() {
	$("body>[data-role='panel']").panel();

	$('.pro_weather').load("weather.html");
	listAjax();
	
	$('#timeSelect').popup();
	
	// 메모 알람!
	$('#content').off('click').on('click','.pro_alarm',function(){
		$(this).removeClass('pro_alarm').removeClass('pro_alarmOn').removeClass('pro_memo_active');
		viewAlarm($(this).attr('data-routeno'));
	})

	$('#content').on('click','.pro_memo_icon',function(e){
		e.preventDefault();
		e.stopPropagation()
		if (!$(this).hasClass('pro_memo_active')){
			for (var i = 0; i < $('.pro_listview li').length; i++) {
				$($('.pro_listview li')[i]).children('.pro_memos').remove();
				$($('.pro_listview li')[i]).removeClass('pro_memo_active');
			}
			$(this).addClass('pro_memo_active');
			memoAjax($(this));
		} else {
			$(this).parents('li').children('.pro_memos').remove();
			$(this).removeClass('pro_memo_active');
		}
	})
	
	setInterval(() => {
		checkAlarm();
	}, 1000*60);
	
	$('#content').on('click','.pro_move_dayR',function(){
		if (pro_day != pro_totalPage) {
			pro_day++;
			listAjax();	
		} else {
			swal("End of plan", "더 이상 계획된 일정이 없습니다. ", "warning");
		}
	})
	$('#content').on('click','.pro_move_dayL',function(){
		if (pro_day != 1) {
			pro_day--;
			listAjax();	
		} else {
			swal("First Day", "첫째날 입니다.", "warning");
		}
	})
	
	$('#content').on('click','.pro_route-li',function(e){
		if (e.target != $('.pro_memos')) {
			spot_cid = $(this).data('cid');
			spot_typeId = $(this).data('tid');
			console.log('cid : '+spot_cid+' / tid :'+spot_typeId);
			$('#content').load('spot.html');
		}
	})
	
	$('#content').on('click','.pro_map_icon',function(){
		$('#content').load('proceeding_map.html');
	})
	
	$('#pro_btnSubmit').on('click',function(){
		var time = $('#pro_updateHour').val() +":"+$('#pro_updateMin').val()
		$.getJSON('http://192.168.0.42:8890/scheduler/checkTime.do?scheduleNo='+pro_sdno+'&day='+pro_day+'&time='+time, function(result){
			if(result.status=='exist'){ // 기 존재하는 시간이라면
				swal("Failed!", "해당 시간에는 다른 일정이 있네요!", "error"); 
			} else {
				pro_updateTarget.text(time);
				$('#timeSelect').popup('close');
				updateTime();
			}

		});
	})
	
	$('#pro_btnCancel').on('click',function(){
		listAjax();
		$('#timeSelect').popup('close');
	})
	
	$('#content').on('swipeleft','.pro_route-li',function(){
		$this = $(this);
		if($('.pro_listview li').length==1){
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
				removeAjax($this);
		});
	})
	
	setInterval(() => {
		if (pro_alarm) {
			$('.pro_alarm').addClass('pro_alarmOn',100);	
			pro_alarm = false;
		} else {
			$('.pro_alarm').removeClass('pro_alarmOn',100);
			pro_alarm = true;
		}
			
	}, 1000);
	
});


//<!-- ajax 부분 -->
function listAjax(){
	var dayInfo = '';
	if (pro_day != 0) {
		dayInfo = '&day='+pro_day;
	};
	$.ajax({
		url: reizenUrl+'scheduler/proceeding.do?scheduleNo='+pro_sdno+dayInfo,
		dataType: 'json',
		method: 'get',
		success: function(result){
			if (result.total != null) {
				pro_totalPage = result.total;
				pro_currentDate = new Date();	
			}
			pro_routes = new Array();
			for (var i = 0; i < result.list.length; i++) {
				var route = new Object();
				route.no = result.list[i].routeNo;
				route.mapX = result.list[i].location.mapX;
				route.mapY = result.list[i].location.mapY;
				pro_routes.push(route);
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
			console.log(result);
			pro_day = result.list[0].day;
			$('.pro_day').text('day '+result.list[0].day);
			$('.pro_listview').empty().append(pro_routeBoxTemplate(result));
			$( ".pro_listview" ).listview();
			$( ".pro_listview" ).listview('refresh');
			
			$( ".pro_listview" ).sortable({
				axis: "y",
				delay: 150,
				cancel: "i",
				placeholder: "sortable-placeholder",
				revert: true,
				change: function(event,ui){
					for(var i=0; i<24; i++){ // 00시 ~ 23시30분 까지 지원 *db가 24시를 거부합니다.
						if(i<10){
							$('#pro_updateHour').append('<option value='+'0'+i+'>'+'0'+i+'</option>');
							continue;
						}
						$('#pro_updateHour').append('<option value='+i+'>'+i+'</option>');
					}
					pro_updateTarget = ui.item.find('span.pro_route_time');
					$('#timeSelect').popup('open');
				}
			}).disableSelection().on("click", ".pro_memo_icon", function(){
//				swal('memo Click');
			});
			  
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
	var routeNos = [];
	for (var i = 0; i < pro_routes.length; i++) {
		routeNos.push(pro_routes[i].no);
	}
	console.log('checkAlarm');
	console.log(pro_routes);
	$.ajax({
		url : reizenUrl+'location/checkAlarm.do',
		method: 'GET',
		data : {
			data : JSON.stringify(routeNos),
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
function removeAjax($panel){
	$.ajax({
		dataType: 'json',
		url: reizenUrl+'scheduler/routeDelete.do?routeNo='+$panel.attr("data-routeNo")+'&scheduleNo='+pro_sdno+'&day='+pro_day+'&currentDate='+pro_currentDate.getFullYear()+'-'+(pro_currentDate.getMonth()+1)+'-'+pro_currentDate.getDate(),
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
			listAjax();
		}
	})
}
function updateTime(){
	var $time = $('.pro_listview li span.pro_route_time');
	var data=[];
	var times;
	var routeNo;
	for(var i=0; i<$time.length; i++){
		times = $time.eq(i).text();
		routeNo = $('.pro_listview > li').eq(i).attr('data-routeNo');
		data.push({
			time : times,
			routeNo : routeNo
		});
	}

	indexAjax(data);
}

function indexAjax(data){
	console.log(data);
	$.ajax({
		url: reizenUrl+'scheduler/arrayUpdate.do',
		method:'post',
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({data:data, currentDate:pro_currentDate, scheduleNo:pro_sdno, day:pro_day}),
		dataType:'json',
		headers: {
			"Content-Type":"application/json"
		},
		success: function(result){
			if (result.status != 'success') {
				console.log('일정 변경 에러');
			}
			console.log('일정 변경 성공');
			listAjax($('.location'));
		}
	});
}

function memoAjax($this){
	$.ajax({
		url: reizenUrl+'scheduler/memo.do?contentId='+$this.attr('data-cid'),
		dataType: 'json',
		method: 'get',
		success: function(result){
			if (result.status != 'success') {
				console.log("메모 로딩 실패");
				return;
			}
			console.log("memoAjax : ");
			console.log(result);
			if(result.data.length == 0){ // 메모 데이터가 없다면
				$this.parents('li').append('<div class="pro_memos"><i class="fa fa-github-alt" aria-hidden="true"></i><span> 아직 작성된 메모가 없어요⋯ </span></div>');
				return;
			} else {
		      	var pro_memoBoxSource = $('#pro_memoBox').text();
				var pro_memoBoxTemplate = Handlebars.compile(pro_memoBoxSource);
				$this.parents('li').append(pro_memoBoxTemplate(result));
			}
		}
	})
}