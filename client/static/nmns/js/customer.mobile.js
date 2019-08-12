/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, generateRandom */
(function() {
  $("#mainContents").append('<div id="customerDetailMenu" class="switchingMenu customerDetailMenu">\
    <div class="d-flex horizontalTab">\
      <div class="row col-12">\
        <ul id="customerTabList" class="nav nav-pills nowrap" role="tabList" style="display:inline-flex !important;height:51px;padding-right:20px">\
          <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0 active" href="#customerInfo" data-toggle="tab" aria-selected="true" aria-label="고객 정보">고객 정보</a></li>\
          <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerSchedule" data-toggle="tab" aria-label="예약 내역">예약 내역</a></li>\
          <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerAlrim" data-toggle="tab" aria-label="알림톡 내역">알림톡 내역</a></li>\
          <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerMembership" data-toggle="tab" aria-label="멤버십 금액 내역">멤버십 금액 내역</a></li>\
        </ul>\
      </div>\
    </div>\
    <div class="menuContents px-3">\
      <div class="row mx-0 col-12 tab-content p-0">\
              \
        <div id="customerInfo" class="tab-pane col-12 px-0 fade show active" role="tabpanel" style="font-size:15px;padding-top:35px">\
          <div class="row mx-0 hasBottomArea">\
            <div id="customerNoShow" class="col-12 px-0" style="margin-bottom:35px">총 <span id="customerNoShowCount" class="montserrat text-accent ml-1" style="font-weight:500">0</span>건의 노쇼 이력이 있는 고객님이에요.</div>\
            <div>고객 이름</div>\
            <input type="text" class="form-control form-control-sm mt-3" id="customerName" placeholder="고객 이름을 입력해주세요." style="margin-bottom:35px">\
            <div>고객 연락처</div>\
            <input type="tel" class="form-control form-control-sm mt-3 montserrat" id="customerContact" placeholder="고객 연락처를 입력해주세요." style="margin-bottom:35px">\
            <div>담당자</div>\
            <div class="col-12 px-0" style="margin-bottom:35px">\
              <button id="customerManager" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-sm dropdown-toggle btn-flat form-control form-control-sm text-left mt-3" aria-label="담당자">\
                <span>선택</span>\
              </button>\
              <div class="dropdown-menu" aria-labelledby="customerManager" role="menu" id="customerManagerList" style="right:0"></div>\
            </div>\
            <div>고객메모</div>\
            <div class="col-12 px-0" style="margin-bottom:35px"><input type="text" id="customerEtc" class="form-control form-control-sm mt-3" placeholder="고객 메모를 입력해주세요."></div>\
            <div class="d-flex col-12 px-0">\
              <div class="customerTitle">멤버십 잔액</div>\
              <div class="ml-auto"><span id="customerBalanceMembership" class="montserrat mr-1">0</span>원</div>\
            </div>\
            <div class="d-flex col-12 px-0" style="margin-bottom:20px">\
              <div class="customerTitle">총 매출액</div>\
              <div class="ml-auto"><span id="customerTotalSales" class="montserrat mr-1">0</span>원</div>\
            </div>\
          </div>\
          <div class="bottomButtonArea">\
            <button type="button" class="btn btn-white col mr-1" id="deleteCustomer">고객삭제</button>\
            <button id="customerBtn" type="button" class="btn btn-accent col ml-1">저장</button>\
          </div>\
        </div>\
        \
        <div id="customerSchedule" class="tab-pane col-12 px-0 fade" role="tabpanel" style="padding-top:20px">\
          <div id="customerScheduleNotEmpty" class="row mx-0 flex-column">\
            <div class="col-12 position-relative">\
              <button id="customerScheduleSortTypeMenu" type="button" class="btn btn-flat dropdown-toggle ml-auto d-flex pr-0" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="예약 내역 정렬하기" data-action="sort-date">날짜</button>\
              <div class="dropdown-menu dropdown-menu-right text-center" aria-labelledby="customerScheduleSortTypeMenu">\
                <a class="customerScheduleSortType dropdown-item active" href="#" data-action="sort-date" aria-label="날짜">날짜</a>\
                <a class="customerScheduleSortType dropdown-item" href="#" data-action="sort-manager" aria-label="담당">담당</a>\
                <a class="customerScheduleSortType dropdown-item" href="#" data-action="sort-sales" aria-label="매출액">매출액</a>\
                <a class="customerScheduleSortType dropdown-item" href="#" data-action="sort-status" aria-label="예약 상태">예약 상태</a>\
              </div>\
            </div>\
            <div class="row mx-0 col-12 px-0" id="customerScheduleList"></div>\
          </div>\
          <div id="customerScheduleEmpty" style="display:none;margin-top:-35px">예약 내역이 없어요.</div>\
        </div>\
        \
        <div id="customerAlrim" class="tab-pane col-12 px-0 fade" role="tabpanel" style="padding:20px 0">\
          <div id="customerAlrimNotEmpty" class="row mx-0 flex-column">\
            <div id="customerAlrimList" class="row"></div>\
          </div>\
          <div id="customerAlrimLoading" class="flex-column">\
            <div class="bouncingLoader">\
              <div></div>\
              <div></div>\
              <div></div>\
            </div> \
            <span>알림톡 내역을 불러오는 중입니다...</span>\
          </div>\
          <div id="customerAlrimEmpty" style="display:none">알림톡 내역이 없어요.</div>\
        </div>\
        \
        <div id="customerMembership" class="tab-pane col-12 px-0 fade" role="tabpanel">\
          <div class="row mx-0" id="customerMembershipList"></div>\
          <div id="customerMembershipEmpty" style="text-align:center;padding:30px;display:none">멤버십 내역이 없어요.</div>\
          <div id="customerMembershipLoading" class="flex-column text-center">\
            <div class="bouncingLoader">\
              <div></div>\
              <div></div>\
              <div></div>\
            </div> \
            <span>멤버십 내역을 불러오는 중입니다...</span>\
          </div>\
        </div>\
        \
      </div>\
    </div>\
  </div>');
  Inputmask("999-999[9]-9999",{showMaskOnFocus:false, showMaskOnHover:false, autoUnmask:true, placeholder:""}).mask("#customerContact");
  
  function generateCustomerMembershipRow(init, goal){
    var memberships = $("#customerMembershipList").data('item');
    var item;
    var html = "";
    for(var index=init; index<goal; index++){
        item = memberships[index];
        html += '<div class="customerMembership row col-12" data-index="'+index+'">'+
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">날짜</div>' + 
          '<div class="col pr-0 montserrat" title="'+moment(item.date, 'YYYYMMDD').format('YYYY. MM. DD')+'">' + moment(item.date, 'YYYYMMDD').format('YYYY. MM. DD') + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">예약내용</div>' + 
          '<div class="col pr-0" title="'+item.item+'">'+(item.item || '') + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">증/감</div>' + 
          '<div class="col pr-0 montserrat">'+((item.type === 'MEMBERSHIP_INCREMENT' || item.type === 'MEMBERSHIP_ADD')? '+ ' : '- ') + ((item.membershipChange || '') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">잔액</div>' + 
          '<div class="col pr-0 montserrat">'+((item.balanceMembership || '') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</div></div>' +
          '</div>';
    }
    return html;
  }

  function drawCustomerMembershipList(refresh) {
    var list = $("#customerMembershipList"), memberships = list.data('item'), current = list.data('index');
    var html = "";
    var goalIndex;
		if(refresh || !current){
			current = 0;
		}
    if(memberships && refresh){//from 0 to current customer count
      $("#customerMembershipLoading").hide();
      list.children().remove();
      if (memberships.length > 0) {
          goalIndex = Math.min(current === 0? current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerMembership").length)) : current, memberships.length);
          html = generateCustomerMembershipRow(0, goalIndex);
      } else {
          $("#customerMembershipList").hide();
          $("#customerMembershipEmpty").show();
          return;
      }
    }else if(memberships){//additional loading
      goalIndex = Math.min(current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerMembership").length)), memberships.length);//최대 20개씩 신규로 로딩
      html = generateCustomerMembershipRow(current, goalIndex);
    }else{
      $("#customerMembershipList").hide();
      $("#customerMembershipEmpty").show();
      return;
    }
    list.data('index', goalIndex).append(html);
    
    $("#customerMembershipEmpty").hide();
    $("#customerMembershipList").show();
  }

  function generateCustomerAlrimRow(init, goal){
    var alrims = $("#customerAlrimList").data('item');
    var item;
    var html = "";
    for(var index=init; index<goal; index++){
        item = alrims[index];
        html += '<div class="customerAlrim col-12 montserrat" title="눌러서 전송된 알림톡 내용 보기"><a href="#customerAlrimDetail' + index + '" class="customerAlrimDetailLink collapsed" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="customerAlrimDetail' + (index) 
              + '"></a>' + moment(item.date, 'YYYYMMDDHHmm').format('YYYY. MM. DD HH:mm') + '</div>'+
              '<div class="row customerAlrimDetail collapse mx-0 col-12" id="customerAlrimDetail' + index + '"><div>'+(item.contents?item.contents.replace(/\n/g, "<br>"):'')+'</div></div>';
    }
    return html;
  }

  function drawCustomerAlrimList(refresh) {
    var list = $("#customerAlrimList"), alrims = list.data('item'), current = list.data('index');
    var html = "";
    var goalIndex;
    if(alrims && refresh){//from 0 to current customer count
      $("#customerAlrimLoading").hide();
      list.children().remove();
      if (alrims.length > 0) {
          goalIndex = Math.min(current === 0? current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerAlrim").length)) : current, alrims.length);
          html = generateCustomerAlrimRow(0, goalIndex);
      } else {
          $("#customerAlrimNotEmpty").hide();
          $("#customerAlrimEmpty").show();
          return;
      }
    }else if(alrims){//additional loading
      goalIndex = Math.min(current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerAlrim").length)), alrims.length);//최대 20개씩 신규로 로딩
      html = generateCustomerAlrimRow(current, goalIndex);
    }else{
      $("#customerAlrimNotEmpty").hide();
      $("#customerAlrimEmpty").show();
      return;
    }
		html = $(html).on("touch click", ".customerAlrimDetailLink", function(e){
			e.preventDefault();
			/*if(e.target.getAttribute('aria-expanded') === 'false'){
				(document.scrollingElement || document.documentElement).scrollTop = $(e.target).offset().top - ( $("#customerAlrimList").height() - $(e.target).outerHeight(true) ) / 2;	
			}*/
		});
    list.data('index', goalIndex).append(html).on("touch click", ".customerAlrimDetailLink", function(){
      $(this).parent().toggleClass('active');
    });
    
    $("#customerAlrimEmpty").hide();
    $("#customerAlrimNotEmpty").show();
  }

  function generateCustomerScheduleRow(init, goal){
    var managers = NMNS.calendar.getCalendars();
    var manager, item;
    var schedules = $("#customerScheduleList").data('item');
    var html = "", contents, date;
    for(var index=init; index<goal; index++){
        item = schedules[index];
        manager = managers.find(function(itema) { return itema.id === item.managerId; });
        if(!manager){
            manager = {
                color:'#334150',
                name:'(삭제된 담당자)'
            }
        }
        try{
          contents = JSON.parse(item.contents).map(function(item){return item.value}).join(', ');
        }catch(error){
          contents = item.contents;
        }
        date = moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD HH:mm') + (item.end?moment(item.end, 'YYYYMMDDHHmm').format(moment(item.start, 'YYYYMMDDHHmm').isSame(moment(item.end, 'YYYYMMDDHHmm'), 'day')?' - HH:mm':' - YYYY. MM. DD HH:mm'):'');
        html += '<div class="customerSchedule row col-12" data-index="'+index+'">'+
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">날짜</div>' + 
          '<div class="col pr-0 montserrat" title="'+date+'">' + date + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">담당</div>' + 
          '<div class="col pr-0" title="'+manager.name+'"><span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'"></span>'+manager.name+'</div></div>'+
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">예약내용</div>' + 
          '<div class="col pr-0">'+(contents || '') + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">매출액</div>' + 
          '<div class="col pr-0 montserrat">'+(item.price ? (item.price+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '-') + '</div></div>' +
          '<div class="d-flex col-12 px-0 mb-1"><div class="customerDetailTitle">예약상태</div>' + 
          '<div class="col pr-0">'+(item.status == 'NOSHOW'? '노쇼' : (item.status === 'CANCELED' || item.status === 'CUSTOMERCANCELED' ? '취소' : '정상')) + '</div></div>' +
          '</div>';
    }
    return html;
  }

  function drawCustomerScheduleList(refresh) {
    var list = $("#customerScheduleList"), schedules = list.data('item'), current = list.data('index');
    var html = "";
    var goalIndex;
    if(schedules && refresh){//from 0 to current customer count
        list.children().remove();
        if (schedules.length > 0) {
            goalIndex = Math.min(current === 0? current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerSchedule").length)) : current, schedules.length);
            html = generateCustomerScheduleRow(0, goalIndex);
        } else {
            $("#customerScheduleNotEmpty").hide();
            $("#customerScheduleEmpty").show();
            return;
        }
    }else if(schedules){//additional loading
        goalIndex = Math.min(current + Math.max(20, (5 + Math.ceil(list.height() / 48) - list.find(".customerSchedule").length)), schedules.length);//최대 20개씩 신규로 로딩
        html = generateCustomerScheduleRow(current, goalIndex);
    }else{
      $("#customerScheduleNotEmpty").hide();
      $("#customerScheduleEmpty").show();
      return;
    }
    list.data('index', goalIndex).append(html);
    
    $("#customerScheduleEmpty").hide();
    $("#customerScheduleNotEmpty").show();
  }

  function refreshCustomerModal(self) {
    if(self){
      var customer = NMNS.customerList[Number(self.parent().data("index"))];
      $("#customerName").val(customer.name);
      $("#customerContact").val(customer.contact);
      $("#customerEtc").val(customer.etc);
      if (customer.totalNoShow === 0) {
        $("#customerNoShow").hide();
      } else {
        $("#customerNoShowCount").text(customer.totalNoShow).parent().show();
      }
      $("#customerBalanceMembership").text((customer.pointMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
      $("#customerTotalSales").text(((customer.cardSales + customer.cashSales)+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
      var manager = NMNS.calendar.getCalendars().find(function(itema) { return itema.id === customer.managerId; });
      if(!manager){
        manager = {
          color:'#334150',
          name:'(삭제된 담당자)'
        };
      }
      $("#customerManager").data("calendar-id", manager.id).data("color", manager.color)
        .html(manager.id?$("#customerManagerList button[data-calendar-id='"+manager.id+"']").html():'<span class="tui-full-calendar-icon tui-full-calendar-calendar-dot mr-3" style="background-color: #334150"></span><span class="tui-full-calendar-content">(삭제된 담당자)</span>');
      $(".addCustomerScheduleBtn").show();
      $("#customerTabList a[href='#customerInfo']").text('고객 상세').tab('show');
      $("#customerDetailMenu").data("customer", customer);
    }
  }

  var currentCustomerCount = 0;
  
  function generateCustomerRow(init, goal){
      var managers = NMNS.calendar.getCalendars();
      var manager, item;
      var html = "";
      for(var index=init; index<goal; index++){
          item = NMNS.customerList[index];
          manager = managers.find(function(itema) { return itema.id === item.managerId; });
          if(!manager){
              manager = {
                  color:'#334150',
                  name:'(삭제된 담당자)'
              }
          }
          html += '<div class="customer col-12" data-index="'+index+'"><div class="col-12 px-0 position-relative d-flex align-items-center">' + 
              '<div class="font-weight-bold" style="font-size:14px">'+(!item.name || item.name === '' ? '(이름없음)' : item.name) + '</div>' + 
              (!item.contact || item.contact === '' ? '' : ('<span class="divider" style="display:inline-table">&nbsp;</span><div class="montserrat">'+dashContact(item.contact, '.') + '</div>')) +
              '<span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'" title="'+manager.name+'"></span></div>'+
              '<div class="col-6 px-0 d-flex"><div class="col-4 px-0 customerSubHead">방문</div><div class="col-8 pr-0"><span class="montserrat">'+(!item.history? '0' : item.history.length) + '</span>회</div></div>' +
              '<div class="col-6 px-0 d-flex"><div class="col-5 px-0 customerSubHead">마지막 방문</div><div class="col-7 pr-0 montserrat">'+(item.history && item.history.length > 0 ? moment(item.history[0].start, "YYYYMMDDHHmm").format("YYYY. MM. DD") : '-') + '</div></div>' +
              '<div class="col-6 px-0 d-flex"><div class="col-4 px-0 customerSubHead">매출액</div><div class="col-8 pr-0 montserrat">'+((item.cardSales + item.cashSales) ? ((item.cardSales + item.cashSales)+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"): '-') + '</div></div>' +
              '<div class="col-6 px-0 d-flex"><div class="col-5 px-0 customerSubHead">멤버십 잔액</div><div class="col-7 pr-0 montserrat">'+(item.pointMembership ? (item.pointMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '-') + '</div></div>' +
              (item.etc && item.etc !== ''?('<hr/><div class="col-12 px-0 customerSubHead">'+item.etc+'</div>'):'')+
              '<a class="customerModalLink" href="#" title="상세보기"></a>'+
              '</div>'
      }
      return html;
  }
	
	function checkExit(){
		var changed = false;
		var customer = $("#customerDetailMenu").data("customer");
		if($("#customerName").val() !== (customer.name || '')){
			changed = true;
		}
		if(!changed && $("#customerContact").val().replace(/-/gi, '') !== (customer.contact || '')){
			changed = true;
		}
		if(!changed && $("#customerManager").data('calendar-id') !== customer.managerId){
			changed = true;
		}
		if(!changed && $("#customerEtc").val() !== (customer.etc || '')){
			changed = true;
		}
		return changed ? confirm('변경된 내용이 있습니다. 창을 닫으면 저장되지 않은 내용은 사라집니다.') : true;
	}
	
  function drawCustomerList(refresh) {
      var list = $("#mainCustomerList");
      var html = "";
      var goalIndex;
      if(NMNS.customerList && refresh){//from 0 to current customer count
          list.children(":not(.ps)").remove();
          if (NMNS.customerList && NMNS.customerList.length > 0) {
              goalIndex = Math.min(currentCustomerCount === 0? currentCustomerCount + Math.max(20, (5 + Math.ceil($('#mainCustomerList').height() / 48) - $("#mainCustomerList .customer").length)) : currentCustomerCount, NMNS.customerList.length);
              html += generateCustomerRow(0, goalIndex)
          } else {
              html += "<p class='m-auto'>아직 등록된 고객이 없습니다.<br>새로운 고객을 등록하여 방문 및 매출내역을<br>기록, 관리해보세요!</p>";
          }
      }else if(NMNS.customerList){//additional loading
          goalIndex = Math.min(currentCustomerCount + Math.max(20, (5 + Math.ceil($('#mainCustomerList').height() / 48) - $("#mainCustomerList .customer").length)), NMNS.customerList.length);//최대 20개씩 신규로 로딩
          html += generateCustomerRow(currentCustomerCount, goalIndex)
      }
      currentCustomerCount = goalIndex;
      $("#customerCount").text(NMNS.customerList.length);
      list.append(html);
      
      list.find(".customerModalLink").off("touch click").on("touch click", function(e) {
          e.preventDefault();
          refreshCustomerModal($(this));
          NMNS.switchMenu.call($(".customerDetailLink"), e);
					$("#exitDetailMenu").data('trigger', checkExit);
      });
  }
  NMNS.socket.on("get customer list", socketResponse("고객 조회", function(e) {
      NMNS.customerList = e.data;
      if (e.data && e.data.length > 0) {
          var managers = NMNS.calendar.getCalendars();
          e.data.forEach(function(item) {
              item.manager = managers[managers.findIndex(function(manager) { return manager.id === item.managerId; })];
          });
      }
      currentCustomerCount = 0;
      drawCustomerList(true);
  }));
  NMNS.socket.on("update customer", socketResponse("고객정보 수정", function(e) {
      var index = NMNS.customerList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          var customer = NMNS.customerList[index];
          customer.name = $("#customerName").val();
          customer.contact = $("#customerContact").val().replace(/-/gi, '');
          customer.etc = $("#customerEtc").val();
          customer.managerId = $("#customerManager").data("calendar-id");
          var managers = NMNS.calendar.getCalendars();
          customer.manager = managers[managers.findIndex(function(manager) { return manager.id === customer.managerId; })];
          showSnackBar("<span>고객의 정보를 수정하였습니다.</span>");
          drawCustomerList(true);
      }
  }, function(e) {
      if (e.data.reason === "DUPLICATED") {
          if (confirm("이미 같은 이름과 연락처를 가진 고객이 존재합니다.\n그 고객쪽으로 모든 정보 및 예약, 알림톡 내역을 합칠까요?")) {
              NMNS.socket.emit("merge customer", {
                  id: e.data.id,
                  name: $("#customerName").val(),
                  contact: $("#customerContact").val().replace(/-/gi, ''),
                  etc: $("#customerEtc").val(),
                  managerId: $("#customerManager").data("calendar-id")
              });
              return;
          }
      } else {
          alert("고객정보 수정에 실패하였습니다." + (e.message ? "(" + e.message + ")" : ""));
      }
      var index = NMNS.customerList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          $("#customerName").val(NMNS.customerList[index].name);
          $("#customerContact").val(NMNS.customerList[index].contact);
          $("#customerEtc").val(NMNS.customerList[index].etc);
      }
  }, true));
  NMNS.socket.on("get customer alrim", socketResponse("알림톡 내역 조회", function(e) {
    //e.data = [{date:'20190101123059', contents: '알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}, {date:'20190201123059', contents: '알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}, {date:'20190301123059', contents: '1123123알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.알림톡내용입니다.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}]// for test
    $("#customerAlrimList").data('index', 0).data('item', e.data);
    drawCustomerAlrimList(true);
  }));
  NMNS.socket.on("delete customer", socketResponse("고객 삭제", function(e) {
      NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
  }, function(e) {
      var origin = NMNS.history.find(function(history) { return (history.id === e.data.id); });
      NMNS.history.remove(e.data.id, function(item, target) { return (item.id === target); });
      NMNS.customerList.splice(origin.index, 0, origin);
      drawCustomerList(true);
  }));
  NMNS.socket.on("merge customer", socketResponse("고객정보 합치기", function() {
      NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": $($(".customerSortType.active")[0]).data("action") });
      showSnackBar("<span>두 고객의 정보와 예약, 알림톡 내역을 합쳤습니다.</span>");
      history.back();
  }, function() {
      NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": $($(".customerSortType.active")[0]).data("action") });
      history.back();
  }));
  NMNS.socket.on("get membership history", socketResponse('멤버십 내역 조회', function(e){
    //e.data = [{date:'20190101123050', item:'예약내용입니다 예약내용입니다.', balanceMembership:10000, type:'MEMBERSHIP_ADD', membershipChange: 1000}, {date:'20190103123050', item:'예약내용입니다 예약내용입니다.', balanceMembership:10000, type:'MEMBERSHIP_DECREMENT', membershipChange: 1000}]//for test
    $("#customerMembershipList").data('index', 0).data('item', e.data);
    drawCustomerMembershipList(true);
  })).on("add membership", socketResponse("멤버십 내역 변경", function(e){
    $("#customerMembershipList .customerMembership[data-id='"+e.data.id+"'] .balanceMembership").text(((e.data.balanceMembership || '') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
  }, function(e){
    var list = $("#customerMembershipList").data('item')
    list.splice(list.findIndex(function(item){
      return item.id === e.data.id
    }), 1);
    drawCustomerMembershipList(true);
  }));
  
  $("#customerBtn").on("touch click", function(e) {
    e.preventDefault();
    if ($("#customerName").val() === '' && $("#customerContact").val().replace(/-/gi, '') === '') {
        alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
        return;
    }
    if($("#customerInfo input:invalid").length > 0){
      alert('입력하신 고객 정보를 확인해주세요.');
      return;
    }
    var customer = $("#customerDetailMenu").data("customer");
    if (customer) {
        NMNS.socket.emit("update customer", {
            id: customer.id,
            name: $("#customerName").val(),
            contact: $("#customerContact").val().replace(/-/gi, ''),
            etc: $("#customerEtc").val(),
            managerId: $("#customerManager").data("calendar-id")
        });
    }
    history.back();
  });
  $("#deleteCustomer").on("touch click", function(){
		if(confirm("고객을 삭제한 뒤에도 고객의 예약 및 매출내역은 유지됩니다.\n정말 이 고객을 삭제하시겠어요?")){
			var customer = $("#customerDetailMenu").data("customer");
			var index = 0;
			while(index < NMNS.customerList.length){
				if(NMNS.customerList[index].id === customer.id){
					break;
				}
				index++;
			}
			if(index >= NMNS.customerList.length){
				return;
			}
			NMNS.history.push($.extend({ "index": index }, customer));
			NMNS.socket.emit("delete customer", { "id": customer.id });
			NMNS.customerList.remove(customer.id, function(item, target) { return item.id === target });
			drawCustomerList(true);
			history.back();
		}
	});
  $("#customerTabList a[href='#customerAlrim']").on("show.bs.tab", function(){
    if($(this).data('id') !== $("#customerDetailMenu").data('customer').id){
      $(this).data('id', $("#customerDetailMenu").data('customer').id);
      $("#customerAlrimNotEmpty").hide();
      $("#customerAlrimEmpty").hide();
      $("#customerAlrimLoading").show();
      NMNS.socket.emit('get customer alrim', {id:$("#customerDetailMenu").data('customer').id});
    }
  }).one("show.bs.tab", function(){
    var isLoading = false;
    $("#customerAlrimList").on("scroll", debounce(function(){
      if(!isLoading && $(this).data('item') && $(this).data('index') < $(this).data('item').length && this.scrollHeight - this.scrollTop - this.offsetHeight < Math.max(100, this.getBoundingClientRect().height * 0.2)){
        isLoading = true;
        drawCustomerAlrimList();
        isLoading = false;
      }
    }, 200));
  });
  $("#customerTabList a[href='#customerSchedule']").on("show.bs.tab", function(){
    if($(this).data('id') !== $("#customerDetailMenu").data('customer').id){
      var customer = $("#customerDetailMenu").data('customer');
      $(this).data('id', customer.id);
      //customer.history = [{start:'20190101123059', end:'20190201123050', contents:'테스트 내용입니다.ㅎㅎ', manager:'aaa', status:'NOSHOW', sales:10000},{start:'20190103123059', end:'20190203123050', contents:'테스트 내용입니다.ㅎㅎㅎ', manager:'aaa', status:'RESERVED', sales:100000}]// for test
      if(!customer.history || customer.history.length === 0){
        $("#customerScheduleNotEmpty").hide();
        $("#customerScheduleEmpty").show();
      }else{
        $("#customerScheduleNotEmpty").show();
        $("#customerScheduleEmpty").hide();
        $("#customerScheduleList").data('index', 0).data('item', customer.history).html(drawCustomerScheduleList(true));
      }
    }
  }).one('show.bs.tab', function(){
    $("#customerScheduleSortTypeMenu").next().children("a").on("touch click", function(e) { //sort type
        e.preventDefault();
        var target = $(e.target);
        if (!target.hasClass("dropdown-item")) {
            target = target.parents(".dropdown-item");
        }
        if($("#customerScheduleSortTypeMenu").data('action') === target.data('action')){
          $("#customerScheduleList").data('item').reverse();
        }else{
          $("#customerScheduleSortTypeMenu").html(target.html()).data('action', target.data('action'));
          $("#customerScheduleList").data('item').sort(getSortFunc(target.data('action')));
          $(".customerScheduleSortType").removeClass("active");
          $(".customerScheduleSortType[data-action='" + target.data('action') + "']").addClass("active");
        }
        $("#customerScheduleList").data('index', 0);
        drawCustomerScheduleList(true);
    });
    var isLoading = false;
    $("#customerScheduleList").on("scroll", debounce(function(){
      if(!isLoading && $(this).data('item') && $(this).data('index') < $(this).data('item').length && this.scrollHeight - this.scrollTop - this.offsetHeight < Math.max(100, this.getBoundingClientRect().height * 0.2)){
        isLoading = true;
        drawCustomerScheduleList();
        isLoading = false;
      }
    }, 200));
  });
  $("#customerTabList a[href='#customerMembership']").on("show.bs.tab", function(){
    if($(this).data('id') !== $("#customerDetailMenu").data('customer').id){
      var id = $("#customerDetailMenu").data('customer').id;
      $(this).data('id', id);
      $("#customerMembershipList").hide();
      $("#customerMembershipEmpty").hide();
      $("#customerMembershipLoading").show();
      NMNS.socket.emit('get membership history', {customerId:id});
    }
  });

  function getSortFunc(action) {
      switch (action) {
          case 'sort-start':
              return function(a, b) {
                  if (!a.start) {
                      if (b.start) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.start) {
                      return -1;
                  }
                  return (a.start < b.start ? -1 : (a.start > b.start ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-date':
              return function(a, b) {
                  if (!a.history || a.history.length === 0) {
                      if (b.history && b.history.length > 0) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.history || b.history.length === 0) {
                      return -1;
                  }
                  return (a.history[0].start < b.history[0].start ? 1 : (a.history[0].start > b.history[0].start ? -1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-manager':
              return function(a, b) {
                  if (!a.manager) {
                      if (b.manager) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.manager) {
                      return -1;
                  }
                  return (a.manager.name < b.manager.name ? -1 : (a.manager.name > b.manager.name ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-sales':
              return function(a, b) {
                  if (!a.sales) {
                      if (b.sales) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.sales) {
                      return -1;
                  }
                  return ((a.sales*1) < (b.sales*1) ? -1 : ((a.sales*1) > (b.sales*1) ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-membership':
              return function(a, b) {
                  if (!a.membership) {
                      if (b.membership) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.membership) {
                      return -1;
                  }
                  return ((a.membership*1) < (b.membership*1) ? -1 : ((a.membership*1) > (b.membership*1) ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-visit':
              return function(a, b) {
                  if (!a.history || a.history.length === 0) {
                      if (b.history && b.history.length > 0) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.history || b.history.length === 0) {
                      return -1;
                  }
                  return (a.history.length < b.history.length ? -1 : (a.history.length > b.history.length ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-status':
              return function(a, b) {
                  if (!a.status) {
                      if (b.status) {
                          return 1;
                      } else {
                          return getSortFunc("sort-name")(a, b);
                      }
                  } else if (!b.status) {
                      return -1;
                  }
                  return (a.status < b.status ? -1 : (a.status > b.status ? 1 : getSortFunc("sort-name")(a, b)));
              };
          case 'sort-name':
          default:
              return function(a, b) {
                  if (!a.name) {
                      if (b.name) {
                          return 1;
                      } else {
                          return 0;
                      }
                  } else if (!b.name) {
                      return -1;
                  }
                  return (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
              };
      }
  }

  $("#customerSortTypeMenu").next().children("a").on("touch click", function(e) { //sort type
      e.preventDefault();
      var target = $(e.target);
      if (!target.hasClass("dropdown-item")) {
          target = target.parents(".dropdown-item");
      }
      if($("#customerSortTypeMenu").data('action') === target.data('action')){
          NMNS.customerList.reverse();
      }else{
        $("#customerSortTypeMenu").html(target.html()).data('action', target.data('action'));
        NMNS.customerList.sort(getSortFunc(target.data('action')));
      }
      currentCustomerCount = 0;
      drawCustomerList(true);
  });

  $("#searchCustomer").on("keyup", function(e) {
      if (e.which === 13) {
          NMNS.socket.emit("get customer list", { type: "all", target: this.value, sort:$("#customerSortTypeMenu").data("action") });
      }
  });
  
  function getDistFromBottom () {
    return Math.max(document.body.scrollHeight - window.innerHeight - window.scrollY, 0);
  }
  var isLoading = false;
  $(document).on("scroll", debounce(function(){
    if($("#mainCustomerList").is(":visible") && !isLoading && NMNS.customerList && currentCustomerCount < NMNS.customerList.length && getDistFromBottom() < Math.max(100, window.innerHeight * 0.2)){
      isLoading = true;
      $("#mainCustomerLoading").show();
      drawCustomerList();
      $("#mainCustomerLoading").hide();
      isLoading = false;
    }
  }, 100));
  
})();