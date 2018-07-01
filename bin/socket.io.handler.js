'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');

const GetReservationList = 'get reserv';
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
                    message = `전화번호 형식이 올바르지 않습니다.(${contact})`;
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

        socket.on(DelNoShow, async function(data){
            const phone = data.contact;
            let status = true, message;

            //TODO: validation

            let deleteResult = await db.deleteNoShow(phone, email);
            if(!deleteResult){
                status = false;
                message = '내가 추가한 노쇼만 삭제 할 수 있습니다.';
            }
            socket.emit(DelNoShow, makeResponse(stauts, null, message));
        });


        /*
        socket.on("get info", function(msg){
          console.log(msg);
          console.log("get info call");
          socket.emit("get info", "test");
        });
        var user = socket.request.session.passport.user;
        console.log(user);
        console.log("aaa hi");
        socket.broadcast.emit("hi");
        */
    });
};

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