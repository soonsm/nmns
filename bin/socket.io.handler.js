'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');

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


module.exports = function (server, sessionMiddleware) {
    var io = require('socket.io')(server);
    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    io.on('connection', async function (socket) {

        var email;
        process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() == 'production') ? 'production' : 'development';
        if (process.env.NODE_ENV == 'production') {
            email = socket.request.session.passport.user;
        } else if (process.env.NODE_ENV == 'development') {
            email = 'ksm@test.com';
        }

        console.log('socket io email:', email);

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


            socket.emit(GetReservationList, makeResponse(status, resultData, message));
        });

        socket.on(UpdateReservation, async function (newReservation) {
            console.log(newReservation);

            let validationResult = reservationValidation(email, newReservation);
            let status = validationResult.status;
            let message = validationResult.message || '수정완료';

            if(status){
                //validation for id, status
                if(!newReservation.status || (newReservation.status !== 'RESERVED' && newReservation.status !== 'CANCELED' && newReservation.status !== 'DELETED' && newReservation.status !== 'NOSHOW')){
                    status = false;
                    message = 'status가 필요합니다.("status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW}})';
                }
            }
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
                        reservationList[i] = db.newReservation(newReservation);
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

            let validationResult = reservationValidation(email, data);
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
const reservationValidation = function(email, data){
    let status = false, message;
    if(!data.id || !data.start || !data.end || !data.contact){
        message = '예약추가(수정)에 필요한 데이터가 없습니다. ({"id": ${예약키}, "type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string}, "contact":${고객 전화번호, string}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isAllDay":${하루종일여부, boolean, optional}, "contents":${시술정보, string, optional}, "manager":${담당 매니저 id, string, optional}, "etc":${부가정보, string, optional})';
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

const makeResponse = function (status, data, message) {
    return {
        type: 'response',
        status: status,
        message: message,
        data: data
    };
}

//TODO: polling handling
//TODO: dynamodb session
//TODO: passport.socketio
//TODO: queryfilter