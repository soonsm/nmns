/*global moment, NMNS, $, PerfectScrollbar, dashContact, socketResponse, filterNonNumericCharacter, generateRandom */
(function() {
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

    function drawCustomerList() {
        var list = $("#mainCustomerList");
        list.children(".card").remove();
        if (!list.hasClass("ps")) {
            list.data("scroll", new PerfectScrollbar(list[0], { suppressScrollX: true }));
        }
        var html = "";
        if (NMNS.customerList && NMNS.customerList.length > 0) {
            var managers = NMNS.calendar.getCalendars();
            NMNS.customerList.forEach(function(customer, index) {
                var manager = managers.find(function(item) { return item.id === customer.managerId; });
                html += '<div class="card row shadow-sm" data-index="' + index + '"><div class="card-body"><h5 class="card-title mb-sm-1' + (customer.history && customer.history.length > 0 ? '' : ' longTitle') + '">' + (!customer.name || customer.name === '' ? '(이름없음)' : customer.name) +
                    (!customer.contact || customer.contact === '' ? '' : '&nbsp;<small class="card-subtitle text-muted d-none d-sm-inline-block">' + dashContact(customer.contact) + '</small>') + //'&nbsp;<span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="background-color:' + (manager ? manager.borderColor : '#b2dfdb') + '"></span><small>' + (manager ? manager.name : '(담당자 없음)') + '</small>' + 
                    '</h5>' + (!customer.contact || customer.contact === '' ? '' : '<a href="tel:' + customer.contact + '" class="d-inline-block d-sm-none customerContactLink"><span class="card-subtitle text-muted"><i class="fas fa-phone fa-rotate-90"></i> ' + dashContact(customer.contact) + '</span></a>') +
                    (customer.history && customer.history.length > 0 ? '<div><small class="d-sm-none">총 ' + customer.history.length + '회 방문 | 마지막 방문 ' + moment(customer.history[0].date, "YYYYMMDDHHmm").format("YYYY-MM-DD") + '</small></div>' : '') +
                    '<div class="col-12 row px-0 mx-0"><div class="col-4 pl-0 border-right"><small class="text-muted">담당자</small><br/><span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="background-color:' + (manager ? manager.borderColor : '#b2dfdb') + '"></span><span> ' + (manager ? manager.name : '(담당자 없음)') + '</span></div><div class="col-8 pr-0"><small class="text-muted">메모</small><br/><span>' + (customer.etc || '') + '</span></div></div>' +
                    '</div><div class="cardLeftBorder" style="background-color:' + (manager ? manager.borderColor : '#b2dfdb') + '"></div><small class="customerSubInfo text-muted">' + (customer.history && customer.history.length > 0 ? '<span class="d-none d-sm-inline-block">총 ' + customer.history.length + '회 방문 | 마지막 방문 ' + moment(customer.history[0].date, "YYYYMMDDHHmm").format("YYYY-MM-DD") + ' |&nbsp;</span>' : '') + '<a class="deleteCustomerLink text-muted" href="#" title="삭제"><i class="fas fa-times"></i> 삭제</a>' +
                    '</small><a class="w-100 h-100 position-absolute customerModalLink" href="#" data-toggle="modal" data-target="#customerModal" title="상세보기"></a></div></div>';
                if (index > 0 && index % 50 == 0) {
                    list.append(html);
                    html = "";
                }
            });
            list.append(html);
            list.data("scroll").update();
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
                            drawCustomerList();
                        }
                    }
                }
            });
            $("#customerCount").text(NMNS.customerList.length);
        }
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
        drawCustomerList();
    }));
    NMNS.socket.on("add customer", socketResponse("고객 추가", function(e) {
        var index = NMNS.customerList.findIndex(function(item) {
            return item.id === e.data.id;
        });
        if (index && index > -1) {
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
        if (index && index > -1) {
            NMNS.customerList.splice(index, 1);
            drawCustomerList();
        }
    }));
    NMNS.socket.on("update customer", socketResponse("고객정보 수정", function(e) {
        var index = NMNS.customerList.findIndex(function(item) {
            return item.id === e.data.id;
        });
        if (index && index > -1) {
            var customer = NMNS.customerList[index];
            customer.name = $("#customerName").val();
            customer.contact = $("#customerContact").val();
            customer.etc = $("#customerEtc").val();
            customer.managerId = $("#customerManager").data("calendar-id");
            var managers = NMNS.calendar.getCalendars();
            customer.manager = managers[managers.findIndex(function(manager) { return manager.id === customer.managerId; })];
            alert("고객의 정보를 수정하였습니다.");
            drawCustomerList();
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
        if (index && index > -1) {
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
        drawCustomerList();
    }));
    NMNS.socket.on("merge customer", socketResponse("고객정보 합치기", function() {
        NMNS.socket.emit("get customer list", { "type": "all", "target": ($("#customerSearchTarget").val() === "" ? undefined : $("#customerSearchTarget").val()), "sort": $($(".customerSortType.active")[0]).data("action") });
        alert("두 고객의 정보와 예약, 알림톡 내역을 합쳤습니다.");
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
        drawCustomerList();
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
        $("#customerSort span").text($("#customerSort").next().children("[data-action='" + action + "']").attr("aria-label"));
    }
    $(".customerSortType").off("touch click").on("touch click", function(e) {
        if ($(this).hasClass("active")) return;
        var action = e.target.getAttribute('data-action');
        if (!action) {
            action = e.target.parentElement.getAttribute('data-action');
        }
        NMNS.customerList.sort(getSortFunc(action));
        drawCustomerList();
        switchSortTypeButton(action);
    });

    function searchCustomerList(target) {
        NMNS.socket.emit("get customer list", { type: "all", "target": target });
    }
    $("#customerSearchBtn").on("touch click", function(e) {
        e.preventDefault();
        searchCustomerList($("#customerSearchTarget").val());
    });
    $("#customerSearchTarget").on("keyup", function(e) {
        if (e.which === 13) {
            searchCustomerList($(this).val());
        }
    });
    $(".addCustomerLink").on("touch click", function(e) {
        e.preventDefault();
        if (!$("#mainCustomer").is(":visible")) {
            $($("#sidebarContainer .customerMenuLink")[0]).trigger("click");
        }
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
})();