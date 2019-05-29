/*global jQuery, location, moment, tui, NMNS, io, filterNonNumericCharacter, dashContact, navigator, socketResponse, generateRandom, getCookie, flatpickr, PerfectScrollbar, toYYYYMMDD, findById, Notification, drawCustomerAlrimList, showSnackBar, showNotification, getBackgroundColor */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("Siema",[],t):"object"==typeof exports?exports.Siema=t():e.Siema=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(r){if(i[r])return i[r].exports;var n=i[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var i={};return t.m=e,t.c=i,t.d=function(e,i,r){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,i){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s=function(){function e(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,i,r){return i&&e(t.prototype,i),r&&e(t,r),t}}(),l=function(){function e(t){var i=this;if(r(this,e),this.config=e.mergeSettings(t),this.selector="string"==typeof this.config.selector?document.querySelector(this.config.selector):this.config.selector,null===this.selector)throw new Error("Something wrong with your selector 😭");this.resolveSlidesNumber(),this.selectorWidth=this.selector.offsetWidth,this.transformProperty=e.webkitOrNot(),["resizeHandler","touchstartHandler","touchendHandler","touchmoveHandler","mousedownHandler","mouseupHandler","mouseleaveHandler","mousemoveHandler","clickHandler"].forEach(function(e){i[e]=i[e].bind(i)}),this.init()}return s(e,[{key:"attachEvents",value:function(){window.addEventListener("resize",this.resizeHandler),this.config.draggable&&(this.pointerDown=!1,this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:!1},this.selector.addEventListener("touchstart",this.touchstartHandler),this.selector.addEventListener("touchend",this.touchendHandler),this.selector.addEventListener("touchmove",this.touchmoveHandler),this.selector.addEventListener("mousedown",this.mousedownHandler),this.selector.addEventListener("mouseup",this.mouseupHandler),this.selector.addEventListener("mouseleave",this.mouseleaveHandler),this.selector.addEventListener("mousemove",this.mousemoveHandler),this.selector.addEventListener("click",this.clickHandler))}},{key:"detachEvents",value:function(){window.removeEventListener("resize",this.resizeHandler),this.selector.removeEventListener("touchstart",this.touchstartHandler),this.selector.removeEventListener("touchend",this.touchendHandler),this.selector.removeEventListener("touchmove",this.touchmoveHandler),this.selector.removeEventListener("mousedown",this.mousedownHandler),this.selector.removeEventListener("mouseup",this.mouseupHandler),this.selector.removeEventListener("mouseleave",this.mouseleaveHandler),this.selector.removeEventListener("mousemove",this.mousemoveHandler),this.selector.removeEventListener("click",this.clickHandler)}},{key:"init",value:function(){this.innerElements=[].slice.call(this.selector.children),this.currentSlide=this.config.loop?this.config.startIndex%this.innerElements.length:Math.max(0,Math.min(this.config.startIndex,this.innerElements.length-this.perPage)),this.attachEvents(),this.selector.style.overflow="hidden",this.selector.style.direction=this.config.rtl?"rtl":"ltr",this.buildSliderFrame(),this.config.onInit.call(this)}},{key:"buildSliderFrame",value:function(){var e=this.selectorWidth/this.perPage,t=this.config.loop?this.innerElements.length+2*this.perPage:this.innerElements.length;this.sliderFrame=document.createElement("div"),this.sliderFrame.style.width=e*t+"px",this.enableTransition(),this.config.draggable&&(this.selector.style.cursor="-webkit-grab");var i=document.createDocumentFragment();if(this.config.loop)for(var r=this.innerElements.length-this.perPage;r<this.innerElements.length;r++){var n=this.buildSliderFrameItem(this.innerElements[r].cloneNode(!0));i.appendChild(n)}for(var s=0;s<this.innerElements.length;s++){var l=this.buildSliderFrameItem(this.innerElements[s]);i.appendChild(l)}if(this.config.loop)for(var o=0;o<this.perPage;o++){var a=this.buildSliderFrameItem(this.innerElements[o].cloneNode(!0));i.appendChild(a)}this.sliderFrame.appendChild(i),this.selector.innerHTML="",this.selector.appendChild(this.sliderFrame),this.slideToCurrent()}},{key:"buildSliderFrameItem",value:function(e){var t=document.createElement("div");return t.style.cssFloat=this.config.rtl?"right":"left",t.style.float=this.config.rtl?"right":"left",t.style.width=(this.config.loop?100/(this.innerElements.length+2*this.perPage):100/this.innerElements.length)+"%",t.appendChild(e),t}},{key:"resolveSlidesNumber",value:function(){if("number"==typeof this.config.perPage)this.perPage=this.config.perPage;else if("object"===n(this.config.perPage)){this.perPage=1;for(var e in this.config.perPage)window.innerWidth>=e&&(this.perPage=this.config.perPage[e])}}},{key:"prev",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide-e<0){this.disableTransition();var r=this.currentSlide+this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r-e}else this.currentSlide=this.currentSlide-e}else this.currentSlide=Math.max(this.currentSlide-e,0);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this))}}},{key:"next",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide+e>this.innerElements.length-this.perPage){this.disableTransition();var r=this.currentSlide-this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r+e}else this.currentSlide=this.currentSlide+e}else this.currentSlide=Math.min(this.currentSlide+e,this.innerElements.length-this.perPage);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this))}}},{key:"disableTransition",value:function(){this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing}},{key:"enableTransition",value:function(){this.sliderFrame.style.webkitTransition="all "+this.config.duration+"ms "+this.config.easing,this.sliderFrame.style.transition="all "+this.config.duration+"ms "+this.config.easing}},{key:"goTo",value:function(e,t){if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;this.currentSlide=this.config.loop?e%this.innerElements.length:Math.min(Math.max(e,0),this.innerElements.length-this.perPage),i!==this.currentSlide&&(this.slideToCurrent(),this.config.onChange.call(this),t&&t.call(this))}}},{key:"slideToCurrent",value:function(e){var t=this,i=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,r=(this.config.rtl?1:-1)*i*(this.selectorWidth/this.perPage);e?requestAnimationFrame(function(){requestAnimationFrame(function(){t.enableTransition(),t.sliderFrame.style[t.transformProperty]="translate3d("+r+"px, 0, 0)"})}):this.sliderFrame.style[this.transformProperty]="translate3d("+r+"px, 0, 0)"}},{key:"updateAfterDrag",value:function(){var e=(this.config.rtl?-1:1)*(this.drag.endX-this.drag.startX),t=Math.abs(e),i=this.config.multipleDrag?Math.ceil(t/(this.selectorWidth/this.perPage)):1,r=e>0&&this.currentSlide-i<0,n=e<0&&this.currentSlide+i>this.innerElements.length-this.perPage;e>0&&t>this.config.threshold&&this.innerElements.length>this.perPage?this.prev(i):e<0&&t>this.config.threshold&&this.innerElements.length>this.perPage&&this.next(i),this.slideToCurrent(r||n)}},{key:"resizeHandler",value:function(){this.resolveSlidesNumber(),this.currentSlide+this.perPage>this.innerElements.length&&(this.currentSlide=this.innerElements.length<=this.perPage?0:this.innerElements.length-this.perPage),this.selectorWidth=this.selector.offsetWidth,this.buildSliderFrame()}},{key:"clearDrag",value:function(){this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:this.drag.preventClick}}},{key:"touchstartHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.touches[0].pageX,this.drag.startY=e.touches[0].pageY)}},{key:"touchendHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag()}},{key:"touchmoveHandler",value:function(e){if(e.stopPropagation(),null===this.drag.letItGo&&(this.drag.letItGo=Math.abs(this.drag.startY-e.touches[0].pageY)<Math.abs(this.drag.startX-e.touches[0].pageX)),this.pointerDown&&this.drag.letItGo){e.preventDefault(),this.drag.endX=e.touches[0].pageX,this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)"}}},{key:"mousedownHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.preventDefault(),e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.pageX)}},{key:"mouseupHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag()}},{key:"mousemoveHandler",value:function(e){if(e.preventDefault(),this.pointerDown){"A"===e.target.nodeName&&(this.drag.preventClick=!0),this.drag.endX=e.pageX,this.selector.style.cursor="-webkit-grabbing",this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)"}}},{key:"mouseleaveHandler",value:function(e){this.pointerDown&&(this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.drag.endX=e.pageX,this.drag.preventClick=!1,this.enableTransition(),this.updateAfterDrag(),this.clearDrag())}},{key:"clickHandler",value:function(e){this.drag.preventClick&&e.preventDefault(),this.drag.preventClick=!1}},{key:"remove",value:function(e,t){if(e<0||e>=this.innerElements.length)throw new Error("Item to remove doesn't exist 😭");var i=e<this.currentSlide,r=this.currentSlide+this.perPage-1===e;(i||r)&&this.currentSlide--,this.innerElements.splice(e,1),this.buildSliderFrame(),t&&t.call(this)}},{key:"insert",value:function(e,t,i){if(t<0||t>this.innerElements.length+1)throw new Error("Unable to inset it at this index 😭");if(-1!==this.innerElements.indexOf(e))throw new Error("The same item in a carousel? Really? Nope 😭");var r=t<=this.currentSlide>0&&this.innerElements.length;this.currentSlide=r?this.currentSlide+1:this.currentSlide,this.innerElements.splice(t,0,e),this.buildSliderFrame(),i&&i.call(this)}},{key:"prepend",value:function(e,t){this.insert(e,0),t&&t.call(this)}},{key:"append",value:function(e,t){this.insert(e,this.innerElements.length+1),t&&t.call(this)}},{key:"destroy",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments[1];if(this.detachEvents(),this.selector.style.cursor="auto",e){for(var i=document.createDocumentFragment(),r=0;r<this.innerElements.length;r++)i.appendChild(this.innerElements[r]);this.selector.innerHTML="",this.selector.appendChild(i),this.selector.removeAttribute("style")}t&&t.call(this)}}],[{key:"mergeSettings",value:function(e){var t={selector:".siema",duration:200,easing:"ease-out",perPage:1,startIndex:0,draggable:!0,multipleDrag:!0,threshold:20,loop:!1,rtl:!1,onInit:function(){},onChange:function(){}},i=e;for(var r in i)t[r]=i[r];return t}},{key:"webkitOrNot",value:function(){return"string"==typeof document.documentElement.style.transform?"transform":"WebkitTransform"}}]),e}();t.default=l,e.exports=t.default}])});
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
        defaultView: "day",
        scheduleView: ['time'],
        useCreationPopup: false,
        useDetailPopup: true,
        disableDblClick: true,
        isReadOnly:true,
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
                return '<span class="tui-full-calendar-weekday-grid-more-schedules" title="전체 예약">전체 예약 <span class="icon-arrow icon-arrow-right"></span></span>';
            },
            monthMoreTitleDate: function(date, dayname) {
                var dateFormat = date.split(".").join("-");
                var holiday = NMNS.holiday ? NMNS.holiday.find(function(item) { return item.date === dateFormat }) : undefined;
                var classDay = "tui-full-calendar-month-more-title-day" + (dayname === "일" ? " tui-full-calendar-holiday-sun" : "") + (holiday ? " tui-full-calendar-holiday" : "") + (dayname === "토" ? " tui-full-calendar-holiday-sat" : "");

                return '<span class="' + classDay + '">' + parseInt(dateFormat.substring(8), 10) + '</span> <span class="tui-full-calendar-month-more-title-day-label">' + dayname + (holiday ? ("<small class='d-none d-sm-inline'>[" + holiday.title + "]</small>") : "") + '</span>';
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
            'week.timegridHorizontalLine.borderBottom': '1px solid rgba(57, 53, 53, 0.2)',
            'week.daygrid.borderRight': '1px solid rgba(57,53,53,0.2)',
            'week.timegrid.borderRight': '1px solid rgba(57,53,53,0.2)',
            'week.dayGridSchedule.borderLeft': '2px solid',
            'week.daygridLeft.width': '54px',
            'week.timegridLeft.borderRight': 'none',
            'week.timegridLeft.width': '54px'
        }
    });

    NMNS.calendar.on({
      clickSchedule: function(e){
        NMNS.scheduleTarget = e;
        initScheduleTab(e);
        /*$("#scheduleTabList a[data-target='#scheduleTab']").text('예약 상세').tab('show');
        $("#scheduleBtn").text('저장');*/
        // $("#scheduleModal").addClass('update').modal('show');
        switchMenu.call($(".scheduleLink"), e);
      },
      beforeCreateSchedule: function(e) {
        NMNS.scheduleTarget = e;
        initScheduleTab(e);
        $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').tab('show');
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
        setRenderRangeText();
        setSchedules();
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
        if (NMNS.info.authStatus === "BEFORE_EMAIL_VERIFICATION" && moment(NMNS.info.signUpDate, "YYYYMMDD").add(30, 'd').isSameOrAfter(moment(), 'day')) {// TODO : 알림 처리
            showNotification({
                title: "이메일을 인증해주세요!",
                body: "인증메일은 내 매장 정보 화면에서 다시 보내실 수 있습니다. 이메일을 인증해주세요!"
            });
        }
        //welcome popup
				if(localStorage.getItem("notAnyMore") !== 'true'){
					$(document.body).append('<div id="welcomeModal" class="modal fade" tabIndex="-1" role="dialog" aria-label="환영 팝업" aria-hidden="true">\
						<div class="modal-dialog modal-dialog-centered" role="document">\
							<div class="modal-content rounded-0">\
								<div class="modal-body flex-column" style="padding:20px">\
									<div><img src="/nmns/img/mobile_welcome.png" style="width:100%"/></div>\
									<div style="text-align:center;margin:20px 0 33px 0;font-size:14px">\
										왓쇼에 오신걸 환영해요 &gt;_&lt;<br><br>모바일 버전에서는<br>노쇼, 예약, 일정, 고객, 메뉴 추가 기능을 뺀<br>모든 서비스를 이용할 수 있어요.<br>추가 기능은 PC에서 이용할 수 있답니다!\
									</div>\
								</div>\
								<div class="modal-footer" style="padding:0 25px;height:57px"><input type="checkbox" id="notAnyMore"><label for="notAnyMore"></label><label for="notAnyMore" style="font-size:12px;margin-left:0">다시 보지 않기</label><button type="button" class="btn btn-flat ml-auto px-0" style="font-size:14px" data-dismiss="modal">닫기</button></div>\
							</div>\
						</div>\
					</div>');
					$("#notAnyMore").on("change", function(){
						localStorage.setItem("notAnyMore", "true");
						$("#welcomeModal").modal("hide");
					});
					$("#welcomeModal").modal("show");
				}
					
            /*if (!document.getElementById("tutorialScript")) {
                var script = document.createElement("script");
                script.src = "/nmns/js/tutorial.min.js";
                script.id = "tutorialScript";
                document.body.appendChild(script);

                script.onload = function() {
                    $("#tutorialModal").modal();
                };
            }*/
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

        // $("#lnbManagerList").html(generateLnbManagerList(e.data)).on("touch click", ".updateManagerLink", updateManager).on("touch click", ".removeManagerLink", removeManager);
        /*if($("#sidebarContainer").data('scroll')){
          $("#sidebarContainer").data('scroll').update();
        }*/
        NMNS.calendar.setCalendars(e.data);
        if (NMNS.needInit) {
            delete NMNS.needInit;
            setSchedules();
        }
        $("#mainTaskContents input").on('change', function(e){
          e.stopPropagation();
          var data = $(this).parent();
          NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
          NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
        })
        $("#mainTaskContents .task").on('touch click', function(e){
          e.stopPropagation();
          var data = $(this).parent();
          initTaskTab({id:data.data('id'), title:data.data('title'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'})
          $("#scheduleTabList a[data-target='#taskTab']").tab('show');
          $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가');
          $("#scheduleBtn").text('예약 추가 완료');
          $("#scheduleModal").removeClass('update').modal('show')
        });
        refreshScheduleVisibility();
    }));

    //business specific functions about calendar start
    function getTimeSchedule(schedule, isAllDay) { // draw schedule block using schedule object
        var type = schedule.category === 'task' ? "일정" : "예약";
        var html = "";
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
        
        return html;
    }

    function generateCarouselItem(start){
      var html = '';
      var monday=start.clone().add(1, 'days'), tuesday=start.clone().add(2, 'days'), wednesday=start.clone().add(3, 'days'), thursday=start.clone().add(4,'days'), friday=start.clone().add(5,'days'), saturday=start.clone().add(6, 'days');
      html+='<div class="mainCalendarWeek" data-start="'+start.format('YYYYMMDD')+'">'
        +'<div data-date="'+start.format('YYYYMMDD')+'" class="mainCalendarWeekday mainCalendarHoliday"><div class="mainCalendarDayName">일</div><div class="mainCalendarDay"><span>'+start.format('D')+'</span></div></div>'
        +'<div data-date="'+monday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === monday.format('YYYY-MM-DD')})?' mainCalendarHoliday':'')+'"><div class="mainCalendarDayName">월</div><div class="mainCalendarDay"><span>'+monday.format('D')+'</span></div></div>'
        +'<div data-date="'+tuesday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === tuesday.format('YYYY-MM-DD')})?' mainCalendarHoliday':'')+'"><div class="mainCalendarDayName">화</div><div class="mainCalendarDay"><span>'+tuesday.format('D')+'</span></div></div>'
        +'<div data-date="'+wednesday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === wednesday.format('YYYY-MM-DD')})?' mainCalendarHoliday':'')+'"><div class="mainCalendarDayName">수</div><div class="mainCalendarDay"><span>'+wednesday.format('D')+'</span></div></div>'
        +'<div data-date="'+thursday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === thursday.format('YYYY-MM-DD')})?' mainCalendarHoliday':'')+'"><div class="mainCalendarDayName">목</div><div class="mainCalendarDay"><span>'+thursday.format('D')+'</span></div></div>'
        +'<div data-date="'+friday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === friday.format('YYYY-MM-DD')})?' mainCalendarHoliday':'')+'"><div class="mainCalendarDayName">금</div><div class="mainCalendarDay"><span>'+friday.format('D')+'</span></div></div>'
        +'<div data-date="'+saturday.format('YYYYMMDD')+'" class="mainCalendarWeekday'+(NMNS.holiday&&NMNS.holiday.find(function(item){return item.date === saturday.format('YYYY-MM-DD')})?' mainCalendarHoliday':' mainCalendarSaturday')+'"><div class="mainCalendarDayName">토</div><div class="mainCalendarDay"><span>'+saturday.format('D')+'</span></div></div>'
        +'</div>';
      html = $(html).on("touch click", ".mainCalendarWeekday", function(e){
        if(!$(this).hasClass('mainCalendarWeekdayActive')){
          $(".mainCalendarWeekdayActive").removeClass('mainCalendarWeekdayActive');
          $(this).addClass('mainCalendarWeekdayActive');
          NMNS.calendar.setDate(moment($(this).data('date'), 'YYYYMMDD').toDate());
          setRenderRangeText();
          setSchedules();
          var month = moment(NMNS.calendar.getDate().getTime()).format('YYYYMM');
          $("#mainCalendarCarousel > div > div:nth-child("+(NMNS.siema.currentSlide + 1)+") .mainCalendarWeekday").each(function(index, weekday){
            if(($(weekday).data('date')+'').indexOf(month) === 0){
              $(weekday).removeClass('mainCalendarOtherMonth');
            }else{
              $(weekday).addClass('mainCalendarOtherMonth');
            }
          });
          
        }
      });
      return html;
    }
    function initCalendarCarousel(){
      var date = NMNS.calendar.getDate().toDate();
      if(NMNS.siema){
        NMNS.siema.destroy(true);
        $("#mainCalendarCarousel").html('').html(generateCarouselItem(moment(date).add(-7, 'days').startOf('week'))).append(generateCarouselItem(moment(date).startOf('week'))).append(generateCarouselItem(moment(date).add(7, 'days').startOf('week')));
        NMNS.siema.init();
        NMNS.siema.goTo(1);
      }else{
        $("#mainCalendarCarousel").html(generateCarouselItem(moment(date).add(-7, 'days').startOf('week'))).append(generateCarouselItem(moment(date).startOf('week'))).append(generateCarouselItem(moment(date).add(7, 'days').startOf('week')));
        NMNS.siema = new Siema({
          selector: '#mainCalendarCarousel',
          duration: 200,
          easing: 'ease-out',
          perPage: 1,
          startIndex: 1,
          draggable: true,
          multipleDrag: false,
          threshold: 20,
          loop: false,
          rtl: false,
          onChange: onChangeCarousel
        });
      }
      $("#mainCalendarCarousel > div > div:nth-child(2) .mainCalendarWeekday[data-date='"+moment(date).format('YYYYMMDD')+"']").addClass('mainCalendarWeekdayActive');
    }
    function onChangeCarousel(){
      var index= NMNS.siema.currentSlide;
      var length = $("#mainCalendarCarousel .mainCalendarWeek").length;
      //change the date of calendar
      NMNS.calendar.setDate(moment($("#mainCalendarCarousel > div > div:nth-child("+(index+1)+") .mainCalendarWeek .mainCalendarWeekday:nth-child("+($("#mainCalendarCarousel .mainCalendarWeekdayActive").removeClass('mainCalendarWeekdayActive').index()+1)+")").addClass('mainCalendarWeekdayActive').data('date'), 'YYYYMMDD').toDate());
      setRenderRangeText();
      var month = moment(NMNS.calendar.getDate().getTime()).format('YYYYMM');
      $("#mainCalendarCarousel > div > div:nth-child("+(NMNS.siema.currentSlide + 1)+") .mainCalendarWeekday").each(function(index, weekday){
        if(($(weekday).data('date')+'').indexOf(month) === 0){
          $(weekday).removeClass('mainCalendarOtherMonth');
        }else{
          $(weekday).addClass('mainCalendarOtherMonth');
        }
      });
      
      setSchedules();
      if(index === 0){//create previous week
        NMNS.siema.prepend(generateCarouselItem(moment($("#mainCalendarCarousel .mainCalendarWeek").eq(index).data('start'), 'YYYYMMDD').add(-7, 'days'))[0]);
      }else if(index === length -1){//create next week
        NMNS.siema.append(generateCarouselItem(moment($("#mainCalendarCarousel .mainCalendarWeek").eq(index).data('start'), 'YYYYMMDD').add(7, 'days'))[0]);
      }
    }

    function onChangeCalendarCarousel(){
      var nextIndex, prevIndex;
      switch (NMNS.siemaCalendar.currentSlide){
        case 0:
          nextIndex = 2;
          prevIndex = 3;
          break;
        case 1:
          nextIndex = 3;
          prevIndex = 1;
          break;
        case 2:
          nextIndex = 1;
          prevIndex = 2;
          break;
        default:
          return;
      }
      var current = document.getElementById('mainCalendarRangeInput'+(NMNS.siemaCalendar.currentSlide + 1))._flatpickr;
      setRenderRangeText(current.currentYear + '. ' + (current.currentMonth > 8?'':'0')+(current.currentMonth + 1));
      current = moment([current.currentYear + '' , current.currentMonth + '']).toDate();
      document.getElementById('mainCalendarRangeInput' + prevIndex)._flatpickr.jumpToDate(moment(current).add(-1, 'month').toDate());
      document.getElementById('mainCalendarRangeInput' + nextIndex)._flatpickr.jumpToDate(moment(current).add(1, 'month').toDate());
      
    }
    
    function onChangeMainCalendar(id){
      return function(){
        NMNS.calendar.setDate(moment($(id).val(), 'YYYYMMDD').toDate());
        $("#mainCalendarRange").trigger('click');
        initCalendarCarousel();
        var month = moment(NMNS.calendar.getDate().getTime()).format('YYYYMM');
        $("#mainCalendarCarousel > div > div:nth-child("+(NMNS.siema.currentSlide + 1)+") .mainCalendarWeekday").each(function(index, weekday){
          if(($(weekday).data('date')+'').indexOf(month) === 0){
            $(weekday).removeClass('mainCalendarOtherMonth');
          }else{
            $(weekday).addClass('mainCalendarOtherMonth');
          }
        });
        
        $(id).val(null);
        setSchedules();
      };
    }

    function onClickNavi(e) { // prev, next button event on calendar
      if($("#mainCalendarCalendar").is(":visible")){
        e.stopPropagation();
        var action = e.target.getAttribute('data-action');
        if (!action) {
            action = e.target.parentElement.getAttribute('data-action');
        }
        switch (action) {
          case 'prev':
            NMNS.siemaCalendar.prev();
            break;
          case 'next':
            NMNS.siemaCalendar.next();
            break;
          default:
            return;
        }
      }
    }

    function onClickTask(e){ // handle event when click today's task text
      document.scrollingElement.scrollTop = 0;
      $(".calendarMenu").removeClass('fixedScroll');
      $("#mainTask").toggleClass('show');
      $("#mainCalendarArea").toggle();
    }

    function findManager(managerId) {
        return NMNS.calendar.getCalendars().find(function(manager) {
            return (manager.id === managerId);
        });
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
    }

    function setRenderRangeText(target) {
      var renderRange = document.getElementById('renderRange');
      if(target){
        renderRange.innerHTML = target;
      }else{
        renderRange.innerHTML = moment(NMNS.calendar.getDate().getTime()).format('YYYY. MM');
      }
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
		/*
    function generateLnbManagerList(managerList) {
        var html = "";
        managerList.forEach(function(item) {
            html += "<div class='lnbManagerItem row mx-0' data-value='" + item.id + "'><label><input class='tui-full-calendar-checkbox-round' checked='checked' type='checkbox'>";
            html += "<span title='이 담당자의 예약 가리기/보이기' data-color='" + item.color + "'"+ (item.checked?" style='background-color:"+item.color+";border-color:"+item.color+"'":"")+"></span><span class='menu-collapsed'>" + item.name + "</span></label>"+
                  "<div class='dropdown menu-collapsed ml-auto'><button class='btn btn-flat dropdown-toggle lnbManagerAction text-white py-0 pr-0' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' data-offset='9,10'><span class='contextual menu-collapsed'></span></button>"+
                  "<div class='dropdown-menu dropdown-menu-right'><a class='dropdown-item updateManagerLink' href='#'>이름/컬러 변경</a><a class='dropdown-item removeManagerLink' href='#'>삭제</a></div></div></div>";
        });
        return html;
    }*/
    
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
      NMNS.calendar.setCalendars(NMNS.calendar.getCalendars().remove(manager.id, function(item, target) { return item.id === target; }));
      NMNS.history.push({ id: manager.id, bgColor: manager.bgColor, borderColor: manager.borderColor, color: manager.color, name: manager.name });
      $("#lnbManagerList .lnbManagerItem[value='"+manager.id+"']").remove();
      NMNS.socket.emit("delete manager", { id: manager.id });
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
              html += "<div class='row mx-0 px-0 col-12 position-relative' data-id='"+task.id+"' data-calendar-id='"+task.manager+"' data-start='"+task.start+"' data-end='"+task.end+"' data-title='"+task.title+"'><input type='checkbox' class='task-checkbox' id='task-checkbox"+index+"'"+(task.isDone?" checked='checked'":"")+"><label for='task-checkbox"+index+"'></label><div class='flex-column d-inline-flex cursor-pointer task' style='margin-left:10px;max-width:calc(100% - 35px)'><div style='font-size:14px'>"+task.title+"</div><div class='montserrat' style='font-size:12px;opacity:0.5'>"+
              moment(task.start, 'YYYYMMDDHHmm').format(moment(task.start, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')
              + (task.end?' - ' + (moment(task.end, 'YYYYMMDDHHmm').format(moment(task.end, 'YYYYMMDDHHmm').isSame(moment(day.date, 'YYYYMMDD'), 'day')?'HH:mm':'MM. DD HH:mm')):'')
              +"</div></div><span class='tui-full-calendar-weekday-schedule-bullet' style='top:8px;right:0;left:unset;background:"+manager.borderColor+"' title='"+manager.name+"'></span></div>"
            })
          }
        })
      }else{
        html = "<div class='m-auto'>등록된 일정이 없어요.</div>"
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
        if (alrims && alrims.length > 0) {
            var html = "";
            var base = $("#alrimHistoryList .alrimRow").length
            alrims.forEach(function(item, index) {
                html += '<div class="d-flex alrimRow col" title="눌러서 전송된 알림톡 내용 보기"><a href="#alrimDetail' + (index+base) + '" class="alrimDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="alrimDetail' + (index+base) + '"></a><div class="col-4 pl-0 text-left montserrat">' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '</div><div class="col-3 px-0 ellipsis">' + item.name + '</div><div class="col-4 px-0 montserrat">' + dashContact(item.contact) + '</div><div class="col-1 px-0"></div></div>' +
                    '<div class="row alrimDetailRow collapse col-12" id="alrimDetail' + (index+base) + '">'+(item.contents?item.contents.replace(/\n/g, "<br>"):'')+'</div>';
                if (index > 0 && index % 50 === 0) {
                    $("#alrimHistoryList").append(html);
                    html = "";
                }
            });
            list.append(html);
            $("#alrimHistoryList .alrimDetailLink").off('touch click').on("touch click", function(){
              $(this).parent().toggleClass('show');
            })
        } else {
            list.append("<div class='row alrimRow'><span class='col-12 text-center'>검색된 결과가 없습니다.</span></div>");
        }
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
        // $("#noticeByteCount").text($("#alrimNotice").val().length);
    }

    function submitAlrimModal() {
        if ($("#alrimNotice").val().length > 700) {
            alert("알림 안내문구의 길이가 너무 깁니다. 조금만 줄여주세요 :)");
            $("#alrimNotice").focus();
            return;
        }
        if ($("#alrimUseYn").prop("checked")) {
            if ($("#alrimCallbackPhone").val() === "") {
                alert("알림톡을 사용하시려면 예약취소 알림톡을 받을 휴대폰번호를 입력해주세요!");
                $("#alrimCallbackPhone").focus();
                return;
            } else if (!(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test($("#alrimCallbackPhone").val()))) {
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
            history.back();
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
        var parameters = {}, diff = false,
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
            
        if (diff) {
            NMNS.history.push(history);
            NMNS.socket.emit("update info", parameters);
        } else {
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
    }

    function initNoShowModal() {
        if (!$("#noShowScheduleList").hasClass("ps")) {
          // $("#noShowScheduleList").data("scroll", new PerfectScrollbar("#noShowScheduleList", { suppressScrollX: true }));
        
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
          $("#noShowAddContact").on("keyup", function(e) {
              if (e.which === 13) {
                  $("#noShowAddBtn").trigger("click");
              }
          })

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
        html += '<options value="'+item.id+'">'+item.name+'</option>';
      });
      return html;
    }
    
    function generateSalesContents(sales){
      var html = "";
      if(Array.isArray(sales) && sales.length > 0){
        var membership = sales[0] && sales[0].balanceMembership > 0, isRegistered;
        sales.forEach(function(sale, index){//draw selective form area
          isRegistered = Number.isInteger(sale.priceCard) || Number.isInteger(sale.priceCash) || Number.isInteger(sale.priceMembership);
          html += '<div class="scheduleSalesItem">'+sale.item+'</div><div class="scheduleSalesPayments" data-item="'+sale.item+'" data-index="'+index+'"'+(sale.id?' data-id="'+(sale.id || '')+'"':'') 
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
            + ((sale.type === 'CARD' || !sale.type)? ((sale.priceCard || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : (sale.type === 'CASH'? ((sale.priceCash || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : ((sale.priceMembership || '0')+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")))
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
        html += '<div style="height:300px;align-items:center;width:100%;display:flex;justify-content:center;font-size:15px">메뉴를 입력하면 매출내역을 기록할 수 있어요!</div>';
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
        $("#scheduleTabContentList").html(generateMenuList([{menuId:'1234', menuName:'테스트 메뉴'}]))//TODO : remove this line (for test)
      }

      $(".scheduleMenu").data('contact', e && e.schedule? e.schedule.raw.contact : null).data('name', e && e.schedule?e.schedule.title : '');
      if(typeof e === 'object'){// dragged calendar / update schedule
        if(e.schedule){// update schedule
          $("#scheduleStatus input[type='radio']").prop('checked', false);
          if($("#scheduleStatus input[value='"+e.schedule.raw.status+"']").length){
            $("#scheduleStatus input[value='"+e.schedule.raw.status+"']").prop('checked', true);
          }else if(e.schedule.raw.status === 'CUSTOMERCANCELED'){
            $("#scheduleStatus input[value='CUSTOMERCANCELED']").prop('checked', true);
          }else{
            $("#scheduleStatus input[value='RESERVED']").prop('checked', true);
          }
          
          document.getElementById('scheduleStartDate')._flatpickr.setDate(e.schedule.start.toDate());
          document.getElementById('scheduleEndDate')._flatpickr.setDate(e.schedule.end.toDate());
          $("#scheduleStartTime").val(getTimeFormat(moment(e.schedule.start.toDate())));
          $("#scheduleEndTime").val(getTimeFormat(moment(e.schedule.end.toDate())));
    
          $('#scheduleName').val(e.schedule.title);
          $("#scheduleTabContents").append(generateContentsList(e.schedule.raw ?e.schedule.raw.contents : "")).find('button').off('touch click').on('touch click', function(){
            removeContent(this);
          });
          
          $('#scheduleContact').val(e.schedule.raw ? e.schedule.raw.contact : e.schedule.contact);
          $('#scheduleEtc').val(e.schedule.raw ? e.schedule.raw.etc : e.schedule.etc);
          $('#scheduleAllDay').attr('checked', e.schedule.isAllDay);
          
          if(moment(e.schedule.start.toDate()).isBefore(moment())){
            $("#resendAlrimScheduleBtn").addClass('d-none');
          }else{
            $("#resendAlrimScheduleBtn").removeClass('d-none');
          }
          calendar = findManager(e.schedule.calendarId);
        }
        
        if (!calendar) {
          $('#scheduleManager').html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + e.schedule.color + "'></span><span class='tui-full-calendar-content'>(삭제된 담당자)</span>").data('calendar-id', e.schedule.calendarId).data('color', e.schedule.color);
        }else{
          calendar = $('#scheduleManagerList').find("button[data-calendar-id='" + calendar.id + "']");
          $('#scheduleManager').html(calendar.html()).data('calendar-id', calendar.data('calendarId')).data('color', calendar.data('color'));
        }
      }
    }

    function initScheduleTab(e){
      if(!$(".scheduleMenu").data('inited')){
        $(".scheduleMenu").data('inited', true);
        $("#scheduleStartDate").on("touch click", function(){
          $("#endCalendarArea").hide();
          $("#startCalendarArea").show();
          this._flatpickr.setDate(moment($(this).val(), 'YYYY. MM. DD').toDate());
        });
        $("#scheduleEndDate").on("touch click", function(){
          $("#startCalendarArea").hide();
          $("#endCalendarArea").show();
          this._flatpickr.setDate(moment($(this).val(), 'YYYY. MM. DD').toDate());
        });
        flatpickr("#scheduleStartDate", {
          dateFormat: "Y. m. d",
          disableMobile: true,
          appendTo:document.getElementById('startCalendarArea'),
          locale: "ko",
          onChange:function(selectedDates, dateStr, instance){
            $("#calendarModal").modal('hide');
          }
        });
        flatpickr("#scheduleEndDate", {
          dateFormat: "Y. m. d",
          disableMobile: true,
          appendTo:document.getElementById('endCalendarArea'),
          locale: "ko",
          onChange:function(selectedDates, dateStr, instance){
            $("#calendarModal").modal('hide');
          }
        });
        $("#scheduleAddContents").on("touch click", function(){
          $("#scheduleTabContents").append($(generateContentsList('')).on('touch click', 'button', function(){
            removeContent(this);
          }));
        });

        var autoCompleteOption = {
          lookup:[{value:"오전 00:00"},{value:"오전 00:30"},{value:"오전 01:00"},{value:"오전 01:30"},{value:"오전 02:00"},{value:"오전 02:30"},{value:"오전 03:00"},{value:"오전 03:30"},{value:"오전 04:00"},{value:"오전 04:30"},{value:"오전 05:00"},{value:"오전 05:30"},{value:"오전 06:00"},{value:"오전 06:30"},{value:"오전 07:00"},{value:"오전 07:30"},{value:"오전 08:00"},{value:"오전 08:30"},{value:"오전 09:00"},{value:"오전 09:30"},{value:"오전 10:00"},{value:"오전 10:30"},{value:"오전 11:00"},{value:"오전 11:30"},{value:"오후 12:00"},{value:"오후 12:30"},{value:"오후 01:00"},{value:"오후 01:30"},{value:"오후 02:00"},{value:"오후 02:30"},{value:"오후 03:00"},{value:"오후 03:30"},{value:"오후 04:00"},{value:"오후 04:30"},{value:"오후 05:00"},{value:"오후 05:30"},{value:"오후 06:00"},{value:"오후 06:30"},{value:"오후 07:00"},{value:"오후 07:30"},{value:"오후 08:00"},{value:"오후 08:30"},{value:"오후 09:00"},{value:"오후 09:30"},{value:"오후 10:00"},{value:"오후 10:30"},{value:"오후 11:00"},{value:"오후 11:30"}],
          maxHeight:175,
          triggerSelectOnValidInput: false,
          zIndex:1060
        };        
        // $('#scheduleStartTime').autocomplete(autoCompleteOption);
        // $("#scheduleEndTime").autocomplete(autoCompleteOption);
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
        });
        
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
                  id: origin.id,
                  manager: calendarId,
                  name: title,
                  start: moment(startDate).format("YYYYMMDDHHmm"),
                  end: moment(endDate).format("YYYYMMDDHHmm"),
                  contents: contents,
                  contact: contact,
                  isAllDay: isAllDay,
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
      
          history.back();
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
          history.back();
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
            list += '<div class="notification"><div class="d-flex align-items-center"><span>' + (item.title?'고객명 : ' + item.title :'고객번호 : ' + item.contact)+ '</span><span class="d-flex ml-auto montserrat notificationTime">'+(item.registeredDate? (moment(item.registeredDate, 'YYYYMMDDHHmm').isSame(moment(), 'day') ? moment(item.registeredDate, 'YYYYMMDDHHmm').format('HH:mm') : moment(item.registeredDate, 'YYYYMMDDHHmm').format('MM. DD')): '')+'</span></div><div><p>'+(item.title?'고객번호 : ' + dashContact(item.contact) : '')+'<br>예약날짜 : '+ moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD') + '<br>예약시간 : '+ moment(item.start, 'YYYYMMDDHHmm').format('HH시 mm분') + '</p></div><div class="d-flex align-items-center"><span class="text-accent font-weight-bold" style="font-size:14px">예약 취소</span><span class="d-flex ml-auto addAnnouncementNoShow cursor-pointer" style="font-size:11px" data-schedule-id="'+item.id+'">직전취소로 노쇼등록 &gt;</span></div></div>'
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
    // setDropdownCalendarType();
    initCalendarCarousel();
    setRenderRangeText();
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
        
        /*if ($("#noShowScheduleList").hasClass("ps")) {
            $("#noShowScheduleList").data("scroll").update();
        }*/
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
        } else if($("#announcementArea").is(":visible") && $("#announcementArea .addAnnouncementNoShow[data-schedule-id='"+e.data.id+"']").length){//직전취소로 노쇼등록
					showSnackBar('<span>노쇼로 등록하였습니다.</span>');
					$("#announcementArea .addAnnouncementNoShow[data-schedule-id='"+e.data.id+"']").hide();
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
      $('#mainTaskContents').html(generateTaskList(e.data))
      $("#mainTaskContents input").on('change', function(e){
        e.stopPropagation();
        var data = $(this).parent();
        NMNS.history.push({id:data.data('id'), category:'task', isDone:!$(this).prop('checked')});
        NMNS.socket.emit('update reserv', {id:data.data('id'), type: 'T', isDone:$(this).prop('checked')});
      })
      $("#mainTaskContents .task").on('touch click', function(e){
        e.stopPropagation();
        var data = $(this).parent();
        initTaskTab({id:data.data('id'), title:data.data('title'), start:data.data('start'), end:data.data('end'), calendarId:data.data('calendar-id'), category:'task'})
        $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').next().tab('show');
        $("#scheduleBtn").text('예약 추가 완료');
        $("#scheduleModal").removeClass('update').modal('show');
      });
      
    }));
    /*
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
*/
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
      e.data.detail.push({id:1111, date:'20190101', noShowCase:'직전취소'});//for test
      e.data.detail.push({id:1111, date:'20190101', noShowCase:'직전취소'});//for test
      e.data.summary.lastNoShowDate = '20190103';
      e.data.summary.noShowCount = 2;
        if (e.data.summary.noShowCount > 0) {
          
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
            var html = "";
            e.data.detail.forEach(function(item) {
                html += "<div class='row col-12 noShowRow' data-id='" + item.id + "' data-contact='" + (e.data.summary.contact || "") + "' data-date='" + (item.date || "") + "' data-noshowcase='" + (item.noShowCase || "") + "'><div class='col-3 px-0'>노쇼 날짜</div><div class='col-9 pl-0 montserrat'>" + (item.date ? (item.date.substring(0, 4) + ". " + item.date.substring(4, 6) + ". " + item.date.substring(6)) : "") + "</div><div class='col-3 px-0'>전화번호</div><div class='col-9 pl-0 montserrat'>" + (e.data.summary.contact ? dashContact(e.data.summary.contact) : "") + "</div><div class='col-3 px-0'>노쇼 사유</div><div class='col-9 pl-0'>" + (item.noShowCase || "")+ "</div><div class='noShowSearchDelete'><span title='삭제'>&times;</span></div></div>";
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
                var newRow = $("<div class='row col-12 noShowRow' data-id='" + origin.id + "' data-contact='" + (origin.contact || "") + "' data-date='" + (origin.date || "") + "' data-noshowcase='" + (origin.noShowCase || "") + "'><div class='col-3 px-0'>노쇼 날짜</div><div class='col-9 pl-0 montserrat'>" + (origin.date ? (origin.date.substring(0, 4) + ". " + origin.date.substring(4, 6) + ". " + origin.date.substring(6)) : "") + "</div><div class='col-3 px-0'>전화번호</div><div class='col-9 pl-0 montserrat'>" + (origin.contact ? dashContact(origin.contact) : "") + "</div><div class='col-3 px-0'>노쇼 사유</div><div class='col-9 pl-0'>" + (origin.noShowCase || "")+ "</div><div class='noShowSearchDelete'><span title='삭제'>&times;</span></div></div>");
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
        var popup = $(".scheduleMenu");
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
        if(e.data.body.indexOf("새로운 고객이 추가되었습니다")>0){
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
    }))
    NMNS.socket.on('get announcement', socketResponse('공지사항 조회', function(e){
       e.data.announcement.push({type:'SCHEDULE_ADDED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444'})// TODO : remove this line (for test)
       e.data.announcement.push({type:'SCHEDULE_CANCELED', title:'홍길동', registeredDate: moment().format('YYYYMMDDHHmm'), contents:'매니큐어 바르기', start:moment().format('YYYYMMDDHHmm'), contact:'01011234444', id:'aaa'})
      $("#announcementArea .flex-column").remove();
      if(e.data.announcement.length > 0){
				var list = $(drawNotificationList(e.data.announcement));
				list.find('.addAnnouncementNoShow').on("touch click", function(){
					NMNS.socket.emit("update reserv", {id:$(this).data('schedule-id'), status:"NOSHOW", noShowCase:"직전취소"});
				});
        $("#announcementArea").append(list);
      }else if(NMNS.announcementPage === 1){
        $("#announcementArea").append("<div class='m-auto text-center' style='font-size:14px;line-height:1.71'>아직 알림내역이 없어요.<br>공지사항, 예약 등록 내역, 예약 취소<br>내역이 보여집니다.</div>");
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
      if($("#scheduleTabContentList").is(":visible")){
        $("#scheduleTabContentList").html(generateMenuList(e.data));
        NMNS.menuList = e.data;
      }
      if($("#mainMenuList").is(":visible") && NMNS.drawMenuList){
        NMNS.drawMenuList(true);
      }
    }, undefined, true));
    
    NMNS.socket.on("get reserv sales", socketResponse('매출 정보 가져오기', function(e){
      //$("#salesForm").html(generateSalesContents(e.data));
      $("#salesForm").html(generateSalesContents([{item:'123', customerId:'asdf', managerId:'sadf', balanceMembership: 30000}, {item:'1234', customerId:'asdf', managerId:'sadf', priceCard:1233123, priceCash: 111111, balanceMembership: 30000}]));//for test
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
      }
      if(e.data.snsType === 'KAKAO'){
        NMNS.info.kakao = e.data.snsLinkId;
        if($("#kakaoBtn").is(":visible")){
          $("#kakaoBtn").addClass('connected');
        }
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
    
    $("#cancelStoreBtn").on("touch click", function() {
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
      if (changed && !confirm("저장되지 않은 변경내역이 있습니다. 계속 하시겠어요?")) {
        $(this).blur();
          return false;
      }
      history.back();
    })
    $(".storeLink").one('touch click', function(){
      $("#storeBtn").off("touch click").on("touch click", submitInfoModal);
    }).on('touch click', refreshInfoModal);
    
    $("#cancelAlrimBtn").on("touch click", function() {
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
      history.back();
    })
    $(".alrimLink").on("touch click", function() {
      refreshAlrimModal();
      $("#alrimTabList a[data-target='#alrimTab']").tab('show');
    }).one('touch click', function(){
      $("#labelAlrimUseYn").on("touch click", function(){
        $(this).next().children('label').trigger('click');
      })
      // $("#alrimNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function() {
      //     $("#noticeByteCount").text($(this).val().length);
      // });
			$("#alrimNotice").on("blur", function(){
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
      $("#scheduleTabContents").html(generateContentsList("")).find('button').off('touch click').on('touch click', function(){
        removeContent(this);
      });
      $('#scheduleContact').val('');
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
    $('.announcementMenuLink').on('touch click', function(){
      if(!NMNS.announcementPage){
        NMNS.announcementPage = 1;
        NMNS.socket.emit('get announcement', {page:1, combined:true});
      }
    });
		$("#exitDetailMenu").on("touch click", function(){
			/*$("#detailMenuTitle").hide().prev().show();
			$(this).hide().prev().show();*/
			history.back();
		});
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
    });
    $("#scheduleTabList a[data-target='#taskTab']").on('touch click', function(){
      if(!$(this).hasClass('active')){
        initTaskTab('switch');
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
          object.id = pay.data('id');
          object.customerId = pay.data('customer-id');
          object.managerId = pay.data('manager-id');
          object.scheduleId = pay.data('schedule-id');
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
      });
    }).on('show.bs.tab', function(){
      if(NMNS.scheduleTarget && NMNS.scheduleTarget.schedule){
        $("#salesLoading").show();
        $("#salesForm").hide();
        $("#salesBtn").addClass('disabled');
        NMNS.socket.emit('get reserv sales', {scheduleId: NMNS.scheduleTarget.schedule.id});
        return true;
      }else{
        return false;
      }
    });

/*    $("#addScheduleBtn").on("touch click", function(){
      initScheduleTab();
      $("#scheduleTabList a[data-target='#scheduleTab']").text('예약 추가').tab('show');
      $("#scheduleBtn").text('예약 추가 완료');
      $("#scheduleModal").removeClass('update').modal('show');
    });*/
    $(".userLink").one('touch click', function(){
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
      })
      $("#naverBtn").on("touch click", function(e){
        if($(this).hasClass('connected')){
          e.stopImmediatePropagation();
          return false;
        }
        e.preventDefault();
      });
    }).on('touch click', function(){
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
                  NMNS.socket.emit('link sns', {
                    snsLinkId:res.for_partner.uuid,
                    snsEmail:res.for_partner.properties.email,
                    snsType: 'KAKAO'
                  });
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
      $("#currentPassword").val("");
      $("#newPassword").val("");
      $("#renewPassword").val("");
    })
    //Modal events end
    //mobile horizontal scroll handling
    /*swipedetect(document.getElementById('mainCalendar'), function(swipedir) {
        if (swipedir === "left") {
            $("#renderRange").next().trigger("click");
        } else if (swipedir === "right") {
            $("#renderRange").prev().trigger("click");
        }
    });*/

    //mobile horizontal scroll handling end
	/*
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
    $(".addManager").on("touch click", function() {
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
    }).one("touch click", initLnbManagerForm);*/
    
    $("#mainCalendarRange").on("touch click", function(){
      $("#mainCalendarCarousel, #mainCalendarCalendar").toggle();
      $("#mainCalendar").toggleClass('pushedDown');
      if($("#mainCalendarCalendar").is(":visible")){
        if(!$("#mainCalendarRangeInput1")[0]._flatpickr){
          flatpickr("#mainCalendarRangeInput1", {
              dateFormat: "Ymd",
              locale: "ko",
              disableMobile:true,
              appendTo:$(".mainCalendarCalendarMonth[data-index='1']")[0],
              clickOpens:false,
              onChange:onChangeMainCalendar('#mainCalendarRangeInput1')
          });
          flatpickr("#mainCalendarRangeInput2", {
              dateFormat: "Ymd",
              locale: "ko",
              defaultDate:NMNS.calendar.getDate().toDate(),
              disableMobile:true,
              appendTo:$(".mainCalendarCalendarMonth[data-index='2']")[0],
              clickOpens:false,
              onChange:onChangeMainCalendar('#mainCalendarRangeInput2')
          });
          flatpickr("#mainCalendarRangeInput3", {
              dateFormat: "Ymd",
              locale: "ko",
              disableMobile:true,
              appendTo:$(".mainCalendarCalendarMonth[data-index='3']")[0],
              clickOpens:false,
              onChange:onChangeMainCalendar('#mainCalendarRangeInput3')
          });
          NMNS.siemaCalendar = new Siema({
            selector: '#mainCalendarCalendar',
            duration: 200,
            easing: 'ease-out',
            perPage: 1,
            startIndex: 1,
            draggable: true,
            multipleDrag: false,
            threshold: 20,
            loop: true,
            rtl: false,
            onChange: onChangeCalendarCarousel
          });
          document.getElementById('mainCalendarRangeInput1')._flatpickr.jumpToDate(moment(NMNS.calendar.getDate().toDate()).add(-1, 'month').toDate());
          document.getElementById('mainCalendarRangeInput3')._flatpickr.jumpToDate(moment(NMNS.calendar.getDate().toDate()).add(1, 'month').toDate());
        }else{
          document.getElementById('mainCalendarRangeInput' + (NMNS.siemaCalendar.currentSlide + 1))._flatpickr.setDate(NMNS.calendar.getDate().toDate());
        }
      }
      setRenderRangeText();
    });
    
    /*$(".mfb-component__button--child").off("touch click").on("touch click", function(e) {
        e.preventDefault();
        document.getElementById("floatingButton").setAttribute("data-mfb-state", "closed");
    });*/
    
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
        var action = $("#customerSortTypeMenu").data("action");
        if(!document.getElementById('customerStyle')){
          var style = document.createElement('link');
          style.rel="stylesheet";
          style.href="/nmns/css/customer.mobile.min.css"
          style.id = 'customerStyle';
          document.head.appendChild(style);
        }
        if (!document.getElementById("customerScript")) {
          var script = document.createElement("script");
          script.src = "/nmns/js/customer.mobile.min.js";
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
        style.href="/nmns/css/menu.mobile.min.css";
        style.id = 'menuStyle';
        document.head.appendChild(style);
      }
      if (!document.getElementById("menuScript")) {
        var script = document.createElement("script");
        script.src = "/nmns/js/menu.mobile.min.js";
        script.id = "menuScript";
        document.body.appendChild(script);

        script.onload = function() {
          NMNS.socket.emit("get menu list", null);
        };
      }
      $(this).on("touch click", function(){//메뉴 초기화
        NMNS.socket.emit("get menu list", null);
      });
    });
    $(".salesMenuLink").one("touch click", function(){
      if(!document.getElementById('salesStyle')){
        var style = document.createElement('link');
        style.rel="stylesheet";
        style.href="/nmns/css/sales.mobile.min.css";
        style.id = 'salesStyle';
        document.head.appendChild(style);
      }
      if (!document.getElementById("salesScript")) {//최초 접속
        var script = document.createElement("script");
        script.src = "/nmns/js/sales.mobile.min.js";
        script.id = "salesScript";
        document.body.appendChild(script);

        script.onload = function() {
          $("#salesSearchButton").removeClass('disabled')
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
                return suggestion.value + ' (' + dashContact(suggestion.data) + ')';
            },
            onSearchError: function() {},
            onSelect: function(suggestion) {
                $('#scheduleContact').val(suggestion.data).trigger('blur');
            }
        }, NMNS.socket);
        
        $("#salesSearchStartDate").val(moment().startOf('month').format('YYYY. MM. DD'));
        $("#salesSearchEndDate").val(moment().format('YYYY. MM. DD'));
        flatpickr("#salesCalendar", {
          dateFormat: "Y. m. d",
          defaultDate: [moment().startOf('month').toDate(), new Date()],
          mode:'range',
          disableMobile: true,
          appendTo:document.getElementById('salesCalendarArea'),
          locale: "ko",
          onChange:function(selectedDates, dateStr, instance){
            if(selectedDates.length === 2){
              $("#salesCalendarModal").modal('hide');
            }
          }
        });
        var now = moment();
        $("#mainSalesSearch .activable").each(function(index, button){
          button.innerHTML = '<span class="montserrat">'+now.format('M')+'</span>월';
          now.add(-1, 'month');
        });
        $("#salesSearchManagerList").html(generateTaskManagerList(true)).off("touch click", "button").on("touch click", "button", function() {
          $("#salesSearchManager").data("calendar-id", $(this).data("calendar-id")).data("color", $(this).data("color")).html($(this).html());
        });
      }else{
        $(".salesMenu .menuTitle").removeClass('fixedScroll');
        $(".salesSearchSwitch").hide();
        $("#mainSalesSearch").show();
      }
    });
    
    function switchMenu(e, isHistory){
      if(e && e.preventDefault){
        e.preventDefault();
      }
      if(!$(this).hasClass("menuLinkActive")){
				$(".modal-backdrop.show").remove();
				$(document.body).removeClass('modal-open');
        $(".switchingMenu:not(."+$(this).data('link')+")").hide();
        if($("."+$(this).data('link')).show().hasClass('salesMenu')){
            $("#mainRow").addClass('fixedScroll');
        }else{
            $("#mainRow").removeClass('fixedScroll');
        }
        $(".menuLinkActive").removeClass("menuLinkActive");
        $(this).addClass("menuLinkActive");
        // hide mainTask field
        $("#mainTask").removeClass("show");
        $(".calendarMenu").removeClass('fixedScroll');
        document.scrollingElement.scrollTop = 0;
        $("#mainAside").removeClass('sidebar-toggled');
        if(!isHistory){
          history.pushState({link:$(this).data('link'), type:$(this).data('type'), title:$(this).data('title')}, "", $(this).data('history'));
        }
				if(!$(this).data('type') === 'detail'){// 뒤로가기 제거
					$("#detailMenuTitle").hide().prev().show();
					$("#exitDetailMenu").hide().prev().show();
				}else{
				  $("#detailMenuTitle").html($(this).data('title')).show().prev().hide();
			    $(".announcementMenuLink").hide().next().show();
				}
      }
    }
    NMNS.switchMenu = switchMenu;
    
    //menu switch end
    //set event listeners
    (function() {
        $('.moveDate').on('touch click', onClickNavi); //prev, next
        // $('.calendarType').on('touch click', onClickMenu); //calendar type
        /*$("#calendarTypeMenu").next().children("a").on("touch click", function(e) { //calendar type on mobile
            e.preventDefault();
            var target = $(e.target);
            if (!target.hasClass("dropdown-item")) {
                target = target.parents(".dropdown-item");
            }
            $("#calendarTypeMenu").html(target.html());
            $("#calendarTypeMenu").attr("data-action", target.data("action"));
            $("#calendarTypeMenu").trigger("click");
        });*/
        $('#lnbManagerList').on('change', onChangeManagers);// toggle schedules of manager

        $(".addNoShowLink").one("touch click", initNoShowModal);
        window.addEventListener('resize', debounce(function(){NMNS.calendar.render()}, 200));
        flatpickr.localize("ko");
        
        $(".taskMenu").on("touch click", onClickTask);// toggle task column
        $('#sidebarToggler').on('touch click', function(){// toggle side menu
          $('#mainAside').addClass('sidebar-toggled');
					$(document.body).addClass('modal-open').append($('<div class="modal-backdrop fade show" style="z-index:2"></div>').on("touch click", function(e){
						e.preventDefault();
						e.stopPropagation();
						$(this).remove();
						$(document.body).removeClass('modal-open');
						$("#mainAside").removeClass('sidebar-toggled')
					}));
        });
        // $(".announcementMenuLink").popover({
        //   template:
        //     '<div id="announcementPopover" class="popover bg-transparent" role="tooltip" style="display:flex;width:831px;padding-right:91px;box-shadow:none"><div class="arrow"></div>\
        //       <div class="col px-0 d-none"><div id="announcementArea" class="col px-0 mr-2"></div></div>\
        //       <div class="col px-0">\
        //         <div id="notificationArea" class="col px-0 ml-2">\
        //           <div class="d-flex align-items-center" style="padding:25px 30px;border-bottom:1px solid rgba(58, 54, 54, 0.35)">\
        //             <span style="font-size:18px;font-weight:bold">알림</span><span class="close-button ml-auto cursor-pointer">&times;</span></div>\
        //           <div id="notificationBody"><div class="flex-column m-auto text-center py-5"><div class="bouncingLoader"><div></div><div></div><div></div></div><span>새로운 알림을 불러오는 중입니다...</span></div></div>\
        //           <div id="notificationEmpty">아직 알림 내역이 없어요.<br>예약 등록 내역, 예약 취소 내역이 보여집니다.</div>\
        //         </div>\
        //       </div>\
        //     </div>',
        //   html:true,
        //   sanitize:false,
        //   placement:'auto'
        // })
        // $("#mainMenu").popover({
        //   template:'<div class="popover" role="tooltip"><div class="arrow"></div><div><ul style="padding: 25px 30px;margin:0"><li class="mainMenuRow"><a class="d-block" data-link="#infoModal" data-toggle="modal" href="#" aria-label="내 매장 정보">내 매장 정보</a></li><li class="mainMenuRow"><a class="d-block" data-link="#alrimModal" data-toggle="modal" href="#" aria-label="알림톡 정보">알림톡 정보</a></li><li class="mainMenuRow"><a class="d-block" data-link="#userModal" data-toggle="modal" href="#" aria-label="내 계정 정보">내 계정 정보</a></li><li class="mainMenuRow"><a id="signoutLink" class="d-block" href="/signout" aria-label="로그아웃">로그아웃</a></li></ul></div></div>',
        //   html:true,
        //   sanitize:false,
        //   placement:'bottom'
        // })
        $("#searchNoShow").on("keyup", function(e){
          if(e.keyCode === 13 || e.which === 13){
            if($(this).val().length === 11 || $(this).val().length === 10){
              // switchMenu.apply(this, e);
              if(!$(".calendarMenuLink").hasClass("menuLinkActive")){
                $(".switchingMenu:not(.calendarMenu)").hide();
                $("#mainRow").removeClass('fixedScroll');
                $(".menuLinkActive").removeClass("menuLinkActive");
                $(".calendarMenuLink").addClass("menuLinkActive");
                // hide mainTask field
                $("#mainTask").removeClass("show");
              }
              $(".calendarMenu").removeClass('fixedScroll');
              $("#mainSearchNoShow").prev().hide().prev().hide();
              $("#mainSearchNoShow").show();
              document.scrollingElement.scrollTop = 0;
              $("#mainAside").removeClass('sidebar-toggled');
              if(location.pathname !== '/search'){
                history.pushState({link:'calendarMenu', subLink:'search'}, "", 'search');
              }
              NMNS.socket.emit("get noshow", {contact:$(this).val(), mine:false});
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
            var faqs = [{title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}, {title:'일정 추가는 어디서 하나요?', contents:'일정 추가는 예약/일정 관리 화면에서 하실 수 있습니다!'}]
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
        // $("#sidebarContainer").data('scroll', new PerfectScrollbar("#sidebarContainer"));
        $("input[pattern]").each(function(index, input){
          setNumericInput(input);
        })
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
    }
    if(link === 'salesMenu'){
      if(state.state.subLink === 'search'){//result page
        $(".salesMenu .menuTitle").addClass('fixedScroll');
        $("#mainSalesSearch").hide();
        $(".salesSearchSwitch").show();
      }else{//search page
        $(".salesMenu .menuTitle").removeClass('fixedScroll');
        $(".salesSearchSwitch").hide();
        $("#mainSalesSearch").show();
      }
    }else if(link === 'calendarMenu'){
      if(state.state && state.state.subLink === 'search'){//search result
        $("#mainSearchNoShow").prev().hide().prev().hide();
        $("#mainSearchNoShow").show();
      }else{//calendar mode
        $("#mainSearchNoShow").hide().prev().show().prev().show();
      }
    }
    if(!state.state || state.state.type !== 'detail'){// 뒤로가기 제거
			$("#detailMenuTitle").hide().prev().show();
			$("#exitDetailMenu").hide().prev().show();
		}else{
		  $("#detailMenuTitle").html(state.state.title).show().prev().hide();
	    $(".announcementMenuLink").hide().next().show();
		}
  }
  $(document).on("scroll", function(){
    if($("#mainCalendar").is(":visible")){
      if(document.scrollingElement.scrollTop > document.getElementById('mainSearchArea').offsetHeight){
        $(".calendarMenu").addClass('fixedScroll');
      }else{
        $(".calendarMenu").removeClass('fixedScroll');
      }
    }
  }).on("scroll", debounce(function(){
		if($("#announcementArea").is(":visible")){
			var distance = Math.max(0, $("#announcementArea")[0].scrollHeight - $("#announcementArea").scrollTop() - $("#announcementArea").innerHeight());
			if(NMNS.expectMoreAnnouncement && distance < Math.max(100, $("#announcementArea").innerHeight() * 0.2)){
				NMNS.socket.emit('get announcement', {page:++NMNS.announcementPage, combined:true})
			}
		}
	}, 100));
})(jQuery);