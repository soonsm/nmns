/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, generateRandom */
(function() {
    $("#mainRow").append($('<div id="menuModal" class="modal fade" tabIndex="-1" role="dialog" aria-hidden="true" data-index="0">\
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">\
          <div class="modal-content">\
            <div class="modal-header">\
              <span>\
                <h5 class="modal-title" id="menuTitle">메뉴 추가</h5>\
              </span>\
              <button type="button" class="close" data-dismiss="modal" aria-label="닫기">\
                <span aria-hidden="true">&times;</span>\
              </button>\
            </div>\
            <div class="modal-body">\
              <div class="row mx-0 col-12 p-0">\
                <form id="menuForm" class="mb-1 col-12 px-0">\
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
                <div class="row mx-0 col-12 px-0 mt-5">\
                  <button type="button" class="btn btn-accent col" id="menuFormBtn">저장</button>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>').one('show.bs.modal', initMenuModal).on("shown.bs.modal", function(){
			 $("#menuFormName").focus();
			 }));
  Inputmask("integer", {autoGroup: true, groupSeparator: ",", groupSize: 3, rightAlign: false, allowMinus:false, allowPlus:false}).mask('#menuModal .inputmask-integer');
  
  $("#updateMenuLink").on("touch click", function(){
    $(".menuRow .updatingMenu-collapsed").toggleClass('d-none').toggleClass('d-block');
    $(".updatingMenu-expanded").toggle();
		$(".menuTitle .updatingMenu-collapsed").toggle();
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
        NMNS.socket.emit('update menu list', menuList);
      }
      $(this).text('수정');
    }
  });
  
  var currentMenuCount = 0;

  function generateMenuRow(init, goal){
      var html = "", item;
      for(var index=init; index<goal; index++){
          item = NMNS.menuList[index];
          html += '<div class="menuRow col-12" data-index="'+index+'">'+
              '<div class="col-3 px-0 font-weight-bold" style="font-size:14px">'+(!item.name || item.name === '' ? '(이름없음)' : item.name) + '</div>' + 
              '<div class="col px-0 montserrat">'+(item.priceCard == 0 || !item.priceCard ? '-' : (item.priceCard+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
              '<div class="col-3 px-0 montserrat">'+(item.priceCash == 0 || !item.priceCash ? '-' : (item.priceCash+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))+'</div>' +
              '<div class="col-3 px-0 montserrat">'+(item.priceMembership == 0 || !item.priceMembership ? '-' : (item.priceMembership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
              '<div class="col-1 updatingMenu-collapsed d-none"><button type="button" class="deleteMenuLink close p-0 m-0" aria-label="삭제"><span aria-hidden="true">&times;</span></button></div>'+
              '<a class="menuModalLink" href="#" data-toggle="modal" data-target="#menuModal" title="상세보기"></a>'+
              '</div>'
      }
      return html;
  }
  function drawMenuList(refresh) {
      var list = $("#mainMenuList");
      var html = "";
      var goalIndex;
		if(!currentMenuCount || refresh){
			currentMenuCount = 0;
		}
      if(NMNS.menuList && refresh){//from 0 to current menu count
          list.children(":not(.ps)").remove();
          if (NMNS.menuList && NMNS.menuList.length > 0) {
              goalIndex = Math.min(currentMenuCount === 0? currentMenuCount + Math.max(20, (5 + Math.ceil($('#mainMenuList').height() / 48) - $("#mainMenuList .menuRow").length)) : currentMenuCount, NMNS.menuList.length);
		         html += generateMenuRow(0, goalIndex)
          } else {
		          html += "<p>아직 등록된 메뉴가 없습니다. 새로운 메뉴를 등록하여 고객의 매출내역을 기록, 관리해보세요!</p>";
          }
		  }else if(NMNS.menuList){//additional loading
          goalIndex = Math.min(currentMenuCount + Math.max(20, (5 + Math.ceil($('#mainMenuList').height() / 48) - $("#mainMenuList .menuRow").length)), NMNS.menuList.length);//최대 20개씩 신규로 로딩
          html += generateMenuRow(currentMenuCount, goalIndex)
		  }
      currentMenuCount = goalIndex;
      list.append($(html).on("touch click", ".menuModalLink", function(e){
        e.preventDefault();
        refreshMenuModal(NMNS.menuList[$(this).parent().data('index')*1]);
      }).on("touch click", ".deleteMenuLink", function(e){
        e.stopPropagation();
				if (confirm("정말 이 메뉴 항목을 삭제하시겠어요?")) {
        	$(this).parents('.menuRow').data('action', 'delete').hide();        
          // var index = Number($(this).parents(".menuRow").data("index"));
          // if (Number.isInteger(index)) {
          //   var menu = NMNS.menuList[index];
          //   if (menu) {
          //       NMNS.history.push($.extend({ "index": index }, menu));
          //       NMNS.socket.emit("delete menu", { "id": menu.id });
          //       NMNS.menuList.remove(menu.id, findById);
          //   }
          // }
        }
      }));
      if(!list.data('sortable')){
        list.data('sortable', Sortable.create(list[0], {animation:150, disabled:true, forceFallback:true}));
      }
  }
	NMNS.drawMenuList = drawMenuList;

  function refreshMenuModal(menu){
    $("#menuForm").data('origin', menu);
    if(menu){
      $("#menuFormName").val(menu.name);
      $("#menuFormPriceCard").val(menu.priceCard);
      $("#menuFormPriceCash").val(menu.priceCash);
      $("#menuFormPriceMembership").val(menu.priceMembership);
      $("#menuTitle").text('메뉴 상세');
    }else{
      $("#menuFormName").val('');
      $("#menuFormPriceCard").val('');
      $("#menuFormPriceCash").val('');
      $("#menuFormPriceMembership").val('');
      $("#menuTitle").text('메뉴 추가');
    }
  }

  function initMenuModal(){
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
        NMNS.socket.emit('update menu', after);
        origin = NMNS.menuList.find(function(item){ return item.id === after.id});
        origin.name = after.name;
        origin.priceCash = after.priceCash;
        origin.priceCard = after.priceCard;
        origin.priceMembership = after.priceMembership;
      }else{//create
        origin = {
          id:NMNS.email + generateRandom(),
          name:$("#menuFormName").val(),
          priceCash:$("#menuFormPriceCash").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceCash").val().replace(/,/gi, '')*1,
          priceCard:$("#menuFormPriceCard").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceCard").val().replace(/,/gi, '')*1,
          priceMembership:$("#menuFormPriceMembership").val().replace(/,/gi, '') === ''? null : $("#menuFormPriceMembership").val().replace(/,/gi, '')*1
        }
        NMNS.socket.emit('add menu', origin);
        NMNS.menuList.push(origin);
      }
      $("#menuModal").modal('hide');
      drawMenuList(true);
    });
  }
  
  $("#createMenuLink").on("touch click", function(){
    refreshMenuModal(null);
  });
  
  NMNS.socket.on("update menu list", socketResponse("메뉴 리스트 수정", function(){
		NMNS.menuList = NMNS.menuList.filter(function(x){return x.action!== 'delete'});
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
	}, function(e){
    NMNS.menuList = e.data;
    currentMenuCount = 0;
    drawMenuList(true);
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
  }));
  NMNS.socket.on("add menu", socketResponse("메뉴 추가", function(e) {
    NMNS.history.remove(e.data.id, findById);
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
  }, function(e) {
    var index = NMNS.menuList.findIndex(function(item) {
      return item.id === e.data.id;
    });
    if (Number.isInteger(index) && index > -1) {
      NMNS.menuList.splice(index, 1);
      drawMenuList(true);
    }
  }));
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
      drawMenuList(true);
    }
  }));
  
  NMNS.socket.on("delete menu", socketResponse("메뉴 항목 삭제", function(e){
    NMNS.history.remove(e.data.id, findById);
		$("#scheduleTabContentList").html(NMNS.generateMenuList(NMNS.menuList));
  }, function(e){
    var origin = NMNS.history.find(function(item){return item.id === e.data.id});
    NMNS.menuList.splice(origin.index, origin);
    drawMenuList(true);
  }));
  //TODO : delete these rows for test
  // NMNS.menuList = [{id: 1, name:'매니큐어', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 2, name:'매니큐어2', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 3, name:'매니큐어3', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 4, name:'매니큐어4', priceCash:10000, priceCard:20000, priceMembership:10000}, {id:5, name:'매니큐어5', priceCash:10000, priceCard:20000, priceMembership:10000}, {id: 6, name:'매니큐어6', priceCash:10000, priceCard:20000, priceMembership:10000}]
  drawMenuList(true); // this line should be remained after deleting test above line.
})();