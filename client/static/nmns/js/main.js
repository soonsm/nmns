/*global jQuery, location, moment, tui, NMNS, io*/
(function($) {
  NMNS.needInit = true;
  NMNS.history = [];
  NMNS.colorTemplate = ["#b2dfdb", "#757575", "#009688", "#303f9f", "#cc333f", "#eb6841", "#edc951", "#555555", "#94c7b6", "#b2d379", "#c5b085", "#f4a983", "#c2b3e0", "#ccccc8", "#673ab7", "#ffba00", "#a3e400", "#228dff", "#9c00ff", "#ff5722", "#000000"];
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

  //calendars init
  NMNS.calendar = new tui.Calendar("#mainCalendar", {
    taskView:["task"],
    defaultView:$(window).width() > 550? "week" : "day",
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
        var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'h:mm a';

        if (isAllDay) {
            return startDate.format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + endDate.format('YYYY.MM.DD'));
        }

        return (startDate.format('YYYY.MM.DD h:mm a') + ' - ' + endDate.format(endFormat));
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
      "common.border": ".07rem solid #e5e5e5",
      "common.saturday.color": "#304ffe",
      "week.timegridOneHour.height":"68px",
      "week.timegridHalfHour.height":"34px"
    }
  });

  NMNS.calendar.on({
    beforeCreateSchedule:function(e){
      saveNewSchedule(e);
    },
    beforeUpdateSchedule:function(e){
      var history = e.history || $.extend(true, {}, e.schedule);
      NMNS.history.push(history);
      e.schedule.start = e.start || e.schedule.start;
      e.schedule.end = e.end || e.schedule.end;
      e.schedule.raw.status = e.schedule.status || e.schedule.raw.status;

      if(e.history && e.history.selectedCal.id !== e.schedule.calendarId){//manager changed
        NMNS.calendar.deleteSchedule(e.schedule.id, e.history.selectedCal.id, true);
        e.schedule.category =  e.schedule.isAllDay ? 'allday' : 'time';
        e.schedule.dueDateClass = '';
        NMNS.calendar.createSchedules([e.schedule]);
        e.history.newCalendarId = e.schedule.calendarId;
      }else{
        NMNS.calendar.updateSchedule(e.schedule.id, e.history? e.history.selectedCal.id : e.schedule.calendarId, e.schedule);
      }
      
      NMNS.socket.emit("update reserv", {
        id: e.schedule.id,
        start:moment(e.schedule.start.toDate? e.schedule.start.toDate(): e.schedule.start).format("YYYYMMDDHHmm"),
        end:moment(e.schedule.end.toDate? e.schedule.end.toDate() : e.schedule.end).format("YYYYMMDDHHmm"),
        manager: e.schedule.calendarId,
        name: e.schedule.title,
        contact: e.schedule.contact || e.schedule.raw.contact,
        contents: e.schedule.contents || e.schedule.raw.contents,
        etc: e.schedule.etc || e.schedule.raw.etc,
        status: e.schedule.status || e.schedule.raw.status,
        isAllDay: e.schedule.isAllDay
      });
    },
    beforeDeleteSchedule:function(e){
      NMNS.history.push(e.schedule);
      NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
      e.schedule.status = "DELETED";
      NMNS.socket.emit("update reserv", e.schedule);
    },
    afterRenderSchedule:function(e){
      if(NMNS.calendar.getViewName() !== "month"){
        $("#mainCalendar").height(($(".tui-full-calendar-layout").height())+ "px");
      }
    }
  });

//common websocket response wrapper
  var socketResponse = function(requestName, successCallback, failCallback, silent){
    return function(res){
      if(res && res.type === "response"){
        if(res.status){//success
          if(successCallback){
            successCallback(res);
          }
        }else{//fail
          if(!silent){
            alert(requestName + "에 실패했습니다." + (res.message?"(" + res.message + ")":""));
          }
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
  NMNS.socket.emit("get info");
  NMNS.socket.emit("get manager");
  
  NMNS.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e){
    console.log(e);
    drawSchedule(e.data);
    NMNS.holiday = e.holiday;
    refreshScheduleVisibility();
  }));

  NMNS.socket.on("get info", socketResponse("매장 정보 받아오기", function(e){
    console.log(e);
    NMNS.info = e.data;
    if(NMNS.calendar){
      NMNS.calendar.setOptions({week:{hourStart:(NMNS.info.bizBeginTime?parseInt(NMNS.info.bizBeginTime.substring(0,2)):9), hourEnd:(NMNS.info.bizEndTime?parseInt(NMNS.info.bizEndTime.substring(0,2)):23)}});
    }
    NMNS.email = e.data.email || NMNS.email;
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
  
//business specific functions about calendar start
  function getTimeSchedule(schedule, isAllDay){
    var html = "";
    if (!isAllDay) {
      html+="<strong>" + moment(schedule.start.toDate()).format("HH:mm") + "</strong> ";
    }else{
      html+="<span class='calendar-font-icon far fa-clock'></span> ";
    }
    switch(schedule.raw.status){
      case "CANCELED":
        html += "<span class='fas fa-ban'></span>";
        break;
      case "NOSHOW":
        html += "<span class='fas fa-exclamation-triangle'></span>";
        break;
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

  }

  function createNewSchedule(event) {
    var start = event.start ? new Date(event.start.getTime()) : new Date();
    var end = event.end ? new Date(event.end.getTime()) : moment().add(1, 'hours').toDate();
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
    $(".calendarType").removeClass("active");
    
    switch(NMNS.calendar.getViewName()){
      case "day":
        $("#calendarTypeMenu").html($(".calendarType[data-action='toggle-daily']").addClass("active").html());
        break;
      case "week":
        $("#calendarTypeMenu").html($(".calendarType[data-action='toggle-weekly']").addClass("active").html());
        break;
      default:
        $("#calendarTypeMenu").html($(".calendarType[data-action='toggle-monthly']").addClass("active").html());
        break;
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
//business specific functions about calendar end
//business specific functions about general features start
  function generateAuthStatusBadge(authStatus){
    switch(authStatus){
      case "BEFORE_EMAIL_VERIFICATION":
        return "<span class='badge badge-danger' title='인증메일 보내기' style='cursor:pointer;'>이메일 미인증</span><span class='btn btn-sm btn-flat btn-secondary ml-2'>인증메일 보내기</span>";
      case "EMAIL_VERIFICATED":
        return "<span class='badge badge-success'>인증</span>";
    }
    $("#infoAccountStatus").removeClass("pl-2");//no auth status badge
    return "";
  }

  function generateScheduleStatusBadge(scheduleStatus){
    switch(scheduleStatus){
      case "RESERVED":
        return "<span class='badge badge-success' title='바꾸기'>정상 </span><span class='btn btn-sm btn-light noShowScheduleNoShow' title='노쇼처리'><i class='fas fa-exclamation-triangle'></i><span class='d-none d-lg-inline-block'> 노쇼처리</span></span>";
      case "CANCELED":
        return "<span class='badge badge-secondary' title='바꾸기'>취소 </span><span class='btn btn-sm btn-light noShowScheduleNoShow' title='노쇼처리'><i class='fas fa-exclamation-triangle'></i><span class='d-none d-lg-inline-block'> 노쇼처리</span></span>";
      case "NOSHOW":
        return "<span class='badge badge-danger' title='바꾸기'>노쇼 </span><span class='btn btn-sm btn-light noShowScheduleNormal' title='되돌리기'><i class='fas fa-undo'></i><span class='d-none d-lg-inline-block'> 되돌리기</span></span>";
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
        filterNonNumericCharacter($(this));
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
      NMNS.socket.emit("update password", {password: $("#infoPassword").val()});
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
    $("#infoAuthStatus").html(NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION"? $(generateAuthStatusBadge(NMNS.info.authStatus)).on("touch click", function(){
      NMNS.socket.emit("send verification", {});
      alert("인증메일을 보냈습니다. 도착한 이메일을 확인해주세요!");
    }) : generateAuthStatusBadge(NMNS.info.authStatus));
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

  function submitNoShowEtcReason(dropdownItem){
    var input = dropdownItem.children("input");
    var dropdown = dropdownItem.parent();
    NMNS.history.push({id:dropdown.data("id"), calendarId:dropdown.data("manager"), status:"NOSHOW"});
    NMNS.calendar.updateSchedule(dropdown.data("id"), dropdown.data("manager"), {raw:{status:"NOSHOW"}});
    console.log("data", {id:dropdown.data("id"), status:"NOSHOW", noShowCase:input.val()});
    NMNS.socket.emit("update reserv", {id:dropdown.data("id"), status:"NOSHOW", noShowCase:input.val()});
    var row = $("#noShowScheduleList .row[data-id='"+dropdown.data("id")+"']");
    row.children("span:last-child").html($(generateScheduleStatusBadge("NOSHOW")));
    row.find(".badge, .noShowScheduleNoShow").each(function(){
      $(this).on("touch click", function(e){
        e.stopPropagation();
        noShowScheduleBadge($(this));
      });
    });
    row.find(".noShowScheduleNormal").on("touch click", function(e){
      e.stopPropagation();
      noShowScheduleNormal($(this));
    });
    dropdown.hide(300);
  }

  function initNoShowModal(){
    if(!NMNS.initedNoShowModal){
      NMNS.initedNoShowModal = true;
      var datetimepickerOption = {
        format: "YYYY-MM-DD",
        icons:{
          previous: "fas fa-chevron-left",
          next: "fas fa-chevron-right",
          date: "far fa-calendar",
          close: "fas fa-times"
        },
        dayViewHeaderFormat:"YYYY년 M월",
        defaultDate: moment(new Date()),
        date: moment(new Date()),
        locale:"ko",
        viewMode: "days",
        buttons:{
          showClose:true
        },debug:true,
        allowInputToggle:true,
        tooltips:{
          close:"닫기",
          selectMonth:"월 선택",
          prevMonth:"전달",
          nextMonth:"다음달",
          selectYear:"연도 선택",
          prevYear:"작년",
          nextYear:"내년",
          selectDecade:"",
          prevDecade:"이전",
          nextDecade:"다음",
          prevCentury:"이전",
          nextCentury:"다음"
        }
      };
      
      if(!NMNS.noShowModalSearchScroll){
        NMNS.noShowModalSearchScroll = new PerfectScrollbar("#noShowSearchList", {suppressScrollX:true});
      }
      if(!NMNS.noShowModalScheduleScroll){
        NMNS.noShowModalScheduleScroll = new PerfectScrollbar("#noShowScheduleList", {suppressScrollX:true});
      }
      
      $(".noShowAddCase").off("touch click").on("touch click", function(){
        $(".noShowAddCase").not($(this)).removeClass("badge-danger").addClass("badge-light");
        if($(this).removeClass("badge-light").addClass("badge-danger").is("#noShowAddCaseEtc")){
          $(this).next().removeAttr("disabled");
        }else{
          $(this).siblings("input").attr("disabled", "disabled");
        }
      });
      $("#noShowAddBtn").off("touch click").on("touch click", function(){
        if($("#noShowAddContact").val() === ""){
          alert("저장할 전화번호를 입력해주세요!");
          return;
        }
        var noShowCase = $("#noShowAddContent .badge-danger").is("#noShowAddCaseEtc")?$("#noShowAddContent input").val() : $("#noShowAddContent .badge-danger").data("value");
        NMNS.socket.emit("add noshow", {id: NMNS.email + generateRandom(), contact:$("#noShowAddContact").val(), noShowCase:noShowCase});
      });
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
        $("#noShowScheduleList").html("");//깜빡임 효과
        NMNS.socket.emit("get summary", parameters);
      });
      $("#noShowSearchAdd").off("touch click").on("touch click", function(){
        var id=generateRandom();
        var newRow = $("<div class='row px-0 col-12 mt-1 noShowSearchAdd' data-id='"+id+"'><div class='col-4 pr-0'><input type='text' class='form-control form-control-sm rounded-0' name='noShowSearchAddContact' placeholder='고객 전화번호'></div><div id='noShowSearchAddDatePicker"+id+"' class='col-4 input-group input-group-sm pr-0' data-target-input='nearest'><div class='input-group-prepend'><i id='noShowSearchAddDateIcon"+id+"' class='input-group-text far fa-calendar rounded-0' data-target='#noShowSearchAddDatePicker"+id+"' data-toggle='datetimepicker'></i></div><input id='noShowSearchAddDate"+id+"' type='text' class='form-control form-control-sm rounded-0 datetimepicker-input' name='noShowSearchAddDate' aria-describedby='noShowSearchAddDateIcon"+id+"' data-target='#noShowSearchAddDatePicker"+id+"'></div><div class='col-3'><select class='form-control form-control-sm rounded-0' name='noShowType'><option value='지각'>지각</option><option value='잠수' selected='selected'>잠수</option><option value='직전취소'>직전취소</option><option value='기타'>기타</option></select></div><div class='col-1 px-0'><i class='fas fa-check noShowSearchAddSubmit align-middle'></i>  <i class='fas fa-trash noShowSearchAddCancel align-middle ml-lg-2 ml-md-1'></i></div></div>");
        newRow.find("#noShowSearchAddDatePicker"+id).datetimepicker(datetimepickerOption);
        newRow.find("input[name='noShowSearchAddContact']").off("blur").on("blur", function(){
          filterNonNumericCharacter($(this));
        });
        newRow.find(".noShowSearchAddSubmit").off("touch click").on("touch click", function(){
          submitAddNoShow($(this));
        });
        newRow.find(".noShowSearchAddCancel").off("touch click").on("touch click", function(){
          cancelAddNoShow($(this));
        });
        if($("#noShowSearchList .empty").length){
          $("#noShowSearchList").html(newRow);
        }else{
          $("#noShowSearchList").append(newRow);
        }
        newRow.find("div:first-child input").focus();
      });
      $("#noShowSearchContact, #noShowAddContact, #noShowScheduleContact").off("blur").on("blur", function(){
        filterNonNumericCharacter($(this));
      });
      $("#noShowSearchContact").on("keyup", function(e){
        if(e.which === 13){
          $("#noShowSearchBtn").trigger("click");
        }
      });
      $("#noShowAddContact").on("keyup", function(e){
        if(e.which === 13){
          $("#noShowAddBtn").trigger("click");
        }
      });
      $("#noShowScheduleStartDatePicker").datetimepicker(datetimepickerOption);
      $("#noShowScheduleStartDatePicker").data("datetimepicker").date(moment().subtract(1, "months").toDate());
      $("#noShowScheduleEndDatePicker").datetimepicker(datetimepickerOption);
      $("#noShowScheduleEndDatePicker").data("datetimepicker").date(moment().add(1, "months").toDate());
      $("#noShowScheduleContact").off("blur").on("blur", function(){
        filterNonNumericCharacter($(this));
      });
      $("#noShowScheduleContact").off("keyup").on("keyup", function(e){
        if(e.which === 13){
          $("#noShowScheduleSearch").trigger("click");
        }
      });
      $("#noShowScheduleDropdown .dropdown-item:not(:last-child)").off("touch click").on("touch click", function(){
        var dropdown = $(this).parent();
        NMNS.history.push({id:dropdown.data("id"), calendarId:dropdown.data("manager"), raw:{status:dropdown.data("status")}});
        NMNS.calendar.updateSchedule(dropdown.data("id"), dropdown.data("manager"), {raw:{status:$(this).data("status")}});
        NMNS.socket.emit("update reserv", {id:dropdown.data("id"), status:$(this).data("status"), noShowCase:$(this).data("type")});
        var row = $("#noShowScheduleList .row[data-id='"+dropdown.data("id")+"']");
        row.children("span:last-child").html($(generateScheduleStatusBadge($(this).data("status"))));
        row.find(".badge, .noShowScheduleNoShow").each(function(){
          $(this).on("touch click", function(e){
            e.stopPropagation();
            noShowScheduleBadge($(this));
          });
        });
        row.find(".noShowScheduleNormal").on("touch click", function(e){
          e.stopPropagation();
          noShowScheduleNormal($(this));
        });
        dropdown.hide(300);
      });
      $("#noShowScheduleDropdown .noShowScheduleCheck").off("touch click").on("touch click", function(){
        submitNoShowEtcReason($(this).parent());
      });
      $("#noShowScheduleDropdown .dropdown-item-etc input").off("keyup").on("keyup", function(e){
        switch (e.which){
          case 13:
            submitNoShowEtcReason($(this).parent());
            break;
          case 27:
            $(this).parent().parent().hide(300);
            break;
        }
      });
      
      $("#noShowAddContact").autocomplete({
        serviceUrl: "get customer info",
        paramName: "contact",
        zIndex: 1060,
        maxHeight: 150,
        triggerSelectOnValidInput: false,
        transformResult: function(response, originalQuery){
          response.forEach(function(item){
            item.data = item.name;
            item.value = item.contact;
            delete item.contact;
            delete item.name;
          });
          return {suggestions: response};
        },
        onSearchComplete : function(){},
        formatResult: function(suggestion, currentValue){
          return suggestion.value + " (" + dashContact(suggestion.data) + ")";
        },
        onSearchError: function(){},
        onSelect: function(suggestion){},
        beforeRender: function(container){
          if($(container).data("scroll")){
            $(container).data("scroll").update();
          }else{
            $(container).data("scroll", new PerfectScrollbar(".autocomplete-suggestions"));
          }
        }
      }, NMNS.socket);
      
      $("#noShowSearchContact").autocomplete({
        serviceUrl: "get customer info",
        paramName: "contact",
        zIndex: 1060,
        maxHeight: 150,
        triggerSelectOnValidInput: false,
        transformResult: function(response, originalQuery){
          response.forEach(function(item){
            item.data = item.name;
            item.value = item.contact;
            delete item.contact;
            delete item.name;
          });
          return {suggestions: response};
        },
        onSearchComplete : function(){},
        formatResult: function(suggestion, currentValue){
          return suggestion.value + " (" + dashContact(suggestion.data) + ")";
        },
        onSearchError: function(){},
        onSelect: function(suggestion){},
        beforeRender: function(container){
          if($(container).data("scroll")){
            $(container).data("scroll").update();
          }else{
            $(container).data("scroll", new PerfectScrollbar(".autocomplete-suggestions"));
          }
        }
      }, NMNS.socket);
      
      $("#noShowScheduleName").autocomplete({
        serviceUrl: "get customer info",
        paramName: "name",
        zIndex: 1060,
        maxHeight: 150,
        triggerSelectOnValidInput: false,
        transformResult: function(response, originalQuery){
          response.forEach(function(item){
            item.data = item.contact;
            item.value = item.name;
            delete item.contact;
            delete item.name;
          });
          return {suggestions: response};
        },
        onSearchComplete : function(){},
        formatResult: function(suggestion, currentValue){
          return suggestion.value + " (" + dashContact(suggestion.data) + ")";
        },
        onSearchError: function(){},
        onSelect: function(suggestion){
          $("#noShowScheduleContact").val(suggestion.data);
        },
        beforeRender: function(container){
          if($(container).data("scroll")){
            $(container).data("scroll").update();
          }else{
            $(container).data("scroll", new PerfectScrollbar(".autocomplete-suggestions"));
          }
        }
      }, NMNS.socket);
      $("#noShowScheduleContact").autocomplete({
        serviceUrl: "get customer info",
        paramName: "contact",
        zIndex: 1060,
        maxHeight: 150,
        triggerSelectOnValidInput: false,
        transformResult: function(response, originalQuery){
          response.forEach(function(item){
            item.data = item.name;
            item.value = item.contact;
            delete item.contact;
            delete item.name;
          });
          return {suggestions: response};
        },
        onSearchComplete : function(){},
        formatResult: function(suggestion, currentValue){
          return suggestion.value + " (" + dashContact(suggestion.data) + ")";
        },
        onSearchError: function(){},
        onSelect: function(suggestion){
          $("#noShowScheduleName").val(suggestion.data);
        },
        beforeRender: function(container){
          if($(container).data("scroll")){
            $(container).data("scroll").update();
          }else{
            $(container).data("scroll", new PerfectScrollbar(".autocomplete-suggestions"));
          }
        }
      }, NMNS.socket);
    }else{
      $("#noShowAddContact").autocomplete().clearCache();
      $("#noShowSearchContact").autocomplete().clearCache();
      $("#noShowScheduleName").autocomplete().clearCache();
      $("#noShowScheduleContact").autocomplete().clearCache();
    }
  }
  
  function setEventListener() {
    $('.moveDate').on('touch click', onClickNavi);
    $('.calendarType').on('touch click', onClickMenu);
    $("#calendarTypeMenu").next().children("a").on("touch click", function(e){
      $("#calendarTypeMenu").html($(e.target).html());
      $("#calendarTypeMenu").attr("data-action", $(e.target).data("action"));
      $("#calendarTypeMenu").trigger("click");
    });
    $('#managerElements').on('change', onChangeManagers);

    $('#dropdownMenu-calendars-list').on('touch click', onChangeNewScheduleCalendar);
    $(".addReservLink").on("touch click", createNewSchedule);
    
    $("#infoLink").on("touch click", initInfoModal);
    $("#alrimLink").on("touch click", initAlrimModal);
    $(".addNoShowLink, .getNoShowLink").on("touch click", initNoShowModal);
    var resizeThrottled = tui.util.throttle(function() {
      NMNS.calendar.render();
    }, 50);
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
        color : manager.color || getColorFromBackgroundColor("#b2dfdb"),
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
  function noShowScheduleBadge(self){
    console.log(self);
    var row = self.parentsUntil("#noShowScheduleList", ".row");
     $("#noShowScheduleDropdown")
      .data("id", row.data("id"))
      .data("manager", row.data("manager"))
      .data("status", row.data("status"))
      .css("top", (self[0].getBoundingClientRect().top - $("#noShowSchedule")[0].getBoundingClientRect().top + self.height() + 3) + "px")
      .css("right", (self[0].getBoundingClientRect().right - $("#noShowSchedule")[0].getBoundingClientRect().right)<-20?"1rem":(self[0].getBoundingClientRect().right - $("#noShowSchedule")[0].getBoundingClientRect().right) + "px")
      .show();
  }
  
  function submitAddNoShow(self){
    var row = self.parentsUntil("#noShowSearchList", ".row");
    if(row.find("input[name='noShowSearchAddContact']").val() === ""){
      alert("전화번호를 입력해주세요!");
      row.find("input[name='noShowSearchAddContact']").focus();
      return;
    }
    if(!moment(row.find("input[name='noShowSearchAddDate']").val(), "YYYY-MM-DD").isValid()){
      alert("노쇼 날짜를 알맞게 입력해주세요!");
      row.find("input[name='noShowSearchAddDate']").focus();
      return;
    }
    var parameters = {id:row.data("id"), contact:row.find("input[name='noShowSearchAddContact']").val(), date:moment(row.find("input[name='noShowSearchAddDate']").val(), "YYYY-MM-DD").format("YYYYMMDD"), noShowCase:row.find("select").val()};
    NMNS.socket.emit("add noshow", parameters);
    self.off("touch click").on("touch click", function(){
      alert("저장 요청중입니다..!");
    });
  }
  
  function deleteNoShow(self){
    var row = self.parentsUntil("#noShowSearchList", ".row");
    NMNS.history.push({id: row.data("id"), contact: row.data("contact"), date: row.data("date"), noShowCase: row.data("noshowcase")});
    NMNS.socket.emit("delete noshow", {id: row.data("id")});
    row.remove();
  }
  
  function cancelAddNoShow(self){
    self.parentsUntil("#noShowSearchList", ".row").remove();
    if($("#noShowSearchList").html() === ""){
      $("#noShowSearchList").html("<div class='row col-12 px-0 mt-2 empty'><span class='col-12 text-center'>전화번호로 검색하거나 아래 버튼을 눌러<br/>노쇼를 직접 추가해보세요!</span></div>");
    }
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
  
  var noShowScheduleNormal = function(self){
    var row = self.parentsUntil("#noShowScheduleList", ".row");
    NMNS.history.push({id:row.data("id"), calendarId:row.data("manager"), raw:{status:row.data("status")}});
    NMNS.calendar.updateSchedule(row.data("id"), row.data("manager"), {raw:{status:"RESERVED"}});
    NMNS.socket.emit("update reserv", {id:row.data("id"), status:"RESERVED"});
    row.children("span:last-child").html($(generateScheduleStatusBadge("RESERVED"))).on("touch click", function(){
      noShowScheduleBadge($(this));
    });
  };
//business specific functions about general features end
//after calendar initialization start
  setDropdownCalendarType();
  setRenderRangeText();
  setEventListener();
//after calendar initialization end
//websocket response start
  NMNS.socket.on("get summary", socketResponse("예약정보 가져오기", function(e){
    var html = "";
    if(e.data.length===0){
     html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>검색된 내용이 없습니다. 검색조건을 바꿔서 검색해보세요 :)</span></div>";
    }else{
     e.data.forEach(function(item){
       html += "<div class='row col-12 px-0 mt-1' data-id='"+(item.id||"")+"' data-manager='"+(item.manager||"")+"' data-status='" + (item.status||"") + "'" + (item.contents?(" title='"+item.contents+"'"):"")+"><span class='col-3 col-lg-2 pr-0'>"+(item.start?moment(item.start, "YYYYMMDDHHmm").format("YYYY-MM-DD"):"")+"</span><span class='col-4 col-lg-3'>"+(item.name||"")+"</span><span class='col-3 col-lg-2 px-0'>"+dashContact(item.contact)+"</span><span class='col-3 d-none d-lg-inline-flex'>"+(item.contents||"")+"</span><span class='col-2 px-0'>"+generateScheduleStatusBadge(item.status)+"</span></div>";
     });
    }
    $("#noShowScheduleList").html(html);
    $("#noShowScheduleList .badge, #noShowScheduleList .noShowScheduleNoShow").each(function(){
     $(this).off("touch click").on("touch click", function(e){
       e.stopPropagation();
       noShowScheduleBadge($(this));
     });
    });
    $("#noShowScheduleList .noShowScheduleNormal").off("touch click").on("touch click", function(e){
      e.stopPropagation();
      noShowScheduleNormal($(this));
    });
    if(NMNS.noShowModalScheduleScroll){
      NMNS.noShowModalScheduleScroll.update();
    }
  }));

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
    if((origin.status || origin.raw.status) === "DELETED"){
      drawSchedule([origin]);
      refreshScheduleVisibility();
    }else{
      if(origin.newCalendarId && !NMNS.calendar.getSchedule(e.data.id, origin.selectedCal? origin.selectedCal.id : origin.calendarId)){//calendar id changed
        NMNS.calendar.deleteSchedule(e.data.id, origin.newCalendarId, true);
        origin.category =  origin.isAllDay ? 'allday' : 'time';
        origin.dueDateClass = '';
        origin.calendarId = origin.selectedCal.id;
        origin.start = (typeof origin.start === "string"?moment(origin.start, "YYYYMMDDHHmm").toDate():origin.start);
        origin.end = (typeof origin.end === "string"?moment(origin.end, "YYYYMMDDHHmm").toDate():origin.end);
        origin.color = origin.color || origin.selectedCal.color;
        origin.bgColor = origin.bgColor || origin.selectedCal.bgColor;
        origin.borderColor = origin.borderColor || origin.selectedCal.borderColor;
        NMNS.calendar.createSchedules([origin]);
      }else{
        if(typeof origin.start === "string") origin.start = moment(origin.start, "YYYYMMDDHHmm").toDate();
        if(typeof origin.end === "string") origin.end = moment(origin.end, "YYYYMMDDHHmm").toDate();
        NMNS.calendar.updateSchedule(e.data.id, origin.selectedCal? origin.selectedCal.id : origin.calendarId, origin);
      }
    }
    if($("#noShowScheduleList").is(":visible") && $("#noShowScheduleList .row[data-id='"+e.data.id+"']").length){//예약으로 추가 모달
      var row = $("#noShowScheduleList .row[data-id='"+e.data.id+"']");
      row.children("span:last-child").html($(generateScheduleStatusBadge(origin.status || origin.raw.status)));
      row.find(".badge, .noShowScheduleNoShow").each(function(){
        $(this).on("touch click", function(e){
          e.stopPropagation();
          noShowScheduleBadge($(this));
        });
      });
      row.find(".noShowScheduleNormal").on("touch click", function(e){
        e.stopPropagation();
        noShowScheduleNormal($(this));
      });
    }
  }));
  
  NMNS.socket.on("add manager", socketResponse("담당자 추가하기", undefined, function(e){
    NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().filter(function(item){
      return item.id !== e.data.id;
    }));
    $(".lnbManagerItem[data-value='"+e.data.id+"']").remove();
  }));
  
  NMNS.socket.on("delete manager", socketResponse("담당자 삭제하기", function(e){
    NMNS.history.remove(e.data.id, findById);
  }, function(e){
    var manager = NMNS.history.find(function(item){return item.id === e.data.id});
    if(manager){
      var calendars = NMNS.calendar.getCalendars();
      calendars.push(manager);
      NMNS.calendar.setCalendars(NMNS.calendar.getCalendars());
      $("#lnbManagerList").html(generateLnbManagerList(calendars));
      refreshScheduleVisibility();
      NMNS.history.remove(e.data.id, findById);
    }
  }));
  
  NMNS.socket.on("update manager", socketResponse("담당자 변경하기", function(e){
    console.log(e);
    NMNS.history.remove(e.data.id, findById);
  }, function(e){
    var manager = NMNS.history.find(function(item){return item.id === e.data.id});
    if(manager){
      NMNS.calendar.setCalendar(e.data.id, manager);
      $("#lnbManagerList").html(generateLnbManagerList(NMNS.calendar.getCalendars()));
      refreshScheduleVisibility();
      NMNS.history.remove(e.data.id, findById);
    }
  }));
  
  NMNS.socket.on("update info", socketResponse("매장 정보 변경하기", function(){
    NMNS.history.remove("info", findById);
  }, function(e){
    var history = NMNS.history.find(function(item){return item.id === "info"});
    if(history.bizBeginTime || history.bizEndTime){
      NMNS.calendar.setOptions({week:{hourStart:history.bizBeginTime?history.bizBeginTime.substring(0, 2):NMNS.info.bizBeginTime.substring(0,2), hourEnd : history.bizEndTime?history.bizEndTime.substring(0,2):NMNS.info.bizEndTime.substring(0,2)}});
    }
    NMNS.info.shopName = history.shopName || NMNS.info.shopName;
    NMNS.info.bizType = history.bizType;
    NMNS.history.remove("info", findById);
    NMNS.initedInfoModal = false;
  }));
  
  NMNS.socket.on("update alrim", socketResponse("알림톡 정보 변경하기", function(){
    NMNS.history.remove("alrimInfo", findById);
  }, function(){
    var history = NMNS.history.find(function(item){return item.id === "alrimInfo"});
    Object.keys(history).forEach(function(key){
      NMNS.info.alrimTalkInfo[key] = history[key];
    });
    NMNS.history.remove("alrimInfo", findById);
    NMNS.initedAlrimModal = false;
  }));

  NMNS.socket.on("get noshow", socketResponse("노쇼 정보 가져오기", function(e){
    var html = "";
    console.log(e);
    if(e.data.summary.noShowCount>0){
      $("#noShowSearchSummary").html(dashContact(e.data.summary.contact) + " 고객은 "+(e.data.detail.length>0?(e.data.detail.length == e.data.summary.noShowCount?"우리매장에서만 ":"다른 매장 포함 "):"다른 매장에서만 ")+(e.data.summary.noShowCount>1?"총 ":"") + e.data.summary.noShowCount + "번 노쇼하셨어요. <br class='d-inline-block d-lg-none'/> 가장 마지막은 " + ((moment().year()+"") === e.data.summary.lastNoShowDate.substring(0,4)? "올해 " : (((moment().year()-1)+"") === e.data.summary.lastNoShowDate.substring(0,4)? "작년 " : e.data.summary.lastNoShowDate.substring(0,4) + "년 ")) + parseInt(e.data.summary.lastNoShowDate.substring(4,6)) + "월 " + parseInt(e.data.summary.lastNoShowDate.substring(6)) + "일이었어요.").show();
      if(e.data.detail.length>0){
        e.data.detail.forEach(function(item){
          html += "<div class='row col-12 px-0 mt-1' data-id='"+item.id+"' data-contact='"+(e.data.summary.contact||"")+"' data-date='"+(item.date||"")+"' data-noshowcase='"+(item.noShowCase||"")+"'><span class='col-4'>"+(e.data.summary.contact?dashContact(e.data.summary.contact):"")+"</span><span class='col-4'>"+(item.date?(item.date.substring(0,4)+"-"+item.date.substring(4,6)+"-"+item.date.substring(6)):"")+"</span><span class='col-3'>"+(item.noShowCase?("<span class='badge badge-danger'>" + item.noShowCase + "</span>") : "")+"</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>";
        });
      }else{
        html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>우리 매장에서 추가한 노쇼는 아직 없네요!<br/>이분이 노쇼를 하셨다면 아래 추가 버튼을 눌러 다른 매장에도 공유해주세요.</span></div>";
      }
    }else{
      $("#noShowSearchSummary").html("전화번호 " + dashContact(e.data.summary.contact) + " 고객에 대해 등록된 노쇼 전적이 없습니다.");
      html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>이분은 노쇼를 한 적이 없으시네요! 안심하세요 :)</span></div>";
    }
    $("#noShowSearchList").html(html);
    $("#noShowSearchList").addClass("summary");
    $("#noShowSearchList .noShowSearchDelete").off("touch click").on("touch click", function(){
      deleteNoShow($(this));
    });
    if(NMNS.noShowModalSearchScroll){
      NMNS.noShowModalSearchScroll.update();
    }
  }));

  NMNS.socket.on("add noshow", socketResponse("노쇼 추가하기", function(e){
    var html, badge = "";
    console.log(e);
    if($("#noShowSearch").is(":visible")){
      badge = (e.data.noShowCase?("<span class='badge badge-light'>" + e.data.noShowCase + "</span>") : "");
      html = $("<div class='row col-12 px-0 mt-1' data-id='"+e.data.id+"' data-contact='"+e.data.contact+"' data-date='"+e.data.date+"' data-noshowcase='"+e.data.noShowCase+"'><span class='col-4'>"+(e.data.contact||$("#noShowSearchList div.noShowSearchAdd[data-id='"+e.data.id+"'] input[name='noShowSearchAddContact']").val())+"</span><span class='col-4'>"+(e.data.date?e.data.date.substring(0,4)+"-"+e.data.date.substring(4,6)+"-"+e.data.date.substring(6):"")+"</span><span class='col-3'>"+badge+"</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>");
      html.insertBefore($("#noShowSearchList").children(".noShowSearchAdd:eq(0)"));
      html.find(".noShowSearchDelete").on("touch click", function(){
        deleteNoShow($(this));
      });
      $("#noShowSearchList div.noShowSearchAdd[data-id='"+e.data.id+"']").remove();
    }
    alert("추가되었습니다! 다른 분들에게 많은 도움이 될거에요 :)");
  }, function(e){
    $("#noShowSearchList div.noShowSearchAdd[data-id='"+e.data.id+"'] .noShowSearchAddSubmit").off("touch click").on("touch click", function(){
      submitAddNoShow($(this));
    });
  }));
  
  NMNS.socket.on("delete noshow", socketResponse("노쇼 삭제하기", function(e){
    NMNS.history.remove(e.data.id, findById);
  }, function(e){
    if(e && e.data){
      var origin = NMNS.history.find(function(item){ return item.id === e.data.id});
      if(origin){
        var newRow = $("<div class='row col-12 px-0 mt-1' data-id='"+origin.id+"' data-contact='"+(origin.contact||"")+"' data-date='"+(origin.date||"")+"' data-noshowcase='"(origin.noShowCase||"")+"'><span class='col-4'>"+(origin.contact?dashContact(origin.contact):"")+"</span><span class='col-4'>"+(origin.date?(origin.date.substring(0,4)+"-"+origin.date.substring(4,6)+"-"+origin.date.substring(6)):"")+"</span><span class='col-3'>"+(origin.noShowCase?("<span class='badge badge-light'>" + origin.noShowCase + "</span>") : "")+"</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>");
        newRow.find(".noShowSearchDelete").off("touch click").on("touch click", function(){
          deleteNoShow($(this));
        });
        if($("#noShowSearchList .empty").length){//전체 덮어 씌우기
          $("#noShowSearchList").html(newRow);
        } else if($("#noShowSearchList .noShowSearchAdd").length){
          newRow.insertBefore("#noShowSearchList .noShowSearchAdd:first-child");
        }else{
          $("#noShowSearchList").append(newRow);
        }
      }
    }
  }));
  
  NMNS.socket.on("update password", socketResponse("비밀번호 변경하기"));
  
  NMNS.socket.on("get customer info", socketResponse("자동완성 자료 가져오기", function(e){
    //success
    if(e.data.id){
      var el = $("#"+e.data.id);
      el.autocomplete().onSuccess.call(el.autocomplete(), e.data.query, e.data.result);
    }
  }, function(e){
    if(e.data.id){
      var el = $("#"+e.data.id);
      el.autocomplete().onFail.call(el.autocomplete(), e.data);
    }
  }, true));

  NMNS.socket.on("get customer", socketResponse("고객 정보 가져오기", function(e){
    if(e.data.contact === $("#creationPopupContact").val()){
      if(e.data.etc){
        $("#creationPopupEtc").val(e.data.etc);
      }
      if(e.data.manager){
        var manager = findManager(e.data.manager);
        if(manager){
          $("#creationPopupManager").html($("#creationPopupManager").next().find("button[data-calendar-id='"+manager.id+"']").html()).data("calendarid", manager.id);
        }
      }
      if(e.data.contents){
        $("#creationPopupContents").val(e.data.contents);
      }
      if(e.data.isAllDay !== undefined){
        $("#creationPopupAllDay").attr("checked", e.data.isAllDay);
      }
      if(e.data.totalNoShow !== undefined && e.data.totalNoShow > 0){
        $("#creationPopupContact").tooltip({
          title:"이 전화번호에 등록된 노쇼는 총 " + e.data.totalNoShow + "건입니다." + (e.data.myNoShow && e.data.myNoShow>0?"\n우리 매장에서는 "+e.data.myNoShow+"번 등록되었습니다.":""),
          placement: ($(window).width()>576?"right":"top"),
          trigger:"click hover focus",
          delay:{"hide":1000}
        }).tooltip("show");
        setTimeout(function(){
          $("#creationPopupContact").tooltip("hide");
        }, 3000);
        $("#creationPopupContact").one("keyup change", function(){
          console.log("aaa");
          $(this).tooltip('dispose');
        });
      }
    }
  }, undefined, true));

  NMNS.socket.on("message", socketResponse("서버 메시지 받기", function(e){
    e.data.forEach(function(item){
      showNotification(item);
    });
  }));
//websocket response end
//Modal events start  
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
  }).on("touch click", function(e){
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
  $("#noShowModal").on("touch click", function(e){
    if($("#noShowScheduleDropdown").is(":visible")){
      var target = $(e.target);
      if(!target.parents("#noShowScheduleDropdown").length && !target.hasClass("badge") && !target.parents(".noShowScheduleNoShow").length){
        $("#noShowScheduleDropdown").hide(300);
      }
    }
  }).on("hide.bs.modal", function(){
    if(document.activeElement.tagName === "INPUT"){
      return false;
    }
  }).on("show.bs.modal", function(e){
    if($(e.relatedTarget).hasClass("getNoShowLink")){
      $("#noShowTabList .nav-link[href='#noShowSearch']").tab("show");
    }else if($(e.relatedTarget).hasClass("addNoShowLink")){
      $("#noShowTabList .nav-link[href='#noShowAdd']").tab("show");
    }
  });
  $("#mainRow").on("touch click", function(){
    if($("#navbarResponsive").hasClass("show")){
      $("#navbarResponsive").collapse("hide");
    }
  });
//Modal events end
  function showNotification(notification){
    if(!NMNS.notification){//not inited
      if("Notification" in window){
        if(Notification.permission === "granted"){
          NMNS.notification = "GRANTED";
        }else if(Notification.permission === "default"){
          NMNS.notification = "REQUESTING";
          Notification.requestPermission().then(function(permission){
            if(permission === "granted"){//granted
              NMNS.notification = "GRANTED";
            }else{//denied
              NMNS.notification = "DENIED";
              $.notifyDefaults({
                newest_on_top: true,
                type: "minimalist",
                allow_dismiss : true,
                delay: 0,
                url: "#",
                element: "#notifications",
                icon_type: "class",
                icon: "far fa-bell",
                onClose: function(){
                  NMNS.socket.emit("delete noti", {id:$(this).data("id")});
                },
                onClosed: function(){
                  if($("#notifications").html() === ""){
                    $("#notifications").hide();
                  }
                },
                template: '<div data-notify="container" class="col-12 alert alert-{0}" role="alert" data-id="'+notification.id+'"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button><i data-notify="icon" class="img-circle float-left notification-icon"></i><span data-notify="title" class="notification-title">{1}</span><span data-notify="message" class="notification-body">{2}</span></div>'
              });
            }
          });
        }
      }
      if(NMNS.notification !== "GRANTED"){
        $.notifyDefaults({
          newest_on_top: true,
          type: "minimalist",
          allow_dismiss : true,
          delay: 0,
          url: "#",
          element: "#notifications",
          icon_type: "class",
          icon: "far fa-bell",
          onClose: function(){
            NMNS.socket.emit("delete noti", {id:$(this).data("id")});
          },
          onClosed: function(){
            $("#notifications").height(($("#notifications .alert").length * 80 + 10) + "px");
          },
          template: '<div data-notify="container" class="col-12 alert alert-{0}" role="alert" data-id="'+notification.id+'"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button><i data-notify="icon" class="img-circle float-left notification-icon"></i><span data-notify="title" class="notification-title">{1}</span><span data-notify="message" class="notification-body">{2}</span></div>'
        });
      }
    }
    
    if(NMNS.notification === "GRANTED"){//native notification
      try{
        var noti = new Notification(notification.title, {
          requireInteraction:true,
          lang:"ko-KR",
          body:notification.body,
          icon:""
        });
        noti.onclick = function(e){
          noti.close();
        };
        noti.onclose = function(e){
          NMNS.socket.emit("delete noti", {id:notification.id});
        }
        return;
      }catch(exception){
        console.error(exception);
      }
    }
    //bootstrap notification
    $.notify({
      icon: "far fa-bell",
      title: notification.title,
      message: notification.body
    }, {});
    $("#notifications").height(($("#notifications .alert").length * 80 + 10) + "px");
  }
  
  NMNS.socket.emit("get noti");
  NMNS.socket.on("get noti", socketResponse("서버 메시지 받기", function(e){
    e.data.forEach(function(item){
      showNotification(item);
    });
  }));
})(jQuery);