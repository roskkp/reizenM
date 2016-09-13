$(function(){

	initPhoneGap();
	$('#btnTakePhoto').click(function(){
		takePhoto();
	});
	$('#btnGetPhoto').click(function(){
		getPhoto();
	});
	
	/*$('#btnGetPhoto').fileupload({
		autoUpload : false
	}).on('fileuploadadd', function(e, data) {
		filesList.pop(); 
		console.log('여기들어왓나');
		console.log(data.files[0]);
		filesList.push(data.files[0]);
		console.log(filesList);
		
	}).on('fileuploaddone', function (e, data) {
		alert('성공');
		location.reload();
	});*/
	
	
	
	$.ajax({
		url : reizenUrl+'postscript/postscript.do?scheduleNo='+956,
		dataType : 'json',
		method : 'GET',
		success : function(result){
			if(result.status=='success'){
				console.log(result);
				var source = $('#postScheduleList').html();
				var template = Handlebars.compile(source);
				$('#post_content').append(template(result));
			}else{
				swal('error');
			}
		}
	});

	$.ajax({
		url : reizenUrl+'postscript/userPost.do?scheduleNo='+956,
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

});

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
	$('#displayArea').attr('src', 'data:image/jpeg;base64,'+imageData);

	var image = 'data:image/jpeg;base64,'+imageData;
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = image.substr(fileURL.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";

	var params = {};
	params.value1 = "test";
	params.value2 = "param";

	options.params = params;

	var ft = new FileTransfer();
	ft.upload(image, encodeURI('http://192.168.0.30:8080/postscript/addMobile.do'), win, fail, options);
}

function onFail(message){
	alert('실패 : '+message);
}
function getPhoto(){
	navigator.camera.getPicture(onPhotoURISuccess, onFail,
			{quality: 50, destinationType:Camera.DestinationType.FILE_URI, sourceType:Camera.PictureSourceType.PHOTOLIBRARY});
}
function onPhotoURISuccess(imageURI){
	
	$('#displayArea').attr('src', imageURI);
	var image = 'data:image/jpeg;base64,'+imageURI;
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = image.substr(fileURL.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";

	var params = {};
	params.value1 = "test";
	params.value2 = "param";

	options.params = params;

	var ft = new FileTransfer();
	ft.upload(image, encodeURI('http://192.168.0.30:8080/postscript/addMobile.do'), win, fail, options);
}
var win = function (r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
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



