/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, filterNonNumericCharacter, generateRandom */
(function() {
    $("#mainRow").append($('<div id="menuModal" class="modal fade" tabIndex="-1" role="dialog" aria-hidden="true" data-index="0">\
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">\
          <div class="modal-content">\
            <div class="modal-header">\
              <span>\
                <h5 class="modal-title" id="menuTitle">메뉴 상세정보</h5>\
              </span>\
              <button type="button" class="close" data-dismiss="modal" aria-label="닫기">\
                <span aria-hidden="true">&times;</span>\
              </button>\
            </div>\
            <div class="modal-body">\
              <div class="form-group">\
                <div class="row mb-2">\
                  <div class="col-lg-6 col-12 text-center">\
                    <input id="menuName" type="text" placeholder="이름" class="form-control col-12 border-0 text-center my-3"/>\
                    <input id="menuContact" type="text" placeholder="연락처" class="form-control col-12 border-0 text-center my-3"/>\
                  </div>\
                  <div class="col-lg-6 col-12">\
                    <label for="menuEtc" class="col-12 px-0 col-form-label col-form-label-sm">메모</label>\
                    <div class="col-12 px-0">\
                      <textarea id="menuEtc" type="text" placeholder="이 고객에 대한 메모를 적어주세요." class="form-control han"></textarea>\
                    </div>\
                  </div>\
                </div>\
                <div class="row mb-2 px-3">\
                  <label for="menuManager" class="col-2 col-lg-1 p-0 col-form-label col-form-label-sm">담당자</label>\
                  <div class="col-lg-10 col-sm-8 col-7 px-0 mr-auto">\
                    <button id="menuManager" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-sm dropdown-toggle btn-flat form-control form-control-sm text-left"></button>\
                    <div class="dropdown-menu rounded-0" aria-labelledby="menuManager" role="menu">\
                    </div>\
                  </div>\
                  <button type="button" id="submitMenu" class="btn btn-primary btn-flat col-auto" aria-label="수정">수정</button>\
                </div>\
                <div class="form-group d-flex">\
                  <label for="menuNoShow" class="col-2 col-lg-1 p-0 col-form-label col-form-label-sm">노쇼내역</label>\
                  <div class="col-10 col-lg-11 pl-sm-0 mr-auto">\
                    <span id="menuNoShow"></span>\
                  </div>\
                </div>\
                <div class="form-group border-top">\
                  <ul id="menuTabs" class="nav nav-tabs mt-3" role="tablist">\
                    <li class="nav-item active" style="display:flex;">\
                      <a class="nav-link active" id="menuHistoryTab" data-toggle="tab" href="#menuHistory" role="tab" aria-controls="menuHistory" aria-selected="true">예약내역</a>\
                    </li>\
                    <li class="nav-item" style="display:flex;">\
                      <a class="nav-link" id="menuAlrimTab" data-toggle="tab" href="#menuAlrim" role="tab" aria-controls="menuAlrim" aria-selected="false">알림톡 내역</a>\
                    </li>\
                  </ul>\
                  <div class="tab-content">\
                    <div id="menuHistory" class="col-12 my-3 tab-pane fade show active px-0" role="tabpanel" aria-labelledby="menuHistoryTab"></div>\
                    <div id="menuAlrim" class="col-12 my-3 tab-pane fade accordion px-0" role="tabpanel" aria-labelledby="menuAlrimTab"></div>\
                  </div>\
                  <div class="ml-3 px-0 btn addHistory">\
                    <p class="text-secondary align-top mb-0">\
                      <i class="fas fa-plus" aria-label="예약 추가하기"></i> 예약 추가하기\
                    </p>\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>').on('show.bs.modal', initMenuModal));
  
  $("#updateMenuLink").on("touch click", function(){
    $(".updatingMenu-collapsed").toggle();
    $(".updatingMenu-expanded").toggle();
    $("#mainMenuTools .updatingMenu-collapsed").toggleClass('d-inline-flex');
    if($(".updatingMenu-collapsed").is(":visible")){
      if($("#mainMenuList").data('sortable')){
        $("#mainMenuList").data('sortable').option('disabled',false);
      }
      $(this).text('완료');
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
              '<div class="col px-0 montserrat">'+(item.cardPrice == 0 || !item.cardPrice ? '-' : (item.cardPrice+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
              '<div class="col-3 px-0 montserrat">'+(item.cashPrice == 0 || !item.cashPrice ? '-' : (item.cashPrice+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))+'</div>' +
              '<div class="col-3 px-0 montserrat">'+(item.memberPrice == 0 || !item.memberPrice ? '-' : (item.memberPrice+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
              '<div class="col-1 updatingMenu-collapsed"><button type="button" class="deleteMenuLink close p-0 m-0" aria-label="삭제"><span aria-hidden="true">&times;</span></button></div>'+
              '<a class="menuModalLink" href="#" data-toggle="modal" data-target="#menuModal" title="상세보기"></a>'+
              '</div>'
      }
      return html;
  }
  function drawMenuList(refresh) {
      var list = $("#mainMenuList");
      var html = "";
      var goalIndex;
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
        initMenuModal();
      }).on("touch click", ".deleteMenuLink", function(e){
        e.stopPropagation();
        $(this).parents('.menuRow').data('action', 'delete').hide();
        /*if (confirm("정말 이 메뉴 항목을 삭제하시겠어요?")) {
          var index = Number($(this).parentsUntil(undefined, ".card").data("index"));
          if (Number.isInteger(index)) {
            var menu = NMNS.menuList[index];
            if (menu) {
                NMNS.history.push($.extend({ "index": index }, menu));
                NMNS.socket.emit("delete menu", { "id": menu.id });
                NMNS.menuList.remove(menu.id, function(item, target) { return item.id === target });
                drawMenuList(true);
            }
          }
        }*/
      }));
      if(!list.data('sortable')){
        list.data('sortable', Sortable.create(list[0], {animation:150, disabled:true, forceFallback:true}));
      }
  }

  function initMenuModal(){
    
  }
  NMNS.socket.on("get menu list", socketResponse("메뉴 리스트 조회", function(e) {
      NMNS.menuList = e.data;
      currentMenuCount = 0;
      drawMenuList(true);
  }));
  NMNS.socket.on("add menu", socketResponse("메뉴 추가", function(e) {
      /*var index = NMNS.menuList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          NMNS.menuList[index].totalNoShow = e.data.totalNoShow || 0;
          NMNS.menuList[index].myNoShow = 0;
      }
      $("#menuAddName").val('');
      $("#menuAddContact").val('');
      $("#menuAddEtc").val('');*/
  }, function(e) {
      /*var index = NMNS.menuList.findIndex(function(item) {
          return item.id === e.data.id;
      });
      if (Number.isInteger(index) && index > -1) {
          NMNS.menuList.splice(index, 1);
          drawMenuList(true);
      }*/
  }));
  NMNS.menuList = [{id: 1, name:'매니큐어', cashPrice:10000, cardPrice:20000, memberPrice:10000}, {id: 2, name:'매니큐어2', cashPrice:10000, cardPrice:20000, memberPrice:10000}, {id: 3, name:'매니큐어3', cashPrice:10000, cardPrice:20000, memberPrice:10000}, {id: 4, name:'매니큐어4', cashPrice:10000, cardPrice:20000, memberPrice:10000}, {id:5, name:'매니큐어5', cashPrice:10000, cardPrice:20000, memberPrice:10000}, {id: 6, name:'매니큐어6', cashPrice:10000, cardPrice:20000, memberPrice:10000}]
  drawMenuList(true);
})();