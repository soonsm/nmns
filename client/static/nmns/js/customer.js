function loadCustomerData(data){
  console.log(data);
}
function initCustomerModal(self){
  var customer = NMNS.customerList[Number(self.parent().data("index"))];
  loadCustomerData(customer);
}
function drawCustomerList(){
  var list = $("#mainCustomerList");
  list.children(".card").remove();
  if(!list.hasClass("ps")){
    list.data("scroll", new PerfectScrollbar(list[0]));
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
NMNS.socket.on("get customer list", socketResponse("고객 조회", function(e){
  NMNS.customerList = e.data;
  drawCustomerList();
  
  console.log(e);
}));