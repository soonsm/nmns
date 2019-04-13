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
                    <div class="col-4 px-0 customerScheduleSortType active" data-action="sort-date">날짜</div><div class="col-5 px-0 d-flex"><div class="col-4 px-0 customerScheduleSortType" data-action="sort-manager">담당</div>\
                    <div class="col-8 px-0">예약내용</div></div><div class="col-3 px-0 d-flex"><div class="col-6 px-0 customerScheduleSortType" data-action="sort-sales">매출액</div><div class="col-6 px-0 customerScheduleSortType" data-action="sort-status">예약상태</div></div>\
                  </div>\
                  <div class="row mx-0" id="customerScheduleList"></div>\
                </div>\
                <div id="customerScheduleEmpty" style="display:none">예약 내역이 없어요.</div>\
                <div class="d-flex col-12 px-0" style="margin-top:50px">\
                  <button type="button" class="btn btn-white col mr-1 addCustomerScheduleBtn">예약 추가</button>\
                  <button type="button" data-dismiss="modal" class="btn btn-accent col ml-1">닫기</button>\
                </div>\
              </div>\
              \
              <div id="customerAlrim" class="tab-pane col-12 px-0 fade" role="tabpanel">\
                <div id="customerAlrimNotEmpty" class="row mx-0 flex-column">\
                  <div id="customerAlrimList" class="row mx-0"></div>\
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
                <div class="d-flex col-12 px-0" style="margin-top:50px">\
                  <button type="button" class="btn btn-white col mr-1 addCustomerScheduleBtn">예약 추가</button>\
                  <button type="button" data-dismiss="modal" class="btn btn-accent col ml-1">닫기</button>\
                </div>\
              </div>\
              \
              <div id="customerMembership" class="tab-pane col-12 px-0 fade" role="tabpanel">\
                <div>멤버십 추가 적립</div>\
                <div class="d-flex my-3">\
                  <div class="row mx-0 col-12 px-0"><input type="text" pattern="[0-9]*" id="customerMembershipSales" class="form-control form-control-sm montserrat col" aria-label="멤버십 추가 적립" placeholder="금액을 숫자로 입력하세요." >\
                  <button type="button" class="btn btn-sm btn-form ml-2" id="addCustomerMembershipSales">추가</button></div>\
                </div>\
                <div><input type="radio" name="customerMembershipSalesType" value="CARD" id="customerMembershipCard" checked="checked"><label for="customerMembershipCard"></label><label for="customerMembershipCard" style="margin-right:30px">카드</label><input type="radio" name="customerMembershipSalesType" value="CASH" id="customerMembershipCash"><label for="customerMembershipCash"></label><label for="customerMembershipCash">현금</label></div>\
                <div style="margin-top:30px">멤버십 금액 조절</div>\
                <div class="d-flex my-3">\
                  <div class="row mx-0 col-12 px-0"><input type="text" id="customerMembershipAdjust" class="form-control form-control-sm montserrat col" aria-label="멤버십 금액 조절" placeholder="+/- 숫자를 입력하면 멤버십 금액을 임의로 조절할 수 있어요." >\
                  <button type="button" class="btn btn-sm btn-form ml-2" id="addCustomerMembershipAdjust">추가</button></div>\
                </div>\
                <div class="row mx-0 col-12 py-3 px-1 text-center customerMembershipHead" style="border-bottom:1px solid #707070">\
                  <div class="col-3">날짜</div><div class="col-4">내용</div><div class="col-5 px-0 d-flex"><div class="col-6 px-0">증/감</div><div class="col-6 px-0">잔액</div></div>\
                </div>\
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
                <div class="d-flex col-12 px-0" style="margin-top:50px">\
                  <button type="button" class="btn btn-white col mr-1 addCustomerScheduleBtn">예약 추가</button>\
                  <button type="button" data-dismiss="modal" class="btn btn-accent col ml-1">닫기</button>\
                </div>\
              </div>\
              \
            </div>\
          </div>\
        </div>\
      </div>\
    </div>');
  
  function generateCustomerMembershipRow(init, goal){
    var memberships = $("#customerMembershipList").data('item');
    var item;
    var html = "";
    for(var index=init; index<goal; index++){
        item = memberships[index];
        html += '<div class="customerMembership col-12" data-id="'+item.id+'">'
          + '<div class="col-3 montserrat">' + moment(item.date, 'YYYYMMDD').format('YYYY. MM. DD')
          + '</div><div class="col-4">' + item.item
          + '</div><div class="col-5 px-0 d-flex"><div class="col-6 px-0 montserrat">' + ((item.type === 'MEMBERSHIP_INCREMENT' || item.type === 'MEMBERSHIP_ADD')? '+ ' : '- ') + ((item.membershipChange || '') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          + '</div><div class="col-6 px-0 montserrat">' + ((item.balanceMembership || '') + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          + '</div></div></div>';
    }
    return html;
  }

  function drawCustomerMembershipList(refresh) {
    var list = $("#customerMembershipList"), memberships = list.data('item'), current = list.data('index');
    var html = "";
    var goalIndex;
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
              '<div class="row customerAlrimDetail collapse mx-0 col-12" id="customerAlrimDetail' + index + '">'+(item.contents?item.contents.replace(/\n/g, "<br>"):'')+'</div>';
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
          '<div class="col col-5 px-0 d-flex"><div class="col col-4 px-0"><span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'" title="'+manager.name+'"></span>'+manager.name+'</div>'+
          '<div class="col col-8">'+(contents || '') + '</div></div><div class="col-3 px-0 d-flex">' +
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
              '<div class="col col-4 px-0 montserrat">'+((item.cardSales + item.cashSales) ? ((item.cardSales + item.cashSales)+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"): '-') + '</div>' +
              '<div class="col col-4 px-0 montserrat">'+(item.pointMembership ? (item.pointMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '-') + '</div></div>' +
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
      $("#customerModal").modal("hide");
  }, function() {
      NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": $($(".customerSortType.active")[0]).data("action") });
      $("#customerModal").modal("hide");
  }));
  NMNS.socket.on("get membership history", socketResponse('멤버십 내역 조회', function(e){
    $("#customerMembershipList").data('index', 0).data('item', [{id:'123', date:'20190103', item:'키키키', membershipChange:123123123, balanceMembership: 123123123},{id:'123', date:'20190103', item:'키키키', membershipChange:123123123, balanceMembership: 123123123},{id:'123', date:'20190103', item:'키키키', membershipChange:123123123, balanceMembership: 123123123},{id:'123', date:'20190103', item:'키키키', membershipChange:123123123, balanceMembership: 123123123},{id:'123',  date:'20190103',item:'키asdfasdfasdfasdfasdfasdfㅁㄴㅇ라ㅣ먼이럼닝ㅋ루맨댜얼민다ㅟ키키', membershipChange:123123123, balanceMembership: 123123123}].concat(e.data));
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
        $("#customerModal").modal('hide');
    });
    $("#customerTabList a[href='#customerAlrim']").on("show.bs.tab", function(){
      if($(this).data('id') !== $("#customerModal").data('customer').id){
        $(this).data('id', $("#customerModal").data('customer').id);
        $("#customerAlrimNotEmpty").hide();
        $("#customerAlrimEmpty").hide();
        $("#customerAlrimLoading").show();
        NMNS.socket.emit('get customer alrim', {id:$("#customerModal").data('customer').id});
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
      $(".customerScheduleSortType").off("touch click").on("touch click", function(e) {
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
      if($(this).data('id') !== $("#customerModal").data('customer').id){
        var id = $("#customerModal").data('customer').id;
        $(this).data('id', id);
        $("#customerMembershipList").hide();
        $("#customerMembershipEmpty").hide();
        $("#customerMembershipLoading").show();
        NMNS.socket.emit('get membership history', {customerId:id});
      }
    }).one("show.bs.tab", function(){
      setNumericInput($("#customerMembershipSales").on("keyup", function(e){
        if(e.which === 13){
          $(this).next().trigger('click');
        }
      })[0]);
      $("#customerMembershipAdjust").on("keyup", function(e){
        if(e.which === 13){
          $(this).next().trigger('click');
        }
      });
      $("#addCustomerMembershipAdjust").on("touch click", function(){
        var change = $("#customerMembershipAdjust").val().match(/^\s*(\+|\-)?\s*([\d]*)\s*$/);
        if(!change){
          showSnackBar('조절할 금액을 정확히 입력해주세요.');
          return;
        }
        var input = {
          id: NMNS.email + generateRandom(),
          type: change[1] === '-'? 'MEMBERSHIP_DECREMENT' : 'MEMBERSHIP_INCREMENT',
          item: '멤버십 금액 조절',
          customerId: $("#customerModal").data('customer').id,
          membershipChange: change[2]*1,
          date: moment().format('YYYYMMDD')
        }
        if(input.membershipChange === 0){
          showSnackBar('조절할 금액을 0보다 크게 입력해주세요.');
          return;
        }
        NMNS.socket.emit('add membership', input);
        $("#customerMembershipList").data('item').splice(0, 0, input);
        drawCustomerMembershipList(true);
      });
      $("#addCustomerMembershipSales").on("touch click", function(){
        if($("#customerMembershipSales").val() === '' || !($("#customerMembershipSales").val() * 1)){
          showSnackBar('적립할 금액을 입력해주세요.');
          return;
        }
        var input = {
          id: NMNS.email + generateRandom(),
          type: 'MEMBERSHIP_ADD',
          item: '멤버십 적립',
          customerId: $("#customerModal").data('customer').id,
          payment: $("#customerMembershipCard").prop('checked')? 'CARD' : ($("#customerMembershipCash").prop('checked') ? 'CASH' : null),
          membershipChange: $("#customerMembershipSales").val() * 1,
          date: moment().format('YYYYMMDD')
        }
        if(!input.payment){
          showSnackBar('적립 결제수단을 선택해주세요.');
          return;
        }
        NMNS.socket.emit('add membership', input);
        $("#customerMembershipList").data('item').splice(0, 0, input);
        drawCustomerMembershipList(true);
      });
    });
    setNumericInput(document.getElementById("customerContact"));
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