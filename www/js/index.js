//var reizenUrl = "http://192.168.0.30:8080/";
var pro_sdno = "";
var pro_sdnos = "";
var pro_sdnot = "";
//var reizenUrl = 'http://192.168.0.42:8080/';
//var nodeUrl = 'http://192.168.0.42:';
var reizenUrl = 'http://52.78.165.93:8080/';
var nodeUrl = 'http://52.78.165.93';
var routes = [];

var nickName = null;
var dashNo = null;
var scheduleNo = null;

var spot_cid;
var spot_typeId;

var mapX;
var mapY;
var back; // 이동 경로 저장 
$(function(){
	
//	$('#content').load('post.html');
	
	$('.index_menu').listview();
	$('input[name=email]').textinput();
    
	loginCheck();
	
    $("body>[data-role='panel']").panel();
	
	$('#content').load('main.html');

	$(document).off('click').on('click', '.btn_index_home', function() {
    	 $(location).attr('href', '');
    });
	
	$(document).on('click', '#btn_index_back', function(){
		('#content').load(back+'.html');
	});
    
    $(document).on('click', '#btn_index_login',function(){
    	$('#content').load('login.html',function(){
    		$('#email').focus();	
    	});
    	$('#menu').panel('close');
	});
    
    $(document).on('click', '#btn_index_submit',function(e){
    	e.preventDefault();
		login();
	});
	
    $(document).on('click', '#btn_index_logout', function(){
		logout();
	});
    
    $(document).on('click', '.btn_index_search_spot', function() {
       $('#content').load('search_spot.html');
    });
    
    $(document).on('click', '.btn_index_search_sc', function() {
       $('#content').load('search_sc.html');
    });
	
	$('#routeSelect').popup({
		overlayTheme : "b",
		transition: "fade"
	});
	
	$('#addSpot-popup').popup({
		overlayTheme : "b",
		transition: "fade"
	});
	
    $(document).on('click', '.btn_index_proceeding', function(){
    	loginCheck();
    	if( pro_sdnos != "" ){
    		var btn = "";
    		$('#routeSelect').empty();
    		console.log('pro_sdnos.includes(",") : '+pro_sdnos.includes(","))
    		if (pro_sdnos.includes(",")) {
    			for (var i = 0; i < pro_sdnos.split(",").length; i++) {
    				$('#routeSelect').append('<button class="btn btn-info pro_sdno_selector" data-sdno="'+pro_sdnos.split(",")[i]+'">'+pro_sdnot.split(",")[i]+'</button>');	
				}
    			console.log('check start point');
    			$('#routeSelect').popup("open");
    			console.log('check end point');
			} else {
	    		pro_sdno = pro_sdnos;
	    		$('#content').load('proceeding.html');	
			}
    	} else {
    		if (localStorage.getItem("nickName") != null) {
    			swal("진행중인 일정이 없습니다.");				
			} else {
				swal("로그인 필요", "로그인 해주세요.", "warning"); 
			}
    		
    	}
    });
    
    $(document).on('click','.pro_sdno_selector',function(){
    	pro_sdno = $(this).data('sdno');
    	$('#content').load('proceeding.html');
		$('#routeSelect').popup("close");
    })
	
    $(document).on('click', '.btn_index_dash', function() {
    	if(dashNo!=null){
    	    $('#content').load('dashboard.html');
    	}else{
    		swal("로그인 필요", "로그인 해주세요.", "warning"); 
    	}
    });
    
	$('.scheduleSelectList').on('change',function(){
		if($(this).data('no')==null){ // 일정을 선택해주세요 선택시
			checkDays($('select.scheduleSelectList option:selected').data('no'));
		}
	})
	
	$('.daydatas').on('change',function(e){
		if($(this).data('day')==null){ // 일정을 선택해주세요 선택시
			for(var i=0; i<24; i++){ // 00시 ~ 23시30분 까지 지원 *db가 24시를 거부합니다.
				if(i<10){
					$('#updateHour').append('<option value='+'0'+i+'>'+'0'+i+'</option>');
					continue;
				}
				$('#updateHour').append('<option value='+i+'>'+i+'</option>');
			}
			$('select.poptime').selectmenu();
			$('select.poptime').selectmenu('refresh');
			$('#updateMin, #updateHour').parents('.ui-select').css('width', '47%').css('display', 'inline-block');
			$('#popbtnTimeSubmit').css('display','block');
			$('.timechecker').css('display','block');
		}
	})
	
	$('#popbtnCancel').on('click',function(){
		$('#addSpot-popup').popup('close');
	})
	
	$('#popbtnTimeSubmit').on('click',function(){
		event.preventDefault();
		var scheduleNo = $('select.scheduleSelectList option:selected').data('no');
		var time = $('#updateHour option:selected').val()+':'+$('#updateMin option:selected').val();
		var date = $('.dayList option:selected').val();
		var day = $('.dayList option:selected').data('day');
		alert('scheduleNo : '+scheduleNo+' / time : '+time+' / date : '+date+' / day : '+day);
		if(time==null || date ==null || day==null){ // 입력값 검증 
			swal("Failed!", "모든 정보를 기입해 주세요", "error"); 
			return;
		}
		$.getJSON(nodeUrl+':8890/scheduler/checkTime.do?scheduleNo='+scheduleNo+'&day='+day+'&time='+time, function(result){
			if(result.status=='exist'){
//				$('.control-label').remove();
//				$('div.form-group').append('<label class="control-label" for="inputError1">중복된 시간입니다.</label>');
//				$('div.form-group').addClass('has-error');
			} else {
				$.getJSON(reizenUrl+'scheduler/addRoute.do?location.contentId='+spot_cid+'&travelSequence='+9999+'&time='+date+' '+time+'&scheduleNo='+scheduleNo+'&day='+day+'&currentDate='+date, function(result){
					if(result.status=='success'){
						$('#addSpot-popup').popup('close');
						swal({   
							title: "일정 추가 성공",   
							type: "success"
							}); // swal
						}else{
							swal("Failed!", "일정 추가 실패. 관리자에게 문의하세요. ", "error"); 
						} //else
				}); //getJson
			} //else
		});
	});
});

function loginCheck(){
	if (localStorage.getItem("nickName") != null) {
		$('.profile_nickName').text(localStorage.getItem("nickName"));
		$('.login_edit').addClass('login');
		$('.index_menu').addClass('login');
		$('.profile_img').addClass('login');
		$('.index_login').css('display','none');
		nickName = localStorage.getItem("nickName");
		dashNo = localStorage.getItem("dashNo");
		$('.profile_img').attr("src", localStorage.getItem("profile_img"));
	}
	if (localStorage.getItem("pro_sdnos") != null) {
		pro_sdnos = localStorage.getItem("pro_sdnos");
		pro_sdnot = localStorage.getItem("pro_sdnot");
	}
}

function login(){
	$.ajax({
		url : reizenUrl+'user/login.do',
		method : 'POST',
		data : {'email' : $('#email').val(), 'password' : $('#password').val() },
		dataType : 'json',
		success : function(result){
			if(result.status=='success'){
				nickName = result.user.nickName;
				if (result.activeScheduleNo[0] != null) {
					pro_sdnos = result.activeScheduleNo[0].scheduleNo;
					pro_sdnot = result.activeScheduleNo[0].title;
					for (var i = 1; i < result.activeScheduleNo.length; i++) {
						pro_sdnos += ","+result.activeScheduleNo[i].scheduleNo;
						pro_sdnot += ","+result.activeScheduleNo[i].title;
					}		
				}
				dashNo = result.user.dashNo;
				localStorage.setItem("nickName", nickName);
				localStorage.setItem("email", $('#email').val());
				localStorage.setItem("dashNo", dashNo);
				localStorage.setItem("pro_sdnos", pro_sdnos);
				localStorage.setItem("pro_sdnot", pro_sdnot);
				localStorage.setItem("userNo", result.user.userNo);
				localStorage.setItem("profile_img", reizenUrl+"resources/images/thumbnail/"+result.user.thumbNail);
				$('.index_menu').addClass('login');
				$('.login_edit').addClass('login');
				$('.profile_img').addClass('login');
				$('.profile_nickName').text(nickName);
				$('.profile_img').attr("src",reizenUrl+"resources/images/thumbnail/"+result.user.thumbNail);
				$('.index_login').css('display','none');
				$('#content').load('main.html');
			}else{
				swal('error');
			}
		}
	});	// login Ajax
}

function logout(){
	localStorage.clear();
	pro_sdno = "";
	pro_sdnos = "";
	pro_sdnot = "";
	routes = [];
	nickName = null;
	dashNo = null;
	scheduleNo = null;
	spot_cid = null;
	spot_typeId = null;
	$('.index_menu').removeClass('login');
	$('.login_edit').removeClass('login');
	$('.profile_img').removeClass('login');
	$('.index_login').css('display','block');
	$('.profile_nickName').text('');
	$('#menu').panel('close');
}

function is_integer(x)
{
    var reg = /^[-|+]?\d+$/;
    return reg.test(x);
}
