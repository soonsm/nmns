'use strict';

const db = require('./webDb');
const emailSender = require('./emailSender');
const passportSocketIo = require('passport.socketio');

const noShowHandler = require('./noShowHandler');
const reservationHandler = require('./reservationHandler');
const managerHandler = require('./managerHandler');
const accountHandler = require('./accountHandler');
const customerHandler = require('./customerHandler');
const alrimTalkHandler = require('./alrimTalkHandler');

const GetReservationList = 'get reserv',
    GetReservationSummaryList = 'get summary',
    AddReservation = 'add reserv',
    UpdateReservation = 'update reserv';
const GetNoShow = 'get noshow',
    AddNoShow = 'add noshow',
    DelNoShow = 'delete noshow';
const GetManagerList = 'get manager',
    AddManager = 'add manager',
    UpdateManager = 'update manager',
    DelManager = 'delete manager';
const GetShop = 'get info',
    UpdateShop = 'update info',
    UpdatePwd = 'update password';
const GetAlrimTalkInfo = 'get alrim',
    UpdateAlirmTalk = 'update alrim';
const SendVerification = 'send verification';
const GetCustomerInfo = 'get customer info', GetCustomerDetail = 'get customer';
const Push = 'message';

const EVENT_LIST_NO_NEED_VERIFICATION = [SendVerification, GetNoShow, AddNoShow, DelNoShow, GetManagerList, AddManager, UpdateManager, DelManager, GetShop, UpdateShop, UpdatePwd];

module.exports = function (server, sessionStore, passport, cookieParser) {
    var io = require('socket.io')(server);

    // io.use(passportSocketIo.authorize({
    //     key: 'connect.sid',
    //     secret: 'rilahhuma',
    //     store: sessionStore,
    //     passport: passport,
    //     cookieParser: cookieParser
    // }));

    io.on('connection', async function (socket) {
        // const user = socket.request.user;
        // const email = user.email;

        var email = 'ksm@test.com';
        var user = await db.getWebUser(email);
        user.authStatus = 'EMAIL_VERIFICATED';
        console.log('socket io email:', email);

        // if(!email || !socket.request.user.logged_in){
        //     console.log(`User ${email} is not logged in`);
        //     return;
        // }

        socket.sendPush = async function(data){
            socket.emit(Push, data);
        }

        process.nmns.ONLINE[email] = socket;

        socket.on('disconnect', async function(reason){
            delete process.nmns.ONLINE[email];
        });

        const addEvent = function (eventName, fn) {
            socket.on(eventName, async function (data) {
                if (user.authStatus !== 'EMAIL_VERIFICATED' && !EVENT_LIST_NO_NEED_VERIFICATION.includes(eventName)) {
                    socket.emit(eventName, makeResponse(false, null, '이메일 인증 후 사용하시기 바랍니다.'));
                }
                else {
                    try {
                        fn.email = email;
                        fn.socket = socket;
                        fn.eventName = eventName;
                        let result = await fn.apply(fn, [data]);
                        if(result){
                            socket.emit(eventName, makeResponse(result.status, result.data, result.message));
                        }
                    }
                    catch (e) {
                        socket.emit(eventName, makeResponse(false, data, '시스템 에러로 처리하지 못했습니다.'));
                    }
                }
            });
        };

        /**
         * 이메일 인증 보내기
         */
        addEvent(SendVerification, async function () {
            let status = true,
                message = `인증 이메일이 ${email}로 전송되었습니다.`;

            const emailAuthToken = require('js-sha256')(email);
            if (!(await emailSender.sendEmailVerification(email, emailAuthToken))) {
                status = false;
                message = '인증 이메일 전송이 실패하였습니다.';
            }

            socket.emit(SendVerification, makeResponse(status, null, message));
        });

        /**
         * 고객정보
         */
        addEvent(GetCustomerInfo, customerHandler.getCustomerInfo);
        addEvent(GetCustomerDetail, customerHandler.getCustomerDetail)

        /**
         * AlrimTalk
         */
        addEvent(GetAlrimTalkInfo, alrimTalkHandler.getAlirmTalkInfo);
        addEvent(UpdateAlirmTalk, alrimTalkHandler.updateAlrimTalkInfo);

        /**
         * Shop & Account
         */
        addEvent(UpdatePwd, accountHandler.updatePwd);
        addEvent(GetShop, accountHandler.getShop);
        addEvent(UpdateShop, accountHandler.updateShop);

        /**
         * Reservation
         */
        addEvent(GetReservationSummaryList, reservationHandler.getReservationSummaryList);
        addEvent(GetReservationList, reservationHandler.getReservationList);
        addEvent(UpdateReservation, reservationHandler.updateReservation);
        addEvent(AddReservation, reservationHandler.addReservation);

        /**
         * Manager
         */
        addEvent(GetManagerList, managerHandler.getManagerList);
        addEvent(AddManager, managerHandler.addManager);
        addEvent(UpdateManager, managerHandler.updateManager);
        addEvent(DelManager, managerHandler.delManager);

        /**
         * NoShow
         */
        addEvent(GetNoShow, noShowHandler.getNoShow);
        addEvent(AddNoShow, noShowHandler.addNoShow);
        addEvent(DelNoShow, noShowHandler.delNoShow);
    });
};

const makeResponse = function (status, data, message) {
    return {
        type: 'response',
        status: status,
        message: message,
        data: data
    };
};


