/* global $ */
var GuidedTour = function (steps, options) {
  $(document)
    .on('click', '[data-toggle=popover]', function () {
      $($(this).data('target')).popover('show');
      return false;
    })
    .on('click', '[data-dismiss="popover"]', function () {
      $(this).closest('.popover').data('bs.popover').hide();
      return false;
    });

  return {
    start: function () {
      var toursteps = [];
      var defaults = {
        html: true,
        placement: 'auto top',
        container: 'body',
        trigger: 'manual',
        template:'<div class="popover tutorial shadow rounded-0" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
      };
      var opts = $.extend(defaults, options);
      $(steps).each(function (i, step) {
        if (step.target) {
          var $target = $(step.target);
          if (!$target.length) {
            console.warn('Target not found', $target);
            return;
          }
          if (step.content instanceof $) step.content = step.content.html();
          var content = "<div><p>" + step.content + "</p></div>";
          step.content = function () {
            if(step.beforeShow){
              step.beforeShow();
            }
            var out = content;
            out += '<div class="clearfix">';
            if (i + 1 < steps.length) {
              out += '<button type="button" class="btn btn-primary btn-sm btn-flat float-right" autofocus data-dismiss="popover" data-toggle="popover" data-target="'+steps[i + 1].target+'">다음</button>';
            }
            if ( i > 0 ){
              out += '<button type="button" class="btn btn-link btn-sm btn-flat float-right" data-dismiss="popover" data-toggle="popover" data-target="'+steps[i - 1].target+'">이전</button>';
            }
            out += '<button type="button" class="btn btn-light btn-sm btn-flat float-right" data-dismiss="popover">닫기</button>';
            out += '</div>';
            return out;
          };
          step.title += '<div class="close" data-dismiss="popover">×</div>';
          toursteps.push($target.popover($.extend(opts, step)));
          $target.on("shown.bs.popover", function(){
            var scrollTop = 0;
            var $context = $($(this).data('target'));
            if($context.$tip){
              scrollTop = $context.data('bs.popover').$tip.offset().top - $(window).height() / 2;
            }else if($("body .tutorial").length){
              scrollTop = $("body .tutorial").offset().top - $(window).height() / 2;
            }
            $('html, body').clearQueue().animate({scrollTop: Math.max(scrollTop, 0)}, 'fast');
          });
        }
      });
      
      if (toursteps[0]) toursteps[0].popover('show');
    }
  };
};

$('#tutorialModal #start').click(function () {
  var isSmallWindow = (!$("#mainRow #sidebarContainer").is(":visible"));
  var tour = GuidedTour([
    {
      target: '#mainMenu',
      title: '메뉴 열기/닫기',
      content: '이 버튼을 눌러 우리 매장의 정보를 등록하거나, 알림톡을 사용하도록 설정할 수 있습니다!',
      placement: 'bottom',
      beforeShow: function(){
        if($("#infoModal").is(":visible")){
          $("#infoModal").modal('hide');
        }
      }
    },
    {
      target: isSmallWindow?'#infoModal #infoModalTitle':'#infoModal .modal-content',
      title: '매장 정보 등록',
      content: '메뉴 버튼에서 내 매장 정보 버튼을 누르면, 매장의 이름과 운영시간, 그리고 담당자를 관리할 수 있습니다.',
      placement: 'top',
      beforeShow: function(){
        if(!$("#infoModal").is(":visible")){
          NMNS.initInfoModal();
          $("#infoModal").modal("show");
        }
      }
    },
    {
      target: '#infoModal #infoBizEndTimePicker',
      title: '매장 운영시간',
      content: '설정된 매장 운영시간에 따라 예약 시간표에 입력할 수 있는 시간이 맞춰집니다.',
      placement: 'top',
      beforeShow: function(){
        if(!$("#infoModal").is(":visible")){
          NMNS.initInfoModal();
          $("#infoModal").modal("show");
        }
      }
    },
    {
      target: '#infoModal #infoManagerList',
      title: '담당자 관리',
      content: '매장의 담당자를 여러명 등록하고싶으세요? 이곳에서 담당자를 추가할 수 있습니다.<br/>담당자 색깔을 바꿔 시간표를 다채롭게 꾸며보세요!',
      placement: 'top',
      beforeShow: function(){
        if($("#alrimModal").is(":visible")){
          $("#alrimModal").modal("hide");
        }
        if(!$("#infoModal").is(":visible")){
          NMNS.initInfoModal();
          $("#infoModal").modal("show");
        }
      }
    },
    {
      target: '#alrimModal #alrimNotice',
      title: '알림톡 설정',
      content: '시간표에 예약을 등록할 때 고객에게 예약 안내를 보내고 싶으시다구요?<br/>여기에서 알림톡을 보내도록 설정해보세요. 고객에게 보낼 문구도 변경하실 수 있습니다.',
      placement: 'top',
      beforeShow: function(){
        if($("#infoModal").is(":visible")){
          $("#infoModal").modal('hide');
        }
        if(!$("#alrimModal").is(":visible")){
          NMNS.initAlrimModal();
          $("#alrimModal").modal("show");
        }
      }
    },
    {
      target: '#alrimModal #alrimSwitchBtn',
      title: '알림톡 사용내역 보기',
      content: '지금까지 고객에게 보낸 알림톡 내역을 확인하고 싶으신가요?<br/>이 버튼을 눌러 확인해보세요.',
      placement: 'top',
      beforeShow: function(){
        if($("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("hide");
        }
        if(!$("#alrimModal").is(":visible")){
          NMNS.initAlrimModal();
          $("#alrimModal").modal("show");
        }
      }
    },
    {
      target: isSmallWindow?'#navbarResponsive .addNoShowLink':'#mainRow #sidebarContainer .addNoShowLink',
      title: '노쇼 등록하기',
      content: '고객이 노쇼를 하셨다구요? 해당 고객이 노쇼했다는 것을 모두에게 공유해주세요.<br/>이 버튼을 누르면 바로 노쇼를 등록하실 수 있습니다.',
      placement: isSmallWindow?'top':'right',
      beforeShow: function(){
        if($("#alrimModal").is(":visible")){
          $("#alrimModal").modal("hide");
        }
        if(isSmallWindow && !$("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("show");
        }
      }
    },
    {
      target: isSmallWindow?'#navbarResponsive .getNoShowLink':'#mainRow #sidebarContainer .getNoShowLink',
      title: '노쇼 조회하기',
      content: '새로운 고객이 노쇼를 한 적이 있는지 궁금하시다구요?<br/>이 버튼을 눌러 다른 매장에서 공유한 노쇼전적을 확인하실 수 있습니다.',
      placement: isSmallWindow?'top':'right',
      beforeShow: function(){
        if($("#alrimModal").is(":visible")){
          $("#alrimModal").modal("hide");
        }
        if(isSmallWindow && !$("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("show");
          
        }
      }
    },
    {
      target: isSmallWindow?'#navbarResponsive .addReservLink':'#mainRow #sidebarContainer .addReservLink',
      title: '예약 추가하기',
      content: '예약받은 내역을 추가하고 싶으시다구요?<br/>이 버튼을 눌러 예약내용을 입력하실 수 있습니다.',
      placement: isSmallWindow?'top':'right',
      beforeShow: function(){
        if($("#alrimModal").is(":visible")){
          $("#alrimModal").modal("hide");
        }
        if(isSmallWindow && !$("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("show");
        }
      }
    },
    {
      target: isSmallWindow?'#navbarResponsive .addTaskLink':'#mainRow #sidebarContainer .addTaskLink',
      title: '일정 추가하기',
      content: '예약은 아니지만 매장관리에 필요한 스케줄을 기록하고 싶으시다구요?<br/>이 버튼을 눌러 매장의 일정을 잊지않게 기록하실 수 있습니다.',
      placement: isSmallWindow?'top':'right',
      beforeShow: function(){
        if($("#alrimModal").is(":visible")){
          $("#alrimModal").modal("hide");
        }
        if(isSmallWindow && !$("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("show");
        }
      }
    },
    {
      target: isSmallWindow?"#mainCalendar div[data-panel-index='4']":'#mainCalendar .tui-full-calendar-vlayout-area',
      title: '시간표에 예약 추가하기',
      content: '이 시간표에 예약을 추가하고 싶은 곳을 누르면 해당 시간에 맞게 예약을 추가하실 수 있습니다.<br/>추가된 예약을 다른곳으로 끌어 옮기면 예약시간을 변경하실 수 있어요!',
      placement: isSmallWindow?'top':'left',
      beforeShow: function(){
        if($("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("hide");
        }
      }
    },
    {
      target: '#mainCalendarTools .btn-group:visible',
      title: '시간표 범위 바꿔보기',
      content: '시간표를 일, 주, 혹은 월단위로 바꿔서 보고싶으신가요?<br/>이곳의 버튼을 눌러 확인해보세요.',
      placement: 'bottom',
      beforeShow: function(){
        if($("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("hide");
        }
      }
    },
    {
      target: isSmallWindow?'#navbarResponsive .customerMenuLink':'#mainRow #sidebarContainer .customerMenuLink',
      title: '고객을 관리하기',
      content: '우리 매장에 방문한 고객의 방문이력과 메모를 관리하실 수 있습니다.<br/>예약한 고객의 정보를 확인하여 단골고객으로 만들어보세요!',
      placement: isSmallWindow?'top':'right',
      beforeShow: function(){
        if(isSmallWindow && !$("#navbarResponsive").hasClass("show")){
          $("#navbarResponsive").collapse("show");
        }
      }
    }
  ]);

  tour.start();
});