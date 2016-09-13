var reizenUrl = "http://192.168.0.30:8080/";
var pro_sdno = "";
var pro_sdnos = "";
var pro_sdnot = "";
//var reizenUrl = 'http://192.168.0.42:8080/';
var routes = [];

var nickName = null;
var dashNo = null;
var scheduleNo = null;

var spot_cid;
var spot_typeId;

$(function(){
	
//	$('#content').load('post.html');
	
	$('.index_menu').listview();
    
	loginCheck();
	
	$('#content').load('main.html');

	$(document).off('click').on('click', '.btn_index_home', function() {
    	 $(location).attr('href', '');
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
	
	$('#routeSelect').popup();
	
    $(document).on('click', '.btn_index_proceeding', function(){
    	if( pro_sdnos != "" ){
    		var btn = "";
    		$('#routeSelect').empty();
    		if (pro_sdnos.split(",").length > 1) {
    			for (var i = 0; i < pro_sdnos.split(",").length; i++) {
    				$('#routeSelect').append('<button class="btn btn-info pro_sdno_selector" data-sdno="'+pro_sdnos.split(",")[i]+'">'+pro_sdnot.split(",")[i]+'</button>');	
				}
    			console.log('check start point');
    			$('#routeSelect').popup("open");
    			console.log('check end point');
			} else {
	    		pro_sdno = pro_sdnos;
	    		swal("진행중인 일정이 1개 있습니다. : "+pro_sdno);
	    		$('#content').load('proceeding.html');	
			}
    	} else {
    		swal("진행중인 일정이 없습니다.");
    	}
    });
    
    $(document).on('click','.pro_sdno_selector',function(){
    	pro_sdno = $(this).data('sdno');
    	$('#content').load('proceeding.html');
		$('#routeSelect').popup("close");
    })
	
    $(document).on('click', '.btn_index_dash', function() {
    	if(dashNo!=null){
    		swal('dash click');
    	    $('.index_content').load('dashboard.html');
    	}else{
    		swal("로그인 필요", "로그인 해주세요.", "warning"); 
    	}
    });
	
});

function loginCheck(){
	if (localStorage.getItem("nickName") != null) {
		$('.index_profile h3').text(localStorage.getItem("nickName"));
		$('.index_menu').addClass('login');
		$('.index_login').css('display','none');
	}
	if (localStorage.getItem("pro_sdnos") != null) {
		if (localStorage.getItem("pro_sdnos").split(",").length > 1) {
			pro_sdnos = localStorage.getItem("pro_sdnos").split(",")[0];
			pro_sdnot = localStorage.getItem("pro_sdnot").split(",")[0];
			for (var i = 1; i < localStorage.getItem("pro_sdnos").split(",").length; i++) {
				pro_sdnos += ","+localStorage.getItem("pro_sdnos").split(",")[i];
				pro_sdnot += ","+localStorage.getItem("pro_sdnot").split(",")[i];
			}
		} else {
			pro_sdnos = localStorage.getItem("pro_sdnos");
			pro_sdnot = localStorage.getItem("pro_sdnot");
		}
		
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
				console.log(result);
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
				localStorage.setItem("email", email);
				localStorage.setItem("dashNo", dashNo);
				localStorage.setItem("pro_sdnos", pro_sdnos);
				localStorage.setItem("pro_sdnot", pro_sdnot);
				localStorage.setItem("userNo", userNo);
				$('.index_menu').addClass('login');
				$('.index_profile h3').text(nickName);
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
	$('.index_menu').removeClass('login');
	$('.index_login').css('display','block');
	$('.index_profile h3').text('');
	$('#menu').panel('close');
}

function is_integer(x)
{
    var reg = /^[-|+]?\d+$/;
    return reg.test(x);
}
