'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const newDb = require('./newDb');
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
const menuHandler = require('./menuHandler');
const salesHandler = require('./salesHistHandler');
const noticeHandler = require('./noticeHandler');

const GetReservationList = 'get reserv',
    GetTaskList = 'get task',
    GetReservationSummaryList = 'get summary',
    AddReservation = 'add reserv',
    ResendAlrimtalk = 'resend alrimtalk',
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
    UpdatePwd = 'update password',
    GetAnnouncement = 'get announcement',
    LinkSns = 'link sns';
const GetAlrimTalkInfo = 'get alrim', UpdateAlirmTalk = 'update alrim', GetAlrimTalkHistory = 'get alrim history', GetCustomerAlrimTalkHistory = 'get customer alrim';
const SendVerification = 'send verification';
const GetCustomerInfo = 'get customer info', GetCustomerDetail = 'get customer', GetCustomerList = "get customer list", AddCustomer = 'add customer', UpdateCustomer = 'update customer', DelCustomer = 'delete customer', MergeCustomer = 'merge customer';
const SendNoti = 'message', GetNoti = 'get noti';
const GetTips = 'get tips';
const AadFeedback = "submit feedback";
const GetMenuList = 'get menu list',
    AddMenu = 'add menu',
    UpdateMenu = 'update menu',
    UpdateMenuList = 'update menu list';
const GetSalesList = 'get sales list',
    GetReservationSales = 'get reserv sales',
    GetMembershipHistory = 'get membership history',
    SaveSales = 'save sales',
    AddMembership = 'add membership';

const EVENT_LIST_NO_NEED_VERIFICATION = [GetTips, GetCustomerInfo, GetCustomerDetail, GetAlrimTalkInfo, GetManagerList, GetReservationSummaryList, GetReservationList, GetNoti, SendVerification, GetManagerList, AddManager, UpdateManager, DelManager, GetShop, UpdateShop, UpdatePwd];

module.exports = function (server, sessionStore, passport, cookieParser) {
    var io = require('socket.io')(server);

    //Socket-Io-Tester 사용 할 때 주석처리 해야 함 Begin
    io.use(passportSocketIo.authorize({
        key: 'connect.sid',
        secret: 'rilahhuma',
        store: sessionStore,
        passport: passport,
        cookieParser: cookieParser
    }));
    //Socket-Io-Tester 사용 할 때 주석처리 해야 함 End

    io.on('connection', async function (socket) {

        //Socket-Io-Tester 사용 할 때 주석 풀어야 함 Begin
        // var email = 'soonsm@gmail.com';
        // var user = await db.getWebUser(email);
        // user.authStatus = 'EMAIL_VERIFICATED';
        //Socket-Io-Tester 사용 할 때 주석 풀어야 함 End

        //Socket-Io-Tester 사용 할 때 주석처리 해야 함 Begin
        const user = socket.request.user;
        const email = user.email;
        if (!email || !socket.request.user.logged_in) {
            logger.log(`User ${email} is not logged in`);
            return;
        }
        //Socket-Io-Tester 사용 할 때 주석처리 해야 함 End

        //방문 기록 로깅
        const MobileDetect = require('mobile-detect');
        let md = new MobileDetect(socket.request.headers['user-agent']);
        let visitLog = newDb.visitLog(email, md.mobile() || 'pc');

        socket.sendPush = async function (data) {
            socket.emit(SendNoti, {
                type: 'push',
                data: [data]
            });
        };

        process.nmns.ONLINE[email] = socket;

        socket.on('disconnect', async function () {
            delete process.nmns.ONLINE[email];

            await newDb.exitLog(visitLog);
        });

        const addEvent = function (eventName, fn) {
            socket.on(eventName, async function (data) {
                logger.log(`email: ${email}, eventName: ${eventName}, data: ${util.format(data)}`);
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
                            if(!result.status){
                                logger.error(`eventName: ${eventName}, error: ${result.message}`);
                            }
                        }
                    }
                    catch (e) {
                        socket.emit(eventName, makeResponse(false, data, '시스템 에러로 처리하지 못했습니다.'));
                        logger.error(`email: ${email}, eventName: ${eventName}, data: ${util.format(data)}, error: ${e}`);
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
            db.submitFeedback(email, data.data);

            emailSender.sendFeedbackAlrim(email, data.data);
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
         * 공지사항 및 알림 조회
         */
        addEvent(GetNoti, noticeHandler.getPush);
        addEvent(GetAnnouncement, noticeHandler.getNotice);

        /**
         * 고객정보
         */
        addEvent(GetCustomerInfo, customerHandler.getCustomerInfo);
        addEvent(GetCustomerDetail, customerHandler.getCustomerDetail);
        addEvent(GetCustomerList, customerHandler.getCustomerList);
        addEvent(AddCustomer, customerHandler.addCustomer);
        addEvent(UpdateCustomer, customerHandler.updateCustomer);
        addEvent(DelCustomer, customerHandler.deleteCustomer);
        addEvent(MergeCustomer, customerHandler.mergeCustomer);

        /**
         * AlrimTalk
         */
        addEvent(GetAlrimTalkInfo, alrimTalkHandler.getAlirmTalkInfo);
        addEvent(UpdateAlirmTalk, alrimTalkHandler.updateAlrimTalkInfo);
        addEvent(GetAlrimTalkHistory, alrimTalkHandler.getAlrimTalkHistory);
        addEvent(GetCustomerAlrimTalkHistory, alrimTalkHandler.getAlrimTalkHistory);

        /**
         * Shop & Account
         */
        addEvent(UpdatePwd, accountHandler.updatePwd);
        addEvent(GetShop, accountHandler.getShop);
        addEvent(UpdateShop, accountHandler.updateShop);
        addEvent(LinkSns, accountHandler.linkSns);

        /**
         * Reservation
         */
        addEvent(GetReservationSummaryList, reservationHandler.getReservationSummaryList);
        addEvent(GetTaskList, reservationHandler.getTask);
        addEvent(GetReservationList, reservationHandler.getReservationList);
        addEvent(UpdateReservation, reservationHandler.update);
        addEvent(AddReservation, reservationHandler.add);
        addEvent(ResendAlrimtalk, reservationHandler.reSendReservationConfirm);

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

        /**
         * Menu
         */
        addEvent(GetMenuList, menuHandler.getMenuList);
        addEvent(AddMenu, menuHandler.saveMenu);
        addEvent(UpdateMenu, menuHandler.saveMenu);
        addEvent(UpdateMenuList, menuHandler.updateMenuList);

        /**
         * 매출내역
         */
        addEvent(GetSalesList, salesHandler.getSalesHist);
        addEvent(GetReservationSales, salesHandler.getSalesForReservation);
        addEvent(GetMembershipHistory, salesHandler.getMembershipHistory);
        addEvent(SaveSales, salesHandler.saveSales);
        addEvent(AddMembership, salesHandler.addMembershipHistory);
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


