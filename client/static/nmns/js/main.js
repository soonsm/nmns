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
      hourStart:9,
      hourEnd:23
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
    }
  };
  NMNS.socket = io();
  NMNS.socket.on("message", socketResponse("서버 메시지 받기", function(e){
    console.log(e);
  }));
  NMNS.socket.emit("get info");
  NMNS.socket.emit("get manager");
  
  NMNS.socket.on("get info", socketResponse("매장 정보 받아오기", function(e){
    console.log(e);
    //영업시간에 따라 mainCalendar Height 조정 NMNS.weekHeight에 반영
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
    var html = "";
    e.data.forEach(function(item){
      html += "<div class='lnbManagerItem' data-value='"+item.id+"'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
      html += "<span style='background-color:"+item.bgColor+"; border-color:"+item.borderColor+"'></span><small>"+item.name+"</small></label></div>";
    });
    $("#managerList").html(html);
    NMNS.calendar.setCalendars(e.data);
    if(NMNS.needInit){
      delete NMNS.needInit;
      setSchedules();
    }
  }));
  
  NMNS.calendar.on({
    clickSchedule:function(e){
      console.log("clickSchedule", e);
    },
    clickDayname:function(e){
      console.log("clickDayname", e);
      NMNS.calendar.setOptions({week:{hourStart:8, hourEnd:20}});
    },
    beforeCreateSchedule:function(e){
      saveNewSchedule(e);
    },
    beforeUpdateSchedule:function(e){
      NMNS.history.push(e.history || e.schedule);
      console.log(e);
      var id = e.schedule.id;
      var newSchedule = {
        start : e.starts || e.start,
        end : e.ends || e.end,
        raw:{
          contact : e.schedule.raw.contact,
          contents : e.schedule.raw.contents,
          etc : e.schedule.raw.etc
        },
        isAllDay: e.schedule.isAllDay,
        title: e.schedule.title,
        color: e.schedule.color,
        bgColor: e.schedule.bgColor,
        borderColor : e.schedule.borderColor,
        dragBgColor: e.schedule.dragBgColor
      };
      NMNS.calendar.deleteSchedule(id, e.history? e.history.selectedCal.id : e.schedule.calendarId);
      e.schedule.category =  e.schedule.isAllDay ? 'allday' : 'time';
      e.schedule.dueDateClass = '';
      e.schedule.start = e.start;
      e.schedule.end = e.end;
      NMNS.calendar.createSchedules([e.schedule]);
      /*if(e.history && e.history.selectedCal.id !== e.schedule.calendarId){//manager changed
      }else{
        console.log(newSchedule);
        console.log("start", moment(newSchedule.start).format("YYYYMMDDHHmm"));
        console.log("end", moment(newSchedule.end).format("YYYYMMDDHHmm"));
        NMNS.calendar.updateSchedule(id, e.history? e.history.selectedCal.id : e.schedule.calendarId, e.schedule);
      }*/
      newSchedule.id = id;
      newSchedule.start = moment(newSchedule.start.toDate? newSchedule.start.toDate(): newSchedule.start).format("YYYYMMDDHHmm");
      newSchedule.end = moment(newSchedule.end.toDate? newSchedule.end.toDate() : newSchedule.end).format("YYYYMMDDHHmm");
      NMNS.socket.emit("update reserv", newSchedule);
    },
    beforeDeleteSchedule:function(e){
      NMNS.history.push(e.schedule);
      NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
      e.schedule.status = "DELETED";
      /*e.schedule.start = moment((e.schedule.start instanceof Date)? e.schedule.start : e.schedule.start.toDate()).format("YYYYMMDDHHmm");
      e.schedule.end = moment((e.schedule.end instanceof Date)? e.schedule.end : e.schedule.end.toDate()).format("YYYYMMDDHHmm");
      e.schedule.name = e.schedule.title;
      e.schedule.type = "R";*/
      NMNS.socket.emit("update reserv", e.schedule);
    },
    afterRenderSchedule:function(e){
      $("#mainCalendar").height(($(".tui-full-calendar-layout").height() + 7) > $("footer").position().top - 200 ? ($("footer").position().top - 200): ($(".tui-full-calendar-layout").height() + 7)+ "px");
    }
  });
  
  function getTimeSchedule(schedule, isAllDay){
    var html = "";
    if (!isAllDay) {
      html+='<strong>' + moment(schedule.start.toDate()).format('HH:mm') + '</strong> ';
    }else{
      html+='<span class="calendar-font-icon far fa-clock"></span>';
    }
    html += ' ' + schedule.title;
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
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#managerList input'));
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
      var managerId = $(e.target).parents(".lnbManagerItem").data("value");
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

    refreshScheduleVisibility();
  }

  function refreshScheduleVisibility() {
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#managerList input'));

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
      }
    }), true);
  };

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
  };
  
  window.cal = NMNS.calendar;

  setDropdownCalendarType();
  setRenderRangeText();
  setEventListener();

  NMNS.socket.on("add reserv", socketResponse("예약 추가하기", function(e){
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
  }, function(e){
    var origin = NMNS.history.find(function(history){return (history.id === e.data.id);});
    console.log(origin);
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
    delete origin.id;
    NMNS.calendar.deleteSchedule(e.data.id, origin.manager);
  }));
  
  NMNS.socket.on("update reserv", socketResponse("예약 정보 변경하기", function(e){
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
  }, function(e){
    var origin = NMNS.history.find(function(history){return (history.id === e.data.id);});
    NMNS.history.remove(e.data.id, function(item, target){return (item.id === target);});
    if(origin.status === "DELETED"){
      drawSchedule([origin]);
      refreshScheduleVisibility();
    }else{
      //delete origin.id;
      if(typeof origin.start === "string") origin.start = moment(origin.start, "YYYYMMDDHHmm").toDate();
      if(typeof origin.end === "string") origin.end = moment(origin.end, "YYYYMMDDHHmm").toDate();
      NMNS.calendar.updateSchedule(e.data.id, origin.selectedCal? origin.selectedCal.id : origin.calendarId, origin);
    }
  }));
  
})(jQuery);