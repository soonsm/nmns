'use strict';

const db = require('./webDb');
const newDb = require('./newDb');
const util = require('./util');
const hangul = require('hangul-js');

const logger = global.nmns.LOGGER;

/**
 * 고객조회
 * get customer
 * @param data
 * @returns {Promise<{status: boolean, message: *, data}>}
 */
exports.getCustomerDetail = async function(data){
    let email = this.email;
    let status = true, message, resultData = {};
    let contact = data.contact;
    let name = data.name;

    if(!contact && !name){
        status = false;
        message = '고객조회를 위한 전화번호 또는 이름이 필요합니다.';
    }else{
        if(contact && !util.phoneNumberValidation(contact)){
            status = false;
            message = `전화번호 형식이 올바르지 않습니다.(${contact})`;
        }else{
            let user = await db.getWebUser(email);
            let member = user.memberList.find(member => member.name === name && member.contact === contact);
            if(!member && contact){
                member = user.memberList.find(member => member.contact === contact);
            }else if(!member && name){
                member = user.memberList.find(member => member.name === name);
            }
            if(member){
                member.manager = member.managerId;
                let noShowList = await newDb.getNoShow(contact);

                member.totalNoShow = noShowList.length;
                member.myNoShow = (noShowList.filter(noShow => noShow.email === email)).length;

                let reservationList = user.reservationList.filter(reservation => reservation.memberId === member.id);
                reservationList.sort((a, b) =>  b.start - a.start );
                if(reservationList.length > 0){
                    let reservation = reservationList[0];
                    member.isAllDay = reservation.isAllDay;
                    if(reservation.type === 'R' && reservation.contentList){
                        member.contents = JSON.stringify(reservation.contentList);
                    }else{
                        member.contents = reservation.contents;
                    }
                }
                member.contents = member.contents || '';
                member.etc = member.etc || '';
                member.pointMembership = member.pointMembership || 0;
                member.cardSales = member.cardSales || 0;
                member.cashSales = member.cashSales || 0;
                resultData = member;
            }
        }
    }
    return {
        status: status,
        message: message,
        data: resultData
    };
};

/**
 * 고객정보 조회(자동완성용)
 * get customer info
 * @param data
 * @returns {Promise<{status: boolean, data, message: string}>}
 */
exports.getCustomerInfo = async function (data) {

    let email = this.email;
    let status = true,
        message = '',
        resultData = {};
    let id = data.id;
    let target = data.target;
    if(!target){
        target = data.contact || data.name;
    }

    if (!id || (!target)) {
        status = false;
        // message = 'id는 필수이고 contact와 name은 둘 중 하나는 있어야 합니다.';
        message = '연락처 혹은 고객 이름 둘 중 하나는 필수입니다.';
    }

    if (status) {
        resultData.id = id;
        resultData.query = target;
        let user = await db.getWebUser(email);
        if (user) {
            let memberList = user.memberList;
            let returnMemberList = [];
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if (member.contact && member.contact.includes(target)) {
                    returnMemberList.push(member);
                }
                else {
                    if (hangul.search(member.name, target) !== -1) {
                        returnMemberList.push(member);
                    }
                    else {
                        //초성검색
                        let names = await hangul.disassemble(member.name, true).map(nameList => nameList[0]).join('');
                        if (names.includes(hangul.disassemble(target).join(''))) {
                            returnMemberList.push(member);
                        }
                    }
                }
            }
            returnMemberList.sort(function(m1, m2){
                let name1 = m1.name || 'Z';
                let name2 = m2.name || 'Z';
                return name1.localeCompare(name2);
            });
            resultData.result = returnMemberList;
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

/**
 * 고객목록 조회
 * get customer list
 * @param data
 * @returns {Promise<{status: boolean, data: Array, message: string}>}
 */
exports.getCustomerList = async function(data){
    let email = this.email;
    let status = true,
        message = '',
        resultData = [];

    let type = data.type;
    let target = data.target;
    let sort = data.sort || 'sort-name';

    if(!type){
        status = false;
        message = '검색 타입을 지정하세요.';
    }else{
        let user = await db.getWebUser(email);
        let memberList = user.memberList;
        let reservationList = await db.getReservationList(email);
        let staffList = await db.getStaffList(email);

        if(target && target.trim().length > 0) {
            let filteredList = [];
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if(!member.id){
                    continue;
                }
                if ((type === 'name' || type === 'all') && member.name && member.name.includes(target)) {
                    filteredList.push(member);
                }
                if ((type === 'contact' || type === 'all') && member.contact && member.contact.includes(target)) {
                    filteredList.push(member);
                }
                if ((type === 'manager' || type === 'all') && member.managerId) {
                    let staff = staffList.find(staff => staff.id === member.managerId);
                    if(staff && staff.name.includes(target)){
                        filteredList.push(member);
                    }
                }
            }
            memberList = filteredList;
        }

        for(let i=0;i<memberList.length; i++){
            let member = memberList[i];
            member.myNoShow = 0;
            member.totalNoShow = 0;
            if(member.contact){
                let noShowList = await newDb.getNoShow(member.contact);
                member.totalNoShow = noShowList.length;
                member.myNoShow = (noShowList.filter(noShow => noShow.email === email)).length;
            }

            member.history = [];
            await reservationList.forEach(async function(reservation){
                if(reservation.memberId === member.id){

                    let manager = {};

                    for(let j=0; j<staffList.length;j++){
                        let staff = staffList[j];
                        if(staff.id === reservation.manager){
                            manager = staff;
                            break;
                        }
                    }

                    let totalSales = 0;
                    let salesHistList = user.saleHistList.filter(sales => sales.scheduleId === reservation.id);
                    if(salesHistList){
                        salesHistList.forEach(sales => {
                            if([process.nmns.SALE_HIST_TYPE.SALES_CARD, process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE, process.nmns.SALE_HIST_TYPE.SALES_CASH].includes(sales.type)){
                                totalSales += sales.price;
                            }
                        })
                    }

                    member.history.push({
                        start: reservation.start,
                        end: reservation.end,
                        contents: (reservation.type === 'R' && reservation.contentList) ? JSON.stringify(reservation.contentList) : reservation.contents,
                        status: reservation.status,
                        managerName: manager.name,
                        managerColor: manager.color,
                        managerId: manager.id,
                        price: totalSales
                    });
                }
            });
            member.reservCount = member.history.length;

            await member.history.sort(function(r1,r2){
                return r2.start - r1.start;
            });

            member.pointMembership = member.pointMembership || 0;
            member.cardSales = member.cardSales || 0;
            member.cashSales = member.cashSales || 0;
        }

        memberList.sort(getSortFunc(sort));
        resultData = memberList;
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
};

function getSortFunc(action){
    switch (action) {
        case 'sort-date':
            return function(a, b){
                if(!a.history || a.history.length === 0){
                    if(b.history && b.history.length > 0){
                        return 1;
                    }else{
                        return getSortFunc("sort-name")(a, b);
                    }
                } else if(!b.history || b.history.length === 0){
                    return -1;
                }
                return (a.history[0].date < b.history[0].date ?1:(a.history[0].date > b.history[0].date?-1:getSortFunc("sort-name")(a, b)));
            };
        case 'sort-manager':
            return function(a, b){
                if(!a.manager){
                    if(b.manager){
                        return 1;
                    }else{
                        return getSortFunc("sort-name")(a,b);
                    }
                } else if(!b.manager){
                    return -1;
                }
                return (a.manager.name < b.manager.name ?-1:(a.manager.name > b.manager.name?1:getSortFunc("sort-name")(a, b)));
            };
        case 'sort-name':
        default:
            return function(a, b){
                if(!a.name){
                    if(b.name){
                        return 1;
                    }else{
                        return 0;
                    }
                } else if(!b.name){
                    return -1;
                }
                return (a.name < b.name?-1:(a.name > b.name?1:0));
            };
    }
}

function getDummy(){
    return {
        name: '김승민',
        contact: '01028904311',
        reservCount: 12,
        totalNoShow: 34,
        myNoShow: 30,
        etc: '외로움',
        history: [
            {
                data: '201809021330',
                managerName: '김스탭',
                managerColor: '#009688',
                contents: '브라질리언 왁싱',
                status: 'RESERVED'
            },
            {
                data: '201809011330',
                managerName: '정스탭',
                managerColor: '#009688',
                contents: '삭발',
                status: 'RESERVED'
            }
        ]
    },{
        name: '정태호',
        contact: '01011112222',
        reservCount: 3,
        totalNoShow: 1,
        myNoShow: 1,
        etc: '심심함',
        history: [
            {
                data: '201808231330',
                managerName: '김스탭',
                managerColor: '#009688',
                contents: '쏙 젤',
                status: 'RESERVED'
            },
            {
                data: '201808221330',
                managerName: '정스탭',
                managerColor: '#009688',
                contents: '손톱 다 뽑기',
                status: 'RESERVED'
            }
        ]
    };
}

/**
 * 고객 추가/고객 수정
 * add customer/update customer
 * @param data
 * @returns {Promise<{status: boolean, data: {id}, message: string}>}
 */
let saveCustomer = async function(data){
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};
    let id = data.id;
    let name = data.name;
    let contact = data.contact;
    let managerId = data.managerId === '' ? undefined : data.managerId;

    let user = await db.getWebUser(email);
    let memberList = user.memberList;

    if(!id && !name && !contact){
        message = '이름과 연락처 중 하나는 필수입니다.';
    }else if(contact && !util.phoneNumberValidation(contact)){
        message = '연락처가 올바르지 않습니다.(휴대전화번호로 숫자만 입력하세요.)';
    }else if(memberList.find(member => member.name === name && member.contact === contact && member.id !== id) !== undefined){
        message = '이미 존재하는 고객입니다.';
        resultData.reason = 'DUPLICATED';
    }else if(!(await db.addCustomer(email, id, name, contact, managerId, data.etc))){
        message = '시스템 에러로 추가하지 못했습니다.';
    }else{
        status = true;
        resultData.id = id;
        resultData.totalNoShow = 0;
        if(contact){
            resultData.totalNoShow = (await newDb.getNoShow(contact)).length;
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
}

exports.addCustomer = async function(data){
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id, totalNoShow: 0};

    try{
        await newDb.saveCustomer(email, data.id, data.name, data.contact, data.managerId === '' ? undefined : data.managerId, data.etc);
        status = true;
        if(contact){
            resultData.totalNoShow = (await newDb.getNoShow(contact)).length;
        }
    }catch(e){
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

exports.updateCustomer = async function(data){
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};

    try{
        let memberList = await newDb.getCustomerList(email);
        if(memberList.find(member => member.name === data.name && member.contact === data.contact && member.id !== data.id)){
            resultData.reason = 'DUPLICATED';
            throw '이미 이름과 연락처가 동일한 고객이 존재합니다.';
        }

        await newDb.saveCustomer(email, data.id, data.name, data.contact, data.managerId === '' ? undefined : data.managerId, data.etc);
        status = true;
    }catch(e){
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

exports.deleteCustomer = async function(data){
    let status = false,
        message = '',
        resultData = {id: data.id};

    if(!data.id){
        message = '고객 삭제를 위해서는 아이디가 필수입니다.';
    }else{
        let user = await db.getWebUser(this.email);
        let memberList = user.memberList.filter(member => member.id !== data.id);

        if(await db.updateWebUser(this.email, {memberList: memberList})){
            status = true;
        }else{
            message = '시스템 에러로 고객을 삭제하지 못했습니다.';
        }
    }

    return{
        status: status,
        data: resultData,
        message: message
    };
}

/**
 * 고객정보 병합
 * merge customer
 * @param data
 * @returns {Promise<{status: boolean, data: {id}, message: string}>}
 */
exports.mergeCustomer = async function(data){
    let email = this.email;
    let status = false,
        message = '',
        resultData = {id: data.id};

    let name = data.name;
    let contact = data.contact;
    let etc = data.etc;
    let managerId = data.managerId;

    let user = await db.getWebUser(email);
    let memberList = user.memberList;
    let targetMember = memberList.find(member => member.name === name && member.contact === contact && member.id !== data.id);
    if(!targetMember){
        message = '합치려고 하는 고객 정보가 없습니다.';
    }else{
        //소스 멤버의 예약리스트, 예약확인 알림톡 리스트, 예약취소 알림톡 리스트의 고객 아이디를 타겟 멤버의 아이디로 수정
        await user.reservationList.forEach(function(reservation){
            if(reservation.memberId === data.id){
                reservation.memberId = targetMember.id;
            }
        });
        await user.reservationConfirmAlrimTalkList.forEach(function(alrim){
            if(alrim.reservation.memberId === data.id){
                alrim.reservation.memberId = targetMember.id;
            }
        });
        await user.cancelAlrimTalkList.forEach(function(alrim){
            if(alrim.reservation.memberId === data.id){
                alrim.reservation.memberId = targetMember.id;
            }
        });

        //타겟 멤버의 etc, managerId 업데이트
        targetMember.etc = etc;
        targetMember.managerId = managerId;

        //소스 멤버 삭제
        let deleteIndex = memberList.findIndex(member => member.id === data.id);
        user.memberList.splice(deleteIndex,1);

        if(await db.setWebUser(user)){
            status = true;
            resultData.targetId = targetMember.id;
        }else{
            message = '시스템 에러로 인해 실패하였습니다.';
        }
    }

    return{
        status: status,
        data: resultData,
        message: message
    };
}