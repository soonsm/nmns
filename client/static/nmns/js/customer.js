function drawCustomerHistoryList(customer){
  var list = $("#customerHistory");
  list.children(".card").remove();
  if(!list.hasClass("ps")){
    list.data("scroll", new PerfectScrollbar(list[0]));
  }
  if(customer.history.length === 0){
    list.append("<span class='text-center'>아직 "+ (customer.name && customer.name !== ""? customer.name : "이 ") + "고객에 등록된 예약내역이 없습니다.</span>");
  } else {
    var html = "";
    customer.history.forEach(function(history, index){
      html += '<div class="card col-12 col-lg-10" data-index="'+index+'"><div class="card-body"><h6>'+(!history.contents || history.contents === ''? '(예약내용 없음)':history.contents) + ' ';
      switch(history.status){
        case "CANCELED":
          html += "<small class='badge badge-light'>취소</small>";
          break;
        case "NOSHOW":
          html += "<small class='badge badge-danger'>노쇼</small>";
          break;
        case "CUSTOMERCANCELED":
          html += "<small class='badge badge-light'>고객취소</small>";
          break;
        case "RESERVED":
          html += "<small class='badge badge-success'>정상</small>";
          break;
      }
      html += '</h6>' + (moment(history.date, 'YYYYMMDDHHmm').isValid() ? '<p class="card-subtitle text-muted">'+moment(history.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm')+'</p>' : '')
            +'<div class="col-12 px-0"><small class="text-muted">담당자 </small>'+(history.managerName && history.managerName !== ''?'<span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="background-color:'+history.managerColor+'"></span><span> '+history.managerName+'</span>':'(담당자 없음)')+'</div>'
            +'</div><div class="cardLeftBorder" style="background-color:'+(history.managerColor || '#b2dfdb')+'"></div></div></div>';
      if(index > 0 && index % 50 == 0){
        list.append(html);
        html = "";
      }
    });
    list.append(html);
  }
  list.data("scroll").update();
}
function initCustomerModal(self){
  var customer = NMNS.customerList[Number(self.parent().data("index"))];
  $("#customerName").val(customer.name);
  $("#customerContact").val(customer.contact);
  $("#customerEtc").val(customer.etc);
  var text = "";
  if(customer.totalNoShow === 0){
    text = "이 고객은 노쇼하신 적이 없으시네요! :)";
  } else if(customer.myNoShow === 0){
    text = "이 고객은 다른 매장에서 " + customer.totalNoShow + "번 노쇼하셨어요.";
  } else if(customer.myNoShow === customer.totalNoShow) {
    text = "이 고객은 우리 매장에서만 " + customer.totalNoShow + "번 노쇼하셨어요.";
  } else {
    text = "이 고객은 우리 매장에서 " + customer.myNoShow + "번, 전체 매장에서 " + customer.totalNoShow + "번 노쇼하셨어요.";
  }
  $("#customerNoShow").text(text);
  drawCustomerHistoryList(customer);
  $("#customerName").focus();
  $("#customerModal").data("customer", customer);
}
function drawCustomerList(){
  var list = $("#mainCustomerList");
  list.children(".card").remove();
  if(!list.hasClass("ps")){
    list.data("scroll", new PerfectScrollbar(list[0], {suppressScrollX:true}));
  }
  var html = "";
  if(NMNS.customerList && NMNS.customerList.length > 0){
    NMNS.customerList.forEach(function(customer, index){
      html += '<div class="card row col-12 col-sm-10" data-index="'+index+'"><div class="card-body"><h5 class="card-title">'+(!customer.name || customer.name === ''? '(이름없음)':customer.name)
            +(!customer.contact || customer.contact === ''? '' : '&nbsp;<a href="tel:'+customer.contact+'"><small class="card-subtitle text-muted">'+dashContact(customer.contact)+'</small></a>')
            +'</h5><div class="col-12 row px-0"><div class="col-4 border-right"><small class="text-muted">담당자</small><br/>'+(customer.history && customer.history.length>0?'<span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="background-color:'+customer.history[0].managerColor+'"></span><span> '+customer.history[0].managerName+'</span>':'')+'</div><div class="col-8"><small class="text-muted">메모</small><br/><span>'+(customer.etc || '')+'</span></div></div>'
            +'</div><div class="cardLeftBorder" style="background-color:'+(customer.history && customer.history.length>0?customer.history[0].managerColor : '#b2dfdb')+'"></div><small class="customerSubInfo text-muted">'+(customer.history && customer.history.length > 0?'총 '+customer.history.length+'회 방문':'')+ (customer.history && customer.history.length>0?' | ' + '마지막 방문 ' + moment(customer.history[0].date, "YYYYMMDDHHmm").format("YYYY-MM-DD"):'')
            +'</small><a class="w-100 h-100 position-absolute customerModalLink" href="#" data-toggle="modal" data-target="#customerModal"></a></div></div>';
      if(index > 0 && index % 50 == 0){
        list.append(html);
        html = "";
      }
    });
    list.append(html);
    list.data("scroll").update();
    list.find(".customerModalLink").off("touch click").on("touch click", function(e){
      e.preventDefault();
      initCustomerModal($(this));
    });
    $("#customerCount").text(NMNS.customerList.length);
  }
}
$(".addHistory").on("touch click", function(e){
  $($("#sidebarContainer .calendarMenuLink")[0]).trigger("click");
  $("#customerModal").data("trigger", true).modal("hide");
});
NMNS.socket.on("get customer list", socketResponse("고객 조회", function(e){
  NMNS.customerList = e.data;
  drawCustomerList();
  
  console.log(e);
}));
$("#customerModal").on("hidden.bs.modal", function(){
  if($(this).data("trigger")){
    $(this).removeData("trigger");
    var customer = $(this).data("customer");
    NMNS.calendar.openCreationPopup({title:customer.name, raw:{contact:customer.contact, etc:customer.etc}, calendarId:(customer.history && customer.history.length>0? customer.history[0].managerId : undefined)});
  }
});
$("#customerContact").on("blur", function(){
  filterNonNumericCharacter($(this));
});
$("#submitCustomer").on("touch click", function(e){
  e.preventDefault();
  var customer = $("#customerModal").data("customer");
  if(customer){
    if($("#customerName").val() === '' && $("#customerContact").val() === ''){
      alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
      return;
    }
    NMNS.socket.emit("update customer", {
      id:customer.id,
      name:$("#customerName").val(),
      contact:$("#customerContact").val(),
      etc:$("#customerEtc").val()
    });
  } else {
    alert("알 수 없는 오류입니다. 새로고침 후 다시 시도해주세요.");
  }
});