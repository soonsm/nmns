/*global jQuery, location, moment, tui, NMNS, io*/
(function($) {
  NMNS.needInit = true;
  NMNS.history = [];
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 60)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  //calendars
  NMNS.schedulelist = [];
  var selectedManager, datePicker;
  NMNS.calendar = new tui.Calendar("#mainCalendar", {
    taskView:["task"],
    scheduleView:true,
    useCreationPopup:true,
    useDetailPopup:true,
    template:{
      monthGridHeader: function(model){
        var date = new Date(model.date);
        var template = "<span class='tui-full-calendar-weekday-grid-date'>"+date.getDate() + "</span>";
        return template;
      },
      allday:function(schedule){
        return getTimeSchedule(schedule, schedule.isAllDay);
      },
      time:function(schedule){
        return getTimeSchedule(schedule, schedule.isAllDay);
      },
      alldayTitle:function(){
        return "<span class='tui-full-calendar-left-content'>하루종일</span>";
      },
      taskTitle:function(){
        return "<span class='tui-full-calendar-left-content'>일정</span>";
      },
      timegridDisplayPrimayTime:function(time){
        return time.hour + ":00";
      },
      popupIsAllDay:function(){
        return "하루종일";
      },
      startDatePlaceholder:function(){
        return "시작시간";
      },
      endDatePlaceholder:function(){
        return "종료시간";
      },
      popupDetailDate:function(isAllDay, start, end){
        var startDate = moment(start instanceof Date? start : start.toDate()), endDate = moment(end instanceof Date? end : end.toDate());
        var isSameDate = startDate.isSame(endDate, 'day');
        var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'hh:mm a';

        if (isAllDay) {
            return startDate.format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + endDate.format('YYYY.MM.DD'));
        }

        return (startDate.format('YYYY.MM.DD hh:mm a') + ' - ' + endDate.format(endFormat));
      },
      popupEdit: function(){
        return "수정";
      },
      popupDelete: function(){
        return "삭제";
      }
    },
    month:{
      daynames:["일", "월", "화", "수", "목", "금", "토"]
    },
    week:{
      daynames:["일", "월", "화", "수", "목", "금", "토"],
      hourStart:NMNS.info?parseInt(NMNS.info.bizBeginTime.substring(0,2)) : 9,
      hourEnd:NMNS.info?parseInt(NMNS.info.bizEndTime.substring(0,2)):23
    },
    theme:{
      'week.currentTime.color': '#009688',
      'week.currentTimeLinePast.border': '1px dashed #009688',
      'week.currentTimeLineBullet.backgroundColor': '#009688',
      'week.currentTimeLineToday.border': '1px solid #009688',
    }
  });

  var socketResponse = function(requestName, successCallback, failCallback){
    return function(res){
      if(res && res.type === "response"){
        if(res.status){//success
          if(successCallback){
            successCallback(res);
          }
        }else{//fail
          alert(requestName + "에 실패하였습니다." + (res.message?"(" + res.message + ")":""));
          if(failCallback){
            failCallback(res);
          }
        }
      }else if(res && res.type === "push"){
        console.log("server push!");
        console.log(res);
        if(successCallback){
          successCallback(res);
        }
      }else{
        console.log(res);
      }
    };
  };
  NMNS.socket = io();
  NMNS.socket.on("message", socketResponse("서버 메시지 받기", function(e){
    console.log(e);
  }));
  NMNS.socket.emit("get info");
  NMNS.socket.emit("get manager");
  
  NMNS.socket.on("get info", socketResponse("매장 정보 받아오기", function(e){
    console.log(e);
    NMNS.info = e.data;
    if(NMNS.calendar){
      NMNS.calendar.setOptions({week:{hourStart:(NMNS.info.bizBeginTime?parseInt(NMNS.info.bizBeginTime.substring(0,2)):9), hourEnd:(NMNS.info.bizEndTime?parseInt(NMNS.info.bizEndTime.substring(0,2)):23)}});
    }
    NMNS.email = e.data.email || NMNS.email;
  }));
  
  NMNS.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e){
    console.log(e);
    drawSchedule(e.data);
    NMNS.holiday = e.holiday;
    refreshScheduleVisibility();
  }));
  
  NMNS.socket.on("get manager", socketResponse("매니저 정보 받아오기", function(e){
    e.data.forEach(function(item){
      item.checked = true;
      item.bgColor = item.color;
      item.borderColor = item.color;
      item.color = getColorFromBackgroundColor(item.bgColor);
    });
    
    $("#lnbManagerList").html(generateLnbManagerList(e.data));
    NMNS.calendar.setCalendars(e.data);
    if(NMNS.needInit){
      delete NMNS.needInit;
      setSchedules();
    }
    $(".addManager").off("touch click").on("touch click", function(){
      var color = NMNS.colorTemplate[Math.floor(Math.random() * NMNS.colorTemplate.length)];
      var list = $(this).prev();
      var clazz = list.attr("id") === "lnbManagerList"? "lnbManagerItem" : "infoManagerItem";
      list.append($("<div class='"+clazz+" addManagerItem'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'/><span style='background-color:"+color+"; border-color:"+color+";'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-color='"+color+"' placeholder='담당자 이름'/></label>" + (clazz === "lnbManagerItem"? "<i class='fas fa-check submitAddManager pl-1' title='추가'></i><i class='fas fa-times cancelAddManager pl-1' title='취소'></i>":"<i class='fas fa-trash cancelAddManager pl-2 title='삭제'></i>")+"</div>"));
      if(clazz === "lnbManagerItem"){
        $(".lnbManagerItem .submitAddManager").off("touch click").on("touch click", function(){
          submitAddManager(this);
        });
        $(".lnbManagerItem input[type='text']").off("keyup").on("keyup", function(e){
          if(e.which === 27){
            cancelAddManager(this);
            list.find("div:last-child input[type='text']").focus();
          }else if(e.which === 13){
            submitAddManager(this);
          }
        });
      }else{
        $(".infoManagerItem input[type='text']").off("keyup").on("keyup", function(e){
          if(e.which === 27){
            cancelAddManager(this);
            list.find("div:last-child input[type='text']").focus();
          }
        });
      }
      $("."+ clazz + " .cancelAddManager").off("touch click").on("touch click", function(){
        cancelAddManager(this);
        list.find("div:last-child input[type='text']").focus();
      });
      list.find("div:last-child input[type='text']").focus();
    });
  }));
  
  NMNS.calendar.on({
    clickSchedule:function(e){
      console.log("clickSchedule", e);
    },
    clickDayname:function(e){
      console.log("clickDayname", e);

    },
    beforeCreateSchedule:function(e){
      saveNewSchedule(e);
    },
    beforeUpdateSchedule:function(e){
      NMNS.history.push(e.history || $.extend(true, {}, e.schedule));
      e.schedule.start = e.start;
      e.schedule.end = e.end;
      
      if(e.history && e.history.selectedCal.id !== e.schedule.calendarId){//manager changed
        NMNS.calendar.deleteSchedule(e.schedule.id, e.history? e.history.selectedCal.id : e.schedule.calendarId);
        e.schedule.category =  e.schedule.isAllDay ? 'allday' : 'time';
        e.schedule.dueDateClass = '';
        NMNS.calendar.createSchedules([e.schedule]);
      }else{
        NMNS.calendar.updateSchedule(e.schedule.id, e.history? e.history.selectedCal.id : e.schedule.calendarId, e.schedule);
      }

      e.schedule.start = moment(e.schedule.start.toDate? e.schedule.start.toDate(): e.schedule.start).format("YYYYMMDDHHmm");
      e.schedule.end = moment(e.schedule.end.toDate? e.schedule.end.toDate() : e.schedule.end).format("YYYYMMDDHHmm");
      NMNS.socket.emit("update reserv", e.schedule);
    },
    beforeDeleteSchedule:function(e){
      NMNS.history.push(e.schedule);
      NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
      e.schedule.status = "DELETED";
      NMNS.socket.emit("update reserv", e.schedule);
    },
    afterRenderSchedule:function(e){
      $("#mainCalendar").height(($(".tui-full-calendar-layout").height() + 7) > $("footer").position().top - 200 ? ($("footer").position().top - 200): ($(".tui-full-calendar-layout").height() + 7)+ "px");
    }
  });
  
  function getTimeSchedule(schedule, isAllDay){
    var html = "";
    if (!isAllDay) {
      html+="<strong>" + moment(schedule.start.toDate()).format("HH:mm") + "</strong> ";
    }else{
      html+="<span class='calendar-font-icon far fa-clock'></span> ";
    }
    html += schedule.title + (schedule.raw.contact?"<br/><span class='fas fa-phone'></span> " + schedule.raw.contact : "") + (schedule.raw.contents?"<br/><span class='fas fa-list'></span> " + schedule.raw.contents : "");
    return html;
  }
  
  function onClickMenu(e) {
    var action = e.target.getAttribute('data-action');
    if(!action){
      action = e.target.parentElement.getAttribute('data-action');
    }
    var viewName = '';

    switch (action) {
      case 'toggle-daily':
        viewName = 'day';
        break;
      case 'toggle-weekly':
        viewName = 'week';
        break;
      case 'toggle-monthly':
        var width = $(window).width();
        if(width>=1200){
          $("#mainCalendar").height("65rem");
        }else if(width >= 992){
          $("#mainCalendar").height("60rem");
        }else{
          $("#mainCalendar").height("55rem");
        }
        viewName = 'month';
        break;
      default:
        break;
    }
    NMNS.calendar.changeView(viewName, true);

    setDropdownCalendarType();
    setRenderRangeText();
    setSchedules();
  }

  function onClickNavi(e) {
    var action = e.target.getAttribute('data-action');
    if(!action){
      action = e.target.parentElement.getAttribute('data-action');
    }
    switch (action) {
      case 'prev':
        NMNS.calendar.prev();
        break;
      case 'next':
        NMNS.calendar.next();
        break;
      default:
        return;
    }

    setRenderRangeText();
    setSchedules();
  }

  function onNewSchedule() {
    var title = $('#new-schedule-title').val();
    var location = $('#new-schedule-location').val();
    var isAllDay = document.getElementById('new-schedule-allday').checked;
    var start = datePicker.getStartDate();
    var end = datePicker.getEndDate();
    var manager = selectedManager ? selectedManager : NMNS.calendar.getCalendars()[0];
console.log("aaa");
    if (!title) {
      return;
    }

    NMNS.calendar.createSchedules([{
      id: "",
      calendarId: manager.id,
      title: title,
      isAllDay: isAllDay,
      start: start,
      end: end,
      category: isAllDay ? 'allday' : 'time',
      dueDateClass: '',
      color: manager.color,
      bgColor: manager.bgColor,
      dragBgColor: manager.bgColor,
      borderColor: manager.borderColor,
      raw: {
          location: location
      },
      state: 'Busy'
    }]);

    $('#modal-new-schedule').modal('hide');
  }

  function onChangeNewScheduleCalendar(e) {
    var target = $(e.target).closest('a[role="menuitem"]')[0];
    var calendarId = target.getAttribute('data-action');
    changeNewScheduleCalendar(calendarId);
  }

  function changeNewScheduleCalendar(calendarId) {
    var calendarNameElement = document.getElementById('calendarName');
    var manager = NMNS.manager;
    var html = [];

    html.push('<span class="calendar-bar" style="background-color: ' + manager.bgColor + '; border-color:' + manager.borderColor + ';"></span>');
    html.push('<span class="calendar-name">' + manager.name + '</span>');

    calendarNameElement.innerHTML = html.join('');

    selectedManager = manager;
  }

  function createNewSchedule(event) {
    var start = event.start ? new Date(event.start.getTime()) : new Date();
    var end = event.end ? new Date(event.end.getTime()) : moment().add(1, 'hours').toDate();
    console.log("bbbbbb");
    NMNS.calendar.openCreationPopup({
        start: start,
        end: end
    });
    $("#creationPopupName").focus();
  }
  function saveNewSchedule(scheduleData) {
    scheduleData.id = NMNS.email + generateRandom();
    console.log(scheduleData);
    NMNS.calendar.createSchedules([scheduleData]);
    
    NMNS.history.push(scheduleData);
    var serverSchedule = $.extend({}, scheduleData);
    serverSchedule.start = moment(serverSchedule.start.toDate()).format("YYYYMMDDHHmm");
    serverSchedule.end = moment(serverSchedule.end.toDate()).format("YYYYMMDDHHmm");
    NMNS.socket.emit("add reserv", serverSchedule);
  }

  function findManager(managerId){
    return NMNS.calendar.getCalendars().find(function(manager){
      return (manager.id === managerId);
    });
  }

  function onChangeManagers(e) {
    var checked = e.target.checked;
    var viewAll = document.querySelector('.lnbManagerItem input');
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#lnbManagerList input'));
    var allCheckedCalendars = true;

    if ($(e.target).is("#managerCheckAll")) {
      allCheckedCalendars = checked;

      managerElements.forEach(function(input) {
        var span = input.parentNode;
        input.checked = checked;
        span.style.backgroundColor = checked ? span.style.borderColor : 'transparent';
      });

      NMNS.calendar.getCalendars().forEach(function(manager) {
        manager.checked = checked;
      });
    } else {
      var manager = $(e.target).parents(".lnbManagerItem");
      if(manager.is(".addManagerItem")){
        return;
      }
      var managerId = manager.data("value");
      if(managerId){
        findManager(managerId).checked = checked;
        allCheckedCalendars = managerElements.every(function(input) {
          return input.checked;
        });
  
        if (allCheckedCalendars) {
          viewAll.checked = true;
        } else {
          viewAll.checked = false;
        }
      }
    }

    refreshScheduleVisibility();
  }

  function refreshScheduleVisibility() {
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#lnbManagerList input'));

    NMNS.calendar.getCalendars().forEach(function(manager) {
      NMNS.calendar.toggleSchedules(manager.id, !manager.checked, false);
    });

    NMNS.calendar.render(true);

    managerElements.forEach(function(input) {
      var span = input.nextElementSibling;
      span.style.backgroundColor = input.checked ? span.style.borderColor : 'transparent';
    });
    if(NMNS.holiday){
      drawHoliday(NMNS.holiday);
    }
  }

  function setDropdownCalendarType() {
    var type = NMNS.calendar.getViewName();
    
    $(".calendarType").removeClass("active");
    if (type === 'day') {
      $(".calendarType[data-action='toggle-daily']").addClass("active");
    } else if (type === 'week') {
      $(".calendarType[data-action='toggle-weekly']").addClass("active");
    } else {
      $(".calendarType[data-action='toggle-monthly']").addClass("active");
    }

  }

  function setRenderRangeText() {
    var renderRange = document.getElementById('renderRange');
    var options = NMNS.calendar.getOptions();
    var viewName = NMNS.calendar.getViewName();
    var html = [];
    if (viewName === 'day') {
        html.push(moment(NMNS.calendar.getDate().getTime()).format('YYYY.MM.DD'));
    } else if (viewName === 'month' && (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
        html.push(moment(NMNS.calendar.getDate().getTime()).format('YYYY.MM'));
    } else {
        html.push(moment(NMNS.calendar.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
        html.push(' – ');
        html.push(moment(NMNS.calendar.getDateRangeEnd().getTime()).format(' MM.DD'));
    }
    renderRange.innerHTML = html.join('');
  }

  function setSchedules() {
    NMNS.calendar.clear();
    getSchedule(NMNS.calendar.getDateRangeStart(), NMNS.calendar.getDateRangeEnd());
  }

  function generateAuthStatusBadge(authStatus){
    switch(authStatus){
      case "BEFORE_VERIFICATION":
        return "<span class='badge badge-danger'>이메일 미인증</span>";
      case "EMAIL_VERIFICATED":
        return "<span class='badge badge-success'>인증</span>";
    }
    $("#infoAccountStatus").removeClass("pl-2");//no auth status badge
    return "";
  }

  function generateAccountStatusBadge(accountStatus){
    switch(accountStatus){
      case 1:
        return "<span class='badge badge-danger'>잠김</span>";
    }
    return "";
  }
  
  function generateScheduleStatusBadge(scheduleStatus){
    switch(scheduleStatus){
      case "RESERVED":
        return "<span class='badge badge-success'>정상</span>";
      case "CANCELED":
        return "<span class='badge badge-secondary'>취소</span>";
      case "NOSHOW":
        return "<span class='badge badge-danger'>노쇼</span>";
    }
    return "";
  }
  
  function generateManagerList(managerList){
    var html = "";
    managerList.forEach(function(item){
      html += "<div class='infoManagerItem'><label><input class='tui-full-calendar-checkbox-round' checked='checked' readonly='readonly' type='checkbox'/><span class='infoManagerColor' style='background-color:"+item.bgColor+"; border-color:"+item.bgColor+";'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-id='"+item.id+"' data-color='"+item.bgColor+"' placeholder='담당자 이름' value='"+item.name+"' data-name='"+item.name+"'/></label><i class='fas fa-trash deleteManager pl-2' title='삭제'></i></div>";
    });
    return html;
  }
  
  function generateLnbManagerList(managerList){
    var html = "";
    managerList.forEach(function(item){
      html += "<div class='lnbManagerItem' data-value='"+item.id+"'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
      html += "<span style='background-color:"+item.bgColor+"; border-color:"+item.borderColor+"'></span><small>"+item.name+"</small></label></div>";
    });
    return html;
  }
  
  function refreshAlrimModal(){
    if(NMNS.info.alrimTalkInfo.useYn === "Y"){
      $("#alrimUseYn").prop("checked", true);
      $("#alrimScreen").hide();
    }else{
      $("#alrimUseYn").prop("checked", false);
      $("#alrimScreen").show();
    }
    $("#alrimCallbackPhone").val(NMNS.info.alrimTalkInfo.callbackPhone || "");
    $("#alrimCancelDue").val(NMNS.info.alrimTalkInfo.cancelDue || "");
    $("#alrimNotice").val(NMNS.info.alrimTalkInfo.notice || "");
    $("#noticeByteCount").text($("#alrimNotice").val().length);
  }

  function submitAlrimModal(){
    if($("#alrimNotice").val().length > 700){
      alert("알림 안내문구의 길이가 너무 깁니다. 조금만 줄여주세요 :)");
      $("#alrimNotice").focus();
      return;
    }
    if($("#alrimUseYn").prop("checked") && $("#alrimCallbackPhone").val() === ""){
      alert("알림톡을 사용하시려면 반드시 휴대폰번호를 입력해주세요!");
      $("#alrimCallbackPhone").focus();
      return;
    }
    var parameters = {}, history = {id:"alrimInfo"};
    if(($("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "Y") || (!$("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "N")){
      history.useYn = NMNS.info.alrimTalkInfo.useYn;
      parameters.useYn = $("#alrimUseYn").prop("checked")?"Y":"N";
      NMNS.info.alrimTalkInfo.useYn = parameters.useYn;
    }
    if($("#alrimCallbackPhone").val() !== (NMNS.info.alrimTalkInfo.callbackPhone || "")){
      history.callbackPhone = NMNS.info.alrimTalkInfo.callbackPhone;
      parameters.callbackPhone = $("#alrimCallbackPhone").val();
      NMNS.info.alrimTalkInfo.callbackPhone = parameters.callbackPhone;
    }
    if($("#alrimCancelDue").val() !== (NMNS.info.alrimTalkInfo.cancelDue || "")){
      history.cancelDue = NMNS.info.alrimTalkInfo.cancelDue;
      parameters.cancelDue = $("#alrimCancelDue").val();
      NMNS.info.alrimTalkInfo.cancelDue = parameters.cancelDue;
    }
    if($("#alrimNotice").val() !== (NMNS.info.alrimTalkInfo.notice || "")){
      history.notice = NMNS.info.alrimTalkInfo.notice;
      parameters.notice = $("#alrimNotice").val();
      NMNS.info.alrimTalkInfo.notice = parameters.notice;
    }
    if(Object.keys(parameters).length){
      NMNS.history.push(history);
      NMNS.socket.emit("update alrim", parameters);
      alert("변경된 정보를 전송하였습니다.");
    }else{
      alert("변경된 내역이 없습니다.");
    }
    $("#alrimModal").modal("hide");
  }

  function initAlrimModal(){
    if(!NMNS.initedAlrimModal){
      NMNS.initedAlrimModal = true;
      $("#alrimNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function(e){
        $("#noticeByteCount").text($(this).val().length);
        $(this).height(0).height(this.scrollHeight>150?150:(this.scrollHeight<60?60:this.scrollHeight));
      });
      $("#alrimUseYn").off("change").on("change", function(){
        if($(this).prop("checked")){
          $("#alrimScreen").hide();
        }else{
          $("#alrimScreen").show();
        }
      });
      $("#alrimModalRefresh").off("touch click").on("touch click", refreshAlrimModal);
      $("#alrimModalSave").off("touch click").on("touch click", submitAlrimModal);
      $("#alrimCallbackPhone").off("blur").on("blur", function(){
        $(this).val($(this).val().replace(/\D/g,''));
      });
    }
    refreshAlrimModal();
  }
  
  function submitInfoModal(){
    //validation start
    if($(".infoManagerItem input[type='text']").length){//추가하는것이 있을 경우 이름이 비어있는지 확인
      var cont = true;
      $(".infoManagerItem input[type='text']").each(function(){
        if(!$(this).val().length){
          cont = false;
          $(this).focus();
        }
      });
      if(!cont){
        alert("담당자의 이름을 입력해주세요.");
        return;
      }
    }else{
      alert("담당자는 최소 1명 이상이 있어야 합니다.");
      return;
    }
    var beginTime = moment($("#infoBizBeginTime").val(), "HH:mm");
    if(!beginTime.isValid()){
      alert("매장 운영 시작시간이 올바르지 않습니다.");
      $("#infoBizBeginTime").focus();
      return;
    }
    var endTime = moment($("#infoBizEndTime").val(), "HH:mm");
    if(!endTime.isValid()){
      alert("매장 운영 종료시간이 올바르지 않습니다.");
      $("#infoBizEndTime").focus();
      return;
    }
    //validation end
    //update info start
    var parameters = {}, history = {id:"info"};
    if(beginTime.format("HHmm") !== (NMNS.info.bizBeginTime || "0900") || endTime.format("HHmm") !== (NMNS.info.bizEndTime || "2300")){
      history.hourStart = NMNS.info.bizBeginTime || "0900";
      history.hourEnd = NMNS.info.bizEndTime || "2300";
      parameters.bizBeginTime = beginTime.format("HHmm");
      parameters.bizEndTime = endTime.format("HHmm");
      NMNS.info.bizBeginTime = parameters.bizBeginTime || "0900";
      NMNS.info.bizEndTime = parameters.bizEndTime || "2300";
      NMNS.calendar.setOptions({week:{hourStart:(parameters.bizBeginTime?parseInt(parameters.bizBeginTime.substring(0,2)):NMNS.calendar.getOptions().week.hourStart), hourEnd:(parameters.bizEndTime?parseInt(parameters.bizEndTime.substring(0,2)):NMNS.calendar.getOptions().week.hourEnd)}});
    }
    if($("#infoShopName").val() !== (NMNS.info.shopName || "")){
      history.shopName = NMNS.info.shopName;
      parameters.shopName = $("#infoShopName").val();
      NMNS.info.shopName = parameters.shopName;
    }
    if($("#infoPassword").val() !== ""){
      parameters.password = $("#infoPassword").val();
    }
    if($("#infoBizType").val() !== (NMNS.info.bizType || "")){
      history.bizType = NMNS.info.bizType;
      parameters.bizType = $("#infoBizType").val();
      NMNS.info.bizType = parameters.bizType;
    }
    if(Object.keys(parameters).length){
      NMNS.socket.emit("update info", parameters);
    }
    //update info end
    //update manager start
    var diff = false;
    $(".infoManagerItem").each(function(){
      if($(this).hasClass("addManagerItem")){//추가
        diff = true;
        submitAddManager($(this).find("input[type='text']")[0]);
      }else{
        var input = $(this).find("input[type='text']");
        var manager = findManager(input.data("id"));
        if($(this).data("delete") && manager){//삭제
          diff = true;
          NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().remove(manager.id, function(item, target){return item.id === target;}));
          NMNS.history.push({id:manager.id, bgColor:manager.bgColor, borderColor:manager.borderColor, color:manager.color, name:manager.name});
          NMNS.socket.emit("delete manager", {id:manager.id});
        }else if(manager){
          if(input.data("color") !== manager.bgColor || input.val() !== manager.name){//수정
            diff = true;
            var color = input.data("color");
            NMNS.calendar.setCalendar(manager.id, {color:getColorFromBackgroundColor(color), bgColor:color, borderColor:color, name:input.val()}, true);
            NMNS.calendar.setCalendarColor(manager.id, {color:getColorFromBackgroundColor(color), bgColor:color, borderColor:color}, true);
            NMNS.history.push({id:manager.id, color:manager.bgColor, name:manager.name});
            NMNS.socket.emit("update manager", {id:manager.id, color:color, name:input.val()});
          }
        }
      }
    });
    if(diff){
      $("#lnbManagerList").html(generateLnbManagerList(NMNS.calendar.getCalendars()));
      refreshScheduleVisibility();
    }
    //update manager end
    if(diff || Object.keys(parameters).length){
      alert("변경된 정보를 전송하였습니다.");
    }else{
      alert("변경된 내역이 없습니다.");
    }
    $("#infoModal").modal("hide");
  }
  
  function refreshInfoModal(){
    $("#infoEmail").text(NMNS.email);
    $("#infoAuthStatus").html(generateAuthStatusBadge(NMNS.info.authStatus));
    $("#infoAccountStatus").html(generateAccountStatusBadge(NMNS.info.accountStatus));
    $("#infoShopName").val(NMNS.info.shopName);
    $("#infoBizType").val(NMNS.info.bizType);
    $("#infoManagerList").html(generateManagerList(NMNS.calendar.getCalendars()));
    $(".infoManagerItem .deleteManager").off("touch click").on("touch click", function(){
      var item = $(this).parents(".infoManagerItem");
      item.hide();
      item.attr("data-delete", "true");
    });
    $(".infoManagerItem .infoManagerColor").off("touch click").on("touch click", function(){
      $("#infoModalColorPicker").css("left", ($("#infoManagerList").position().left + $(this).position().left) + "px")
        .css("top", ($("#infoManagerList").position().top + $(this).position().top + 74) + "px")
        .data("target", $(this).next().data("id"))
        .show(300);
    });
  }
  
  function initInfoModal(){
    if(!NMNS.initedInfoModal){//first init
      NMNS.initedInfoModal = true;
    
      $("#infoBizBeginTimePicker").datetimepicker({
        format: "HH:mm",
        icons:{
          time: "fas fa-clock",
          up: "fas fa-chevron-up",
          down: "fas fa-chevron-down",
          close: "fas fa-times"
        },
        defaultDate: moment(NMNS.info.bizBeginTime || "0900", "HHmm"),
        date: moment(NMNS.info.bizBeginTime || "0900", "HHmm"),
        locale:"ko",
        viewMode: "times",
        buttons:{
          showClose:true
        },
        allowInputToggle:true,
        tooltips:{
          close:"닫기",
          pickHour:"시 선택",
          incrementHour:"시 증가",
          decrementHour:"시 감소",
          pickMinute:"분 선택",
          incrementMinute:"분 증가",
          decrementMinute:"분 감소"
        },
        stepping:10
      });
      $("#infoBizEndTimePicker").datetimepicker({
        format: "HH:mm",
        icons:{
          time: "fas fa-clock",
          up: "fas fa-chevron-up",
          down: "fas fa-chevron-down",
          close: "fas fa-times"
        },
        defaultDate: moment(NMNS.info.bizEndTime || "2300", "HHmm"),
        date: moment(NMNS.info.bizEndTime || "2300", "HHmm"),
        locale:"ko",
        viewMode: "times",
        buttons:{
          showClose:true
        },
        allowInputToggle:true,
        tooltips:{
          close:"닫기",
          pickHour:"시 선택",
          incrementHour:"시 증가",
          decrementHour:"시 감소",
          pickMinute:"분 선택",
          incrementMinute:"분 증가",
          decrementMinute:"분 감소"
        },
        stepping:10
      });
      if(!NMNS.infoModalScroll){
        NMNS.infoModalScroll = new PerfectScrollbar("#infoManagerList");
      } 

      $("#infoModalSave").off("touch click").on("touch click", submitInfoModal);
      $("#infoModalRefresh").off("touch click").on("touch click", refreshInfoModal);
      $("#infoModalColorPickerClose").off("touch click").on("touch click", function(){
        $("#infoModalColorPicker").hide(300);
      });
      $(".infoModalColor").off("touch click").on("touch click", function(){
        var colorPicker = $("#infoModalColorPicker");
        var target = $(".infoManagerItem input[data-id='"+colorPicker.data("target")+"']");
        if(target.length){
          target.data("color", $(this).attr("data-color"));
          target.prev().css("background-color", $(this).data("color")).css("border-color", $(this).data("color"));
        }
      });
    }
    refreshInfoModal();//setting data
  }

  function initNoShowModal(){
    if(!NMNS.initedNoShowModal){
      NMNS.initedNoShowModal = true;
      if(!NMNS.noShowModalSearchScroll){
        NMNS.noShowModalSearchScroll = new PerfectScrollbar("#noShowSearchList");
      }
      if(!NMNS.noShowModalScheduleScroll){
        NMNS.noShowModalScheduleScroll = new PerfectScrollbar("#noShowScheduleList");
      }
      $("#noShowSearchBtn").off("touch click").on("touch click", function(){
        if($("#noShowSearchContact").val() === ""){
          alert("검색할 전화번호를 입력해주세요!");
          return;
        }
        NMNS.socket.emit("get noshow", {contact:$("#noShowSearchContact").val(), mine:false});
      });
      $("#noShowScheduleSearch").off("touch click").on("touch click", function(){
        var parameters = {};
        if($("#noShowScheduleStartDate").val() !== ""){
          var start = moment($("#noShowScheduleStartDate").val(), "YYYY-MM-DD");
          if(!start.isValid()){
            alert("검색 시작일자가 올바르지 않아요. 다시 입력해주세요!");
            return;
          }
          parameters.start = start.format("YYYYMMDD");
        }
        if($("#noShowScheduleEndDate").val() !== ""){
          var end = moment($("#noShowScheduleEndDate").val(), "YYYY-MM-DD");
          if(!end.isValid()){
            alert("검색 끝일자가 올바르지 않아요. 다시 입력해주세요!");
            return;
          }
          parameters.end = end.format("YYYYMMDD");
        }
        if($("#noShowScheduleName").val() !== ""){
          parameters.name = $("#noShowScheduleName").val();
        }
        if($("#noShowScheduleContact").val() !== ""){
          parameters.contact = $("#noShowScheduleContact").val();
        }
        NMNS.socket.emit("get summary", parameters);
      });
      $("#noShowSearchAdd").off("touch click").on("touch click", function(){
        $("#noShowSearchList").append(
          "<div class='row px-0 col-12'><div class='col-4'><input type='text' class='form-control form-control-sm rounded-0' name='noShowContact'></div><div class='col-4'><input type='text' class='form-control form-control-sm rounded-0' name='noShowDate'></div><div class='col-1'></div><div class='col-2'><select class='form-control form-control-sm rounded-0' name='noShowType'><option value=''></option><option value='지각'>지각</option><option value='잠수'>잠수</option><option value='직전취소'>직전취소</option><option value='기타'>기타</option></select></div><div class='col-1'><i class='fas fa-check noShowSearchAddSubmit'></i><i class='fas fa-trash noShowSearchAddCancel'></i></div></div>"
        );
        $("#noShowSearchList div:last-child input:first-child").focus();
      });
      $("#noShowSearchContact").off("blur").on("blur", function(){
        $(this).val($(this).val().replace(/\D/g,''));
      });
    }
  }
  
  var resizeThrottled = tui.util.throttle(function() {
    NMNS.calendar.render();
  }, 50);
  
  function setEventListener() {
    $('.moveDate').on('touch click', onClickNavi);
    $('.calendarType').on('touch click', onClickMenu);
    $("#calendarTypeMenu").next().children("a").on("touch click", function(e){
      $("#calendarTypeMenu").html($(e.target).html());
      $("#calendarTypeMenu").attr("data-action", $(e.target).data("action"));
      $("#calendarTypeMenu").trigger("click");
    });
    $('#managerElements').on('change', onChangeManagers);

    $('#btn-save-schedule').on('touch click', onNewSchedule);

    $('#dropdownMenu-calendars-list').on('touch click', onChangeNewScheduleCalendar);
    $(".addReservLink").on("touch click", createNewSchedule);
    
    $("#infoLink").on("touch click", initInfoModal);
    $("#alrimLink").on("touch click", initAlrimModal);
    $(".addNoShowLink, .getNoShowLink").on("touch click", initNoShowModal);
    window.addEventListener('resize', resizeThrottled);
  }

  function getSchedule(start, end){
    NMNS.socket.emit("get reserv", {start:toYYYYMMDD(start._date) + "0000", end:toYYYYMMDD(end._date) + "2359"});
  }
  
  function drawSchedule(data){
    NMNS.calendar.createSchedules(data.map(function(schedule){//mapping server data to client data
      if(schedule.raw){
        if(typeof schedule.start === "string") schedule.start = moment(schedule.start, "YYYYMMDDHHmm").toDate();
        if(typeof schedule.end === "string") schedule.end = moment(schedule.end, "YYYYMMDDHHmm").toDate();
        return schedule;
      }
      var manager = findManager(schedule.manager || schedule.calendarId) || {};
      return {
        id:schedule.id,
        calendarId: manager.id || "A1",//schedule.manager,
        title:schedule.name || schedule.title,//?schedule.name:(schedule.contact?schedule.contact:schedule.content),
        start: (typeof schedule.start === "string"? moment(schedule.start, "YYYYMMDDHHmm").toDate() : schedule.start),
        end: (typeof schedule.end === "string"? moment(schedule.end, "YYYYMMDDHHmm").toDate() : schedule.end),
        isAllDay:schedule.isAllDay,
        category:(schedule.type === "T"?"task":(schedule.isAllday?"allday":"time")),
        dueDateClass:(schedule.type === "T"?"dueDateClass":""),
        attendees:[],
        recurrenceRule:false,
        isPending:schedule.isCanceled,
        isFocused:false,
        isVisible:true,
        isReadOnly:false,
        isPrivate:false,
        customStyle:"",
        location:"",
        bgColor: manager.bgColor || "#b2dfdb",
        borderColor: manager.borderColor || "#b2dfdb",
        color : manager.color || "#b2dfdb",
        dragBgColor: manager.bgColor || "#b2dfdb",
        raw:{
          contact:schedule.contact,
          contents:schedule.contents,
          etc:schedule.etc,
          status: schedule.status
        }
      };
    }), true);
  }

  function drawHoliday(holiday){
    holiday.forEach(function(item){
      if(NMNS.calendar.getViewName() === "month"){
        var dayname = $(".tui-full-calendar-near-month-day[data-date='"+item.date+"']");
        if(dayname.length){
          dayname.addClass("tui-full-calendar-holiday");
          dayname.find("div span").css("color", "#ff4040");
          var name = dayname.find(".tui-full-calendar-weekday-grid-date").parent();
          name.text(name.text() + " [" + item.title + "]");
        }
      }else{
        var dayname = $(".tui-full-calendar-dayname[data-date='"+item.date+"']");
        if(dayname.length){
          dayname.addClass("tui-full-calendar-holiday");
          dayname.children("span").css("color", "#ff4040");
          var name = dayname.find(".tui-full-calendar-dayname-name");
          name.text(name.text() + " [" + item.title + "]");
        }
      }
    });
  }
  
  function submitAddManager(self){
    var lnbManagerItem = $(self).parents(".addManagerItem");
    var name = lnbManagerItem.find("input[type='text']");
    if(!name.val() || name.val().length < 1){
      alert("담당자 이름을 입력해주세요.");
      return;
    }
    
    var id = NMNS.email + generateRandom();
    lnbManagerItem.attr("data-value", id);
    lnbManagerItem.removeClass("addManagerItem");
    lnbManagerItem.html("<label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'><span style='background-color:"+name.data("color")+"; border-color:"+name.data("color")+"'></span><small>"+name.val()+"</small></label>");
    var calendars = NMNS.calendar.getCalendars();
    calendars.push({
      id : id,
      checked : true,
      bgColor : name.data("color"),
      borderColor : name.data("color"),
      color : getColorFromBackgroundColor(name.data("color"))
    });
    NMNS.calendar.setCalendars(calendars);
    NMNS.socket.emit("add manager", {id: id, name:name.val(), color:name.data("color")});
  }
  
  function cancelAddManager(self){
    $(self).parents(".addManagerItem").remove();
  }
  
  window.cal = NMNS.calendar;

  setDropdownCalendarType();
  setRenderRangeText();
  setEventListener();

  NMNS.socket.on("add reserv", socketResponse("예약 추가하기", function(e){
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
  }, function(e){
    var origin = NMNS.history.find(function(history){return (history.id === e.data.id);});
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
    delete origin.id;
    NMNS.calendar.deleteSchedule(e.data.id, origin.manager);
  }));
  
  NMNS.socket.on("update reserv", socketResponse("예약정보 변경하기", function(e){
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
  }, function(e){
    var origin = NMNS.history.find(function(history){return (history.id === e.data.id);});
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
    if(origin.status === "DELETED"){
      drawSchedule([origin]);
      refreshScheduleVisibility();
    }else{
      if(typeof origin.start === "string") origin.start = moment(origin.start, "YYYYMMDDHHmm").toDate();
      if(typeof origin.end === "string") origin.end = moment(origin.end, "YYYYMMDDHHmm").toDate();
      NMNS.calendar.updateSchedule(e.data.id, origin.selectedCal? origin.selectedCal.id : origin.calendarId, origin);
    }
  }));
  
  NMNS.socket.on("add manager", socketResponse("담당자 추가하기", undefined, function(e){
    NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().filter(function(item){
      return item.id !== e.data.id;
    }));
    $(".lnbManagerItem[data-value='"+e.data.id+"']").remove();
  }));
  
  NMNS.socket.on("delete manager", socketResponse("담당자 삭제하기", function(e){
    NMNS.history.remove(e.data.id, function(item, target){return item.id === target});
  }, function(e){
    var manager = NMNS.history.find(function(item){return item.id === e.data.id});
    if(manager){
      var calendars = NMNS.calendar.getCalendars();
      calendars.push(manager);
      NMNS.calendar.setCalendars(NMNS.calendar.getCalendars());
      $("#lnbManagerList").html(generateLnbManagerList(calendars));
      refreshScheduleVisibility();
      NMNS.history.remove(e.data.id, function(item, target){return item.id === target});
    }
  }));
  
  NMNS.socket.on("update manager", socketResponse("담당자 변경하기", function(e){
    console.log(e);
    NMNS.history.remove(e.data.id, function(item, target){return item.id === target});
  }, function(e){
    var manager = NMNS.history.find(function(item){return item.id === e.data.id});
    if(manager){
      NMNS.calendar.setCalendar(e.data.id, manager);
      $("#lnbManagerList").html(generateLnbManagerList(NMNS.calendar.getCalendars()));
      refreshScheduleVisibility();
      NMNS.history.remove(e.data.id, function(item, target){return item.id === target});
    }
  }));
  
  NMNS.socket.on("update info", socketResponse("매장 정보 변경하기", function(){
    NMNS.history.remove("info", function(item, target){return item.id === target});
  }, function(e){
    var history = NMNS.history.find(function(item){return item.id === "info"});
    if(history.bizBeginTime || history.bizEndTime){
      NMNS.calendar.setOptions({week:{hourStart:history.bizBeginTime?history.bizBeginTime.substring(0, 2):NMNS.info.bizBeginTime.substring(0,2), hourEnd : history.bizEndTime?history.bizEndTime.substring(0,2):NMNS.info.bizEndTime.substring(0,2)}});
    }
    NMNS.info.shopName = history.shopName || NMNS.info.shopName;
    NMNS.info.bizType = history.bizType;
    NMNS.history.remove("info", function(item, target){return item.id === target});
    NMNS.initedInfoModal = false;
  }));
  
  NMNS.socket.on("update alrim", socketResponse("알림톡 정보 변경하기", function(){
    NMNS.history.remove("alrimInfo", function(item, target){return item.id === target});
  }, function(){
    var history = NMNS.history.find(function(item){return item.id === "alrimInfo"});
    Object.keys(history).forEach(function(key){
      NMNS.info.alrimTalkInfo[key] = history[key];
    });
    NMNS.history.remove("alrimInfo", function(item, target){return item.id === target});
    NMNS.initedAlrimModal = false;
  }));

  NMNS.socket.on("get noshow", socketResponse("노쇼 정보 가져오기", function(e){
    var html = "";
    e.data.forEach(function(item){
      var badge = "";
      e.data.noShowCaseList.forEach(function(item2){
        badge += "<span class='badge badge-light'>" + item2 + "</span>";
      });
      html += "<div class='row col-12 px-0'><span class='col-4'>"+item.contact+"</span><span class='col-4'>"+item.lastNoShowDate+"</span><span class='col-1'>"+item.noShowCount+"</span><span class='col-2'>"+badge+"</span><span class='col-1'>"+item.isMine?"<i class='fas fa-trash' title='삭제'></i>":""+"</span></div>";
    });
    $("#noShowSearchList").html(html);
  }));

  NMNS.socket.on("get summary", socketResponse("예약정보 가져오기", function(e){
   var html = "";
   e.data.forEach(function(item){
     html += "<div class='row col-12 px-0' data-id='"+item.id+"' data-manager='"+item.manager+"'" + item.contents?" title='"+item.contents+"'":""+"><span class='col-4'>"+moment(item.start, "YYYYMMDDHHmm").format("YYYY-MM-DD")+"</span><span class='col-3'>"+item.name+"</span><span class='col-4'>"+item.contact+"</span><span class='col-1'>"+generateScheduleStatusBadge(item.status)+"</span></div>";
   });
   $("#noShowScheduleList").html(html);
  }));

  NMNS.colorTemplate = ["#b2dfdb", "#757575", "#009688", "#303f9f", "#cc333f", "#eb6841", "#edc951", "#555555", "#94c7b6", "#b2d379", "#c5b085", "#f4a983", "#c2b3e0", "#ccccc8", "#673ab7", "#ffba00", "#a3e400", "#228dff", "#9c00ff", "#ff5722", "#000000"];
  
  $("#infoModal").on("hide.bs.modal", function(){
    if(document.activeElement.tagName === "INPUT"){
      return false;
    }
    var changed = false;
    
    if(moment($("#infoBizBeginTime").val(), "HH:mm").format("HHmm") !== (NMNS.info.bizBeginTime || "0900")){
      changed = true;
    }
    if(!changed && moment($("#infoBizEndTime").val(), "HH:mm").format("HHmm") !== (NMNS.info.bizEndTime || "2300")){
      changed = true;
    }
    if(!changed && $("#infoShopName").val() !== (NMNS.info.shopName || "")){
      changed = true;
    }
    if(!changed && $("#infoPassword").val() !== ""){
      changed = true;
    }
    if(!changed && $("#infoBizType").val() !== (NMNS.info.bizType || "")){
      changed = true;
    }
    if(!changed){
      $(".infoManagerItem").each(function(){
        if(!changed){
          if($(this).hasClass("addManagerItem")){//추가
            changed = true;
          }else{
            var input = $(this).find("input[type='text']");
            var manager = findManager(input.data("id"));
            if($(this).data("delete") && manager){//삭제
              changed = true;
            }else if(manager){
              if(input.data("color") !== manager.bgColor || input.val() !== manager.name){//수정
                changed = true;
              }
            }
          }
        }
      });
    }
    if(changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")){
      return false;
    }
  });
  $("#infoModal").on("shown.bs.modal", function(){
    if(NMNS.infoModalScroll){
      NMNS.infoModalScroll.update();
    }
  });
  $("#infoModal").on("touch click", function(e){
    if($("#infoModalColorPicker").is(":visible")){
      var target = $(e.target);
      if(!target.parents("#infoModalColorPicker").length && !target.hasClass("infoManagerColor") && !target.hasClass("tui-full-calendar-checkbox-round") && !target.parents(".infoManagerColor").length && !target.parents(".tui-full-calendar-checkbox-round").length){
        $("#infoModalColorPicker").hide(300);
      }
    }
  });
  $("#alrimModal").on("hide.bs.modal", function(){
    if(document.activeElement.tagName === "INPUT"){
      return false;
    }
    var changed = false;
    if(($("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "Y") || (!$("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "N")){
      changed = true;
    }
    if(!changed && $("#alrimCallbackPhone").val() !== (NMNS.info.alrimTalkInfo.callbackPhone || "")){
      changed = true;
    }
    if(!changed && $("#alrimCancelDue").val() !== (NMNS.info.alrimTalkInfo.cancelDue || "")){
      changed = true;
    }
    if(!changed && $("#alrimNotice").val() !== (NMNS.info.alrimTalkInfo.notice || "")){
      changed = true;
    }
    if(changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")){
      return false;
    }
  });
})(jQuery);