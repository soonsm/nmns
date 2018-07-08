'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');
const passportSocketIo = require('passport.socketio');

const GetReservationList = 'get reserv';
const AddReservation = 'add reserv';
const UpdateReservation = 'update reserv';
const GetNoShow = 'get noshow';
const AddNoShow = 'add noshow';
const DelNoShow = 'delete noshow';
const GetManagerList = 'get manager';
const AddManager = 'add manager';
const UpdateManager = 'update manager';
const DelManager = 'delete manager';

module.exports = function (server, sessionStore, passport, cookieParser) {
    var io = require('socket.io')(server);

    io.use(passportSocketIo.authorize({
        key: 'connect.sid',
        secret: 'rilahhuma',
        store: sessionStore,
        passport: passport,
        cookieParser: cookieParser
    }));

    io.on('connection', async function (socket) {
        var email = socket.request.user.email;

//        var email = 'ksm@test.com';
        console.log('socket io email:', email);

        if(!email || !socket.request.user.logged_in){
            console.log(`User ${email} is not logged in`);
            return;
        }

        /**
         * Reservation
         */

        socket.on(GetReservationList, async function (data) {
            let status = true;
            let message = null;
            let resultData = null;
            console.log(data);
            if (!data || !data.start || !data.end) {
                message = '예약정보 조회에 필요한 데이터가 없습니다.({"start":${조회 시작 일자, string, YYYYMMDDHHmm}, "end":${조회 종료 일자, string, YYYYMMDDHHmm}})'
                status = false;
            } else if (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
                message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
                status = false;
            }

            if (status) {
                resultData = await db.getReservationList(email, data.start, data.end);
            }

            let response = makeResponse(status, resultData, message);
            response.holiday = getHolidays(data.start, data.end);

            socket.emit(GetReservationList, response);
        });

        socket.on(UpdateReservation, async function (newReservation) {
            console.log('UpdateReservation:', newReservation);

            let validationResult = reservationValidationForUdate(email, newReservation);
            let status = validationResult.status;
            let message = validationResult.message || '수정완료';

            if(status){
                /*
                TODO: 고객 없으면 추가
                고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
                이름과 연락처가 일치하는 고객이 없으면 추가
                 */

                let reservationList = await db.getReservationList(email);
                let isItMyReservation = false;
                for(var i=0; i<reservationList.length; i++){
                    let reservation = reservationList[i];
                    if(reservation.id === newReservation.id){
                        for(let x in reservation){
                          if(newReservation.hasOwnProperty(x)){
                              reservation[x] = newReservation[x];
                          }
                        }
                        reservationList[i] = reservation;
                        isItMyReservation = true;
                        break;
                    }
                }
                if(isItMyReservation){
                    if(!await db.updateReservation(email, reservationList)){
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error';
                    }
                    if(newReservation.status === 'NOSHOW'){
                        //noShow 입력
                        await db.addToNoShowList(email, newReservation.contact, null, newReservation.name);
                    }
                }else{
                    status = false;
                    message = '없는 예약입니다.';
                }

            }
            socket.emit(UpdateReservation, makeResponse(status, {id: newReservation.id}, message));
        });

        socket.on(AddReservation, async function(data){
            console.log(data);

            let validationResult = reservationValidationForAdd(email, data);
            let status = validationResult.status;
            let message = validationResult.message || '저장완료';

            if(status){
                /*
                TODO: 고객 없으면 추가
                고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
                이름과 연락처가 일치하는 고객이 없으면 추가
                 */

                if(!await db.addNewReservation(email,db.newReservation(data))){
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error';
                }
            }
            socket.emit(AddReservation, makeResponse(status, {id: data.id}, message));
        });

        socket.on(GetManagerList, async function () {
            let managerList = await db.getStaffList(email);
            socket.emit(GetManagerList, makeResponse(true, managerList));
        });

        /**
         * Manager
         */

        socket.on(AddManager, async (staff)=>{
            let status = true, message = null;
            let name = staff.name;
            let id = staff.id;

            if(!name || !id){
                status = false;
                message = '담당자 추가에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${매니저 이름, string}, "color":${저장할 색깔, string, #RRGGBB, optional}})';
            }

            if(status){
                if(! await db.addNewStaff(email, db.newStaff(staff))){
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error';
                }
            }

            socket.emit(AddManager, makeResponse(status, {id: id}, message));
        });

        socket.on(UpdateManager, async (newStaff)=>{
            let status = true, message = null;
            let name = newStaff.name;
            let color = newStaff.color;
            let id = newStaff.id;

            if(!name || !color || !id){
                status = false;
                message = '담당자 수정에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${변경후 매니저 이름, string}, "color":${변경할 색깔, string, #RRGGBB}})';
            }

            if(status){
                let staffList = await db.getStaffList(email);
                let index = -1;
                for(let i=0;i<staffList.length;i++){
                    let staff = staffList[i];
                    if(staff.id === newStaff.id){
                        index = i;
                        break;
                    }
                }
                if(index === -1){
                    status = false;
                    message = '해당 담당자는 존재하지 않습니다.';
                }else{
                    staffList[index] = newStaff;
                    if(!await db.updateStaffList(email, staffList)){
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }

            socket.emit(UpdateManager, makeResponse(status, {id: id}, message));
        });
        socket.on(DelManager, async (newStaff)=>{
            let status = true, message = null;
            let id = newStaff.id;

            if(!id){
                status = false;
                message = '담당자 삭제에 필요한 데이터가 없습니다. ({"id": ${매니저 키}})';
            }

            if(status){
                let staffList = await db.getStaffList(email);
                let index = -1;
                for(let i=0;i<staffList.length;i++){
                    let staff = staffList[i];
                    if(staff.id === newStaff.id){
                        index = i;
                        break;
                    }
                }
                if(index === -1){
                    status = false;
                    message = '해당 담당자는 존재하지 않습니다.';
                }else{
                    staffList.splice(index, 1);
                    if(!await db.updateStaffList(email, staffList)){
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }

            socket.emit(DelManager, makeResponse(status, {id: id}, message));
        });

        /**
         * NoShow
         */

        socket.on(GetNoShow, async function (data) {
            let status = true, message = null, resultData = null;
            let contact = data.contact;
            let mine = data.mine;

            console.log(data);

            if((mine !== true && mine !== false)|| !contact){
                status=false;
                message = '노쇼 조회에 필요한 데이터가 없습니다. ({"contact":${고객 모바일, string}, "mine":${내 노쇼만 볼것인지 여부, boolean}})';
            }else if(!util.phoneNumberValidation(contact)){
                message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
                status = false;
            }

            if (mine === true) {
                resultData = await db.getMyNoShow(email, contact);
            } else {
                resultData = await db.getNoShow(contact);
            }

            socket.emit(GetNoShow, makeResponse(status, resultData, message));
        });

        socket.on(AddNoShow, async function (data) {
            let status = true, message = null, resultData = null;
            const contact = data.contact;
            const name = data.name;
            const noShowCase = data.noShowCase;

            //validation
            if(!contact || !name){
                status = false;
                message = '노쇼 등록에 필요한 데이터가 없습니다. ({"contact":${고객 모바일, string}, "name":${고객 이름, string, optional},"noShowCase":${매장 코멘트, string, optional}})';
            }else if(!util.phoneNumberValidation(contact)){
                status = false;
                message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
            }
            resultData = await db.addToNoShowList(email, contact, noShowCase, name);

            socket.emit(AddNoShow, makeResponse(status, resultData, message));
        });

        socket.on(DelNoShow, async function (data) {
            let status = true, message = null;
            const contact = data.contact;

            //validation
            if(!contact ){
                status = false;
                message = '노쇼 등록에 필요한 데이터가 없습니다. ({"contact":${고객 모바일, string}})';
            }else if(!util.phoneNumberValidation(contact)){
                status = false;
                message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
            }

            let deleteResult = await db.deleteNoShow(contact, email);
            if (!deleteResult) {
                status = false;
                message = '내가 추가한 노쇼만 삭제 할 수 있습니다.';
            }
            socket.emit(DelNoShow, makeResponse(status, null, message));
        });
    });
};

/**
 * validation
 * 필수: id, start, end, contact
 * 선택: name, type(default: R), isAllDay, contents, manager, etc
 */
const reservationValidationForAdd = function(email, data){
    let status = false, message;
    if(!data.id || !data.start || !data.end || !data.contact){
        message = '예약추가에 필요한 필수 데이터가 없습니다. ({"id": ${예약키}, "contact":${고객 전화번호, string}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm})';
    }else if(!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
    }else if(!util.phoneNumberValidation(data.contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
    }else if(data.type && data.type !== 'R' && data.type !== 'T'){
        message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
    }else if(data.id && !data.id.startsWith(email)){
        message = 'email 조작이 의심되어 거절합니다.';
    }else{
        status = true;
    }

    return {status: status, message: message};
}

const reservationValidationForUdate = function(email, data){
    let status = false, message;

    if(!data.id){
        message = '예약수정에 필요한 필수 데이터가 없습니다.({"id": ${예약키})';
    }else if(data.id && !data.id.startsWith(email)){
        message = 'email 조작이 의심되어 거절합니다.';
    }else if(data.start && (!moment(data.start, 'YYYYMMDDHHmm').isValid())) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}`;
    }else if(data.end && (!moment(data.end, 'YYYYMMDDHHmm').isValid())) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) end:${data.end}`;
    }else if(data.contact && !util.phoneNumberValidation(data.contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
    }else if(data.type && data.type !== 'R' && data.type !== 'T'){
        message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
    }else if(data.status && (data.status !== 'RESERVED' && data.status !== 'CANCELED' && data.status !== 'DELETED' && data.status !== 'NOSHOW')){
        message = 'status값이 올바르지 않습니다.("status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW}})';
    }else{
        status = true;
    }
    return {status: status, message: message};
}

const makeResponse = function (status, data, message) {
    return {
        type: 'response',
        status: status,
        message: message,
        data: data
    };
}

const getHolidays = (function(){
    const holidays= [];

    const push =function (date, title){
        holidays.push({
            date: date,
            title: title
        })
    }

    push('2018-01-01','새해');
    push('2018-02-15','설날');
    push('2018-02-16','설날');
    push('2018-02-17','설날');
    push('2018-03-01','삼일절');
    push('2018-05-05','어린이날');
    push('2018-05-22','부처님오신');
    push('2018-06-06','현충일');
    push('2018-08-15','광복절');
    push('2018-09-23','추석');
    push('2018-09-24','추석');
    push('2018-09-25','추석');
    push('2018-10-03','개천절');
    push('2018-10-09','한글날');
    push('2018-12-25','크리스마스');

    push('2019-01-01','새해');
    push('2019-02-04','설날');
    push('2019-02-05','설날');
    push('2019-02-06','설날');
    push('2019-03-01','삼일절');
    push('2019-05-05','어린이날');
    push('2019-05-12','부처님오신');
    push('2019-06-06','현충일');
    push('2019-08-15','광복절');
    push('2019-09-12','추석');
    push('2019-09-13','추석');
    push('2019-09-14','추석');
    push('2019-10-03','개천절');
    push('2019-10-09','한글날');
    push('2019-12-25','크리스마스');

    push('2020-01-01','새해');
    push('2020-01-24','설날');
    push('2020-01-25','설날');
    push('2020-01-26','설날');
    push('2020-03-01','삼일절');
    push('2020-05-05','어린이날');
    push('2020-04-30','부처님오신');
    push('2020-06-06','현충일');
    push('2020-08-15','광복절');
    push('2020-09-30','추석');
    push('2020-10-01','추석');
    push('2020-10-02','추석');
    push('2020-10-03','개천절');
    push('2020-10-09','한글날');
    push('2020-12-25','크리스마스');

    return function(start, end){
        start = moment(start.substring(0,8)).format('YYYY-MM-DD');
        end = moment(end.substring(0,8)).format('YYYY-MM-DD');

        let returnHolidays = [];
        for(let i=0;i<holidays.length;i++){
            let holiday = holidays[i];
            if(holiday.date >= start && holiday.date <= end){
                returnHolidays.push(holiday);
            }
        }
        return returnHolidays;
    };
})();


//TODO: polling handling
//TODO: dynamodb session
//TODO: passport.socketio
//TODO: queryfilter