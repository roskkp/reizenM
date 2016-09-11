$(function(){

	$('#keyword').textinput();
	$('#spot_category').listview();
	
	$('#content').off('click').on('click', '#spot_nature', function(){
		$('#content').load('spot.html');
	});
	
	
});