var page=1;
var nop;
var month;
var term;
$(function(){
	$('#keyword').textinput();
	$('select').selectmenu();
	$('select').on('change',function(){
		$this = $(this);
		if($this.val() == '0'){
			switch ($this.attr('id')) {
			case 'select-choice-0':
				nop = '';
				break;
			case 'select-choice-1':
				month = '';
				break;
			case 'select-choice-2':
				term = '';
				break;
			}
		}else{
			nop = $('#select-choice-0').val();
			month = $('#select-choice-1').val();
			term = $('#select-choice-2').val();
		}
		searchSchedule(nop,month,term,page);
	})
});

function searchSchedule(nop,month,term,page){
	$.ajax({
		url: reizenUrl+"scheduler/searchkeyword.do",
		method: 'post',
		dataType: 'json',
		data: {
			'keyword': $('#keyword').val(),
			'areaCode': areaCode,
			'localCode': localCode,
			'page': page,
			'size': 20,
			'nop': nop,
			'month': month,
			'term': term
		},
		success: function(result){
			if (result.status == 'success') {
				$('.scheduleList > div').empty();
				if (result.data == 'noData' || result.data.length == 0) {
					swal({
						title: "",
						text: "일정 데이터가 없습니다.",
						type: "warning",
						confirmButtonText: "확인"
					});
					schedulePage = 0;
					$('#scheduleRefresh').text('처음으로');
				}

				i=0; // 탭 마다 처음 위치에 포스트를 넣기 위해 
				result.data.forEach(function(value,index){
					$('.scheduleList').find("."+ar[i]).append(scheduleTemplate(value));// 핸들바스 이용 포스트 생성
					i++;
					if(i>2){ // 3분할 화면이기에 
						i=0;
					}
				});
				
				var imgs = result.img; 

				if (imgs.length < 5) {
					schedulePage = 0;
					$('#scheduleRefresh').text('처음으로');
				}

				imgs.forEach(function(value,index){
					$($('.sceduleImg')[index]).attr('src',value);
				});

				$('.post').off().hover(function(event) { // 포스트 카드 마우스 오버시 반응
					$(this).children().first().animate({top:'15px',opacity:'1'});
				}, function(event) {
					$(this).children().first().animate({top:'0',opacity:'0'});
				})
			}
		},
		error : function(request,status,error) {
			console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
		}
	})
}