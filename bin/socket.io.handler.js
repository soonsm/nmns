'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');

const GetReservationList = 'get reserv';
const AddReservation = 'add reserv';
const UpdateReservation = 'update reserv';
const GetManagerList = 'get manager';
const GetNoShow = 'get noshow';
const AddNoShow = 'add noshow';
const DelNoShow = 'delete noshow';


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

        socket.on(UpdateReservation, async function (data) {
            console.log(data);

            let validationResult = reservationValidation(data);
            let status = validationResult.status;
            let message = validationResult.message || '수정완료';

            if(status){
                //validation for id, status
                if(!data.id || !data.status || (data.status !== 'RESERVED' && data.status !== 'CANCELED' && data.status !== 'DELETED')){
                    status = false;
                    message = 'id와 status가 필요합니다.({"id": ${예약키, string}, "status": ${상태, string, 값: RESERVED, CANCELED, DELETED}})';
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
                    if(reservation.id === data.id){
                        reservationList[i] = data;
                        isItMyReservation = true;
                        break;
                    }
                }
                if(isItMyReservation){
                    if(!await db.updateReservation(email, reservationList)){
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error';
                    }
                }else{
                    status = false;
                    message = '없는 예약입니다.';
                }

            }
            socket.emit(UpdateReservation, makeResponse(status, null, message));
        });

        socket.on(AddReservation, async function(data){
            console.log(data);

            let resultData;
            let validationResult = reservationValidation(data);
            let status = validationResult.status;
            let message = validationResult.message || '저장완료';

            if(status){
                /*
                TODO: 고객 없으면 추가
                고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
                이름과 연락처가 일치하는 고객이 없으면 추가
                 */

                //id create
                data.id = email+data.start+data.end+moment().format('YYYYMMDDHHmmssSSS');

                if(await db.addNewReservation(email,db.newReservation(data))){
                    resultData = {id: data.id};
                }
            }
            socket.emit(AddReservation, makeResponse(status, resultData, message));
        });

        socket.on(GetManagerList, async function () {
            let managerList = await db.getStaffList(email);
            socket.emit(GetManagerList, makeResponse(true, managerList));
        });

        socket.on(GetNoShow, async function (data) {
            let status = true, message = null, resultData = null;
            let contact = data.contact;
            let mine = data.mine;

            console.log(data);

            if (mine === true) {
                resultData = await db.getMyNoShow(email);
            } else {
                if (!contact && !mine) {
                    message = '노쇼 조회에 필요한 데이터가 없습니다.({"contact":${고객 모바일, string, optional}, "mine":${내 노쇼만 볼것인지 여부, boolean, optional}})';
                    status = false;
                } else if (contact && !util.phoneNumberValidation(contact)) {
                    message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
                    status = false;
                } else if (contact) {
                    resultData = [await db.getNoShow(contact)];
                }
            }

            socket.emit(GetNoShow, makeResponse(status, resultData, message));
        });

        socket.on(AddNoShow, async function (data) {
            const phone = data.contact;
            const name = data.name;
            const noShowCase = data.noShowCase;

            //TODO: validation

            let addedNoShow = await db.addToNoShowList(email, phone, noShowCase, name);

            socket.emit(AddNoShow, makeResponse(true, addedNoShow, null));
        });

        socket.on(DelNoShow, async function (data) {
            const phone = data.contact;
            let status = true, message;

            //TODO: validation

            let deleteResult = await db.deleteNoShow(phone, email);
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
 * 필수: name, start, end, contact
 * 선택: type(default: R), isAllDay, contents, manager, etc
 */
const reservationValidation = function(data){
    let status = true, message;
    if(!data.name || !data.start || !data.end || !data.contact){
        status = false;
        message = '예약추가에 필요한 데이터가 없습니다. ({"type":${예약/일정 구분, string, R(예약)/T(일정), optional, default: R}, "name":${고객 이름 혹은 일정이름, string}, "contact":${고객 전화번호, string}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm}, "isAllDay":${하루종일여부, boolean, optional}, "contents":${시술정보, string, optional}, "manager":${담당 매니저 이름, string, optional}, "etc":${부가정보, string, optional})';
    }else if(!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
        status = false;
    }else if(!util.phoneNumberValidation(data.contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
        status = false;
    }else if(data.type && data.type !== 'R' && data.type !== 'T'){
        status = false;
        message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
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