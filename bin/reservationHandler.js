'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const newDb = require('./newDb');
const moment = require('moment');
const util = require('./util');
const alrimTalk = require('./alrimTalkSender');
const salesHistHandler = require('./salesHistHandler');

let alertSendAlrimTalk = function(socket, success){
    let message = '고객님께 예약알림을 전송하였습니다.';
    if(success === false){
        message = '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
    }
    sendPush(socket, message);
}

let sendPush = function(socket, message){
    socket.emit('message', {
        type: 'alert',
        data: {
            body: message
        }
    });
}

let newCustomerId = function(email){
    return email + moment().format('YYYYMMDDhhmmss.SSS') + Math.random() * 100;
}

exports.getReservationSummaryList = async function(data) {

    let email = this.email;
    let status = false,message = null,resultData = null;
    let params = data || {};

    try{
        if (params.start && !moment(params.start, 'YYYYMMDDHHmm').isValid()) {
            throw `조회하려는 날짜가 형식에 맞지 않습니다.(${params.start})`;
        }
        if (params.end && !moment(params.end, 'YYYYMMDDHHmm').isValid()) {
            throw `조회하려는 날짜가 형식에 맞지 않습니다.(${params.end})`;
        }
        resultData = await db.getReservationSummaryList(email, params);
        status = true;
    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

let log = async function(email, socket){
    db.logVisitHistory(email);

    // db.logDeviceHist()

    const MobileDetect = require('mobile-detect');
    let md = new MobileDetect(socket.request.headers['user-agent']);
    db.logDeviceHist(email, md.mobile() || 'pc');
}

exports.getReservationList = async function(data) {

    log(this.email, this.socket);

    let email = this.email;
    let status = true;
    let message = null;
    let resultData = null;
    if (!data || !data.start || !data.end) {
        // message = '예약정보 조회에 필요한 데이터가 없습니다.({"start":${조회 시작 일자, string, YYYYMMDDHHmm}, "end":${조회 종료 일자, string, YYYYMMDDHHmm}})';
        message = '조회하려는 날짜를 입력하세요.';
        status = false;
    }
    else if (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
        // message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
        message = `조회하려는 날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        status = false;
    }

    if (status) {
        resultData = await db.getReservationList(email, data.start, data.end, 'R');
        this.socket.emit(this.eventName, {
            type: 'response',
            status: status,
            message: message,
            data: resultData,
            holiday: getHolidays(data.start, data.end)
        });
    }else{
        return {
            status: status,
            message: message,
            data: null
        };
    }
};

exports.getTaskList = async function(data){

    let email = this.email;
    let status = true;
    let message = null;
    let resultData = null;
    if (!data || !data.start || !data.end) {
        // message = '예약정보 조회에 필요한 데이터가 없습니다.({"start":${조회 시작 일자, string, YYYYMMDDHHmm}, "end":${조회 종료 일자, string, YYYYMMDDHHmm}})';
        message = '조회하려는 날짜를 입력하세요.';
        status = false;
    }
    else if (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
        // message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
        message = `조회하려는 날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        status = false;
    }

    if (status) {
        resultData = await db.getReservationList(email, data.start, data.end, 'T');
    }

    return {
        status: status,
        message: message,
        data: resultData
    };
}


// exports.updateReservation = async function (newReservation) {
//     let email = this.email;
//     let validationResult = reservationValidationForUdate(email, newReservation);
//     let status = validationResult.status;
//     let message = validationResult.message || '수정완료';
//     let pushMessage = '';
//
//     if (status) {
//         let user = await db.getWebUser(email);
//
//         status = false;
//         message = '없는 예약입니다.';
//         let reservationList = user.reservationList;
//         let reservation = reservationList.find(reservation => reservation.id === newReservation.id);
//         if (reservation) {
//             if (newReservation.status !== process.nmns.RESERVATION_STATUS.DELETED && newReservation.contact && ((reservation.type === 'R' && newReservation.type !== 'T') || newReservation.type === 'R')) {
//                 let memberList = user.memberList;
//                 let member = memberList.find(member => member.name === newReservation.name && member.contact === newReservation.contact);
//                 if (member) {
//                     newReservation.memberId = member.id;
//                 } else if (newReservation.contact || newReservation.name) {
//                     let memberId = newCustomerId(email);
//                     let newMember = {
//                         id: memberId,
//                         contact: newReservation.contact,
//                         name: newReservation.name,
//                         etc: newReservation.etc
//                     };
//                     newMember.managerId = newReservation.manager || reservation.manager;
//                     memberList.push(newMember);
//                     await db.updateWebUser(email, {memberList: memberList});
//                     newReservation.memberId = memberId;
//
//                     pushMessage = '새로운 고객이 추가되었습니다.';
//                 }
//             }
//
//             if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && newReservation.status) {
//                 if (newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED || newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED)
//                 //노쇼에서 정상 또는 취소로 바꿀 때 노쇼 삭제
//                     if (!await db.deleteNoShow(email, reservation.id)) {
//                         logger.log("예약변경을 통한 노쇼 삭제가 실패했습니다.");
//                     }
//             }
//
//             if(newReservation.type === 'R' && newReservation.contents){
//                 newReservation.contentList = JSON.parse(newReservation.contents);
//             }
//
//             //번호가 바뀌었을 때는 알림톡 재전송(새 예약정보의 status가 바뀌지 않고, 기존 예약 상태가 예약 상태일 때만)
//             let needAlirmTalk = false;
//             if (newReservation.contact && newReservation.contact !== '' && newReservation.contact !== reservation.contact && (!newReservation.status || newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED) && reservation.status === process.nmns.RESERVATION_STATUS.RESERVED) {
//                 needAlirmTalk = true;
//             }
//
//             //프로퍼티 복사
//             for (let x in reservation) {
//                 if (newReservation.hasOwnProperty(x)) {
//                     reservation[x] = newReservation[x];// === '' ? null : newReservation[x];
//                 }
//             }
//
//             //예약정보 저장
//             // if (!await db.updateReservation(email, reservationList)) {
//             if (!await db.setWebUser(user)) {
//                 status = false;
//                 message = '시스템 오류입니다.(DB Update Error)';
//             } else {
//                 //노쇼 처리인 경우 노쇼
//                 if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && reservation.contact) {
//                     await db.addToNoShowList(email, reservation.contact, reservation.noShowCase, reservation.start.substring(0, 8), reservation.id);
//                 }
//
//                 //알림톡 전송
//                 if (needAlirmTalk && user.alrimTalkInfo.useYn === 'Y') {
//                     if (pushMessage) {
//                         pushMessage += '<br/>';
//                     }
//                     pushMessage += await alrimTalk.sendReservationConfirm(user, reservation) ? '고객님께 예약알림을 전송하였습니다.' : '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
//                 }
//
//                 if (pushMessage) {
//                     sendPush(this.socket, pushMessage);
//                 }
//
//                 status = true;
//                 message = '예약수정완료';
//             }
//
//             //Local Test version에서는 취소하면 취소 알림톡 나간것처럼 하자.
//             if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT && newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED) {
//                 await alrimTalk.sendReservationCancelNotify(user, reservation);
//             }
//         }
//     }
//
//     return {
//         status: status,
//         data: {id: newReservation.id},
//         message: message
//     };
// };

exports.updateReservation = async function(newReservation){
    let email = this.email;
    let status = false, message = null, pushMessage = '';

    try{
        let user = await db.getWebUser(email);
        let reservation = user.reservationList.find(reservation => reservation.id === newReservation.id);
        if(!reservation){
            throw `해당 아이디(${newReservation.id})로 조회되는 예약이 없습니다.`;
        }

        reservationValidationForUdate(email, newReservation, reservation);

        if (newReservation.status !== process.nmns.RESERVATION_STATUS.DELETED && newReservation.contact && ((reservation.type === 'R' && newReservation.type !== 'T') || newReservation.type === 'R')) {
            let memberList = user.memberList;
            let member = memberList.find(member => member.name === newReservation.name && member.contact === newReservation.contact);
            if (member) {
                newReservation.memberId = member.id;
            } else if (newReservation.contact || newReservation.name) {
                let memberId = newCustomerId(email);
                let newMember = {
                    id: memberId,
                    contact: newReservation.contact,
                    name: newReservation.name,
                    etc: newReservation.etc
                };
                newMember.managerId = newReservation.manager || reservation.manager;
                memberList.push(newMember);
                newReservation.memberId = memberId;

                pushMessage = '새로운 고객이 추가되었습니다.';
            }
        }

        if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && newReservation.status) {
            if (newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED || newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED)
            //노쇼에서 정상 또는 취소로 바꿀 때 노쇼 삭제
                if (!await newDb.delNoShow(reservation.id)) {
                    logger.log("예약변경을 통한 노쇼 삭제가 실패했습니다.");
                }
        }

        //번호가 바뀌었을 때는 알림톡 재전송(새 예약정보의 status가 바뀌지 않고, 기존 예약 상태가 예약 상태일 때만)
        let needAlirmTalk = false;
        if (newReservation.contact && newReservation.contact !== '' && newReservation.contact !== reservation.contact && (!newReservation.status || newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED) && reservation.status === process.nmns.RESERVATION_STATUS.RESERVED) {
            needAlirmTalk = true;
        }

        //매출 관련 수정
        if(newReservation.manager || newReservation.memberId || newReservation.contentList || newReservation.status === process.nmns.RESERVATION_STATUS.DELETED){
            let salesHistList = user.saleHistList || [];

            salesHistList.forEach(salesHist => {
                if(salesHist.scheduleId === newReservation.id){
                    salesHist.customerId = newReservation.memberId || salesHist.customerId;
                    salesHist.managerId = newReservation.manager || salesHist.managerId;

                    if(newReservation.status === process.nmns.RESERVATION_STATUS.DELETED){
                        salesHist.action = 'delete';
                        salesHistHandler.updateSalesHist(user, salesHist);
                    }
                }
            });

            if(newReservation.contentList){
                newReservation.contentList.forEach(content => {
                    let salesHist = salesHistList.find(salesHist => salesHist.id === content.id);
                    if(salesHist){
                        salesHist.item = content.value || salesHist.item;
                    }
                });
            }
        }

        //프로퍼티 복사
        for (let x in reservation) {
            if (newReservation.hasOwnProperty(x)) {
                reservation[x] = newReservation[x];// === '' ? null : newReservation[x];
            }
        }

        //예약정보 저장
        if (!await db.setWebUser(user)) {
            throw '시스템 오류입니다.(DB Update Error)';
        } else {
            //노쇼 처리인 경우 노쇼
            if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && reservation.contact) {
                await newDb.addNoShow(email, reservation.contact, reservation.start.substring(0, 8), reservation.noShowCase, reservation.id);
            }

            //알림톡 전송
            if (needAlirmTalk && user.alrimTalkInfo.useYn === 'Y') {
                if (pushMessage) {
                    pushMessage += '<br/>';
                }
                pushMessage += await alrimTalk.sendReservationConfirm(user, reservation) ? '고객님께 예약알림을 전송하였습니다.' : '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
            }

            if (pushMessage) {
                sendPush(this.socket, pushMessage);
            }

            status = true;
            message = '예약수정완료';
        }

        //Local Test version에서는 취소하면 취소 알림톡 나간것처럼 하자.
        if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT && newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED) {
            await alrimTalk.sendReservationCancelNotify(user, reservation);
        }

    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        data: {id: newReservation.id},
        message: message
    }
}

exports.addReservation = async function (data) {
    logger.log(data);
    let email = this.email;
    let status = false, message, pushMessage = '';

    try{
        reservationValidationForAdd(email, data);

        let user = await db.getWebUser(email);
        let memberList = user.memberList;
        if(data.type === 'R'){
            let member = memberList.find(member => member.name === data.name && member.contact === data.contact);
            if(member){
                data.memberId = member.id;
            }else if (data.contact || data.name) {
                let memberId = newCustomerId(email);
                memberList.push({id: memberId, contact: data.contact, name: data.name, etc: data.etc, managerId: data.manager});
                await db.updateWebUser(email, {memberList: memberList});
                data.memberId = memberId;

                pushMessage = '새로운 고객이 추가되었습니다.';
            }
            if(data.contents){
                data.contentList = JSON.parse(data.contents);
            }
        }

        let reservation = db.newReservation(data);
        if (!await db.addNewReservation(email, reservation)) {
            throw '시스템 오류입니다.(DB Update Error';
        }

        if (data.contact && user.alrimTalkInfo.useYn === 'Y') {
            if(pushMessage) {
                pushMessage += '<br/>';
            }
            pushMessage += await alrimTalk.sendReservationConfirm(user, reservation) ? '고객님께 예약알림을 전송하였습니다.' : '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
        }

        if(pushMessage){
            sendPush(this.socket, pushMessage);
        }

        status = true;
        message = '예약/일정 추가 완료';

    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        data: {id: data.id},
        message: message
    };
};

exports.reSendReservationConfirm = async function(data){
    let email = this.email;
    let status = false;
    let message = '알림톡 전송 실패';

    if (data.id) {
        let user = await db.getWebUser(email);
        let reservationList = user.reservationList;
        let reservation = reservationList.find(reservation => reservation.id === data.id);
        if (reservation) {
            if(!await alrimTalk.sendReservationConfirm(user, reservation)){
                message = '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
            }else{
                status = true;
                message = '알림톡 전송 성공';
            }
        }else{
            message = '없는 예약입니다.';
        }
    }else{
        message = '예약 아이디가 없습니다.';
    }

    return {
        status: status,
        data: {id: data.id},
        message: message
    };
}

const reservationValidationForUdate = function (email, newReservation, reservation) {
    if (!newReservation.id) {
        throw '예약수정에 필요한 예약 아이디가 없습니다.';
    }
    else if (!newReservation.id.startsWith(email)) {
        throw 'email 조작이 의심되어 거절합니다.';
    }
    else if (newReservation.status !== process.nmns.RESERVATION_STATUS.DELETED) {
        if(newReservation.isAllDay === false && (newReservation.start && (!moment(newReservation.start, 'YYYYMMDDHHmm').isValid()))){
            throw `날짜가 형식에 맞지 않습니다.(${newReservation.start})`;
        }
        else if (newReservation.isAllDay === false && (newReservation.end && (!moment(newReservation.end, 'YYYYMMDDHHmm').isValid()))) {
            throw `날짜가 형식에 맞지 않습니다.(${newReservation.end})`;
        }
        else if(newReservation.isAllDay === true && (newReservation.start && (!moment(newReservation.start, 'YYYYMMDD').isValid()))){
            throw `날짜가 형식에 맞지 않습니다.(${newReservation.start})`;
        }
        else if (newReservation.isAllDay === true && (newReservation.end && (!moment(newReservation.end, 'YYYYMMDD').isValid()))) {
            throw `날짜가 형식에 맞지 않습니다.(${newReservation.end})`;
        }
        else if (newReservation.type && newReservation.type !== 'R' && newReservation.type !== 'T') {
            throw `type은 R(예약) 또는 T(일정)만 가능합니다. type:${newReservation.type}`;
        }
        else if((newReservation.type === 'R' || (!newReservation.type && reservation.type === 'R')) && newReservation.contents){
            try{
                let array = JSON.parse(newReservation.contents);
                if(!Array.isArray(array)){
                    throw `type이 R(예약) 일 때는 contents는 Array형 json string이어야 합니다.(${newReservation.contents})`;
                }
                for(let i=0; i< array.length;i++){
                    let item = array[i];
                    if(!item.id || !item.value){
                        throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${newReservation.contents}')`;
                    }
                }
                newReservation.contentList = array;
            }catch(e){
                throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${newReservation.contents}')`;
            }
        }
        else if(newReservation.type === 'T' && !newReservation.name){
            throw'일정은 이름이 필수입니다.';
        }
        else if (newReservation.contact && newReservation.contact !== '' && !util.phoneNumberValidation(newReservation.contact)) {
            throw `휴대전화번호 형식이 올바르지 않습니다.(${newReservation.contact})`;
        }
        else if (newReservation.status && (!process.nmns.isValidReservationStatus(newReservation.status))) {
            throw '예약상태 값이 올바르지 않습니다.';
        }
    }
};

/**
 * validation
 * 필수: id, start, end, contact
 * 선택: name, type(default: R), isAllDay, contents(json string으로 type이 T이면 그냥 string, R이면 '["네일케어","페디케어"]'와 같은 array 형태) , manager, etc
 */
const reservationValidationForAdd = function (email, data) {
    if (!data.id || !data.start || !data.end ) {
        throw '예약을 추가하려면 시작시간과 끝시간을 입력하세요.';
    }else if(!data.id.startsWith(email)){
        throw 'email 조작이 의심되어 거절합니다.';
    }else{
        data.type = data.type || 'R';
        data.isAllDay = data.isAllDay || false;

        if(data.type !== 'R' && data.type !== 'T') {
           throw `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
        }else if(data.isAllDay !== true && data.isAllDay !== false){
            throw `isAllDay는 true 또는 false만 가능합니다. type:${data.isAllDay}`;
        }else if(data.isAllDay && (!moment(data.start, 'YYYYMMDD').isValid() || !moment(data.end, 'YYYYMMDD').isValid())) {
            throw `날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        }else if(!data.isAllDay && (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid())){
            throw `날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        }else if(data.type === 'R' && data.contact && data.contact !== '' && !util.phoneNumberValidation(data.contact)) {
            throw `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
        }else if(data.type === 'T' && !data.name){
            throw '일정추가시에는 이름이 필수입니다.';
        }else if(!data.name && !data.contact){
            throw '고객이름과 고객연락처 둘 중 하나는 필수입니다.';
        }else if(data.type === 'R' && data.contents){
            try{
                let array = JSON.parse(data.contents);
                if(!Array.isArray(array)){
                    throw `type이 R(예약) 일 때는 contents는 Array형 json string이어야 합니다.(${data.contents})`;
                }
                for(let i=0; i< array.length;i++){
                    let item = array[i];
                    if(!item.id || !item.value){
                        throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${data.contents}')`;
                    }
                }
                data.contentList = array;
            }catch(e){
                throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${data.contents}')`;
            }
        }
    }
};

const getHolidays = (function () {
    const holidays = [];

    const push = function (date, title) {
        holidays.push({
            date: date,
            title: title
        })
    };

    push('2018-01-01', '새해');
    push('2018-02-15', '설날');
    push('2018-02-16', '설날');
    push('2018-02-17', '설날');
    push('2018-03-01', '삼일절');
    push('2018-05-05', '어린이날');
    push('2018-05-22', '부처님오신날');
    push('2018-06-06', '현충일');
    push('2018-08-15', '광복절');
    push('2018-09-23', '추석');
    push('2018-09-24', '추석');
    push('2018-09-25', '추석');
    push('2018-09-26', '대체 휴일');
    push('2018-10-03', '개천절');
    push('2018-10-09', '한글날');
    push('2018-12-25', '크리스마스');

    push('2019-01-01', '새해');
    push('2019-02-04', '설날');
    push('2019-02-05', '설날');
    push('2019-02-06', '설날');
    push('2019-03-01', '삼일절');
    push('2019-05-05', '어린이날');
    push('2019-05-06', '대체공휴일');
    push('2019-05-12', '부처님오신날');
    push('2019-06-06', '현충일');
    push('2019-08-15', '광복절');
    push('2019-09-12', '추석');
    push('2019-09-13', '추석');
    push('2019-09-14', '추석');
    push('2019-10-03', '개천절');
    push('2019-10-09', '한글날');
    push('2019-12-25', '크리스마스');

    push('2020-01-01', '새해');
    push('2020-01-24', '설날');
    push('2020-01-25', '설날');
    push('2020-01-26', '설날');
    push('2020-03-01', '삼일절');
    push('2020-05-05', '어린이날');
    push('2020-04-30', '부처님오신날');
    push('2020-06-06', '현충일');
    push('2020-08-15', '광복절');
    push('2020-09-30', '추석');
    push('2020-10-01', '추석');
    push('2020-10-02', '추석');
    push('2020-10-03', '개천절');
    push('2020-10-09', '한글날');
    push('2020-12-25', '크리스마스');

    return function (start, end) {
        start = moment(start.substring(0, 8)).format('YYYY-MM-DD');
        end = moment(end.substring(0, 8)).format('YYYY-MM-DD');

        let returnHolidays = [];
        for (let i = 0; i < holidays.length; i++) {
            let holiday = holidays[i];
            if (holiday.date >= start && holiday.date <= end) {
                returnHolidays.push(holiday);
            }
        }
        return returnHolidays;
    };
})();