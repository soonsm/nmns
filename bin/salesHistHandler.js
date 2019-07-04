'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const newDb = require('./newDb');
const moment = require('moment');

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

            if(!user){
                throw 'user가 없습니다.';
            }

            if(preFn){
                data = await preFn(user, data);
            }

            resultData = await mainFn(user, data);

            if(postFn){
                resultData = await postFn(user, resultData, data);
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
 매출 조회(카드매출/현금매출/멤버십 적립)
 요청 위치 : 'get sales list',
 데이터 : {'start':${조회 시작일(YYYYMMDD), string}, 'end':${조회 종료일(YYYYMMDD), string}, 'customerName': ${고객이름(특정 고객에 대해서 조회 할 때), string, optional}, 'customerId': ${고객아이디(특정 고객에 대해서 조회 할 때), string, optional}, 'item': ${시술 내용, string, optional}, 'scheduleId' : ${매출과 연관된 예약 아이디, string, optional}, 'paymentList': ${조회에 포함 할 결제수단 리스트, list[string], optional, 값: CASH, CARD, MEMBERSHIP, optional}, 'priceStart' : ${조회에 포함 할 매출 최소 가격, number, optional}, 'priceEnd' : ${조회에 포함 할 매출 최대 가격, number, optional}, 'managerId' : ${담당자 아이디(특정 담당자의 매출에 대해 조회 할 때), string, optional}}
 응답 형식 : 'data': {"totalSalesCount":${총 검색된 매출 건수, number}, "totalSalesAmount":${총 검색된 매출액 합계, number}, "totalSalesCard":${총 검색된 카드매출 건수, number}, "totalSalesCash":${총 검색된 현금매출 건수, number}, "totalSalesMembership":${총 검색된 매출 중 멤버십 충전 건수, number}, "sales":[{ 'id' : ${매출 id, string}, 'type' : ${매출 종류, string, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용)}, **'date' : ${매출날짜(YYYYMMDD), string}, 'time' : ${매출시간(hhmmss), string}, ** 'scheduleId' : ${매출과 연관된 예약 아이디, string}, 'customerId' : ${매출을 일으킨 고객 아이디, string}, 'customerName':${고객 이름, string}, 'item' : ${매출 내용, string}, 'payment' : ${결제수단(CASH, CARD, MEMBERSHIP), string}, 'price' : ${금액(멤버십 사용의 경우 사용된 멤버십), number}, 'managerId': ${담당자 아이디(매출관 연관된), string}} ]}
 */
exports.getSalesHist = fnTemplate(null, async function(user, data){
    if(!data.start || !moment(data.start, 'YYYYMMDD').isValid()){
        throw `올바른 날짜가 아닙니다.(start: ${data.start})`;
    }

    if(!data.end || !moment(data.end, 'YYYYMMDD').isValid()){
        throw `올바른 날짜가 아닙니다.(end: ${data.end})`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH];

    return await newDb.getSalesHist(user.email, data);
}, async function(user, list){
    let totalSalesCount = list.length, totalSalesAmount =0;
    let totalSalesCard=0, totalSalesCash=0,totalSalesMembership=0;

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
    });
    return {
        totalSalesCount: totalSalesCount,
        totalSalesAmount: totalSalesAmount,
        totalSalesCard: totalSalesCard,
        totalSalesCash: totalSalesCash,
        totalSalesMembership: totalSalesMembership,
        sales: list
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
exports.getSalesForReservation = fnTemplate(async (user, data) => {
    let scheduleId = data.scheduleId;
    if(!scheduleId){
        throw '예약아이디는 필수 입니다.';
    }
    let reservation = await newDb.getReservation(user.email, scheduleId);
    if(!reservation){
        throw `예약아이디 ${scheduleId}로 조회되는 예약이 없습니다.`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH];
    data.reservation = reservation;
    delete data.id;

    return data;
}, async function(user, data){
    let list = await newDb.getSalesHist(user.email, {scheduleId: data.scheduleId, typeList: data.typeList});
    if(list.length == 0){
        let reservation = data.reservation;
        let contentList = reservation.contentList || [];
        let customer = await newDb.getCustomer(user.email, reservation.member);
        let salesTemplateList = [];

        for(let i=0; i<contentList.length; i++){
            let content = contentList[i];
            let template = {
                item: content.value,
                customerId: reservation.member,
                managerId: reservation.manager,
                balanceMembership: customer.pointMembership
            };

            salesTemplateList.push(template);
        }

        list = salesTemplateList;
    }

    if(list && list.length > 0){
        let menuList = user.menuList || [];
        for(let i=0; i<list.length; i++){
            let menu = menuList.find(menu => menu.name === list[i].item);
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
exports.getMembershipHistory = fnTemplate(null, async (user, data) => {
    let customerId = data.customerId;
    if(!customerId){
        throw '고객 아이디는 필수입니다.';
    }
    let customer = await newDb.getCustomer(user.email, customerId);
    if(!customer){
        throw `고객아이디 ${customerId}로 조회되는 고객이 없습니다.`;
    }

    data.typeList = [process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT];

    return await newDb.getSalesHist(user.email, data, false);
});


/**
 요청 위치 : 'save sales'
 데이터 : [{'id':${매출 아이디, optional, 매출 내역을 저장하는 timestamp로써 YYYYMMDDHHmmssSSS 형태여야 함}, 'type':${매출 종류, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용), string}, 'customerId':${매출을 일으킨 고객 아이디, string}, 'item':${매출내용, string}, 'scheduleId':${예약아이디, string}, 'managerId':${예약 담당자 아이디, string}, 'price': ${결제 금액, number}}]
 응답 형식: 'data':[{'id':${매출 아이디}, 'date':${매출 날짜(YYYYMMDD), string}, 'time':${매출시간(hhmmss), string}, 'type':${매출 종류, CARD(카드), CASH(현금), MEMBERSHIP(멤버십 사용), string}, 'customerId':${매출을 일으킨 고객 아이디, string}, 'item':${매출내용, string}, 'scheduleId':${예약아이디, string}, 'managerId':${예약 담당자 아이디, string}, 'price': ${결제 금액, number}}]
 요청 데이터에 id가 없으면 매출 내역을 추가한다.
 요청 데이터에 id가 있으면 기존 매출 내역을 수정한다.
 */
exports.saveSales = fnTemplate(null, async function(user, list){
    for(let i =0; i<list.length; i++){
        let data = list[i];

        if (!data.id || !data.type || !data.customerId || !data.item || !data.scheduleId || !data.managerId || !data.price) {
            throw 'id, type, customerId, item, scheduleId, managerId, price는 필수입니다.'
        }

        if(![process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH].includes(data.type)){
            throw `예약에서 매출내역을 추가하는 경우는 카드 매출, 현금 매출, 멤버십 사용만 가능합니다. (${data.type})`;
        }

        data.date = moment().format('YYYYMMDD');
        data.time = moment().format('HHmmss');

        data.email = user.email;
        await newDb.saveSales(data);
    }

    return list;
});

/**
 * 멤버십 적립: 돈을 내고 멤버십을 적립하는 경우
 * 멤버십 임의 수정: 매장에서 고객에게 멤버십을 환불해주거나, 멤버십 적립 시 오기입으로 인해 수정이 필요 할 때 사용
 * 요청 위치 : 'add membership', 데이터: {'id':${리턴으로 돌려줘야 하는 값, string}, 'type':${종류, MEMBERSHIP_ADD(적립), MEMBERSHIP_INCREMENT(증가), MEMBERSHIP_DECREMENT(감소), string}, 'customerId':${멤버십 보유 고객 아이디, string}, 'item':${멤버십 증감 내용, string}, 'payment': ${멤버십 적립의 경우 결제수단, CASH, CARD, string, optional}, 'price': ${결제 금액, number}, 'membershipChange': ${멤버십 변동 값(항상 양수), number}}
 * 응답 형식: 'data':{'id':${요청시 전송한 값}, 'date':${날짜(YYYYMMDD), string}, 'time':${시간(hhmmss), string}, 'type':${종류, MEMBERSHIP_ADD(적립), MEMBERSHIP_INCREMENT(증가), MEMBERSHIP_DECREMENT(감소), string}, 'customerId':${멤버십 보유 고객 아이디, string}, 'item':${멤버십 증감 내용, string}, 'payment': ${멤버십 적립의 경우 결제수단, CASH, CARD, string, optional}, 'price': ${결제 금액, number}, 'membershipChange': ${멤버십 변동 값(항상 양수), number}, 'balanceMembership':${남은 멤버십 잔액, number}}
 */
exports.addMembershipHistory = fnTemplate((user, data) => {
    if(![process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT].includes(data.type)){
        throw `멤버십 증감 내역 추가는 멤버십 사용, 멤버십 증가, 멤버십 감소, 멤버십 적립만 가능합니다. (${data.type})`;
    }

    data.uuid = data.id;
    data.id = moment().format('YYYYMMDDhhmmssSSS');

    data.date = moment().format('YYYYMMDD');
    data.time = moment().format('HHmmss');
    data.email = user.email;
    return data;
}, async (user, data)=> {
    return await newDb.saveSales(data);
}, async function(user, resultData, inputData){
    resultData.serverId = resultData.id;
    resultData.id = inputData.uuid;
    return resultData;
});