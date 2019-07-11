'use strict';

const db = require('./webDb');
const newDb = require('./newDb');
const util = require('./util');
const hangul = require('hangul-js');

const logger = global.nmns.LOGGER;

/**
 * 고객 조회
 * 요청 위치 : "get customer",
 * 데이터 : {"name":${고객 이름, string}, "contact":${고객 모바일, string}}
 * 응답 형식 : "data":{"id": ${아이디, string}, "contact":${고객 모바일, string}, "name":${고객이름, string, optional}, "totalNoShow":${총 노쇼 횟수, number, optional}, "myNoShow":${내 매장 노쇼 횟수, number, optional}, "isAllDay":${마지막예약이 하루종일인지, boolean, optional}, "manager":${고객원장의 담당자 id, string, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}, "etc":${부가정보, string}} "pointMembership":${누적 멤버십 포인트, number}, "cardSales":${누적 카드 매출, number}, "cashSales":${누적 현금 매출, number},
 * 조회된 내용이 없어도 빈 객체로 줘야함
 * 고객 이름 없는 경우 빈칸("")으로 나감
 * 고객 이름이 있는 경우 고객이름&고객연락처 and조건으로 조회 / 없는 경우 고객 모바일로만 조회
 */
exports.getCustomerDetail = async function (data) {
    let email = this.email;
    let status = false, message, customer = {};
    let contact = data.contact;
    let name = data.name;

    try {
        if (!contact && !name) {
            throw '고객조회를 위한 전화번호 또는 이름이 필요합니다.';
        }

        let list = await newDb.getCustomerList(email, contact, name);
        if (list.length > 0) {
            customer = list[0];
            customer.isAllDay = false;

            if (contact) {
                let noShowList = await newDb.getNoShow(contact);
                customer.totalNoShow = noShowList.length;
                customer.myNoShow = (noShowList.filter(noShow => noShow.email === email)).length;
            }

            let reservationList = await newDb.getReservationList(email, undefined, undefined, false);
            let reservation = reservationList.find(reservation => reservation.member === customer.id);
            if (reservation && reservation.contentList) {
                customer.contents = JSON.stringify(reservation.contentList);
            }

            if (!customer.name) {
                customer.name = '';
            }
        }
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        message: message,
        data: customer
    };
};

/**
 * 고객 정보 조회(자동완성용)(클라이언트 완료)
 * 요청 위치 : "get customer info",
 * 데이터 : {**"target":${조회할 전화번호 혹은 고객이름, string, optional}, **"id":${클라이언트로 그대로 넘겨줄 값, string}, "name":${이름, string, optional}, "contact":${전화번호, string, optional}}
 * 응답 형식 : "data" : {"id":${요청시 받은 id, string}, "query":${요청시 받은 전화번호 혹은 이름, string, optional}, "result":{[{"contact":${고객전화번호, string}, "name":${고객이름, string, optional}]}
 * 고객 이름이 없는 경우도 있을 수 있음(예약할때 이름 비우고 넣은 경우에도 기 입력 정보로 포함)
 * target, contact와 name 셋 중 하나는 반드시 포함
 */

exports.getCustomerInfo = async function (data) {
    let email = this.email;
    let status = false, message, resultData = {}, list = [];
    let target = data.target;
    if (!target) {
        target = data.contact || data.name;
    }

    try {
        if (!target) {
            throw '연락처 혹은 이름 둘 중 하나는 필수입니다.';
        }

        list = await newDb.getCustomerList(email);
        list = list.filter((member) => {
            if (member.contact && member.contact.includes(target)) {
                return true;
            }

            if (hangul.search(member.name, target) !== -1) {
                return true;
            }

            //초성검색
            let names = hangul.disassemble(member.name, true).map(nameList => nameList[0]).join('');
            if (names.includes(hangul.disassemble(target).join(''))) {
                return true;
            }

            return false;
        });

        list.sort(function (m1, m2) {
            let name1 = m1.name || 'Z';
            let name2 = m2.name || 'Z';
            return name1.localeCompare(name2);
        });
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    resultData.id = data.id;
    resultData.query = target;
    resultData.result = list;
    return {
        status: status,
        data: resultData,
        message: message
    };
}



/**
 * 고객 목록 조회
 * 요청 위치 : "get customer list",
 * 데이터 : {"type":${검색타입, string}, "target":${검색어, string, optional}, "sort":${고객 정렬 방법, string, optional}}
 * 응답 형식 : "data":[{"id": ${아이디, string}, "name": ${고객 이름, string, optional}, "contact":${고객 연락처, string, optional}, "reservCount":${총 예약 횟수, number}, "totalNoShow":${총 노쇼횟수, number}, "myNoShow":${내 매장 노쇼횟수, number}, "etc":${고객메모, string, optional}, "managerId":${매니저 아이디, string, optional}, "pointMembership":${누적 멤버십 포인트, number}, "cardSales":${누적 카드 매출, number}, "cashSales":${누적 현금 매출, number}, "history":[{"start":${예약시작일시, YYYYMMDDHHmm, string}, "end":${예약종료일시, YYYYMMDDHHmm, string}, "managerId":${담당자 id, string, optional}, "managerName":${담당자 이름, string, optional}, "managerColor":${담당자 색깔 '#RRGGBB'형식, string, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}, "status":${예약상태, string}, "price":${해당 예약에서의 매출액, number, optional}}]}]
 * 요청의 정렬타입(sort)는 "sort-name", "sort-date", "sort-manager" 중 1가지; 각각은 이름(오름차순), 마지막 방문일(내림차순), 매니저 이름(오름차순)을 나타냄. 값이 비어있을 경우 기본으로 sort-name; sort-name은 값이 없는경우 가장 마지막에. 값이 같을 경우 마지막 방문일 내림차순, 방문일도 같을 경우 매니저 이름 오름차순. sort-date는 값이 없는 경우 가장 마지막에. 값이 같을 경우 이름 오름차순, 이름도 같을 경우 매니저 이름 오름차순. sort-manager는 값이 없는 경우 가장 마지막에, 값이 같을 경우 이름 오름차순, 이름도 같을 경우 마지막 방문일 내림차순.
 * 고객별 히스토리도 방문일시 내림차순으로 정렬
 * history 없으면 빈 array 줘야함
 * number항목 숫자로 줘야함(없으면 0)
 * 응답에서 담당자 id아니고 이름과 색깔임(삭제 고려)
 * 요청의 검색타입은 "all", "name", "contact", "manager"중 1가지(추가 가능)
 */
exports.getCustomerList = async function (data) {
    let email = this.email;
    let status = false, message, list = [];
    try {
        let type = data.type;
        if(type !== 'all' && type !== 'name' && type !== 'contact' && type !== 'manager'){
            throw `type이 올바르지 않습니다.(${type})`;
        }
        let sort = data.sort || 'sort-name';
        if(sort !== 'sort-name' && sort !== 'sort-date' && sort !== 'sort-manager'){
            throw `sort 값이 올바르지 않습니다.(${sort})`;
        }
        let target = data.target;

        list = await newDb.getCustomerList(email);
        let staffList = await db.getStaffList(email);
        if(target && target.trim().length > 0){
            list = list.filter(customer => {
                if ((type === 'name' || type === 'all') && customer.name && customer.name.includes(target)) {
                    return true;
                }
                if ((type === 'contact' || type === 'all') && customer.contact && customer.contact.includes(target)) {
                    return true;
                }
                if ((type === 'manager' || type === 'all') && customer.managerId) {
                    let staff = staffList.find(staff => staff.id === customer.managerId);
                    if (staff && staff.name.includes(target)) {
                        return true;
                    }
                }
            });
        }

        for(let customer of list) {
            customer.totalNoShow = 0;
            customer.myNoShow = 0;
            if (customer.contact) {
                let noShowList = await newDb.getNoShow(customer.contact);
                customer.totalNoShow = noShowList.length;
                customer.myNoShow = (noShowList.filter(noShow => noShow.email === email)).length;
            }

            let reservationList = await newDb.getReservationList(email, undefined, undefined, false);
            reservationList = reservationList.filter(item => item.member === customer.id);
            customer.reservCount = reservationList.length;
            customer.history = reservationList;

            let staff = staffList.find(staff => staff.id === customer.managerId);
            if(staff){
                customer.managerName = staff.name;
            }

            for(let reservation of customer.history){
                reservation.managerId = reservation.manager;

                let staff = staffList.find(staff => staff.id === reservation.managerId);
                if(staff){
                    reservation.managerName = staff.name;
                    reservation.managerColor= staff.color;
                }

                if(reservation.contentList){
                    reservation.contents = JSON.stringify(reservation.contentList);
                }

                reservation.price = 0;
                let salesList = await newDb.getSalesHist(email, {scheduleId: reservation.id});
                for(let sales of salesList){
                    reservation.price += sales.price;
                }
            }
        }
        list.sort(getSortFunc(sort));
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        message: message,
        data: list
    };

};

function getSortFunc(action) {
    switch (action) {
        case 'sort-date':
            return function (a, b) {
                let aDate = '0';
                let bDate = '0';
                if (!a.history || a.history.length > 0) {
                    aDate = a.history[0].start;
                }
                if (!b.history || b.history.length > 0) {
                    bDate = b.history[0].start;
                }
                let result = bDate - aDate;
                return result === 0 ? getSortFunc("sort-name")(a, b) : result;
            };
        case 'sort-manager':
            return function (a, b) {
                let a1 = a.managerName || 'Z';
                let b1 = b.managerName || 'Z';
                if(a1 < b1){
                    return -1;
                }else if(a1 > b1){
                    return 1;
                }else{
                    return getSortFunc("sort-name")(a, b);
                }
            };
        case 'sort-name':
        default:
            return function (a, b) {
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



/**
 * 고객 추가
 * 요청 위치 : "add customer",
 * 데이터 : {"id":${고객 id, string}, "name":${고객 이름, string}, "contact":${고객 연락처, string}, "etc":${고객메모, string, optional}, "managerId":${매니저 아이디, string}}
 * 응답 형식 : "data":{"id":${요청에서 넘겨준 id, string}, "totalNoShow":${총 노쇼횟수, number, optional}}
 * name, contact 둘 중 하나는 필수
 * 매니저가 배정되지 않은 경우 managerId는 ""로 세팅
 */
exports.addCustomer = async function (data) {
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id, totalNoShow: 0};

    try {
        if(data.contact){
            let old = await newDb.getCustomerList(email, data.contact);
            if(old.length > 0){
                old = old[0];
                throw `동일한 연락처를 가진 고객이 이미 존재합니다.(이름:${old.name}, 연락처:${old.contact})`;
            }
        }

        await newDb.saveCustomer({
            email: email,
            id: data.id,
            name: data.name,
            contact: data.contact,
            managerId: data.managerId === '' ? undefined : data.managerId,
            etc: data.etc
        });
        status = true;
        if (data.contact) {
            resultData.totalNoShow = (await newDb.getNoShow(data.contact)).length;
        }
    } catch (e) {
        status = false;
        message = e;
        logger.error(e);
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
};

/**
 * 고객정보 수정
 * 요청 위치 : "update customer",
 * 데이터 : {"id":${고객 id, string}, "name":${고객 이름, string}, "contact":${고객 연락처, string}, "etc":${고객메모, string, optional}, "managerId":${매니저 아이디, string}}
 * 수정 한 고객의 모든 정보를 업로드 한다.
 * 응답 형식 : "data":{"id":${요청에서 넘겨준 id, string}, "reason":${실패사유, string, optional}}
 * 응답의 실패사유는 "이미 이름과 연락처가 동일한 고객이 존재할 경우에만 세팅, 이 경우 반드시 "DUPLICATED"로 세팅
 * 이렇게 세팅해서 줄 경우 클라이언트에서 유저에게 확인 절차 후 바로 27-1 고객정보 병합 요청을 보내도록 함
 */
exports.updateCustomer = async function (data) {
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};

    try {
        let memberList = await newDb.getCustomerList(email, data.contact, data.name);
        if (memberList.find(member => member.id !== data.id)) {
            resultData.reason = 'DUPLICATED';
            throw '이미 이름과 연락처가 동일한 고객이 존재합니다.';
        }

        await newDb.saveCustomer({
            email: email,
            id: data.id,
            name: data.name,
            contact: data.contact,
            managerId: data.managerId === '' ? undefined : data.managerId,
            etc: data.etc
        });
        status = true;
    } catch (e) {
        status = false;
        message = e;
        logger.error(e);
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
};

/**
 * 고객 삭제
 * 요청 위치 : "delete customer",
 * 데이터 : {"id":${고객 id, string}}
 * 응답 형식 : "data":{"id":${요청에서 넘겨준 id, string}}
 */
exports.deleteCustomer = async function (data) {
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};

    try {
        await newDb.deleteCustomer(email, data.id);
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
}

/**
 * 고객정보 병합
 * 요청 위치 : "merge customer",
 * 데이터 : {"id":${합쳐지기 이전 변경하려고 했던 고객 id, string}, "name":${합친 이후 고객 이름, string}, "contact":${합친 이후 고객 연락처, string}, "etc":${합친 이후 덮어쓸 고객메모, string}, "managerId":${매니저 아이디, string}}
 * 응답 형식 : "data":{"id":${요청에서 전달한 고객 id, string}, "targetId":${합쳐진 고객 id, string, optional}}
 * targetId는 실패할 경우 주지 않아도 된다.
 * id의 고객예약/알림톡 내역을 targetId의 고객예약/알림톡 내역에 합치는것으로 이후 "id" 아이디를 가진 고객은 사라짐
 * etc, managerId는 targetId 고객의 정보에 덮어씌우기
 */
exports.mergeCustomer = async function(data){
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};

    try {
        let list = await newDb.getCustomerList(email, data.contact, data.name);
        let target = list.find(customer => customer.id !== data.id );
        if(!target){
            throw `합치려 하는 고객 정보가 없습니다.(name: ${data.name}, contact: ${data.contact})`;
        }
        target.etc = data.etc;
        target.managerId = data.managerId;

        //예약 원장의 고객 아이디 변경
        let reservationList = await newDb.getReservationList(email);
        reservationList = reservationList.filter(reservation => reservation.member === data.id);
        for(let reservation of reservationList){
            reservation.member = target.id;
            reservation.contact = target.contact;
            reservation.name = target.name;
            await newDb.saveReservation(reservation);
        }

        //매출내역의 고객 아이디 변경
        let salesList = await newDb.getSalesHist(email, {customerId: data.id});
        for(let sales of salesList){
            sales.customerId = target.id;
            await newDb.saveSales(sales);
        }

        //기존 고객 삭제
        await newDb.deleteCustomer(email, data.id);

        resultData.targetId = target.id;
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
}
