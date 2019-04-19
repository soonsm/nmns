'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const moment = require('moment');


/**
 매출 조회 Data Model
 id: 매출 id(서버 생성)
 type: MEMBERSHIP_ADD(멤버십 적립), MEMBERSHIP_USE(멤버십 사용), MEMBERSHIP_INCREMENT(멤버십 수정 증가), MEMBERSHIP_DECREMENT(멤버십 수정 감소), SALES_CARD(카드매출), SALES_CASH(현금매출)
 date: 매출날짜
 time: 매출시간
 scheduleId: 예약 아이디
 customerId: 고객 아이디
 item: 매출 내용
 payment: 결제수단, CASH, CARD, MEMBERSHIP
 price: 금액(멤버십 사용의 경우 사용된 멤버십 금액)
 membershipChange: 멤버십 변동값
 managerId: 매니저 아이디
 isDeleted: 삭제여부 boolean
 */

/**
 * 함수 생성기
 * @param fn
 * @returns {Promise<function(*=): {status: boolean, data: *, message: *}>}
 */
let fnTemplate = function(preFn, mainFn, postFn, exceptionFn){
    let returnFn =  async function(data){
        let user = await db.getWebUser(this.email);
        let status=false,resultData, message;
        try{

            if(preFn){
                data = await preFn(user, data);
            }

            resultData = await mainFn(user, data);

            if(postFn){
                resultData = await postFn(user, resultData);
            }
            status = true;
        }catch(e){
            message = e;
            status = false;
            if(exceptionFn){
                resultData = await exceptionFn(user, data);
            }
        }

        return{
            status: status,
            data: resultData,
            message: message
        };
    }

    return returnFn;
}

/**
 * 매출 조회
 * @param
 * id, typeList(매출내역에 포함 할 매출 type list), start(매출날짜 시작일), end(매출날짜 종료일),
 * scheduleId(예약아이디), customerId(고객 아이디), item(매출 내용),
 * paymentList(매출내역에 포함 할 결제수단 리스트), priceStart(매출 가격 조회 최소 금액), priceEnd(매출 가격 조회 최대 금액),
 * managerId(매니저 아이디)
 * @returns {Promise<void>}
 */
let getSalesHistList = async function(user, data){
    if(!user){
        throw '사용자 정보가 없습니다.';
    }

    let saleHistList = user.saleHistList || [];

    saleHistList = await saleHistList.filter(saleHist => {
        if(saleHist.isDeleted){
            return false;
        }else if(data.id && data.id !== saleHist.id){
            return false;
        }else if(data.typeList && !data.typeList.includes(saleHist.type)){
            return false;
        }else if(data.start && saleHist.date < data.start){
            return false;
        }else if(data.end && saleHist.date > data.end){
            return false;
        }else if(data.scheduleId && data.scheduleId !== saleHist.scheduleId){
            return false;
        }else if(data.customerId && data.customerId !== saleHist.customerId){
            return false;
        }else if(data.item && !saleHist.item.includes(data.item)){
            return false;
        }else if(data.paymentList && !data.paymentList.includes(saleHist.payment)){
            return false;
        }else if(data.priceStart && data.priceStart > saleHist.price){
            return false;
        }else if(data.priceEnd && data.priceEnd < saleHist.price){
            return false;
        }else if(data.managerId && data.managerId !== saleHist.managerId) {
            return false;
        }else if(data.customerName){
            let memberList = user.memberList || [];
            let ids = memberList.filter(member => member.name && member.name.includes(data.customerName)).map(member => member.id);
            if(ids.includes(saleHist.customerId)){
                return true;
            }
            return false;
        }
        return true;
    });

    return saleHistList;
};

/**
 * 일별 매출내역 조회(카드 매출, 현금 매출, 멤버십 충전)
 * get sales list
 * @param data
 * @returns {Promise<void>}
 */
exports.getDaySalesHist = fnTemplate((user, data) => {
    if(!data.start || !moment(data.start, 'YYYYMMDD').isValid()){
        throw `올바른 날짜가 아닙니다.(${data.start})`;
    }

    if(!data.end || !moment(data.end, 'YYYYMMDD').isValid()){
        throw `올바른 매출 날짜가 아닙니다.(${data.end})`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH];

    delete data.id;

    return data;
}, getSalesHistList, async function(user, list){
    let totalSalesCount = list.length, totalSalesAmount =0;
    let totalSalesCard=0, totalSalesCash=0,totalSalesMembership=0;
    let salesList = [];

    list.forEach(sales => {
        totalSalesAmount += sales.price;
        if(sales.type === process.nmns.PAYMENT_METHOD.CARD){
            totalSalesCard += sales.price;
        }else if(sales.type === process.nmns.PAYMENT_METHOD.CASH){
            totalSalesCash += sales.price;
        }else if(sales.type === process.nmns.PAYMENT_METHOD.MEMBERSHIP){
            totalSalesMembership += sales.price;
        }
        sales.customerName = user.memberList.find(member => member.id === sales.customerId);
        salesList.push(sales);
    });
    salesList.sort((s1,s2) => s2.date - s1.date);
    return {
        totalSalesCount: totalSalesCount,
        totalSalesAmount: totalSalesAmount,
        totalSalesCard: totalSalesCard,
        totalSalesCash: totalSalesCash,
        totalSalesMembership: totalSalesMembership,
        sales: salesList
    };
});

/**
 * 월별 매출내역 조회(카드 매출, 현금 매출, 멤버십 충전)
 * @param data
 * @returns {Promise<{status: boolean, data: *, message: *}>}
 */
// exports.getMonthSalesHist = fnTemplate((user, data) => {
//     if(!data.start || !moment(data.start, 'YYYYMM').isValid()){
//         throw `올바른 날짜가 아닙니다.(${data.start})`;
//     }
//
//     if(!data.end || !moment(data.end, 'YYYYMM').isValid()){
//         throw `올바른 매출 날짜가 아닙니다.(${data.end})`;
//     }
//
//     data.start = data.start + '01';
//     data.end = data.end + '31';
//
//     data.typeList = [process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD, process.nmns.SALE_HIST_TYPE.SALES_CASH];
//
//     delete data.id;
//
//     return data;
// }, getSalesHistList);

/**
 * 예약 아이디로 매출내역 조회하기(카드 매출, 현금 매출, 멤버십 충전)
 *
 * 요청 위치 : 'get reserv sales', 데이터 : {'scheduleId' : ${예약 아이디, string}}
 * 요청 데이터의 예약 아이디로 조회되는 매출 내역이 있는 경우와 없는 경우 응답 데이터가 달라진다.
 *
 * 매출 내역이 존재 하는 경우 응답 : 'data': [{'id' : ${매출 id, string},'type' : ${매출 종류, string, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용)}, 'date' : ${매출날짜(YYYYMMDD), string}, 'time' : ${매출시간(hhmmss), string}, 'scheduleId' : ${매출과 연관된 예약 아이디, string}, 'customerId' : ${매출을 일으킨 고객 아이디, string}, 'item' : ${매출 내용, string}, 'payment' : ${결제수단(CASH, CARD, MEMBERSHIP), string}, 'price' : ${금액(멤버십 사용의 경우 사용된 멤버십), number}, 'managerId': ${담당자 아이디(매출관 연관된), string} ]
 *
 * 매출 내역이 존재하지 않는 경우 응답: 'data': [{'item': ${예약 상세 화면에 있는 시술 이름, string}, 'customerId':${고객 아이디, string}, 'managerId':${담당자 아이디, string}, 'priceCard' : ${카드 가격, number, optional}, 'priceCash' : ${현금 가격, number, optional}, 'priceMembership' : ${멤버십 가격, number, optional}, 'balanceMembership' : ${남은 멤버십 잔액, number} }]
 * priceCard, priceCash, priceMembership의 경우는 item이 메뉴에 등록되어 있는 경우에 제공된다.
 * @type {Promise<*>}
 */
exports.getSalesHistForReservation = fnTemplate((user, data) => {
    let scheduleId = data.scheduleId;
    let reservation = user.reservationList.find(reservation => reservation.id === scheduleId);
    if(!reservation){
        throw `예약아이디 ${scheduleId}로 조회되는 예약이 없습니다.`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH];

    delete data.id;

    return data;
}, async function(user, data){
    let list = await getSalesHistList(user, data);
    let reservation = user.reservationList.find(reservation => reservation.id === data.scheduleId);

    if((!list || list.length === 0) && reservation.type === 'R'){
        let contentList = reservation.contentList || [];

        let salesTemplateList = [];

        for(let i=0; i<contentList.length; i++){
            let content = contentList[i].value;
            let template = {
                item: content,
                customerId: reservation.memberId,
                managerId: reservation.manager
            };

            salesTemplateList.push(template);
        }

        list = salesTemplateList;
    }

    if(list && list.length > 0){
        let balanceMembership = user.memberList.find(member => member.id === reservation.memberId).pointMembership || 0;
        let menuList = user.menuList || [];
        for(let i=0; i<list.length; i++){
            let menu = menuList.find(menu => menu.name === list[i].item);
            list[i].balanceMembership = balanceMembership;
            if(menu){
                list[i].priceCash =  menu.priceCash;
                list[i].priceCard = menu.priceCard;
                list[i].priceMembership = menu.priceMembership;
            }
        }
    }

    return list;
});

/**
 * 멤버십 사용 내역 조회(멤버십 사용, 멤버십 수정(증/감))
 * 요청 위치 : 'get membership history',
 * 데이터 : {'customerId': ${고객아이디, 멤버십을 소유한 고객, string},'start':${조회 시작일(YYYYMMDD), string, optional}, 'end':${조회 종료일(YYYYMMDD), string, optional}}
 * 응답 형식 : 'data': [ 'id' : ${id, string}, 'customerId' : ${멤버십을 소유한 고객 아이디, string}, 'type' : ${종류, string, MEMBERSHIP_ADD(적립), MEMBERSHIP_INCREMENT(증가), MEMBERSHIP_DECREMENT(감소), MEMBERSHIP(사용)}, 'date' : ${날짜(YYYYMMDD), string}, 'time' : ${시간(hhmmss), string}, 'scheduleId' : ${멤버십 사용인 경우 연관된 예약 아이디, string, optional}, 'item' : ${멤버십 증감 내용, string}, 'payment' : ${멤버십 적립 결제수단(CASH, CARD), string, optional}, 'price' : ${ 멤버십 적립 시 계산한 금액, number, optional}, 'membershipChange' : ${멤버십 증감 값, number} 'managerId': ${멤버십 사용인 경우 연관된 담당자 아이디, string, optional}]
 * @type {Promise<function(*=): {status: boolean, data: *, message: *}>}
 */
exports.getMembershipHistory = fnTemplate((user, data) => {
    let customerId = data.customerId;
    let customer = user.memberList.find(member => member.id === customerId);
    if(!customer){
        throw `고객아이디 ${customerId}로 조회되는 고객이 없습니다.`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT];

    delete data.id;

    return data;

}, getSalesHistList, async function(user, list){
    list.forEach(sales => {
        sales.balanceMembership = sales.pointMembershipAtThatTime || 0;
        if(sales.type === process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE){
            sales.membershipChange = sales.price;
        }
    });
    return list;
});

/**
 * 고객의 누적 포인트, 누적 카드 매출, 누적 현금 매출 변경
 * @param member
 * @param isRefund
 * @param saleHist
 * @returns {*}
 */
let changeMemberSalesStatistic = function(member, isRefund, saleHist){

    let multiply = isRefund === true ? 1 : -1;

    switch(saleHist.type){
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT:
            member.pointMembership += multiply * saleHist.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT:
            member.pointMembership -= multiply * saleHist.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD:
            member.pointMembership = member.pointMembership - multiply*saleHist.membershipChange;
            if(saleHist.payment === process.nmns.PAYMENT_METHOD.CARD){
                member.cardSales -= saleHist.price * multiply;
            }else if(saleHist.payment === process.nmns.PAYMENT_METHOD.CASH){
                member.cashSales -= saleHist.price * multiply;
            }
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE:
            member.pointMembership += multiply * saleHist.price;
            break;
        case process.nmns.SALE_HIST_TYPE.SALES_CARD:
            member.cardSales -= saleHist.price * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.SALES_CASH:
            member.cashSales -= saleHist.price * multiply;
            break;
    }
    return member;
}

/**
 * 매출 저장(data.id 없으면 추가, 있으면 업데이트)
 * @param email
 * @param data
 * @returns {Promise<void>}
 */
let saveSalesHist = function(user, data){
    if(!user){
        throw '사용자 정보가 없습니다.';
    }

    let type = data.type;
    if(!type || !process.nmns.isValidSaleHistType(type)){
        throw `올바른 매출 종류가 아닙니다.(${type})`;
    }

    if(!data.date || !moment(data.date, 'YYYYMMDD').isValid()){
        throw `올바른 매출 날짜가 아닙니다.(${data.date})`;
    }

    if(!data.time || !moment(data.time, 'hhmmss').isValid()){
        throw `올바른 매출 시간이 아닙니다.(${data.time})`;
    }

    if(!data.customerId) {
        throw '고객 아이디가 없습니다.';
    }

    if(!data.item){
        throw '매출 내용이 있어야 합니다.';
    }

    let member = user.memberList.find(member => member.id === data.customerId);
    if(!member){
        throw `고객 아이디로 조회되는 고객이 없습니다.(${data.customerId})`;
    }

    member.pointMembership = member.pointMembership || 0;
    member.cardSales = member.cardSales || 0;
    member.cashSales = member.cashSales || 0;

    let commonValidationForMembership = function(data){
        if(isNaN(data.membershipChange) || data.membershipChange <= 0){
            throw `멤버십 변경 값은 양수 정수입니다.(${data.membershipChange})`;
        }
    };

    let commonValidationForReservation = function(data){
        if(!user.reservationList.find(reservation => reservation.id === data.scheduleId)){
            throw `예약아아디가 없거나 예약아이디로 예약이 조회되지 않습니다.(${data.scheduleId})`;
        }else if(!data.managerId){
            throw '매출내역 추가에 매니저 아이디가 필요합니다.';
        }else if(isNaN(data.price) || data.price <= 0){
            throw `매출내역 추가에 양수 정수인 금액 값이 필요합니다.(${data.price})`;
        }else if(!data.itemId){
            throw '매출내역에 시술 아이디가 필요합니다.';
        }
        data.payment = data.type;
    }

    switch(type){
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT:
            commonValidationForMembership(data);
            data.pointMembershipAtThatTime = member.pointMembership - data.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT:
            commonValidationForMembership(data);
            data.pointMembershipAtThatTime = member.pointMembership + data.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD:
            commonValidationForMembership(data);
            if(isNaN(data.price) || data.price <= 0){
                throw `멤버십 적립 시에는 양수 정수인 금액 값이 필요합니다.(${data.price})`;
            }else if(![process.nmns.PAYMENT_METHOD.CASH, process.nmns.PAYMENT_METHOD.CARD].includes(data.payment)){
                throw `멤버십 적립 시에는 결제수단이 필요합니다. (${data.payment})`;
            }

            data.pointMembershipAtThatTime = member.pointMembership + data.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE:
            data.pointMembershipAtThatTime = member.pointMembership - data.membershipChange;
        case process.nmns.SALE_HIST_TYPE.SALES_CARD:
        case process.nmns.SALE_HIST_TYPE.SALES_CASH:
            commonValidationForReservation(data);
            break;
    }

    changeMemberSalesStatistic(member, false, data);


    let saleHistList = user.saleHistList || [];
    if(data.id){
        let salesHist = saleHistList.find(salesHist => salesHist.id === data.id);
        if(salesHist){
            salesHist.isDeleted = false;
            for(let key in salesHist){
                salesHist[key] = data[key];
            }
        }else{
            saleHistList.push(data);
        }
    }else{
        data.id =  moment().format('YYYYMMDDhhmmss.SSS');
        saleHistList.push(data);
    }

    user.saleHistList = saleHistList;

    return data;
}

let saveSalesHistList = async function(user, list){
    for(let i =0; i<list.length; i++){
        let data = list[i];

        if(![process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH].includes(data.type)){
            throw `예약에서 매출내역을 추가하는 경우는 카드 매출, 현금 매출, 멤버십 사용만 가능합니다. (${data.type})`;
        }

        data.date = moment().format('YYYYMMDD');
        data.time = moment().format('hhmmss');

        data = saveSalesHist(user, data);
    }

    return list;
}

/**
 * 예약에서 매출 저장하기
 * 요청 위치 : 'save sales',
 * 데이터 : [{'id':${매출 아이디, optional}, 'type':${매출 종류, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용), string}, 'customerId':${매출을 일으킨 고객 아이디, string}, 'item':${매출내용, string}, 'scheduleId':${예약아이디, string}, 'managerId':${예약 담당자 아이디, string}, 'payment': ${결제수단, CASH, CARD, MEMBERSHIP, string}, 'price': ${결제 금액, number}}]
 * 응답 형식: [{'id':${매출 아이디}, 'date':${매출 날짜(YYYYMMDD), string}, 'time':${매출시간(hhmmss), string}, 'type':${매출 종류, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용), string}, 'customerId':${매출을 일으킨 고객 아이디, string}, 'item':${매출내용, string}, 'scheduleId':${예약아이디, string}, 'managerId':${예약 담당자 아이디, string}, 'payment': ${결제수단, CASH, CARD, MEMBERSHIP, string}, 'price': ${결제 금액, number}}]
 * 요청 데이터에 id가 없으면 매출 내역을 추가한다.
 * 요청 데이터에 id가 있으면 기존 매출 내역을 업데이트 한다.
 * @param data
 * @returns {Promise<void>}
 */
exports.saveSales = fnTemplate(null, saveSalesHistList, async function(user, data){
    await db.setWebUser(user);
    return data;
});

/**
 * 멤버십 증감 내역 추가하기(멤버십 적립, 멤버십 수정(증/감))
 * add membership
 * @param data
 * @returns {Promise<void>}
 */
exports.addMembershipHistory = fnTemplate((user, data) => {
    if(![process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT].includes(data.type)){
        throw `멤버십 증감 내역 추가는 멤버십 사용, 멤버십 증가, 멤버십 감소, 멤버십 적립만 가능합니다. (${data.type})`;
    }

    data.uuid = data.id;
    delete data.id;

    data.date = moment().format('YYYYMMDD');
    data.time = moment().format('hhmmss');

    return data;
}, saveSalesHist, async function(user, data){
    await db.setWebUser(user);

    let member = user.memberList.find(member => member.id === data.customerId);
    if(member){
        data.balanceMembership = member.pointMembership;
    }

    data.id = data.uuid;

    return data;
}, async function(user, data){

    data.id = data.uuid;

    return data;
});

/**
 * 매출 수정
 * 변경 가능한 항목
 * - 매출내용, 고객, 담당자, 매출날짜, 매출시간, 결제수단, 금액, 삭제여부
 * @param user
 * @param data
 * @returns {Promise<void>}
 */
let modifySalesHist = async function(user, data){
    if(!user){
        throw '사용자 정보가 없습니다.';
    }

    let type = data.type;
    if(![process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.SALES_CASH, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE].includes(type)){
        throw `매출종류값이 올바르지 않습니다.(${type}})`;
    }

    let id = data.id;
    let saleHistList = user.saleHistList || [];
    let saleHist = saleHistList.find(saleHist => saleHist.id === id);
    if(!saleHist){
        throw `${id}로 조회되는 매출내역이 없습니다.`;
    }
    if(data.action === 'delete'){
        let member = user.memberList.find(member => member.id === saleHist.customerId);
        changeMemberSalesStatistic(member, true, saleHist);

        saleHist.isDeleted = true;

        return data;
    }

    if(data.customerId && !user.memberList.find(member => member.id === data.customerId)){
        throw `아이디 ${data.customerId}로 조회되는 고객이 없습니다.`;
    }

    if(data.managerId && !user.staffList.find(staff => staff.id === data.managerId)){
        throw `아이디 ${data.managerId}로 조회되는 담당자가 없습니다.`;
    }

    if(data.date && !moment(data.date, 'YYYYMMDD').isValid()){
        throw `올바른 매출 날짜가 아닙니다.(${data.date})`;
    }

    if(data.time && !moment(data.time, 'hhmmss').isValid()){
        throw `올바른 매출 시간이 아닙니다.(${data.time})`;
    }

    if(data.payment && ![process.nmns.PAYMENT_METHOD.CARD, process.nmns.PAYMENT_METHOD.CARD].includes(data.payment)){
        throw `결제수단 값이 올바르지 않습니다. (${data.payment})`;
    }

    if(data.price && (isNaN(data.price) || data.price <= 0)){
        throw `금액 값이 올바르지 않습니다.(${data.price})`;
    }

    if(data.customerId && data.customerId !== saleHist.customerId){
        //고객이 바뀐 경우 기존 고객은 환불, 새 고객은 기존 고객의 매출을 그대로 승계
        changeMemberSalesStatistic(user.memberList.find(member => member.id === saleHist.customerId), true, saleHist);
        changeMemberSalesStatistic(user.memberList.find(member => member.id === data.customerId), false, saleHist);
        saleHist.customerId = data.customerId;
    }
    if((data.payment && data.payment !== saleHist.payment) ||(data.price && data.price !== saleHist.price)){
        //고객의 기존 데이터는 환불처리, 새 데이터로 입력
        changeMemberSalesStatistic(user.memberList.find(member => member.id === saleHist.customerId), true, saleHist);
        changeMemberSalesStatistic(user.memberList.find(member => member.id === saleHist.customerId), false, data);
    }

    let modifyAvailableProperties = ['item', 'customerId', 'managerId', 'date', 'time', 'payment', 'price', 'isDeleted'];

    modifyAvailableProperties.forEach(propertyName => {
        if(data[propertyName]){
            saleHist[propertyName] = data[propertyName];
        }
    });

    return data;
}

exports.updateSalesHist = modifySalesHist;

/**
 * 매출내역 변경 외부 API
 * modify sales
 * @param data
 * @returns {Promise<void>}
 */
exports.modifySalesHistApi = fnTemplate((user, data)=>{}, modifySalesHist, async function(user, data){
    await db.setWebUser(user);
    return data;
});