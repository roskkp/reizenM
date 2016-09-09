var reizenUrl = "http://reizen.com:8080/";

var session = false;

$(function(){
	sessionCheck();
	$('.index_profile').hide();
	$(document).on('click', '#btn_index_submit', function(){
		login();
		sessionCheck();
	});
	$(document).on('click', '#btn_index_proceeding', function(){
		sessionCheck();
		if(session){
			alert('이동');
		}else{
			alert('ㄴㄴ');
		}
	});
	$(document).on('click', '#btn_index_logout', function(){
		sessionStorage
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
				alert('로그인!');
			}else{
				alert('error');
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
				
			}else{
				alert('error');
			}
		}
	});	// login Ajax
}

function sessionCheck(){
	var user = null;
	
	if(sessionStorage.length>0){
		session = true;
	}else{
		session = false;
	}
	
	if(session){
		$('.index_profile').show();
		$('.index_login').hide();
		user = sessionStorage.getItem("nickName");
		console.log(user);
		$('.index_profile h3').text(user);
	}else {
		$('.index_profile').hide();
		$('.index_login').show();
	}
}