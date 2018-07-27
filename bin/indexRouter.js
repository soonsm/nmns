'use strict';
const
    router = require('express').Router(),
    emailValidator = require('email-validator'),
    db = require('./webDb'),
    util = require('./util'),
    alrimTalk = require('./alrimTalkSender'),
    emailSender = require('./emailSender');

const moment = require('moment');

module.exports = function (passport) {


    router.get('/index', function (req, res) {
        res.marko(require('../client/template/index'), {
            type: "signin",
            email: req.cookies.email,
            message: req.session.errorMessage
        });
    });

    router.post("/signup", async function (req, res) {
        let data = req.body;
        let email = data.email;
        let password = data.password;
        let passwordRepeat = data.passwordRepeat;

        let error = {
            type: 'signup',
            email: email,
            message: null
        };

        //email validation
        if (!emailValidator.validate(email)) {
            //email validation fail
            error.message = '올바른 이메일 형식이 아닙니다.';
            return res.marko(require('../client/template/index'), error);
        }

        //password validation
        if (password !== passwordRepeat) {
            error.message = '비밀번호와 비밀번호 확인 값이 같지 않습니다.';
            return res.marko(require('../client/template/index'), error);
        }

        //password strength check
        let strenthCheck = util.passwordStrengthCheck(password);
        if (strenthCheck.result === false) {
            error.message = strenthCheck.message;
            return res.marko(require('../client/template/index'), error);
        }

        //기존 사용자 체크
        let user = await db.getWebUser(email);
        if (user) {
            error.message = '이미 존재하는 사용자입니다.';
            return res.marko(require('../client/template/index'), error);
        }

        const emailAuthToken = require('js-sha256')(email);

        user = await db.signUp({email: email, password: password, emailAuthToken: emailAuthToken});

        await emailSender.sendEmailVerification(email, emailAuthToken);

        if (user) {
            //로그인처리
            req.logIn(user, () => res.redirect("/"));
            res.redirect("/");
        } else {
            error.message = '시스템 오류가 발생했습니다.\n nomorenoshow@gmail.com으로 연락주시면 바로 조치하겠습니다.';
            return res.marko(require('../client/template/index'), error);
        }
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
    router.post("/signin", function (req, res) {
        console.log(req.body);
        let email = req.body.email;
        res.cookie('email', email);
        passport.authenticate('local', (err, user, info) => {
            req.logIn(user, function (err) {
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
        req.logout();
        req.session.destroy(function (err) {
            console.log('fail to destroy session: ', err);
        });
        res.redirect('/');
    })

    router.get("/", function (req, res) {//main calendar page
        if (req.user) {
            res.marko(require('../client/template/main'), {user: req.user});
        } else {
            //로그인 되지 않은 상태이므로 index page로 이동
            res.redirect("/index");
        }
    });

    router.get('/auth?email=:email&token=:token', async function (req, res) {
        const email = req.params.email;
        const token = req.params.token;

        let user = await db.getWebUser(email);
        if (user && user.emailAuthToken === token) {
            await db.updateWebUser(email, 'authStatus', 'EMAIL_VERIFICATED');
            //TODO: 이메일 인증이 완료되었다는 페이지로 이동
            return;
        }

        //TODO: 잘못된 접근이라는 페이지로 이동
    });

    router.post('/resetPassword', async function (req, res) {
        const email = req.body.email;

        let user = await db.getWebUser(email);
        if (user) {
            let generator = require('generate-password');
            let password = generator.generate({
                length: 10,
                numbers: true
            });

            if (await db.updateWebUser(email, {password: password})) {

                await emailSender.sendTempPasswordEmail(email, password);

                res.sendStatus(200);
                return;
            }
        }

        res.sendStatus(404);
    });

    router.get('/web_cancel/key=:reservationKey&&email=:email', async (req, res) => {
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
                if (reservation.id === id && reservation.status === process.nmns.RESERVATION_STATUS.RESERVED) {
                    reservation.status = process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED;
                    reservation.cancelDate = moment().format('YYYYMMDD');
                    reservationList[i] = reservation;

                    let user = await db.getWebUser(email);
                    let socket = process.nmns.ONLINE[email];

                    let msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시 mm분')}`;
                    if(reservation.start.endsWith('00')){
                        msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시')}`;
                    }
                    msg +=  ' 예약이 취소되었습니다.'
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
                    await db.updateWebUser(email, {pushList: pushList});

                    if (!await db.updateReservation(email, reservationList)) {
                        contents = `예약취소를 실패했습니다.\n${util.formatPhone(user.alrimTalkInfo.callbackPhone)}으로 전화나 카톡으로 취소하시기 바랍니다.`;
                    } else {
                        //알림톡 전송
                        // await alrimTalk.sendReservationCancelNotify(user, reservation);
                        returnMsg = '예약취소완료';
                        contents = '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.';
                    }
                    break;
                }
            }
        }

        return res.marko(require('../client/template/reservationCancel'), {title: returnMsg, contents: contents});
    });

    return router;
};