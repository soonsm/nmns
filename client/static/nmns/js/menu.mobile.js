/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, generateRandom */
(function() {
    $("#mainContents").append('<div id="menuDetailMenu" class="switchingMenu menuDetailMenu">\
        <div class="menuContents px-3">\
          <form id="menuForm" class="mb-1 col-12 px-0 hasBottomArea" style="padding-top:35px">\
            <div class="form-group mb-0">\
              <div>메뉴 이름</div>\
              <input id="menuFormName" type="text" placeholder="메뉴 이름을 입력해주세요." class="form-control form-control-sm mt-3"/>\
              <div style="margin-top:35px">카드 가격</div>\
              <input id="menuFormPriceCard" type="text" placeholder="카드 가격을 입력해주세요." class="form-control form-control-sm mt-3 mb-2 montserrat inputmask-integer"/>\
              <div style="margin-top:35px">현금 가격</div>\
              <input id="menuFormPriceCash" type="text" placeholder="현금 가격을 입력해주세요." class="form-control form-control-sm mt-3 mb-2 montserrat inputmask-integer"/>\
              <div style="margin-top:35px">멤버십 가격</div>\
              <input id="menuFormPriceMembership" type="text" placeholder="멤버십 가격을 입력해주세요." class="form-control form-control-sm mt-3 mb-2 montserrat inputmask-integer"/>\
            </div>\
          </form>\
          <div class="row mx-0 col-12 mt-5 bottomButtonArea" style="padding:20px">\
            <button type="button" class="btn btn-white col mr-1" id="menuFormDeleteBtn">삭제</button>\
            <button type="button" class="btn btn-accent col ml-1" id="menuFormBtn">저장</button>\
          </div>\
        </div>\
      </div>');
  Inputmask("integer", {autoGroup: true, groupSeparator: ",", groupSize: 3, rightAlign: false, allowMinus:false, allowPlus:false}).mask('#menuDetailMenu .inputmask-integer');
  
  $("#menuFormBtn").on("touch click", function(){
    if($("#menuFormName").val() === ''){
      showSnackBar('메뉴 이름을 입력해주세요.');
      return;
    }
    var origin = $("#menuForm").data('origin')
    if(origin){// update
      NMNS.history.push({id:origin.id, name:origin.name, priceCash: origin.priceCash, priceCard: origin.priceCard, priceMembership: origin.priceMembership});
      var after = {
        id:origin.id,
        name:$("#menuFormName").val(),
        priceCash:$("#menuFormPriceCash").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceCash").val().replace(/,/gi, '')*1,
        priceCard:$("#menuFormPriceCard").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceCard").val().replace(/,/gi, '')*1,
        priceMembership:$("#menuFormPriceMembership").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceMembership").val().replace(/,/gi, '')*1
      };
      NMNS.emit('update menu', after);
      origin = NMNS.menuList.find(function(item){ return item.id === after.id});
      origin.name = after.name;
      origin.priceCash = after.priceCash;
      origin.priceCard = after.priceCard;
      origin.priceMembership = after.priceMembership;
    }
    NMNS.drawMenuList(true);
    history.back();
  });
  $("#menuFormDeleteBtn").on("touch click", function(e){
    e.stopPropagation();
    if (confirm("정말 이 메뉴 항목을 삭제하시겠어요?")) {
      var menu = $("#menuForm").data('origin');
      var index = $("#menuForm").data('index');
      $("#mainMenuList .menuRow[data-index='"+index+"']").data('action', 'delete').hide();
      if (menu) {
          NMNS.history.push($.extend({ "index": index }, menu));
          NMNS.emit("delete menu", { "id": menu.id });
          NMNS.menuList.remove(menu.id, function(item, target) { return item.id === target });
          NMNS.drawMenuList(true);
      }
      history.back();
    }
  })
  /*$("#updateMenuLink").on("touch click", function(){
    $(".menuRow .updatingMenu-collapsed").toggleClass('d-none').toggleClass('d-block');
    $(".updatingMenu-expanded").toggle();
    $("#mainMenuTools .updatingMenu-collapsed").toggleClass('d-inline-flex');
    if($(".updatingMenu-collapsed").is(":visible")){
      if($("#mainMenuList").data('sortable')){
        $("#mainMenuList").data('sortable').option('disabled',false);
      }
      $(this).text('수정 완료');
    }else{
      if($("#mainMenuList").data('sortable')){
        $("#mainMenuList").data('sortable').option('disabled',true);
      }
      var diff = false, menuList = [];
      $("#mainMenuList .menuRow").map(function(index, row){
        menuList.push(NMNS.menuList[row.getAttribute('data-index')*1]);
        if($(row).data('action') === 'delete'){
          menuList[index].action = 'delete';
          diff = true;
        }else if(index !== (row.getAttribute('data-index')*1)){
          diff = true;
        }
      })
      if(diff){
        NMNS.emit('update menu list', menuList);
      }
      $(this).text('수정');
    }
  });*/
  
  var currentMenuCount = 0;

  function generateMenuRow(init, goal){
      var html = "", item;
      for(var index=init; index<goal; index++){
          item = NMNS.menuList[index];
          html += '<div class="menuRow col-6" data-index="'+index+'"><div class="menuRowCover">'+
              '<div class="col-12 px-0 menuRowHead">'+(!item.name || item.name === '' ? '(이름없음)' : item.name) + '</div>' + 
              (item.priceCard !== null && item.priceCard !== undefined?('<div class="col-6 px-0 menuSubHead">카드 가격</div><div class="col-6 px-0 montserrat menuPrice">'+(item.priceCard+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</div>') : '') +
              (item.priceCash !== null && item.priceCash !== undefined?('<div class="col-6 px-0 menuSubHead">현금 가격</div><div class="col-6 px-0 montserrat menuPrice">'+(item.priceCash+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</div>') : '') +
              (item.priceMembership !== null && item.priceMembership !== undefined?('<div class="col-6 px-0 menuSubHead">멤버십 가격</div><div class="col-6 px-0 montserrat menuPrice">'+(item.priceMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</div>') : '') +
              //'<div class="col-1 updatingMenu-collapsed d-none"><button type="button" class="deleteMenuLink close p-0 m-0" aria-label="삭제"><span aria-hidden="true">&times;</span></button></div>'+
              '</div></div>'
      }
      return html;
  }
  NMNS.drawMenuList = function(refresh) {
      var list = $("#mainMenuList");
      var html = "";
      var goalIndex;
		if(!currentMenuCount){
			currentMenuCount = 0;
		}
      if(NMNS.menuList && refresh){//from 0 to current menu count
          list.html('');
          if (NMNS.menuList && NMNS.menuList.length > 0) {
              goalIndex = Math.min(currentMenuCount === 0? currentMenuCount + Math.max(10, (5 + Math.ceil(($('#mainMenuList').height() / 140) - $("#mainMenuList .menuRow").length / 2))) : currentMenuCount, NMNS.menuList.length);
              html += generateMenuRow(0, goalIndex)
          } else {
              html += "<p style='margin:auto;text-align:center'>아직 등록된 메뉴가 없습니다.<br>새로운 메뉴를 등록하여 고객의 매출내역을 기록, 관리해보세요!</p>";
          }
      }else if(NMNS.menuList){//additional loading
          goalIndex = Math.min(currentMenuCount + Math.max(10, (5 + Math.ceil(($('#mainMenuList').height() / 140) - $("#mainMenuList .menuRow").length / 2))), NMNS.menuList.length);//최대 20개씩 신규로 로딩
          html += generateMenuRow(currentMenuCount, goalIndex)
      }
      currentMenuCount = goalIndex;
      //list.append(html);
      list.append($(html).on("touch click", function(e){
        e.preventDefault();
        e.stopPropagation();
        refreshMenuModal(NMNS.menuList[$(this).data('index')*1]);
        $("#menuForm").data('index', $(this).data('index')*1);
        $(".menuDetailLink").trigger("click");
      }));
      /*if(!list.data('sortable')){
        list.data('sortable', Sortable.create(list[0], {animation:150, disabled:true, forceFallback:true}));
      }*/
  }

  function refreshMenuModal(menu){
    $("#menuForm").data('origin', menu);
    $("#menuFormName").val(menu.name);
    $("#menuFormPriceCard").val(menu.priceCard);
    $("#menuFormPriceCash").val(menu.priceCash);
    $("#menuFormPriceMembership").val(menu.priceMembership);
  }
/*
  function initMenuModal(){
    
  }
  
  $("#createMenuLink").on("touch click", function(){
    refreshMenuModal(null);
  });
  
  NMNS.socket.on("update menu list", socketResponse("메뉴 리스트 수정", undefined, function(e){
    NMNS.menuList = e.data;
    currentMenuCount = 0;
    drawMenuList(true);
  }));
  NMNS.socket.on("add menu", socketResponse("메뉴 추가", function(e) {
    NMNS.history.remove(e.data.id, findById);
  }, function(e) {
    var index = NMNS.menuList.findIndex(function(item) {
      return item.id === e.data.id;
    });
    if (Number.isInteger(index) && index > -1) {
      NMNS.menuList.splice(index, 1);
      drawMenuList(true);
    }
  }));*/
  NMNS.socket.on("update menu", socketResponse("메뉴 항목 수정", function(e){
    NMNS.history.remove(e.data.id, findById);
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
  }, function(e){
    var origin = NMNS.history.find(function(item){return item.id === e.data.id});
    var index = NMNS.menuList.findIndex(function(item) {
      return item.id === e.data.id;
    });
    if (Number.isInteger(index) && index > -1) {
      NMNS.menuList[index].priceCard = origin.priceCard;
      NMNS.menuList[index].priceCash = origin.priceCash;
      NMNS.menuList[index].name = origin.name;
      NMNS.menuList[index].priceMembership = origin.priceMembership;
      
      NMNS.history.remove(e.data.id, findById);
      NMNS.drawMenuList(true);
    }
  }));

  NMNS.socket.on("delete menu", socketResponse("메뉴 항목 삭제", function(e){
    NMNS.history.remove(e.data.id, findById);
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
  }, function(e){
    var origin = NMNS.history.find(function(item){return item.id === e.data.id});
    NMNS.menuList.splice(origin.index, origin);
    NMNS.drawMenuList(true);
    NMNS.history.remove(e.data.id, findById);
  }));
  //TODO : delete these rows for test
  // NMNS.menuList = [{id: 1, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 121, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 441, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 91, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 81, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 17, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 61, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 51, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 41, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 31, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 21, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 11, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 1, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 2, name:'매니큐어2', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 3, name:'매니큐어3', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 4, name:'매니큐어4', priceCash:10000, priceCard:20000, priceMembership:10000}, {id:5, name:'매니큐어5', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 6, name:'매니큐어6', priceCash:10000, priceCard:20000, priceMembership:10000}]
  NMNS.drawMenuList(true); 
  
  function getDistFromBottom () {
    return Math.max(document.body.scrollHeight - window.innerHeight - window.scrollY, 0);
  }
  var isLoading = false;
  $(document).on("scroll", debounce(function(){
      if($("#mainMenuList").is(":visible")){
        if(!isLoading && NMNS.menuList && currentMenuCount < NMNS.menuList.length && getDistFromBottom() < Math.max(100, window.innerHeight * 0.2)){
            isLoading = true;
            $("#mainMenuLoading").show();
            NMNS.drawMenuList();
            $("#mainMenuLoading").hide();
            isLoading = false;
        }
      }
    }, 100));
})();