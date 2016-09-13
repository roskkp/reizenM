var pro_day = 0;
var pro_totalPage;
var	pro_currentDate;
var pro_alarm = true;
var pro_routes = [];

$(function() {
	swal('proceeding entry');
	$("body>[data-role='panel']").panel();

	$('.pro_weather').load("weather.html");
	listAjax();

	setInterval(checkAlarm(), 1000*60*3);
	$('#content').off('click').on('click','.pro_memo_icon',function(){
		if (!$(this).hasClass('pro_memo_active')){
			for (var i = 0; i < $('.pro_listview li').length; i++) {
			}
			$(this).addClass('pro_memo_active');
			memoAjax($(this));
		} else {
			$(this).parents('a').children('.pro_memos').remove();
			$(this).removeClass('pro_memo_active');
		}
	})
	
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
	
	$('#content').on('click','.pro_info_icon',function(){
		$('#content').load('spot.html');
	})
	
	$('#content').on('click','.pro_remove_icon',function(){
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
				removeAjax($this.parents('li'));
		});
		e.preventDefault();
	})
	
	// 메모 알람!
	$('#content').on('click','.pro_alarm',function(){
		$(this).removeClass('pro_alarm').removeClass('alarmOn');
		viewAlarm($(this).attr('data-routeNo'));
	})
	
	$('#content').on('click','.pro_map_icon',function(){
		$('#content').load('proceeding_map.html');
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
		dayInfo = '&day='+day;
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
			
			$( ".pro_listview" ).sortable();
			  $( ".pro_listview" ).disableSelection();
			  $( ".pro_listview" ).on( "sortstop", function() {
			    $( ".pro_listview" ).listview( "refresh" );
			  });
//			$(".pro_listview").sortable({
//				'containment' : 'parent',
//				'opacity' : 1,
//				update: function(event, ui) {
//					$('#updateHour').empty();
//					$('.adm-form-group').show();
//					for(var i=0; i<24; i++){ // 00시 ~ 23시30분 까지 지원 *db가 24시를 거부합니다.
//						if(i<10){
//							$('#updateHour').append('<option value='+'0'+i+'>'+'0'+i+'</option>');
//							continue;
//						}
//						$('#updateHour').append('<option value='+i+'>'+i+'</option>');
//					}
//					$('#btnTimeSubmit').text('수정');
//					$('#timeModal').modal('show').on('hidden.bs.modal',function(e){
//						updateTime();
//					}); // 모달 비활성화시 발생하는 이벤트, 아래의 캔슬버튼 처리 이걸로 통일함 
//					$('#btnTimeSubmit').off('click').on('click', function(){
//						var $target = ui.item;
//						var contentId = $target.find('div.panel-heading').data('contentid');
//						var time = $('#updateHour option:selected').val()+':'+$('#updateMin option:selected').val();
//						$.getJSON('http://reizen.com:8890/scheduler/checkTime.do?scheduleNo='+scheduleNo+'&day='+currentDay+'&time='+time, function(result){
//							if(result.status=='exist'){
//								$('.control-label').remove();
//								$('div.form-group').append('<label class="control-label" for="inputError1">중복된 시간입니다.</label>');
//								$('div.form-group').addClass('has-error');
//							} else {
//								$target.find('span.time').text(time);
//								updateTime();
//								$('#timeModal, #insertRoute').modal('hide');
//								$('#btnTimeSubmit').text('추가');
//							} //else
//						});
//					});
//				}
//			})
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
	for (var i = 0; i < routes.length; i++) {
		routeNos.push(routes[i].no);
	}
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
		url: reizenUrl+'scheduler/routeDelete.do?routeNo='+$panel.attr("data-routeNo")+'&scheduleNo='+pro_sdno+'&day='+day+'&currentDate='+currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate(),
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
			listAjax($('.location'));
		}
	})
}
function updateTime(){
	var $time = $('.pro_listview li span.time');
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
			console.log("메모 로딩 성공");
			if(result.data.length == 0){ // 메모 데이터가 없다면
				$this.parents('a').append('<div class="pro_memos"><i class="fa fa-github-alt" aria-hidden="true"></i><span> 아직 작성된 메모가 없어요⋯ </span></div>');
				return;
			} else {
		      	var pro_memoBoxSource = $('#pro_memoBox').text();
				var pro_memoBoxTemplate = Handlebars.compile(pro_memoBoxSource);
				$this.parents('a').append(pro_memoBoxTemplate(result));
			}
		}
	})
}