$(function(){
	init();
    $('.spot_tab').tabs({
      active : 0
    });
    
    $('.spot_nav').navbar();
	
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
	
});

function init(){
	var path = $('#baseSparql').text() + spot_cid;
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