'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const emailSender = require('./emailSender');
const passportSocketIo = require('passport.socketio');
const util = require('util');
const tip = require('./tips');

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
const SendNoti = 'message', GetNoti = 'get noti';
const GetTips = 'get tips';
const AadFeedback = "submit feedback";

const EVENT_LIST_NO_NEED_VERIFICATION = [AadFeedback, GetTips, GetCustomerInfo, GetCustomerDetail, GetAlrimTalkInfo, GetManagerList, GetReservationSummaryList, GetReservationList, GetNoti, SendVerification, GetNoShow, AddNoShow, DelNoShow, GetManagerList, AddManager, UpdateManager, DelManager, GetShop, UpdateShop, UpdatePwd];

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
        const user = socket.request.user;
        const email = user.email;

        // var email = 'soonsm@gmail.com';
        // var user = await db.getWebUser(email);
        // user.authStatus = 'EMAIL_VERIFICATED';

        if (!email || !socket.request.user.logged_in) {
            logger.log(`User ${email} is not logged in`);
            return;
        }

        socket.sendPush = async function (data) {
            socket.emit(SendNoti, {
                type: 'push',
                data: [data]
            });
        }

        process.nmns.ONLINE[email] = socket;

        socket.on('disconnect', async function () {
            delete process.nmns.ONLINE[email];
        });

        const addEvent = function (eventName, fn) {
            socket.on(eventName, async function (data) {
                logger.log(`email: ${email} eventName: ${eventName} data: ${util.format(data)}`);
                if (user.authStatus !== 'EMAIL_VERIFICATED' && !EVENT_LIST_NO_NEED_VERIFICATION.includes(eventName)) {
                    socket.emit(eventName, makeResponse(false, data, '이메일 인증 후 사용하시기 바랍니다.'));
                }
                else {
                    try {
                        fn.email = email;
                        fn.socket = socket;
                        fn.eventName = eventName;
                        let result = await fn.apply(fn, [data]);
                        if (result) {
                            socket.emit(eventName, makeResponse(result.status, result.data, result.message));
                        }
                    }
                    catch (e) {
                        socket.emit(eventName, makeResponse(false, data, '시스템 에러로 처리하지 못했습니다.'));
                        logger.log(`email: ${email} eventName: ${eventName} data: ${data} error: ${e}`);
                    }
                }
            });
        };

        /**
         * Tip 조회
         */
        addEvent(GetTips, async function () {
            sessionStore.get(socket.request.sessionID, function (err, session) {
                if(!err){
                    let tips = tip.getTips();
                    let indexToRemove = session.tipToRemove;
                    if(Number.isInteger(indexToRemove) && indexToRemove >= 0 && indexToRemove < tips.length){
                        tips.splice(session.tipToRemove, 1);
                    }
                    socket.emit(GetTips, makeResponse(true, tips, null));
                }
            });
        });

        /**
         * Feedback 제출
         */
        addEvent(AadFeedback, async function(data){
            //TODO: feedback save
            db.submitFeedback(email, data.data);
        });

        /**
         * 이메일 인증 보내기
         */
        addEvent(SendVerification, async function () {
            let status = true,
                message = `인증 이메일이 ${email}로 전송되었습니다.`;

            const emailAuthToken = require('js-sha256')(email);
            const result = await emailSender.sendEmailVerification(email, emailAuthToken);
            if (!result) {
                status = false;
                message = '인증 이메일 전송이 실패하였습니다.';
            }

            socket.emit(SendVerification, makeResponse(status, null, message));
        });

        /**
         * 알림 조회
         */
        addEvent(GetNoti, async function () {
            let resultData = {
                type: 'push',
                data: []
            };

            let user = await db.getWebUser(email);
            let pushList = user.pushList || [];
            for (let i = pushList.length - 1; i >= 0; i--) {
                let push = pushList[i];
                if (push.confirmed === false) {
                    resultData.data.push(push);
                    pushList[i].confirmed = true;
                } else {
                    break;
                }
            }

            await db.updateWebUser(email, {pushList: pushList});

            socket.emit(GetNoti, makeResponse(true, resultData, null));
        })

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


