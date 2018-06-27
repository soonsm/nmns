/*global jQuery, location, moment, tui*/
(function($) {
  var NMNS_GLOBAL = {};
  
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

  $(document).ready(function(){

  });

  var socketResponse = function(requestName, callback){
    return function(res){
      console.log("aaaaaaaaaa");
      console.log(res);
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
  NMNS_GLOBAL.socket = io();
  NMNS_GLOBAL.socket.on("message", socketResponse("서버 메시지 받기", function(e){
    console.log(e);
  }));
  NMNS_GLOBAL.socket.emit("get info");
  NMNS_GLOBAL.socket.emit("get manager");
  NMNS_GLOBAL.socket.on("get info", socketResponse("매장 정보 받아오기", function(e){
    console.log(e);
  }));
  
  NMNS_GLOBAL.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e){
    console.log(e);
    //NMNS_GLOBAL.calendar.createSchedules(e.data);
    //refreshScheduleVisibility();
  }));

  NMNS_GLOBAL.socket.on("get manager", socketResponse("매니저 정보 받아오기", function(e){
    console.log("get manager list");
    console.log(e);
    var html = "";
    e.data.forEach(function(item){
      html += "<div class='lnb-calendars-item'><label><input class='tui-full-calendar-checkbox-round' value='"+item.key+"' checked='' type='checkbox'>";
      html += "<span style='background-color:"+item.color+"'</span><span>"+item.name+"</span></label></div>";
    });
    $("#managerList").html(html);
  }));
  //calendars
  NMNS_GLOBAL.schedulelist = [];
  NMNS_GLOBAL.managerList = [{id:"1"}];
  var selectedManager, datePicker;
  NMNS_GLOBAL.calendar = new tui.Calendar("#mainCalendar", {
    taskView:["task"],
    scheduleView:true,
    useCreationPopup:true,
    useDetailPopup:true,
    calendars:NMNS_GLOBAL.managerList,
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
      }
    },
    month:{
      daynames:["일", "월", "화", "수", "목", "금", "토"]
    },
    week:{
      daynames:["일", "월", "화", "수", "목", "금", "토"]
    }
  });
  
  NMNS_GLOBAL.calendar.on({
    clickSchedule:function(e){
      console.log("clickSchedule", e);
    },
    clickDayname:function(e){
      console.log("clickDayname", e);
    },
    beforeCreateSchedule:function(e){
      console.log("beforeCreateSchedule", e);
      saveNewSchedule(e);
    },
    beforeUpdateSchedule:function(e){
      console.log("beforeUpdateSchedule", e);
      e.schedule.start = e.start;
      e.schedule.end = e.end;
      NMNS_GLOBAL.calendar.updateSchedule(e.schedule.id, e.schedule.calendarId, e.schedule);
    },
    beforeDeleteSchedule:function(e){
      console.log("beforeDeleteSchedule", e);
      NMNS_GLOBAL.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
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
    var target = $(e.target).closest('a[role="menuitem"]')[0];
    var action = getDataAction(target);
    var options = NMNS_GLOBAL.calendar.getOptions();
    var viewName = '';

    console.log(target);
    console.log(action);
    switch (action) {
      case 'toggle-daily':
        viewName = 'day';
        break;
      case 'toggle-weekly':
        viewName = 'week';
        break;
      case 'toggle-monthly':
        options.month.visibleWeeksCount = 0;
        viewName = 'month';
        break;
      case 'toggle-weeks2':
        options.month.visibleWeeksCount = 2;
        viewName = 'month';
        break;
      case 'toggle-weeks3':
        options.month.visibleWeeksCount = 3;
        viewName = 'month';
        break;
      case 'toggle-narrow-weekend':
        options.month.narrowWeekend = !options.month.narrowWeekend;
        options.week.narrowWeekend = !options.week.narrowWeekend;
        viewName = NMNS_GLOBAL.calendar.getViewName();

        target.querySelector('input').checked = options.month.narrowWeekend;
        break;
      case 'toggle-start-day-1':
        options.month.startDayOfWeek = options.month.startDayOfWeek ? 0 : 1;
        options.week.startDayOfWeek = options.week.startDayOfWeek ? 0 : 1;
        viewName = NMNS_GLOBAL.calendar.getViewName();

        target.querySelector('input').checked = options.month.startDayOfWeek;
        break;
      case 'toggle-workweek':
        options.month.workweek = !options.month.workweek;
        options.week.workweek = !options.week.workweek;
        viewName = NMNS_GLOBAL.calendar.getViewName();

        target.querySelector('input').checked = !options.month.workweek;
        break;
      default:
        break;
    }

    NMNS_GLOBAL.calendar.setOptions(options, true);
    NMNS_GLOBAL.calendar.changeView(viewName, true);

    setDropdownCalendarType();
    setRenderRangeText();
    setSchedules();
  }

  function onClickNavi(e) {
    var action = getDataAction(e.target);

    switch (action) {
      case 'move-prev':
        NMNS_GLOBAL.calendar.prev();
        break;
      case 'move-next':
        NMNS_GLOBAL.calendar.next();
        break;
      case 'move-today':
        NMNS_GLOBAL.calendar.today();
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
    var manager = selectedManager ? selectedManager : NMNS_GLOBAL.managerList[0];
console.log("aaa");
    if (!title) {
      return;
    }

    NMNS_GLOBAL.calendar.createSchedules([{
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
    var manager = NMNS_GLOBAL.manager;
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
    NMNS_GLOBAL.calendar.openCreationPopup({
        start: start,
        end: end
    });
  }
  function saveNewSchedule(scheduleData) {
    var calendar = scheduleData.calendar || NMNS_GLOBAL.calendar;
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

    //NMNS_GLOBAL.calendar.createSchedules([schedule]);

    refreshScheduleVisibility();
  }

  function onChangeCalendars(e) {
    var managerId = e.target.value;
    var checked = e.target.checked;
    var viewAll = document.querySelector('.lnb-calendars-item input');
    var managerElements = Array.prototype.slice.call(document.querySelectorAll('#managerList input'));
    var allCheckedCalendars = true;

    if (managerId === 'all') {
      allCheckedCalendars = checked;

      managerElements.forEach(function(input) {
        var span = input.parentNode;
        input.checked = checked;
        span.style.backgroundColor = checked ? span.style.borderColor : 'transparent';
      });

      NMNS_GLOBAL.managerList.forEach(function(manager) {
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

    NMNS_GLOBAL.managerList.forEach(function(manager) {
      NMNS_GLOBAL.calendar.toggleSchedules(manager.id, !manager.checked, false);
    });

    NMNS_GLOBAL.calendar.render(true);

    managerElements.forEach(function(input) {
      var span = input.nextElementSibling;
      span.style.backgroundColor = input.checked ? span.style.borderColor : 'transparent';
    });
  }

  function setDropdownCalendarType() {
    var calendarTypeName = document.getElementById('calendarTypeName');
    var calendarTypeIcon = document.getElementById('calendarTypeIcon');
    var options = NMNS_GLOBAL.calendar.getOptions();
    var type = NMNS_GLOBAL.calendar.getViewName();
    var iconClassName;

    if (type === 'day') {
      type = 'Daily';
      iconClassName = 'calendar-icon fas fa-bars';
    } else if (type === 'week') {
      type = 'Weekly';
      iconClassName = 'calendar-icon fas fa-pause';
    } else if (options.month.visibleWeeksCount === 2) {
      type = '2 weeks';
      iconClassName = 'calendar-icon fas fa-pause';
    } else if (options.month.visibleWeeksCount === 3) {
      type = '3 weeks';
      iconClassName = 'calendar-icon fas fa-pause';
    } else {
      type = 'Monthly';
      iconClassName = 'calendar-icon fas fa-th';
    }

    calendarTypeName.innerHTML = type;
    calendarTypeIcon.className = iconClassName;
  }

  function setRenderRangeText() {
    var renderRange = document.getElementById('renderRange');
    var options = NMNS_GLOBAL.calendar.getOptions();
    var viewName = NMNS_GLOBAL.calendar.getViewName();
    var html = [];
    if (viewName === 'day') {
        html.push(moment(NMNS_GLOBAL.calendar.getDate().getTime()).format('YYYY.MM.DD'));
    } else if (viewName === 'month' &&
        (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
        html.push(moment(NMNS_GLOBAL.calendar.getDate().getTime()).format('YYYY.MM'));
    } else {
        html.push(moment(NMNS_GLOBAL.calendar.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
        html.push(' ~ ');
        html.push(moment(NMNS_GLOBAL.calendar.getDateRangeEnd().getTime()).format(' MM.DD'));
    }
    renderRange.innerHTML = html.join('');
  }

  function setSchedules() {
    NMNS_GLOBAL.calendar.clear();
    getSchedule(NMNS_GLOBAL.calendar.getDateRangeStart(), NMNS_GLOBAL.calendar.getDateRangeEnd());
  }

  var resizeThrottled = tui.util.throttle(function() {
    NMNS_GLOBAL.calendar.render();
  }, 50);
  
  function setEventListener() {
    $('#menu-navi').on('click', onClickNavi);
    $('.dropdown-menu a[role="menuitem"]').on('click', onClickMenu);
    $('#managerElements').on('change', onChangeCalendars);

    $('#btn-save-schedule').on('click', onNewSchedule);
    $('#btn-new-schedule').on('click', createNewSchedule);

    $('#dropdownMenu-calendars-list').on('click', onChangeNewScheduleCalendar);

    window.addEventListener('resize', resizeThrottled);
  }

  function getDataAction(target) {
      return target.dataset ? target.dataset.action : target.getAttribute('data-action');
  }

  function getSchedule(start, end){
    console.log(toYYYYMMDD(start._date));
    console.log(toYYYYMMDD(end._date));
    NMNS_GLOBAL.socket.emit("get reserv", {from:toYYYYMMDD(start._date), to:toYYYYMMDD(end._date)});
  }

  function findManager(managerId){
    NMNS_GLOBAL.managerList.find(function(manager){
      return (manager.id === managerId);
    });
  }

  window.cal = NMNS_GLOBAL.calendar;

  setDropdownCalendarType();
  setRenderRangeText();
  setSchedules();
  setEventListener();

})(jQuery);