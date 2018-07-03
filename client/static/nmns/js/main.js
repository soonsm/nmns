/*global jQuery, location, moment, tui*/
(function($) {
  var NMNS = {needInit:true};
  
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
        return getTimeSchedule(schedule, true);
      },
      time:function(schedule){
        return getTimeSchedule(schedule, false);
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
        return "시작일시(ex. 2018-01-01 00:00)"
      },
      endDatePlaceholder:function(){
        return "종료일시(ex. 2018-12-31 00:00)"
      }
    },
    month:{
      daynames:["일", "월", "화", "수", "목", "금", "토"]
    },
    week:{
      daynames:["일", "월", "화", "수", "목", "금", "토"],
      hourStart:8,
      hourEnd:21
    },
    theme:{
      'week.currentTime.color': '#009688',
      'week.currentTimeLinePast.border': '1px dashed #009688',
      'week.currentTimeLineBullet.backgroundColor': '#009688',
      'week.currentTimeLineToday.border': '1px solid #009688',
    }
  });

  var socketResponse = function(requestName, callback){
    return function(res){
      if(res && res.type === "response"){
        if(res.status){//success
          if(callback){
            callback(res);
          }
        }else{//fail
          alert(requestName + "에 실패하였습니다." + (res.message?"(" + res.message + ")":""));
        }
      }else if(res && res.type === "push"){
        console.log("server push!");
        console.log(res);
        if(callback){
          callback(res);
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
  }));
  
  NMNS.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e){
    console.log(e);
    drawSchedule(e.data);
    refreshScheduleVisibility();
  }));

  NMNS.socket.on("get manager", socketResponse("매니저 정보 받아오기", function(e){
    var html = "";
    e.data.forEach(function(item){
      html += "<div class='lnbManagerItem py-2'><label><input class='tui-full-calendar-checkbox-round' value='"+item.key+"' checked='' type='checkbox'>";
      html += "<span style='background-color:"+item.color+"; border-color:"+item.color+"'></span><small>"+item.name+"</small></label></div>";
    });
    $("#managerList").html(html);
    e.data.forEach(function(item){
      item.checked = true;
      item.bgColor = item.color;
      item.borderColor = item.color;
    });
    console.log(e.data);
    NMNS.calendar.setCalendars(e.data);
    console.log(NMNS.calendar.getCalendars());
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
      NMNS.calendar.setOptions({week:{hourStart:9, hourEnd:23}});
    },
    beforeCreateSchedule:function(e){
      console.log("beforeCreateSchedule", e);
      console.log(e.guide);
      saveNewSchedule(e);
    },
    beforeUpdateSchedule:function(e){
      console.log("beforeUpdateSchedule", e);
      e.schedule.start = e.start;
      e.schedule.end = e.end;
      NMNS.calendar.updateSchedule(e.schedule.id, e.schedule.calendarId, e.schedule);
    },
    beforeDeleteSchedule:function(e){
      console.log("beforeDeleteSchedule", e);
      NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
    },
    afterRenderSchedule:function(e){
      console.log("afterRenderSchedule", e);
    }
  });
  
  function getTimeSchedule(schedule, isAllDay){
    var html = "";
    var start = moment(schedule.start.toUTCString());
    if (!isAllDay) {
      html+='<strong>' + start.format('HH:mm') + '</strong> ';
    }
    if (schedule.isPrivate) {
      html+='<span class="calendar-font-icon fas fa-lock"></span>';
      html+=' Private';
    } else {
      if (schedule.isReadOnly) {
        html += '<span class="calendar-font-icon fas fa-ban"></span>';
      } else if (schedule.recurrenceRule) {
        html += '<span class="calendar-font-icon fas fa-redo-alt"></span>';
      } else if (schedule.attendees.length) {
        html += '<span class="calendar-font-icon fas fa-user"></span>';
      } else if (schedule.location) {
        html += '<span class="calendar-font-icon fas fa-map-marker-alt"></span>';
      }
      html += ' ' + schedule.title;
    }
    return html;
  }
  
  function onClickMenu(e) {
    var action = getDataAction(e.target);
    if(!action){
      action = getDataAction(e.target.parentElement);
    }
    var viewName = '';

    switch (action) {
      case 'toggle-daily':
        viewName = 'day';
        $("#mainCalendar").height("auto");
        break;
      case 'toggle-weekly':
        viewName = 'week';
        $("#mainCalendar").height("auto");
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
    var action = getDataAction(e.target);
    if(!action){
      action = getDataAction(e.target.parentElement);
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
    var calendarId = getDataAction(target);
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
  }
  function saveNewSchedule(scheduleData) {
    var calendar = scheduleData.calendar || NMNS.calendar;
    var schedule = {
      id: "aaaaaaa",
      title: scheduleData.title,
      isAllDay: scheduleData.isAllDay,
      start: scheduleData.start,
      end: scheduleData.end,
      category: scheduleData.isAllDay ? 'allday' : 'time',
      dueDateClass: '',
      color: calendar.color,
      bgColor: calendar.bgColor,
      dragBgColor: calendar.bgColor,
      borderColor: calendar.borderColor,
      /*raw: {
          'class': scheduleData.raw['class'],
          location: scheduleData.raw.location
      },*/
      state: scheduleData.state
    };
    if (calendar) {
      schedule.calendarId = calendar.id;
      schedule.color = calendar.color;
      schedule.bgColor = calendar.bgColor;
      schedule.borderColor = calendar.borderColor;
    }

    //NMNS.calendar.createSchedules([schedule]);

    refreshScheduleVisibility();
  }

  function onChangeCalendars(e) {
    var managerId = e.target.value;
    var checked = e.target.checked;
    var viewAll = document.querySelector('.lnbManagerItem input');
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#managerList input'));
    var allCheckedCalendars = true;

    if (managerId === 'all') {
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
    } else if (viewName === 'month' &&
        (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
        html.push(moment(NMNS.calendar.getDate().getTime()).format('YYYY.MM'));
    } else {
        html.push(moment(NMNS.calendar.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
        html.push(' ~ ');
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
    $('#managerElements').on('change', onChangeCalendars);

    $('#btn-save-schedule').on('touch click', onNewSchedule);
    $('#btn-new-schedule').on('touch click', createNewSchedule);

    $('#dropdownMenu-calendars-list').on('touch click', onChangeNewScheduleCalendar);

    window.addEventListener('resize', resizeThrottled);
  }

  function getDataAction(target) {
      return target.dataset ? target.dataset.action : target.getAttribute('data-action');
  }

  function getSchedule(start, end){
    console.log(start._date);
    console.log(end._date);
    NMNS.socket.emit("get reserv", {start:toYYYYMMDD(start._date) + "0000", end:toYYYYMMDD(end._date) + "2359"});
  }
  
  function drawSchedule(data){
    NMNS.calendar.createSchedules(data.map(function(schedule){//mapping server data to client data
      var manager = findManager(schedule.manager);
      console.log(manager);
      return {
        id:schedule.id,
        calendarId:manager?manager.id:"A1",//schedule.manager,
        title:schedule.name?schedule.name:(schedule.contact?schedule.contact:schedule.content),
        start: moment(schedule.start?schedule.start:"201806301730", "YYYYMMDDHHmm").toDate(),
        end:moment(schedule.end?schedule.end:"201806302000", "YYYYMMDDHHmm").toDate(),
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
        bgColor:manager?manager.color:"#b2dfdb",
        borderColor:manager?manager.color:"#b2dfdb",
        color:"#ffffff",
        dragBgColor:manager?manager.color:"#b2dfdb",
        raw:{
          contact:schedule.contact,
          contents:schedule.contents,
          etc:schedule.etc
        }
      }
    }), true);
  }

  function findManager(managerId){
    console.log(NMNS.calendar.getCalendars());
    return NMNS.calendar.getCalendars().find(function(manager){
      return (manager.id === managerId);
    });
  }

  window.cal = NMNS.calendar;

  setDropdownCalendarType();
  setRenderRangeText();
  setEventListener();

})(jQuery);