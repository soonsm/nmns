'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');
const alrimTalk = require('./alrimTalkSender');


exports.getReservationSummaryList = async function(data) {

    let email = this.email;
    let status = true,
        message = null,
        resultData = null;
    let params = data || {};

    if (params.start && !moment(params.start, 'YYYYMMDDHHmm').isValid()) {
        status = false;
        // message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${params.start}`;
        message = `조회하려는 날짜가 형식에 맞지 않습니다.(${params.start})`;
    }
    if (params.end && !moment(params.end, 'YYYYMMDDHHmm').isValid()) {
        status = false;
        // message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${params.end}`;
        message = `조회하려는 날짜가 형식에 맞지 않습니다.(${params.end})`;
    }
    if (params.contact && !util.phoneNumberValidation(params.contact)) {
        status = false;
        // message = `휴대전화번호 형식이 올바르지 않습니다.(${params.contact})`;
        message = `휴대전화번호 형식이 올바르지 않습니다.(${params.contact})`;
    }
    if (status) {
        resultData = await db.getReservationSummaryList(email, params);
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

exports.getReservationList = async function(data) {
    let email = this.email;
    let status = true;
    let message = null;
    let resultData = null;
    console.log(data);
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
        resultData = await db.getReservationList(email, data.start, data.end);
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

exports.updateReservation = async function (newReservation) {

    console.log('UpdateReservation:', newReservation);
    let email = this.email;
    let validationResult = reservationValidationForUdate(email, newReservation);
    let status = validationResult.status;
    let message = validationResult.message || '수정완료';

    if (status) {
        /*
        고객 없으면 추가
        고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
        이름과 연락처가 일치하는 고객이 없으면 추가
         */
        let user = await db.getWebUser(email);
        if (newReservation.status !== process.nmns.RESERVATION_STATUS.DELETED && newReservation.contact) {
            let memberList = user.memberList;
            let newMember = true;
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if (newReservation.contact === member.contact) {
                    newMember = false;
                    if (newReservation.name && newReservation.name !== member.name) {
                        member.name = newReservation.name;
                        memberList[i] = member;
                        await db.updateWebUser(email, {memberList: memberList});
                    }
                    break;
                }
            }
            if (newMember) {
                memberList.push({contact: newReservation.contact, name: newReservation.name});
                await db.updateWebUser(email, {memberList: memberList});
            }
        }

        status = false;
        message = '없는 예약입니다.';
        let reservationList = await db.getReservationList(email);
        for (let i = 0; i < reservationList.length; i++) {
            let reservation = reservationList[i];
            if (reservation.id === newReservation.id) {

                if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && newReservation.status) {
                    if (newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED || newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED)
                    //노쇼에서 정상 또는 취소로 바꿀 때 노쇼 삭제
                        if (!await db.deleteNoShow(email, reservation.id)) {
                            console.log("예약변경을 통한 노쇼 삭제가 실패했습니다.");
                        }
                }

                //번호가 바뀌었을 때는 알림톡 재전송(새 예약정보의 status가 바뀌지 않고, 기존 예약 상태가 예약 상태일 때만)
                let needAlirmTalk = false;
                if(newReservation.contact && newReservation.contact !== reservation.contact && (!newReservation.status || newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED) && reservation.status === process.nmns.RESERVATION_STATUS.RESERVED){
                    needAlirmTalk = true;
                }

                //프로퍼티 복사
                for (let x in reservation) {
                    if (newReservation.hasOwnProperty(x)) {
                        reservation[x] = newReservation[x];// === '' ? null : newReservation[x];
                    }
                }

                //예약정보 저장
                reservationList[i] = reservation;
                if (!await db.updateReservation(email, reservationList)) {
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error)';
                }else{
                    //노쇼 처리인 경우 노쇼
                    if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW) {
                        await db.addToNoShowList(email, reservation.contact, reservation.noShowCase, reservation.start.substring(0, 8), reservation.id);
                    }

                    //알림톡 전송
                    if(needAlirmTalk){
                        await alrimTalk.sendReservationConfirm(user, reservation);
                    }

                    status = true;
                    message = '예약수정완료';
                }

                break;
            }
        }
    }

    return {
        status: status,
        data: {id: newReservation.id},
        message: message
    };
};

exports.addReservation = async function (data) {
    console.log(data);
    let email = this.email;
    let validationResult = reservationValidationForAdd(email, data);
    let status = validationResult.status;
    let message = validationResult.message || '저장완료';

    if (status) {
        /*
        고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
        이름과 연락처가 일치하는 고객이 없으면 추가
         */
        let user = await db.getWebUser(email);
        if(data.contact){
            let memberList = user.memberList;
            let newMember = true;
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if (data.contact === member.contact) {
                    newMember = false;
                    if (data.name && data.name !== member.name) {
                        member.name = data.name;
                        memberList[i] = member;
                        await db.updateWebUser(email, {memberList: memberList});
                    }
                    break;
                }
            }
            if (newMember) {
                memberList.push({contact: data.contact, name: data.name});
                await db.updateWebUser(email, {memberList: memberList});
            }
        }

        let reservation = db.newReservation(data);
        if (!await db.addNewReservation(email, reservation)) {
            status = false;
            message = '시스템 오류입니다.(DB Update Error';
        }

        if (status) {
            await alrimTalk.sendReservationConfirm(user, reservation);
        }
    }

    return {
        status: status,
        data: {id: data.id},
        message: message
    };
};


const reservationValidationForUdate = function (email, data) {
    let status = false,
        message;

    if (!data.id) {
        // message = '예약수정에 필요한 필수 데이터가 없습니다.({"id": ${예약키})';
        message = '예약수정에 필요한 예약 아이디가 없습니다.';
    }
    else if (!data.id.startsWith(email)) {
        message = 'email 조작이 의심되어 거절합니다.';
    }
    else if (data.status !== process.nmns.RESERVATION_STATUS.DELETED) {
        if(data.isAllDay === false && (data.start && (!moment(data.start, 'YYYYMMDDHHmm').isValid()))){
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.start})`;
        }
        else if (data.isAllDay === false && (data.end && (!moment(data.end, 'YYYYMMDDHHmm').isValid()))) {
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) end:${data.end}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.end})`;
        }
        else if(data.isAllDay === true && (data.start && (!moment(data.start, 'YYYYMMDD').isValid()))){
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDD) start:${data.start}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.start})`;
        }
        else if (data.isAllDay === true && (data.end && (!moment(data.end, 'YYYYMMDD').isValid()))) {
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDD) end:${data.end}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.end})`;
        }
        else if (data.type && data.type !== 'R' && data.type !== 'T') {
            message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
        }
        else if(data.type === 'R' && !data.contact){
            message = '예약은 전화번호가 필수입니다.';
        }
        else if(data.type === 'T' && !data.name){
            message = '일정은 이름이 필수입니다.';
        }
        else if (data.contact && !util.phoneNumberValidation(data.contact)) {
            message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
        }
        else if (data.status && (data.status !== 'RESERVED' && data.status !== 'CANCELED' && data.status !== 'DELETED' && data.status !== 'NOSHOW')) {
            // message = 'status값이 올바르지 않습니다.("status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW}})';
            message = '예약상태 값이 올바르지 않습니다.';
        }
        else {
            status = true;
        }
    }
    else {
        status = true;
    }
    return {status: status, message: message};
};

/**
 * validation
 * 필수: id, start, end, contact
 * 선택: name, type(default: R), isAllDay, contents, manager, etc
 */
const reservationValidationForAdd = function (email, data) {
    let status = false,
        message;
    if (!data.id || !data.start || !data.end ) {
        // message = '예약추가에 필요한 필수 데이터가 없습니다. ({"id": ${예약키}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm})';
        message = '예약을 추가하려면 시작시간과 끝시간을 입력하세요.';
    }else if(!data.id.startsWith(email)){
        message = 'email 조작이 의심되어 거절합니다.';
    }else{
        data.type = data.type || 'R';
        data.isAllDay = data.isAllDay || false;

        if(data.type !== 'R' && data.type !== 'T') {
            message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
        }else if(data.isAllDay !== true && data.isAllDay !== false){
            message = `isAllDay는 true 또는 false만 가능합니다. type:${data.isAllDay}`;
        }else if(data.isAllDay && (!moment(data.start, 'YYYYMMDD').isValid() || !moment(data.end, 'YYYYMMDD').isValid())) {
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDD) start:${data.start}, end:${data.end}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        }else if(!data.isAllDay && (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid())){
            // message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
            message = `날짜가 형식에 맞지 않습니다.(${data.start}, ${data.end})`;
        }else if(data.type === 'R' && !data.contact){
            message = '예약추가시에는 연락처가 필수입니다.';
        }else if(data.type === 'R' && !util.phoneNumberValidation(data.contact)) {
            message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
        }else if(data.type === 'T' && !data.name){
            message = '일정추가시에는 이름이 필수입니다.';
        }else{
            status = true;
        }
    }

    return {status: status, message: message};
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
    push('2018-10-03', '개천절');
    push('2018-10-09', '한글날');
    push('2018-12-25', '크리스마스');

    push('2019-01-01', '새해');
    push('2019-02-04', '설날');
    push('2019-02-05', '설날');
    push('2019-02-06', '설날');
    push('2019-03-01', '삼일절');
    push('2019-05-05', '어린이날');
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