'use strict';
const
    router = require('express').Router(),
    emailValidator = require('email-validator'),
    db = require('./webDb'),
    util = require('./util'),
    alrimTalk = require('./alrimTalkSender'),
    emailSender = require('./emailSender');

const moment = require('moment');

const logger = global.nmns.LOGGER;

const mainView = require('../client/template/main');
const indexView = require('../client/template/index');
const signupView = require('../client/template/signup');
const cancelView = require('../client/template/reservationCancel');

let render = function(res, view, data) {
    if (!data) {
        data = {};
    }
    data.cdn = global.nmns.cdn;
    res.marko(view, data);
}

module.exports = function(passport) {

    router.get("/", async function(req, res) { //main calendar page
        if (req.user) {
            let user = await db.getWebUser(req.user.email);
            if(user.authStatus === process.nmns.EMAIL_VERIFICATED){
                let tips = require('./tips').getTips();
                let index = 7;
                let num = Math.random();
                if (req.user.authStatus !== process.nmns.AUTH_STATUS.BEFORE_EMAIL_VERIFICATION || num > 0.7) {
                    tips.splice(7, 1);
                    index = Math.floor(Math.random() * (tips.length));
                }
                let tip = tips[index];
                req.session.tipToRemove = index;
                render(res, mainView, {
                    user: req.user,
                    tips: tip
                });
            }else{
                render(res, signupView, {
                    email: user.email,
                    authRequired: true
                });
            }

        } else {
            //로그인 되지 않은 상태이므로 index page로 이동
            res.redirect("/index");
        }
    });

    router.get('/index', async function(req, res) {
        if (req.user) {
            let user = await db.getWebUser(req.user.email);
            if(user.authStatus === process.nmns.EMAIL_VERIFICATED){
                //로그인 되있으면 main으로 이동
                res.redirect("/");
            }else{
                render(res, signupView, {
                    email: user.email,
                    authRequired: true
                });
            }
        } else {
            render(res, indexView, {
                email: req.cookies.email,
                message: req.session.errorMessage
            });
        }
    });

    router.get('/signup', function(req, res) {
        if (req.user) {
            //로그인 되있으면 main으로 이동
            res.redirect("/");
        } else {
            render(res, signupView, {
                email: req.cookies.email,
                message: req.session.errorMessage,
                kakaotalk: req.query.kakaotalk
            });
        }
    });

    router.post("/signup", async function(req, res) {
        let data = req.body;
        let email = data.email;
        let password = data.password;

        let sendResponse = function(res, validation, errorMessage){
            res.status(200).json({
                status: validation ? '200' : '400',
                message: errorMessage
            });
        }

        //email validation
        if (!emailValidator.validate(email)) {
            return sendResponse(res, false, '올바른 이메일 형식이 아닙니다.');
        }

        //password strength check
        let strenthCheck = util.passwordStrengthCheck(password);
        if (strenthCheck.result === false) {
            return sendResponse(res, false, strenthCheck.message);
        }

        //기존 사용자 체크
        if (await db.getWebUser(email)) {
            return sendResponse(res, false, '이미 존재하는 사용자입니다.');
        }

        data.emailAuthToken = require('js-sha256')(email);
        let newUser = db.newWebUser(data);
        if(data.useYn === 'Y'){
            if (!data.callbackPhone || !util.phoneNumberValidation(data.callbackPhone)) {
                return sendResponse(res, false, `휴대전화 번호 양식에 맞지 않습니다.${data.callbackPhone}`);
            }
            newUser.alrimTalkInfo = {
                useYn: 'Y',
                callbackPhone: data.callbackPhone,
                cancelDue: data.cancelDue || '',
                notice: data.notice || ''
            }
        }
        if(await db.setWebUser(newUser)){
            if (await emailSender.sendEmailVerification(email, data.emailAuthToken) && newUser) {
                //로그인처리
                req.logIn(newUser, function() {
                    return sendResponse(res, true, '회원가입성공');
                });
            }
        }
        return sendResponse(res, false, '시스템 오류가 발생했습니다.\n support@nomorenoshow.co.kr로 연락주시면 바로 조치하겠습니다.');

    });

    /**
     * 로그인 요청 json format
     * {email: #사용자 이메일#, password: #비밀번호#}
     * 로그인 응답
     * 로그인 성공: / page로 redirect
     * 로그인 실패
     * 없는 사용자: {message: '등록되지 않은 사용자입니다.'}
     * 비밀번호 오류: {message: '비밀번호가 잘못되었습니다.'}
     * 로그인 요청 json format이 잘못되었을 때: {message: 'Missing credentials'}
     * 그 외 에러: 나도 몰라, 근데 {message: 블라블라} 이런 형태로 리턴이 올 것임
     */
    router.post("/signin", function(req, res) {
        logger.log(req.body);
        let email = req.body.email;
        res.cookie('email', email);
        passport.authenticate('local', (err, user, info) => {
            req.logIn(user, function(err) {
                if (err) {
                    req.session.errorMessage = info.message;
                    res.redirect("/index");
                    return;
                }
                //로그인 성공
                res.redirect("/");
            });

        })(req, res);
    });

    router.get("/signout", (req, res) => {
        if (req.user) {
            let email = req.user.email;
            res.cookie('email', email);
            req.logout();
            req.session.destroy(function(err) {
                if (err) {
                    logger.log('fail to destroy session: ', err);
                }
                res.redirect("/");
            });
        } else {
            res.redirect("/");
        }
    })

    //http://localhost:8088/emailVerification/email=soonsm@gmail.com&token=297356b5ba41255cfe85cc692ecabbf3a0caf5423e62b9c0974e8ef73676b32a
    router.get("/emailVerification/email=:email&token=:token", async function(req, res) {
        const email = req.params.email;
        const token = req.params.token;

        let user = await db.getWebUser(email);
        if (user && user.emailAuthToken === token && user.authStatus !== process.nmns.AUTH_STATUS.EMAIL_VERIFICATED) {
            await db.updateWebUser(email, { authStatus: process.nmns.AUTH_STATUS.EMAIL_VERIFICATED });
            req.logIn(user, function() {
                res.redirect("/");
            });
            return;
        }

        res.redirect("/");
    });

    router.post('/resetPassword', async function(req, res) {
        const email = req.body.email;

        let user = await db.getWebUser(email);
        if (user) {
            let generator = require('generate-password');
            let password = generator.generate({
                length: 10,
                numbers: true
            });

            if (await db.updateWebUser(email, { password: util.sha512(password) })) {

                await emailSender.sendTempPasswordEmail(email, password);

                res.sendStatus(200);
                return;
            }
        }

        res.redirect("/");
    });

    router.get('/web_cancel/key=:reservationKey&&email=:email', async(req, res) => {
        let id = req.params.reservationKey;
        let email = req.params.email;

        let returnMsg = '예약취소실패';
        let contents = '예약정보가 없습니다.';

        //예약정보 수정
        if (!id || !email) {
            returnMsg = '예약취소실패';
            contents = '잘못된 접근입니다.';
        } else {
            let reservationList = await db.getReservationList(email);
            for (var i = 0; i < reservationList.length; i++) {
                let reservation = reservationList[i];
                if (reservation.id === id) {
                    if (reservation.status === process.nmns.RESERVATION_STATUS.CANCELED || reservation.status === process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED) {
                        returnMsg = '이미 취소된 예약';
                        contents = '이미 취소된 예약입니다.';
                    } else if (reservation.status === process.nmns.RESERVATION_STATUS.RESERVED) {
                        reservation.status = process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED;
                        reservation.cancelDate = moment().format('YYYYMMDD');
                        reservationList[i] = reservation;

                        let user = await db.getWebUser(email);
                        let socket = process.nmns.ONLINE[email];

                        let msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시 mm분')}`;
                        if (reservation.start.endsWith('00')) {
                            msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시')}`;
                        }
                        msg += ' 예약이 취소되었습니다.'
                        let push = {
                            id: moment().format('YYYYMMDDHHmmssSSS'),
                            title: '예약취소알림',
                            body: msg,
                            data: {
                                type: 'cancel reserv',
                                id: reservation.id,
                                manager: reservation.manager
                            },
                            confirmed: false
                        };
                        if (socket) {
                            push.confirmed = true;
                            await socket.sendPush(push);
                        }

                        let pushList = user.pushList || [];
                        pushList.push(push);
                        await db.updateWebUser(email, { pushList: pushList });

                        if (!await db.updateReservation(email, reservationList)) {
                            contents = `예약취소를 실패했습니다.\n${util.formatPhone(user.alrimTalkInfo.callbackPhone)}으로 전화나 카톡으로 취소하시기 바랍니다.`;
                        } else {
                            //알림톡 전송
                            await alrimTalk.sendReservationCancelNotify(user, reservation);
                            returnMsg = '예약취소완료';
                            contents = '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.';
                        }
                    }
                    break;
                }
            }
        }

        return render(res, cancelView, { title: returnMsg, contents: contents });
    });

    return router;
};