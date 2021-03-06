$(function(){
	init();
    $('.spot_tab').tabs({
      active : 0
    });
    
    $('.spot_nav').navbar({
    	defaults: true
    });
	
	$('#content').off('click').on('click', '#btn_spot_map', function(){
		$('#content').load('spot_map.html');
	});

	$('#scrap ,#like').on('click',function(){
		var $this = $(this);
		if($this.attr('data-active') != 'true'){ // 기 추천 기록이 없다면
			if($this.attr('id')=='scrap'){
				changeStatus('addScrap');
			}else{
				changeStatus('addRecm');
			}
			$this.css("color","pink").attr('data-active','true');
		}else{ // 기 추천 기록이 있다면
			if($this.attr('id')=='scrap'){
				changeStatus('delScrap');
			}else{
				changeStatus('delRecm');
			}
			$this.css("color","#ffffff").removeAttr('data-active');
		}
	});//scrap and like click event listener
	$('#memoTab').on('click',function(){ 
		memoCheck();
	})
	$('#infoTab').on('click',function(){
		$('.spot_tab').css('margin-bottom','0px');
		$('#footer').hide();
	})

	$('#removeMemo').on('click',function(){
		deleteMemo();
	})
	
	$('#content').on('click','#btn_spot_plus',function(){
		if (localStorage.getItem('userNo') != null) {
			checkSchedule();
		} else {
			swal("로그인 필요", "로그인 해주세요.", "warning"); 
		}
	})
});

function init(){
	var path = $('#baseSparql').text() + spot_cid;
	var currentMno;
	switch (spot_typeId) {
	case 12:
		path += $('#tourist').text();
		break;
	case 14:
		path += $('#culture').text();
		break;
	case 15:
		path += $('#festival').text();
		path = path.replace('Place','Event');
		break;
	case 28:
		path += $('#leports').text();
		break;
	case 32:
		path += $('#lodge').text();
		break;
	case 38:
		path += $('#shopping').text();
		break;
	case 39:
		path += $('#food').text();
		break;
	}
	searchInfo(path, spot_cid);
	checkStatus();
	memoCheck()
	$('#page').append('<div id="footer" data-role="footer" data-position="fixed" data-tap-toggle="false">'+
			  '<input type="text" id="reviewInput" placeholder="리뷰를 남겨 보세요.">'+
			  '<button id="reviewSubmit">등록</button>'+
	'</div>');
	$('#reviewInput').focus();
	$('#reviewInput').off().on('keyup',function(event){
		console.log($('#reviewInput').val().length)
		if($('#reviewInput').val().length==0){
			$('#reviewSubmit').removeClass('submit-active');
			return;
		}
		$('#reviewSubmit').addClass('submit-active');
	})
	$('#reviewSubmit').off().on('click',function(){
		memoSubmit();
	})
}

function searchInfo(path, cid) {
	var sparqlPath = 'http://data.visitkorea.or.kr/sparql?format=json&query='+encodeURIComponent(path);
	$.ajax({
		url : reizenUrl + 'location/searchDetail.do',
		method : 'post',
		data : {
			'path' : sparqlPath,
			'contentId' : cid
		},
		dataType : 'json',
		success : function(result) {
			var data = result.data.results.bindings;
			var realData = [];
			var dataMap = new resMap();
			mapX = result.subData.mapX;
			mapY = result.subData.mapY;

			$.each(data[0], function(key, value) {
				if (key != 'resource' && key != 'name' && key != '상세설명' && key != 'img') {
					realData.push({
						cate : key,
						data : value.value
					});
				} else if (key == 'name') {
					$('#title').text(value.value);
				} else if (key == '상세설명') {
					$('#overviewBox').html('<br/>'+value.value+'<br/>');
				} else if(key == 'img'){
					console.log('img');
				}
			});
			dataMap.put("data", realData);
			var infoSource = $('#infoBox').text();
			var infoTemplate = Handlebars.compile(infoSource);
			$('.table').append(infoTemplate(dataMap.map));

			for (var i = 1; i <= data.length; i++) {
				$.each(data[i-1],function(key, value) {
					if (key == 'img'){
						$('.swiper-wrapper').append('<div class="swiper-slide" style="background-image:url('+value.value+')"></div>');
					}
				})
			}//for
		    var swiper = new Swiper('.swiper-container', {
		        pagination: '.swiper-pagination',
		        paginationClickable: true,
		        nextButton: '.swiper-button-next',
		        prevButton: '.swiper-button-prev',
		        spaceBetween: 30,
		        effect: 'fade'
		    });
		}
	})
}

resMap = function(){
	this.map = new Object();
};   
resMap.prototype = {   
		put : function(key, value){   
			this.map[key] = value;
		},   
		get : function(key){   
			return this.map[key];
		},
		containsKey : function(key){    
			return key in this.map;
		},
		containsValue : function(value){    
			for(var prop in this.map){
				if(this.map[prop] == value) return true;
			}
			return false;
		},
		isEmpty : function(key){    
			return (this.size() == 0);
		},
		clear : function(){   
			for(var prop in this.map){
				delete this.map[prop];
			}
		},
		remove : function(key){    
			delete this.map[key];
		},
		keys : function(){   
			var keys = new Array();   
			for(var prop in this.map){   
				keys.push(prop);
			}   
			return keys;
		},
		values : function(){   
			var values = new Array();   
			for(var prop in this.map){   
				values.push(this.map[prop]);
			}   
			return values;
		},
		size : function(){
			var count = 0;
			for (var prop in this.map) {
				count++;
			}
			return count;
		}
};

//좋아요, 스크랩 체크
function checkStatus(){
	$.ajax({
		url : reizenUrl + 'location/statusCheck.do?nick='+localStorage.getItem("nickName")+'&cid='+spot_cid,
		method : 'get',
		dataType : 'json',
		success : function(result) {
			if (result.status != 'success') {
				console.log('error');
				return;
			}
			if(result.scrap == 'checked'){
				$('#scrap').css("color","pink").attr('data-active','true');
			}
			if(result.recm == 'checked'){
				$('#like').css("color","pink").attr('data-active','true');
			}
		}
	}) // ajax
}// checkStatus()

function changeStatus(command){
	var url = null;
	var nick = localStorage.getItem("nickName");
	if(nick == null){
		swal('로그인이 필요한 작업입니다').
		return;
	}
	switch (command) {
	case 'addScrap':
		url =  'location/addScrap.do?nick='+nick+'&cid='+spot_cid;
		break;
	case 'delScrap':
		url = 'location/delScrap.do?cid='+spot_cid;
		break;
	case 'addRecm':
		 url =  'location/addRecm.do?nick='+nick+'&cid='+spot_cid;
		 break;
	case 'delRecm':
		url = 'location/delRecm.do?cid='+spot_cid;
		break;
	}
    $.ajax({
        url : reizenUrl + url,
        method : 'get',
        dataType : 'json',
        success : function(result) {
          if (result.status != 'success') {
            console.log('error');
            return;
          }
          console.log('success');
        }
    })// ajax
}
function memoCheck(){
	$('.spot_memo').empty();
	$.ajax({
		url : reizenUrl + 'location/getMemo.do?cid='+spot_cid,
		method : 'get',
		dataType : 'json',
		success : function(result) {
			if (result.status != 'success') {
				console.log('error');
				return;
			}
			if (result.data.length == 0) { // 탭바 갯수 표시
				$("#reviewCount").text("0");
				$('.spot_memo').append('<span id="emptyMemo" class="white"> 아직 작성된 리뷰가 없네요 ! </span>');
			} else {
				result.data.forEach(function(value){
					value.user.thumbNail=reizenUrl+'resources/images/thumbnail/'+value.user.thumbNail;
				})
				$("#reviewCount").text(result.data.length);
				var source = $('#memoTemplate').text();
				var template = Handlebars.compile(source);
				$('.spot_memo').append(template(result));
				var $target = $('.nickName:contains('+localStorage.getItem("nickName")+')').parents('li'); // 삭제 권한
				$target.on('taphold',function(event){
					$("#memo-popup").popup();
					$("#memo-popup").popup("open");
					currentMno = $(this).data('no');
					event.preventDefault();
				})
			}
			if($('#memoTab a').hasClass('ui-btn-active')){
				if(localStorage.getItem('nickName')!=null && localStorage.getItem('nickName')!='' ){ // 로그인 되어있다면 입력가능 
					$('.spot_tab').css('margin-bottom','42px');
					$('#footer').css('display','flex');
				}else{
					$('.spot_tab').css('margin-bottom','0px');
					$('#footer').hide();
					$('.spot_memo').append('<span id="emptyMemo" class="white"> 아직 작성된 리뷰가 없네요 ! </span>')
				}
			}
		}
	})
}
function memoSubmit(){
	$.ajax({
		url : reizenUrl + 'location/writeMemo.do',
		method : 'post',
		dataType : 'json',
		data : {
			'content' : $('#reviewInput').val(),
			'cid' : spot_cid,
			'dsno' : localStorage.getItem('dashNo')
		},
		success : function(result) {
			if (result.status != 'success') {
				console.log('error');
				return;
			}
			$('#reviewInput').val('');
			$('#reviewSubmit').removeClass('submit-active');
			memoCheck();
			updateMemoAlarm();
		}
	})
}
function updateMemoAlarm(){
	$.ajax({
		url : reizenUrl + 'location/updateMemoAlarm.do?cid='+spot_cid,
		method : 'get',
		dataType : 'json',
		success : function(result) {
			if (result.status != 'success') {
				console.log('error');
				return;
			}
			console.log(result);
		}
	})
}
function deleteMemo(){
	swal({   
		title: "Are you sure?",   
		text: "You will not be able to recover this imaginary file!",   
		type: "warning",   
		showCancelButton: true,   
		confirmButtonColor: "#DD6B55",   
		confirmButtonText: "Yes, delete it!",   
		closeOnConfirm: false }, 
		function(){
			$.ajax({
				url : reizenUrl + 'location/removeMemo.do?mno='+currentMno,
				method : 'get',
				dataType : 'json',
				success : function(result) {
					if (result.status != 'success') {
						swal("Failed!", "Failed to delete. Please contact your administrator", "error"); 
						console.log('error');
						return;
					}
					swal("Deleted!", "Your imaginary file has been deleted.", "success"); 
					memoCheck();
				}
			})
		});
}

function checkSchedule(){
	$.ajax({
		url : nodeUrl + ':8889/scheduler/checkSchedule.do',
		method : 'post',
		data : {
			userNo : localStorage.getItem('userNo')
		},
		dataType : 'json',
		success : function(result) {
			if(result.length>0){ // 스케줄이 있다면
				$('select.scheduleSelectList').children().not('.default').remove();
				var scheduleSource = $('#scheduleList').html();
				var scheduleTemplate = Handlebars.compile(scheduleSource);
				$('select.scheduleSelectList').append(scheduleTemplate(result));
				$('select.scheduleSelectList ').selectmenu();
				$('select.scheduleSelectList ').selectmenu('refresh');
				$('.dayList').css('display','none');
				$('.timechecker').css('display','none');
				$('#popbtnTimeSubmit').css('display','none');
				$('#addSpot-popup').popup('open');
			}else { // 스케줄이 없다면
				swal({   
					title: "일정이 없네요 !",   
					text: "새로운 일정을 만드시겠어요?",   
					type: "info",  
					showCancelButton: true,   
					confirmButtonColor: "#DD6B55",   
					confirmButtonText: "Yes",   
					closeOnConfirm: false }, 
					function(){ // 메인에서의 접근과 여타 페이지에서의 접근 경로가 달라서 절대경로 써야합니다
						// 미 구현...
					}); // swal
			}
		}
	})
}

function checkDays(scheduleNo){
	$.ajax({
		url : nodeUrl + ':8889/scheduler/checkDay.do?scheduleNo='+scheduleNo,
		method : 'get',
		dataType : 'json',
		success : function(result) {
			if(result.length>0){ // day가 있다면 ....? day가 없는 일정이 있을 수 있나 ?
				$('select.dayList').children().not('.default').remove();
				var daySource = $('#dayList').html();
				var dayTemplate = Handlebars.compile(daySource);
				$('select.daydatas').append(dayTemplate(result));
				$('select.daydatas').selectmenu();
				$('select.daydatas').selectmenu('refresh');
				$('.dayList').css('display','block');
				event.stopPropagation();
			}else { //day가 없다면 .... 인데 ... day가 없는 일정이 있을 수 없으니까 .. 에러...
				swal("Failed!", "일정 조회 실패. 관리자에게 문의하세요. ", "error"); 
				event.stopPropagation();
			}
		}
	})
}
