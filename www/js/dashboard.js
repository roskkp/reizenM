var scheduleListSource = null;
var scheduleListTemplate = null;
var locationListSource = null;
var locationListTemplate = null;
var scrapListSource = null;
var scrapListTemplate =null;

$(function(){
	
	getProfile();
	
	$('#dash_tabs').tabs();
	$('#dash_navbar').navbar();
	
	scheduleListSource = $('#scheduleList').text();
	scheduleListTemplate = Handlebars.compile(scheduleListSource);
	scrapListSource = $('#scrapScList').text();
	scrapListTemplate = Handlebars.compile(scrapListSource);
	locationListSource = $('#scrapSpotList').text();
	locationListTemplate = Handlebars.compile(locationListSource);
	
	refresh();
	
	$(document).on('click','.nick-name',function(e){ // 닉네임 클릭하면 해당 회원 dashboard로 가게
		location.href='dashboard.html?no='+$(this).attr("data-dashNo");
		e.preventDefault();
	});
    
	$('#content').off('click').on('click', '#btn_dash_top', function(){
		$('body,html').animate({scrollTop:0},800);
	});
	
	$('#dash_navbar').css('width', $(document).width());
	
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 2,
        centeredSlides: true,
        paginationClickable: true,
        spaceBetween: 30
    });
	
	fixNav();
	
});

function getProfile(){
	$.getJSON(reizenUrl+'dashboard/getDash.do?boardNo='+dashNo, function(result){
		if(result.status=='success'){
			$('#dash_name').text(result.user.nickName);
			$('#dash_thumb').css('background-image', 'url(' +reizenUrl+ "resources/images/thumbnail/" + result.user.thumbNail+ ')');
		}
	});
}

function refresh() {
	getProfile();
	$('.post').remove();
	listAjax("planlist.do?boardNo=" + dashNo, $('#dash_scheduleList') ,$('a[href="#dash_schedule"] >span'), scheduleListTemplate);
	listAjax("scplanlist.do?boardNo=" + dashNo, $('#dash_scList'), $('a[href="#dash_scrap_sc"] >span'), scrapListTemplate);
	listAjax("sclocationlist.do?boardNo=" + dashNo, $('#dash_spotList'), $('a[href="#dash_scrap_spot"] >span'), locationListTemplate);
}

function listAjax(path, $target, $tab, template) {
	$.ajax({
		dataType : 'json',
		url : reizenUrl+'dashboard/' + path,
		method : 'get',
		success : function(result) {
			
			$target.attr('data-type', result.dataType); // 각각의 탭의 내용을 구분하기 위해 
			
			$target.append(template(result.list));
			
			$('.post').off().hover(function(event) { // 포스트 카드 마우스 오버시 반응
				$(this).children().first().animate({top:'15px',opacity:'1'});
				$(this).children().last().addClass('dash-hover');
			}, function(event) {
				$(this).children().first().animate({top:'0',opacity:'0'});
				$(this).children().last().removeClass('dash-hover');
			});
			
			if (result.list == null) { // 탭바 갯수 표시
				$tab.text('0');
			} else {
				$tab.text(result.list.length);
			}
			
			if(dashNo != sessionStorage.getItem('dashNo')){ // 삭제 권한 체크
				$('.remove').parent().remove();
			}else{
				$(document).on('click', '.remove', function(e) { // 삭제버튼 이벤트 
					var $this= $(this);
					swal({   
						title: "삭제 하시겠습니까?",   
						text: "삭제 버튼을 누르시면 삭제됩니다.",   
						type: "warning",   
						showCancelButton: true,   
						confirmButtonColor: "#DD6B55",  
						confirmButtonText: "삭제",    
						cancelButtonText: "취소",   
						closeOnConfirm: false }, 
						function(){
							switch ($this.parents('.tab-pane').attr('data-type')) {
							case 'plan':
								deleteAjax('removeplan.do?scdNo=' + $this.parents('.post').attr('data-no'));
								break;
							case 'scrPlan':
								deleteAjax('removescp.do?scdNo=' + $this.parents('.post').attr('data-no'));
								break;
							case 'scrLocation':
								deleteAjax('removescl.do?contentId=' + $this.parents('.post').attr('data-no'));
								break;
							default:
								swal("Failed!", "Failed to delete. Please contact your administrator", "error"); 
								break;
							}
							swal("삭제되었습니다.", "", "success"); 
					});
					e.preventDefault();
				});
			}
			
		}
	});
}

function fixNav(){
	
	var top = $('div.ui-header').outerHeight();
	var lastScrollTop = 140;
	
	$(window).scroll(function(event){
	   var st = $(this).scrollTop();
	   if(st==0){
			$('#btn_dash_top').fadeOut();
	   }
	   if (st > lastScrollTop){
	       // downscroll code
		   $('#btn_dash_top').fadeIn();
		   $('#dash_navbar').css('position', 'fixed').css('top', top);
	   } else {
	      // upscroll code
		   $('#dash_navbar').css('position', 'relative').css('top', 0);
	   }
	});
}