$(function(){

	getUser();
	postscriptWriter();
//	var user = localStorage.getItem('userNo');
//	if( user ){
//		$.ajax({
//			url : reizenUrl+'postscript/checkPostscript.do?scheduleNo='+scheduleNo,
//			method : 'GET',
//			dataType: 'json',
//			success : function(result){
//				if(result.status=='success'){
//					if(result.pass=='false'){
//						getUser();
//						postscriptWriter();  // 비작성자
//						
//					}else if(result.pass=='right'){
//						getUser();
//						postscriptWriter();   // 작성자
//						
//					}
//				}else{
//					alert('check proceeding status fail');
//				}
//			}, error  : function(){
//				alert('ajax error');
//			}
//		});
//	}else {
//		getUser();
//		postscriptWriter();   // 비작성자
//	}
	
	initPhoneGap();
	$('.btn_post_take_photo').click(function(){
		takePhoto();
	});
	$('.btn_post_get_photo').click(function(){
		getPhoto();
	});

	$('#popupPost, #popupEdit').popup({
		overlayTheme : "b",
		transition: "fade"
	});
	$('#btn_post_take_photo, #btn_post_get_photo').button();
	$('textarea, input[type=text]').textinput();
	$('.transportation').selectmenu();
	$('#displayArea').hide();

	$('.btn_addPost').on('click', function(){
		addPost();
	});
	
	$('.btn_post_cancel').on('click', function(){
		$('#popupPost, #popupEdit').popup('close');
	});
	
	$('#content').on('click', '.btn_post_delete', function(){
		deletePost($(this).data('picno'));
	});

});

function getUser() {
	$.ajax({
		url : reizenUrl+'postscript/userPost.do?scheduleNo='+scheduleNo,
		method : 'GET',
		dataType : 'json',
		success : function(result){
			if(result.status == 'success'){
				var data = result.data;
				$('#post_title > h2').text(result.data[0].schedule.user.nickName);
				$('#post_title > h3').text(result.data[0].schedule.title);
				for(var i=0; i<data.length; i++){
					var ti = data[data.length -1];
					var t = ti.time;
					var timed = t.split(' ')[0];
					var da = data[0].time 
					var time = da.split(' ')[0];
					$('#post_title > h4').text(time+"~"+timed);
				}
				$('#post_thumb').css('background-image', 'url('+reizenUrl+'resources/images/thumbnail/'+result.data[0].schedule.user.thumbNail+')');
			}
		}
	});
}

function postscriptWriter() {
	$.ajax({
		url : reizenUrl+'postscript/postscript.do?scheduleNo='+scheduleNo,
		dataType : 'json',
		method : 'GET',
		success : function(result){
			if(result.status=='success'){
				console.log(result);
				for(var i=0; i<result.list.length; i++){
					if(result.list[i].content != null || result.list[i].picturePath != null){
						console.log('null check')
						result.list[i].check = 'true';
					}
				}
				var source = $('#postScheduleList').html();
				var template = Handlebars.compile(source);
				$('#post_content').append(template(result));
				$('input#routeNo').val(result.list[0].route.routeNo);
				
				$('.btn_post').on('click', function(){
					$('#displayArea').attr('src', '').hide();
					$('textarea[name=content], input[name=price]').val('');
					$('#popupPost').popup('open');
				});
				$('.btn_post_edit').on('click', function(){
					$('#displayArea').attr('src', '').hide();
					$('textarea[name=content], input[name=price]').val('');
					getPictures();
					$('#popupEdit').popup('open');
				});
				
				for (var i = 0; i < $('.tran').length; i++) {
					switch ($($('.tran')[i]).data('trans')) {
					case 1:
						$($('.tran')[i]).html('이동수단 : 자동차');
						break;
					case 2:
						$($('.tran')[i]).html('이동수단 : 기차');
						break;
					case 3:
						$($('.tran')[i]).html('이동수단 : 버스');
						break;
					case 4:
						$($('.tran')[i]).html('이동수단 : 차');
						break;
					}
				}
				
				for(var i=0; i<$('li.post_list').length; i++){
					console.log($($('li.post_list span i')[i]).data('type'));
					switch($($('li.post_list span i')[i]).data('type')){
						case 12 : $($('li.post_list i')[i]).addClass('fa-camera'); break;
						case 14 : $($('li.post_list i')[i]).addClass('fa-university'); break;
						case 15 : $($('li.post_list i')[i]).addClass('fa-star'); break;
						case 28 : $($('li.post_list i')[i]).addClass('fa-motorcycle'); break;
						case 32 : $($('li.post_list i')[i]).addClass('fa-hotel'); break;
						case 38 : $($('li.post_list i')[i]).addClass('fa-shopping-bag'); break;
						case 39 : $($('li.post_list i')[i]).addClass('fa-cutlery'); break;
					}
				}
			}else{
				swal('error');
			}
		}
	});
}

var imageURI;

function initPhoneGap(){
	document.addEventListener("deviceready", onDeviceReady, true);
}
function onDeviceReady(){
	navigator.notification.alert('장치준비됨', null, '폰갭API');
}
function takePhoto(){
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, 
			{quality: 10, destinationType:Camera.DestinationType.DATA_URL, sourceType:Camera.PictureSourceType.CAMERA});
}

function onPhotoDataSuccess(imageData){
	$('#displayArea').attr('src', 'data:image/jpeg;base64,'+imageData).fadeIn();
	imageURI = image;
}

function onFail(message){
	alert('실패 : '+message);
}
function getPhoto(){
	navigator.camera.getPicture(onPhotoURISuccess, onFail,
			{quality: 50, destinationType:Camera.DestinationType.FILE_URI, sourceType:Camera.PictureSourceType.PHOTOLIBRARY});
}

function onPhotoURISuccess(image){
	$('#displayArea').attr('src', image).fadeIn();
	imageURI = image;
}

function addPost(){

	var sdno = 956;
	var routeNo = $('input#routeNo').val();
	var content = $('textarea[name=content]').val();
	var transportation = $('select.transportation option:selected').val();
	var price = $('input[name=price]').val();

	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	options.chunkedMode = false;
	options.headers = {
			Connection: "close"
	}

	var params = {};

	params.type = "jpeg";
	params.scheduleNo = sdno;
	params.routeNo = routeNo;
	params.content = content;
	params.transportation = transportation;
	params.price = price;

	options.params = params;

	var ft = new FileTransfer();
	ft.upload(imageURI, encodeURI('http://192.168.0.30:8080/postscript/addFile.do'), win, fail, options);
}

var win = function (r) {
	$('#popupPost').popup('close');
	swal('작성되었습니다.');
}

var fail = function (error) {
	alert("An error has occurred: Code = " + error.code);
	console.log("upload error source " + error.source);
	console.log("upload error target " + error.target);
}

var cnt = 1;

Handlebars.registerHelper('day', function(day, block){
	if ( cnt == day ){
		cnt++;
		return block.fn(this);
	}
	return;
});

Handlebars.registerHelper('splitTime', function(time){
	var times = time.split(' ');
	var out = times[0]
	return out;
});

Handlebars.registerHelper('stime', function(time){
	var times = time.split(' ');
	var out = times[1].substring(0, 5);
	return out;
});


/****************getPictures********************/
function getPictures(){
	alert('들어왔나여?')
	$.ajax({
		url : reizenUrl + "postscript/selectPict.do",
		method : 'post',
		dataType : 'json',
		data : {
			routeNo :$('#updateRouteNo').val()
		},
		success : function(result) {
			if (result.status == 'success') {
				alert('들어왔나여?')

				var data = result.data;
				for (var i = 0; i < data.length; i++) {
					console.log(data[i].transportation);
					/*$('#updatefile').css({'background' : 'url(\''
					+'/resources/images/viewSchedule/' +data[i].picturePath});*/
					$('#updatePrice').val(data[i].price);
					$(".select").val(data[i].transportation);
					$('.cont').val(data[i].content);

				}
			}
		}
	})
}

function deletePost(pictureNo){
	
	var routeNo = $('#routeNo').val();
	var $this= $(this);
	
	swal({   
		title: "작성한 후기를 삭제하시겠습니까?",   
		text: "확인 버튼을 누르면 삭제가 완료됩니다.",   
		type: "warning",   
		showCancelButton: true,   
		confirmButtonColor: "#DD6B55",   
		confirmButtonText: "확인",   
		cancelButtonText: "취소",   
		closeOnConfirm: false }, 
		function(){
			$.ajax({
				url : reizenUrl+'postscript/deletePicts.do',
				method : 'POST',
				dataType : 'json',
			    contentType: "application/json; charset=utf-8",
				data : {
					'pictureNo' : pictureNo,
					'routeNo' : routeNo
				},
				success : function(result) {
					if (result.status != 'success') {
						alert('후기 삭제 에러');
					}
					  swal({
						    title: "후기",
						    text: "삭제되었습니다.",
						    timer: 3000,
						    confirmButtonText: "Ok!", 
						  }, function(){
						    window.location.reload();
						  });
						  setTimeout(function() {
						    window.location.reload();
						  }, 3000);
			
				}
			})
			 
	});
}

/****************getPictures********************/
function getPictures(){
	$.ajax({
		url : reizenUrl + "postscript/selectPict.do",
		method : 'post',
		dataType : 'json',
		data : {
			routeNo :$('#routeNo').val()
		},
		success : function(result) {
			if (result.status == 'success') {
				console.log('후기 수정 load success');
				var data = result.data;
			for (var i = 0; i < data.length; i++) {
				/*$('#updatefile').css({'background' : 'url(\''
					+'/resources/images/viewSchedule/' +data[i].picturePath});*/
				$('input[name=price]').val(data[i].price).attr('selected', 'selected');
				$(".transportation").val(data[i].transportation);
				/*$('.select-options').attr(data[i].transportation);*/
				$('textarea[name=content]').val(data[i].content);
				
				}
			}
		}
	})
}
