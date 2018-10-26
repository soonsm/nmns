/*global jQuery, location, moment, tui, NMNS, io, filterNonNumericCharacter, dashContact, navigator, socketResponse, generateRandom, getColorFromBackgroundColor, getCookie, flatpickr, PerfectScrollbar, toYYYYMMDD, findById, Notification, drawCustomerAlrimList, showSnackBar, showNotification */
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
            if (!confirm("오래된 IE" + parseFloat(RegExp.$1 + RegExp.$2) + " 브라우저를 사용하고 계십니다.\n 계속하시면 페이지가 정확히 표시되지 않을 수 있습니다. 그래도 계속하시겠습니까?\n *No More No Show는 IE10 이상의 브라우저를 지원하고,\nChrome 브라우저에 최적화되어있습니다.")) {
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
        taskView: ["task"],
        defaultView: $(window).width() > 550 ? "week" : "day",
        scheduleView: true,
        useCreationPopup: true,
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

                if (model.isToday) {
                    classNames.push('tui-full-calendar-weekday-grid-date-decorator');
                }

                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === model.date }) : undefined;
                if (holiday) {
                    classNames.push("tui-full-calendar-holiday");
                }
                return '<span class="' + classNames.join(' ') + '">' + date + (holiday ? ("<small class='d-none d-sm-inline'>[" + holiday.title + "]</small>") : "") + '</span>';
            },
            monthGridHeaderExceed: function(hiddenSchedules) {
                return '<span class="tui-full-calendar-weekday-grid-more-schedules" title="숨겨진 항목 더보기">+' + hiddenSchedules + '</span>';
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
            hourStart: NMNS.info ? parseInt(NMNS.info.bizBeginTime.substring(0, 2), 10) : 9,
            hourEnd: NMNS.info ? parseInt(NMNS.info.bizEndTime.substring(0, 2), 10) + (NMNS.info.bizEndTime.substring(2) === "00" ? 0 : 1) : 23
        },
        theme: {
            'week.currentTime.color': '#009688',
            'week.currentTimeLinePast.border': '1px dashed #009688',
            'week.currentTimeLineBullet.backgroundColor': '#009688',
            'week.currentTimeLineToday.border': '1px solid #009688',
            "common.border": ".07rem solid #e5e5e5",
            "common.saturday.color": "#304ffe",
            'common.dayname.color': '#212121',
            "week.timegridOneHour.height": "68px",
            "week.timegridHalfHour.height": "34px",
            "week.vpanelSplitter.height": "5px",
            "week.pastDay.color": "#212121",
            "week.futureDay.color": "#212121",
            "week.pastTime.color": "#212121",
            "week.futureTime.color": "#212121",
            'month.schedule.marginLeft': '0px',
            'month.schedule.marginRight': '1px',
            'month.schedule.height': '20px',
            'common.creationGuide.backgroundColor': 'rgba(68, 138, 255, 0.05)',
            'common.creationGuide.border': '1px solid #448aff',
            'week.creationGuide.color': '#448aff',
            'week.timegrid.paddingRight': '1px',
            'week.dayGridSchedule.marginRight': '1px'
        }
    });

    NMNS.calendar.on({
        beforeCreateSchedule: function(e) {
            saveNewSchedule(e);
        },
        beforeUpdateSchedule: function(e) {
            var history = e.history || $.extend(true, {}, e.schedule);
            NMNS.history.push(history);
            e.schedule.start = e.start || e.schedule.start;
            e.schedule.end = e.end || e.schedule.end;
            e.schedule.raw.status = e.schedule.status || e.schedule.raw.status;

            if (e.history && e.history.selectedCal.id !== e.schedule.calendarId) { //manager changed
                NMNS.calendar.deleteSchedule(e.schedule.id, e.history.selectedCal.id, true);
                e.schedule.category = e.schedule.isAllDay ? 'allday' : 'time';
                e.schedule.dueDateClass = '';
                NMNS.calendar.createSchedules([e.schedule]);
                e.history.newCalendarId = e.schedule.calendarId;
            } else {
                NMNS.calendar.updateSchedule(e.schedule.id, e.history ? e.history.selectedCal.id : e.schedule.calendarId, e.schedule);
            }

            NMNS.socket.emit("update reserv", {
                id: e.schedule.id,
                start: moment(e.schedule.start.toDate ? e.schedule.start.toDate() : e.schedule.start).format("YYYYMMDDHHmm"),
                end: moment(e.schedule.end.toDate ? e.schedule.end.toDate() : e.schedule.end).format("YYYYMMDDHHmm"),
                manager: e.schedule.calendarId,
                name: e.schedule.title,
                contact: e.schedule.contact || e.schedule.raw.contact,
                contents: e.schedule.contents || e.schedule.raw.contents,
                etc: e.schedule.etc || e.schedule.raw.etc,
                status: e.schedule.status || e.schedule.raw.status,
                isAllDay: e.schedule.isAllDay
            });
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

    NMNS.socket.on("get reserv", socketResponse("예약 정보 받아오기", function(e) {
        drawSchedule(e.data);
        NMNS.holiday = e.holiday;
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
    }));

    NMNS.socket.on("get manager", socketResponse("매니저 정보 받아오기", function(e) {
        e.data.forEach(function(item) {
            item.checked = true;
            item.bgColor = item.color;
            item.borderColor = item.color;
            item.color = getColorFromBackgroundColor(item.bgColor);
        });

        $("#lnbManagerList").html(generateLnbManagerList(e.data));
        NMNS.calendar.setCalendars(e.data);
        if (NMNS.needInit) {
            delete NMNS.needInit;
            setSchedules();
        }
    }));

    //business specific functions about calendar start
    function getTimeSchedule(schedule, isAllDay) {
        var type = schedule.category === 'task' ? "일정" : "예약";
        var html = "<div class='tui-full-calendar-schedule-cover'>";
        if (schedule.title) {
            html += "<span title='" + type + "이름:" + schedule.title + "'>";
            if (schedule.category === 'task') {
                html += "<span title='일정이름:" + schedule.title + "'><span class='calendar-font-icon'># </span>";
            } else if (!isAllDay) {
                html += "<strong class='calendar-font-icon'>" + moment(schedule.start.toDate()).format("HH:mm") + "</strong> ";
            } else {
                html += "<span class='calendar-font-icon far fa-clock'></span> ";
            }

            html += schedule.title + "</span><br/>";
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

        html += (schedule.raw.contents ? ((schedule.raw.status === "RESERVED" ? "<span title='" + type + "내용:" + schedule.raw.contents + "'><i class='fas fa-tasks calendar-font-icon'></i> " : " ") + schedule.raw.contents + "</span><br/>") : "") + (schedule.raw.contact ? "<span title='연락처:" + schedule.raw.contact + "'><i class='fas fa-phone fa-rotate-90 calendar-font-icon'></i> " + schedule.raw.contact + "</span>" : "") + "</div>";
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
                $("#mainCalendar").css("height", "62rem");
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
        $("#creationPopupName").focus();
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
            if (manager.is(".addManagerItem")) {
                return;
            }
            var managerId = manager.data("value");
            if (managerId) {
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
    function generateAuthStatusBadge(authStatus) {
        switch (authStatus) {
            case "BEFORE_EMAIL_VERIFICATION":
                return "<span class='badge badge-danger' title='인증메일 보내기' style='cursor:pointer;'>이메일 미인증</span><span class='btn btn-sm btn-flat btn-secondary ml-2'>인증메일 보내기</span>";
            case "EMAIL_VERIFICATED":
                return "<span class='badge badge-success'>인증</span>";
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
            html += "<div class='infoManagerItem'><label><input class='tui-full-calendar-checkbox-round' checked='checked' readonly='readonly' type='checkbox'/><span class='infoManagerColor' style='background-color:" + item.bgColor + "; border-color:" + item.bgColor + ";'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-id='" + item.id + "' data-color='" + item.bgColor + "' placeholder='담당자 이름' value='" + item.name + "' data-name='" + item.name + "'/></label><i class='fas fa-trash deleteManager pl-2' title='삭제'></i></div>";
        });
        return html;
    }

    function generateLnbManagerList(managerList) {
        var html = "";
        managerList.forEach(function(item) {
            html += "<div class='lnbManagerItem' data-value='" + item.id + "'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
            html += "<span style='background-color:" + item.bgColor + "; border-color:" + item.borderColor + "' title='이 담당자의 예약 가리기/보이기'></span><small>" + item.name + "</small></label></div>";
        });
        return html;
    }

    function changeMainShopName(shopName) {
        if ($("#mainShopName").length) {
            if (shopName !== "") {
                $("#mainShopName").text(shopName);
                git
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
            alrims.forEach(function(item, index) {
                html += '<div class="row alrimRow col" title="눌러서 전송된 알림톡 내용 보기"><a href="#alrimDetail' + index + '" class="alrimDetailLink" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="alrimDetail' + index + '"></a><div class="col-4 px-0 ellipsis">' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm') + '</div><div class="col-4 ellipsis">' + item.name + '</div><div class="col-4 px-0 ellipsis">' + dashContact(item.contact) + '</div></div>' +
                    '<div class="row alrimDetailRow collapse" id="alrimDetail' + index + '"><small class="col px-0">' + item.contents + '</small></div>';
                if (index > 0 && index % 50 === 0) {
                    list.append(html);
                    html = "";
                }
            });
            list.append(html);
        } else {
            list.append("<div class='row alrimRow'><span class='col-12 text-center'>검색 조건에 맞는 결과가 없습니다.</span></div>");
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
        if ($("#alrimModalTitle").text() !== "알림톡 정보") {
            $("#alrimSwitchBtn").trigger("click");
        }
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
            $("#alrimNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function() {
                $("#noticeByteCount").text($(this).val().length);
                $(this).height(0).height(this.scrollHeight > 150 ? 150 : (this.scrollHeight < 60 ? 60 : this.scrollHeight));
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
            $("#alrimModalRefresh").off("touch click").on("touch click", refreshAlrimModal);
            $("#alrimModalSave").off("touch click").on("touch click", submitAlrimModal);
            $("#alrimCallbackPhone").off("blur").on("blur", function() {
                filterNonNumericCharacter($(this));
            });

            $("#alrimHistorySearch").off("touch click").on("touch click", function() {
                var parameters = {};
                if ($("#alrimHistoryStartDate").val() !== "") {
                    var start = moment($("#alrimHistoryStartDate").val(), "YYYY-MM-DD");
                    if (!start.isValid()) {
                        alert("검색 시작일자가 올바르지 않습니다. 다시 입력해주세요!");
                        return;
                    }
                    parameters.start = start.format("YYYYMMDD");
                }
                if ($("#alrimHistoryEndDate").val() !== "") {
                    var end = moment($("#alrimHistoryEndDate").val(), "YYYY-MM-DD");
                    if (!end.isValid()) {
                        alert("검색 끝일자가 올바르지 않습니다. 다시 입력해주세요!");
                        return;
                    }
                    parameters.end = end.format("YYYYMMDD");
                }
                if ($("#alrimHistoryName").val() !== "") {
                    parameters.name = $("#alrimHistoryName").val();
                }
                if ($("#alrimHistoryContact").val() !== "") {
                    parameters.contact = $("#alrimHistoryContact").val();
                }
                $("#alrimHistoryList .row").remove(); //깜빡임 효과
                NMNS.socket.emit("get alrim history", parameters);
            });
            $("#alrimHistoryContact").off("keyup").on("keyup", function(e) {
                if (e.which === 13) {
                    filterNonNumericCharacter($(this));
                    $("#alrimHistorySearch").trigger("click");
                }
            }).on("blur", function() {
                filterNonNumericCharacter($(this));
            });
            $("#alrimHistoryName").off("keyup").on("keyup", function(e) {
                if (e.which === 13) {
                    $("#alrimHistorySearch").trigger("click");
                }
            });

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
            }, NMNS.socket);
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
        var beginTime = moment($("#infoBizBeginTime").val(), "HH:mm");
        if (!beginTime.isValid()) {
            alert("매장 운영 시작시간이 올바르지 않습니다.");
            $("#infoBizBeginTime").focus();
            return;
        }
        var endTime = moment($("#infoBizEndTime").val(), "HH:mm");
        if (!endTime.isValid()) {
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
        if ($("#infoPassword").val() !== "") {
            NMNS.socket.emit("update password", { password: $("#infoPassword").val() });
            $("#infoPassword").val("");
            diff = true;
        }
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
                        NMNS.calendar.setCalendar(manager.id, { color: getColorFromBackgroundColor(color), bgColor: color, borderColor: color, name: input.val() }, true);
                        NMNS.calendar.setCalendarColor(manager.id, { color: getColorFromBackgroundColor(color), bgColor: color, borderColor: color }, true);
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

    function showColorPickerPopup(self) {
        $("#infoModalColorPicker").css("left", ($("#infoManagerList").position().left + self.position().left) + "px")
            .css("top", ($("#infoManagerList").position().top + self.position().top + 74) + "px")
            .data("target", self.next().data("id"))
            .show(300);
    }

    function refreshInfoModal() {
        $("#infoEmail").text(NMNS.email);
        $("#infoPassword").val("");
        $("#infoAuthStatus").html(NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" ? $(generateAuthStatusBadge(NMNS.info.authStatus)).on("touch click", function() {
            NMNS.socket.emit("send verification", {});
            showSnackBar("<span>인증메일을 보냈습니다. 도착한 이메일을 확인해주세요!</span>");
        }) : generateAuthStatusBadge(NMNS.info.authStatus));
        $("#infoShopName").val(NMNS.info.shopName);
        $("#infoBizType").val(NMNS.info.bizType);
        var list = $("#infoManagerList");
        if (list.hasClass("ps")) {
            list.children(":not(.ps__rail-x):not(.ps__rail-y)").remove();
            $(generateManagerList(NMNS.calendar.getCalendars())).prependTo(list);
        } else {
            list.html(generateManagerList(NMNS.calendar.getCalendars()));
            list.data("scroll", new PerfectScrollbar(list[0]));
        }

        $(".infoManagerItem .deleteManager").off("touch click").on("touch click", function() {
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
        });
    }

    NMNS.initInfoModal = function() {
        if (!NMNS.initedInfoModal) { //first init
            NMNS.initedInfoModal = true;

            var html = "";
            NMNS.colorTemplate.forEach(function(item, index) {
                if (index < 21) {
                    html += '<i class="fas fa-circle infoModalColor" data-color="' + item + '" style="color:' + item + '" aria-label="' + item + '"></i>';
                } else {
                    return;
                }
            });
            $("#infoModalColors").html(html);
            flatpickr("#infoBizBeginTime", {
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
            }).setDate(moment((NMNS.info.bizEndTime ? NMNS.info.bizEndTime : "2300"), "HHmm").toDate());
            if (!$("#infoManagerList").hasClass("ps")) {
                $("#infoManagerList").data("scroll", new PerfectScrollbar("#infoManagerList"));
            }

            $("#infoModalSave").off("touch click").on("touch click", submitInfoModal);
            $("#infoModalRefresh").off("touch click").on("touch click", refreshInfoModal);
            $("#infoModalColorPickerClose").off("touch click").on("touch click", function() {
                $("#infoModalColorPicker").hide(300);
            });
            $(".infoModalColor").off("touch click").on("touch click", function() {
                var target = $(".infoManagerItem input[data-id='" + $("#infoModalColorPicker").data("target") + "']");
                var color = $(this).attr("data-color");
                if (target.length) {
                    target.data("color", color);
                    target.prev().css("background-color", color).css("border-color", color).data("color", color);
                }
            });
        }
        refreshInfoModal(); //setting data
    }

    function submitNoShowEtcReason(dropdownItem) {
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
    }

    function initNoShowModal() {
        if (!NMNS.initedNoShowModal) {
            NMNS.initedNoShowModal = true;
            var datetimepickerOption = {
                format: "Y-m-d",
                defaultDate: new Date(),
                appendTo: document.getElementById("noShowModal"),
                locale: "ko",
                closeOnSelect: true
            };

            if (!$("#noShowSearchList").hasClass("ps")) {
                $("#noShowSearchList").data("scroll", new PerfectScrollbar("#noShowSearchList", { suppressScrollX: true }));
            }
            if (!$("#noShowScheduleList").hasClass("ps")) {
                $("#noShowScheduleList").data("scroll", new PerfectScrollbar("#noShowScheduleList", { suppressScrollX: true }));
            }

            $(".noShowAddCase").off("touch click").on("touch click", function() {
                $(".noShowAddCase").not($(this)).removeClass("badge-danger").addClass("badge-light");
                if ($(this).removeClass("badge-light").addClass("badge-danger").is("#noShowAddCaseEtc")) {
                    $(this).next().removeAttr("disabled").focus();
                } else {
                    $(this).siblings("input").attr("disabled", "disabled");
                }
            });
            $("#noShowAddBtn").off("touch click").on("touch click", function() {
                if ($("#noShowAddContact").val() === "") {
                    alert("저장할 전화번호를 입력해주세요!");
                    return;
                }
                var noShowCase = $("#noShowAddContent .badge-danger").is("#noShowAddCaseEtc") ? $("#noShowAddContent input").val() : $("#noShowAddContent .badge-danger").data("value");
                NMNS.socket.emit("add noshow", { id: NMNS.email + generateRandom(), contact: $("#noShowAddContact").val(), noShowCase: noShowCase });
            });
            $("#noShowSearchBtn").off("touch click").on("touch click", function() {
                if ($("#noShowSearchContact").val() === "") {
                    alert("검색할 전화번호를 입력해주세요!");
                    return;
                }
                NMNS.socket.emit("get noshow", { contact: $("#noShowSearchContact").val(), mine: false });
            });
            $("#noShowScheduleSearch").off("touch click").on("touch click", function() {
                var parameters = {};
                if ($("#noShowScheduleStartDate").val() !== "") {
                    var start = moment($("#noShowScheduleStartDate").val(), "YYYY-MM-DD");
                    if (!start.isValid()) {
                        alert("검색 시작일자가 올바르지 않습니다. 다시 입력해주세요!");
                        return;
                    }
                    parameters.start = start.format("YYYYMMDD");
                }
                if ($("#noShowScheduleEndDate").val() !== "") {
                    var end = moment($("#noShowScheduleEndDate").val(), "YYYY-MM-DD");
                    if (!end.isValid()) {
                        alert("검색 끝일자가 올바르지 않습니다. 다시 입력해주세요!");
                        return;
                    }
                    parameters.end = end.format("YYYYMMDD");
                }
                if ($("#noShowScheduleName").val() !== "") {
                    parameters.name = $("#noShowScheduleName").val();
                }
                if ($("#noShowScheduleContact").val() !== "") {
                    parameters.contact = $("#noShowScheduleContact").val();
                }
                $("#noShowScheduleList .row").remove(); //깜빡임 효과
                NMNS.socket.emit("get summary", parameters);
            });
            $("#noShowSearchAdd").off("touch click").on("touch click", function() {
                var id = generateRandom();
                var newRow = $("<div class='row px-0 col-12 mt-1 noShowSearchAdd' data-id='" + id + "'><div class='col-4 pr-0'><input type='text' class='form-control form-control-sm rounded-0' name='noShowSearchAddContact' placeholder='고객 전화번호'></div><div id='noShowSearchAddDatePicker" + id + "' class='col-4 input-group input-group-sm pr-0'><div class='input-group-prepend'><i id='noShowSearchAddDateIcon" + id + "' class='input-group-text far fa-calendar rounded-0'></i></div><input id='noShowSearchAddDate" + id + "' type='text' class='form-control form-control-sm rounded-0' name='noShowSearchAddDate' aria-describedby='noShowSearchAddDateIcon" + id + "'></div><div class='col-3'><select class='form-control form-control-sm rounded-0' name='noShowType'><option value='지각'>지각</option><option value='잠수' selected='selected'>잠수</option><option value='직전취소'>직전취소</option><option value='기타'>기타</option></select></div><div class='col-1 px-0'><i class='fas fa-check noShowSearchAddSubmit align-middle' title='저장'></i>  <i class='fas fa-trash noShowSearchAddCancel align-middle ml-lg-2 ml-md-1' title='취소'></i></div></div>");
                if ($("#noShowSearchList .empty").length) {
                    $("#noShowSearchList").html(newRow);
                } else {
                    $("#noShowSearchList").append(newRow);
                }
                newRow.find(".noShowSearchAddSubmit").off("touch click").on("touch click", function() {
                    submitAddNoShow($(this));
                });
                newRow.find(".noShowSearchAddCancel").off("touch click").on("touch click", function() {
                    cancelAddNoShow($(this));
                });
                newRow.find("input[name='noShowSearchAddContact']").off("blur").on("blur", function() {
                    filterNonNumericCharacter($(this));
                }).val($("#noShowSearchContact").val()).select().focus();
                newRow.data("datetimepicker", flatpickr("#noShowSearchAddDate" + id, datetimepickerOption));
            });
            $("#noShowSearchContact, #noShowAddContact, #noShowScheduleContact").off("blur").on("blur", function() {
                filterNonNumericCharacter($(this));
            });
            $("#noShowSearchContact").on("keyup", function(e) {
                if (e.which === 13) {
                    filterNonNumericCharacter($(this));
                    $("#noShowSearchBtn").trigger("click");
                }
            });
            $("#noShowAddContact").on("keyup", function(e) {
                if (e.which === 13) {
                    filterNonNumericCharacter($(this));
                    $("#noShowAddBtn").trigger("click");
                }
            });
            $("#noShowScheduleContact").off("keyup").on("keyup", function(e) {
                if (e.which === 13) {
                    filterNonNumericCharacter($(this));
                    $("#noShowScheduleSearch").trigger("click");
                }
            });
            flatpickr("#noShowScheduleStartDate", datetimepickerOption).setDate(moment().subtract(1, "M").toDate());
            flatpickr("#noShowScheduleEndDate", datetimepickerOption).setDate(moment().add(1, "M").toDate());
            $("#noShowScheduleDropdown .dropdown-item:not(:last-child)").off("touch click").on("touch click", function(e) {
                var dropdown = $(this).parent();
                e.preventDefault();
                NMNS.history.push({ id: dropdown.data("id"), calendarId: dropdown.data("manager"), raw: { status: dropdown.data("status") } });
                NMNS.calendar.updateSchedule(dropdown.data("id"), dropdown.data("manager"), { raw: { status: $(this).data("status") } });
                NMNS.socket.emit("update reserv", { id: dropdown.data("id"), status: $(this).data("status"), noShowCase: $(this).data("type") });
                var row = $("#noShowScheduleList .row[data-id='" + dropdown.data("id") + "']");
                row.children("span:last-child").html($(generateScheduleStatusBadge($(this).data("status"))));
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
            });
            $("#noShowScheduleDropdown .noShowScheduleCheck").off("touch click").on("touch click", function() {
                submitNoShowEtcReason($(this).parent());
            });
            $("#noShowScheduleDropdown .dropdown-item-etc").off("touch click").on("touch click", function(e) {
                e.preventDefault();
            });
            $("#noShowScheduleDropdown .dropdown-item-etc input").off("keyup").on("keyup", function(e) {
                switch (e.which) {
                    case 13:
                        submitNoShowEtcReason($(this).parent());
                        break;
                    case 27:
                        $(this).parent().parent().hide(300);
                        break;
                }
            }).off("touch click").on("touch click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).focus();
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

            $("#noShowSearchContact").autocomplete({
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

            $("#noShowScheduleName").autocomplete({
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
                    $("#noShowScheduleContact").val(suggestion.data);
                }
            }, NMNS.socket);
            $("#noShowScheduleContact").autocomplete({
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
                    $("#noShowScheduleName").val(suggestion.data);
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
            html += "<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='" + item.id + "' data-bgcolor='" + item.bgColor + "'>" +
                "<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + item.bgColor + "'></span>" +
                "<span class='tui-full-calendar-content'>" + item.name + "</span>" +
                "</button>";
        });

        return html;
    }

    function initTaskModal(task) {
        if (!NMNS.initedTaskModal) {
            NMNS.initedTaskModal = true;
            var datetimepickerOption = {
                format: "Y-m-d H:i",
                enableTime: true,
                defaultDate: new Date(),
                appendTo: document.getElementById("taskModal"),
                locale: "ko",
                minuteIncrement: 10,
                time_24hr: true,
                minTime: moment((NMNS.info.bizBeginTime || '0900'), 'HHmm').format('HH:mm'),
                maxTime: moment((NMNS.info.bizEndTime || '2300'), 'HHmm').format('HH:mm'),
                applyBtn: true
            };
            flatpickr("#taskStartDate", datetimepickerOption);
            flatpickr("#taskEndDate", datetimepickerOption);
            $("#taskModalSave").on("touch click", function() {
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
                if ($("#taskModal").data("edit")) {
                    var origin = $("#taskModal").data("task");
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
                            isAllDay: false,
                            category: "task",
                            dueDateClass: "",
                            color: getColorFromBackgroundColor($("#taskManager").data("bgcolor")),
                            bgColor: $("#taskManager").data("bgcolor"),
                            borderColor: $("#taskManager").data("bgcolor"),
                            raw: {
                                contents: $("#taskContents").val(),
                                status: "RESERVED"
                            }
                        }]);
                    } else { //담당자 유지
                        NMNS.calendar.updateSchedule(origin.id, origin.calendarId, {
                            title: $("#taskName").val(),
                            start: start,
                            end: end,
                            isAllDay: false,
                            raw: {
                                contents: $("#taskContents").val()
                            }
                        });
                    }
                    NMNS.socket.emit("update reserv", { //서버로 요청
                        id: origin.id,
                        manager: $("#taskManager").data("calendar-id"),
                        name: $("#taskName").val(),
                        start: moment(start).format("YYYYMMDDHHmm"),
                        end: moment(end).format("YYYYMMDDHHmm"),
                        isAllDay: false,
                        contents: $("#taskContents").val()
                    });
                } else { //신규 일정 추가
                    id = NMNS.email + generateRandom();
                    NMNS.calendar.createSchedules([{
                        id: id,
                        calendarId: $("#taskManager").data("calendar-id"),
                        title: $("#taskName").val(),
                        start: start,
                        end: end,
                        isAllDay: false,
                        category: "task",
                        dueDateClass: "",
                        color: getColorFromBackgroundColor($("#taskManager").data("bgcolor")),
                        bgColor: $("#taskManager").data("bgcolor"),
                        borderColor: $("#taskManager").data("bgcolor"),
                        raw: {
                            contents: $("#taskContents").val(),
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
                        isAllDay: false,
                        type: "T",
                        contents: $("#taskContents").val(),
                        status: "RESERVED"
                    });
                }
                $("#taskModal").modal("hide");
            });
            $("#taskModal .information").tooltip({
                title: "일정에는 매장 운영에 필요한 사항 등을 자유롭게 등록할 수 있습니다.<br/>예)임대료 납기일 표기 등",
                placement: "top",
                trigger: "focus hover",
                delay: { "hide": 1000 },
                html: true
            });
        }
        var selected;
        if (task.start && task.end) {
            $("#taskModal").data("edit", task.id ? true : false).data("task", task);
            document.getElementById("taskStartDate")._flatpickr.setDate(task.start.toDate());
            document.getElementById("taskEndDate")._flatpickr.setDate(task.end.toDate());
            $("#taskName").val(task.title || "");
            $("#taskContents").val(task.raw ? task.raw.contents || "" : "");
            selected = task.calendarId ? NMNS.calendar.getCalendars().find(function(item) {
                return item.id === task.calendarId;
            }) : NMNS.calendar.getCalendars()[0];
            if (!selected) {
                selected = { id: task.calendarId, bgColor: task.bgColor, name: "삭제된 담당자" };
            }
        } else {
            $("#taskModal").data("edit", false).removeData("task");
            var now = moment(new Date());
            if (now.hour() > Number(NMNS.info.bizEndTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizEndTime.substring(0, 2)) && now.minute() + 30 > Number(NMNS.info.bizEndTime.substring(2)))) {
                now = moment(NMNS.info.bizEndTime, "HHmm").subtract(30, "m");
            } else if (now.hour() < Number(NMNS.info.bizBeginTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizBeginTime.substring(0, 2)) && now.minute() < Number(NMNS.info.bizBeginTime.substring(2)))) {
                now = moment(NMNS.info.bizBeginTime, "HHmm");
            } else {
                now.minute(Math.ceil(now.minute() / 10) * 10);
            }
            document.getElementById("taskStartDate")._flatpickr.setDate(now.toDate());
            document.getElementById("taskEndDate")._flatpickr.setDate(now.add(30, "m").toDate());
            $("#taskName").val("");
            $("#taskContents").val("");
            selected = NMNS.calendar.getCalendars()[0];
        }
        $("#taskManager").next().html(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#taskManager").data("calendar-id", $(this).data("calendar-id")).data("bgcolor", $(this).data("bgcolor")).html($(this).html());
        });
        $("#taskManager").html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + selected.bgColor + "'></span><span class='tui-full-calendar-content'>" + selected.name + "</span>").data("calendar-id", selected.id).data("bgcolor", selected.bgColor);
    }

    NMNS.initTaskModal = initTaskModal;

    function setEventListener() {
        $('.moveDate').on('touch click', onClickNavi);
        $('.calendarType').on('touch click', onClickMenu);
        $("#calendarTypeMenu").next().children("a").on("touch click", function(e) {
            e.preventDefault();
            var target = $(e.target);
            if (!target.hasClass("dropdown-item")) {
                target = target.parents(".dropdown-item");
            }
            $("#calendarTypeMenu").html(target.html());
            $("#calendarTypeMenu").attr("data-action", target.data("action"));
            $("#calendarTypeMenu").trigger("click");
        });
        $('#managerElements').on('change', onChangeManagers);

        $('#dropdownMenu-calendars-list').on('touch click', onChangeNewScheduleCalendar);
        $(".addReservLink").on("touch click", createNewSchedule);
        $(".addTaskLink").on("touch click", initTaskModal);

        $("#infoLink").on("touch click", NMNS.initInfoModal);
        $("#alrimLink").on("touch click", NMNS.initAlrimModal);
        $(".addNoShowLink, .getNoShowLink").on("touch click", initNoShowModal);
        var resizeThrottled = tui.util.throttle(function() {
            NMNS.calendar.render();
        }, 50);
        window.addEventListener('resize', resizeThrottled);
        flatpickr.localize("ko");
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
                isAllDay: schedule.isAllDay,
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
                bgColor: manager.bgColor || "#b2dfdb",
                borderColor: manager.borderColor || "#b2dfdb",
                color: manager.color || getColorFromBackgroundColor("#b2dfdb"),
                dragBgColor: manager.bgColor || "#b2dfdb",
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
        NMNS.history.push({ id: row.data("id"), contact: row.data("contact"), date: row.data("date"), noShowCase: row.data("noshowcase") });
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
        lnbManagerItem.html("<label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'><span style='background-color:" + name.data("color") + "; border-color:" + name.data("color") + "'></span><small>" + name.val() + "</small></label>");
        var calendars = NMNS.calendar.getCalendars();
        calendars.push({
            id: id,
            name: name.val(),
            checked: true,
            bgColor: color,
            borderColor: color,
            color: getColorFromBackgroundColor(color)
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

    $("#submitFeedback").off("touch click").on("touch click", function(e) {
        var text = $("#feedbackBody").val();
        if (text && text.trim().length > 0) {
            NMNS.socket.emit("submit feedback", { data: text.trim() });
            $("#feedbackModal").modal("hide");
            showSnackBar("제안/문의해주신 내용이 잘 전달되었습니다.<br/> 소중한 의견에 감사드립니다.");
            $("#feedbackBody").val("");
        } else {
            alert("제안/문의하실 내용을 입력해주세요!");
            return;
        }
    });
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
                html += "<div class='row col-12 px-0 mt-1' data-id='" + (item.id || "") + "' data-manager='" + (item.manager || "") + "' data-status='" + (item.status || "") + "'" + (item.contents ? (" title='" + item.contents + "'") : "") + "><span class='col-3 col-lg-2 pr-0'>" + (item.start ? moment(item.start, "YYYYMMDDHHmm").format("YYYY-MM-DD") : "") + "</span><span class='col-4 col-lg-3'>" + (item.name || "") + "</span><span class='col-3 col-lg-2 px-0'>" + dashContact(item.contact) + "</span><span class='col-3 d-none d-lg-inline-flex'>" + (item.contents || "") + "</span><span class='col-2 px-0'>" + generateScheduleStatusBadge(item.status) + "</span></div>";
            });
        }
        $("#noShowScheduleList").html(html);
        $("#noShowScheduleList .badge, #noShowScheduleList .noShowScheduleNoShow").each(function() {
            $(this).off("touch click").on("touch click", function(e) {
                e.stopPropagation();
                noShowScheduleBadge($(this));
            });
        });
        $("#noShowScheduleList .noShowScheduleNormal").off("touch click").on("touch click", function(e) {
            e.stopPropagation();
            noShowScheduleNormal($(this));
        });
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
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
    }, function(e) {
        var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
        NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
        if ((origin.status || origin.raw.status) === "DELETED") {
            drawSchedule([origin]);
            refreshScheduleVisibility();
        } else {
            if (origin.newCalendarId && !NMNS.calendar.getSchedule(e.data.id, origin.selectedCal ? origin.selectedCal.id : origin.calendarId)) { //calendar id changed
                NMNS.calendar.deleteSchedule(e.data.id, origin.newCalendarId, true);
                origin.category = origin.category === 'task' ? 'task' : (origin.isAllDay ? 'allday' : 'time');
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
        if ($("#noShowScheduleList").is(":visible") && $("#noShowScheduleList .row[data-id='" + e.data.id + "']").length) { //예약으로 추가 모달
            var row = $("#noShowScheduleList .row[data-id='" + e.data.id + "']");
            row.children("span:last-child").html($(generateScheduleStatusBadge(origin.status || origin.raw.status)));
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
        }
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
        var html = "";
        if (e.data.summary.noShowCount > 0) {
            $("#noShowSearchSummary").html(dashContact(e.data.summary.contact) + " 고객은 " + (e.data.detail.length > 0 ? (e.data.detail.length == e.data.summary.noShowCount ? "우리매장에서만 " : "다른 매장 포함 ") : "다른 매장에서만 ") + (e.data.summary.noShowCount > 1 ? "총 " : "") + e.data.summary.noShowCount + "번 노쇼하셨어요. <br class='d-inline-block d-lg-none'/> 가장 마지막은 " + ((moment().year() + "") === e.data.summary.lastNoShowDate.substring(0, 4) ? "올해 " : (((moment().year() - 1) + "") === e.data.summary.lastNoShowDate.substring(0, 4) ? "작년 " : e.data.summary.lastNoShowDate.substring(0, 4) + "년 ")) + parseInt(e.data.summary.lastNoShowDate.substring(4, 6), 10) + "월 " + parseInt(e.data.summary.lastNoShowDate.substring(6), 10) + "일이었어요.").show();
            if (e.data.detail.length > 0) {
                e.data.detail.forEach(function(item) {
                    html += "<div class='row col-12 px-0 mt-1' data-id='" + item.id + "' data-contact='" + (e.data.summary.contact || "") + "' data-date='" + (item.date || "") + "' data-noshowcase='" + (item.noShowCase || "") + "'><span class='col-4 pr-0'>" + (e.data.summary.contact ? dashContact(e.data.summary.contact) : "") + "</span><span class='col-4'>" + (item.date ? (item.date.substring(0, 4) + "-" + item.date.substring(4, 6) + "-" + item.date.substring(6)) : "") + "</span><span class='col-3'>" + (item.noShowCase ? ("<span class='badge badge-danger'>" + item.noShowCase + "</span>") : "") + "</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>";
                });
            } else {
                html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>우리 매장에서 추가한 노쇼는 아직 없네요!<br/>이분이 노쇼를 하셨다면 아래 추가 버튼을 눌러 다른 매장에도 공유해주세요.</span></div>";
            }
        } else {
            $("#noShowSearchSummary").html("전화번호 " + dashContact(e.data.summary.contact) + " 고객에 대해 등록된 노쇼 전적이 없습니다.").show();
            html = "<div class='row col-12 px-0 mt-1 empty'><span class='col-12 text-center'>이분은 노쇼를 한 적이 없으시네요! 안심하세요 :)</span></div>";
        }
        var list = $("#noShowSearchList");
        list.addClass("summary").html(html);
        list.find(".noShowSearchDelete").off("touch click").on("touch click", function() {
            deleteNoShow($(this));
        });
        if (list.hasClass("ps")) {
            list.data("scroll").update();
        }
    }));

    NMNS.socket.on("add noshow", socketResponse("노쇼 추가하기", function(e) {
        var html, badge = "";
        if ($("#noShowSearch").is(":visible")) {
            badge = (e.data.noShowCase ? ("<span class='badge badge-light'>" + e.data.noShowCase + "</span>") : "");
            html = $("<div class='row col-12 px-0 mt-1' data-id='" + e.data.id + "' data-contact='" + e.data.contact + "' data-date='" + e.data.date + "' data-noshowcase='" + e.data.noShowCase + "'><span class='col-4'>" + (e.data.contact || $("#noShowSearchList div.noShowSearchAdd[data-id='" + e.data.id + "'] input[name='noShowSearchAddContact']").val()) + "</span><span class='col-4'>" + (e.data.date ? e.data.date.substring(0, 4) + "-" + e.data.date.substring(4, 6) + "-" + e.data.date.substring(6) : "") + "</span><span class='col-3'>" + badge + "</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>");
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
                var newRow = $("<div class='row col-12 px-0 mt-1' data-id='" + origin.id + "' data-contact='" + (origin.contact || "") + "' data-date='" + (origin.date || "") + "' data-noshowcase='" (origin.noShowCase || "") + "'><span class='col-4'>" + (origin.contact ? dashContact(origin.contact) : "") + "</span><span class='col-4'>" + (origin.date ? (origin.date.substring(0, 4) + "-" + origin.date.substring(4, 6) + "-" + origin.date.substring(6)) : "") + "</span><span class='col-3'>" + (origin.noShowCase ? ("<span class='badge badge-light'>" + origin.noShowCase + "</span>") : "") + "</span><span class='col-1 px-0'><i class='fas fa-trash noShowSearchDelete' title='삭제'></i></span></div>");
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
        var popup = $("#creationPopup");
        if ((e.data.contact === popup.find("#creationPopupContact").val() && popup.data("contact") !== e.data.contact) || (e.data.name === popup.find("#creationPopupName").val() && popup.data("name") !== e.data.name)) {//이름 혹은 연락처의 변경
            if (e.data.etc) {
                popup.find("#creationPopupEtc").val(e.data.etc);
            }
            if (e.data.manager) {//변경된 경우에만 덮어쓰기
                var manager = findManager(e.data.manager);
                if (manager) {
                    popup.find("#creationPopupManager").html(popup.find("#creationPopupManager").next().find("button[data-calendar-id='" + manager.id + "']").html()).data("calendarid", manager.id);
                }
            }
            if (e.data.contents) {
                popup.find("#creationPopupContents").val(e.data.contents);
            }
            if (e.data.isAllDay !== undefined) {
                popup.find("#creationPopupAllDay").attr("checked", e.data.isAllDay);
            }
            if (e.data.name && popup.find("#creationPopupName").val() === "") {//빈칸일 경우에만 덮어쓰기
                popup.find("#creationPopupName").val(e.data.name);
            }
            if (e.data.contact && popup.find("#creationPopupContact").val() === "") {//빈칸일 경우에만 덮어쓰기
                popup.find("#creationPopupContact").val(e.data.contact);
            }
            popup.find('#creationPopupEtc').prop('readonly', true);
            popup.find('.creationPopupEtcNotice').show();
        }
        if (e.data.totalNoShow !== undefined && e.data.totalNoShow > 0 && popup.find("#creationPopupContact").is(":visible")) {
            popup.find("#creationPopupContact").tooltip({
                title: "이 번호에는 총 " + e.data.totalNoShow + "건의 노쇼가 등록되어 있습니다." + (e.data.myNoShow && e.data.myNoShow > 0 ? "<br/>우리 매장에서는 " + e.data.myNoShow + "건 등록되었습니다." : ""),
                placement: ($(window).width() > 576 ? "right" : "top"),
                trigger: "click hover focus",
                delay: { "hide": 1000 },
                html: true
            }).tooltip("show");
            setTimeout(function() {
                popup.find("#creationPopupContact").tooltip("hide");
            }, 3000);
            popup.find("#creationPopupContact").one("keyup change", function() {
                $(this).tooltip('dispose');
            });
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
    //websocket response end
    //Modal events start  
    $("#infoModal").on("hide.bs.modal", function() {
        if (document.activeElement.tagName === "INPUT") {
            return false;
        }
        var changed = false;

        if (moment($("#infoBizBeginTime").val(), "HH:mm").format("HHmm") !== (NMNS.info.bizBeginTime)) {
            changed = true;
        }
        if (!changed && moment($("#infoBizEndTime").val(), "HH:mm").format("HHmm") !== (NMNS.info.bizEndTime)) {
            changed = true;
        }
        if (!changed && $("#infoShopName").val() !== (NMNS.info.shopName || "")) {
            changed = true;
        }
        if (!changed && $("#infoPassword").val() !== "") {
            changed = true;
        }
        if (!changed && $("#infoBizType").val() !== (NMNS.info.bizType || "")) {
            changed = true;
        }
        if (!changed) {
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
        }
        if (changed && !confirm("저장되지 않은 변경내역이 있습니다. 창을 닫으시겠어요?")) {
            return false;
        }
    }).on("touch click", function(e) {
        if ($("#infoModalColorPicker").is(":visible")) {
            var target = $(e.target);
            if (!target.parents("#infoModalColorPicker").length && !target.hasClass("infoManagerColor") && !target.hasClass("tui-full-calendar-checkbox-round") && !target.parents(".infoManagerColor").length && !target.parents(".tui-full-calendar-checkbox-round").length && !target.hasClass("addManagerColor") && !target.parents(".addManagerColor").length && !target.parents(".addManagerColor").length) {
                $("#infoModalColorPicker").hide(300);
            }
        }
    }).on("shown.bs.modal", function() {
        $("#infoManagerList").data("scroll").update();
        $("#infoManagerList")[0].scrollTop = 0;
        if ($("body .popover").length) {
            $("body .popover").popover("update");
        }
    });
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
    });
    $("#noShowModal").on("touch click", function(e) {
        if ($("#noShowScheduleDropdown").is(":visible")) {
            var target = $(e.target);
            if (!target.parents("#noShowScheduleDropdown").length && !target.hasClass("badge") && !target.parents(".noShowScheduleNoShow").length) {
                $("#noShowScheduleDropdown").hide(300);
            }
        }
    }).on("hide.bs.modal", function() {
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
    $("#taskModal").on("hide.bs.modal", function(e) {
        var task = $(this).data("task");
        if (task && task.guide) {
            task.guide.clearGuideElement();
            task.guide = null;
        }
    });
    $("#mainRow").on("touch click", function() {
        if ($("#navbarResponsive").hasClass("show")) {
            $("#navbarResponsive").collapse("hide");
        }
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
    $("#alrimSwitchBtn").on("touch click", function(e) {
        e.preventDefault();
        if ($("#alrimForm").is(":visible")) {
            $("#alrimModalTitle").text("알림톡 사용내역");
            $(this).text("알림톡 정보");
        } else {
            $("#alrimModalTitle").text("알림톡 정보");
            $(this).text("알림톡 사용내역");
        }
        $("#alrimModal .alrimData").toggle();
        $(this).blur();
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
        var row = $("<div class='" + clazz + " addManagerItem'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'/><span class='addManagerColor' style='background-color:" + color + "; border-color:" + color + ";' data-color='" + color + "'></span><input type='text' name='name' class='align-middle form-control form-control-sm rounded-0' data-color='" + color + "' data-id='" + NMNS.email + generateRandom() + "' placeholder='담당자 이름'/></label>" + (clazz === "lnbManagerItem" ? "<i class='fas fa-check submitAddManager pl-1' title='추가'></i><i class='fas fa-times cancelAddManager pl-1' title='취소'></i>" : "<i class='fas fa-trash cancelAddManager pl-2 title='삭제'></i>") + "</div>");
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
            title = "메일주소를 복사하지 못했습니다. 직접 선택하여 복사해주세요.";
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
    //notification handling start
    NMNS.socket.emit("get noti");
    NMNS.socket.on("get noti", socketResponse("서버 메시지 받기", function(e) {
        e.data.data.forEach(function(item) {
            showNotification(item);
        });
    }));
    //notification handling end
    //customer management menu switch start
    $(".customerMenuLink").off("touch click").on("touch click", function(e) {
        e.preventDefault();
        var action = $($(".customerSortType.active")[0]).data("action");
        if (!document.getElementById("customerScript")) {
            var script = document.createElement("script");
            script.src = "/nmns/js/customer.min.js";
            script.id = "customerScript";
            document.body.appendChild(script);

            script.onload = function() {
                NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": action });
                $(".calendarMenu").addClass("d-none");
                $(".customerMenu").css("display", "block");
            };
        } else {
            NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": action });
            $(".calendarMenu").addClass("d-none");
            $(".customerMenu").css("display", "block");
        }
        $("#customerAddManager").next().html("<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='' data-bgcolor='#b2dfdb'><span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color:#b2dfdb'></span><span class='tui-full-calendar-content'>(담당자 없음)</span></button>").append(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#customerAddManager").data("calendar-id", $(this).data("calendar-id")).data("bgcolor", $(this).data("bgcolor")).html($(this).html());
        });
        $("#customerAddManager").html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + NMNS.calendar.getCalendars()[0].bgColor + "'></span><span class='tui-full-calendar-content'>" + NMNS.calendar.getCalendars()[0].name + "</span>").data("calendar-id", NMNS.calendar.getCalendars()[0].id).data("bgcolor", NMNS.calendar.getCalendars()[0].bgColor);
        $("#customerManager").next().html("<button type='button' class='dropdown-item tui-full-calendar-dropdown-item' data-calendar-id='' data-bgcolor='#b2dfdb'><span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color:#b2dfdb'></span><span class='tui-full-calendar-content'>(담당자 없음)</span></button>").append(generateTaskManagerList()).off("touch click", "button").on("touch click", "button", function() {
            $("#customerManager").data("calendar-id", $(this).data("calendar-id")).data("bgcolor", $(this).data("bgcolor")).html($(this).html());
        });
    });
    $(".calendarMenuLink").off("touch click").on("touch click", function(e) {
        e.preventDefault();
        $(".customerMenu").css("display", "none");
        $(".calendarMenu").removeClass("d-none");
        setSchedules();
    });
    //customer management menu switch end
})(jQuery);