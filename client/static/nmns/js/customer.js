/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, filterNonNumericCharacter, generateRandom */
(function() {
  $("#mainRow").append('<div id="customerModal" class="modal fade" tabIndex="-1" role="dialog" aria-label="고객 정보" aria-hidden="true">\
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">\
        <div class="modal-content">\
          <div class="modal-header p-0 mx-0">\
            <div class="row mx-0 col-12" style="padding:25px 30px 0 30px;border-bottom:1px solid rgba(58, 54, 54, 0.35)">\
              <ul id="customerTabList" class="nav nav-pills" role="tabList" style="display:inline-flex !important;height:47px;">\
                <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0 active" href="#customerInfo" data-toggle="tab" aria-selected="true" aria-label="고객 정보">고객 정보</a></li>\
                <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerSchedule" data-toggle="tab" aria-label="예약 내역">예약 내역</a></li>\
                <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerAlrim" data-toggle="tab" aria-label="알림톡 내역">알림톡 내역</a></li>\
                <li class="nav-item" style="display:inline-flex !important"><a class="nav-link pt-0 rounded-0" href="#customerMembership" data-toggle="tab" aria-label="멤버십 금액 내역">멤버십 금액 내역</a></li>\
              </ul>\
              <button type="button" class="close p-0 ml-auto mr-0 my-0" data-dismiss="modal" aria-label="닫기">\
                <span aria-hidden="true" style="vertical-align:text-top;line-height:0px">&times;</span>\
              </button>\
            </div>\
          </div>\
          <div class="modal-body">\
            <div class="row mx-0 col-12 tab-content p-0">\
                    \
              <div id="customerInfo" class="tab-pane col-12 px-0 fade show active" role="tabpanel">\
                <div class="row mx-0">\
                  <div id="customerNoShow" class="col-12 px-0">총 <span id="customerNoShowCount" class="montserrat text-accent ml-1">0</span>건의 노쇼 이력이 있는 고객님이에요.</div>\
                  <div>고객 이름</div>\
                  <input type="text" class="form-control form-control-sm mt-3" id="customerName" placeholder="고객 이름을 입력해주세요." style="margin-bottom:35px">\
                  <div>고객 연락처</div>\
                  <input type="text" pattern="[0-9]*" class="form-control form-control-sm mt-3 montserrat" id="customerContact" placeholder="고객 연락처를 입력해주세요." style="margin-bottom:35px">\
                  <div class="col-6 px-0">담당자</div><div class="col-6 pl-1">고객메모</div>\
                </div>\
                <div class="d-flex" style="margin-bottom:35px">\
                  <div class="col px-0 mr-1">\
                    <button id="customerManager" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-sm dropdown-toggle btn-flat form-control form-control-sm text-left mt-3" aria-label="담당자">\
                      <span>선택</span>\
                    </button>\
                    <div class="dropdown-menu" aria-labelledby="customerManager" role="menu" id="customerManagerList" style="right:0"></div></div>\
                  <div class="col px-0 ml-1"><input type="text" id="customerEtc" class="form-control form-control-sm mt-3" placeholder="고객 메모를 입력해주세요."></div>\
                </div>\
                <div class="d-flex updatingCustomer">\
                  <div class="customerTitle">멤버십 잔액</div>\
                  <div class="ml-auto"><span id="customerBalanceMembership" class="montserrat">0</span>원</div>\
                </div>\
                <div class="d-flex updatingCustomer">\
                  <div class="customerTitle">총 매출액</div>\
                  <div class="ml-auto"><span id="customerTotalSales" class="montserrat">0</span>원</div>\
                </div>\
                <div class="d-flex" style="margin-top:50px">\
                  <button type="button" class="btn btn-white col mr-1 addCustomerScheduleBtn">예약 추가</button>\
                  <button type="button" class="btn btn-white col mr-1" id="closeCustomerModal" data-dismiss="modal">삭제</button>\
                  <button id="customerBtn" type="button" class="btn btn-accent col ml-1">저장</button>\
                </div>\
              </div>\
              \
              <div id="customerSchedule" class="tab-pane col-12 px-0 fade" role="tabpanel">\
                <div id="customerScheduleNotEmpty" class="row mx-0 flex-column">\
                  <div class="row mx-0 col-12 px-1 pb-3 customerScheduleHead text-center" style="border-bottom:1px solid #707070">\
                    <div class="col-4 px-0 customerScheduleSortType active" data-action="sort-date">날짜</div><div class="col-1 px-0 customerScheduleSortType" data-action="sort-manager">담당</div>\
                    <div class="col-4 px-0">예약내용</div><div class="col-3 px-0 d-flex"><div class="col-6 px-0 customerScheduleSortType" data-action="sort-sales">매출액</div><div class="col-6 px-0 customerScheduleSortType" data-action="sort-status">예약상태</div></div>\
                  </div>\
                  <div class="row mx-0" id="customerScheduleList"></div>\
                  <div class="d-flex col-12 px-0" style="margin-top:50px">\
                    <button type="button" class="btn btn-white col mr-1 addCustomerScheduleBtn">예약 추가</button>\
                    <button type="button" dismiss="modal" class="btn btn-accent col ml-1">닫기</button>\
                  </div>\
                </div>\
                <div id="customerScheduleEmpty" style="display:none">예약 내역이 없어요.</div>\
              </div>\
              \
              <div id="customerAlrim" class="tab-pane col-12 px-0 fade" role="tabpanel">\
                <div class="d-flex">\
                  <div id="customerAlrimList" class="row"></div>\
                </div>\
              </div>\
              \
              <div id="customerMembership" class="tab-pane col-12 px-0 fade" role="tabpanel">\
                <div class="d-flex">\
                  <div>멤버십 추가 적립</div>\
                  <div class="row mx-0 col-12 px-0"><input type="text" pattern="[0-9]*" id="customerMembershipSales" class="form-control form-control-sm han col" aria-label="멤버십 추가 적립" placeholder="금액을 숫자로 입력하세요." >\
                  <button type="button" class="btn btn-sm btn-form ml-2 addCustomerMembership">추가</button></div>\
                </div>\
                <div class="d-flex">\
                  <div>멤버십 금액 조절</div>\
                  <div class="row mx-0 col-12 px-0"><input type="text" id="customerMembershipAdjust" class="form-control form-control-sm han col" aria-label="멤버십 금액 조절" placeholder="+/- 숫자를 입력하면 멤버십 금액을 임의로 조절할 수 있어요." >\
                  <button type="button" class="btn btn-sm btn-form ml-2 addCustomerMembershipAdjust">추가</button></div>\
                </div>\
                <div class="row mx-0 col-12 px-0 pb-3 customerMembershipHead" style="border-bottom:1px solid #707070">\
                  <div class="col-3 justify-center">날짜</div><div class="col-4 justify-center">내용</div><div class="col-5 px-0"><div class="col-6 justify-center">증/감</div><div class="col-6 justify-center">잔액</div></div>\
                </div>\
                <div class="row" id="customerMembershipList"></div>\
              </div>\
              \
            </div>\
          </div>\
        </div>\
      </div>\
    </div>');
  
  function drawCustomerAlrimList(alrims) {
      var list = $("#customerAlrim");
      list.children(".card, span").remove();
      if (!list.hasClass("ps")) {
          list.data("scroll", new PerfectScrollbar("#customerAlrim", { suppressScrollX: true }));
      }
      if (!alrims || alrims.length === 0) {
          list.append("<span class='text-center'>이 고객에게 전송된 알림톡 내역이 없습니다!<br/>" + (NMNS.info.alrimTalkInfo.useYn !== 'Y' ? '알림톡을 사용하도록 설정하고 ' : '') + "새로운 예약을 등록하여 알림톡을 보내보세요.</span>");
      } else {
          var html = "";
          alrims.forEach(function(alrim, index) {
              html += '<div class="card shadow-sm">' +
                  '<button class="card-header btn btn-sm text-left" id="customerAlrimCardHeader' + index + '" type="button" data-toggle="collapse" data-target="#customerAlrimCardBody' + index + '" aria-expanded="false" aria-controls="customerAlrimCardBody' + index + '" title="눌러서 전송된 알림톡 내용 보기">' + moment(alrim.date, "YYYYMMDDHHmm").format("YYYY년 M월 D일 HH시 mm분") +
                  '</button><div id="customerAlrimCardBody' + index + '" class="collapse" aria-labelledby="customerAlrimCardHeader' + index + '" parent="#customerAlrimList">' +
                  '<div class="card-body">' + (alrim.contents || '(내용 없음)') + '</div></div></div>';
              if (index > 0 && index % 50 === 0) {
                  list.append(html).data("scroll").update();
                  html = "";
              }
          });
          list.append(html);
      }
      list.data("scroll").update();
  }

  function generateCustomerScheduleRow(init, goal){
    var managers = NMNS.calendar.getCalendars();
    var manager, item;
    var schedules = $("#customerScheduleList").data('item');
    var html = "", contents;
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
        html += '<div class="customerSchedule col-12" data-index="'+index+'">'+
          '<div class="col col-4 px-0 montserrat">' + moment(item.start, 'YYYYMMDDHHmm').format('YYYY. MM. DD HH:mm') + (item.end?moment(item.end, 'YYYYMMDDHHmm').format(moment(item.start, 'YYYYMMDDHHmm').isSame(moment(item.end, 'YYYYMMDDHHmm'), 'day')?' - HH:mm':' - YYYY. MM. DD HH:mm'):'') + '</div>' +
          '<div class="col col-1 px-0"><span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'" title="'+manager.name+'"></span>'+manager.name+'</div>'+
          '<div class="col col-4">'+(contents || '') + '</div><div class="col-3 px-0 d-flex">' +
          '<div class="col col-6 px-0 montserrat">'+(item.sales ? (item.sales+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '-') + '</div>' +
          '<div class="col col-6 px-0">'+(item.status == 'NOSHOW'? '노쇼' : (item.status === 'CANCELED' || item.status === 'CUSTOMERCANCELED' ? '취소' : '정상')) + '</div></div>' +
          '</div></div>';
    }
    return html;
  }

  function drawCustomerScheduleList(refresh) {
      var list = $("#customerScheduleList"), schedules = list.data('item'), current = list.data('index');
      var html = "";
      var goalIndex;
      if(schedules && refresh){//from 0 to current customer count
          list.children(":not(.ps)").remove();
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
      console.log(html);
      list.data('index', goalIndex);
      list.append(html);
      
      if(list.data('scroll')){
        list.data('scroll').update();
      }else{
        list.data('scroll', new PerfectScrollbar('#customerScheduleList'));
      }
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
      $("#customerModal .updatingCustomer").addClass('d-flex');
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
      $("#closeCustomerModal").hide();
      $("#customerTabList a[href='#customerInfo']").text('고객 상세').tab('show');
      $("#customerModal").removeClass('addCustomer').data("customer", customer);
    }else{//add customer
      $("#customerName").val('');
      $("#customerContact").val('');
      $("#customerEtc").val('');
      $("#customerNoShow").hide();
      $(".addCustomerScheduleBtn").hide();
      $("#closeCustomerModal").show();
      $("#customerModal .updatingCustomer").removeClass('d-flex').hide();
      
      $("#customerTabList a[href='#customerInfo']").text('고객 추가').tab('show');
      $("#customerModal").addClass('addCustomer').data('customer', null);
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
          html += '<div class="customer col-12" data-index="'+index+'"><div><span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'" title="'+manager.name+'"></span></div>'+
              '<div class="col col-1 px-0 font-weight-bold" style="font-size:14px">'+(!item.name || item.name === '' ? '(이름없음)' : item.name) + '</div>' + 
              '<div class="col col-2 montserrat">'+(!item.contact || item.contact === '' ? '' : dashContact(item.contact)) + '</div>' +
              '<div class="col col-1" style="font-size:10px">'+(!item.history? '0회' : item.history.length + '회')+'</div><div class="col-4">' +
              '<div class="col col-4 px-0 montserrat">'+(item.history && item.history.length > 0 ? moment(item.history[0].date, "YYYYMMDDHHmm").format("YYYY. MM. DD") : '-') + '</div>' +
              '<div class="col col-4 px-0 montserrat">'+((item.cardSales + item.cashSales) == 0 ? '-' : ((item.cardSales + item.cashSales)+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
              '<div class="col col-4 px-0 montserrat">'+(item.pointMembership == 0? '-' : (item.pointMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div></div>' +
              '<div class="col" style="font-size:10px">'+(item.etc || '-')+'</div>'+
              '<a class="customerModalLink" href="#" data-toggle="modal" data-target="#customerModal" title="상세보기"></a>'+
              '</div>'
      }
      return html;
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
              html += "<p>아직 등록된 고객이 없습니다. 새로운 고객을 등록하여 방문 및 매출내역을 기록, 관리해보세요!</p>";
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
      });
      list.find(".deleteCustomerLink").off("touch click").on("touch click", function(e) {
          e.preventDefault();
          if (confirm("정말 이 고객을 삭제하시겠어요?")) {
              var index = Number($(this).parentsUntil(undefined, ".card").data("index"));
              if (Number.isInteger(index)) {
                  var customer = NMNS.customerList[index];
                  if (customer) {
                      NMNS.history.push($.extend({ "index": index }, customer));
                      NMNS.socket.emit("delete customer", { "id": customer.id });
                      NMNS.customerList.remove(customer.id, function(item, target) { return item.id === target });
                      drawCustomerList(true);
                  }
              }
          }
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
  NMNS.socket.on("add customer", socketResponse("고객 추가", function(e) {
      var index = NMNS.customerList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          NMNS.customerList[index].totalNoShow = e.data.totalNoShow || 0;
          NMNS.customerList[index].myNoShow = 0;
      }
      $("#customerAddName").val('');
      $("#customerAddContact").val('');
      $("#customerAddEtc").val('');
  }, function(e) {
      var index = NMNS.customerList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          NMNS.customerList.splice(index, 1);
          drawCustomerList(true);
      }
  }));
  NMNS.socket.on("update customer", socketResponse("고객정보 수정", function(e) {
      var index = NMNS.customerList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          var customer = NMNS.customerList[index];
          customer.name = $("#customerName").val();
          customer.contact = $("#customerContact").val();
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
                  contact: $("#customerContact").val(),
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
      drawCustomerAlrimList(e.data);
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
      $("#customerModal").modal("hide");
  }, function() {
      NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": $($(".customerSortType.active")[0]).data("action") });
      $("#customerModal").modal("hide");
  }));
  $("#customerModal").on("hidden.bs.modal", function() {
    if ($(this).data("trigger")) {
      $(this).removeData("trigger");
      var customer = $(this).data("customer");
      var now = moment(new Date());
      if (now.hour() >= Number(NMNS.info.bizEndTime.substring(0, 2)) || (now.hour() + 1 == Number(NMNS.info.bizEndTime.substring(0, 2)) && now.minute() + 30 > Number(NMNS.info.bizEndTime.substring(2)))) {
          now = moment(NMNS.info.bizEndTime, "HHmm").subtract(30, "m");
      } else if (now.hour() < Number(NMNS.info.bizBeginTime.substring(0, 2)) || (now.hour() == Number(NMNS.info.bizBeginTime.substring(0, 2)) && now.minute() < Number(NMNS.info.bizBeginTime.substring(2)))) {
          now = moment(NMNS.info.bizBeginTime, "HHmm");
      } else {
          now.minute(Math.ceil(now.minute() / 10) * 10);
      }
      NMNS.calendar.fire('beforeCreateSchedule', {start: now.toDate(), end: now.add(30, "m").toDate(), customer: { name: customer.name, contact: customer.contact, etc: customer.etc, managerId: customer.managerId}});
    }
    $(this).data('customer', null);
  }).on("shown.bs.modal", function() {
      $("#customerName").focus();
      $(".modal-backdrop").one("touch click", function(e){//click on menubar
        $(".modal.show").modal('hide');
      });
  }).one("show.bs.modal", function(){
    $("#customerBtn").on("touch click", function(e) {
        e.preventDefault();
        if ($("#customerName").val() === '' && $("#customerContact").val() === '') {
            alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
            return;
        }
        if($("#customerInfo input:invalid").length > 0){
          alert('입력하신 고객 정보를 확인해주세요.');
          return;
        }
        var customer = $("#customerModal").data("customer");
        if (customer) {
            NMNS.socket.emit("update customer", {
                id: customer.id,
                name: $("#customerName").val(),
                contact: $("#customerContact").val(),
                etc: $("#customerEtc").val(),
                managerId: $("#customerManager").data("calendar-id")
            });
        } else {
          if ($("#customerName").val() === '' && $("#customerContact").val() === '') {
              alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
              return;
          }
          if($("#customerInfo input:invalid").length > 0){
            alert('입력하신 고객 정보를 확인해주세요.')
            return;
          }
          customer = {
              id: NMNS.email + generateRandom(),
              name: $("#customerName").val(),
              contact: $("#customerContact").val(),
              etc: $("#customerEtc").val(),
              managerId: $("#customerManager").data("calendar-id")
          };
          NMNS.socket.emit("add customer", customer);
          NMNS.customerList.splice(0, 0, customer);
          drawCustomerList(true);
        }
    });
    $("#customerTabList a[href='#customerAlrim']").on("show.bs.tab", function(){
      NMNS.socket.emit('get customer alrim', {id:$("#customerModal").data('customer').id});
    });
    $("#customerTabList a[href='#customerSchedule']").on("show.bs.tab", function(){
      if($(this).data('id') !== $("#customerModal").data('customer').id){
        var customer = $("#customerModal").data('customer');
        $(this).data('id', customer.id);
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
      $(".customerSortType").off("touch click").on("touch click", function(e) {
          if ($(this).hasClass("active")){
            $("#customerScheduleList").data('item').reverse();
          }else{
            var action = e.target.getAttribute('data-action');
            if (!action) {
                action = e.target.parentElement.getAttribute('data-action');
            }
            $("#customerScheduleList").data('item').sort(getSortFunc(action));
            $(".customerScheduleSortType").removeClass("active");
            $(".customerScheduleSortType[data-action='" + action + "']").addClass("active");
          }
          $("#customerScheduleList").data('index', 0);
          drawCustomerScheduleList(true);
      });
    });
    setNumericInput(document.getElementById("customerContact"));
    setNumericInput(document.getElementById("customerMembershipSales"));
    $(".addCustomerScheduleBtn").on("touch click", function(){
      $("#customerModal").data("trigger", true).modal("hide");
      $($("#sidebarContainer .calendarMenuLink")[0]).trigger("click");
    });
  });
  

  function getSortFunc(action) {
      switch (action) {
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
                  return (a.history[0].date < b.history[0].date ? 1 : (a.history[0].date > b.history[0].date ? -1 : getSortFunc("sort-name")(a, b)));
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

  function switchSortTypeButton(action) {
      $(".customerSortType").removeClass("active");
      $(".customerSortType[data-action='" + action + "']").addClass("active");
  }
  $(".customerSortType").off("touch click").on("touch click", function(e) {
      if ($(this).hasClass("active")){
          NMNS.customerList.reverse();
      }else{
          var action = e.target.getAttribute('data-action');
          if (!action) {
              action = e.target.parentElement.getAttribute('data-action');
          }
          NMNS.customerList.sort(getSortFunc(action));
          switchSortTypeButton(action);
      }
      currentCustomerCount = 0;
      drawCustomerList(true);
  });

  $("#searchCustomer").on("keyup", function(e) {
      if (e.which === 13) {
          NMNS.socket.emit("get customer list", { type: "all", target: this.value, sort:$($(".customerSortType.active")[0]).data("action") });
      }
  });
  $("#addCustomerBtn").on("touch click", function(e) {
      e.preventDefault();
      refreshCustomerModal();
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