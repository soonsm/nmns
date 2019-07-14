/*global jQuery, location, moment, tui, NMNS, io, dashContact, navigator, socketResponse, generateRandom, getCookie, flatpickr, PerfectScrollbar, toYYYYMMDD, findById, Notification, drawCustomerAlrimList, showSnackBar, showNotification, getBackgroundColor */
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
                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === model.renderDate; }) : undefined;
                if (holiday) {
                    className += " tui-full-calendar-holiday";
                    classDate += " tui-full-calendar-holiday";
                }

                return '<span class="' + classDate + '">' + model.date + '</span>&nbsp;&nbsp;<span class="' + className + '">' + model.dayName + (holiday ? (" (" + holiday.title + ")") : "") + '</span>';
            },
            monthGridHeader: function(model) {
                var date = parseInt(model.date.split('-')[2], 10);
                var classNames = ["tui-full-calendar-weekday-grid-date"];

                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === model.date; }) : undefined;
                if (holiday) {
                    classNames.push("tui-full-calendar-holiday");
                }
                return '<span class="' + classNames.join(' ') + '">' + date + (holiday ? ("<small class='d-none d-sm-inline'> (" + holiday.title + ")</small>") : "") + '</span>';
            },
            monthGridHeaderExceed: function(){
              return '';
            },
            monthGridFooterExceed: function(hiddenSchedules) {
                return '<span class="tui-full-calendar-weekday-grid-more-schedules" title="전체 예약">전체 예약 <span class="icon-arrow icon-arrow-right"></span></span>';
            },
            monthMoreTitleDate: function(date, dayname) {
                var dateFormat = date.split(".").join("-");
                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === dateFormat; }) : undefined;
                var classDay = "tui-full-calendar-month-more-title-day" + (dayname === "일" ? " tui-full-calendar-holiday-sun" : "") + (holiday ? " tui-full-calendar-holiday" : "") + (dayname === "토" ? " tui-full-calendar-holiday-sat" : "");

                return '<span class="' + classDay + '">' + parseInt(dateFormat.substring(8), 10) + '</span> <span class="tui-full-calendar-month-more-title-day-label">' + dayname + (holiday ? ("<small class='d-none d-sm-inline'> (" + holiday.title + ")</small>") : "") + '</span>';
            },
            monthlyDetailPopup: function(schedules, date){
              var html = "<div class='d-flex flex-column position-relative'><button type='button' class='tui-full-calendar-popup-close close p-0 ml-auto my-0 mr-0 position-absolute' aria-label='닫기' style='right:0'><span aria-hidden='true' style='vertical-align:top;font-size:12px'>&times;</span></button>", contents;
              var basis = moment(date);
              schedules.forEach(function(schedule, index){
                if(index === 0){
                  html += "<div class='d-flex'>";
                }
                html += "<div class='monthlyDetailPopupTime montserrat col px-0'>"+(moment(schedule.start.toDate()).isSame(basis, 'days')?moment(schedule.start.toDate()).format('HH:mm'):moment(schedule.start.toDate()).format('MM. DD HH:mm')) +
                        (schedule.end?(moment(schedule.end.toDate()).isSame(basis, 'days')?moment(schedule.end.toDate()).format(' - HH:mm'):moment(schedule.end.toDate()).format(' - MM. DD HH:mm')):"") +"</div>";
                if(index === 0){
                  html += "<div class='d-inline-block' style='width:25px'></div></div>";
                }
                if(schedule.title && schedule.title !== ''){
                  contents = schedule.title;
                }else if(schedule.raw.contents && schedule.raw.contents !== ''){
                  try{
                    contents = JSON.parse(schedule.raw.contents).map(function(item){return item.value}).join(', ');
                  }catch(error){
                    contents = schedule.raw.contents;
                  }
                }else if(schedule.raw.contact && schedule.raw.contact !== ''){
                  contents = schedule.raw.contact;
                }else{
                  contents = '';
                }
                html += "<div class='monthlyDetailPopupTitle col-12 px-0'>"+contents+"</div>";
              });
              html += '</div>';
              return html;
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
            "common.border": "1px solid rgba(57, 53, 53, 0.2)",
            "common.saturday.color": "#1736ff",
            'common.dayname.color': '#393535',
            'common.holiday.color':'#fd5b77',
            'common.creationGuide.backgroundColor': '#ffdbdb',
            'common.creationGuide.border': '1px solid #ffdbdb',
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
            'week.currentTime.color': '#fd5b77',
            'week.currentTimeLinePast.border': '1px solid #fd5b77',
            'week.currentTimeLineBullet.backgroundColor': 'transparent',
            'week.currentTimeLineToday.border': '1px solid #fd5b77',
            'week.currentTimeLineFuture.border': '1px solid #fd5b77',
            "week.timegridOneHour.height": "68px",
            "week.timegridHalfHour.height": "34px",
            "week.vpanelSplitter.height": "5px",
            "week.pastDay.color": "#393535",
            "week.futureDay.color": "#393535",
            "week.pastTime.color": "#393535",
            "week.futureTime.color": "#393535",
            'week.creationGuide.color': '#fd5b77',
            'week.today.backgroundColor': 'inherit',
            'week.timegrid.paddingRight': '1px',
            'week.dayGridSchedule.marginRight': '1px',
            'week.dayname.borderTop':'none',
            'week.dayname.borderBottom':'none',
            'week.dayname.borderLeft':'none',
            'week.dayname.textAlign': 'center',
            'week.dayname.height': '51px',
            'week.dayGridSchedule.borderLeft': '2px solid',
            'week.timegridHorizontalLine.borderBottom': '1px solid rgba(57, 53, 53, 0.2)',
            'week.daygrid.borderRight': '1px solid rgba(57,53,53,0.2)',
            'week.timegrid.borderRight': '1px solid rgba(57,53,53,0.2)',
            'week.daygridLeft.width': '54px',
            'week.timegridLeft.borderRight': 'none',
            'week.timegridLeft.width': '54px'
        }
    });

    NMNS.calendar.on({
      clickSchedule: function(e){
				if(e.type !== 'monthlyClickSchedule'){
					NMNS.scheduleTarget = e;
					initScheduleTab(e);
					$("#scheduleTabList a[data-target='#scheduleTab']").text('예약 상세').tab('show');
					$("#scheduleTabList a[data-target='#taskTab']").text('일정 추가');
					$("#taskBtn").text('일정 추가 완료');
					$("#deleteTaskBtn").hide().next().removeClass('ml-1');
					$("#scheduleBtn").text('저장');
					$("#scheduleModal").addClass('update').modal('show');
				}
      },
      beforeCreateSchedule: function(e) {
        NMNS.scheduleTarget = e;
        initScheduleTab(e);
        $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').tab('show');
        $("#scheduleTabList a[data-target='#taskTab']").text('일정 추가');
        $("#taskBtn").text('일정 추가 완료');
        $("#deleteTaskBtn").hide().next().removeClass('ml-1');
        $("#scheduleBtn").text('예약 추가 완료');
        $("#scheduleModal").removeClass('update').modal('show');
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
        }
      },
      beforeDeleteSchedule: function(e) {
          NMNS.history.push(e.schedule);
          NMNS.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
          NMNS.socket.emit("update reserv", { id: e.schedule.id, status: "DELETED" });
      },
      beforeChangeView: function(e){
        NMNS.calendar.changeView(e.viewName);
        NMNS.calendar.setDate(e.date);
        setDropdownCalendarType();
        setRenderRangeText();
        setSchedules();
      }
    });

    NMNS.socket = io();
    NMNS.socket.emit("get info");
    NMNS.socket.emit("get manager");
    setTimeout(function(){
      NMNS.socket.emit("get task", {start:moment().format('YYYYMMDD'), end:moment().add(7, 'days').format('YYYYMMDD')});
    }, 200);

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
        if (NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" && moment(NMNS.info.signUpDate, "YYYYMMDD").add(30, 'd').isSameOrAfter(moment(), 'day')) {// TODO : 알림 처리
            showNotification({
                title: "이메일을 인증해주세요!",
                body: "이메일을 인증하면 WA:SHOW의 모든 기능을 이용하실 수 있습니다. 이메일을 인증해주세요! 인증메일은 내 매장 정보 화면에서 다시 보내실 수 있습니다."
            });
        }
        //tutorial & tip start
        // if (NMNS.info.isFirstVisit) {
        //     if (!document.getElementById("tutorialScript")) {
        //         var script = document.createElement("script");
        //         script.src = "/nmns/js/tutorial.min.js";
        //         script.id = "tutorialScript";
        //         document.body.appendChild(script);

        //         script.onload = function() {
        //             $("#tutorialModal").modal();
        //         };
        //     }
        // }
        /*else if((getCookie("showTips") === "true" || getCookie("showTips") === undefined) && Math.random() < 0.5){
            $("#tipsModal").modal("show");
        }*/
        //tutorial & tip end
        //announcement start
        if(NMNS.info.newAnnouncement){
          $("#announcementIcon").addClass('icon-announcement-count');
          $('.announcementCount').html(NMNS.info.newAnnouncement > 99? '99+' : NMNS.info.newAnnouncement)
        }else{
          $("#announcementIcon").removeClass('icon-announcement-count');
        }
        //announcement end
        if(NMNS.info.logo){
          changeMainShopLogo(true, NMNS.info.logo);
        }
    }));

    NMNS.socket.on("get manager", socketResponse("담당자 정보 받아오기", function(e) {
        e.data.forEach(function(item) {
            item.checked = true;
            item.bgColor = getBackgroundColor(item.color);
            item.borderColor = item.color;
            item.color = item.color;
        });

        $("#lnbManagerList").html(generateLnbManagerList(e.data)).on("touch click", ".updateManagerLink", updateManager).on("touch click", ".removeManagerLink", removeManager);
        if($("#sidebarContainer").data('scroll')){
          $("#sidebarContainer").data('scroll').update();
        }
        NMNS.calendar.setCalendars(e.data);
        if (NMNS.needInit) {
            delete NMNS.needInit;
            setSchedules();
        }
        //$('#mainTaskContents').html(generateTaskList([{date:'20190320', task:[{title:'aaa', manager:'happy@store.com20180907050532384', contents:'aaa', start:'201903200101', end:'201903202359'}]}, {date:'20190321', task:[{title:'abbbaa', manager:'happy@store.com20180907050532384', contents:'aabbba', start:'201903210102', end:'201903232350'}]}, {date:'20190322', task:[]}]));
        $("#mainTaskContents input").off("change").on('change', function(e){
          e.stopPropagation();
          var data = $(this).parent();
          NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
          NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
        })
        $("#mainTaskContents .task").off("touch click").on('touch click', function(e){
          e.stopPropagation();
          var data = $(this).parent();
          initTaskTab({id:data.data('id'), name:data.data('name'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'})
          $("#scheduleTabList a[data-target='#taskTab']").tab('show');
          $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가');
          $("#scheduleBtn").text('예약 추가 완료');
          $("#scheduleModal").removeClass('update').modal('show')
        });
        refreshScheduleVisibility();
    }));

    //business specific functions about calendar start
	$("#resizeCalendar").on("touch click", function(){
		if($(this).hasClass('maximized')){//about to minimize
			$(".calendarMenu .menuTitle").css('display', 'flex');
		}else{//about to maximize
			$(".calendarMenu .menuTitle").hide();
		}
		NMNS.calendar.render();
		$(this).toggleClass('maximized').blur();
	});
	$("#toggleCalendarToday").on("touch click", function(){
		$(this).blur();
		NMNS.calendar.setDate(new Date());
		setDropdownCalendarType();
		setRenderRangeText();
		setSchedules();
	});
    function getTimeSchedule(schedule, isAllDay) { // draw schedule block using schedule object
        var type = schedule.category === 'task' ? "일정" : "예약";
        var html = "";
        if(NMNS.calendar.getViewName() === 'week'){
          html +=  "<div class='tui-full-calendar-schedule-cover font-weight-bold row mx-auto align-items-center text-center'><div class='col-11 px-0'>"
          if(!isAllDay && moment(schedule.end.toDate()).diff(schedule.start.toDate(), 'minutes')> 60){
              html += "<div class='row mx-0' style='margin-bottom:10px'><div class='montserrat col px-0' style='font-weight:500'>" + moment(schedule.start.toDate()).format("HH:mm") + " - " + moment(schedule.end.toDate()).format("HH:mm") + "</div></div>";
          }
          if (schedule.title) {
              html += "<div class='row mx-0'><div class='col px-0' title='" + type + "이름:" + schedule.title + "'>" + schedule.title + "</div></div>";
          }
          html += "</div></div>"
        }else if(NMNS.calendar.getViewName() === 'day'){
          var contents = null;
          if(schedule.raw.contents){
            try{
              contents = JSON.parse(schedule.raw.contents).map(function(item){return item.value}).join(', ');
            }catch(error){
              contents = schedule.raw.contents;
            }
          }
          html += "<div class='tui-full-calendar-schedule-cover'><div><div class='row align-items-center' style='margin-bottom:5px'><div class='row mx-0 col'>";
          html += ("<div title='"+type+"내용:"+(contents||'')+"' class='tui-full-calendar-time-schedule-title'>" + (contents || '(예약내용 없음)')+"</div>");
          html += ("<div class='montserrat ml-auto' style='font-weight:500'>" + moment(schedule.start.toDate()).format("HH:mm") + " - " + moment(schedule.end.toDate()).format("HH:mm") + "</div></div></div><div style='font-size:11px'>" + (schedule.raw.etc || '') + "</div><div class='mt-auto tui-full-calendar-time-schedule-contact'>" + (schedule.title ? "<span title='이름:"+schedule.title+"' class='mr-1'>" + schedule.title + "</span>" : "") + (schedule.raw.contact ? "<span title='연락처:" + dashContact(schedule.raw.contact, '.') + "'>" + dashContact(schedule.raw.contact, '.') + "</span>" : "") + "</div></div></div>");
          
        }else{
          html += "예약 " + schedule.count + "건</div>"
        }

        return html;
    }

    function onClickMenu(e) { // changer calendar view
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

    function setDropdownCalendarType() {// change calendar view on small device
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

    function onClickNavi(e) { // prev, next button event on calendar
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

    function onClickTask(){ // handle event when click today's task text
				if($(window).width() < 1600){
					$(document.body).toggleClass('overflow-y-hidden');
				// if($("#mainTask").hasClass("show")){// about to hide task
				// $("#mainCalendarArea").css('minWidth', '');
				// $("#mainContents").css("minWidth", '100%');
				// $("#mainAside").css('minWidth', 'unset');
				// }else{// about to show task
				// $("#mainCalendarArea").css('minWidth', $("#mainCalendarArea").width());
				// $("#mainContents").css("minWidth", '');
				// if($("#mainAside").hasClass("sidebar-toggled")){//hided
				// $("#mainAside").css('minWidth', 'unset');
				// }else{
				// $("#mainAside").css('minWidth', '270px');
				// }
				// }
			 }
      $("#mainTask").toggleClass('show');
    }

    function findManager(managerId) {
        return NMNS.calendar.getCalendars()?NMNS.calendar.getCalendars().find(function(manager) {
            return (manager.id === managerId);
        }) : null;
    }

    function onChangeManagers(e) {
      var manager = findManager($(e.target).parents(".lnbManagerItem").data("value"))
      if (manager && manager.checked !== e.target.checked) {
        manager.checked = e.target.checked;
        refreshScheduleVisibility();
      }
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
        
        //$('#mainTask').css('minHeight', document.getElementById('mainCalendarArea').offsetHeight + 'px');
    }

    function setRenderRangeText() {
        var renderRange = document.getElementById('renderRange');
        var options = NMNS.calendar.getOptions();
        var viewName = NMNS.calendar.getViewName();
        var html = "";
        if (viewName === 'day') {
            var today = moment(NMNS.calendar.getDate().getTime());
            html += today.format('YYYY. MM. DD');
            var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === today.format('YYYY-MM-DD'); }) : undefined;
            html += "<span class='flex-column base-font ml-3 position-relative'"+ (holiday?"" : " style='opacity:0.5'")+">"+ (holiday?"<div class='render-range-text-holiday'>" + holiday.title + "</div>":"") +"<span style='font-size:22px;vertical-align:bottom'>"+['일', '월', '화', '수', '목', '금', '토'][moment(NMNS.calendar.getDate().getTime()).day()]+"요일</span></span>";
            renderRange.style.width = '280px';
        } else if (viewName === 'month' && (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
            html += moment(NMNS.calendar.getDate().getTime()).format('YYYY. MM');
            renderRange.style.width = '120px';
        } else {
            html += moment(NMNS.calendar.getDateRangeStart().getTime()).format('YYYY. MM. DD');
            html += ' - ';
            html += moment(NMNS.calendar.getDateRangeEnd().getTime()).format(' MM. DD');
            renderRange.style.width = '280px';
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
                return "<span class='badge badge-primary badge-pill'><span class='icon-email-ok mr-1'></span>인증완료</span>";
        }
        return "";
    }

    function generateLnbManagerList(managerList) {
        var html = "";
        managerList.forEach(function(item) {
            html += "<div class='lnbManagerItem row mx-0' data-value='" + item.id + "'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
            html += "<span title='이 담당자의 예약 가리기/보이기' data-color='" + item.color + "'"+ (item.checked?" style='background-color:"+item.color+";border-color:"+item.color+"'":"")+"></span><span class='menu-collapsed'>" + item.name + "</span></label>"+
                  "<div class='dropdown menu-collapsed ml-auto'><button class='btn btn-flat dropdown-toggle lnbManagerAction text-white py-0 pr-0' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' data-offset='9,10'><span class='contextual menu-collapsed'></span></button>"+
                  "<div class='dropdown-menu dropdown-menu-right'><a class='dropdown-item updateManagerLink' href='#'>이름/컬러 변경</a><a class='dropdown-item removeManagerLink' href='#'>삭제</a></div></div></div>";
        });
        return html;
    }
    
    function updateManager(e){
      if(e.stopPropagation){
        e.stopPropagation();
      }
      if(e.preventDefault){
        e.preventDefault();
      }
      if($("#lnbManagerForm").data('id')){
        $("#lnbManagerList .lnbManagerItem[data-value='"+$("#lnbManagerForm").data('id')+"']").show();
      }
      initLnbManagerForm();
      var manager = findManager($(this).parents(".lnbManagerItem").hide().data('value'));
      $("#lnbManagerFormColor").data('value', manager.color).css('borderColor', manager.color).css('backgroundColor', manager.color);
      $("#lnbManagerColor .lnbManagerColorTemplate").prop('checked', false).filter("[value='"+manager.color+"']").prop('checked', true);
      $("#lnbManagerForm").data('id', manager.id).show();
      $("#lnbManagerFormName").val(manager.name).focus();
    }
    
    function removeManager(e){
      if(e.stopPropagation){
        e.stopPropagation();
      }
      if(e.preventDefault){
        e.preventDefault();
      }
      if($("#lnbManagerList .lnbManagerItem").length <= 1){
        alert('담당자는 최소 1명 이상이 있어야 합니다.');
        return;
      }
      var manager = findManager($(this).parents(".lnbManagerItem").data('value'));
			if(manager){
				NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().remove(manager.id, function(item, target) { return item.id === target; }));
				NMNS.history.push({ id: manager.id, bgColor: manager.bgColor, borderColor: manager.borderColor, color: manager.color, name: manager.name });
				$("#lnbManagerList .lnbManagerItem[value='"+manager.id+"']").remove();
				NMNS.socket.emit("delete manager", { id: manager.id });
				$(this).parents(".lnbManagerItem").remove();
			}else{
				showSnackBar('삭제할 담당자를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
			}
      
    }
    
    function generateTaskList(taskList) {
      var html = "";
      if(taskList.length > 0){
        var today = moment().format('YYYYMMDD');
        var tomorrow = moment().add(1, 'days').format('YYYYMMDD');
        taskList.forEach(function(day){
          if(day.task.length > 0){
            html += "<div class='taskDate' style='font-size:12px;opacity:0.5'><hr class='hr-text' data-content='"+(day.date === today?'오늘':(day.date === tomorrow?'내일':moment(day.date, 'YYYYMMDD').format('YYYY. MM. DD')))+"'></div>"
            day.task.forEach(function(task, index){
              var manager = findManager(task.manager) || {};
              html += "<div class='position-relative' data-id='"+task.id+"' data-calendar-id='"+task.manager+"' data-start='"+task.start+"' data-end='"+task.end+"' data-name='"+task.name+"'><input type='checkbox' class='task-checkbox' id='task-checkbox"+index+"'"+(task.isDone?" checked='checked'":"")+"><label for='task-checkbox"+index+"'></label><div class='flex-column d-inline-flex cursor-pointer task' style='margin-left:10px;max-width:calc(100% - 35px)'><div style='font-size:14px'>"+task.name+"</div><div class='montserrat' style='font-size:12px;opacity:0.5'>"+
              moment(task.start, 'YYYYMMDDHHmm').format(moment(task.start, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')
              + (task.end?' - ' + (moment(task.end, 'YYYYMMDDHHmm').format(moment(task.end, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')):'')
              +"</div></div><span class='tui-full-calendar-weekday-schedule-bullet' style='top:8px;right:0;left:auto;background:"+manager.borderColor+"' title='"+manager.name+"'></span></div>"
            })
          }
        })
      }else{
        html = "<div class='align-items-center justify-center d-flex flex-column' style='height:100%;font-size:13px'>등록된 일정이 없어요.</div>"
      }
      return html;
    }

    function changeMainShopName(shopName) {
      $("#mainShopName").text(shopName !== "" ? shopName : NMNS.email);
      $("#mainShopCapital").text(shopName !== ""? shopName.substring(0,1) : NMNS.email.substring(0,1));
    }
    
    function changeMainShopLogo(isImage, shopName){
      if(isImage){
        $("#mainShopCapital").addClass('d-none');
        $("#mainShopIcon").removeClass('d-none').attr('src', shopName);
      }else{
        $("#mainShopIcon").addClass('d-none');
        $("#mainShopCapital").text(shopName !== ""? shopName.substring(0,1) : NMNS.email.substring(0,1)).removeClass('d-none');
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
                html += '<div class="row alrimRow col mx-0 px-0" title="눌러서 전송된 알림톡 내용 보기"><a href="#alrimDetail' + (index+base) + '" class="alrimDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="alrimDetail' + (index+base) + '"></a><div class="col-2 pr-0 text-left montserrat">' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '</div><div class="col-3 offset-2 ellipsis">' + (item.name || '(이름 없음)')+ '</div><div class="col-4 px-0 montserrat">' + dashContact(item.contact) + '</div><div class="col-1"></div></div>' +
                    '<div class="row alrimDetailRow collapse mx-0 col-12" id="alrimDetail' + (index+base) + '">'+(item.contents?item.contents.replace(/\n/g, "<br>"):'')+'</div>';
                if (index > 0 && index % 50 === 0) {
                    $("#alrimHistoryList").append(html);
                    html = "";
                }
            });
            list.append(html);
            $("#alrimHistoryList .alrimDetailLink").off('touch click').on("touch click", function(){
              $(this).parent().toggleClass('show');
							/*if($(this).parent().hasClass('show')){
								document.getElementById('alrimHistoryList').scrollTop = $(this).offset().top - ( $("#alrimHistoryList").height() - $(this).outerHeight(true) ) / 2;	
								list.data("scroll").update();
							}*/
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
            if ($("#alrimCallbackPhone").val().replace(/-/gi, '') === "") {
                alert("알림톡을 사용하시려면 예약취소 알림톡을 받을 휴대폰번호를 입력해주세요!");
                $("#alrimCallbackPhone").focus();
                return;
            } else if (!(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test($("#alrimCallbackPhone").val().replace(/-/gi, '')))) {
                alert("입력하신 휴대폰번호가 정확하지 않습니다.\n휴대폰번호를 정확히 입력해주세요!");
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
        if ($("#alrimCallbackPhone").val().replace(/-/gi, '') !== (NMNS.info.alrimTalkInfo.callbackPhone || "")) {
            history.callbackPhone = NMNS.info.alrimTalkInfo.callbackPhone;
            parameters.callbackPhone = $("#alrimCallbackPhone").val().replace(/-/gi, '');
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

    function submitInfoModal() {
        //validation start
        var beginTime = moment($("#infoBizBeginTime").val(), 'HHmm');
        if (!beginTime.isValid()) {
            alert("매장 운영 시작시간이 올바르지 않습니다.");
            $("#infoBizBeginTime").focus();
            return;
        }
        var endTime = moment($("#infoBizEndTime").val(), 'HHmm');
        if (!endTime.isValid()) {
            alert("매장 운영 종료시간이 올바르지 않습니다.");
            $("#infoBizEndTime").focus();
            return;
        }
        if (beginTime.isAfter(endTime)) {
            beginTime = [endTime, endTime = beginTime][0];
        } else if(beginTime.isSame(endTime)){
          alert('매장 운영 시작시간과 종료시간이 같습니다.');
          return;
        }
        if ($("#infoShopName").val() === "" && NMNS.info.alrimTalkInfo.useYn === "Y") {
            alert("알림톡을 사용하고 계실 때는 예약고객에게 보여드릴 매장이름이 반드시 있어야 합니다.\n매장이름을 삭제하고 싶으시다면 알림톡 사용을 먼저 해제해주세요.");
            $("#infoShopName").val(NMNS.info.shopName);
            return;
        }
        //validation end
        //update info start
        var parameters = {}, diff = false, logo = false,
            history = { id: "info" };
        if ((beginTime.format("HHmm") !== NMNS.info.bizBeginTime) || (endTime.format("HHmm") !== NMNS.info.bizEndTime)) {
            history.hourStart = NMNS.info.bizBeginTime || "0900";
            history.hourEnd = NMNS.info.bizEndTime || "2300";
            parameters.bizBeginTime = beginTime.format("HHmm");
            parameters.bizEndTime = endTime.format("HHmm");
            NMNS.info.bizBeginTime = parameters.bizBeginTime || "0900";
            NMNS.info.bizEndTime = parameters.bizEndTime || "2300";
            NMNS.calendar.setOptions({ week: { hourStart: (parameters.bizBeginTime ? parseInt(parameters.bizBeginTime.substring(0, 2), 10) : NMNS.calendar.getOptions().week.hourStart), hourEnd: (parameters.bizEndTime ? parseInt(parameters.bizEndTime.substring(0, 2), 10) : NMNS.calendar.getOptions().week.hourEnd) } });
            diff = true;
        }
        if ($("#infoShopName").val() !== (NMNS.info.shopName || "")) {
            history.shopName = NMNS.info.shopName;
            parameters.shopName = $("#infoShopName").val();
            NMNS.info.shopName = parameters.shopName;
            changeMainShopName(parameters.shopName);
            diff = true;
        }
        if ($("#infoBizType").val() !== (NMNS.info.bizType || "")) {
            history.bizType = NMNS.info.bizType;
            parameters.bizType = $("#infoBizType").val();
            NMNS.info.bizType = parameters.bizType;
            diff = true;
        }
        
        if(document.getElementById('infoLogo').files[0] && !$("#infoLogo").data("deleted")){
          logo = true;
        } else if($("#infoLogo").data("deleted") && NMNS.info.logo){
          history.logo = NMNS.info.logo;
					history.logoFileName = NMNS.info.logoFileName;
          parameters.logo = null;
          changeMainShopLogo(false, NMNS.info.shopName);
          diff = true;
        }
        
				if(logo){
					var fileReader = new FileReader();
					fileReader.loadend = function(){};
					fileReader.onload=function(e){
						NMNS.socket.emit("upload logo", {fileData:e.target.result, fileName:document.getElementById('infoLogo').files[0].name});
					};
          fileReader.readAsArrayBuffer(document.getElementById('infoLogo').files[0]);
        }
        if (diff) {
            NMNS.history.push(history);
					  NMNS.socket.emit("update info", parameters);
        } 
        
        if( !diff && !logo ) {
            showSnackBar("<span>변경된 내역이 없습니다.</span>");
        }
        //update info end
    }

    function refreshInfoModal() {
      $("#infoEmail").text(NMNS.email);
      $("#infoAuthStatus").html(NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" ? $(generateAuthStatusBadge(NMNS.info.authStatus)).on("touch click", function() {
          NMNS.socket.emit("send verification", {});
          showSnackBar("<span>인증메일을 보냈습니다. 도착한 이메일을 확인해주세요!</span>");
      }) : generateAuthStatusBadge(NMNS.info.authStatus));
      $("#infoShopName").val(NMNS.info.shopName);
      $("#infoBizType").val(NMNS.info.bizType);
      $("#infoBizBeginTime").val(NMNS.info.bizBeginTime);
      $("#infoBizEndTime").val(NMNS.info.bizEndTime);
			if($("#addLogo").text() === '삭제'){
				$("#addLogo").trigger("click");
			}
      if(NMNS.info.logo){
        $("#addLogo").text("삭제").prev().val(NMNS.info.logoFileName);
      }
			$("#infoLogo").data("done", null).data("deleted", null);
    }

    function initNoShowModal() {
        if (!$("#noShowScheduleList").hasClass("ps")) {
          $("#noShowScheduleList").data("scroll", new PerfectScrollbar("#noShowScheduleList", { suppressScrollX: true }));
        
          $(".noShowAddCase").off("touch click").on("touch click", function() {
            $(this).siblings().removeClass("bg-primary");
            $(this).toggleClass('bg-primary');
            if($(this).parent().is($("#noShowAddContent")) && $("#noShowAddContact").val().replace(/-/gi, '').trim().length > 0 && ($(this).parent().children('.bg-primary').length > 0 || $(this).siblings('input').val().trim().length > 0)){
              $(this).parent().next().children("span").css('opacity', 1)
            } else if($(this).parent().is($("#noShowScheduleContent")) && $("#noShowScheduleList input:checked").length > 0 && ($(this).parent().children('.bg-primary').length > 0 || $(this).siblings('input').val().trim().length > 0)){
              $(this).parent().next().children("span").css('opacity', 1)
            }else{
              $(this).parent().next().children("span").css('opacity', 0.35)
            }
          });
          $("#noShowAddCaseEtc,#noShowScheduleCaseEtc").on("keyup", function(e){
            $(this).siblings().removeClass('bg-primary')
            if($(this).parent().is($("#noShowAddContent")) && $("#noShowAddContact").val().replace(/-/gi, '').trim().length > 0 && $(this).val().trim().length > 0){
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
            if ($("#noShowAddContact").val().replace(/-/gi, '') === "") {
              showSnackBar("<span>저장할 전화번호를 입력해주세요!</span>");
              return;
            }else if($("#noShowAddContent .noShowAddCase.bg-primary").length === 0 && $("#noShowAddCaseEtc").val().trim().length === 0){
              showSnackBar("<span>노쇼 사유를 선택해주세요.</span>");
              return;
            }
            NMNS.socket.emit("add noshow", { id: NMNS.email + generateRandom(), contact: $("#noShowAddContact").val().replace(/-/gi, ''), noShowCase: $("#noShowAddContent .bg-primary").length === 0 ? $("#noShowAddCaseEtc").val().trim() : $("#noShowAddContent .bg-primary").data("value") });
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
            NMNS.history.push({id:item.data('id'), status:item.data('status'), manager:item.data('manager'), contents:item.data('contents')});
						NMNS.calendar.updateSchedule(item.data('id'), item.data('manager'), {
                      raw:{
                        status:"NOSHOW"
                      }
                  });
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
          $("#noShowAddContact").on("keyup", function(e) {
              if (e.which === 13) {
                  $("#noShowAddBtn").trigger("click");
              }
          })

          $("#noShowTabList a[href='#noShowSchedule']").on("show.bs.tab", function(){
            $("#noShowScheduleSearch").trigger('click');
          }).on("shown.bs.tab", function(){
						$("#noShowScheduleTarget").focus();
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
                  return dashContact(suggestion.value) + " (" + (suggestion.data || '(이름없는 고객)') + ")";
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
                  return (suggestion.value || '(이름없는 고객)') + " (" + dashContact(suggestion.data) + ")";
              },
              onSearchError: function() {},
              onSelect: function(suggestion) {
                  $("#noShowScheduleContact").val(suggestion.data);
              }
          }, NMNS.socket);
        } else {
          $("#noShowAddContact").autocomplete().clearCache();
          $("#noShowScheduleTarget").autocomplete().clearCache();
        }
    }

    function generateTaskManagerList(allowClear) {
        var html = allowClear?"<button type='button' class='dropdown-item tui-full-calendar-dropdown-item'>선택</button>":"";
        NMNS.calendar.getCalendars().forEach(function(item) {
            html += "<button type='button' class='dropdown-item tui-full-calendar-dropdown-item ellipsis' data-calendar-id='" + item.id + "' data-color='" + item.color + "'>" +
                "<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot mr-3' style='background-color: " + item.color + "'></span>" +
                "<span class='tui-full-calendar-content'>" + item.name + "</span>" +
                "</button>";
        });
        return html;
    }
    
    function generateContentsList(contents){
      var html = "";
      if(contents === null || contents === undefined){
        contents = [''];
      }else if(typeof contents === 'string'){
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
        return !inputs.find(function(input){return input.value === (item && item.value || item) && !(item === '' && input.value === '')});
      }).forEach(function(item){
        var temp = inputs.find(function(input){return (input.value === '' || !input.value) && item !== ''})
        if(temp){
          $(temp).data('menu-id', item?item.menuId:null).val(item && item.value || item);
          return;
        }
        html += '<div class="row mx-0 col-12 px-0"><input class="form-control form-control-sm han col" name="scheduleContents" aria-label="예약 내용" placeholder="예약 내용을 직접 입력하거나 메뉴에서 선택하세요." autocomplete="off" list="scheduleTabContentList" value="'
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
        html += '<option value="'+item.name+'"></option>';
      });
      return html;
    }
    NMNS.generateMenuList = generateMenuList;
	
    function generateSalesContents(sales){
      var html = "";
      if(Array.isArray(sales) && sales.length > 0){
        var membership = sales[0] && sales[0].balanceMembership > 0, isRegistered;
        sales.forEach(function(sale, index){//draw selective form area
          isRegistered = Number.isInteger(sale.priceCard) || Number.isInteger(sale.priceCash) || Number.isInteger(sale.priceMembership);
          html += '<div class="scheduleSalesItem">'+sale.item+'</div><div class="scheduleSalesPayments" data-item="'+sale.item+'" data-index="'+index+'" data-id="'+(sale.id || moment().format('YYYYMMDDHHmmssSSS') + generateRandom())+'"' 
          + (sale.customerId?(' data-customer-id="'+(sale.customerId || '')+'"'):'') + (sale.managerId?(' data-manager-id="'+(sale.managerId || '')+'"'):'')+ ' data-type="'+(sale.type || 'CARD')+'" data-is-registered="'+isRegistered+'">';
          if(!isRegistered){
            html += '<input type="text" pattern="[0-9]*" class="form-control form-control-sm scheduleSalesPaymentPrice" name="scheduleSalesPaymentPrice" value="'+(sale.price || '')+'" data-old-value="'+(sale.price || '')+'" placeholder="금액을 숫자로 입력하세요.">';
          }
          if(!isRegistered || Number.isInteger(sale.priceCard)){
            html += '<input type="radio" class="scheduleSalesPayment" name="scheduleSalesPayment'+index+'" value="CARD" data-price="' + sale.priceCard + '" data-index="'+index+'" id="scheduleSalesPaymentCard' + index +'"'+(sale.type === "CARD" || !sale.type ? ' checked="checked"' : '')+'><label for="scheduleSalesPaymentCard'+index+'"></label><label for="scheduleSalesPaymentCard'+index+'" style="margin-right:30px">카드' 
              + (sale.priceCard ? ' <span class="montserrat">'+(sale.priceCard+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</span> 원' : '') + '</label>';
          }
          if(!isRegistered || Number.isInteger(sale.priceCard)){
            html += '<input type="radio" class="scheduleSalesPayment" name="scheduleSalesPayment'+index+'" value="CASH" data-price="' + sale.priceCash + '" data-index="'+index+'" id="scheduleSalesPaymentCash' + index +'"'+(sale.type === "CASH" || (isRegistered && !Number.isInteger(sale.priceCard))? ' checked="checked"' : '')+'><label for="scheduleSalesPaymentCash'+index+'"></label><label for="scheduleSalesPaymentCash'+index+'" style="margin-right:30px">현금' 
              + (sale.priceCash ? ' <span class="montserrat">'+(sale.priceCash+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</span> 원' : '') + '</label>';
          }
          if((isRegistered && Number.isInteger(sale.priceMembership)) || (!isRegistered && membership)){//등록된 메뉴이고 멤버십 가격이 있거나, 등록되지 않은 메뉴이고 멤버십 내역이 있는 경우
            html += '<input type="radio" class="scheduleSalesPayment" name="scheduleSalesPayment'+index+'" value="MEMBERSHIP" data-price="' + sale.priceMembership + '" data-index="'+index+'" id="scheduleSalesPaymentMembership' + index +'"'+(!membership || sales[0].balanceMembership < sale.priceMembership ? ' disabled="disabled"' : '')+'><label for="scheduleSalesPaymentMembership'+index+'"'+(sale.type === "MEMBERSHIP" || (isRegistered && !Number.isInteger(sale.priceMembership))? ' checked="checked"' : '')+'></label><label for="scheduleSalesPaymentMembership'+index+'">멤버십' 
              + (sale.priceMembership ? ' <span class="montserrat">'+(sale.priceMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</span> 원' : '') + '</label>';
          }
          html += '</div>';
        });
        html += '<div class="scheduleSalesSummary">';
        if(membership){
          html += '<div id="scheduleSalesBalanceMembership" class="scheduleSalesSummaryItem" data-index="0" data-balance-membership="'+sales[0].balanceMembership+'">멤버십 잔액<span class="ml-auto montserrat">'+(sales[0].balanceMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+' </span> 원</div>';
        }
        var membershipUsage = 0, priceTotal = 0;
        sales.forEach(function(sale, index){//draw summary area
          html += '<div class="scheduleSalesSummaryItem" data-index="'+index+'">'+sale.item+'<span class="ml-auto montserrat'+(sale.type === 'MEMBERSHIP'?' membershipSummary':'')+'"><span class="scheduleSalesSummaryMembershipSign">- </span><span class="scheduleSalesSummaryPrice">'
            + ((sale.type === 'CARD' || !sale.type)? ((sale.price || sale.priceCard || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : (sale.type === 'CASH'? ((sale.price || sale.priceCash || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : ((sale.price || sale.priceMembership || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")))
            + ' </span></span> 원</div>';
          if(sale.type === 'MEMBERSHIP'){
            membershipUsage += Number.isInteger(sale.price || sale.priceMembership) ? sale.price || sale.priceMembership : 0;
            priceTotal += Number.isInteger(sale.price || sale.priceMembership) ? sale.price || sale.priceMembership : 0;
          }else if(sale.type === 'CASH'){
            priceTotal += Number.isInteger(sale.price || sale.priceCash) ? sale.price || sale.priceCash : 0;
          }else{
            priceTotal += Number.isInteger(sale.price || sale.priceCard) ? sale.price || sale.priceCard : 0;
          }
        });
        html += '<hr/><div id="scheduleSalesPriceTotal" class="scheduleSalesSummaryItem" data-price-total="'+priceTotal+'">총 결제금액<span class="ml-auto montserrat">'+(priceTotal+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</span> 원</div>';
        if(membership){
          html += '<div id="scheduleSalesRemainingMembership" class="scheduleSalesSummaryItem" data-remaining-balance="'+(sales[0].balanceMembership - membershipUsage)+'">차감 후 멤버십 잔액<span class="ml-auto montserrat">'+((sales[0].balanceMembership - membershipUsage)+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</span> 원</div>';
        }
        html += '</div>';
        html = $(html).on('change', '.scheduleSalesPayment', function(e){
          var remainingMembership = $("#scheduleSalesRemainingMembership").data('remaining-balance') * 1;
          var isRegistered = $(this).parent().data('is-registered') === true;
          var price, previousPrice;
          if($(this).val() === 'MEMBERSHIP'){//cash, card -> membership; 1. refresh other contents un-disabled membership radio button to disabled which has more amount then after balance.
            price = isRegistered ? $(this).data('price') * 1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
            if(remainingMembership < price){
              alert('멤버십 잔액이 부족합니다.');
              $("#salesBtn").addClass('disabled');
              $("#scheduleSalesRemainingMembership span").addClass('text-accent');
            }
            remainingMembership -= price;
            $("#scheduleSalesRemainingMembership").data('remaining-balance', remainingMembership).find('span').text((remainingMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
            previousPrice = isRegistered ? $(this).siblings('[value="'+$(this).parent().data('type')+'"]').data('price')*1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
            $("#salesTab .scheduleSalesPayment[value='MEMBERSHIP']").each(function(index, radio){
              $(radio).prop('disabled', $(radio).data('price')*1 > remainingMembership);
            });
            $(".scheduleSalesSummaryItem[data-index='"+$(this).parent().data('index')+"']").addClass('membershipSummary');
          }else if($(this).parent().data('type') === 'MEMBERSHIP'){// membership -> cash, card; 1. refresh other contents disabled membership due to lack of balance.
            previousPrice = isRegistered ? $(this).siblings('[value="MEMBERSHIP"]').data('price')*1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
            if(remainingMembership < 0 && remainingMembership + previousPrice > 0){
              $("#salesBtn").removeClass('disabled');
              $("#scheduleSalesRemainingMembership span").removeClass('text-accent');
            }
            remainingMembership += previousPrice;
            $("#scheduleSalesRemainingMembership").data('remaining-balance', remainingMembership).find('span').text((remainingMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
            price = isRegistered ? $(this).data('price') * 1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
            $("#salesTab .scheduleSalesPayment[value='MEMBERSHIP']").each(function(index, radio){
              $(radio).prop('disabled', $(radio).data('price')*1 > remainingMembership);
            });
            $(".scheduleSalesSummaryItem[data-index='"+$(this).parent().data('index')+"']").removeClass('membershipSummary');
          }else{// cash <-> card
            previousPrice = isRegistered ? $(this).siblings('[value="'+$(this).parent().data('type')+'"]').data('price')*1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
            price = isRegistered ? $(this).data('price') * 1 : $(this).siblings('.scheduleSalesPaymentPrice').val() * 1;
          }
          //common. 1. refresh total price of sales. 2. set type of payment data
          $("#scheduleSalesPriceTotal").data('price-total', ($("#scheduleSalesPriceTotal").data('price-total') * 1) - previousPrice + price).find('span').text(($("#scheduleSalesPriceTotal").data('price-total') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
          $(".scheduleSalesSummaryItem[data-index='"+$(this).parent().data('index')+"'] .scheduleSalesSummaryPrice").text((price + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
          $(this).parent().data('type', $(this).val());
        }).on('keyup', '.scheduleSalesPaymentPrice', debounce(function(e){
          var previousPrice = $(this).data('old-value') * 1;
          var price = $(this).val().replace(/[^\d]/g, '');
          $(this).val(price);
          price *= 1;
          if(previousPrice !== price){
            $(this).data('old-value', price);
            if($(this).parent().data('type') === 'MEMBERSHIP'){
              var remainingMembership = $("#scheduleSalesRemainingMembership").data('remaining-balance') * 1;
              if(remainingMembership + previousPrice - price < 0){
                alert('멤버십 잔액이 부족합니다.');
                $("#salesBtn").addClass('disabled');
                $("#scheduleSalesRemainingMembership span").addClass('text-accent');
              }else{
                $("#salesBtn").removeClass('disabled');
                $("#scheduleSalesRemainingMembership span").removeClass('text-accent');
              }
              remainingMembership = remainingMembership + previousPrice - price;
              $("#scheduleSalesRemainingMembership").data('remaining-balance', remainingMembership).find('span').text((remainingMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
            }
            $(".scheduleSalesSummaryItem[data-index='"+$(this).parent().data('index')+"'] .scheduleSalesSummaryPrice").text((price + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
            $("#scheduleSalesPriceTotal").data('price-total', ($("#scheduleSalesPriceTotal").data('price-total') * 1) - previousPrice + price).find('span').text(($("#scheduleSalesPriceTotal").data('price-total') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
          }
        }, 300));
      }else{
        html += '<div style="height:300px;align-items:center;width:100%;display:flex;justify-content:center;font-size:15px">예약 내용(메뉴)을 입력하면 매출내역을 기록할 수 있어요!</div>';
      }
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
        // $("#scheduleTabContentList").html(generateMenuList([{menuId:'1234', menuName:'테스트 메뉴'}]))//TODO : remove this line (for test)
      }
      $("#scheduleBtn").text(e && e.schedule ? "예약 변경 완료" : "예약 추가 완료");
			if($("#scheduleName").autocomplete()){
				$("#scheduleName").autocomplete().clearCache();
			}
			if($("#scheduleContact").autocomplete()){
				$("#scheduleContact").autocomplete().clearCache();
			}
      
      $("#scheduleTab").data('contact', e && e.schedule && e.schedule.raw ? e.schedule.raw.contact : null).data('name', e && e.schedule?e.schedule.title : '');
      if(typeof e === 'object'){// dragged calendar / update schedule
        if(e.schedule){// update schedule
          $("#scheduleStatus input[type='radio']").prop('checked', false);
          if($("#scheduleStatus input[value='"+e.schedule.raw.status+"']").length){
            $("#scheduleStatus input[value='"+e.schedule.raw.status+"']").prop('checked', true);
          }else if(e.schedule.raw.status === 'CUSTOMERCANCELED'){
            $("#scheduleStatus input[value='CANCELED']").prop('checked', true);
          }else{
            $("#scheduleStatus input[value='RESERVED']").prop('checked', true);
          }
          
          document.getElementById('scheduleStartDate')._flatpickr.setDate(e.schedule.start.toDate());
          document.getElementById('scheduleEndDate')._flatpickr.setDate(e.schedule.end.toDate());
          $("#scheduleStartTime").val(moment(e.schedule.start.toDate()).format('HHmm'));
          $("#scheduleEndTime").val(moment(e.schedule.end.toDate()).format('HHmm'));
    
          $('#scheduleName').val(e.schedule.title);
          $("#scheduleTabContents").append(generateContentsList(e.schedule.raw ?e.schedule.raw.contents : "")).find('button').off('touch click').on('touch click', function(){
            removeContent(this);
          });
          
          $('#scheduleContact').val(e.schedule.raw ? e.schedule.raw.contact : e.schedule.contact);
          $('#scheduleEtc').val(e.schedule.raw ? e.schedule.raw.etc : e.schedule.etc);
          // $('#scheduleAllDay').attr('checked', e.schedule.isAllDay);
          
          if(moment(e.schedule.start.toDate()).isBefore(moment())){
            $("#resendAlrimScheduleBtn").addClass('d-none');
          }else{
            $("#resendAlrimScheduleBtn").removeClass('d-none');
          }
          calendar = findManager(e.schedule.calendarId);
        }else if(e.customer){// customer modal trigger
          document.getElementById('scheduleStartDate')._flatpickr.setDate(e.start);
          document.getElementById('scheduleEndDate')._flatpickr.setDate(e.end);
          $("#scheduleStartTime").val(moment(e.start).format('HHmm'));
          $("#scheduleEndTime").val(moment(e.end).format('HHmm'));
    
          $('#scheduleName').val(e.customer.name);
          $("#scheduleTabContents").append(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
            removeContent(this);
          });
          
          $('#scheduleContact').val(e.customer.contact);
          $('#scheduleEtc').val(e.customer.etc);
          $('#scheduleAllDay').attr('checked', false);
          
          calendar = findManager(e.customer.managerId) || NMNS.calendar.getCalendars()[0];
        }else{// dragged calendar
          document.getElementById('scheduleStartDate')._flatpickr.setDate(e.start.toDate());
          document.getElementById('scheduleEndDate')._flatpickr.setDate(e.end.toDate());
          $("#scheduleStartTime").val(moment(e.start.toDate()).format('HHmm'));
          $("#scheduleEndTime").val(moment(e.end.toDate()).format('HHmm'));
    
          $('#scheduleName').val('');
          $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
            removeContent(this);
          });
          
          $('#scheduleContact').val('');
          $('#scheduleEtc').val('');
          // $('#scheduleAllDay').attr('checked', e.isAllDay);
          
          calendar = NMNS.calendar.getCalendars()[0];
        }
        
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
        var now = moment().second(0).millisecond(0);
				var limit = moment().hour(NMNS.info.bizEndTime.substring(0, 2) * 1).minute(NMNS.info.bizEndTime.substring(2) * 1).second(0).millisecond(0);
        if (limit.diff(now, 'minutes') < 60) {
            now = moment(NMNS.info.bizEndTime, "HHmm").subtract(1, "h");
				}else{
					limit.hour(NMNS.info.bizBeginTime.substring(0, 2) * 1).minute(NMNS.info.bizBeginTime.substring(2) * 1);
					if(now.diff(limit, 'minutes') < 60) {
						now = moment(NMNS.info.bizBeginTime, "HHmm");
					}
				}
				now.minute(Math.ceil(now.minute() / 30) * 30);
        
        document.getElementById("scheduleStartDate")._flatpickr.setDate(now.toDate());
        $("#scheduleStartTime").val(now.format('HHmm'));
        document.getElementById("scheduleEndDate")._flatpickr.setDate(now.add(1, "h").toDate());
        $("#scheduleEndTime").val(now.format('HHmm'));

				$('#scheduleName').val('');
        $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
          removeContent(this);
        });
        $('#scheduleContact').val('');
        $('#scheduleAllDay').attr('checked', false);

        calendar = NMNS.calendar.getCalendars()[0];
        $('#scheduleManager').html($('#scheduleManager').next().find("button[data-calendar-id='" + calendar.id + "']").html()).data('calendar-id', calendar.id).data('color', calendar.color);
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
          $("#scheduleTabContents").append($(generateContentsList('')).on('touch click', 'button', function(){
            removeContent(this);
          }));
        });

//         var autoCompleteOption = {
//           lookup:[{value:"오전 00:00"},{value:"오전 00:30"},{value:"오전 01:00"},{value:"오전 01:30"},{value:"오전 02:00"},{value:"오전 02:30"},{value:"오전 03:00"},{value:"오전 03:30"},{value:"오전 04:00"},{value:"오전 04:30"},{value:"오전 05:00"},{value:"오전 05:30"},{value:"오전 06:00"},{value:"오전 06:30"},{value:"오전 07:00"},{value:"오전 07:30"},{value:"오전 08:00"},{value:"오전 08:30"},{value:"오전 09:00"},{value:"오전 09:30"},{value:"오전 10:00"},{value:"오전 10:30"},{value:"오전 11:00"},{value:"오전 11:30"},{value:"오후 12:00"},{value:"오후 12:30"},{value:"오후 01:00"},{value:"오후 01:30"},{value:"오후 02:00"},{value:"오후 02:30"},{value:"오후 03:00"},{value:"오후 03:30"},{value:"오후 04:00"},{value:"오후 04:30"},{value:"오후 05:00"},{value:"오후 05:30"},{value:"오후 06:00"},{value:"오후 06:30"},{value:"오후 07:00"},{value:"오후 07:30"},{value:"오후 08:00"},{value:"오후 08:30"},{value:"오후 09:00"},{value:"오후 09:30"},{value:"오후 10:00"},{value:"오후 10:30"},{value:"오후 11:00"},{value:"오후 11:30"}],
//           maxHeight:175,
//           triggerSelectOnValidInput: false,
//           zIndex:1060
//         };        
//         $('#scheduleStartTime').autocomplete(autoCompleteOption);
//         $("#scheduleEndTime").autocomplete(autoCompleteOption);
        var timeout;
        function onContactBlur() {
            clearTimeout(timeout);
            if ($('#scheduleContact').val().replace(/-/gi, '').length > 9 || $('#scheduleName').val() !== '') {
                NMNS.socket.emit('get customer', {
                    name: $('#scheduleName').val(),
                    contact: $('#scheduleContact').val().replace(/-/gi, '')
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
                return (suggestion.value || '(이름없는 고객)') + ' (' + dashContact(suggestion.data) + ')';
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

        $('#scheduleContact').autocomplete({
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
                return (suggestion.value || '(이름없는 고객)') + ' (' + dashContact(suggestion.data) + ')';
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {
                $('#scheduleName').val(suggestion.data);
                onContactBlur();
            }
        }, NMNS.socket).on('blur', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                onContactBlur();
            }, 300);
        });
        
        $("#scheduleBtn").on("touch click", function(){
          var title, startDate, endDate, startTime, endTime, contents, contact, etc, calendarId, manager;
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
          startTime = $("#scheduleStartTime").val();
          endTime = $("#scheduleEndTime").val();
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
          contents = JSON.stringify($("#scheduleTabContents input").filter(function(){return this.value !== ''}).map(function(){return {id:this.getAttribute('data-menu-id') || ((NMNS.menuList && NMNS.menuList.find(function(menu){return menu.name === this.value})) ? NMNS.menuList.find(function(menu){return menu.name === this.value}).id : NMNS.email + generateRandom()), value:this.value}}).toArray());
          contact = $('#scheduleContact').val().replace(/-/gi, '');
          etc = $('#scheduleEtc').val();
          // isAllDay = $('#scheduleAllDay').prop('checked');

          if (NMNS.info.alrimTalkInfo.useYn === 'Y' && contact !== '' && !(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test(contact))) {
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
                        status: $("#scheduleStatus input:checked").val()
                      }
                  }]);
              } else { //담당자 유지
                  NMNS.calendar.updateSchedule(origin.id, origin.calendarId, {
                      title: title,
                      start: startDate,
                      end: endDate,
                      raw:{
                        contents: contents,
                        contact: contact,
                        status:$("#scheduleStatus input:checked").val()
                      }
                  });
              }
              NMNS.socket.emit("update reserv", { //서버로 요청
									email: NMNS.email,
                  id: origin.id,
                  manager: calendarId,
                  name: title,
                  start: moment(startDate).format("YYYYMMDDHHmm"),
                  end: moment(endDate).format("YYYYMMDDHHmm"),
                  contents: contents,
                  contact: contact,
                  isAllDay: false, // 하루종일 항목 없앰
                  status:$("#scheduleStatus input:checked").val()
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
									email: NMNS.email,
                  id: id,
                  manager: calendarId,
                  name: title,
                  start: moment(startDate).format("YYYYMMDDHHmm"),
                  end: moment(endDate).format("YYYYMMDDHHmm"),
                  isAllDay: false, // 하루종일 항목 없앰
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
        });
				$("#deleteScheduleBtn").on("touch click", function(e){
					e.preventDefault();
					if(NMNS.scheduleTarget && NMNS.scheduleTarget.schedule && confirm('이 예약을 삭제하시겠어요?')){
						NMNS.history.push(NMNS.scheduleTarget.schedule);
						NMNS.calendar.deleteSchedule(NMNS.scheduleTarget.schedule.id, NMNS.scheduleTarget.schedule.calendarId);
						NMNS.socket.emit("update reserv", { id: NMNS.scheduleTarget.schedule.id, status: "DELETED" });
						$("#scheduleModal").modal('hide');
					}
				});
				$("#resendAlrimScheduleBtn").on("touch click", function(e){
					e.preventDefault();
					if(NMNS.scheduleTarget && NMNS.scheduleTarget.schedule && confirm('고객에게 알림톡을 다시 보낼까요?')){
						NMNS.socket.emit("resend alrimtalk", {id:NMNS.scheduleTarget.schedule.id});
					}
				});
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
      if(task && task.id){
        $("#taskBtn").text("저장")
        $("#deleteTaskBtn").show().next().addClass('ml-1');
      }else{
        $("#taskBtn").text("일정 추가 완료")
        $("#deleteTaskBtn").hide().next().removeClass('ml-1');
      }
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
        $('#taskStartTime').val(getTimeFormat(moment(task.start, 'YYYYMMDDHHmm')));
        $("#taskEndTime").val(getTimeFormat(moment(task.end, 'YYYYMMDDHHmm')));
        
        $("#taskName").val(task.name || "");
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
					var startTime = $("#taskStartTime").val();
          var endTime = $("#taskEndTime").val();
          if(!startTime){
            showSnackBar("시작 시간을 확인해주세요.");
            return;
          }
          if(!endTime){
            showSnackBar("종료 시간을 확인해주세요.");
            return;
          }

          start.setHours(startTime.substring(0,2)*1);
          start.setMinutes(startTime.substring(2)*1);
          end.setHours(endTime.substring(0,2)*1);
          end.setMinutes(endTime.substring(2)*1);
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
                      color: $("#taskManager").data("color"),
                      bgColor: getBackgroundColor($("#taskManager").data("color")),
                      borderColor: $("#taskManager").data("color"),
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
                  isAllDay: false // 하루종일 항목 없앰
              });
          } else { //신규 일정 추가
              if(NMNS.scheduleTarget && typeof NMNS.scheduleTarget.clearGuideElement === 'function'){
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
                  color: $("#taskManager").data("color"),
                  bgColor: getBackgroundColor($("#taskManager").data("color")),
                  borderColor: $("#taskManager").data("color"),
                  raw: {
                      status: "RESERVED"
                  }
              }]);
              NMNS.history.push({
                  id: id,
                  manager: $("#taskManager").data("calendar-id"),
                  type:'T'
              });
              NMNS.socket.emit("add reserv", {
									email: NMNS.email,
                  id: id,
                  manager: $("#taskManager").data("calendar-id"),
                  name: $("#taskName").val(),
                  start: moment(start).format("YYYYMMDDHHmm"),
                  end: moment(end).format("YYYYMMDDHHmm"),
                  isAllDay: false, // 하루종일 항목 없앰
                  type: "T",
                  status: "RESERVED"
              });
          }
          $("#scheduleModal").modal("hide");
        });
        $("#deleteTaskBtn").on("touch click", function(){
          var origin = $("#taskTab").data("task");
          NMNS.history.push(origin);
          NMNS.socket.emit("update reserv", {id:origin.id, status:'DELETED', type:'T'});
          $("#scheduleModal").modal('hide');
        });
      }
      refreshTaskTab(task);
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
                calendarId: manager.id || "A1",
                title: schedule.name || schedule.title,
                start: (typeof schedule.start === "string" ? moment(schedule.start, "YYYYMMDDHHmm").toDate() : schedule.start),
                end: (typeof schedule.end === "string" ? moment(schedule.end, "YYYYMMDDHHmm").toDate() : schedule.end),
                isAllDay: false,//하루종일 항목 없앰
                category: (schedule.type === "T" ? "task" : "time"),
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

    function deleteNoShow(self) {
        var row = self.parentsUntil("#noShowSearchList", ".row");
        NMNS.history.push({ id: row.data("id"), contact: row.data("contact") + "", date: row.data("date") + "", noShowCase: row.data("noshowcase") });
        NMNS.socket.emit("delete noshow", { id: row.data("id") });
        row.remove();
    }
/*
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
    });*/

    function drawNotificationList(data){
      var list = "";
      if(data)
      data.forEach(function(item){
        switch(item.type){
          case 'SCHEDULE_ADDED':
            list += '<div class="notification"><div class="d-flex align-items-center"><span>' + (item.title?'고객명 : ' + item.title :'고객번호 : ' + item.contact)+ '</span><span class="d-flex ml-auto montserrat notificationTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+(item.title?'고객번호 : ' + dashContact(item.contact) : '')+'<br>예약날짜 : '+ moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '<br>예약시간 : '+ moment(item.start, 'YYYYMMDDHHmm').format('HH시 mm분') + (item.contents?'<br>예약내용 : '+item.contents : '') +'</p></div><div><span class="text-accent font-weight-bold" style="font-size:14px">예약 등록</span></div></div>'
            break;
          case 'SCHEDULE_CANCELED':
            list += '<div class="notification"><div class="d-flex align-items-center"><span>' + (item.title?'고객명 : ' + item.title :'고객번호 : ' + item.contact)+ '</span><span class="d-flex ml-auto montserrat notificationTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+(item.title?'고객번호 : ' + dashContact(item.contact) : '')+'<br>예약날짜 : '+ moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '<br>예약시간 : '+ moment(item.start, 'YYYYMMDDHHmm').format('HH시 mm분') + '</p></div><div class="d-flex align-items-center"><span class="text-accent font-weight-bold" style="font-size:14px">예약 취소</span><span class="d-flex ml-auto addAnnouncementNoShow cursor-pointer" style="font-size:10px" data-schedule-id="'+item.id+'" data-manager-id="'+item.manager+'">직전취소로 노쇼등록 &gt;</span></div></div>'
            break;
          case 'ANNOUNCEMENT':
          default:
            list += '<div class="announcement"><div class="d-flex align-items-center" style="margin-bottom:15px"><span class="announcementTitle">' + item.title + '</span><span class="d-flex ml-auto montserrat announcementTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+item.contents+'</p></div><div><span class="text-accent font-weight-bold" style="font-size:14px">공지사항</span></div></div>'
            break;
        }
      });
      return list;
    }
    //business specific functions about general features end
    //after calendar initialization start
    setDropdownCalendarType();
    setRenderRangeText();
    if($(window).width() < 900){
        $('#sidebarToggler').trigger('click')
    }
    //after calendar initialization end
    //websocket response start
    /*NMNS.socket.on("get tips", socketResponse("팁 정보 가져오기", function(e) {
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
    }))*/
    NMNS.socket.on("get summary", socketResponse("예약정보 가져오기", function(e) {
        var html = "";
        if (e.data.length === 0) {
            html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>검색된 내용이 없습니다. 검색조건을 바꿔서 검색해보세요 :)</span></div>";
        } else {
            e.data.forEach(function(item) {
              var contents = "";
							if(item.status === 'NOSHOW'){
								return;
							}
              if(item.contents){
                try{
                  contents = JSON.parse(item.contents).map(function(item){return item.value}).join(', ');
                }catch(error){
                  contents = item.contents
                }
              }
              html += "<div class='row col-12 mx-0' style='padding: 10px 0;font-size:12px' data-id='" + (item.id || "") + "' data-manager='" + (item.manager || "") + "' data-status='" + (item.status || "") + "'" + 
              (item.contents ? (" title='" + contents + "'") : "") + "><div class='col-1 pl-0'><input type='checkbox' class='noShowScheduleCheck' id='noShowSchedule"+item.id+"'></input><label for='noShowSchedule"+item.id+"'></label></div><div class='col-2 montserrat px-0'>" + 
              (item.start ? moment(item.start, "YYYYMMDDHHmm").format("YYYY. MM. DD") : "") + "</div><div class='col-2 pr-0'>" + (item.name || "") + "</div><div class='col-3 pr-0 montserrat'>" + dashContact(item.contact) + "</div><div class='col-4 pr-0'>" + 
              contents + "</div></div>";
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
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
        if(origin.type === 'T'){
          NMNS.socket.emit("get task", {start:moment().format('YYYYMMDD'), end:moment().add(7, 'days').format('YYYYMMDD')});
        }
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
            NMNS.socket.emit('get task', {start:moment().format('YYYYMMDD'), end:moment().add(7, 'days').format('YYYYMMDD')});
          }
        } else if ($("#noShowScheduleList").is(":visible") && $("#noShowScheduleList .row[data-id='" + e.data.id + "']").length) { //예약으로 추가 모달
          showSnackBar('<span>노쇼로 등록하였습니다.</span>');
          $("#noShowScheduleList .row[data-id='" + e.data.id + "']").remove();
          $("#noShowScheduleBtn span").css('opacity', 0.35)
        } else if($("#notificationBody").is(":visible") && $("#notificationBody .addAnnouncementNoShow[data-schedule-id='"+e.data.id+"']").length){//직전취소로 노쇼등록
					showSnackBar('<span>노쇼로 등록하였습니다.</span>');
					$("#notificationBody .addAnnouncementNoShow[data-schedule-id='"+e.data.id+"']").hide();
				}
    }, function(e) {
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
				if(origin){
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
      // e.data = [{date:moment().format('YYYYMMDD'), task:e.data}];//for test
      $('#mainTaskContents').html(generateTaskList(e.data));
      if(e.data.length === 0){
        $("#mainTaskContents").addClass('position-absolute');
      }else{
        $("#mainTaskContents").removeClass('position-absolute');
      }
      $("#mainTaskContents input").off("change").on('change', function(e){
        e.stopPropagation();
        var data = $(this).parent();
        NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
        NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
      })
      $("#mainTaskContents .task").off("touch click").on('touch click', function(e){
        e.stopPropagation();
        initScheduleTab();
        var data = $(this).parent();
        initTaskTab({id:data.data('id'), name:data.data('name'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'});
        $("#deleteTaskBtn").show().next().addClass('ml-1');
        $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').parent().next().find('a').text('일정 상세').tab('show');
        $("#scheduleBtn").text('예약 추가 완료');
        $("#taskBtn").text('저장');
        $("#scheduleModal").removeClass('update').modal('show');
      });
      
    }));
    
    NMNS.socket.on("add manager", socketResponse("담당자 추가하기", function(){
			NMNS.refreshScheduleManager = true;
		}, function(e) {
        NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().filter(function(item) {
            return item.id !== e.data.id;
        }));
        $(".lnbManagerItem[data-value='" + e.data.id + "']").remove();
    }));

    NMNS.socket.on("delete manager", socketResponse("담당자 삭제하기", function(e) {
        NMNS.history.remove(e.data.id, findById);
			NMNS.refreshScheduleManager = true;
    }, function(e) {
        var manager = NMNS.history.find(function(item) { return item.id === e.data.id });
        if (manager) {
            var calendars = NMNS.calendar.getCalendars();
            calendars.push(manager);
            NMNS.calendar.setCalendars(calendars);
            $("#lnbManagerList").html(generateLnbManagerList(calendars)).on("touch click", ".updateManagerLink", updateManager).on("touch click", ".removeManagerLink", removeManager);
            if($("#sidebarContainer").data('scroll')){
              $("#sidebarContainer").data('scroll').update();
            }
            refreshScheduleVisibility();
            NMNS.history.remove(e.data.id, findById);
        }
    }));

    NMNS.socket.on("update manager", socketResponse("담당자 변경하기", function(e) {
        NMNS.history.remove(e.data.id, findById);
			NMNS.refreshScheduleManager = true;
    }, function(e) {
        var manager = NMNS.history.find(function(item) { return item.id === e.data.id });
        if (manager) {
          var exist = $("#lnbManagerList .lnbManagerItem[value='"+e.data.id+"']");
          exist.find('span:not(.menu-collapsed)').data('color', manager.color);
          if(exist.find('input').prop('checked')){
            exist.find('span:not(.menu-collapsed)').css('backgroundColor', manager.color).css('borderColor', manager.color);
          }
          exist.find('.menu-collapsed').text(manager.name)
          exist.hide();
          $("#lnbManagerForm").show();
          NMNS.history.remove(e.data.id, findById);
        }
    }));

    NMNS.socket.on("update info", socketResponse("매장 정보 변경하기", function() {
        showSnackBar("<span>정상적으로 매장 정보를 변경하였습니다.</span>");
			var history = NMNS.history.find(function(item) { return item.id === "info" });
        NMNS.history.remove("info", findById);
			if(history.logo){// successfully removed logo file
				$("#infoLogo").data("done", true);
				NMNS.info.logo = undefined;
				NMNS.info.logoFileName = undefined;
			}
			$("#infoModal").modal('hide');
    }, function(e) {
        var history = NMNS.history.find(function(item) { return item.id === "info" });
        if (history.bizBeginTime || history.bizEndTime) {
            NMNS.calendar.setOptions({ week: { hourStart: history.bizBeginTime ? history.bizBeginTime.substring(0, 2) : NMNS.info.bizBeginTime.substring(0, 2), hourEnd: history.bizEndTime ? history.bizEndTime.substring(0, 2) : NMNS.info.bizEndTime.substring(0, 2) } });
        }
        if (history.shopName) {
            changeMainShopName(history.shopName);
        }
        if(history.logo){
          changeMainShopLogo(true, history.logo);
        }
        NMNS.info.shopName = history.shopName || NMNS.info.shopName;
        NMNS.info.bizType = history.bizType;
        NMNS.history.remove("info", findById);
        NMNS.initedInfoModal = false;
    }));
    
    NMNS.socket.on("upload logo", socketResponse("로고이미지 등록하기", function(e){
      changeMainShopLogo(true, e.data.logo);
			showSnackBar("<span>이미지를 등록하였습니다.</span>");
			NMNS.info.logo = e.data.logo;
			$("#infoLogo").data("done", true);
			$("#infoModal").modal('hide');
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
          // e.data.detail.push({id:1111, date:'20190101', noShowCase:'직전취소'});// for test
          $("#noShowClean").removeClass('d-flex').addClass('d-none');
          if(!$("#noShowDirtyImage").attr('src')){
            $("#noShowDirtyImage").attr('src', '/nmns/img/badperson.png');
          }
          $("#myNoShowCount").text(e.data.detail.length);
          $("#otherNoShowCount").text(Math.max(e.data.summary.noShowCount - e.data.detail.length, 0));
          if(e.data.summary.lastNoShowDate){
            $("#noShowSearchSummary").text("마지막 노쇼는 "+ moment(e.data.summary.lastNoShowDate, 'YYYYMMDD').format('YYYY년 M월 D일입니다.') );
          }
          if (e.data.detail.length > 0) {
            var html = "<div class='row col-12 mx-0'><div class='col col-3'>전화번호</div><div class='col col-3'>노쇼 날짜</div><div class='col col-4'>노쇼 사유</div></div>";
            e.data.detail.forEach(function(item) {
                html += "<div class='row col-12 noShowRow' data-id='" + item.id + "' data-contact='" + (e.data.summary.contact || "") + "' data-date='" + (item.date || "") + "' data-noshowcase='" + (item.noShowCase || "") + "'><div class='col col-3'>" + (e.data.summary.contact ? dashContact(e.data.summary.contact) : "") + "</div><div class='col col-3'>" + (item.date ? (item.date.substring(0, 4) + ". " + item.date.substring(4, 6) + ". " + item.date.substring(6)) : "") + "</div><div class='col col-4 base-font' style='font-size:10px'>" + (item.noShowCase || "")+ "</div><div class='col-2 pr-0 d-flex'><span class='noShowSearchDelete' title='삭제'>&times;</span></div></div>";
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
            $("#noShowImage").attr('src', '/nmns/img/goodperson.png');
          }
          $("#noShowSentense").text(['안심하세요. 노쇼를 하신 적이 없어요!', '이분 최소 배우신분!! 노쇼 이력이 없어요.', '노쇼를 하신 적이 없어요! 격하게 환영해주세요~~'][Math.floor(Math.random()*3)]);
        }
    }));

    NMNS.socket.on("add noshow", socketResponse("노쇼 추가하기", function(e) {
        showSnackBar("<span>추가되었습니다! 다른 분들에게 많은 도움이 될거에요 :)</span>");
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
          if ((e.data.contact === popup.find("#scheduleContact").val().replace(/-/gi, '') && popup.data("contact") !== e.data.contact) || (e.data.name === popup.find("#scheduleName").val() && popup.data("name") !== e.data.name)) {//이름 혹은 연락처의 변경
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
              // if (e.data.isAllDay !== undefined) {
              //     popup.find("#scheduleAllDay").attr("checked", e.data.isAllDay);
              // }
              if (e.data.name && popup.find("#scheduleName").val() === "") {//빈칸일 경우에만 덮어쓰기
                  popup.find("#scheduleName").val(e.data.name);
              }
              if (e.data.contact && popup.find("#scheduleContact").val().replace(/-/gi, '') === "") {//빈칸일 경우에만 덮어쓰기
                  popup.find("#scheduleContact").val(e.data.contact);
              }
          }
          if (e.data.totalNoShow !== undefined && e.data.totalNoShow > 0 && popup.find("#scheduleContact").is(":visible")) {
              popup.find("#scheduleContact").tooltip({
                  title: "이 번호에는 총 " + e.data.totalNoShow + "건의 노쇼가 등록되어 있습니다." + (e.data.myNoShow && e.data.myNoShow > 0 ? "<br/>우리 매장에서는 " + e.data.myNoShow + "건 등록되었습니다." : ""),
                  placement: "top",
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
        if(e.data.body.indexOf("새로운 고객이 추가되었습니다")>=0){
          NMNS.customerList = null;
        }
      }
    }, undefined, true));

    NMNS.socket.on("get alrim history", socketResponse("알림톡 내역 조회", function(e) {
        drawAlrimList(e.data);
    }, undefined, true));

    NMNS.socket.on('resend alrimtalk', socketResponse('알림톡 다시 보내기', function(e){
        $('#resendAlrimScheduleBtn').addClass('d-none');
        showSnackBar("<span>고객에게 알림톡을 다시 보냈습니다!</span>");
    }, function(e){
        $('#resendAlrimScheduleBtn').addClass('d-none');
        showSnackBar("<span>"+e.message || "알림톡을 다시 보내지 못했습니다."+"</span>");
    }, true));
    NMNS.socket.on('get announcement', socketResponse('공지사항 조회', function(e){
      if($('#notificationBody').children().length === 0){
        $('#notificationBody').html('');//대기문구 삭제
      }
      // e.data.schedule.push({type:'SCHEDULE_ADDED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444'})// TODO : remove this line (for test)
      // e.data.schedule.push({type:'SCHEDULE_CANCELED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444', id:'aaa'})
      
      if(e.data.announcement.length > 0){
        $("#announcementArea").parent().removeClass('d-none');
        $("#announcementArea").append(drawNotificationList(e.data.announcement));
      }else if(NMNS.announcementPage === 1){
        $("#announcementArea").parent().addClass('d-none');
      }
      $("#notificationBody").find('.flex-column').remove();
      if(e.data.schedule.length > 0){
        $("#notificationEmpty").hide();
				var list = $(drawNotificationList(e.data.schedule));
				list.find('.addAnnouncementNoShow').on("touch click", function(){
					var origin = NMNS.calendar.getSchedule($(this).data('schedule-id'), $(this).data('manager-id'));
					if(origin){
						NMNS.history.push({id:origin.id, calendarId: origin.calendarId, raw:{status:origin.raw.status}});
						NMNS.calendar.updateSchedule($(this).data('schedule-id'), $(this).data('manager-id'), {raw:{status:'NOSHOW'}});
					}
					NMNS.socket.emit("update reserv", {id:$(this).data('schedule-id'), status:"NOSHOW", noShowCase:"직전취소"});
				});
        $("#notificationBody").append(list).show();
      }else if(NMNS.announcementPage === 1){
        $("#notificationBody").hide();
        $("#notificationEmpty").css('display', 'flex');
      }
      
      var count = NMNS.info.newAnnouncement;
      if(count && count > 0){
        var unread = 0;
        e.data.schedule.forEach(function(item){
          if(!item.isRead) unread++;
        });
        e.data.announcement.forEach(function(item){
          if(!item.isRead) unread++;
        });
        if(count > unread){
          $('.announcementCount').text(count - unread > 99? '99+' : count - unread);
          NMNS.info.newAnnouncement = count - unread;
          $("#announcementIcon").addClass('icon-announcement-count');
        }else{
          $('.announcementCount').text('');
          NMNS.info.newAnnouncement = 0;
          $("#announcementIcon").removeClass('icon-announcement-count');
        }
      }
      if((e.data.schedule.length + e.data.announcement.length) >= 5){
        NMNS.expectMoreAnnouncement = true;
      }else{
        NMNS.expectMoreAnnouncement = false;
      }
    }));
    
    NMNS.socket.on("get menu list", socketResponse('메뉴 목록 조회', function(e){
      if($("#scheduleTabContentList").length){
        $("#scheduleTabContentList").html(generateMenuList(e.data));
      }
			NMNS.menuList = e.data;
			if(NMNS.drawMenuList && $("#mainMenuList").is(":visible")){
				NMNS.drawMenuList(true);
			}
    }, undefined, true));
    
    NMNS.socket.on("get reserv sales", socketResponse('매출 정보 가져오기', function(e){
      $("#salesForm").html(generateSalesContents(e.data));
      // $("#salesForm").html(generateSalesContents([{item:'123', customerId:'asdf', managerId:'sadf', balanceMembership: 30000}, {item:'1234', customerId:'asdf', managerId:'sadf', priceCard:1233123, priceCash: 111111, balanceMembership: 30000}]));//for test
			if(Array.isArray(e.data) && e.data.length > 0){
				$("#salesBtn").show().prev().addClass('mr-1');
			}else{
				$("#salesBtn").hide().prev().removeClass('mr-1');
			}
      $("#salesBtn").removeClass('disabled');
      $("#salesLoading").hide();
      $("#salesForm").show();
    }));
    
    NMNS.socket.on("save sales", socketResponse('매출 내역 저장', function(e){
      showSnackBar('매출 내역을 저장하였습니다.')
      if($("#salesTab").is(":visible")){
        $("#scheduleModal").modal('hide');
      }
    })).on("link sns", socketResponse('SNS 계정 연결', function(e){
      if(e.data.snsType === 'NAVER'){
        NMNS.info.naver = e.data.snsLinkId;
        if($("#naverBtn").is(":visible")){
          $("#naverBtn").addClass('connected');
        }
		alert('연동이 완료되었습니다. 앞으로 네이버 계정으로 로그인하실 수 있습니다.');
      }
      if(e.data.snsType === 'KAKAO'){
        NMNS.info.kakao = e.data.snsLinkId;
        if($("#kakaoBtn").is(":visible")){
          $("#kakaoBtn").addClass('connected');
        }
		alert('연동이 완료되었습니다. 앞으로 카카오 계정으로 로그인하실 수 있습니다.');
      }
    }, function(e){
      if(e.data.snsType === 'KAKAO'){
        alert('카카오톡과의 연동을 하지 못했습니다. 카카오톡에서 연동을 해제한 뒤 다시 시도해주세요.');
      }
    }, true));
    //websocket response end
    //Modal events start  
    $(".modal").on("shown.bs.modal", function(){
      $(".modal-backdrop").one("touch click", function(e){//click on menubar
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
        if (!changed && $("#infoBizType").val() !== (NMNS.info.bizType || "")) {
            changed = true;
        }
        if (!changed && (!$("#infoLogo").data('done') && ((NMNS.info.logo && $("#infoLogo").data('deleted')) || document.getElementById('infoLogo').files[0]))){
          changed = true;
        }
        if (changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")) {
            return false;
        }
			$("#infoLogo").data("done", false).data('deleted', null);
    }).one('show.bs.modal', function(){
      $("#infoBtn").off("touch click").on("touch click", submitInfoModal);
      $("#addLogo").on("touch click", function(e){
        if($(this).text() === '삭제'){
          $(this).text("첨부").prev().val('');
          $("#infoLogo").data('deleted', true);
          document.getElementById('infoLogo').value = '';
          if(!/safari/i.test(navigator.userAgent)){
            document.getElementById('infoLogo').type = '';
            document.getElementById('infoLogo').type = 'file';
          }
        }else{
          e.preventDefault();
          $("#infoLogo").trigger("click");
        }
      }).prev().on("touch click", function(e){
        e.preventDefault();
        $("#infoLogo").trigger("click");
      });
      
      $("#infoLogo").on("change", function(e){
  			var file = this.files[0];
        $(this).data('deleted', file);
  			if(file){
  				var img = document.createElement('img');
  				img.onload = function(){
  					if(img.naturalWidth <= 130 && img.naturalHeight <= 130){
              $("#addLogo").text("삭제").prev().val(file.name);
              $("#infoLogo").data('deleted', false);
  					}else{
  						alert('이미지의 크기가 130 X 130보다 큽니다.\n작은 이미지로 올려주세요.');
  						document.getElementById('infoLogo').value = '';
              if(!/safari/i.test(navigator.userAgent)){
                document.getElementById('infoLogo').type = '';
                document.getElementById('infoLogo').type = 'file';
              }
              $("#addLogo").text("첨부").prev().val('');
  					}
  					img.remove();
  				}
  				img.setAttribute('src', (window.URL || window.webkitURL).createObjectURL(file));
  			}else{
          $("#addLogo").text("첨부");
  			}
      });
    }).on('show.bs.modal', refreshInfoModal);
    
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
            if (!changed && $("#alrimCallbackPhone").val().replace(/-/gi, '') !== (NMNS.info.alrimTalkInfo.callbackPhone || "")) {
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
    }).one('show.bs.modal', function(){
      $("#labelAlrimUseYn").on("touch click", function(){
        $(this).next().children('label').trigger('click');
      })
      $("#alrimNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function() {
          $("#noticeByteCount").text($(this).val().length);
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
    }).on("show.bs.modal", function(){
      $("#alrimTabList a[data-target='#alrimTab']").tab('show');
    }).on("hidden.bs.modal", function(){
      refreshAlrimModal();
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
    }).on("shown.bs.modal", function(){
			$("#noShowAddContact").focus();
		});
    
    $("#scheduleModal").on("hide.bs.modal", function() {
      if(NMNS.scheduleTarget && NMNS.scheduleTarget.guide){
        NMNS.scheduleTarget.guide.clearGuideElement();
      }
      delete NMNS.scheduleTarget;
    }).on('hidden.bs.modal', function(){
      //reset form
      $('#scheduleName').val('');
      $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
        removeContent(this);
      });
      $('#scheduleContact').val('');
    }).on("shown.bs.modal", function(){
			if($("#scheduleTab").is(":visible") && $("#scheduleName").val() === ''){
				$("#scheduleName").focus();
			}
		});
/*
    $("#noMoreTips").on("touch click", function() {
        document.cookie = "showTips=false";
    });
    $("#showTips").on("touch click", function(e) {
        e.preventDefault();
        $("#noMoreTips").remove();
        $("#tipsModal").modal("show");
    });*/
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
      if(!NMNS.announcementPage){
        NMNS.announcementPage = 1;
        NMNS.socket.emit('get announcement', {page:1});
      }
      $(document.body).addClass('modal-open').append($('<div class="modal-backdrop fade show"></div>').on("touch click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $(this).remove();
        $(document.body).removeClass('modal-open');
        $(".popover.show").popover('hide');
      }));
    }).on('shown.bs.popover', function(){
      $('#notificationBody').parents('.popover').find('.close-button').on('touch click', function(){
        $(this).parents('.popover').popover('hide');
				$(document.body).removeClass('modal-open');
				$(".modal-backdrop.show").remove();
      })
      $('#notificationBody, #announcementArea').off('scroll').on('scroll', debounce(function(){
          var distance = Math.max(0, $(this)[0].scrollHeight - $(this).scrollTop() - $(this).innerHeight());
          if(NMNS.expectMoreAnnouncement && distance < Math.max(100, $(this).innerHeight() * 0.2)){
            NMNS.socket.emit('get announcement', {page:++NMNS.announcementPage})
          }
      }, 100));
    })
    $('#mainMenu').on('shown.bs.popover', function(){
      $(".mainMenuRow a[data-link]").off("touch click").on("touch click", function(e){
        $("#mainMenu").popover('hide')
        $($(this).data('link')).modal("show");
      });
      $("#signoutLink").on("touch click", function(){
        NMNS.socket.close();
      });
    });
    $('html').on('click', function(e) {// click outside popover to close
      if ($('body').children('.popover.show').length > 0 && typeof $(e.target).data('original-title') == 'undefined' && !$(e.target).parents().is('.popover.show') && $(e.target).parents('[data-toggle="popover"]').length === 0) {
        $('body').children('.popover.show').popover('hide');
      }
    });
    $("#alrimTabList a[data-target='#alrimTab']").on("show.bs.tab", refreshAlrimModal);
    $("#alrimTabList a[data-target='#alrimHistoryTab']").on("show.bs.tab", function(){
      $("#alrimHistorySearch").trigger('click');
    });
    
    $("#scheduleTabList a[data-target='#scheduleTab']").on('touch click', function(){
      if($(this).next().hasClass('active')){
        initScheduleTab("switch");
      }
    }).on("shown.bs.tab", function(){
			if($("#scheduleName").val() === ''){
				$("#scheduleName").focus();	
			}
		});
    $("#scheduleTabList a[data-target='#taskTab']").on('touch click', function(){
      if(!$(this).hasClass('active')){
        initTaskTab('switch');
      }
    }).on("shown.bs.tab", function(){
			if($("#taskName").val() === ''){
				$("#taskName").focus();	
			}
		});
    $("#scheduleTabList a[data-target='#salesTab']").one('show.bs.tab', function(){
      $("#salesBtn").on('touch click', function(e){
        e.preventDefault();
        if($(this).hasClass('disabled')){
          alert('입력한 금액을 확인해주세요.');
          return;
        }
        var array = [], errorIndex;
        $("#salesTab .scheduleSalesPayments").each(function(index, payment){
          var object = {};
          var pay = $(payment);
					object.email = NMNS.email;
          object.id = pay.data('id');
          object.customerId = pay.data('customer-id');
          object.managerId = pay.data('manager-id');
          object.scheduleId = $("#salesForm").data('schedule-id');
          object.type = pay.data('type');
          object.item = pay.data('item');
          object.price = pay.data('is-registered')?pay.find('.scheduleSalesPayment:checked').data('price') : pay.find('.scheduleSalesPaymentPrice').val();
          if(!pay.data('is-registered') && object.price === ''){
            errorIndex = index;
          }else{
            object.price *= 1;
          }
          if(!Number.isInteger(object.price)){
            errorIndex = index;
          }
          array.push(object);
        });
        if(errorIndex >= 0){
          alert((errorIndex + 1) + '번째 매출('+array[errorIndex].item+')의 매출액을 입력해주세요.');
          return;
        }
        NMNS.socket.emit('save sales', array);
				delete NMNS.salesList;
      });
    }).on('show.bs.tab', function(){
      if(NMNS.scheduleTarget && NMNS.scheduleTarget.schedule){
        $("#salesLoading").show();
        $("#salesForm").hide().data('schedule-id', NMNS.scheduleTarget.schedule.id);
        $("#salesBtn").addClass('disabled');
        NMNS.socket.emit('get reserv sales', {scheduleId: NMNS.scheduleTarget.schedule.id});
        return true;
      }else{
        return false;
      }
    });

    $("#addScheduleBtn").on("touch click", function(){
			if(NMNS.calendar && NMNS.info.bizEndTime){
				initScheduleTab();
				$("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').tab('show');
				$("#scheduleTabList a[data-target='#taskTab']").text('일정 추가');
				$("#taskBtn").text('일정 추가 완료');
				$("#deleteTaskBtn").hide().next().removeClass('ml-1');
				$("#scheduleBtn").text('예약 추가 완료');
				$("#scheduleModal").removeClass('update').modal('show');
			}      
    });
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
        $("#userModal").modal('hide');
      })
      $("#naverBtn").on("touch click", function(e){
        if($(this).hasClass('connected')){
          e.stopImmediatePropagation();
          return false;
        }
        e.preventDefault();
      });
    }).on('show.bs.modal', function(){
      if(NMNS.info.kakaotalk){
        $("#kakaoBtn").addClass('connected').find('span').text('카카오 계정 연동 완료')
      }
      if(NMNS.info.naver){
        $("#naverBtn").addClass('connected').find('span').text('네이버 계정 연동 완료')
      }
      if (!$("#naverBtn").hasClass('connected') && !document.getElementById("naverScript")) {//최초 접속
        var script = document.createElement("script");
        script.src = "/nmns/js/naver.min.js";
        script.id = "naverScript";
        document.body.appendChild(script);

        script.onload = function() {
          var naverLogin = new naver.LoginWithNaverId({
        			clientId: "5dHto9KiEXdHoHJBDcqE",
        			callbackUrl: window.location.origin + '/naver',
        			isPopup: true, 
        			loginButton: {color:'green', type:1, height:20}
      		});
      		naverLogin.init();
        };
      }
      if (!$("#kakaoBtn").hasClass('connected') && !document.getElementById("kakaoScript")) {//최초 접속
        var script2 = document.createElement("script");
        script2.src = "/nmns/js/kakao.min.js";
        script2.id = "kakaoScript";
        document.body.appendChild(script2);

        script2.onload = function() {
          Kakao.init('0bc4ec615d313261ebfd5ac0fe9c055f');
          // 카카오 로그인 버튼을 생성합니다.
          $("#kakaoBtn").on("touch click", function(){
            if($(this).hasClass('connected')){
              return;
            }
            Kakao.Auth.login({
              success: function(authObj) {
                Kakao.API.request({url:'/v2/user/me', success:function(res){
					if(!res.kakao_account.email){
						alert('이메일 주소는 연동 및 로그인에 필수로 필요합니다. 카카오톡>설정>프라이버시>카카오 계정>연결 서비스 관리 메뉴에서 연결을 해제 후 다시 시도해주세요.');
						Kakao.Auth.logout();
					}else{
						NMNS.socket.emit('link sns', {
							snsLinkId:res.id,
							snsEmail:res.kakao_account.email,
							snsType: 'KAKAO'
					  	});	
					}                  
                }, fail: function(error){
                  alert('카카오 서버와 연결하지 못했습니다. 다시 시도해주세요.');
                }})
              },
              fail: function(err) {
                alert('연결이 취소되었습니다.');
                console.log(JSON.stringify(err));
              }
            });
          });
        };
      }
    }).on("hidden.bs.modal", function(){
      $("#currentPassword").val("");
      $("#newPassword").val("");
      $("#renewPassword").val("");
    })
    //Modal events end
    //mobile horizontal scroll handling
    swipedetect(document.getElementById('mainCalendar'), function(swipedir) {
        if (swipedir === "left") {
            $("#renderRange").next().trigger("click");
        } else if (swipedir === "right") {
            $("#renderRange").prev().trigger("click");
        }
    });

    //mobile horizontal scroll handling end
    function initLnbManagerForm(){
      if(NMNS.initedLnbManagerForm){
        return;
      }
      NMNS.initedLnbManagerForm = true;
      $("#lnbManagerColor").on('change', function(e){
        e.stopPropagation();
        var color = $(this).find('input:checked').val();
        $("#lnbManagerFormColor").css('borderColor', color).css('background-color', color).data('value', color);
      });
      $("#lnbManagerFormSubmit").on("touch click", function(e){
        var name = $("#lnbManagerFormName").val();
        if (!name || name.length < 1) {
            showSnackBar("담당자 이름을 입력해주세요.");
            return;
        }
        var color = $("#lnbManagerFormColor").data("value");
        
        var id = $("#lnbManagerForm").data("id");
        if(id){
          var manager = findManager(id);
          if(manager){//update
            var exist = $("#lnbManagerList .lnbManagerItem[data-value='"+manager.id+"']");
            if (color !== manager.color || name !== manager.name) { //수정
              NMNS.calendar.setCalendar(manager.id, { color: color, bgColor: getBackgroundColor(color), borderColor: color, name: name }, true);
              NMNS.calendar.setCalendarColor(manager.id, { color: color, bgColor: getBackgroundColor(color), borderColor: color }, true);
              NMNS.history.push({ id: manager.id, color: manager.color, name: manager.name });
              exist.find('span:not(.menu-collapsed)').data('color', color);
              if(exist.find('input').prop('checked')){
                exist.find('span:not(.menu-collapsed)').css('backgroundColor', color).css('borderColor', color);
              }
              exist.find('span.menu-collapsed').text(name)
              NMNS.socket.emit("update manager", { id: manager.id, color: color, name: name });
            }
            exist.show();
            $("#lnbManagerForm").hide();
            return;
          }
        }
        //create
        id = NMNS.email + generateRandom();
        $("#lnbManagerList").append($(generateLnbManagerList([{color:color, name:name, id:id, checked:true}])).on("touch click", '.updateManagerLink', updateManager).on("touch click", '.removeManagerLink', removeManager));
        if($("#sidebarContainer").data('scroll')){
          $("#sidebarContainer").data('scroll').update();
        }
        var calendars = NMNS.calendar.getCalendars();
        calendars.push({
            id: id,
            name: name,
            checked: true,
            bgColor: getBackgroundColor(color),
            borderColor: color,
            color: color
        });
        NMNS.calendar.setCalendars(calendars);
        NMNS.socket.emit("add manager", { id: id, name: name, color: color });
        $("#lnbManagerForm").hide();
      })
      $("#lnbManagerFormName").on("keyup", function(e){
        if(e.which === 13){
          $("#lnbManagerFormSubmit").trigger('click');
        }else if(e.which === 27){
          $('.addManager').trigger('click');
        }
      });
    }
    $(".addManager").on("touch click", function(e) {
			e.preventDefault();
			if($("#mainAside").hasClass('sidebar-toggled')){
				$("#mainAside").removeClass('sidebar-toggled');
				setTimeout(function(){
					document.getElementById("sidebarContainer").scrollTop = 0;
					$("#mainAside").addClass('show-collapsed');
				}, 300);
			}
      if($("#lnbManagerForm").data('id')){//was updating
        $("#lnbManagerList .lnbManagerItem[data-value='"+$("#lnbManagerForm").data('id')+"']").show();
      }
      if(!$("#lnbManagerForm").is(":visible")){
        var color = $("#lnbManagerColor label:nth-child("+Math.floor(Math.random() * $("#lnbManagerColor label").length)+") input").prop('checked', true).val();
        $("#lnbManagerFormColor").css('border-color', color).css('background-color', color).data('value', color);
        $("#lnbManagerForm").data('id', null).show();
        $("#lnbManagerFormName").val('').focus();
        return;
      }
      $("#lnbManagerForm").data('id', null).hide();
    }).one("touch click", initLnbManagerForm);
    
    $(".mfb-component__button--child").off("touch click").on("touch click", function(e) {
        e.preventDefault();
        document.getElementById("floatingButton").setAttribute("data-mfb-state", "closed");
    });
    
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
          style.id = 'customerStyle';
          document.head.appendChild(style);
        }
        if (!document.getElementById("customerScript")) {
          var script = document.createElement("script");
          script.src = "/nmns/js/customer.min.js";
          script.id = "customerScript";
          document.body.appendChild(script);

          script.onload = function() {
            NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": action });
            $("#customerManagerList").html(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
              $("#customerManager").data("calendar-id", $(this).data("calendar-id")).data("color", $(this).data("color")).html($(this).html());
            });
          };
        } else if(!NMNS.customerList || NMNS.customerList === []){
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
    $(".menuMenuLink").one("touch click", function(){
      if(!document.getElementById('menuStyle')){
        var style = document.createElement('link');
        style.rel="stylesheet";
        style.href="/nmns/css/menu.min.css";
        style.id = 'menuStyle';
        document.head.appendChild(style);
      }
      if (!document.getElementById("menuScript")) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js";
        script.id = "menuScript";
        document.body.appendChild(script);

        script.onload = function() {
          var script2 = document.createElement("script");
          script2.src = "/nmns/js/menu.min.js";
          document.body.appendChild(script2);
          NMNS.socket.emit("get menu list", null);
        };
      }
      $(this).on("touch click", function(){//메뉴 초기화
        $("#mainMenuTools .updatingMenu-collapsed").removeClass('d-inline-flex');
        $(".updatingMenu-collapsed").hide();
        $(".updatingMenu-expanded").show();
        $("#updateMenuLink").text('수정');
        NMNS.socket.emit("get menu list", null);
      });
    });
    $(".salesMenuLink").on("touch click", function(){
      if(!document.getElementById('salesStyle')){
        var style = document.createElement('link');
        style.rel="stylesheet";
        style.href="/nmns/css/sales.min.css";
        style.id = 'salesStyle';
        document.head.appendChild(style);
      }
      if (!document.getElementById("salesScript")) {//최초 접속
        var script = document.createElement("script");
        script.src = "/nmns/js/sales.min.js";
        script.id = "salesScript";
        document.body.appendChild(script);

        script.onload = function() {
          NMNS.socket.emit("get sales list", {
            start:moment(document.getElementById('salesSearchStartDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
            end:moment(document.getElementById('salesSearchEndDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
            name:$("#salesSearchName").val() === ''? undefined:$("#salesSearchName").val(),
            managerId: $("#salesSearchManager").data('calendar-id') || undefined,
            item: $("#salesSearchContents").val() === '' ? undefined : $("#salesSearchContents").val()
          });
        };
        
        $("#salesSearchName").autocomplete({
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
                return (suggestion.value || '(이름없는 고객)') + ' (' + dashContact(suggestion.data) + ')';
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {
                $('#scheduleContact').val(suggestion.data).trigger('blur');
            }
        }, NMNS.socket);
        
        flatpickr("#salesSearchStartDate", {
            dateFormat: "Y. m. d",
            defaultDate: moment().startOf('month').toDate(),
            locale: "ko"
        });
        flatpickr("#salesSearchEndDate", {
            dateFormat: "Y. m. d",
            defaultDate: new Date(),
            locale: "ko"
        });
        var now = moment();
        $("#mainSalesSearch .activable").each(function(index, button){
          button.innerText = now.format('M월');
          now.add(-1, 'month');
        });
        $("#salesSearchManagerList").html(generateTaskManagerList(true)).off("touch click", "button").on("touch click", "button", function() {
          $("#salesSearchManager").data("calendar-id", $(this).data("calendar-id")).data("color", $(this).data("color")).html($(this).html());
        });
      }else if(!NMNS.salesList || NMNS.salesList === []){
				if($("#salesSearchName").autocomplete()){
					$("#salesSearchName").autocomplete().clearCache();
				}
				NMNS.socket.emit("get sales list", {
					start:moment(document.getElementById('salesSearchStartDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
					end:moment(document.getElementById('salesSearchEndDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
					name:$("#salesSearchName").val() === ''? undefined:$("#salesSearchName").val(),
					managerId: $("#salesSearchManager").data('calendar-id') || undefined,
					item: $("#salesSearchContents").val() === '' ? undefined : $("#salesSearchContents").val()
				});
			}else{
				if($("#salesSearchName").autocomplete()){
					$("#salesSearchName").autocomplete().clearCache();
				}
			}
    });
    
    function switchMenu(e, isHistory){
      if(e && e.preventDefault){
        e.preventDefault();
      }
      if(!$(this).hasClass("menuLinkActive")){
        $(".switchingMenu:not(."+$(this).data('link')+")").hide();
        if($("."+$(this).data('link')).show().hasClass('salesMenu')){
            $("#mainRow").addClass('fixedScroll');
        }else{
            $("#mainRow").removeClass('fixedScroll');
        }
        $(".menuLinkActive").removeClass("menuLinkActive");
        $(this).addClass("menuLinkActive");
        // hide mainTask field
        $("#mainCalendarArea").css('minWidth', '');
        $("#mainContents").css("minWidth", '100%');
        $("#mainAside").css('minWidth', '0px');
        $("#mainTask").removeClass("show");
				$(document.body).removeClass('overflow-y-hidden');
        if(!isHistory){
          history.pushState({link:$(this).data('link')}, "", $(this).data('history'));
        }
      }
    }
    
    //menu switch end
    //set event listeners
    (function() {
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
        $('#lnbManagerList').on('change', onChangeManagers);// toggle schedules of manager

        $(".addNoShowLink").one("touch click", initNoShowModal);
        window.addEventListener('resize', debounce(function(){NMNS.calendar.render()}, 200));
        flatpickr.localize("ko");
        
        $(".taskMenu").on("touch click", onClickTask);// toggle task column
        $('#sidebarToggler').on('touch click', function(){// toggle side menu
					if($("#lnbManagerForm").is(":visible")){
						$(".addManager").trigger("click");
					}
          if($('#mainAside').hasClass('sidebar-toggled')){// about to show aside
            if($("#mainTask").hasClass("show")){
              $("#mainAside").css('minWidth', '270px');
            }
						setTimeout(function(){
							$("#mainAside").addClass('show-collapsed');	
						}, 300);
          }else{// about to hide aside
            $("#mainAside").css('minWidth', '0px').removeClass('show-collapsed');
          }
          $('#mainAside').toggleClass('sidebar-toggled');
        });
        $(".announcementMenuLink").popover({
          template:
            '<div id="announcementPopover" class="popover bg-transparent" role="tooltip" style="display:flex;width:831px;padding-right:91px;box-shadow:none"><div class="arrow"></div>\
              <div class="col px-0 d-none"><div id="announcementArea" class="col px-0 mr-2"></div></div>\
              <div class="col px-0">\
                <div id="notificationArea" class="col px-0 ml-2">\
                  <div class="d-flex align-items-center" style="padding:25px 30px;border-bottom:1px solid rgba(57, 53, 53, 0.2)">\
                    <span style="font-size:18px;font-weight:bold">알림</span><span class="close-button ml-auto cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13"><g id="x" transform="translate(0.5 0.5)"><path id="Path" d="M12,0,0,12" fill="none" stroke="#393535" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" fill-rule="evenodd"/><path id="Path-2" data-name="Path" d="M0,0,12,12" fill="none" stroke="#393535" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" fill-rule="evenodd"/></g></svg></span></div>\
                  <div id="notificationBody"><div class="flex-column m-auto text-center py-5"><div class="bouncingLoader"><div></div><div></div><div></div></div><span>새로운 알림을 불러오는 중입니다...</span></div></div>\
                  <div id="notificationEmpty"><div class="text-center">아직 알림 내역이 없어요.<br>예약 등록 내역, 예약 취소 내역이 보여집니다.</div></div>\
                </div>\
              </div>\
            </div>',
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
        $("#searchNoShow").on("keyup", function(e){
          if(e.keyCode === 13 || e.which === 13){
            if($(this).val().replace(/-/gi, '').length === 11 || $(this).val().replace(/-/gi, '').length === 10){
              switchMenu.apply(this, e);
              NMNS.socket.emit("get noshow", {contact:$(this).val().replace(/-/gi, ''), mine:false});
            }else{
              showSnackBar("전화번호를 정확히 입력해주세요.");
            }
          }
        })
        $(".calendarMenuLink").off("touch click").on("touch click", setSchedules);
        $("#searchNoShow").autocomplete({
            serviceUrl: "get customer info",
            paramName: "contact",
            zIndex: 1060,
            maxHeight: 150,
            triggerSelectOnValidInput: false,
						noCache:true,
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
                return dashContact(suggestion.value) + " (" + (suggestion.data || '(이름없는 고객)') + ")";
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
        $(".infoCenterLink").one("touch click", function(){
          if($("#faq").children().length === 0){
            $("#submitFeedback").on("touch click", function() {
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
            var html = "";
            var faqs = [{title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 데스크탑으로 접속하시면 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'모바일에서는 예약 추가가 안되나요?', contents:'모바일 버전에서는 노쇼, 예약, 일정, 고객, 메뉴 추가 기능을 뺀 모든 서비스를 이용할 수 있어요.<br>추가 기능은 PC에서 이용할 수 있답니다!'}, {title:'고객을 추가로 등록하고 싶어요.', contents:'고객 추가는 고객관리 메뉴에서 하실 수 있습니다!'}, {title:'고객을 엑셀로 등록하고 싶어요.', contents:'엑셀등록 기능을 열심히 만들고 있는 중입니다. 조금만 기다려주세요!'}, {title:'노쇼로 등록한 전화번호는 개인정보가 아닌가요?', contents:'노쇼에 등록된 전화번호는 복호화가 불가능한 암호화 형태로 저장되어 관리자도 내용을 확인할 수 없습니다. 안심하세요!'}, {title:'예약과 일정은 무엇이 다른가요?', contents:'예약은 예약하는 고객이 있어서 시간표에 직접 등록되고, 일정은 매장의 운영에 필요한 일정을 등록하는데 사용됩니다.<br>예를들어, 매장 대청소 등을 일정으로 관리하면 편리하게 이용하실 수 있겠죠?'}]
            faqs.forEach(function(item, index) {
                html += '<div class="row faqRow col mx-0" title="'+item.title+'"><a href="#faqDetail' + index + '" class="faqDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="faqDetail' + index + '"></a><div class="ellipsis">' + item.title + '</div></div>' +
                    '<div class="row faqDetailRow collapse mx-0" id="faqDetail' + index + '"><div class="d-inline-flex pb-3"><span>ㄴ</span></div><span class="col px-2 pb-3">' + item.contents + '</span></div></div>';
                if (index > 0 && index % 50 === 0) {
                    $("#faq").append(html);
                    html = "";
                }
            });
            $("#faq").append(html);
          }
        });
        $(".menuLink").on("touch click", switchMenu);
        $("#sidebarContainer").data('scroll', new PerfectScrollbar("#sidebarContainer"));
        Inputmask("999-999[9]-9999",{showMaskOnFocus:false, showMaskOnHover:false, autoUnmask:true, placeholder:""}).mask(".inputmask-mobile");
    })();
  window.onpopstate = function(state){
    var link;
    if(!state.state){
      link = 'calendarMenu';
    }else{
      link = state.state.link;
    }
    var target = $(".menuLink[data-link='"+link+"']");
    if(target.length){
      switchMenu.call(target[0], null, true);
    }else if(state.state.link === 'noShowSearchMenu'){
      switchMenu.call(document.getElementById('searchNoShow'), null, true);
    }
  }
})(jQuery);