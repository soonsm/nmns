/*global jQuery, location, moment, tui, NMNS, io, filterNonNumericCharacter, dashContact, navigator, socketResponse, generateRandom, getCookie, flatpickr, PerfectScrollbar, toYYYYMMDD, findById, Notification, drawCustomerAlrimList, showSnackBar, showNotification, getBackgroundColor */
(function($) {
    if ( /*@cc_on!@*/ false || !!document.documentMode) {
        var word;
        var agent = navigator.userAgent.toLowerCase();

        // IE old version ( IE 10 or Lower ) 
        if (navigator.appName == "Microsoft Internet Explorer") word = "msie ";
        // IE 11 
        else if (agent.search("trident") > -1) word = "trident/.*rv:";
        // Microsoft Edge  
        else if (agent.search("edge/") > -1) word = "edge/";

        var reg = new RegExp(word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})");

        if (reg.exec(agent) !== null && parseFloat(RegExp.$1 + RegExp.$2) < 10) {
            if (!confirm("오래된 IE" + parseFloat(RegExp.$1 + RegExp.$2) + " 브라우저를 사용하고 계십니다.\n 계속하시면 페이지가 정확히 표시되지 않을 수 있습니다. 그래도 계속하시겠습니까?\n *WA:SHOW는 IE10 이상의 브라우저를 지원하고,\nChrome 브라우저에 최적화되어있습니다.")) {
                location.href = '/signout';
                return;
            }
        }
    }

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
        $('.navbar-collapse').collapse('hide');
    });

    //calendars init
    NMNS.calendar = new tui.Calendar("#mainCalendar", {
        taskView: [],
        defaultView: $(window).width() > 550 ? "week" : "day",
        scheduleView: ['time'],
        useCreationPopup: false,
        useDetailPopup: true,
        disableDblClick: true,
        template: {
            allday: function(schedule) {
                return getTimeSchedule(schedule, schedule.isAllDay);
            },
            time: function(schedule) {
                return getTimeSchedule(schedule, schedule.isAllDay);
            },
            task: function(schedule) {
                return getTimeSchedule(schedule, schedule.isAllDay);
            },
            alldayTitle: function() {
                return "<span class='tui-full-calendar-left-content'>하루종일</span>";
            },
            taskTitle: function() {
                return "<span class='tui-full-calendar-left-content'>일정</span>";
            },
            timegridDisplayPrimayTime: function(time) {
                return time.hour + ":00";
            },
            popupIsAllDay: function() {
                return "하루종일";
            },
            startDatePlaceholder: function() {
                return "시작시간";
            },
            endDatePlaceholder: function() {
                return "종료시간";
            },
            popupDetailDate: function(isAllDay, start, end) {
                var startDate = moment(start instanceof Date ? start : start.toDate()),
                    endDate = moment(end instanceof Date ? end : end.toDate());
                var isSameDate = startDate.isSame(endDate, 'day');
                var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'a h:mm';

                if (isAllDay) {
                    return startDate.format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + endDate.format('YYYY.MM.DD'));
                }

                return (startDate.format('YYYY.MM.DD a h:mm') + ' - ' + endDate.format(endFormat));
            },
            popupEdit: function() {
                return "수정";
            },
            popupDelete: function() {
                return "삭제";
            },
            weekDayname: function(model) {
                var classDate = 'tui-full-calendar-dayname-date';
                var className = 'tui-full-calendar-dayname-name' + (NMNS.calendar && NMNS.calendar.getViewName() === 'week' ? ' weekViewDayName' : '');
                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === model.renderDate }) : undefined;
                if (holiday) {
                    className += " tui-full-calendar-holiday";
                    classDate += " tui-full-calendar-holiday";
                }

                return '<span class="' + classDate + '">' + model.date + '</span>&nbsp;&nbsp;<span class="' + className + '">' + model.dayName + (holiday ? ("[" + holiday.title + "]") : "") + '</span>';
            },
            monthGridHeader: function(model) {
                var date = parseInt(model.date.split('-')[2], 10);
                var classNames = ["tui-full-calendar-weekday-grid-date"];

                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === model.date }) : undefined;
                if (holiday) {
                    classNames.push("tui-full-calendar-holiday");
                }
                return '<span class="' + classNames.join(' ') + '">' + date + (holiday ? ("<small class='d-none d-sm-inline'>[" + holiday.title + "]</small>") : "") + '</span>';
            },
            monthGridHeaderExceed: function(){
              return ''
            },
            monthGridFooterExceed: function(hiddenSchedules) {
                return '<span class="tui-full-calendar-weekday-grid-more-schedules" title="전체 예약">전체 예약 <i class="fa fa-chevron-right"></i></span>';
            },
            monthMoreTitleDate: function(date, dayname) {
                var dateFormat = date.split(".").join("-");
                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === dateFormat }) : undefined;
                var classDay = "tui-full-calendar-month-more-title-day" + (dayname === "일" ? " tui-full-calendar-holiday-sun" : "") + (holiday ? " tui-full-calendar-holiday" : "") + (dayname === "토" ? " tui-full-calendar-holiday-sat" : "");

                return '<span class="' + classDay + '">' + parseInt(dateFormat.substring(8), 10) + '</span> <span class="tui-full-calendar-month-more-title-day-label">' + dayname + (holiday ? ("<small class='d-none d-sm-inline'>[" + holiday.title + "]</small>") : "") + '</span>';
            }
        },
        month: {
            daynames: ["일", "월", "화", "수", "목", "금", "토"],
            scheduleFilter: function() { return true; },
            grid: { header: { height: 26 } }
        },
        week: {
            daynames: ["일", "월", "화", "수", "목", "금", "토"],
            hourStart: NMNS.info.bizBeginTime ? parseInt(NMNS.info.bizBeginTime.substring(0, 2), 10) : 9,
            hourEnd: NMNS.info.bizEndTime ? parseInt(NMNS.info.bizEndTime.substring(0, 2), 10) + (NMNS.info.bizEndTime.substring(2) === "00" ? 0 : 1) : 23
        },
        theme: {
            'week.currentTime.color': '#fd5b77',
            'week.currentTimeLinePast.border': '1px solid #fd5b77',
            'week.currentTimeLineBullet.backgroundColor': 'transparent',
            'week.currentTimeLineToday.border': '1px solid #fd5b77',
            'week.currentTimeLineFuture.border': '1px solid #fd5b77',
            "common.border": ".07rem solid rgba(57, 53, 53, 0.35)",
            "common.saturday.color": "#1736ff",
            'common.dayname.color': '#393535',
            'common.holiday.color':'#fd5b77',
            "week.timegridOneHour.height": "68px",
            "week.timegridHalfHour.height": "34px",
            "week.vpanelSplitter.height": "5px",
            "week.pastDay.color": "#393535",
            "week.futureDay.color": "#393535",
            "week.pastTime.color": "#393535",
            "week.futureTime.color": "#393535",
            'month.schedule.marginLeft': '0px',
            'month.schedule.marginRight': '1px',
            'month.schedule.marginTop':'5px',
            'month.schedule.height': '12px',
            'month.dayname.height':'52px',
            'month.dayname.borderLeft':'none',
            'month.dayname.borderTop':'none',
            'month.dayname.textAlign':'center',
            'month.dayname.fontWeight': 'normal',
            'month.holidayExceptThisMonth.color': 'rgba(253, 91, 119, 0.35)',
            'month.saturdayExceptThisMonth.color': 'rgba(23, 54, 255, 0.35)',
            'month.dayExceptThisMonth.color': 'rgba(57, 53, 53, 0.35)',
            'month.day.fontSize': '13px',
            'common.creationGuide.backgroundColor': '#ffdbdb',
            'common.creationGuide.border': '1px solid #ffdbdb',
            'week.creationGuide.color': '#fd5b77',
            'week.timegrid.paddingRight': '1px',
            'week.dayGridSchedule.marginRight': '1px',
            'week.dayname.borderTop':'none',
            'week.dayname.borderBottom':'none',
            'week.dayname.borderLeft':'none',
            'week.dayname.textAlign': 'center',
            'week.dayname.height': '51px',
            'week.dayGridSchedule.borderLeft': '2px solid',
            'week.timegridLeft.borderRight': 'none',
            'week.daygridLeft.width': '54px',
            'week.timegridLeft.width': '54px'
        }
    });

    NMNS.calendar.on({
        beforeCreateSchedule: function(e) {
          console.log('create', e);
          
          NMNS.scheduleTarget = e;
          initScheduleTab(e);
          $("#scheduleTabList a[data-target='#scheduleTab']").tab('show')
          $("#scheduleModal").modal('show')
            //saveNewSchedule(e);
        },
        beforeUpdateSchedule: function(e) {
          if(e.schedule && e.start && e.end){// move or resize schedule
            var history = e.schedule || $.extend(true, {}, e.schedule);
            NMNS.history.push(history);
            e.schedule.start = e.start || e.schedule.start;
            e.schedule.end = e.end || e.schedule.end;

            NMNS.calendar.updateSchedule(e.schedule.id, e.history ? e.history.selectedCal.id : e.schedule.calendarId, e.schedule);

            NMNS.socket.emit("update reserv", {
                id: e.schedule.id,
                start: moment(e.schedule.start.toDate ? e.schedule.start.toDate() : e.schedule.start).format("YYYYMMDDHHmm"),
                end: moment(e.schedule.end.toDate ? e.schedule.end.toDate() : e.schedule.end).format("YYYYMMDDHHmm"),
            });
            
          }else{
            NMNS.scheduleTarget = e;
            console.log('update', e);
            initScheduleTab(e);
            $("#scheduleTabList a[data-target='#scheduleTab']").tab('show')
            $("#scheduleModal").modal('show');
          }
        },
        beforeDeleteSchedule: function(e) {
            NMNS.history.push(e.schedule);
            NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
            NMNS.socket.emit("update reserv", { id: e.schedule.id, status: "DELETED" });
        },
        afterRenderSchedule: function(e) {
          if (NMNS.calendar.getViewName() !== "month") {
              //$("#mainCalendar").height(($(".tui-full-calendar-layout").height())+ "px");
          }
        }
    });

    NMNS.socket = io();
    NMNS.socket.emit("get info");
    NMNS.socket.emit("get manager");
    NMNS.socket.emit("get task", {start:moment().format('YYYYMMDD'), end:moment().add(7, 'days').format('YYYYMMDD')})

    NMNS.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e) {
        drawSchedule(e.data);
        NMNS.holiday = NMNS.holiday.concat(e.holiday.filter(function(day){return !NMNS.holiday.some(function(holiday){return holiday.date === day.date})}));
        refreshScheduleVisibility();
    }));

    NMNS.socket.on("get info", socketResponse("매장 정보 받아오기", function(e) {
        NMNS.info = e.data;
        if (NMNS.calendar) {
            NMNS.calendar.setOptions({ week: { hourStart: (NMNS.info.bizBeginTime ? parseInt(NMNS.info.bizBeginTime.substring(0, 2), 10) : 9), hourEnd: (NMNS.info.bizEndTime ? parseInt(NMNS.info.bizEndTime.substring(0, 2), 10) + (NMNS.info.bizEndTime.substring(2) === "00" ? 0 : 1) : 23) } });
        }
        NMNS.email = e.data.email || NMNS.email;
        NMNS.calendarHeight = ((NMNS.calendar.getOptions().week.hourEnd - NMNS.calendar.getOptions().week.hourStart) * 4.26) + 7.25;
        $("#mainCalendar").css("height", NMNS.calendarHeight + "rem");
        if (NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" && moment(NMNS.info.signUpDate, "YYYYMMDD").add(30, 'd').isSameOrAfter(moment(), 'day')) {
            showNotification({
                title: "이메일을 인증해주세요!",
                body: "인증메일은 내 매장 정보 화면에서 다시 보내실 수 있습니다. 이메일을 인증해주세요!"
            });
        }
        //tutorial & tip start
        if (NMNS.info.isFirstVisit) {
            if (!document.getElementById("tutorialScript")) {
                var script = document.createElement("script");
                script.src = "/nmns/js/tutorial.min.js";
                script.id = "tutorialScript";
                document.body.appendChild(script);

                script.onload = function() {
                    $("#tutorialModal").modal();
                };
            }
        } else if((getCookie("showTips") === "true" || getCookie("showTips") === undefined) && Math.random() < 0.5){
            $("#tipsModal").modal("show");
        }
        //tutorial & tip end
        //announcement start
        if(NMNS.info.newAnnouncement){
            $('.announcementCount').html(NMNS.info.newAnnouncement > 99? '99+' : NMNS.info.newAnnouncement)
        }
        //announcement end
    }));

    NMNS.socket.on("get manager", socketResponse("매니저 정보 받아오기", function(e) {
        e.data.forEach(function(item) {
            item.checked = true;
            item.bgColor = getBackgroundColor(item.color);
            item.borderColor = item.color;
            item.color = item.color;
        });

        $("#lnbManagerList").html(generateLnbManagerList(e.data));
        NMNS.calendar.setCalendars(e.data);
        if (NMNS.needInit) {
            delete NMNS.needInit;
            setSchedules();
        }
        $('#mainTaskContents').html(generateTaskList([{date:'20190320', task:[{title:'aaa', manager:'happy@store.com20180907050532384', contents:'aaa', start:'201903200101', end:'201903202359'}]}, {date:'20190321', task:[{title:'abbbaa', manager:'happy@store.com20180907050532384', contents:'aabbba', start:'201903210102', end:'201903232350'}]}, {date:'20190322', task:[]}]));
        $("#mainTaskContents input").on('change', function(e){
          console.log($(this).prop('checked'));
          e.stopPropagation();
          var data = $(this).parent();
          NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
          NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
        })
        $("#mainTaskContents .task").on('touch click', function(e){
          e.stopPropagation();
          console.log('aa')
          var data = $(this).parent();
          initTaskTab({id:data.data('id'), title:data.data('title'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'})
          $("#scheduleTabList a[data-target='#taskTab']").tab('show');
          $("#scheduleModal").modal('show')
        });
        refreshScheduleVisibility();
    }));

    //business specific functions about calendar start
    function getTimeSchedule(schedule, isAllDay) {
        var type = schedule.category === 'task' ? "일정" : "예약";
        var html = "";
        if(NMNS.calendar.getViewName() === 'week'){
          html +=  "<div class='tui-full-calendar-schedule-cover font-weight-bold row mx-auto align-items-center text-center'><div class='col-11 px-0'>"
          if(!isAllDay){
              html += "<div class='row mx-0'><div class='montserrat col px-0' style='font-weight:500'>" + moment(schedule.start.toDate()).format("HH:mm") + " - " + moment(schedule.end.toDate()).format("HH:mm") + "</div></div>";
          }
          if (schedule.title) {
              html += "<div class='row mx-0' style='margin-top:10px'><div class='col px-0' title='" + type + "이름:" + schedule.title + "'>";
              if (schedule.category === 'task') {
                  html += "<span>#</span>";
              } else if (isAllDay) {
                  html += "<span class='far fa-clock'></span> ";
              }
              html += (schedule.title + "</div></div>");
          }
          html += "</div></div>"
        }else if(NMNS.calendar.getViewName() === 'day'){
          html += "<div class='tui-full-calendar-schedule-cover flex-column d-flex' style='padding:20px'><div class='row align-items-center' style='margin-bottom:5px'><div class='col d-flex'>";
          if(schedule.raw.contents){
            html += ("<div title='"+type+"내용:"+schedule.raw.contents+" class='tui-full-calendar-time-schedule-title'>" + schedule.raw.contents+"</div>");
          }
          switch (schedule.raw.status) {
              case "CANCELED":
                  html += "<span title='상태/" + type + "내용'><span class='badge badge-light'>취소</span>";
                  break;
              case "NOSHOW":
                  html += "<span title='상태/" + type + "내용'><span class='badge badge-danger'>노쇼</span>";
                  break;
              case "CUSTOMERCANCELED":
                  html += "<span title='상태/" + type + "내용'><span class='badge badge-light'>고객취소</span>";
                  break;
          }
          html += ("<div class='montserrat ml-auto' style='font-weight:500'>" + moment(schedule.start.toDate()).format("HH:mm") + " - " + moment(schedule.end.toDate()).format("HH:mm") + "</div></div></div><div>" + (schedule.raw.etc || '') + "</div><div class='mt-auto tui-full-calendar-time-schedule-contact'>" + (schedule.title ? "<span title='이름:"+schedule.title+"' class='mr-1'>" + schedule.title + "</span>" : "") + (schedule.raw.contact ? "<span title='연락처:" + dashContact(schedule.raw.contact, '.') + "'>" + dashContact(schedule.raw.contact, '.') + "</span>" : "") + "</div></div>");
          
        }else{
          html += "예약 " + schedule.count + "건</div>"
        }

        return html;
    }

    function onClickMenu(e) {
        var action = e.target.getAttribute('data-action');
        if (!action) {
            action = e.target.parentElement.getAttribute('data-action');
        }
        var viewName = '';

        switch (action) {
            case 'toggle-daily':
                viewName = 'day';
                $("#mainCalendar").css("height", NMNS.calendarHeight + "rem");
                break;
            case 'toggle-weekly':
                viewName = 'week';
                $("#mainCalendar").css("height", NMNS.calendarHeight + "rem");
                break;
            case 'toggle-monthly':
                viewName = 'month';
                $("#mainCalendar").css("height", "598px");
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
        if (!action) {
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

    function onClickTask(e){
      if($(window).width() < 1600){
        if($("#mainTask").hasClass("show")){// about to hide task
          $("#mainCalendarArea").css('minWidth', '');
          $("#mainContents").css("minWidth", '100%');
          $("#mainAside").css('minWidth', 'unset');
        }else{// about to show task
          $("#mainCalendarArea").css('minWidth', $("#mainCalendarArea").width());
          $("#mainContents").css("minWidth", '');
          if($("#mainAside").hasClass("sidebar-toggled")){//hided
            $("#mainAside").css('minWidth', 'unset');
          }else{
            $("#mainAside").css('minWidth', '270px');
          }
        }
      }
      $("#mainTask").toggleClass('show');
    }
    
    function onChangeNewScheduleCalendar(e) {
        e.preventDefault();
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

    function createNewSchedule(e) {
        e.preventDefault();
        var now = moment(new Date());
        if (now.hour() >= Number(NMNS.info.bizEndTime.substring(0, 2)) || (now.hour() + 1 == Number(NMNS.info.bizEndTime.substring(0, 2)) && now.minute() + 30 > Number(NMNS.info.bizEndTime.substring(2)))) {
            now = moment(NMNS.info.bizEndTime, "HHmm").subtract(30, "m");
        } else if (now.hour() < Number(NMNS.info.bizBeginTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizBeginTime.substring(0, 2)) && now.minute() < Number(NMNS.info.bizBeginTime.substring(2)))) {
            now = moment(NMNS.info.bizBeginTime, "HHmm");
        } else {
            now.minute(Math.ceil(now.minute() / 10) * 10);
        }
        NMNS.calendar.openCreationPopup({
            start: now.toDate(),
            end: now.add(30, "m").toDate()
        });
    }

    function saveNewSchedule(scheduleData) {
        scheduleData.id = NMNS.email + generateRandom();
        NMNS.calendar.createSchedules([scheduleData]);

        NMNS.history.push(scheduleData);
        var serverSchedule = $.extend({}, scheduleData);
        serverSchedule.start = moment(serverSchedule.start.toDate()).format("YYYYMMDDHHmm");
        serverSchedule.end = moment(serverSchedule.end.toDate()).format("YYYYMMDDHHmm");
        NMNS.socket.emit("add reserv", serverSchedule);
    }

    function findManager(managerId) {
        return NMNS.calendar.getCalendars().find(function(manager) {
            return (manager.id === managerId);
        });
    }

    function onChangeManagers(e) {
        var checked = e.target.checked;
/*
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
*/        var manager = $(e.target).parents(".lnbManagerItem");
        if (manager.is(".addManagerItem")) {
            return;
        }
        var managerId = manager.data("value");
        if (managerId) {
            findManager(managerId).checked = checked;
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
            span.style.backgroundColor = input.checked ? span.getAttribute('data-color') : 'transparent';
            span.style.borderColor = input.checked ? span.getAttribute('data-color') : '#7f8fa4'
        });
        
    }

    function setDropdownCalendarType() {
        $(".calendarType").removeClass("active");

        switch (NMNS.calendar.getViewName()) {
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
        var html = "";
        if (viewName === 'day') {
            var today = moment(NMNS.calendar.getDate().getTime());
            html += today.format('YYYY. MM. DD');
            var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === today.format('YYYY-MM-DD') }) : undefined;
            html += "<span class='flex-column base-font ml-3'"+ (holiday?"" : " style='opacity:0.5'")+">"+ (holiday?"<div class='render-range-text-holiday'>" + holiday.title + "</div>":"") +"<span style='font-size:22px;vertical-align:bottom'>"+['일', '월', '화', '수', '목', '금', '토'][moment(NMNS.calendar.getDate().getTime()).day()]+"요일</span></span>"
        } else if (viewName === 'month' && (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
            html += moment(NMNS.calendar.getDate().getTime()).format('YYYY. MM');
        } else {
            html += moment(NMNS.calendar.getDateRangeStart().getTime()).format('YYYY. MM. DD');
            html += ' - ';
            html += moment(NMNS.calendar.getDateRangeEnd().getTime()).format(' MM. DD');
        }
        renderRange.innerHTML = html;
    }

    function setSchedules() {
        NMNS.calendar.clear();
        getSchedule(NMNS.calendar.getDateRangeStart(), NMNS.calendar.getDateRangeEnd());
    }
    //business specific functions about calendar end
    //business specific functions about general features start
    function generateAuthStatusBadge(authStatus) {
        switch (authStatus) {
            case "BEFORE_EMAIL_VERIFICATION":
                return "<span class='badge badge-danger' title='인증메일 보내기' style='cursor:pointer;'>이메일 미인증</span><span class='btn btn-sm btn-flat btn-secondary ml-2'>인증메일 보내기</span>";
            case "EMAIL_VERIFICATED":
                return "<span class='badge badge-primary badge-pill'><span class='fa fa-check mr-1'></span>인증완료</span>";
        }
        $("#infoAccountStatus").removeClass("pl-2"); //no auth status badge
        return "";
    }

    function generateScheduleStatusBadge(scheduleStatus) {
        switch (scheduleStatus) {
            case "RESERVED":
                return "<span class='badge badge-success' title='바꾸기'>정상 </span><span class='btn btn-sm btn-light noShowScheduleNoShow' title='노쇼처리'><i class='fas fa-exclamation-triangle'></i><span class='d-none d-lg-inline-block'> 노쇼처리</span></span>";
            case "CANCELED":
            case "CUSTOMERCANCELED":
                return "<span class='badge badge-secondary' title='바꾸기'>취소 </span><span class='btn btn-sm btn-light noShowScheduleNoShow' title='노쇼처리'><i class='fas fa-exclamation-triangle'></i><span class='d-none d-lg-inline-block'> 노쇼처리</span></span>";
            case "NOSHOW":
                return "<span class='badge badge-danger' title='바꾸기'>노쇼 </span><span class='btn btn-sm btn-light noShowScheduleNormal' title='되돌리기'><i class='fas fa-undo'></i><span class='d-none d-lg-inline-block'> 되돌리기</span></span>";
        }
        return "";
    }

    function generateManagerList(managerList) {
        var html = "";
        managerList.forEach(function(item) {
            html += "<div class='infoManagerItem'><label><input class='tui-full-calendar-checkbox-round' checked='checked' readonly='readonly' type='checkbox'/><span class='infoManagerColor' style='background-color:" + item.color + "; border-color:" + item.color + ";'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-id='" + item.id + "' data-color='" + item.color + "' placeholder='담당자 이름' value='" + item.name + "' data-name='" + item.name + "'/></label><i class='fas fa-trash deleteManager pl-2' title='삭제'></i></div>";
        });
        return html;
    }

    function generateLnbManagerList(managerList) {
        var html = "";
        managerList.forEach(function(item) {
            html += "<div class='lnbManagerItem row mx-0' data-value='" + item.id + "'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
            html += "<span title='이 담당자의 예약 가리기/보이기' data-color='" + item.color + "'></span><span class='menu-collapsed'>" + item.name + "</span></label><button class='btn btn-flat menu-collapsed lnbManagerAction ml-auto text-white py-0 pr-0' type='button'><i class='fa fa-ellipsis-v menu-collapsed'></i></button></div>";
        });
        return html;
    }
    
    function generateTaskList(taskList) {
      var html = "";
      var today = moment().format('YYYYMMDD');
      var tomorrow = moment().add(1, 'days').format('YYYYMMDD');
      taskList.forEach(function(day){
        if(day.task.length > 0){
          html += "<div class='taskDate' style='font-size:12px;opacity:0.5'><hr class='hr-text' data-content='"+(day.date === today?'오늘':(day.date === tomorrow?'내일':moment(day.date, 'YYYYMMDD').format('YYYY. MM. DD')))+"'></div>"
          day.task.forEach(function(task, index){
            var manager = findManager(task.manager) || {};
            html += "<div class='row mx-0 px-0 col-12 position-relative' data-id='"+task.id+"' data-calendar-id='"+task.manager+"' data-start='"+task.start+"' data-end='"+task.end+"' data-title='"+task.title+"'><input type='checkbox' class='task-checkbox' id='task-checkbox"+index+"'"+(task.isDone?" checked='checked'":"")+"><label for='task-checkbox"+index+"'></label><div class='flex-column d-inline-flex cursor-pointer task' style='margin-left:10px;max-width:calc(100% - 35px)'><div style='font-size:14px'>"+task.title+"</div><div class='montserrat' style='font-size:12px;opacity:0.5'>"+
            moment(task.start, 'YYYYMMDDHHmm').format(moment(task.start, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')
            + (task.end?' - ' + (moment(task.end, 'YYYYMMDDHHmm').format(moment(task.end, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')):'')
            +"</div></div><span class='tui-full-calendar-weekday-schedule-bullet' style='top:8px;right:0;left:unset;background:"+manager.borderColor+"' title='"+manager.name+"'></span></div>"
          })
        }
      })
      return html;
    }

    function changeMainShopName(shopName) {
        if ($("#mainShopName").length) {
            if (shopName !== "") {
                $("#mainShopName").text(shopName);
            } else {
                $("#navbarResponsive").prev().children("span").html(NMNS.email);
            }
        } else if (shopName !== "") {
            $("#navbarResponsive").prev().children("span").html("<span id='mainShopName'>" + shopName + "</span><small class='d-none d-md-inline-block'>(" + NMNS.email + ")</small>");
        }
    }

    function drawAlrimList(alrims) {
        var list = $("#alrimHistoryList");
        if (!list.hasClass("ps")) {
            list.data("scroll", new PerfectScrollbar("#alrimHistoryList"));
        }
        if (alrims && alrims.length > 0) {
            var html = "";
            var base = $("#alrimHistoryList .alrimRow").length
            alrims.forEach(function(item, index) {
                html += '<div class="row alrimRow col mx-0 px-0" title="눌러서 전송된 알림톡 내용 보기"><a href="#alrimDetail' + (index+base) + '" class="alrimDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="alrimDetail' + (index+base) + '"></a><div class="col-2 pr-0 text-left montserrat">' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '</div><div class="col-3 offset-2 ellipsis">' + item.name + '</div><div class="col-4 px-0 montserrat">' + dashContact(item.contact) + '</div><div class="col-1"></div></div>' +
                    '<div class="row alrimDetailRow collapse mx-0 col-12" id="alrimDetail' + (index+base) + '">'+(item.contents?item.contents.replace(/\n/g, "<br>"):'')+'</div>';
                if (index > 0 && index % 50 === 0) {
                    $("#alrimHistoryList").append(html);
                    html = "";
                }
            });
        /*
            alrims.forEach(function(item, index) {
                html += '<div class="row alrimRow col" title="눌러서 전송된 알림톡 내용 보기"><a href="#alrimDetail' + index + '" class="alrimDetailLink" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="alrimDetail' + index + '"></a><div class="col-4 px-0 ellipsis">' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm') + '</div><div class="col-4 ellipsis">' + item.name + '</div><div class="col-4 px-0 ellipsis">' + dashContact(item.contact) + '</div></div>' +
                    '<div class="row alrimDetailRow collapse" id="alrimDetail' + index + '"><small class="col px-0">' + item.contents + '</small></div>';
                if (index > 0 && index % 50 === 0) {
                    list.append(html);
                    html = "";
                }
            });*/
            list.append(html);
            $("#alrimHistoryList .alrimDetailLink").off('touch click').on("touch click", function(){
              $(this).parent().toggleClass('show');
            })
        } else {
            list.append("<div class='row alrimRow'><span class='col-12 text-center'>검색된 결과가 없습니다.</span></div>");
        }
        list.data("scroll").update();
    }

    function refreshAlrimModal() {
        if (NMNS.info.alrimTalkInfo.useYn === "Y") {
            $("#alrimUseYn").prop("checked", true);
            $("#alrimScreen").hide();
        } else {
            $("#alrimUseYn").prop("checked", false);
            $("#alrimScreen").show();
        }
        $("#alrimCallbackPhone").val(NMNS.info.alrimTalkInfo.callbackPhone || "");
        $("#alrimShopName").val(NMNS.info.shopName || "");
        $("#alrimCancelDue").val(NMNS.info.alrimTalkInfo.cancelDue || "");
        $("#alrimNotice").val(NMNS.info.alrimTalkInfo.notice || "");
        $("#noticeByteCount").text($("#alrimNotice").val().length);
    }

    function submitAlrimModal() {
        if ($("#alrimNotice").val().length > 700) {
            alert("알림 안내문구의 길이가 너무 깁니다. 조금만 줄여주세요 :)");
            $("#alrimNotice").focus();
            return;
        }
        if ($("#alrimUseYn").prop("checked")) {
            if ($("#alrimCallbackPhone").val() === "") {
                alert("알림톡을 사용하시려면 반드시 휴대폰번호를 입력해주세요!");
                $("#alrimCallbackPhone").focus();
                return;
            } else if (!(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test($("#alrimCallbackPhone").val()))) {
                alert("입력하신 휴대폰번호가 정확하지 않은 것 같습니다.\n휴대폰번호를 정확히 입력해주세요!");
                $("#alrimCallbackPhone").focus();
                return;
            }
            if ($("#alrimShopName").val() === "") {
                alert("알림톡을 사용하시려면 고객에게 보여줄 매장 이름을 입력해주세요!");
                $("#alrimShopName").focus();
                return;
            }
        }
        var parameters = {},
            history = { id: "alrimInfo" },
            diff = false;
        if ($("#alrimShopName").val() !== (NMNS.info.shopName || "")) {
            NMNS.history.push({ id: "info", shopName: NMNS.info.shopName });
            parameters = { shopName: $("#alrimShopName").val() };
            NMNS.info.shopName = parameters.shopName;
            NMNS.socket.emit("update info", parameters);
            changeMainShopName(parameters.shopName);
            parameters = {};
            diff = true;
        }
        if (($("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "Y") || (!$("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "N")) {
            history.useYn = NMNS.info.alrimTalkInfo.useYn;
            parameters.useYn = $("#alrimUseYn").prop("checked") ? "Y" : "N";
            NMNS.info.alrimTalkInfo.useYn = parameters.useYn;
        }
        if ($("#alrimCallbackPhone").val() !== (NMNS.info.alrimTalkInfo.callbackPhone || "")) {
            history.callbackPhone = NMNS.info.alrimTalkInfo.callbackPhone;
            parameters.callbackPhone = $("#alrimCallbackPhone").val();
            NMNS.info.alrimTalkInfo.callbackPhone = parameters.callbackPhone;
        }
        if ($("#alrimCancelDue").val() !== (NMNS.info.alrimTalkInfo.cancelDue || "")) {
            history.cancelDue = NMNS.info.alrimTalkInfo.cancelDue;
            parameters.cancelDue = $("#alrimCancelDue").val();
            NMNS.info.alrimTalkInfo.cancelDue = parameters.cancelDue;
        }
        if ($("#alrimNotice").val() !== (NMNS.info.alrimTalkInfo.notice || "")) {
            history.notice = NMNS.info.alrimTalkInfo.notice;
            parameters.notice = $("#alrimNotice").val();
            NMNS.info.alrimTalkInfo.notice = parameters.notice;
        }
        if (Object.keys(parameters).length) {
            NMNS.history.push(history);
            NMNS.socket.emit("update alrim", parameters);
        }
        if (Object.keys(parameters).length || diff) {
            $("#alrimModal").modal("hide");
        } else {
            showSnackBar("<span>변경된 내역이 없습니다.</span>");
        }
    }

    NMNS.initAlrimModal = function() {
        if (!NMNS.initedAlrimModal) {
            NMNS.initedAlrimModal = true;
            
            //alrimTab
            $("#labelAlrimUseYn").on("touch click", function(){
              $(this).next().children('label').trigger('click');
            })
            $("#alrimNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function() {
                $("#noticeByteCount").text($(this).val().length);
                //$(this).height(0).height(this.scrollHeight > 150 ? 150 : (this.scrollHeight < 60 ? 60 : this.scrollHeight));
            }).on("blur", function(){
                $(this).val(removeNonCharacter($(this).val()));
            });
            $("#alrimUseYn").off("change").on("change", function() {
                if ($(this).prop("checked")) {
                    $("#alrimScreen").hide();
                } else {
                    $("#alrimScreen").show();
                }
            });
            setNumericInput($("#alrimCallbackPhone")[0]);
            $("#alrimInfoBtn").off("touch click").on("touch click", submitAlrimModal);
            
            $("#alrimHistorySearch").off("touch click").on("touch click", function() {
                var parameters = {};
                if ($("#alrimHistoryTarget").val() !== "") {
                    parameters.target = $("#alrimHistoryTarget").val();
                }
                $("#alrimHistoryList .row").remove(); //깜빡임 효과
                NMNS.socket.emit("get alrim history", parameters);
            });
            $("#alrimHistoryTarget").off("keyup").on("keyup", function(e) {
                if (e.which === 13) {
                    $("#alrimHistorySearch").trigger("click");
                }
            });
/*
            var datetimepickerOption = {
                format: "Y-m-d",
                defaultDate: new Date(),
                appendTo: document.getElementById("alrimModal"),
                locale: "ko",
                closeOnSelect: true
            };
            flatpickr("#alrimHistoryStartDate", datetimepickerOption).setDate(moment().subtract(1, "M").toDate());
            flatpickr("#alrimHistoryEndDate", datetimepickerOption).setDate(moment().toDate());
            $("#alrimHistoryName").autocomplete({
                serviceUrl: "get customer info",
                paramName: "name",
                zIndex: 1060,
                maxHeight: 150,
                triggerSelectOnValidInput: false,
                transformResult: function(response, originalQuery) {
                    response.forEach(function(item) {
                        item.data = item.contact;
                        item.value = item.name;
                        delete item.contact;
                        delete item.name;
                    });
                    return { suggestions: response };
                },
                onSearchComplete: function() {},
                formatResult: function(suggestion, currentValue) {
                    return suggestion.value + " (" + dashContact(suggestion.data) + ")";
                },
                onSearchError: function() {},
                onSelect: function(suggestion) {
                    $("#alrimHistoryContact").val(suggestion.data);
                }
            }, NMNS.socket);
            $("#alrimHistoryContact").autocomplete({
                serviceUrl: "get customer info",
                paramName: "contact",
                zIndex: 1060,
                maxHeight: 150,
                triggerSelectOnValidInput: false,
                transformResult: function(response, originalQuery) {
                    response.forEach(function(item) {
                        item.data = item.name;
                        item.value = item.contact;
                        delete item.contact;
                        delete item.name;
                    });
                    return { suggestions: response };
                },
                onSearchComplete: function() {},
                formatResult: function(suggestion, currentValue) {
                    return dashContact(suggestion.value) + " (" + suggestion.data + ")";
                },
                onSearchError: function() {},
                onSelect: function(suggestion) {
                    $("#alrimHistoryName").val(suggestion.data);
                }
            }, NMNS.socket);*/
        }
        refreshAlrimModal();
    }

    function submitInfoModal() {
        //validation start
        if ($(".infoManagerItem input[type='text']").length) { //추가하는것이 있을 경우 이름이 비어있는지 확인
            var cont = true;
            $(".infoManagerItem input[type='text']").each(function() {
                if (!$(this).val().length) {
                    cont = false;
                    $(this).focus();
                }
            });
            if (!cont) {
                alert("담당자의 이름을 입력해주세요.");
                return;
            }
        } else {
            alert("담당자는 최소 1명 이상이 있어야 합니다.");
            return;
        }
        var beginTime = $("#infoBizBeginTime").val()//moment($("#infoBizBeginTime").val(), "HH:mm");
        if (!beginTime) {
            alert("매장 운영 시작시간이 올바르지 않습니다.");
            $("#infoBizBeginTime").focus();
            return;
        }
        var endTime = $("#infoBizEndTime").val()//moment($("#infoBizEndTime").val(), "HH:mm");
        if (!endTime) {
            alert("매장 운영 종료시간이 올바르지 않습니다.");
            $("#infoBizEndTime").focus();
            return;
        }
        if (beginTime.isAfter(endTime, 'hour')) {
            beginTime = [endTime, endTime = beginTime][0];
        }
        if ($("#infoShopName").val() === "" && NMNS.info.alrimTalkInfo.useYn === "Y") {
            alert("알림톡을 사용하고 계실 때는 예약고객에게 보여드릴 매장이름이 반드시 있어야 합니다.\n매장이름을 삭제하고 싶으시다면 알림톡 사용을 먼저 해제해주세요.");
            $("#infoShopName").val(NMNS.info.shopName);
            return;
        }
        //validation end
        //update info start
        var parameters = {},
            history = { id: "info" };
        if ((beginTime.format("HHmm") !== NMNS.info.bizBeginTime) || (endTime.format("HHmm") !== NMNS.info.bizEndTime)) {
            history.hourStart = NMNS.info.bizBeginTime || "0900";
            history.hourEnd = NMNS.info.bizEndTime || "2300";
            parameters.bizBeginTime = beginTime.format("HHmm");
            parameters.bizEndTime = endTime.format("HHmm");
            NMNS.info.bizBeginTime = parameters.bizBeginTime || "0900";
            NMNS.info.bizEndTime = parameters.bizEndTime || "2300";
            NMNS.calendar.setOptions({ week: { hourStart: (parameters.bizBeginTime ? parseInt(parameters.bizBeginTime.substring(0, 2), 10) : NMNS.calendar.getOptions().week.hourStart), hourEnd: (parameters.bizEndTime ? parseInt(parameters.bizEndTime.substring(0, 2), 10) : NMNS.calendar.getOptions().week.hourEnd) } });
        }
        if ($("#infoShopName").val() !== (NMNS.info.shopName || "")) {
            history.shopName = NMNS.info.shopName;
            parameters.shopName = $("#infoShopName").val();
            NMNS.info.shopName = parameters.shopName;
            changeMainShopName(parameters.shopName);
        }
        if ($("#infoBizType").val() !== (NMNS.info.bizType || "")) {
            history.bizType = NMNS.info.bizType;
            parameters.bizType = $("#infoBizType").val();
            NMNS.info.bizType = parameters.bizType;
        }
        if (Object.keys(parameters).length) {
            NMNS.history.push(history);
            NMNS.socket.emit("update info", parameters);
        }
        var diff = false;
        //update info end
        //update manager start
        $(".infoManagerItem").each(function() {
            if ($(this).hasClass("addManagerItem")) { //추가
                diff = true;
                submitAddManager($(this).find("input[type='text']")[0]);
            } else {
                var input = $(this).find("input[type='text']");
                var manager = findManager(input.data("id"));
                if ($(this).data("delete") && manager) { //삭제
                    diff = true;
                    NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().remove(manager.id, function(item, target) { return item.id === target; }));
                    NMNS.history.push({ id: manager.id, bgColor: manager.bgColor, borderColor: manager.borderColor, color: manager.color, name: manager.name });
                    NMNS.socket.emit("delete manager", { id: manager.id });
                } else if (manager) {
                    if (input.data("color") !== manager.bgColor || input.val() !== manager.name) { //수정
                        diff = true;
                        var color = input.data("color");
                        NMNS.calendar.setCalendar(manager.id, { color: color, bgColor: getBackgroundColor(color), borderColor: color, name: input.val() }, true);
                        NMNS.calendar.setCalendarColor(manager.id, { color: color, bgColor: getBackgroundColor(color), borderColor: color }, true);
                        NMNS.history.push({ id: manager.id, color: manager.bgColor, name: manager.name });
                        NMNS.socket.emit("update manager", { id: manager.id, color: color, name: input.val() });
                    }
                }
            }
        });
        if (diff) {
            $("#lnbManagerList").html(generateLnbManagerList(NMNS.calendar.getCalendars()));
            refreshScheduleVisibility();
        }
        //update manager end
        if (diff || Object.keys(parameters).length) {
            $("#infoModal").modal("hide");
        } else {
            showSnackBar("<span>변경된 내역이 없습니다.</span>");
        }
    }

    /*function showColorPickerPopup(self) {
        $("#infoModalColorPicker").css("left", ($("#infoManagerList").position().left + self.position().left) + "px")
            .css("top", ($("#infoManagerList").position().top + self.position().top + 74) + "px")
            .data("target", self.next().data("id"))
            .show(300);
    }*/

    function refreshInfoModal() {
        $("#infoEmail").text(NMNS.email);
        // $("#infoPassword").val("");
        $("#infoAuthStatus").html(NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" ? $(generateAuthStatusBadge(NMNS.info.authStatus)).on("touch click", function() {
            NMNS.socket.emit("send verification", {});
            showSnackBar("<span>인증메일을 보냈습니다. 도착한 이메일을 확인해주세요!</span>");
        }) : generateAuthStatusBadge(NMNS.info.authStatus));
        $("#infoShopName").val(NMNS.info.shopName);
        $("#infoBizType").val(NMNS.info.bizType);
        $("#infoBizBeginTime").val(NMNS.info.bizBeginTime);
        $("#infoBizEndTime").val(NMNS.info.bizEndTime);
        /*var list = $("#infoManagerList");
        if (list.hasClass("ps")) {
            list.children(":not(.ps__rail-x):not(.ps__rail-y)").remove();
            $(generateManagerList(NMNS.calendar.getCalendars())).prependTo(list);
        } else {
            list.html(generateManagerList(NMNS.calendar.getCalendars()));
            list.data("scroll", new PerfectScrollbar(list[0]));
        }*/

        /*$(".infoManagerItem .deleteManager").off("touch click").on("touch click", function() {
            var item = $(this).parents(".infoManagerItem");
            if (item.siblings(".infoManagerItem:visible").length == 0) {
                alert("담당자는 반드시 1명 이상 있어야합니다!");
                return;
            }
            item.hide();
            $(item.siblings(".infoManagerItem:visible")[0]).find("input.form-control").focus();
            item.attr("data-delete", "true");
            $("#infoManagerList").data("scroll").update();
        });
        $(".infoManagerItem input.form-control").off("keyup").on("keyup", function(e) {
            if (e.which === 27) {
                var item = $(this).parents(".infoManagerItem");
                if (item.siblings(".infoManagerItem:visible").length == 0) {
                    return;
                }
                item.hide();
                $(item.siblings(".infoManagerItem:visible")[0]).find("input.form-control").focus();
                item.attr("data-delete", "true");
                $("#infoManagerList").data("scroll").update();
            }
        });
        $(".infoManagerItem .infoManagerColor").off("touch click").on("touch click", function() {
            showColorPickerPopup($(this));
        });*/
    }

    NMNS.initInfoModal = function() {
        if (!NMNS.initedInfoModal) { //first init
            NMNS.initedInfoModal = true;

            /*var html = "";
            NMNS.colorTemplate.forEach(function(item, index) {
                if (index < 21) {
                    html += '<i class="fas fa-circle infoModalColor" data-color="' + item + '" style="color:' + item + '" aria-label="' + item + '"></i>';
                } else {
                    return;
                }
            });
            $("#infoModalColors").html(html);*/
            /*flatpickr("#infoBizBeginTime", {
                dateFormat: "H:i",
                time_24hr: true,
                defaultHour: Number((NMNS.info.bizBeginTime || "0900").substring(0, 2)),
                defaultMinute: Number((NMNS.info.bizBeginTime || "0900").substring(2, 4)),
                minuteIncrement: 10,
                noCalendar: true,
                enableTime: true,
                appendTo: document.getElementById("infoModal"),
                applyBtn: true
            }).setDate(moment((NMNS.info.bizBeginTime ? NMNS.info.bizBeginTime : "0900"), "HHmm").toDate());
            flatpickr("#infoBizEndTime", {
                dateFormat: "H:i",
                time_24hr: true,
                defaultHour: Number((NMNS.info.bizEndTime || "2300").substring(0, 2)),
                defaultMinute: Number((NMNS.info.bizEndTime || "2300").substring(2, 4)),
                minuteIncrement: 10,
                noCalendar: true,
                enableTime: true,
                appendTo: document.getElementById("infoModal"),
                applyBtn: true
            }).setDate(moment((NMNS.info.bizEndTime ? NMNS.info.bizEndTime : "2300"), "HHmm").toDate());*/
            /*if (!$("#infoManagerList").hasClass("ps")) {
                $("#infoManagerList").data("scroll", new PerfectScrollbar("#infoManagerList"));
            }*/

            $("#infoBtn").off("touch click").on("touch click", submitInfoModal);
            /*$("#infoModalColorPickerClose").off("touch click").on("touch click", function() {
                $("#infoModalColorPicker").hide(300);
            });
            $(".infoModalColor").off("touch click").on("touch click", function() {
                var target = $(".infoManagerItem input[data-id='" + $("#infoModalColorPicker").data("target") + "']");
                var color = $(this).attr("data-color");
                if (target.length) {
                    target.data("color", color);
                    target.prev().css("background-color", color).css("border-color", color).data("color", color);
                }
            });*/
            
        }
        refreshInfoModal(); //setting data
    }

    /*function submitNoShowEtcReason(dropdownItem) {
        var input = dropdownItem.children("input");
        var dropdown = dropdownItem.parent();
        NMNS.history.push({ id: dropdown.data("id"), calendarId: dropdown.data("manager"), status: "NOSHOW" });
        NMNS.calendar.updateSchedule(dropdown.data("id"), dropdown.data("manager"), { raw: { status: "NOSHOW" } });
        NMNS.socket.emit("update reserv", { id: dropdown.data("id"), status: "NOSHOW", noShowCase: input.val() });
        var row = $("#noShowScheduleList .row[data-id='" + dropdown.data("id") + "']");
        row.children("span:last-child").html($(generateScheduleStatusBadge("NOSHOW")));
        row.find(".badge, .noShowScheduleNoShow").each(function() {
            $(this).on("touch click", function(e) {
                e.stopPropagation();
                noShowScheduleBadge($(this));
            });
        });
        row.find(".noShowScheduleNormal").on("touch click", function(e) {
            e.stopPropagation();
            noShowScheduleNormal($(this));
        });
        dropdown.hide(300);
    }*/

    function initNoShowModal() {
        if (!NMNS.initedNoShowModal) {
            NMNS.initedNoShowModal = true;
            
            if (!$("#noShowScheduleList").hasClass("ps")) {
              $("#noShowScheduleList").data("scroll", new PerfectScrollbar("#noShowScheduleList", { suppressScrollX: true }));
            }

            $(".noShowAddCase").off("touch click").on("touch click", function() {
              $(this).siblings().removeClass("bg-primary");
              $(this).toggleClass('bg-primary');
              if($(this).parent().is($("#noShowAddContent")) && $("#noShowAddContact").val().trim().length > 0 && ($(this).parent().children('.bg-primary').length > 0 || $(this).siblings('input').val().trim().length > 0)){
                $(this).parent().next().children("span").css('opacity', 1)
              } else if($(this).parent().is($("#noShowScheduleContent")) && $("#noShowScheduleList input:checked").length > 0 && ($(this).parent().children('.bg-primary').length > 0 || $(this).siblings('input').val().trim().length > 0)){
                $(this).parent().next().children("span").css('opacity', 1)
              }else{
                $(this).parent().next().children("span").css('opacity', 0.35)
              }
            });
            $("#noShowAddCaseEtc,#noShowScheduleCaseEtc").on("keyup", function(e){
              $(this).siblings().removeClass('bg-primary')
              if($(this).parent().is($("#noShowAddContent")) && $("#noShowAddContact").val().trim().length > 0 && $(this).val().trim().length > 0){
                $(this).parent().next().children("span").css('opacity', 1)
              } else if($(this).parent().is($("#noShowScheduleContent")) && $("#noShowScheduleList input:checked").length > 0 && $(this).val().trim().length > 0){
                $(this).parent().next().children("span").css('opacity', 1)
              }else{
                $(this).parent().next().children("span").css('opacity', 0.35)
              }
              if(e.which === 13){
                $(this).parent().next().trigger("click");
              }
            })
            $("#noShowAddBtn").off("touch click").on("touch click", function() {
              if ($("#noShowAddContact").val() === "") {
                showSnackBar("<span>저장할 전화번호를 입력해주세요!</span>");
                return;
              }else if($("#noShowAddContent .noShowAddCase.bg-primary").length === 0 && $("#noShowAddCaseEtc").val().trim().length === 0){
                showSnackBar("<span>노쇼 사유를 선택해주세요.</span>");
                return;
              }
              NMNS.socket.emit("add noshow", { id: NMNS.email + generateRandom(), contact: $("#noShowAddContact").val(), noShowCase: $("#noShowAddContent .bg-primary").length === 0 ? $("#noShowAddCaseEtc").val().trim() : $("#noShowAddContent .bg-primary").data("value") });
            });

            $("#noShowScheduleBtn").off("touch click").on("touch click", function(){
              if($("#noShowScheduleList input:checked").length === 0){
                showSnackBar("<span>노쇼로 등록할 예약을 선택해주세요.</span>");
                return;
              }else if($("#noShowScheduleContent .noShowAddCase.bg-primary").length === 0 && $("#noShowScheduleCaseEtc").val().trim().length === 0){
                showSnackBar("<span>노쇼 사유를 선택해주세요.</span>");
                return;
              }
              var item = $("#noShowScheduleList input:checked").parent().parent();
              NMNS.history.push({id:item.data('id'), status:item.data('status'), manager:item.data('manager'), contents:item.data('contents')})
              NMNS.socket.emit("update reserv", {id:item.data("id"), status:"NOSHOW", noShowCase:($("#noShowScheduleContent .noShowAddCase.bg-primary").length > 0? $("#noShowScheduleContent .noShowAddCase.bg-primary").data('value') : $("#noShowScheduleCaseEtc").val().trim())})
            })
            $("#noShowScheduleSearch").off("touch click").on("touch click", function() {
                var parameters = {};
                if ($("#noShowScheduleTarget").val() !== "") {
                    parameters.target = $("#noShowScheduleTarget").val();
                }
                $("#noShowScheduleList .row").remove(); //깜빡임 효과
                NMNS.socket.emit("get summary", parameters);
            });
            setNumericInput(
              $("#noShowAddContact").on("keyup", function(e) {
                  if (e.which === 13) {
                      $("#noShowAddBtn").trigger("click");
                  }
              })[0]
            );

            $("#noShowTabList a[href='#noShowSchedule']").on("show.bs.tab", function(){
              $("#noShowScheduleSearch").trigger('click');
            });
            $("#noShowAddContact").autocomplete({
                serviceUrl: "get customer info",
                paramName: "contact",
                zIndex: 1060,
                maxHeight: 150,
                triggerSelectOnValidInput: false,
                transformResult: function(response, originalQuery) {
                    response.forEach(function(item) {
                        item.data = item.name;
                        item.value = item.contact;
                        delete item.contact;
                        delete item.name;
                    });
                    return { suggestions: response };
                },
                onSearchComplete: function() {},
                formatResult: function(suggestion, currentValue) {
                    return dashContact(suggestion.value) + " (" + suggestion.data + ")";
                },
                onSearchError: function() {},
                onSelect: function(suggestion) {}
            }, NMNS.socket);

            $("#noShowScheduleTarget").on("keyup", function(e){
              if (e.which === 13) {
                  $("#noShowScheduleSearch").trigger("click");
              }
            }).autocomplete({
                serviceUrl: "get customer info",
                paramName: "target",
                zIndex: 1060,
                maxHeight: 150,
                triggerSelectOnValidInput: false,
                transformResult: function(response, originalQuery) {
                    response.forEach(function(item) {
                        item.data = item.contact;
                        item.value = item.name;
                        delete item.contact;
                        delete item.name;
                    });
                    return { suggestions: response };
                },
                onSearchComplete: function() {},
                formatResult: function(suggestion, currentValue) {
                    return suggestion.value + " (" + dashContact(suggestion.data) + ")";
                },
                onSearchError: function() {},
                onSelect: function(suggestion) {
                    $("#noShowScheduleContact").val(suggestion.data);
                }
            }, NMNS.socket);
        } else {
            $("#noShowAddContact").autocomplete().clearCache();
            $("#noShowSearchContact").autocomplete().clearCache();
            $("#noShowScheduleName").autocomplete().clearCache();
            $("#noShowScheduleContact").autocomplete().clearCache();
        }
    }

    function generateTaskManagerList() {
        var html = "";
        NMNS.calendar.getCalendars().forEach(function(item) {
            html += "<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='" + item.id + "' data-color='" + item.color + "'>" +
                "<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + item.color + "'></span>" +
                "<span class='tui-full-calendar-content'>" + item.name + "</span>" +
                "</button>";
        });
        return html;
    }
    
    function generateContentsList(contents){
      var html = "";
      if(typeof contents === 'string'){
        try{
          contents = JSON.parse(contents);
        }catch(error){
          contents = [contents];
        }
      }else if(!Array.isArray(contents)){
        contents = [contents];
      }
      var inputs = $('#scheduleTabContents input').toArray();
      contents.filter(function(item){
        return !inputs.find(function(input){return input.value === (item && item.value || item)});
      }).forEach(function(item){
        var temp = inputs.find(function(input){return input.value === '' || !input.value})
        if(temp){
          $(temp).data('menu-id', item?item.menuId:null).val(item && item.value || item);
          return;
        }
        html += '<div class="row mx-0 col-12 px-0"><input type="text" class="form-control form-control-sm han col" name="scheduleContents" aria-label="예약 내용" placeholder="예약 내용을 직접 입력하거나 메뉴에서 선택하세요." autocomplete="off" list="scheduleTabContentList" value="'
          +(item && item.value || item)+'" '+(item && item.menuId? ('data-menu-id="'+item.menuId+'"') : '')+'><button type="button" class="btn btn-sm btn-form ml-2 deleteScheduleContents">삭제</button></div>';
      });
      return html;
    }

    function removeContent(target){
      if($("#scheduleTabContents .row").length === 1){
        $(target).prev().data('menu-id', null).val('');
      }else{
        $(target).parent().remove();
      }
    }
    
    function generateMenuList(menuList){
      var html = '';
      menuList.forEach(function(item){
        html += '<options value="'+item.menuId+'">'+item.menuName+'</option>';
      });
      return html;
    }
    
    function refreshScheduleTab(e){
      var calendar;
      if(NMNS.refreshScheduleManager){
        NMNS.refreshScheduleManager = false;
        $("#scheduleManager").next().html(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
          $("#scheduleManager").data("calendar-id", $(this).data("calendar-id")).data("color", $(this).data("color")).html($(this).html());
        });
      }
      if(NMNS.refreshMenu){
        NMNS.refreshMenu = false;
        NMNS.socket.emit('get menu list');//TODO : needed api alignment
        $("#scheduleTabContentList").html(generateMenuList([{menuId:'1234', menuName:'테스트 메뉴'}]))//for test
      }
      $("#scheduleBtn").text(e && e.schedule ? "예약 변경 완료" : "예약 추가 완료");
      
      $("#scheduleTab").data('contact', e && e.schedule? e.schedule.raw.contact : null).data('name', e && e.schedule?e.schedule.title : '');
      if(typeof e === 'object'){// dragged calendar / update schedule
        console.log(e);
        document.getElementById('scheduleStartDate')._flatpickr.setDate(e.schedule?e.schedule.start.toDate():e.start.toDate());
        document.getElementById('scheduleEndDate')._flatpickr.setDate(e.schedule?e.schedule.end.toDate():e.end.toDate());
        $("#scheduleStartTime").val(getTimeFormat(moment(e.schedule?e.schedule.start.toDate():e.start.toDate())));
        $("#scheduleEndTime").val(getTimeFormat(moment(e.schedule?e.schedule.end.toDate():e.end.toDate())));
  
        $('#scheduleName').val(e.schedule?e.schedule.title : '');
        $("#scheduleTabContents").append(generateContentsList(e.schedule && e.schedule.raw ?e.schedule.raw.contents : "")).find('button').off('touch click').on('touch click', function(){
          removeContent(this);
        });
        
        //$('#scheduleContents').val(e.schedule? (e.schedule.raw? e.schedule.raw.contents : e.schedule.contents) : '');
        $('#scheduleContact').val(e.schedule? (e.schedule.raw ? e.schedule.raw.contact : e.schedule.contact) : '');
        $('#scheduleEtc').val(e.schedule? (e.schedule.raw ? e.schedule.raw.etc : e.schedule.etc) : '');
        $('#scheduleAllDay').attr('checked', e.schedule?e.schedule.isAllDay : e.isAllDay);
        
        calendar = e.schedule ? NMNS.calendar.getCalendars().find(function(item) {
            return item.id === e.schedule.calendarId;
        }) : NMNS.calendar.getCalendars()[0];
        if (!calendar) {
          $('#scheduleManager').html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + e.schedule.color + "'></span><span class='tui-full-calendar-content'>(삭제된 담당자)</span>").data('calendar-id', e.schedule.calendarId).data('color', e.schedule.color);
        }else{
          calendar = $('#scheduleManagerList').find("button[data-calendar-id='" + calendar.id + "']");
          $('#scheduleManager').html(calendar.html()).data('calendar-id', calendar.data('calendarId')).data('color', calendar.data('color'));
        }
      }else if(typeof e === 'string'){//switching from task tab : copy data
        document.getElementById("scheduleStartDate")._flatpickr.setDate(document.getElementById('taskStartDate')._flatpickr.selectedDates[0]);
        $("#scheduleStartTime").val($("#taskStartTime").val());
        document.getElementById("scheduleEndDate")._flatpickr.setDate(document.getElementById('taskEndDate')._flatpickr.selectedDates[0]);
        $("#scheduleEndTime").val($("#taskEndTime").val());
        $("#scheduleAllDay").prop('checked', $("#taskAllDay").prop('checked'));
        calendar = $("#taskManager");
        $("#scheduleManager").data("calendar-id", calendar.data("calendar-id")).data("color", calendar.data("color")).html(calendar.html());
      }else{// creating...
        var now = moment();
        if (now.hour() > Number(NMNS.info.bizEndTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizEndTime.substring(0, 2)) && now.minute() + 30 > Number(NMNS.info.bizEndTime.substring(2)))) {
            now = moment(NMNS.info.bizEndTime, "HHmm").subtract(30, "m");
        } else if (now.hour() < Number(NMNS.info.bizBeginTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizBeginTime.substring(0, 2)) && now.minute() < Number(NMNS.info.bizBeginTime.substring(2)))) {
            now = moment(NMNS.info.bizBeginTime, "HHmm");
        } else {
            now.minute(Math.ceil(now.minute() / 10) * 10);
        }
        document.getElementById("scheduleStartDate")._flatpickr.setDate(now.toDate());
        $("#scheduleStartTime").val(getTimeFormat(now));
        document.getElementById("scheduleEndDate")._flatpickr.setDate(now.add(30, "m").toDate());
        $("#scheduleEndTime").val(getTimeFormat(now));

        $('#scheduleName').val('');
        $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
          removeContent(this);
        });;
        $('#scheduleContact').val('');
        $('#scheduleAllDay').attr('checked', false);
        
        calendar = NMNS.calendar.getCalendars()[0].id;
        $('#scheduleManager').html($('#scheduleManager').next().find("button[data-calendar-id='" + calendar + "']").html()).data('calendarid', calendar);
      }
    }

    function initScheduleTab(e){
      if(!$("#scheduleStartDate")[0]._flatpickr){
        var datetimepickerOption = {
            dateFormat: "Y. m. d",
            defaultDate: new Date(),
            locale: "ko"
        };
        flatpickr("#scheduleStartDate", datetimepickerOption);
        flatpickr("#scheduleEndDate", datetimepickerOption);
        $("#scheduleAddContents").on("touch click", function(){
          $("#scheduleTabContents").append('<input type="text" class="form-control form-control-sm han" name="scheduleContents" aria-label="예약 내용" placeholder="예약 내용을 직접 입력하거나 메뉴에서 선택하세요." list="scheduleTabContentList">');
        });

        var autoCompleteOption = {
          lookup:[{value:"오전 00:00"},{value:"오전 00:30"},{value:"오전 01:00"},{value:"오전 01:30"},{value:"오전 02:00"},{value:"오전 02:30"},{value:"오전 03:00"},{value:"오전 03:30"},{value:"오전 04:00"},{value:"오전 04:30"},{value:"오전 05:00"},{value:"오전 05:30"},{value:"오전 06:00"},{value:"오전 06:30"},{value:"오전 07:00"},{value:"오전 07:30"},{value:"오전 08:00"},{value:"오전 08:30"},{value:"오전 09:00"},{value:"오전 09:30"},{value:"오전 10:00"},{value:"오전 10:30"},{value:"오전 11:00"},{value:"오전 11:30"},{value:"오후 12:00"},{value:"오후 12:30"},{value:"오후 01:00"},{value:"오후 01:30"},{value:"오후 02:00"},{value:"오후 02:30"},{value:"오후 03:00"},{value:"오후 03:30"},{value:"오후 04:00"},{value:"오후 04:30"},{value:"오후 05:00"},{value:"오후 05:30"},{value:"오후 06:00"},{value:"오후 06:30"},{value:"오후 07:00"},{value:"오후 07:30"},{value:"오후 08:00"},{value:"오후 08:30"},{value:"오후 09:00"},{value:"오후 09:30"},{value:"오후 10:00"},{value:"오후 10:30"},{value:"오후 11:00"},{value:"오후 11:30"}],
          maxHeight:175,
          triggerSelectOnValidInput: false,
          zIndex:1060
        };        
        $('#scheduleStartTime').autocomplete(autoCompleteOption);
        $("#scheduleEndTime").autocomplete(autoCompleteOption);
        var timeout;
        function onContactBlur() {
            clearTimeout(timeout);
            if ($('#scheduleContact').val().length > 9 || $('#scheduleName').val() !== '') {
                NMNS.socket.emit('get customer', {
                    name: $('#scheduleName').val(),
                    contact: $('#scheduleContact').val()
                });
            }
        }
        $('#scheduleName').autocomplete({
            serviceUrl: 'get customer info',
            paramName: 'name',
            zIndex: 1060,
            maxHeight: 150,
            triggerSelectOnValidInput: false,
            transformResult: function(response) {
                response.forEach(function(item) {
                    item.data = item.contact;
                    item.value = item.name;
                    delete item.contact;
                    delete item.name;
                });

                return { suggestions: response };
            },
            onSearchComplete: function() {},
            formatResult: function(suggestion) {
                return suggestion.value + ' (' + dashContact(suggestion.data) + ')';
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {
                $('#scheduleContact').val(suggestion.data).trigger('blur');
            }
        }, NMNS.socket).on('blur', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                onContactBlur();
            }, 300);
        });

        setNumericInput($('#scheduleContact').autocomplete({
            serviceUrl: 'get customer info',
            paramName: 'contact',
            zIndex: 1060,
            maxHeight: 150,
            triggerSelectOnValidInput: false,
            transformResult: function(response) {
                response.forEach(function(item) {
                    item.data = item.name;
                    item.value = item.contact;
                    delete item.contact;
                    delete item.name;
                });

                return { suggestions: response };
            },
            onSearchComplete: function() {},
            formatResult: function(suggestion) {
                return suggestion.value + ' (' + dashContact(suggestion.data) + ')';
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {
                $('#scheduleName').val(suggestion.data);
                onContactBlur();
            }
        }, NMNS.socket).on('blur', function() {
            filterNonNumericCharacter($('#scheduleContact'));
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                onContactBlur();
            }, 300);
        })[0]);
        
        $("#scheduleBtn").on("touch click", function(){
          var title, isAllDay, startDate, endDate, startTime, endTime, contents, contact, etc, calendarId, manager;
          try {
            startDate = $('#scheduleStartDate')[0]._flatpickr.selectedDates[0];
            endDate = $('#scheduleEndDate')[0]._flatpickr.selectedDates[0];
            if(!moment(startDate).isValid()){
              showSnackBar("시작 일자를 확인해주세요.");
              return;
            }else if(!moment(endDate).isValid()){
              showSnackBar("종료 일자를 확인해주세요.");
              return;
            }
          } catch (e) {
              if (!startDate || !endDate) {
                showSnackBar('시간을 입력해주세요!');
                return;
              }
          }
          startTime = parseTime($("#scheduleStartTime").val());
          endTime = parseTime($("#scheduleEndTime").val());
          if(!startTime){
            showSnackBar("시작 시간을 확인해주세요.");
            return;
          }
          if(!endTime){
            showSnackBar("종료 시간을 확인해주세요.");
            return;
          }
          startDate.setHours(startTime.substring(0,2)*1);
          startDate.setMinutes(startTime.substring(2)*1);
          endDate.setHours(endTime.substring(0,2)*1);
          endDate.setMinutes(endTime.substring(2)*1);
          
          calendarId = $('#scheduleManager').data('calendar-id');
          manager = NMNS.calendar.getCalendars().find(function(cal) {
              return cal.id === calendarId;
          });
          if(!manager){
            showSnackBar('담당자를 지정해주세요.');
            return;
          }
      
          if (startDate.getTime() > endDate.getTime()) { // swap two dates
              startDate = [endDate, endDate = startDate][0];
          }
      
          title = $('#scheduleName').val();
          contents = JSON.stringify($("#scheduleTabContents input").filter(function(){return this.value !== ''}).map(function(){return {menuId:this.getAttribute('data-menu-id') || (NMNS.menuList? NMNS.menuList.find(function(menu){return menu.menuName === this.value}): undefined), value:this.value}}).toArray());
          contact = $('#scheduleContact').val();
          etc = $('#scheduleEtc').val();
          isAllDay = $('#scheduleAllDay').prop('checked');

          if (NMNS.info.alrimTalkInfo.useYn === 'Y' && !(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test(contact))) {
              if (!confirm('입력하신 전화번호는 알림톡을 보낼 수 있는 전화번호가 아닙니다. 그래도 등록하시겠어요?')) {
                  return;
              }
          }
      
          if (NMNS.scheduleTarget && NMNS.scheduleTarget.schedule) {
              var origin = NMNS.scheduleTarget.schedule;
              origin.manager = origin.calendarId;
              NMNS.history.push(origin);
              if (origin.calendarId !== calendarId) { //담당자 변경
                  origin.newCalendarId = calendarId
                  NMNS.calendar.deleteSchedule(origin.id, origin.manager, true);
                  
                  NMNS.calendar.createSchedules([{
                      id: origin.id,
                      calendarId: calendarId,
                      title: title,
                      start: startDate,
                      end: endDate,
                      isAllDay: false,//하루종일 항목 없앰
                      category: "time",
                      attendees: [],
                      recurrenceRule: false,
                      isPending: false,
                      dueDateClass: "",
                      color: manager.color,
                      isFocused: false,
                      isVisible: true,
                      isReadOnly: false,
                      isPrivate: false,
                      customStyle: "",
                      location: "",
                      bgColor: getBackgroundColor(manager.color),
                      borderColor: manager.color,
                      dragBgColor: manager.bgColor || "#334150",
                      raw: {
                        contact: contact,
                        contents: contents,
                        etc: etc,
                        status: "RESERVED"
                      }
                  }]);
              } else { //담당자 유지
                  NMNS.calendar.updateSchedule(origin.id, origin.calendarId, {
                      title: title,
                      start: startDate,
                      end: endDate,
                      raw:{
                        contents: contents,
                        contact: contact
                      }
                  });
              }
              NMNS.socket.emit("update reserv", { //서버로 요청
                  id: origin.id,
                  manager: calendarId,
                  name: title,
                  start: moment(startDate).format("YYYYMMDDHHmm"),
                  end: moment(endDate).format("YYYYMMDDHHmm"),
                  contents: contents,
                  contact: contact,
                  isAllDay: isAllDay
              });
          } else { //신규 예약 추가
              var id = NMNS.email + generateRandom();
              NMNS.calendar.createSchedules([{
                  id: id,
                  calendarId: calendarId,
                  title: title,
                  start: startDate,
                  end: endDate,
                  isAllDay: false,//하루종일 항목 없앰
                  category: "time",
                  attendees: [],
                  recurrenceRule: false,
                  isPending: false,
                  dueDateClass: "",
                  color: manager.color,
                  isFocused: false,
                  isVisible: true,
                  isReadOnly: false,
                  isPrivate: false,
                  customStyle: "",
                  location: "",
                  bgColor: getBackgroundColor(manager.color),
                  borderColor: manager.color,
                  dragBgColor: manager.bgColor || "#334150",
                  raw: {
                    contact: contact,
                    contents: contents,
                    etc: etc,
                    status: "RESERVED"
                  }
              }]);
              NMNS.history.push({
                  id: id,
                  manager: calendarId
              });
              NMNS.socket.emit("add reserv", {
                  id: id,
                  manager: calendarId,
                  name: title,
                  start: moment(startDate).format("YYYYMMDDHHmm"),
                  end: moment(endDate).format("YYYYMMDDHHmm"),
                  isAllDay: isAllDay,
                  type: "R",
                  bgColor: getBackgroundColor(manager.color),
                  borderColor: manager.color,
                  dragBgColor: manager.bgColor || "#334150",
                  color: manager.color,
                  contact: contact,
                  contents: contents,
                  etc: etc,
                  status: "RESERVED"
              });
          }
      
          $("#scheduleModal").modal('hide');
        })
      }
      refreshScheduleTab(e);
    }
  
    function refreshTaskTab(task){
      var calendar;
      if(NMNS.refreshTaskManager){
        NMNS.refreshTaskManager = false;
        $("#taskManager").next().html(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#taskManager").data("calendar-id", $(this).data("calendar-id")).data("color", $(this).data("color")).html($(this).html());
        });
      }
      $("#taskBtn").text(task && task.id ? "일정 변경 완료" : "일정 추가 완료")
      if (typeof task === 'object') { // update existing task
      
        $("#taskTab").data("edit", task.id ? true : false).data("task", task);
        document.getElementById("taskStartDate")._flatpickr.setDate(moment(task.start, 'YYYYMMDDHHmm').toDate());
        document.getElementById("taskEndDate")._flatpickr.setDate(moment(task.end, 'YYYYMMDDHHmm').toDate());
        
        var autoCompleteOption = {
          lookup:[{value:"오전 00:00"},{value:"오전 00:30"},{value:"오전 01:00"},{value:"오전 01:30"},{value:"오전 02:00"},{value:"오전 02:30"},{value:"오전 03:00"},{value:"오전 03:30"},{value:"오전 04:00"},{value:"오전 04:30"},{value:"오전 05:00"},{value:"오전 05:30"},{value:"오전 06:00"},{value:"오전 06:30"},{value:"오전 07:00"},{value:"오전 07:30"},{value:"오전 08:00"},{value:"오전 08:30"},{value:"오전 09:00"},{value:"오전 09:30"},{value:"오전 10:00"},{value:"오전 10:30"},{value:"오전 11:00"},{value:"오전 11:30"},{value:"오후 12:00"},{value:"오후 12:30"},{value:"오후 01:00"},{value:"오후 01:30"},{value:"오후 02:00"},{value:"오후 02:30"},{value:"오후 03:00"},{value:"오후 03:30"},{value:"오후 04:00"},{value:"오후 04:30"},{value:"오후 05:00"},{value:"오후 05:30"},{value:"오후 06:00"},{value:"오후 06:30"},{value:"오후 07:00"},{value:"오후 07:30"},{value:"오후 08:00"},{value:"오후 08:30"},{value:"오후 09:00"},{value:"오후 09:30"},{value:"오후 10:00"},{value:"오후 10:30"},{value:"오후 11:00"},{value:"오후 11:30"}],
          maxHeight:175,
          triggerSelectOnValidInput: false,
          zIndex:1060
        };
        $('#taskStartTime').autocomplete(autoCompleteOption).val(getTimeFormat(moment(task.start, 'YYYYMMDDHHmm')));
        $("#taskEndTime").autocomplete(autoCompleteOption).val(getTimeFormat(moment(task.end, 'YYYYMMDDHHmm')));
        
        $("#taskName").val(task.title || "");
        $("#taskContents").val(task.raw ? task.raw.contents || "" : "");
        calendar = task.calendarId ? NMNS.calendar.getCalendars().find(function(item) {
            return item.id === task.calendarId;
        }) : NMNS.calendar.getCalendars()[0];
        if (!calendar) {
          $('#taskManager').html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + task.color + "'></span><span class='tui-full-calendar-content'>(삭제된 담당자)</span>").data('calendar-id', task.calendarId).data('color', task.color);
        }else{
          calendar = $('#taskManager').next().find("button[data-calendar-id='" + calendar.id + "']");
          $('#taskManager').html(calendar.html()).data('calendar-id', calendar.data('calendar-id')).data('color', calendar.data('color'));
        }

      } else if(typeof task === 'string'){// switched from schedule tab : copy data

        document.getElementById("taskStartDate")._flatpickr.setDate(document.getElementById('scheduleStartDate')._flatpickr.selectedDates[0]);
        $("#taskStartTime").val($("#scheduleStartTime").val());
        document.getElementById("scheduleEndDate")._flatpickr.setDate(document.getElementById('taskEndDate')._flatpickr.selectedDates[0]);
        $("#taskEndTime").val($("#scheduleEndTime").val());
        $("#taskAllDay").prop('checked', $("#scheduleAllDay").prop('checked'));
        calendar = $("#scheduleManager");
        $("#taskManager").data("calendar-id", calendar.data("calendar-id")).data("color", calendar.data("color")).html(calendar.html());

      } else {

        $("#taskTab").data("edit", false).removeData("task");
        var now = moment();
        if (now.hour() > Number(NMNS.info.bizEndTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizEndTime.substring(0, 2)) && now.minute() + 30 > Number(NMNS.info.bizEndTime.substring(2)))) {
            now = moment(NMNS.info.bizEndTime, "HHmm").subtract(30, "m");
        } else if (now.hour() < Number(NMNS.info.bizBeginTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizBeginTime.substring(0, 2)) && now.minute() < Number(NMNS.info.bizBeginTime.substring(2)))) {
            now = moment(NMNS.info.bizBeginTime, "HHmm");
        } else {
            now.minute(Math.ceil(now.minute() / 10) * 10);
        }
        document.getElementById("taskStartDate")._flatpickr.setDate(now.toDate());
        $("#taskStartTime").val(getTimeFormat(now));
        document.getElementById("taskEndDate")._flatpickr.setDate(now.add(30, "m").toDate());
        $("#taskEndTime").val(getTimeFormat(now));

        $("#taskName").val("");
        $("#taskContents").val("");
        calendar = NMNS.calendar.getCalendars()[0].id;
        calendar = $('#taskManager').next().find("button[data-calendar-id='" + calendar + "']");
        $('#taskManager').html(calendar.html()).data('calendarid', calendar.data('calendarId')).data('color', calendar.data('color'));
        
      }
    }

    function initTaskTab(task) {
      if (!$("#taskStartDate")[0]._flatpickr) {
        var datetimepickerOption = {
            dateFormat: "Y. m. d",
            enableTime: false,
            defaultDate: new Date(),
            locale: "ko"
        };
        flatpickr("#taskStartDate", datetimepickerOption);
        flatpickr("#taskEndDate", datetimepickerOption);
        $("#taskBtn").on("touch click", function() {
          if ($("#taskName").val() === "") {
              alert("일정 이름을 입력해주세요!");
              $("#taskName").focus();
              return;
          }
          var id, start = $("#taskStartDate")[0]._flatpickr.selectedDates[0],
              end = $("#taskEndDate")[0]._flatpickr.selectedDates[0];
          if (start.getTime() > end.getTime()) {
              start = [end, end = start][0];
          }
          if ($("#taskTab").data("edit")) {
              var origin = $("#taskTab").data("task");
              origin.manager = origin.calendarId;
              NMNS.history.push(origin);
              if (origin.calendarId !== $("#taskManager").data("calendar-id")) { //담당자 변경
                  origin.newCalendarId = $("#taskManager").data("calendar-id");
                  NMNS.calendar.deleteSchedule(origin.id, origin.manager, true);
                  NMNS.calendar.createSchedules([{
                      id: origin.id,
                      calendarId: $("#taskManager").data("calendar-id"),
                      title: $("#taskName").val(),
                      start: start,
                      end: end,
                      isAllDay: false,//하루종일 항목 없앰
                      category: "task",
                      dueDateClass: "",
                      color: $("#taskManager").data("bgcolor"),
                      bgColor: getBackgroundColor($("#taskManager").data("bgcolor")),
                      borderColor: $("#taskManager").data("bgcolor"),
                      raw: {
                          status: "RESERVED"
                      }
                  }]);
              } else { //담당자 유지
                  NMNS.calendar.updateSchedule(origin.id, origin.calendarId, {
                      title: $("#taskName").val(),
                      start: start,
                      end: end,
                      isAllDay: false,//하루종일 항목 없앰
                  });
              }
              NMNS.socket.emit("update reserv", { //서버로 요청
                  id: origin.id,
                  manager: $("#taskManager").data("calendar-id"),
                  name: $("#taskName").val(),
                  start: moment(start).format("YYYYMMDDHHmm"),
                  end: moment(end).format("YYYYMMDDHHmm"),
                  type: 'T',
                  isAllDay: $("#taskAllDay").prop('checked')
              });
          } else { //신규 일정 추가
              if(typeof NMNS.scheduleTarget.clearGuideElement === 'function'){
                NMNS.scheduleTarget.clearGuideElement();
              }
              id = NMNS.email + generateRandom();
              NMNS.calendar.createSchedules([{
                  id: id,
                  calendarId: $("#taskManager").data("calendar-id"),
                  title: $("#taskName").val(),
                  start: start,
                  end: end,
                  isAllDay: false,//하루종일 항목 없앰
                  category: "task",
                  dueDateClass: "",
                  color: $("#taskManager").data("bgcolor"),
                  bgColor: getBackgroundColor($("#taskManager").data("bgcolor")),
                  borderColor: $("#taskManager").data("bgcolor"),
                  raw: {
                      status: "RESERVED"
                  }
              }]);
              NMNS.history.push({
                  id: id,
                  manager: $("#taskManager").data("calendar-id")
              });
              NMNS.socket.emit("add reserv", {
                  id: id,
                  manager: $("#taskManager").data("calendar-id"),
                  name: $("#taskName").val(),
                  start: moment(start).format("YYYYMMDDHHmm"),
                  end: moment(end).format("YYYYMMDDHHmm"),
                  isAllDay: $("#taskAllDay").prop('checked'),
                  type: "T",
                  status: "RESERVED"
              });
          }
          $("#scheduleModal").modal("hide");
        });
      }
      refreshTaskTab(task);
    }

    function setEventListener() {
        $('.moveDate').on('touch click', onClickNavi); //prev, next
        $('.calendarType').on('touch click', onClickMenu); //calendar type
        $("#calendarTypeMenu").next().children("a").on("touch click", function(e) { //calendar type on mobile
            e.preventDefault();
            var target = $(e.target);
            if (!target.hasClass("dropdown-item")) {
                target = target.parents(".dropdown-item");
            }
            $("#calendarTypeMenu").html(target.html());
            $("#calendarTypeMenu").attr("data-action", target.data("action"));
            $("#calendarTypeMenu").trigger("click");
        });
        $('#managerElements').on('change', onChangeManagers);// toggle schedules of manager

        $('#dropdownMenu-calendars-list').on('touch click', onChangeNewScheduleCalendar);
        $(".addReservLink").on("touch click", createNewSchedule);

        $(".addNoShowLink").one("touch click", initNoShowModal);
        window.addEventListener('resize', debounce(function(){NMNS.calendar.render();}, 200));
        flatpickr.localize("ko");
        
        $(".taskMenu").on("touch click", onClickTask);// toggle task column
        $('#sidebarToggler').on('touch click', function(){// toggle side menu
          if($('#mainAside').hasClass('sidebar-toggled')){// about to show aside
            if($("#mainTask").hasClass("show")){
              $("#mainAside").css('minWidth', '270px');
            }
          }else{// about to hide aside
            $("#mainAside").css('minWidth', 'unset');
          }
          $('#mainAside').toggleClass('sidebar-toggled')
          $('#mainAside .menu-collapsed').toggle();
        })
        $(".announcementMenuLink").popover({
          template:'<div class="popover" role="tooltip" style="width:375px"><div class="arrow"></div><div class="d-flex align-items-center" style="padding:25px 30px;border-bottom:1px solid rgba(58, 54, 54, 0.35)"><span style="font-size:18px;font-weight:bold">알림</span><span class="close-button ml-auto cursor-pointer">&times;</span></div><div id="announcementBody">알림을 불러오는 중입니다...</div></div>',
          html:true,
          sanitize:false,
          placement:'auto'
        })
        $("#mainMenu").popover({
          template:'<div class="popover" role="tooltip"><div class="arrow"></div><div><ul style="padding: 25px 30px;margin:0"><li class="mainMenuRow"><a class="d-block" data-link="#infoModal" data-toggle="modal" href="#" aria-label="내 매장 정보">내 매장 정보</a></li><li class="mainMenuRow"><a class="d-block" data-link="#alrimModal" data-toggle="modal" href="#" aria-label="알림톡 정보">알림톡 정보</a></li><li class="mainMenuRow"><a class="d-block" data-link="#userModal" data-toggle="modal" href="#" aria-label="내 계정 정보">내 계정 정보</a></li><li class="mainMenuRow"><a id="signoutLink" class="d-block" href="/signout" aria-label="로그아웃">로그아웃</a></li></ul></div></div>',
          html:true,
          sanitize:false,
          placement:'bottom'
        })
        setNumericInput(
          $("#searchNoShow").on("keyup", function(e){
            if(e.keyCode === 13 || e.which === 13){
              if($(this).val().length === 11 || $(this).val().length === 10){
                switchMenu.apply(this, e);
                NMNS.socket.emit("get noshow", {contact:$(this).val(), mine:false});
              }else{
                showSnackBar("전화번호를 정확히 입력해주세요.");
              }
            }
          })[0]
        );
        $("#searchNoShow").autocomplete({
            serviceUrl: "get customer info",
            paramName: "contact",
            zIndex: 1060,
            maxHeight: 150,
            triggerSelectOnValidInput: false,
            transformResult: function(response, originalQuery) {
                response.forEach(function(item) {
                    item.data = item.name;
                    item.value = item.contact;
                    delete item.contact;
                    delete item.name;
                });
                return { suggestions: response };
            },
            onSearchComplete: function() {},
            formatResult: function(suggestion, currentValue) {
                return dashContact(suggestion.value) + " (" + suggestion.data + ")";
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {}
        }, NMNS.socket);
        if(/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){//safari - datalist polyfill
          if (!document.getElementById("datalistPolyfillScript")) {
            var script = document.createElement("script");
            script.src = "/lib/datalist-polyfill/datalist-polyfill.min.js";
            script.id = "datalistPolyfillScript";
            document.body.appendChild(script);
          }
        }
    }

    function getSchedule(start, end) {
        NMNS.socket.emit("get reserv", { start: toYYYYMMDD(start._date) + "0000", end: toYYYYMMDD(end._date) + "2359" });
    }

    function drawSchedule(data) {
        NMNS.calendar.createSchedules(data.map(function(schedule) { //mapping server data to client data
            if (schedule.raw) {
                if (typeof schedule.start === "string") schedule.start = moment(schedule.start, "YYYYMMDDHHmm").toDate();
                if (typeof schedule.end === "string") schedule.end = moment(schedule.end, "YYYYMMDDHHmm").toDate();
                return schedule;
            }
            var manager = findManager(schedule.manager || schedule.calendarId) || {};
            return {
                id: schedule.id,
                calendarId: manager.id || "A1", //schedule.manager,
                title: schedule.name || schedule.title, //?schedule.name:(schedule.contact?schedule.contact:schedule.content),
                start: (typeof schedule.start === "string" ? moment(schedule.start, "YYYYMMDDHHmm").toDate() : schedule.start),
                end: (typeof schedule.end === "string" ? moment(schedule.end, "YYYYMMDDHHmm").toDate() : schedule.end),
                isAllDay: false,//하루종일 항목 없앰
                category: (schedule.type === "T" ? "task" : (schedule.isAllday ? "allday" : "time")),
                dueDateClass: (schedule.type === "T" ? "dueDateClass" : ""),
                attendees: [],
                recurrenceRule: false,
                isPending: schedule.isCanceled,
                isFocused: false,
                isVisible: true,
                isReadOnly: false,
                isPrivate: false,
                customStyle: "",
                location: "",
                bgColor: getBackgroundColor(manager.color || "#334150"),
                borderColor: manager.borderColor || "#334150",
                color: manager.color || "#334150",
                dragBgColor: manager.bgColor || "#334150",
                raw: {
                    contact: schedule.contact,
                    contents: schedule.contents,
                    etc: schedule.etc,
                    status: schedule.status
                }
            };
        }), true);
    }

    function noShowScheduleBadge(self) {
        var row = self.parentsUntil("#noShowScheduleList", ".row");
        $("#noShowScheduleDropdown")
            .data("id", row.data("id"))
            .data("manager", row.data("manager"))
            .data("status", row.data("status"))
            .css("top", (self[0].getBoundingClientRect().top - $("#noShowSchedule")[0].getBoundingClientRect().top + self.height() + 3) + "px")
            .css("right", (self[0].getBoundingClientRect().right - $("#noShowSchedule")[0].getBoundingClientRect().right) < -20 ? "1rem" : (self[0].getBoundingClientRect().right - $("#noShowSchedule")[0].getBoundingClientRect().right) + "px")
            .show();
    }

    function submitAddNoShow(self) {
        var row = self.parentsUntil("#noShowSearchList", ".row");
        if (row.find("input[name='noShowSearchAddContact']").val() === "") {
            alert("전화번호를 입력해주세요!");
            row.find("input[name='noShowSearchAddContact']").focus();
            return;
        }
        if (!moment(row.find("input[name='noShowSearchAddDate']").val(), "YYYY-MM-DD").isValid()) {
            alert("노쇼 날짜를 알맞게 입력해주세요!");
            row.find("input[name='noShowSearchAddDate']").focus();
            return;
        }
        var parameters = { id: row.data("id"), contact: row.find("input[name='noShowSearchAddContact']").val(), date: moment(row.find("input[name='noShowSearchAddDate']").val(), "YYYY-MM-DD").format("YYYYMMDD"), noShowCase: row.find("select").val() };
        NMNS.socket.emit("add noshow", parameters);
        self.off("touch click").on("touch click", function() {
            alert("저장 요청중입니다..!");
        });
    }

    function deleteNoShow(self) {
        var row = self.parentsUntil("#noShowSearchList", ".row");
        NMNS.history.push({ id: row.data("id"), contact: row.data("contact") + "", date: row.data("date") + "", noShowCase: row.data("noshowcase") });
        NMNS.socket.emit("delete noshow", { id: row.data("id") });
        row.remove();
    }

    function cancelAddNoShow(self) {
        var row = self.parentsUntil("#noShowSearchList", ".row");
        row.data("datetimepicker").destroy();
        row.remove();
        if ($("#noShowSearchList").html() === "") {
            $("#noShowSearchList").html("<div class='row col-12 px-0 mt-2 empty'><span class='col-12 text-center'>전화번호로 검색하거나 아래 버튼을 눌러<br/>노쇼를 직접 추가해보세요!</span></div>");
        }
    }

    function submitAddManager(self) {
        var lnbManagerItem = $(self).parents(".addManagerItem");
        var name = lnbManagerItem.find("input[type='text']");
        if (!name.val() || name.val().length < 1) {
            alert("담당자 이름을 입력해주세요.");
            return;
        }

        var id = name.data("id");
        var color = lnbManagerItem.find(".addManagerColor").data("color");
        lnbManagerItem.removeClass("addManagerItem");
        lnbManagerItem.html("<label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'><span style='background-color:" + name.data("color") + "; border-color:" + name.data("color") + "' title='이 담당자의 예약 가리기/보이기' data-color='"+name.data('color')+"'></span><span class='menu-collapsed'>" + name.val() + "</span></label><button class='btn btn-flat menu-collapsed lnbManagerAction ml-auto text-white py-0 pr-0' type='button'><i class='fa fa-ellipsis-v'></i></button>");
        var calendars = NMNS.calendar.getCalendars();
        calendars.push({
            id: id,
            name: name.val(),
            checked: true,
            bgColor: getBackgroundColor(color),
            borderColor: color,
            color: color
        });
        NMNS.calendar.setCalendars(calendars);
        NMNS.socket.emit("add manager", { id: id, name: name.val(), color: color });
    }

    function cancelAddManager(self) {
        $(self).parents(".addManagerItem").remove();
    }

    var noShowScheduleNormal = function(self) {
        var row = self.parentsUntil("#noShowScheduleList", ".row");
        NMNS.history.push({ id: row.data("id"), calendarId: row.data("manager"), raw: { status: row.data("status") } });
        NMNS.calendar.updateSchedule(row.data("id"), row.data("manager"), { raw: { status: "RESERVED" } });
        NMNS.socket.emit("update reserv", { id: row.data("id"), status: "RESERVED" });
        row.children("span:last-child").html($(generateScheduleStatusBadge("RESERVED"))).on("touch click", function() {
            noShowScheduleBadge($(this));
        });
    };

    $("#nextTips").one("touch click", function() {
        NMNS.socket.emit("get tips");
        $("#waitTips").parent().addClass("wait");
        NMNS.tips = [{ title: $("#tipsTitle").html(), body: $("#tipsBody").html() }];
        $(this).on("touch click", function() {
            if ($(this).hasClass("disabled")) return;
            if (!$("#waitTips").is(":visible")) {
                var index = $("#tipsModal").data("index") + 1;
                if (NMNS.tips && index < NMNS.tips.length) {
                    $("#tipsModal").data("index", index);
                    if (index === NMNS.tips.length - 1) {
                        $("#nextTips").addClass("disabled");
                    }
                    $("#tipsTitle").html(NMNS.tips[index].title);
                    $("#tipsBody").html(NMNS.tips[index].body);
                    $("#prevTips").removeClass("disabled");
                }
            }
        });
        $("#prevTips").on("touch click", function() {
            if ($(this).hasClass("disabled")) return;
            var index = $("#tipsModal").data("index") - 1;
            if (!$("#waitTips").is(":visible")) {
                if (index >= 0 && NMNS.tips) {
                    $("#tipsModal").data("index", index);
                    if (index === 0) {
                        $("#prevTips").addClass("disabled");
                    }
                    $("#tipsTitle").html(NMNS.tips[index].title);
                    $("#tipsBody").html(NMNS.tips[index].body);
                    $("#nextTips").removeClass("disabled");
                }
            }
        });
    });

    $("#submitFeedback").off("touch click").on("touch click", function() {
        var text = $("#feedbackBody").val();
        if (text && text.trim().length > 0) {
            NMNS.socket.emit("submit feedback", { data: text.trim() });
            showSnackBar("제안/문의해주신 내용이 잘 전달되었습니다.<br/> 소중한 의견에 감사드립니다.");
            $("#feedbackBody").val("");
        } else {
            showSnackBar("제안/문의하실 내용을 입력해주세요.");
            return;
        }
    });
    
    function drawAnnouncementList(data){
      var list = "";
      data.forEach(function(item){
        list += '<div class="announcement">';
        switch(item.type){
          case 'SCHEDULE_ADDED':
            list += '<div class="d-flex align-items-center"><span>' + (item.title?'고객명 : ' + item.title :'고객번호 : ' + item.contact)+ '</span><span class="d-flex ml-auto montserrat announcementTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+(item.title?'고객번호 : ' + dashContact(item.contact) : '')+'<br>예약날짜 : '+ moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '<br>예약시간 : '+ moment(item.start, 'YYYYMMDDHHmm').format('HH시 mm분') + (item.contents?'<br>예약내용 : '+item.contents : '') +'</p></div><div><span class="text-accent font-weight-bold" style="font-size:14px">예약 등록</span></div>'
            break;
          case 'SCHEDULE_CANCELED':
            list += '<div class="d-flex align-items-center"><span>' + (item.title?'고객명 : ' + item.title :'고객번호 : ' + item.contact)+ '</span><span class="d-flex ml-auto montserrat announcementTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+(item.title?'고객번호 : ' + dashContact(item.contact) : '')+'<br>예약날짜 : '+ moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '<br>예약시간 : '+ moment(item.start, 'YYYYMMDDHHmm').format('HH시 mm분') + '</p></div><div class="d-flex align-items-center"><span class="text-accent font-weight-bold" style="font-size:14px">예약 취소</span><span class="d-flex ml-auto addAnnouncementNoShow cursor-pointer" style="font-size:10px" data-schedule-id="'+item.id+'">직전취소로 노쇼등록 &gt;</span></div>'
            break;
          case 'ANNOUNCEMENT':
          default:
            list += '<div class="d-flex align-items-center" style="margin-bottom:15px"><span class="announcementTitle">' + item.title + '</span><span class="d-flex ml-auto montserrat announcementTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+item.contents+'</p></div><div><span class="text-accent font-weight-bold" style="font-size:14px">공지사항</span></div>'
            break;
        }
        list += '</div>';
      })
      return list;
    }
    //business specific functions about general features end
    //after calendar initialization start
    setDropdownCalendarType();
    setRenderRangeText();
    setEventListener();
    //after calendar initialization end
    //websocket response start
    NMNS.socket.on("get tips", socketResponse("팁 정보 가져오기", function(e) {
        if (e.data && e.data.length > 0) {
            NMNS.tips = NMNS.tips.concat(e.data);
            $("#tipsModal").data("index", 1);
            $("#tipsModal #tipsTitle").html(NMNS.tips[1].title);
            $("#tipsModal #tipsBody").html(NMNS.tips[1].body);
            $("#prevTips").removeClass("disabled");
            if (NMNS.tips.length === 2) {
                $("#nextTips").addClass("disabled");
            }
        } else {
            $("#nextTips").add("disabled");
        }
        $("#waitTips").parent().removeClass("wait");
    })).on("get summary", socketResponse("예약정보 가져오기", function(e) {
        var html = "";
        if (e.data.length === 0) {
            html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>검색된 내용이 없습니다. 검색조건을 바꿔서 검색해보세요 :)</span></div>";
        } else {
            e.data.forEach(function(item) {
                html += "<div class='row col-12 mx-0' style='padding: 10px 0;font-size:12px' data-id='" + (item.id || "") + "' data-manager='" + (item.manager || "") + "' data-status='" + (item.status || "") + "'" + (item.contents ? (" title='" + item.contents + "'") : "") + "><div class='col-1 pl-0'><input type='checkbox' class='noShowScheduleCheck' id='noShowSchedule"+item.id+"'></input><label for='noShowSchedule"+item.id+"'></label></div><div class='col-2 montserrat px-0'>" + (item.start ? moment(item.start, "YYYYMMDDHHmm").format("YYYY. MM. DD") : "") + "</div><div class='col-2 pr-0'>" + (item.name || "") + "</div><div class='col-3 pr-0 montserrat'>" + dashContact(item.contact) + "</div><div class='col-4 pr-0'>" + (item.contents || "") + "</div></div>";
            });
        }
        $("#noShowScheduleList").html(html);
        $("#noShowScheduleList input[type=checkbox]").on("change", function(e){
          $("#noShowScheduleList input[type=checkbox]").not(this).prop('checked', false);
          if($(this).prop('checked') && ($('#noShowScheduleContent .bg-primary').length > 0 || $("#noShowScheduleCaseEtc").val().trim().length > 0)){
            $("#noShowScheduleBtn span").css('opacity', 1)
          }else{
            $("#noShowScheduleBtn span").css('opacity', 0.35)
          }
        })
        
        if ($("#noShowScheduleList").hasClass("ps")) {
            $("#noShowScheduleList").data("scroll").update();
        }
    }));

    NMNS.socket.on("add reserv", socketResponse("예약/일정 추가하기", function(e) {
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
    }, function(e) {
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
        delete origin.id;
        NMNS.calendar.deleteSchedule(e.data.id, origin.manager);
    }));

    NMNS.socket.on("update reserv", socketResponse("예약/일정 정보 변경하기", function(e) {
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
        if (origin.category === 'task'){
          if(typeof origin.isDone !== 'boolean'){
            NMNS.socket.emit('get task');
          }
        } else if ($("#noShowScheduleList").is(":visible") && $("#noShowScheduleList .row[data-id='" + e.data.id + "']").length) { //예약으로 추가 모달
          showSnackBar('<span>노쇼로 등록하였습니다.</span>');
          $("#noShowScheduleList .row[data-id='" + e.data.id + "']").remove();
          $("#noShowScheduleBtn span").css('opacity', 0.35)
        }
    }, function(e) {
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
        if(origin.category === 'task'){
          if(typeof origin.isDone === 'boolean'){
            $("#mainTaskContents .task[data-id='"+origin.id+"'] input").prop('checked', origin.isDone);
          }
        }else{
          if ((origin.status || origin.raw.status) === "DELETED") {
              drawSchedule([origin]);
              refreshScheduleVisibility();
          } else {
            if (origin.newCalendarId && !NMNS.calendar.getSchedule(e.data.id, origin.selectedCal ? origin.selectedCal.id : origin.calendarId)) { //calendar id changed
                NMNS.calendar.deleteSchedule(e.data.id, origin.newCalendarId, true);
                origin.category = origin.category === 'task' ? 'task' : 'time';
                origin.dueDateClass = '';
                origin.calendarId = origin.selectedCal ? origin.selectedCal.id : origin.calendarId;
                origin.start = (typeof origin.start === "string" ? moment(origin.start, "YYYYMMDDHHmm").toDate() : origin.start);
                origin.end = (typeof origin.end === "string" ? moment(origin.end, "YYYYMMDDHHmm").toDate() : origin.end);
                origin.color = origin.color || origin.selectedCal.color;
                origin.bgColor = origin.bgColor || origin.selectedCal.bgColor;
                origin.borderColor = origin.borderColor || origin.selectedCal.borderColor;
                NMNS.calendar.createSchedules([origin]);
            } else {
                if (typeof origin.start === "string") origin.start = moment(origin.start, "YYYYMMDDHHmm").toDate();
                if (typeof origin.end === "string") origin.end = moment(origin.end, "YYYYMMDDHHmm").toDate();
                NMNS.calendar.updateSchedule(e.data.id, origin.selectedCal ? origin.selectedCal.id : origin.calendarId, origin);
            }
          }
        }
    }));

    NMNS.socket.on("get task", socketResponse("일정 가져오기", function(e){
      if(e.data.some(function(date){
        return date.date === moment().format('YYYYMMDD')
      })){
        $('#todayTask').text(
          e.data.find(function(date){return date.date === moment().format('YYYYMMDD')}).task.length
        )
      }
      $('#mainTaskContents').html(generateTaskList(e.data))
      $("#mainTaskContents input").on('change', function(e){
        console.log($(this).prop('checked'));
        e.stopPropagation();
        var data = $(this).parent();
        NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
        NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
      })
      $("#mainTaskContents .task").on('touch click', function(e){
        e.stopPropagation();
        console.log('aa')
        var data = $(this).parent();
        initTaskTab({id:data.data('id'), title:data.data('title'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'})
        $("#scheduleTabList a[data-target='#taskTab']").tab('show');
        $("#scheduleModal").modal('show')
      });
      
    }));
    
    NMNS.socket.on("add manager", socketResponse("담당자 추가하기", undefined, function(e) {
        NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().filter(function(item) {
            return item.id !== e.data.id;
        }));
        $(".lnbManagerItem[data-value='" + e.data.id + "']").remove();
    }));

    NMNS.socket.on("delete manager", socketResponse("담당자 삭제하기", function(e) {
        NMNS.history.remove(e.data.id, findById);
    }, function(e) {
        var manager = NMNS.history.find(function(item) { return item.id === e.data.id });
        if (manager) {
            var calendars = NMNS.calendar.getCalendars();
            calendars.push(manager);
            NMNS.calendar.setCalendars(NMNS.calendar.getCalendars());
            $("#lnbManagerList").html(generateLnbManagerList(calendars));
            refreshScheduleVisibility();
            NMNS.history.remove(e.data.id, findById);
        }
    }));

    NMNS.socket.on("update manager", socketResponse("담당자 변경하기", function(e) {
        NMNS.history.remove(e.data.id, findById);
    }, function(e) {
        var manager = NMNS.history.find(function(item) { return item.id === e.data.id });
        if (manager) {
            NMNS.calendar.setCalendar(e.data.id, manager);
            $("#lnbManagerList").html(generateLnbManagerList(NMNS.calendar.getCalendars()));
            refreshScheduleVisibility();
            NMNS.history.remove(e.data.id, findById);
        }
    }));

    NMNS.socket.on("update info", socketResponse("매장 정보 변경하기", function() {
        showSnackBar("<span>정상적으로 매장 정보를 변경하였습니다.</span>");
        NMNS.history.remove("info", findById);
    }, function(e) {
        var history = NMNS.history.find(function(item) { return item.id === "info" });
        if (history.bizBeginTime || history.bizEndTime) {
            NMNS.calendar.setOptions({ week: { hourStart: history.bizBeginTime ? history.bizBeginTime.substring(0, 2) : NMNS.info.bizBeginTime.substring(0, 2), hourEnd: history.bizEndTime ? history.bizEndTime.substring(0, 2) : NMNS.info.bizEndTime.substring(0, 2) } });
        }
        if (history.shopName) {
            changeMainShopName(history.shopName);
        }
        NMNS.info.shopName = history.shopName || NMNS.info.shopName;
        NMNS.info.bizType = history.bizType;
        NMNS.history.remove("info", findById);
        NMNS.initedInfoModal = false;
    }));

    NMNS.socket.on("update alrim", socketResponse("알림톡 정보 변경하기", function() {
        showSnackBar("<span>정상적으로 알림톡 정보를 변경하였습니다.</span>");
        NMNS.history.remove("alrimInfo", findById);
    }, function() {
        var history = NMNS.history.find(function(item) { return item.id === "alrimInfo" });
        Object.keys(history).forEach(function(key) {
            NMNS.info.alrimTalkInfo[key] = history[key];
        });
        NMNS.history.remove("alrimInfo", findById);
        NMNS.initedAlrimModal = false;
    }));

    NMNS.socket.on("get noshow", socketResponse("노쇼 정보 가져오기", function(e) {
        if (e.data.summary.noShowCount > 0) {
          e.data.detail.push({id:1111, date:'20190101', noShowCase:'직전취소'});
          $("#noShowClean").removeClass('d-flex').addClass('d-none');
          if(!$("#noShowDirtyImage").attr('src')){
            $("#noShowDirtyImage").attr('src', '/nmns/img/sub_img.svg');
          }
          $("#myNoShowCount").text(e.data.detail.length);
          $("#otherNoShowCount").text(e.data.summary.noShowCount - e.data.detail.length);
          if(e.data.summary.lastNoShowDate){
            $("#noShowSearchSummary").text("마지막 노쇼는 "+ moment(e.data.summary.lastNoShowDate, 'YYYYMMDD').format('YYYY년 M월 D일입니다.') );
          }
          if (e.data.detail.length > 0) {
            var html = "<div class='row col-12 mx-0'><div class='col col-3'>전화번호</div><div class='col col-3'>노쇼 날짜</div><div class='col col-4'>노쇼 사유</div></div>";
            e.data.detail.forEach(function(item) {
                html += "<div class='row col-12 noShowRow' data-id='" + item.id + "' data-contact='" + (e.data.summary.contact || "") + "' data-date='" + (item.date || "") + "' data-noshowcase='" + (item.noShowCase || "") + "'><div class='col col-3'>" + (e.data.summary.contact ? dashContact(e.data.summary.contact) : "") + "</div><div class='col col-3'>" + (item.date ? (item.date.substring(0, 4) + ". " + item.date.substring(4, 6) + ". " + item.date.substring(6)) : "") + "</div><div class='col col-4 base-font' style='font-size:10px'>" + item.noShowCase + "</div><div class='col-2 pr-0 text-right'><span class='noShowSearchDelete' title='삭제'>&times;</span></div></div>";
            });
            $("#noShowSearchList").html(html);
            $("#noShowSearchList .noShowSearchDelete").on("touch click", function(){
              deleteNoShow($(this));
            })
          }
          $("#noShowDirty").removeClass('d-none').addClass('d-flex');
        } else {
          $("#noShowDirty").removeClass('d-flex').addClass('d-none');
          $("#noShowClean").removeClass('d-none').addClass('d-flex');
          if(!$("#noShowImage").attr('src')){
            $("#noShowImage").attr('src', '/nmns/img/sub_img.svg');
          }
          $("#noShowSentense").text(['안심하세요. 노쇼를 하신 적이 없어요!', '이분 최소 배우신분!! 노쇼 이력이 없어요.', '노쇼를 하신 적이 없어요! 격하게 환영해주세요~~'][Math.floor(Math.random()*3)]);
        }
    }));

    NMNS.socket.on("add noshow", socketResponse("노쇼 추가하기", function(e) {
        var html, badge = "";
        if ($("#noShowSearch").is(":visible")) {
            badge = (e.data.noShowCase ? ("<span class='badge badge-light'>" + e.data.noShowCase + "</span>") : "");
            html = $("<div class='row col-12 noShowRow' data-id='" + e.data.id + "' data-contact='" + e.data.contact + "' data-date='" + e.data.date + "' data-noshowcase='" + e.data.noShowCase + "'><div class='col-3'>" + (e.data.contact || dashContact($("#noShowSearchList div.noShowSearchAdd[data-id='" + e.data.id + "'] input[name='noShowSearchAddContact']").val())) + "</div><div class='col-3'>" + (e.data.date ? e.data.date.substring(0, 4) + ". " + e.data.date.substring(4, 6) + ". " + e.data.date.substring(6) : "") + "</div><div class='col col-4 base-font' style='font-size:10px'>" + e.data.noShowCase + "</div><div class='col-2 pr-0 text-right'><span class='noShowSearchDelete' title='삭제'>&times;</span></div></div>");
            html.insertBefore($("#noShowSearchList").children(".noShowSearchAdd:eq(0)"));
            html.find(".noShowSearchDelete").on("touch click", function() {
                deleteNoShow($(this));
            });
            var row = $("#noShowSearchList div.noShowSearchAdd[data-id='" + e.data.id + "']");
            row.data("datetimepicker").destroy();
            row.remove();
        }
        showSnackBar("<span>추가되었습니다! 다른 분들에게 많은 도움이 될거에요 :)</span>");
    }, function(e) {
        $("#noShowSearchList div.noShowSearchAdd[data-id='" + e.data.id + "'] .noShowSearchAddSubmit").off("touch click").on("touch click", function() {
            submitAddNoShow($(this));
        });
    }));

    NMNS.socket.on("delete noshow", socketResponse("노쇼 삭제하기", function(e) {
        NMNS.history.remove(e.data.id, findById);
    }, function(e) {
        if (e && e.data) { 
            var origin = NMNS.history.find(function(item) { return item.id === e.data.id });
            if (origin) {
                var newRow = $("<div class='row col-12 noShowRow' data-id='" + origin.id + "' data-contact='" + (origin.contact || "") + "' data-date='" + (origin.date || "") + "' data-noshowcase='" + (origin.noShowCase || "") + "'><div class='col col-3'>" + (origin.contact ? dashContact(origin.contact) : "") + "</div><div class='col col-3'>" + (origin.date ? (origin.date.substring(0, 4) + ". " + origin.date.substring(4, 6) + ". " + origin.date.substring(6)) : "") + "</div><div class='col col-4 base-font' style='font-size:10px'>" + origin.noShowCase + "</div><div class='col-2 pr-0 text-right'><span class='noShowSearchDelete' title='삭제'>&times;</span></div></div>");
                newRow.find(".noShowSearchDelete").off("touch click").on("touch click", function() {
                    deleteNoShow($(this));
                });
                if ($("#noShowSearchList .empty").length) { //전체 덮어 씌우기
                    $("#noShowSearchList").html(newRow);
                } else if ($("#noShowSearchList .noShowSearchAdd").length) {
                    newRow.insertBefore("#noShowSearchList .noShowSearchAdd:first-child");
                } else {
                    $("#noShowSearchList").append(newRow);
                }
            }
        }
    }));

    NMNS.socket.on("update password", socketResponse("비밀번호 변경하기"));

    NMNS.socket.on("get customer info", socketResponse("자동완성 자료 가져오기", function(e) {
        //success
        if (e.data.id) {
            var el = $("#" + e.data.id);
            el.autocomplete().onSuccess.call(el.autocomplete(), e.data.query, e.data.result);
        }
    }, function(e) {
        if (e.data.id) {
            var el = $("#" + e.data.id);
            el.autocomplete().onFail.call(el.autocomplete(), e.data);
        }
    }, true));

    NMNS.socket.on("get customer", socketResponse("고객 정보 가져오기", function(e) {
        var popup = $("#scheduleTab");
        if(popup.is(":visible")){
          if ((e.data.contact === popup.find("#scheduleContact").val() && popup.data("contact") !== e.data.contact) || (e.data.name === popup.find("#scheduleName").val() && popup.data("name") !== e.data.name)) {//이름 혹은 연락처의 변경
              if (e.data.etc) {
                  popup.find("#scheduleEtc").val(e.data.etc);
              }
              if (e.data.manager) {//변경된 경우에만 덮어쓰기
                  var manager = findManager(e.data.manager);
                  if (manager) {
                      popup.find("#scheduleManager").html(popup.find("#scheduleManager").next().find("button[data-calendar-id='" + manager.id + "']").html()).data("calendar-id", manager.id);
                  }
              }
              if (e.data.contents) {
                popup.find("#scheduleTabContents").append(generateContentsList(e.data.contents)).find('button').off('touch click').on('touch click', function(){
                  removeContent(this);
                });
              }
              if (e.data.isAllDay !== undefined) {
                  popup.find("#scheduleAllDay").attr("checked", e.data.isAllDay);
              }
              if (e.data.name && popup.find("#scheduleName").val() === "") {//빈칸일 경우에만 덮어쓰기
                  popup.find("#scheduleName").val(e.data.name);
              }
              if (e.data.contact && popup.find("#scheduleContact").val() === "") {//빈칸일 경우에만 덮어쓰기
                  popup.find("#scheduleContact").val(e.data.contact);
              }
          }
          if (e.data.totalNoShow !== undefined && e.data.totalNoShow > 0 && popup.find("#scheduleContact").is(":visible")) {
              popup.find("#scheduleContact").tooltip({
                  title: "이 번호에는 총 " + e.data.totalNoShow + "건의 노쇼가 등록되어 있습니다." + (e.data.myNoShow && e.data.myNoShow > 0 ? "<br/>우리 매장에서는 " + e.data.myNoShow + "건 등록되었습니다." : ""),
                  placement: "bottom",
                  trigger: "click hover focus",
                  delay: { "hide": 1000 },
                  html: true
              }).tooltip("show");
              setTimeout(function() {
                  popup.find("#scheduleContact").tooltip("hide");
              }, 3000);
              popup.find("#scheduleContact").one("keyup change", function() {
                  $(this).tooltip('dispose');
              });
          }
        }
    }, undefined, true));

    NMNS.socket.on("message", socketResponse("서버 메시지 받기", function(e) {
        if (e.type === "push") {
            e.data.forEach(function(item) {
                showNotification(item);
            });
        } else if (e.type === "alert") {
            showSnackBar(e.data.body);
        }
    }, undefined, true));

    NMNS.socket.on("get alrim history", socketResponse("알림톡 내역 조회", function(e) {
        drawAlrimList(e.data);
    }, undefined, true));

    NMNS.socket.on('resend alrimtalk', socketResponse('알림톡 다시 보내기', function(e){
        showSnackBar("<span>고객에게 알림톡을 다시 보냈습니다!</span>");
    }, function(e){
        $('#detailPopupResendAlrim').addClass('d-none')
        showSnackBar("<span>"+e.message || "알림톡을 다시 보내지 못했습니다."+"</span>");
    }))
    NMNS.socket.on('get announcement', socketResponse('공지사항 조회', function(e){
      if($('#announcementBody').children().length === 0){
        $('#announcementBody').html('');//대기문구 삭제
      }
      e.data.push({type:'SCHEDULE_ADDED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444'})
      e.data.push({type:'SCHEDULE_CANCELED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444', id:'aaa'})
      $('#announcementBody').append(drawAnnouncementList(e.data));
      var count = NMNS.info.newAnnouncement;
      if(count && count > 0){
        var unread = 0;
        e.data.forEach(function(item){
          if(!item.isRead) unread++;
        })
        if(count > unread){
          $('.announcementCount').text(count - unread > 99? '99+' : count - unread);
          NMNS.info.newAnnouncement = count - unread;
        }else if(count === unread){
          $('.announcementCount').text('');
          NMNS.info.newAnnouncement = 0;
        }
      }
      $('#announcementBody').parent().removeClass('wait');
      if(e.data.length === 5){
        NMNS.expectMoreAnnouncement = true;
      }else{
        NMNS.expectMoreAnnouncement = false;
      }
    }, function(e){
      $('#announcementBody').parent().removeClass('wait');
    }))
    
    NMNS.socket.on("get menu list", socketResponse('메뉴 목록 조회', function(e){
      if($("#scheduleTabContentList").is(":visible")){
        $("#scheduleTabContentList").html(generateMenuList(e.data));
        NMNS.menuList = e.data;
      }
    }, undefined, true))
    //websocket response end
    //Modal events start  
    $(".modal").on("shown.bs.modal", function(){
      $(".modal-backdrop").on("touch click", function(e){//click on menubar
        $(".modal.show").modal('hide');
      })
    });
    
    $("#infoModal").on("hide.bs.modal", function() {
        if (document.activeElement.tagName === "INPUT") {
            return false;
        }
        var changed = false;

        if ($("#infoBizBeginTime").val() !== (NMNS.info.bizBeginTime)) {
            changed = true;
        }
        if (!changed && $("#infoBizEndTime").val() !== (NMNS.info.bizEndTime)) {
            changed = true;
        }
        if (!changed && $("#infoShopName").val() !== (NMNS.info.shopName || "")) {
            changed = true;
        }
        /*if (!changed && $("#infoPassword").val() !== "") {
            changed = true;
        }*/
        if (!changed && $("#infoBizType").val() !== (NMNS.info.bizType || "")) {
            changed = true;
        }
        /*if (!changed) {
            $(".infoManagerItem").each(function() {
                if (!changed) {
                    if ($(this).hasClass("addManagerItem")) { //추가
                        changed = true;
                    } else {
                        var input = $(this).find("input[type='text']");
                        var manager = findManager(input.data("id"));
                        if ($(this).data("delete") && manager) { //삭제
                            changed = true;
                        } else if (manager) {
                            if (input.data("color") !== manager.bgColor || input.val() !== manager.name) { //수정
                                changed = true;
                            }
                        }
                    }
                }
            });
        }*/
        if (changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")) {
            return false;
        }
    }).on("touch click", function(e) {
        /*if ($("#infoModalColorPicker").is(":visible")) {
            var target = $(e.target);
            if (!target.parents("#infoModalColorPicker").length && !target.hasClass("infoManagerColor") && !target.hasClass("tui-full-calendar-checkbox-round") && !target.parents(".infoManagerColor").length && !target.parents(".tui-full-calendar-checkbox-round").length && !target.hasClass("addManagerColor") && !target.parents(".addManagerColor").length && !target.parents(".addManagerColor").length) {
                $("#infoModalColorPicker").hide(300);
            }
        }*/
    }).on('show.bs.modal', NMNS.initInfoModal);
    
    $("#alrimModal").on("hide.bs.modal", function() {
        if (document.activeElement.tagName === "INPUT") {
            return false;
        }
        if ($("#alrimShopName").is(":visible")) {
            var changed = false;
            if (($("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "Y") || (!$("#alrimUseYn").prop("checked") && NMNS.info.alrimTalkInfo.useYn !== "N")) {
                changed = true;
            }
            if (!changed && $("#alrimShopName").val() !== (NMNS.info.shopName || "")) {
                changed = true;
            }
            if (!changed && $("#alrimCallbackPhone").val() !== (NMNS.info.alrimTalkInfo.callbackPhone || "")) {
                changed = true;
            }
            if (!changed && $("#alrimCancelDue").val() !== (NMNS.info.alrimTalkInfo.cancelDue || "")) {
                changed = true;
            }
            if (!changed && $("#alrimNotice").val() !== (NMNS.info.alrimTalkInfo.notice || "")) {
                changed = true;
            }
            if (changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")) {
                return false;
            }
        }
    }).on("shown.bs.modal", function() {
        if ($("body .popover").length) {
            $("body .popover").popover("update");
        }
    }).on("show.bs.modal", function(){
      NMNS.initAlrimModal();
      $("#alrimTabList a[data-target='#alrimTab']").tab('show');
    });
    
    $("#noShowModal").on("hide.bs.modal", function() {
        if (document.activeElement.tagName === "INPUT") {
            return false;
        }
    }).on("show.bs.modal", function(e) {
        if ($(e.relatedTarget).hasClass("getNoShowLink")) {
            $("#noShowTabList .nav-link[href='#noShowSearch']").tab("show");
        } else if ($(e.relatedTarget).hasClass("addNoShowLink")) {
            $("#noShowTabList .nav-link[href='#noShowAdd']").tab("show");
        }
    });
    
    $("#scheduleModal").on("hide.bs.modal", function() {
      if(NMNS.scheduleTarget && NMNS.scheduleTarget.guide){
        NMNS.scheduleTarget.guide.clearGuideElement();
      }
      delete NMNS.scheduleTarget;
    }).on('hidden.bs.modal', function(){
      //reset form
      $('#scheduleName').val('');
      //$('#scheduleContents').val('');
      $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
        removeContent(this);
      });
      $('#scheduleContact').val('');
    });

    $("#noMoreTips").on("touch click", function() {
        document.cookie = "showTips=false";
    });
    $("#showTips").on("touch click", function(e) {
        e.preventDefault();
        $("#noMoreTips").remove();
        $("#tipsModal").modal("show");
    });
    $("#lnbLastMenu a").on("touch click", function(e) {
        e.preventDefault();
    });
    
    $("#showTutorial").on("touch click", function(){
       if (!document.getElementById("tutorialScript")) {
            var script = document.createElement("script");
            script.src = "/nmns/js/tutorial.min.js";
            script.id = "tutorialScript";
            document.body.appendChild(script);
    
            script.onload = function() {
                $("#tutorialModal").modal();
            };
        }else{
            $("#tutorialModal").modal();
        }
    });
    $('.announcementMenuLink').on('show.bs.popover', function(){
      if($('#annoumcementBody').children().length === 0){
        NMNS.announcementPage = 1
        $('#announcementBody').parent().addClass('wait');
        NMNS.socket.emit('get announcement', {page:1})
        //for test
        /*$('#announcementBody').append(drawAnnouncementList([{title:'테스트 제목', contents:'테스트 내용!!!!', registeredDate:'20190217', isRead:false},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true}]));
        var count = ($('.announcementCount').text() * 1);
        if(count && count > 0){
          var unread = 0;
          [{title:'테스트 제목', contents:'테스트 내용!!!!', registeredDate:'20190217', isRead:true},{title:'테스트 제목2', contents:'테스트 내용2!!!!', registeredDate:'20190215', isRead:true}].forEach(function(item){
            if(!item.isRead) unread++;
          })
          if(count > unread){
            $('.announcementCount').text(count - unread);
          }else if(count === unread){
            $('.announcementCount').text('');
          }
        }
        $('#announcementBody').parent().removeClass('wait');
        NMNS.expectMoreAnnouncement = true;*/
        //for test
      }
    }).on('shown.bs.popover', function(){
      $('#announcementBody').parents('.popover').find('.close-button').on('touch click', function(){
        $(this).parents('.popover').popover('hide')
      })
    })
    $('#mainMenu').on('shown.bs.popover', function(){
      $(".mainMenuRow a[data-link]").off("touch click").on("touch click", function(e){
        $("#mainMenu").popover('hide')
        $($(this).data('link')).modal("show")
      });
      $("#signoutLink").on("touch click", function(){
        NMNS.socket.close();
      })
    })
    $('html').on('click', function(e) {// click outside popover to close
      if ($('body').children('.popover.show').length > 0 && typeof $(e.target).data('original-title') == 'undefined' && !$(e.target).parents().is('.popover.show') && $(e.target).parents('[data-toggle="popover"]').length === 0) {
        $('body').children('.popover.show').popover('hide');
      }
    });
    $("#alrimTabList a[data-target='#alrimTab']").on("show.bs.tab", NMNS.initAlrimModal)
    $("#alrimTabList a[data-target='#alrimHistoryTab']").on("show.bs.tab", function(){
      $("#alrimHistorySearch").trigger('click');
    })
    
    $("#scheduleTabList a[data-target='#scheduleTab']").on('touch click', function(){
      if(!$(this).hasClass('active')){
        initScheduleTab("switch")
      }
    });
    $("#scheduleTabList a[data-target='#taskTab']").on('touch click', function(){
      if(!$(this).hasClass('active')){
        initTaskTab('switch')
      }
    });

    $("#addScheduleBtn").on("touch click", function(){
      $("#scheduleTabList a[data-target='#scheduleTab']").tab('show');
      initScheduleTab();
      $("#scheduleModal").modal('show');
    })
    $("#userModal").one('show.bs.modal', function(){
      //passwordTab
      $("#resetPasswordBtn").on("touch click", function(){
        if($("#currentPassword").val().length === 0){
          showSnackBar("현재 비밀번호를 입력해주세요.");
          return;
        }else if($("#newPassword").val().length === 0){
          showSnackBar("새 비밀번호를 입력해주세요.");
          return;
        }else if($("#renewPassword").val().length === 0){
          showSnackBar("새 비밀번호를 한 번 더 입력해주세요.");
          return;
        }else if($("#newPassword").val() !== $("#renewPassword").val()){
          showSnackBar("새 비밀번호가 일치하지 않습니다.");
          return;
        }
        NMNS.socket.emit("update password", { currentPassword: $("#currentPassword").val(), newPassword: $("#newPassword").val() });
        $("#currentPassword").val("");
        $("#newPassword").val("");
        $("#renewPassword").val("");
        $("#infoModal").modal('hide');
      })
      $("#kakaoBtn").on("touch click", function(){
        if($(this).hasClass('connected')){
          return;
        }
        alert('카카오톡 계정 연동!');
      })
      $("#naverBtn").on("touch click", function(){
        if($(this).hasClass('connected')){
          return;
        }
        alert('네이버 계정 연동!');
      });
    }).on('shown.bs.modal', function(){
      if(NMNS.info.kakaotalk){
        $("#kakaoBtn").addClass('connected').find('span').text('카카오 계정 연동 완료')
      }
      if(NMNS.info.naver){
        $("#naverBtn").addClass('connected').find('span').text('네이버 계정 연동 완료')
      }
    }).on("hidden.bs.modal", function(){
      $("#currentPassword").val("");
      $("#newPassword").val("");
      $("#renewPassword").val("");
    })
    //Modal events end
    //mobile horizontal scroll handling
    // credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml
    function swipedetect(el, callback) {
        var touchsurface = el,
            swipedir, startX, distX,
            threshold = 100, //required min distance traveled to be considered swipe
            allowedTime = 300, // maximum time allowed to travel that distance
            elapsedTime,
            startTime,
            handleswipe = callback || function(swipedir) {};

        touchsurface.addEventListener('touchstart', function(e) {
            var touchobj = e.changedTouches[0];
            swipedir = 'none';
            //dist = 0;
            startX = touchobj.pageX;
            startTime = new Date().getTime(); // record time when finger first makes contact with surface
        }, false);

        touchsurface.addEventListener('touchend', function(e) {
            var touchobj = e.changedTouches[0];
            distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
            elapsedTime = new Date().getTime() - startTime; // get time elapsed
            if (elapsedTime <= allowedTime) { // first condition for awipe met
                if (Math.abs(distX) >= threshold) { // 2nd condition for horizontal swipe met
                    swipedir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
                    handleswipe(swipedir);
                }
            }
        }, false);
    }
    swipedetect(document.getElementById('mainRow'), function(swipedir) {
        if (swipedir === "left") {
            $("#renderRange").next().trigger("click");
        } else if (swipedir === "right") {
            $("#renderRange").prev().trigger("click");
        }
    });

    //mobile horizontal scroll handling end
    $(".addManager").on("touch click", function() {
        var color = NMNS.colorTemplate[Math.floor(Math.random() * NMNS.colorTemplate.length)];
        var list = $(this).prev();
        var clazz = list.attr("id") === "lnbManagerList" ? "lnbManagerItem" : "infoManagerItem";
        var row = $("<div class='" + clazz + " addManagerItem row mx-0'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'/><span class='addManagerColor' style='background-color:" + color + "; border-color:" + color + ";' data-color='" + color + "'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-color='" + color + "' data-id='" + NMNS.email + generateRandom() + "' placeholder='담당자 이름'/></label>" + (clazz === "lnbManagerItem" ? "<i class='fas fa-check submitAddManager pl-1' title='추가'></i><span class='cancelAddManager pl-1' title='취소'>&times;</span>" : "<i class='fas fa-trash cancelAddManager pl-2 title='삭제'></i>") + "</div>");
        list.append(row);
        if (clazz === "lnbManagerItem") {
            row.find(".submitAddManager").off("touch click").on("touch click", function() {
                submitAddManager(this);
            });
            row.find("input[type='text']").off("keyup").on("keyup", function(e) {
                if (e.which === 27) {
                    cancelAddManager(this);
                    list.find("div:last-child input[type='text']").focus();
                } else if (e.which === 13) {
                    submitAddManager(this);
                }
            });
            row.find(".cancelAddManager").off("touch click").on("touch click", function() {
                cancelAddManager(this);
                list.find("div:last-child input[type='text']").focus();
            });
            row.find(".addManagerColor").attr("title", "담당자 색상은 저장 후 내 매장 정보 메뉴에서 바꾸실 수 있습니다.");
        } else {
            row.find("input[type='text']").off("keyup").on("keyup", function(e) {
                if (e.which === 27) {
                    if (list.children(".infoManagerItem:visible").length == 1) {
                        return;
                    }
                    cancelAddManager(this);
                    list.find("div:last-child input[type='text']").focus();
                    list.data("scroll").update();
                }
            });
            row.find(".addManagerColor").off("touch click").on("touch click", function() {
                showColorPickerPopup($(this));
            });
            row.find(".cancelAddManager").off("touch click").on("touch click", function() {
                if (list.children(".infoManagerItem:visible").length == 1) {
                    alert("담당자는 반드시 1명 이상 있어야합니다!");
                    return;
                }
                cancelAddManager(this);
                list.find("div:last-child input[type='text']").focus();
                list.data("scroll").update();
            });
        }
        list.find("div:last-child input[type='text']").focus();
    });
    $("#copyEmail").on("touch click", function(e) {
        e.preventDefault();
        var range = document.createRange();
        range.selectNodeContents($(this)[0]);
        var sel = window.getSelection ? window.getSelection() : document.selection;
        sel.removeAllRanges();
        sel.addRange(range);
        var title = "";
        if (document.execCommand('copy')) {
            title = "메일주소가 복사되었습니다.";
        } else {
            title = "메일주소를 복사하지 못했습니다. 직접 선택하여 복사���주세요.";
        }
        $(this).attr("title", title).tooltip({
            trigger: "manual",
            delay: { "hide": 1000 }
        });
        $(this).tooltip("show");
        setTimeout(function() {
            $("#copyEmail").attr("title", "메일주소 복사").tooltip("dispose");
        }, 1500);
        if (sel.empty) { // Chrome, IE
            sel.empty();
        } else if (sel.removeAllRanges) { // Firefox
            sel.removeAllRanges();
        }
        return false;
    });
    $(".openAppLink").off("touch click").on("touch click", function(e) {
        var ua = navigator.userAgent.toLocaleLowerCase();

        if (ua.indexOf("android") > -1) {
            // e.preventDefault();
            // navigator.app.loadUrl($(this).data("android")); // Android only
            // return false;
        } else if (ua.indexOf("ipod") > -1 || ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1) {
            // setTimeout(function(){
            //   window.location = $(this).data("ios-install");
            // }, 25);
            window.open($(this).data("ios"), "_system");
        }
    });
    $(".mfb-component__button--child").off("touch click").on("touch click", function(e) {
        e.preventDefault();
        document.getElementById("floatingButton").setAttribute("data-mfb-state", "closed");
    });
    
    $('#announcementBody').on('scroll', debounce(function(){
        var distance = Math.max(0, $(this)[0].scrollHeight - $(this).scrollTop() - $(this).innerHeight());
        if(!$("#waitAnnouncement").is(":visible") && NMNS.expectMoreAnnouncement && distance < Math.max(100, $(this).innerHeight() * 0.2)){
            $('#waitAnnouncement').parent().addClass('wait')
            NMNS.socket.emit('get announcement', {page:++NMNS.announcementPage})
        }
    }, 100));
    //notification handling start
    NMNS.socket.emit("get noti");
    NMNS.socket.on("get noti", socketResponse("서버 메시지 받기", function(e) {
        e.data.data.forEach(function(item) {
            showNotification(item);
        });
    }));
    //notification handling end
    //menu switch start
    $(".customerMenuLink").off("touch click").on("touch click", function() {
        var action = $($(".customerSortType.active")[0]).data("action");
        if(!document.getElementById('customerStyle')){
          var style = document.createElement('link');
          style.rel="stylesheet";
          style.href="/nmns/css/customer.min.css"
          document.head.appendChild(style);
        }
        if (!document.getElementById("customerScript")) {
            var script = document.createElement("script");
            script.src = "/nmns/js/customer.min.js";
            script.id = "customerScript";
            document.body.appendChild(script);

            script.onload = function() {
                NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": action });
            };
        } else {
            NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": action });
        }
        $("#customerAddManager").next().html("<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='' data-bgcolor='#b2dfdb'><span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color:#b2dfdb'></span><span class='tui-full-calendar-content'>(담당자 없음)</span></button>").append(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#customerAddManager").data("calendar-id", $(this).data("calendar-id")).data("bgcolor", $(this).data("bgcolor")).html($(this).html());
        });
        $("#customerAddManager").html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + NMNS.calendar.getCalendars()[0].bgColor + "'></span><span class='tui-full-calendar-content'>" + NMNS.calendar.getCalendars()[0].name + "</span>").data("calendar-id", NMNS.calendar.getCalendars()[0].id).data("bgcolor", NMNS.calendar.getCalendars()[0].bgColor);
        $("#customerManager").next().html("<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='' data-bgcolor='#b2dfdb'><span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color:#b2dfdb'></span><span class='tui-full-calendar-content'>(담당자 없음)</span></button>").append(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#customerManager").data("calendar-id", $(this).data("calendar-id")).data("bgcolor", $(this).data("bgcolor")).html($(this).html());
        });
    });
    $(".calendarMenuLink").off("touch click").on("touch click", function() {
        setSchedules();
    });
    $(".infoCenterLink").off("touch click").on("touch click", function(){
      if($("#faq").children().length === 0){
        var html = "";
        var faqs = [{title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}]
        faqs.forEach(function(item, index) {
            html += '<div class="row faqRow col mx-0" title="'+item.title+'"><a href="#faqDetail' + index + '" class="faqDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="faqDetail' + index + '"></a><div class="ellipsis">' + item.title + '</div></div>' +
                '<div class="row faqDetailRow collapse mx-0" id="faqDetail' + index + '"><div class="d-inline-flex"><span>ㄴ</span></div><span class="col px-2">' + item.contents + '</span></div></div>';
            if (index > 0 && index % 50 === 0) {
                $("#faq").append(html);
                html = "";
            }
        });
        $("#faq").append(html);
      }
    })
    function switchMenu(e){
      if(e && e.preventDefault){
        e.preventDefault();
      }
      if(!$(this).hasClass("menuLinkActive")){
        $(".switchingMenu:not(."+$(this).data('link')+")").hide();
        $("."+$(this).data('link')).show();
        $(".menuLinkActive").removeClass("menuLinkActive");
        $(this).addClass("menuLinkActive");
        // hide mainTask field
        $("#mainCalendarArea").css('minWidth', '');
        $("#mainContents").css("minWidth", '100%');
        $("#mainAside").css('minWidth', 'unset');
        $("#mainTask").removeClass("show");
      }
    }
    
    $(".menuLink").on("touch click", switchMenu)
    //menu switch end
})(jQuery);