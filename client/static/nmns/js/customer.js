/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, filterNonNumericCharacter, generateRandom */
(function() {
    $("#mainRow").append('<div id="customerModal" class="modal fade" tabIndex="-1" role="dialog" aria-hidden="true" data-index="0">\
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">\
          <div class="modal-content">\
            <div class="modal-header">\
              <span>\
                <h5 class="modal-title" id="customerTitle">고객 상세정보</h5>\
              </span>\
              <button type="button" class="close" data-dismiss="modal" aria-label="닫기">\
                <span aria-hidden="true">&times;</span>\
              </button>\
            </div>\
            <div class="modal-body">\
              <div class="form-group">\
                <div class="row mb-2">\
                  <div class="col-lg-6 col-12 text-center">\
                    <input id="customerName" type="text" placeholder="이름" class="form-control col-12 border-0 text-center my-3"/>\
                    <input id="customerContact" type="text" placeholder="연락처" class="form-control col-12 border-0 text-center my-3"/>\
                  </div>\
                  <div class="col-lg-6 col-12">\
                    <label for="customerEtc" class="col-12 px-0 col-form-label col-form-label-sm">메모</label>\
                    <div class="col-12 px-0">\
                      <textarea id="customerEtc" type="text" placeholder="이 고객에 대한 메모를 적어주세요." class="form-control han"></textarea>\
                    </div>\
                  </div>\
                </div>\
                <div class="row mb-2 px-3">\
                  <label for="customerManager" class="col-2 col-lg-1 p-0 col-form-label col-form-label-sm">담당자</label>\
                  <div class="col-lg-10 col-sm-8 col-7 px-0 mr-auto">\
                    <button id="customerManager" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-sm dropdown-toggle btn-flat form-control form-control-sm text-left"></button>\
                    <div class="dropdown-menu rounded-0" aria-labelledby="customerManager" role="menu">\
                    </div>\
                  </div>\
                  <button type="button" id="submitCustomer" class="btn btn-primary btn-flat col-auto" aria-label="수정">수정</button>\
                </div>\
                <div class="form-group d-flex">\
                  <label for="customerNoShow" class="col-2 col-lg-1 p-0 col-form-label col-form-label-sm">노쇼내역</label>\
                  <div class="col-10 col-lg-11 pl-sm-0 mr-auto">\
                    <span id="customerNoShow"></span>\
                  </div>\
                </div>\
                <div class="form-group border-top">\
                  <ul id="customerTabs" class="nav nav-tabs mt-3" role="tablist">\
                    <li class="nav-item active" style="display:flex;">\
                      <a class="nav-link active" id="customerHistoryTab" data-toggle="tab" href="#customerHistory" role="tab" aria-controls="customerHistory" aria-selected="true">예약내역</a>\
                    </li>\
                    <li class="nav-item" style="display:flex;">\
                      <a class="nav-link" id="customerAlrimTab" data-toggle="tab" href="#customerAlrim" role="tab" aria-controls="customerAlrim" aria-selected="false">알림톡 내역</a>\
                    </li>\
                  </ul>\
                  <div class="tab-content">\
                    <div id="customerHistory" class="col-12 my-3 tab-pane fade show active px-0" role="tabpanel" aria-labelledby="customerHistoryTab"></div>\
                    <div id="customerAlrim" class="col-12 my-3 tab-pane fade accordion px-0" role="tabpanel" aria-labelledby="customerAlrimTab"></div>\
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
      </div>')
    
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

    function drawCustomerHistoryList(customer) {
        var list = $("#customerHistory");
        list.children(".card, span").remove();
        if (!list.hasClass("ps")) {
            list.data("scroll", new PerfectScrollbar(list[0]));
        }
        if (!customer.history || customer.history.length === 0) {
            list.append("<span class='text-center'>아직 이 고객에 등록된 예약내역이 없습니다.</span>");
        } else {
            var html = "";
            customer.history.forEach(function(history, index) {
                html += '<div class="card col-12 col-lg-10 shadow-sm" data-index="' + index + '"><div class="card-body"><h6 class="mb-1">' + (!history.contents || history.contents === '' ? '(예약내용 없음)' : history.contents) + ' ';
                switch (history.status) {
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
                html += (moment(history.date, 'YYYYMMDDHHmm').isValid() ? '<small class="text-muted d-none d-lg-inline-block float-right">' + moment(history.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm') + '</small>' : '') + '</h6>' +
                    '<div class="col-12 px-0">' + (moment(history.date, 'YYYYMMDDHHmm').isValid() ? '<span class="card-subtitle d-lg-none text-muted">' + moment(history.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm') + '</span>' : '') + (history.managerName && history.managerName !== '' ? '<span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="background-color:' + history.managerColor + '"></span><span> ' + history.managerName + '</span>' : '(담당자 없음)') +
                    '</div></div><div class="cardLeftBorder" style="background-color:' + (history.managerColor || '#b2dfdb') + '"></div></div></div>';
                if (index > 0 && index % 50 == 0) {
                    list.append(html).data("scroll").update();
                    html = "";
                }
            });
            list.append(html);
        }
        list.data("scroll").update();
    }

    function initCustomerModal(self) {
        var customer = NMNS.customerList[Number(self.parent().data("index"))];
        if (customer.id) {
            NMNS.socket.emit("get customer alrim", { "id": customer.id });
        } else {
            drawCustomerAlrimList([]);
        }
        $("#customerName").val(customer.name);
        $("#customerContact").val(customer.contact);
        $("#customerEtc").val(customer.etc);
        var text = "";
        if (customer.totalNoShow === 0) {
            text = "이 고객은 노쇼하신 적이 없으시네요! :)";
        } else if (customer.myNoShow === 0) {
            text = "이 고객은 다른 매장에서 " + customer.totalNoShow + "번 노쇼하셨어요.";
        } else if (customer.myNoShow === customer.totalNoShow) {
            text = "이 고객은 우리 매장에서만 " + customer.totalNoShow + "번 노쇼하셨어요.";
        } else {
            text = "이 고객은 우리 매장에서 " + customer.myNoShow + "번, 전체 매장에서 " + customer.totalNoShow + "번 노쇼하셨어요.";
        }
        $("#customerNoShow").text(text);
        drawCustomerHistoryList(customer);
        var manager = NMNS.calendar.getCalendars().find(function(item) { return item.id === customer.managerId; });
        $("#customerManager").html("<span class='tui-full-calendar-icon tui-full-calendar-calendar-dot' style='background-color: " + (manager ? manager.borderColor : "#b2dfdb") + "'></span><span class='tui-full-calendar-content'>" + (manager ? manager.name : "(담당자 없음)") + "</span>").data("calendar-id", (manager ? manager.id : "")).data("bgcolor", (manager ? manager.borderColor : "#b2dfdb"));
        $("#customerModal").data("customer", customer);
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
                '<div class="col col-4 px-0 montserrat">'+(item.sales == 0 || !item.sales ? '-' : (item.sales+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div>' +
                '<div class="col col-4 px-0 montserrat">'+(item.membership == 0 || !item.membership ? '-' : (item.membership+'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")) + '</div></div>' +
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
            initCustomerModal($(this));
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
    $(".addHistory").on("touch click", function(e) {
        $($("#sidebarContainer .calendarMenuLink")[0]).trigger("click");
        $("#customerModal").data("trigger", true).modal("hide");
    });
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
            NMNS.calendar.openCreationPopup({ title: customer.name, start: now.toDate(), end: now.add(30, "m").toDate(), raw: { contact: customer.contact, etc: customer.etc }, calendarId: (customer.managerId ? customer.managerId : undefined) });
        }
    }).on("shown.bs.modal", function() {
        $("#customerName").focus();
    });
    $("#customerContact, #customerAddContact").off("blur").on("blur", function() {
        filterNonNumericCharacter($(this));
    });
    $("#submitCustomerAdd").on("touch click", function(e) {
        e.preventDefault();
        if ($("#customerAddName").val() === '' && $("#customerAddContact").val() === '') {
            alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
            return;
        }
        var customer = {
            id: generateRandom(),
            name: $("#customerAddName").val(),
            contact: $("#customerAddContact").val(),
            etc: $("#customerAddEtc").val(),
            managerId: $("#customerAddManager").data("calendar-id")
        };
        NMNS.socket.emit("add customer", customer);
        NMNS.customerList.splice(0, 0, customer);
        drawCustomerList(true);
    });
    $("#submitCustomer").on("touch click", function(e) {
        e.preventDefault();
        var customer = $("#customerModal").data("customer");
        if (customer) {
            if ($("#customerName").val() === '' && $("#customerContact").val() === '') {
                alert("고객 이름과 전화번호 중 하나는 반드시 입력해주세요.");
                return;
            }
            NMNS.socket.emit("update customer", {
                id: customer.id,
                name: $("#customerName").val(),
                contact: $("#customerContact").val(),
                etc: $("#customerEtc").val(),
                managerId: $("#customerManager").data("calendar-id")
            });
        } else {
            alert("알 수 없는 오류입니다. 새로고침 후 다시 시도해주세요.");
        }
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
        if (!$(".customerMenu").is(":visible")) {
            $("#sidebarContainer .menuLink[data-link='customerMenu']").trigger("click");
        }
        $("#customerModal").modal('show');
        var name = $("#customerAddName"); // Save reference for better performance
        name.focus();
        var icon = $("#customerAddNameIcon");
        var count = 6;
        var interval = setInterval(function() {
            if (count > 0) {
                name.toggleClass("blink");
                icon.toggleClass("blink");
                count--;
            } else {
                clearInterval(interval);
            }
        }, 150);
    });
    
    function getDistFromBottom () {
      var scrollPosition = window.pageYOffset;
      var windowSize     = window.innerHeight;
      var bodyHeight     = document.body.offsetHeight;
    
      return Math.max(bodyHeight - (scrollPosition + windowSize), 0);
    }
    var isLoading = false;
    $(document).on("scroll", debounce(function(){
        var distance = getDistFromBottom();
        if($("#mainCustomerList").is(":visible") && !isLoading && NMNS.customerList && currentCustomerCount < NMNS.customerList.length && distance < Math.max(100, window.innerHeight * 0.2)){
            isLoading = true;
            $("#mainCustomerLoading").show();
            drawCustomerList();
            $("#mainCustomerLoading").hide();
            isLoading = false;
        }
    }, 100));
    
})();