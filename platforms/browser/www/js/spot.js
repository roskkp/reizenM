$(function(){
	
    $('.spot_tab').tabs({
      active : 0
    });
    
    $('.spot_nav').navbar();
	
	$('#content').off('click').on('click', '#btn_spot_map', function(){
		$('#content').load('spot_map.html');
	});
    
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        spaceBetween: 30,
        effect: 'fade'
    });
	
});