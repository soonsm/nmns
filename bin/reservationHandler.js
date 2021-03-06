'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const newDb = require('./newDb');
const moment = require('moment');
const util = require('./util');
const alrimTalk = require('./alrimTalkSender');
const salesHistHandler = require('./salesHistHandler');

let alertSendAlrimTalk = function (socket, success) {
    let message = '고객님께 예약알림을 전송하였습니다.';
    if (success === false) {
        message = '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
    }
    sendPush(socket, message);
}

let sendPush = function (socket, message) {
    socket.emit('message', {
        type: 'alert',
        data: {
            body: message
        }
    });
}

let newCustomerId = function (email) {
    return email + moment().format('YYYYMMDDHHmmss.SSS') + Math.random() * 100;
}

/**
 * 요청 위치 : "get summary",
 * 데이터 : {"start" : ${조회 시작일시, string, YYYYMMDDHHmm, optional}, "end" : ${조회 종료일시, string, YYYYMMDDHHmm, optional}, "target":${고객 전화번호 혹은 고객이름, string, optional}}
 * 응답 형식 : "data" : [{"id":${예약key, string}, "name":${고객이름, string, optional}, "contact":${고객전화번호, string}, "start":${예약 시작일시, string, YYYYMMDDHHmm}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}, "status":${현재 예약상태, string, 도메인은 9번 참조}}]
 * 삭제된 예약은 주지 않아야함
 * 요청 데이터가 모두 없으면 전체 예약정보 조회
 */
exports.getReservationSummaryList = async function (data) {

    let email = this.email;
    let status = false, message, list;
    let target = data.target;

    try {
        list = await newDb.getReservationList(email, data.start, data.end);
        if(target){
            list = list.filter((reservation) => {
                if(reservation.name && reservation.name.includes(target)){
                    return true;
                }

                if(reservation.contact && reservation.contact.includes(target)){
                    return true;
                }

                return false;
            });
        }
        for (let item of list) {
            if (item.contentList) {
                item.contents = JSON.stringify(item.contentList);
            }
        }
        status = true;
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        data: list,
        message: message
    };
};

/**
 * 요청 위치 : "get reserv",
 * 데이터 : {"start":${조회 시작 일자, string, YYYYMMDD}, "end":${조회 종료 일자, string, YYYYMMDD}}
 * 응답 형식 : "data":[{"id": ${예약키, string}, "type":${예약/일정 구분, string, R(예약)/T(일정) - 항상 R로 준다.}, "name":${고객 이름, string}, "contact":${고객 전화번호, string, optional}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isAllDay":${하루종일여부, boolean, optional}, "contentList":${시술 혹은 일정 리스트, array[string], optional}, "manager":${담당 매니저 id, string}, "etc":${부가정보, string, optional}, "status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW, CUSTOMERCANCELED}}], "holiday":[{"date":${날짜, string, YYYY-MM-DD}, "title":${휴일이름, string}]
 */
exports.getReservationList = async function (data) {
    exports.email = this.email;
    let returnData = await exports.getReservationListRaw(data);

    if (returnData.status) {
        returnData.type = 'response';
        returnData.holiday = getHolidays(data.start, data.end);
        this.socket.emit(this.eventName, returnData);
    } else {
        return returnData;
    }
};
exports.getReservationListRaw = async function (data) {

    let email = this.email;
    let status = false, message, resultData;

    try {
        resultData = await newDb.getReservationList(email, data.start, data.end);
        for (let item of resultData) {
            if (item.contentList) {
                item.contents = JSON.stringify(item.contentList);
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
        data: resultData
    };
};

/**
 * 요청 위치 : "get task",
 * 데이터 : {"start":${조회 시작 일자, string, YYYYMMDD}, "end":${조회 종료 일자, string, YYYYMMDD}}
 * 응답 형식 : "data":[{"date": ${일정 날짜, string, YYYYMMDD}, "task":[{"id": ${예약키, string}, "name":${일정이름, string}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isDone":${완료 여부, boolean}, "contents":${일정, string, optional}, "manager":${담당 매니저 id, string}, "etc":${부가정보, string, optional}, "status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW, CUSTOMERCANCELED}}]}]
 */
exports.getTask = async function(data){
    let email = this.email;
    let status,message, resultData = [];
    let start = data.start, end = data.end;
    try{
        if(!moment(start,'YYYYMMDD').isValid() || !moment(end,'YYYYMMDD').isValid()){
            throw `start/end 값이 올바르지 않습니다.(start:${start}, end:${end})`;
        }
        let startDate = moment(start, 'YYYYMMDD');
        let endDate = moment(end, 'YYYYMMDD');
        let diff =  endDate.diff(startDate, 'days');
        if(diff < 0){
            throw `end 값이 start 작습니다.(start:${start}, end:${end})`;
        }

        for(let i=0; i<= diff; i++){
            let date = moment(start, 'YYYYMMDD').add(i, 'days').format('YYYYMMDD');
            resultData.push({
                date: date,
                task: await newDb.getTaskList(email, date, date)
            });
        }
        status = true;
    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        message: message,
        data: resultData
    };
}

exports.getTaskList = async function (data) {

    let email = this.email;
    let status,message, resultData;
    try{
        resultData = await newDb.getTaskList(email, data.start, data.end);
        status = true;
    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        message: message,
        data: resultData
    };
}
/**
 * 일정 혹은 예약 업데이트
 * 요청 위치 : "update reserv"
 */
exports.update = async function (data) {
    let type = data.type;

    if (!type) {
        type = 'R';
    }
    if (type === 'R') {
        return await exports.updateReservation.apply(this, [data]);
    } else if (type === 'T') {
        return await exports.updateTask.apply(this, [data]);
    } else (type !== 'R' && type !== 'T')
    {
        return {
            status: false,
            data: {id: data.id},
            message: `type값이 올바르지 않습니다.(type: ${type})`
        };
    }
}
/**
 * 예약수정(일정)
 * 요청 위치 : "update reserv"
 * 수정된 요청 데이터 : {"id": ${예약키, string}, "status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW, optional}, "type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string, optional}, "contact":${고객 전화번호, string, optional}, "start":${시작일시, string, YYYYMMDDHHmm, optional}, "end":${종료일시, string, YYYYMMDDHHmm, optional}, "isAllDay":${하루종일여부, boolean, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}, "manager":${담당 매니저 id, string, optional}, "etc":${부가정보, string, optional}, "noShowCase":${노쇼케이스, string, optional}}
 * 수정된 응답 형식 : {"id": ${예약키}}
 */
exports.updateTask = async function(newTask){
    let email = this.email;
    let status = false, message = null;

    try {
        let task = await newDb.getTask(email, newTask.id);
        if (!task) {
            throw `해당 아이디로 조회되는 일정이 없습니다.`;
        }

        //newTask에 없는 프로퍼티는 task에서 복사
        for (let x in task) {
            if (!newTask.hasOwnProperty(x)) {
                newTask[x] = task[x];
            }
        }

        //예약정보 저장
        newTask.email = email;
        await newDb.saveTask(newTask);


        status = true;
        message = '수정완료';
    } catch (e) {
        status = false;
        message = e;
    }

    return {
        status: status,
        data: {id: newTask.id},
        message: message
    }
}
/**
 * 예약수정(예약만)
 * 요청 위치 : "update reserv"
 * 수정된 요청 데이터 : {"id": ${예약키, string}, "status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW, optional}, "type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string, optional}, "contact":${고객 전화번호, string, optional}, "start":${시작일시, string, YYYYMMDDHHmm, optional}, "end":${종료일시, string, YYYYMMDDHHmm, optional}, "isAllDay":${하루종일여부, boolean, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}, "manager":${담당 매니저 id, string, optional}, "etc":${부가정보, string, optional}, "noShowCase":${노쇼케이스, string, optional}}
 * 수정된 응답 형식 : {"id": ${예약키}}
 * status: NOSHOW로 해서 주면 자동으로 노쇼 리스트에 반영됨
 * 노쇼로 하고 noShowCase가 있으면 그대로 반영. 노쇼일자는 예약의 시작일 기준
 */
exports.updateReservation = async function (newReservation) {
    let email = this.email;
    let status = false, message = null, pushMessage = '';

    try {
        let reservation = await newDb.getReservation(email, newReservation.id);
        if (!reservation) {
            throw `해당 아이디로 조회되는 예약이 없습니다.`;
        }

        //newResrevation에 없는 프로퍼티는 reservation에서 복사
        for (let x in reservation) {
            if (!newReservation.hasOwnProperty(x)) {
                newReservation[x] = reservation[x];
            }
        }

        if (newReservation.contents) {
            let array = JSON.parse(newReservation.contents);
            if (!Array.isArray(array)) {
                throw `type이 R(예약) 일 때는 contents는 Array형 json string이어야 합니다.(${newReservation.contents})`;
            }
            for (let i = 0; i < array.length; i++) {
                let item = array[i];
                if (item.id === undefined || !item.value) {
                    throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${newReservation.contents}')`;
                }
            }
            newReservation.contentList = array;
        }

        if(!newReservation.contact){
            newReservation.contact = null;
        }

        //신규 고객 추가
        if (newReservation.status !== process.nmns.RESERVATION_STATUS.DELETED && newReservation.contact !== reservation.contact) {
            let memberList = await newDb.getCustomerList(email, newReservation.contact, newReservation.name);
            if (memberList.length > 0) {
                newReservation.member = memberList[0].id;
            }else{
                let memberId = newCustomerId(email);
                await newDb.saveCustomer({
                    email: email,
                    id: memberId,
                    name: newReservation.name,
                    contact: newReservation.contact,
                    etc: newReservation.etc,
                    managerId: newReservation.manager
                });
                newReservation.member = memberId;
                pushMessage = '새로운 고객이 추가되었습니다.';
            }
        }

        //노쇼에서 정상 또는 취소로 바꿀 때 노쇼 삭제
        if (reservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && newReservation.contact) {
            if (newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED || newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED) {
                await newDb.delNoShow(reservation.id);
            }
        }
        //노쇼 처리인 경우 노쇼 추가
        if (newReservation.contact && newReservation.status === process.nmns.RESERVATION_STATUS.NOSHOW && reservation.status !== process.nmns.RESERVATION_STATUS.NOSHOW) {
            await newDb.addNoShow(email, newReservation.contact, newReservation.start.substring(0, 8), newReservation.noShowCase, newReservation.id, newReservation.name);
        }

        //예약정보 저장
        newReservation.email = email;
        await newDb.saveReservation(newReservation);

        let user = await db.getWebUser(email);

        //알림톡 전송
        if (newReservation.contact && newReservation.contact !== reservation.contact && newReservation.status === process.nmns.RESERVATION_STATUS.RESERVED && user.alrimTalkInfo.useYn === 'Y') {
            if (pushMessage) {
                pushMessage += '<br/>';
            }
            pushMessage += await alrimTalk.sendReservationConfirm(user, newReservation) ? '고객님께 예약알림을 전송하였습니다.' : '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
        }

        if (pushMessage && this.socket) {
            sendPush(this.socket, pushMessage);
        }

        //Local Test version에서는 취소하면 취소 알림톡 나간것처럼 하자.
        if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT && newReservation.status === process.nmns.RESERVATION_STATUS.CANCELED) {
            await alrimTalk.sendReservationCancelNotify(user, newReservation);
        }

        status = true;
        message = '예약수정완료';
    } catch (e) {
        status = false;
        if((typeof e) === 'string' ){
            message = e;
        }else{
            message = JSON.stringify(e);
        }
    }

    return {
        status: status,
        data: {id: newReservation.id},
        message: message
    }
}

/**
 * 일정 혹은 예약 추가
 * 요청 위치 : "add reserv"
 */
exports.add = async function (data) {
    let type = data.type;

    if (!type) {
        type = 'R';
    }
    if (type === 'R') {
        return await exports.addReservation.apply(this, [data]);
    } else if (type === 'T') {
        return await exports.addTask.apply(this, [data]);
    } else (type !== 'R' && type !== 'T')
    {
        return {
            status: false,
            data: {id: data.id},
            message: `type값이 올바르지 않습니다.(type: ${type})`
        };
    }
}

/**
 * 예약 추가(일정만)
 * 요청 위치 : "add reserv"
 * 요청 데이터 : {"id": ${예약키}, "type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string, optional}, "contact":${고객 전화번호, string, optional}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isAllDay":${하루종일여부, boolean, optional}, "manager":${담당 매니저 id, string, optional}, "etc":${부가정보, string, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}
 * type이 T(일정)이면 name 필수
 * 응답 데이터 : {"id": ${예약키}}
 */
exports.addTask = async function(data){
    let status = false, message;
    try {
        data.email = this.email;
        await newDb.saveTask(data);

        status = true;
        message = '일정 추가 완료';
    } catch (e) {
        status = false;
        message = e;
    }
    return {
        status: status,
        data: {id: data.id},
        message: message
    };
}

/**
 * 예약 추가(예약만)
 * 요청 위치 : "add reserv"
 * 요청 데이터 : {"id": ${예약키}, "type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string, optional}, "contact":${고객 전화번호, string, optional}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isAllDay":${하루종일여부, boolean, optional}, "manager":${담당 매니저 id, string, optional}, "etc":${부가정보, string, optional}, contents: ${시술 혹은 일정 리스트, json string, ex: "[{'id': 0, 'value':'네일케어'},{'id': 1, 'value':'페디케어'}]", optional}
 * 응답 데이터 : {"id": ${예약키}}
 */
exports.addReservation = async function (data) {
    let email = data.email = this.email;
    let status = false, message, pushMessage="";
    try {
        let contact = data.contact;
        let name = data.name;

        // if (!contact) {
        //     throw '연락처는 필수입니다.';
        // }

        let memberList = await newDb.getCustomerList(email, contact, name);
        if (memberList.length > 0) {
            data.member = memberList[0].id;
        } else {
            let memberId = newCustomerId(email);
            await newDb.saveCustomer({
                email: email,
                id: memberId,
                name: name,
                contact: contact,
                etc: data.etc,
                managerId: data.manager
            });
            data.member = memberId;
            pushMessage = '새로운 고객이 추가되었습니다.';
        }
        if (data.contents) {
            let array = JSON.parse(data.contents);
            if (!Array.isArray(array)) {
                throw `type이 R(예약) 일 때는 contents는 Array형 json string이어야 합니다.(${data.contents})`;
            }
            for (let i = 0; i < array.length; i++) {
                let item = array[i];
                if (item.id === undefined || !item.value) {
                    throw `예약 내용이 올바르지 않습니다.(type: 'R', contents: '${data.contents}')`;
                }
            }
            data.contentList = array;
        }

        await newDb.saveReservation(data);

        let user = await db.getWebUser(email);
        if (data.contact && user.alrimTalkInfo.useYn === 'Y') {
            if (pushMessage) {
                pushMessage += '<br/>';
            }
            pushMessage += await alrimTalk.sendReservationConfirm(user, data) ? '고객님께 예약알림을 전송하였습니다.' : '알림톡 전송이 실패했습니다. 고객 전화번호를 확인하세요.';
        }

        if (pushMessage && this.socket) {
            sendPush(this.socket, pushMessage);
        }

        status = true;
        message = '예약 추가 완료';
    } catch (e) {
        status = false;
        message = e;
    }
    return {
        status: status,
        data: {id: data.id},
        message: message
    };
}

/**
 * 알림톡 재전송
 * 요청 위치 : "resend alrimtalk", 데이터 : {"id":${예약 id, string}}
 * 응답 형식 : "data":{"id":${요청에서 넘겨준 id, string}}
 *
 * 하루에 한번 보낼 수 있다.
 */
exports.reSendReservationConfirm = async function (data) {
    let email = this.email;
    let status = false;
    let message = '알림톡 전송 실패';

    try{
        let id = data.id;
        if(!id){
            throw '예약 아이디가 없습니다.';
        }

        let user = await db.getWebUser(email);
        if(user.alrimTalkInfo.useYn !== 'Y'){
            throw '알림톡 사용 설정이 되어있지 않습니다.';
        }

        let reservation = await newDb.getReservation(email, id);
        if(!reservation){
            throw '없는 예약입니다.';
        }

        let today = moment().format('YYYYMMDD');
        let list = await newDb.getAlrimTalkList(email, today, today);
        list = list.filter(item => !item.isCancel).filter(item => item.reservationKey === id);
        if(list.length > 0){
            throw '한 예약당 하루에 한번 전송 가능합니다.';
        }

        if (!await alrimTalk.sendReservationConfirm(user, reservation)) {
            throw '고객 전화번호를 확인하세요.';
        }

        status = true;
        message = '알림톡 전송 성공';

    }catch(e){
        status = false;
        if(typeof e === 'string'){
            message = e;
        }else{
            message = '알림톡 전송에 실패했습니다.';
        }
    }

    return {
        status: status,
        data: {id: data.id},
        message: message
    };
}

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