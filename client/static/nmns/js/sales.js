/* global NMNS, moment, $, socketResponse */
(function(){
  NMNS.socket.on("get sales list", socketResponse("매출 내역 조회", function(e){
    NMNS.salesList = e.data.sales;
    // NMNS.salesList = [{id:'123', customerName:'기기기', date:'20190101', item:'입장료', price:3000, type:'CARD'}];//for test
    // for(var i=0;i<100;i++){
    //   NMNS.salesList.push({id:'123'+i, customerName:'미미미'+(i*Math.random()), date:moment().add(i, 'day').format('YYYYMMDD'), item: '입장료'+(i*Math.random()), type:'CARD', price:Math.floor(30000*Math.random())})
    // }
    drawSalesList(true);
    $("#salesSummaryTotalCount").text((e.data.totalSalesCount || NMNS.salesList.length + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
    $("#salesSummaryTotalCard").text((e.data.totalSalesCard || '0'  + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
    $("#salesSummaryTotalCash").text((e.data.totalSalesCash || '0'  + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
    $("#salesSummaryTotalMembership").text((e.data.totalSalesMembership || '0'  + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
    $("#salesSummaryTotalAmount").text((e.data.totalSalesAmount || '0'  + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
    $("#salesToolsSticky").show();
    if(!$("#mainSalesTools").data('initialHeight')){
      $("#mainSalesTools").data('initialHeight', document.getElementById("mainSalesTools").offsetHeight);
    }
    $("#salesSearchButton").removeClass('disabled');
    $("#salesSearchPeriod").text(moment(document.getElementById('salesSearchStartDate')._flatpickr.selectedDates[0]).format('YYYY. MM. DD - ') + moment(document.getElementById('salesSearchEndDate')._flatpickr.selectedDates[0]).format('YYYY. MM. DD'));
  }));
  
  $(".salesSearchPeriodButton").on("touch click", function(){
    $(".salesSearchPeriodButton").removeClass('active');
    var start, end;
    switch($(this).data('action')){
      case 'week':
        end = moment();
        start = moment().add(-7, 'day');
        break;
      case 'month':
        end = moment();
        start = moment().add(-1, 'month');
        break;
      case 'halfYear':
        end = moment();
        start = moment().add(-6, 'month');
        break;
      case 'year':
        end = moment();
        start = moment().add(-1, 'year');
        break;
      case 'currentMonth':
        $(this).addClass('active');
        end = moment().endOf('month');
        start = moment().startOf('month');
        break;
      case 'previousMonth':
        $(this).addClass('active');
        end = moment().add(-1, 'month').endOf('month');
        start = moment().add(-1, 'month').startOf('month');
        break;
      case 'previous2Month':
        $(this).addClass('active');
        end = moment().add(-2, 'month').endOf('month');
        start = moment().add(-2, 'month').startOf('month');
        break;
    }
    if(start && end){
      document.getElementById('salesSearchStartDate')._flatpickr.setDate(start.toDate());
      document.getElementById('salesSearchEndDate')._flatpickr.setDate(end.toDate());
    }
  })
  function generateSalesRow(init, goal){
      var managers = NMNS.calendar.getCalendars();
      var manager, item;
      var html = "";
      for(var index=init; index<goal; index++){
          item = NMNS.salesList[index];
          manager = managers.find(function(itema) { return itema.id === item.managerId; });
          if(!manager){
              manager = {
                  color:'#334150',
                  name:'(삭제된 담당자)'
              }
          }
          html += '<div class="col-12 px-0 salesRow" data-index="'+index+'"><div class="col-2 px-0 montserrat">'+moment(item.date, 'YYYYMMDD').format('YYYY. MM. DD')
          +'</div><div class="col-2 px-0 salesName ellipsis">'+item.customerName+'</div><div class="col-2 px-0"><span class="tui-full-calendar-weekday-schedule-bullet" style="background:'+manager.color+'" title="'+manager.name
          +'"></span></div><div class="col-2 px-0 ellipsis">'+item.item+'</div><div class="col-2 px-0 montserrat">'+(item.price + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")+'</div><div class="col-2 px-0">'
          +(item.type==='CARD'?'카드':(item.type === 'CASH'?'현금':'멤버십'))+'</div></div>'
      }
      return html;
  }

  function drawSalesList(refresh) {
      var list = $("#mainSalesList");
      var html = "";
      var goalIndex;
      if(NMNS.salesList && refresh){//from 0 to current sales count
          list.children(":not(.ps)").remove();
          if (NMNS.salesList && NMNS.salesList.length > 0) {
              goalIndex = Math.min(currentSalesCount === 0? currentSalesCount + Math.max(20, (5 + Math.ceil($('#mainSalesList').height() / 48) - $("#mainSalesList .salesRow").length)) : currentSalesCount, NMNS.salesList.length);
              html += generateSalesRow(0, goalIndex)
          } else {
              html += "<p>저장된 매출 내역이 없습니다.</p>";
          }
      }else if(NMNS.salesList){//additional loading
          goalIndex = Math.min(currentSalesCount + Math.max(20, (5 + Math.ceil($('#mainSalesList').height() / 48) - $("#mainSalesList .salesRow").length)), NMNS.salesList.length);//최대 20개씩 신규로 로딩
          html += generateSalesRow(currentSalesCount, goalIndex)
      }
      currentSalesCount = goalIndex;
      list.append(html);
  }

  $("#salesSearchButton").on("touch click", function(){
    if(!$(this).hasClass('disabled')){
      $(this).addClass('disabled');
      NMNS.socket.emit('get sales list', {
        start:moment(document.getElementById('salesSearchStartDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
        end:moment(document.getElementById('salesSearchEndDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
        name:$("#salesSearchName").val() === ''? undefined:$("#salesSearchName").val(),
        managerId: $("#salesSearchManager").data('calendar-id') || undefined,
        item: $("#salesSearchContents").val() === '' ? undefined : $("#salesSearchContents").val()
      });
    }
  });
  
  var currentSalesCount = 0;

  function getSortFunc(action) {
      switch (action) {
        case 'sort-date':
          return function(a, b) {
            if (!a.date) {
              if (b.date) {
                return 1;
              } else {
                return getSortFunc("sort-name")(a, b);
              }
            } else if (!b.date) {
              return -1;
            }
            return (a.date < b.date ? -1 : (a.date > b.date ? 1 : getSortFunc("sort-name")(a, b)));
          };
        case 'sort-manager':
          var managers = NMNS.calendar.getCalendars();
          return function(a, b) {
            if (!a.managerId) {
              if (b.managerId) {
                return 1;
              } else {
                return getSortFunc("sort-name")(a, b);
              }
            } else if (!b.managerId) {
              return -1;
            }
            if(!a.manager){
              a.manager = managers.find(function(itema) { return itema.id === a.managerId; });
              if(!a.manager){
                  a.manager = {
                      color:'#334150',
                      name:'(삭제된 담당자)'
                  }
              }
            }
            if(!b.manager){
              b.manager = managers.find(function(itema) { return itema.id === b.managerId; });
              if(!b.manager){
                  b.manager = {
                      color:'#334150',
                      name:'(삭제된 담당자)'
                  }
              }
            }
            return (a.manager.name < b.manager.name ? -1 : (a.manager.name > b.manager.name ? 1 : getSortFunc("sort-name")(a, b)));
          };
        case 'sort-item':
          return function(a, b) {
            if (!a.item) {
              if (b.item) {
                return 1;
              } else {
                return getSortFunc("sort-name")(a, b);
              }
            } else if (!b.item) {
              return -1;
            }
            return (a.item < b.item ? -1 : (a.item > b.item ? 1 : getSortFunc("sort-name")(a, b)));
          };
        case 'sort-sales':
          return function(a, b) {
            if (!a.price) {
              if (b.price) {
                return 1;
              } else {
                return getSortFunc("sort-name")(a, b);
              }
            } else if (!b.price) {
              return -1;
            }
            return ((a.price*1) < (b.price*1) ? -1 : ((a.price*1) > (b.price*1) ? 1 : getSortFunc("sort-name")(a, b)));
          };
        case 'sort-name':
        default:
          return function(a, b) {
            if (!a.customerName) {
              if (b.customerName) {
                  return 1;
              } else {
                  return 0;
              }
            } else if (!b.customerName) {
              return -1;
            }
            return (a.customerName < b.customerName ? -1 : (a.customerName > b.customerName ? 1 : 0));
          };
        }
    }

    function switchSortTypeButton(action) {
        $(".salesSortType").removeClass("active");
        $(".salesSortType[data-action='" + action + "']").addClass("active");
    }
    $(".salesSortType").off("touch click").on("touch click", function(e) {
        if ($(this).hasClass("active")){
            NMNS.salesList.reverse();
        }else{
            var action = e.target.getAttribute('data-action');
            if (!action) {
                action = e.target.parentElement.getAttribute('data-action');
            }
            NMNS.salesList.sort(getSortFunc(action));
            switchSortTypeButton(action);
        }
        currentSalesCount = 0;
        drawSalesList(true);
    });
    
    function getDistFromBottom () {
      return Math.max(document.body.scrollHeight - window.innerHeight - window.scrollY, 0);
    }
    var isLoading = false;
    $(document).on("scroll", debounce(function(){
      if($("#mainSalesList").is(":visible")){
        if(!isLoading && NMNS.salesList && currentSalesCount < NMNS.salesList.length && getDistFromBottom() < Math.max(100, window.innerHeight * 0.2)){
            isLoading = true;
            $("#mainSalesLoading").show();
            drawSalesList();
            $("#mainSalesLoading").hide();
            isLoading = false;
        }
      }
    }, 100)).on("scroll", function(){
      if($("#mainSalesList").is(":visible")){
        if(document.scrollingElement.scrollTop > 0){
          $(".salesMenu .menuTitle").addClass('fixedScroll');
          $("#menuTitleSticky").removeClass('d-none');
          if(document.scrollingElement.scrollTop > $("#mainSalesTools").data('initialHeight') - document.getElementById('salesToolsSticky').offsetHeight){
            $("#mainSalesTools").addClass('fixedScroll');
          }else{
            $("#mainSalesTools").removeClass('fixedScroll');
          }
        }else{
          $(".salesMenu .menuTitle").removeClass('fixedScroll');
          $("#menuTitleSticky").addClass('d-none');
        }
      }
    });
})();