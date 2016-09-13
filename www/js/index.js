//var reizenUrl = "http://192.168.0.30:8080/";
var pro_sdno;
var reizenUrl = 'http://192.168.0.16:8080/';
var routes = [];

var nickName = null;
var dashNo = null;
var scheduleNo = null;

var spot_cid;
var spot_typeId;

$(function(){
	
	$('#content').load('main.html');
    $(document).off('click').on('click', '.btn_index_home', function() {
    	 $(location).attr('href', '/');
    });
    
    $(document).on('click', '#btn_index_login',function(){
    	$('#content').load('login.html');
	});
    
    $(document).on('click', '#btn_index_submit',function(e){
    	e.preventDefault();
		$('.index_login').hide();
		$('.index_profile').show();
		$('.index_profile > h3').text(nickName);
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
	
    $(document).on('click', '.btn_index_proceeding', function(){
    	if( pro_sdno != null ){
    		swal('okok : '+pro_sdno);
    		$('#content').load('proceeding.html');
    	}
    });
	
    $(document).on('click', '.btn_index_dash', function() {
    	dashNo=1027;
    	if(dashNo!=null){
    		swal('dash click')
    	    $('.index_content').load('dashboard.html');
    	}else{
    		swal("로그인 필요", "로그인 해주세요.", "warning"); 
    	}
    });
	
});


function login(){
	$.ajax({
		url : reizenUrl+'user/login.do',
		method : 'POST',
		data : {'email' : $('#email').val(), 'password' : $('#password').val() },
		dataType : 'json',
		success : function(result){
			if(result.status=='success'){
				swal(result.jsid);
				nickName = result.user.nickName;
				pro_sdno = result.activeScheduleNo[0].scheduleNo;
				dashNo = result.user.dashNo;
				localStorage.setItem('jsid',result.jsid);
				sessionStorage.setItem("nickName", nickName);
				localStorage.setItem("nickName", nickName);
//				$.mobile.changePage($("#page"));
				$('#content').load('main.html');
			}else{
				swal('error');
			}
		}
	});	// login Ajax
}

function logout(){
	$.ajax({
		url : reizenUrl+'user/logout.do',
		dataType : 'json',
		success : function(result){
			if(result.status=='success'){
				nickName = null;
				dashNo = null;
				$('.index_profile').hide();
				$('.index_profile > h3').text();
				$('.index_login').show();
			}else{
				alert('error');
			}
		}
	});	// login Ajax
}

function is_integer(x)
{
    var reg = /^[-|+]?\d+$/;
    return reg.test(x);
}
