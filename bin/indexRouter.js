'use strict';
const router = require('express').Router(),
  emailValidator = require('email-validator'),
  db = require('./webDb'),
  newDb = require('./newDb'),
  util = require('./util'),
  path = require('path'),
  alrimTalk = require('./alrimTalkSender'),
  emailSender = require('./emailSender');

const moment = require('moment');
const multer = require('multer');

const logger = global.nmns.LOGGER;

const pcMainView = require('../client/template/main');
const mobileMainView = require('../client/template/main.mobile');
const indexView = require('../client/template/index');
const homeView = require('../client/template/home');
const searchView = require('../client/template/search');
const cancelView = require('../client/template/reservationCancel');
const naverView = require('../client/template/naver');

let render = function(res, view, data) {
  if (!data) {
    data = {};
  }
  data.cdn = global.nmns.cdn;
  res.marko(view, data);
};

module.exports = function(passport) {
  /**
     * Main Page(Calendar)
     */
  router.get('/home', async function(req, res) {
    //main calendar page
    if (req.user) {
      let user = await db.getWebUser(req.user.email);
      if (user.authStatus === process.nmns.AUTH_STATUS.EMAIL_VERIFICATED) {
        let tips = require('./tips').getTips();
        let index = 7;
        let num = Math.random();
        if (
          req.user.authStatus !== process.nmns.AUTH_STATUS.BEFORE_EMAIL_VERIFICATION ||
          num > 0.7
        ) {
          tips.splice(7, 1);
          index = Math.floor(Math.random() * tips.length);
        }
        let tip = tips[index];
        req.session.tipToRemove = index;

        const MobileDetect = require('mobile-detect');
        let md = new MobileDetect(req.headers['user-agent']);
        let mainView = md.mobile() ? mobileMainView : pcMainView;

        let logoUrl = null;
        if (user.logoFileName) {
          let baseUrl = 'https://s3.ap-northeast-2.amazonaws.com/file.washow.co.kr/';
          if (process.env.NODE_ENV != process.nmns.MODE.PRODUCTION) {
            baseUrl = '/';
          }
          logoUrl = baseUrl + user.logoFileName;
        }
        render(res, mainView, {
          user: req.user,
          kakaotalk: req.query.kakaotalk,
          tips: tip,
          logoUrl: logoUrl
        });
      } else {
        render(res, indexView, {
          email: user.email,
          authRequired: true
        });
      }
    } else {
      //로그인 되지 않은 상태이므로 home page로 이동
      res.redirect('/index');
    }
  });

  /**
     * Index Page
     */
  router.get('/index', async function(req, res) {
    if (req.user) {
      let user = await db.getWebUser(req.user.email);
      if (user.authStatus === process.nmns.AUTH_STATUS.EMAIL_VERIFICATED) {
        //로그인 되있으면 main으로 이동
        res.redirect('/home');
      } else {
        render(res, indexView, {
          email: user.email,
          authRequired: true
        });
      }
    } else {
      let errorMessage = req.session.errorMessage;
      req.session.errorMessage = undefined;
      render(res, indexView, {
        email: req.cookies.email,
        message: errorMessage,
        kakaotalk:
          req.query.kakaotalk && req.query.kakaotalk !== '' ? req.query.kakaotalk : undefined
      });
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
  router.post('/signin', function(req, res) {
    let email = req.body.email;
    res.cookie('email', email);
    passport.authenticate('local', (err, user, info) => {
      req.logIn(user, async function(err) {
        if (err) {
          req.session.errorMessage = info.message;
          res.redirect('/index');
          return;
        }

        let kakaotalk = req.body.kakaotalk;
        if (kakaotalk) {
          let kakaoUser = await db.getUser(kakaotalk);
          if (kakaoUser) {
            kakaoUser.email = email;
            db.saveUser(kakaoUser);
          }
        }
        //로그인 성공
        res.redirect('/home');
      });
    })(req, res);
  });

  /**
     * New Index page
     */
  router.get('/naver', async function(req, res) {
    render(res, naverView);
  });

  let sendResponse = function(res, status, errorMessage) {
    res.status(200).json({
      status: status ? '200' : '400',
      message: errorMessage
    });
  };

  /**
     * SNS 연동 로그인 요청
     * 데이터: {snsLinkId: ${SNS에서 부여한 id, string}, snsType: ${SNS 종류(KAKAO, NAVER), string}, snsEmail: ${SNS email, string, optional} }
     * 이미 로그인 되어있는 상태에서 연동하는 경우 응답: /로 redirect
     * 회원가입이 되있는 경우 응답: 로그인 처리 후 /로 redirect
     * 회원가입이 되어있지 않은 사용자에 대한 응답: /signup 으로 redirect
     * 회원가입 페이지로 redirect 할 때 서버가 client에 전달하는 데이터
     * {snsType: ${sns 종류(NAVER, KAKAO), string}, snsLinkId: ${SNS에서 부여한 id, string}, snsEmail: ${SNS email(회원가입 화면의 email input에 채워질 데이터), string, optional}}
     */
  router.post('/sns_signin', async function(req, res) {
    let user = req.user;
    if (user) {
      res.redirect('/home');
      return;
    }
    let data = req.body;
    try {
      console.log(JSON.stringify(data));
      let snsLinkId = data.snsLinkId + '';
      let snsType = data.snsType;
      let snsEmail = data.snsEmail;
      if (!snsLinkId) {
        throw 'snsLinkId가 없습니다.';
      } else if (!process.nmns.isValidSnsType(snsType)) {
        throw `snsType은 NAVER 또는 KAKAO입니다.${snsType}`;
      } else if (!snsEmail) {
        throw 'email이 없습니다';
      } else if (snsEmail && !emailValidator.validate(snsEmail)) {
        throw `snsEmail이 이메일 형식에 맞지 않습니다.${snsEmail}`;
      }

      let snsLink = await db.getSnsLink(snsLinkId);
      if (!snsLink) {
        user = await db.getWebUser(snsEmail);
        if (!user) {
          res.status(200).json({
            status: '200',
            sns: {
              snsType: snsType,
              snsLinkId: snsLinkId,
              snsEmail: snsEmail
            }
          });
          return;
        }
      } else {
        user = await db.getWebUser(snsLink.email);
        if (!user) {
          user = await db.getWebUser(snsLink.snsEmail);
          if (!user) {
            user = await db.getWebUser(snsEmail);
            if (!user) {
              res.status(200).json({
                status: '200',
                sns: {
                  snsType: snsType,
                  snsLinkId: snsLinkId,
                  snsEmail: snsEmail
                }
              });
              return;
            } else {
              await db.setSnsLink({
                snsLinkId: snsLinkId,
                snsType: snsType,
                snsEmail: snsEmail,
                email: user.email
              });
            }
          } else {
            await db.setSnsLink({
              snsLinkId: snsLinkId,
              snsType: snsType,
              snsEmail: snsEmail,
              email: user.email
            });
          }
        }
      }
      req.logIn(user, async function() {
        let sns = {};
        if (snsType === process.nmns.SNS_TYPE.NAVER) {
          sns.isNaverLink = true;
        } else {
          sns.isKaKaoLink = true;
        }
        await db.updateWebUser(user.email, sns);
        return sendResponse(res, true);
      });
    } catch (e) {
      if (typeof e !== 'string') {
        e = '로그인 실패하였습니다.';
      }
      return sendResponse(res, false, e);
    }
  });

  /**
     * 네이버 계정 연동
     * 데이터: {naverEmail: ${Naver email, string} snsLinkId: ${SNS에서 부여한 id, string}}
     * 정상 응답: 응답은 Websocket으로 41번 API 형식으로 돌려준다.
     * 로그인이 되어 있지 않은 경우 응답: HTTP status code로 응답 / {"status":${오류코드, string}, "message":${오류내용, string}}로 데이터 전달
     */
  router.post('/naver_link', async function(req, res) {
    if (!req.user) {
      return sendResponse(res, false, '로그인이 되어있지 않습니다.');
    }

    try {
      let data = req.body;
      let email = req.user.email;
      let naverEmail = data.naverEmail;
      if (!naverEmail || !emailValidator.validate(naverEmail)) {
        throw `naverEmail 값이 올바르지 않습니다.(${naverEmail})`;
      }
      let snsLinkId = data.snsLinkId;
      if (!snsLinkId) {
        throw 'snsLinkId 값이 없습니다.';
      }

      let user = await db.getWebUser(email);

      let dbResult1 = await db.setSnsLink({
        snsLinkId: snsLinkId,
        snsType: process.nmns.SNS_TYPE.NAVER,
        snsEmail: naverEmail,
        email: email
      });

      let dbResult2 = await db.updateWebUser(email, { isNaverLink: true });

      if (!dbResult1 || !dbResult2) {
        throw 'DB 저장에 실패했습니다.';
      }

      let socket = process.nmns.ONLINE[email];
      if (socket) {
        socket.emit('link sns', {
          type: 'response',
          status: true,
          message: '연동 성공',
          data: {
            snsLinkId: snsLinkId,
            snsType: process.nmns.SNS_TYPE.NAVER
          }
        });
      }
    } catch (e) {
      return sendResponse(res, false, e);
    }

    return sendResponse(res, true);
  });

  /**
     * 인증 이메일 다시 보내기
     * 데이터 : {email: ${email, string, optional}}
     * 응답 : HTTP status code로 응답 / {"status":${오류코드, string}, "message":${오류내용, string}}로 데이터 전달 (정상이면 "200")
     * 데이터 email이 있으면 해당 이메일로 보내고, 없으면 세션정보에서 찾아서 보낸다.
     */
  router.post('/sendVerification', async function(req, res) {
    let status = false;
    let errorMessage;
    let email = req.body.email;
    try {
      if (!email && req.user) {
        email = req.user.email;
      }
      if (!email) throw '이메일이 없습니다';

      const emailAuthToken = require('js-sha256')(email);
      emailSender.sendEmailVerification(email, emailAuthToken);

      await db.updateWebUser(email, { emailAuthToken: emailAuthToken });

      status = true;
    } catch (e) {
      status = false;
      errorMessage = '이메일 전송이 실패했습니다';
      logger.error(e);
    }

    sendResponse(res, status, errorMessage);
  });

  //http://localhost:8088/emailVerification/email=soonsm@gmail.com&token=297356b5ba41255cfe85cc692ecabbf3a0caf5423e62b9c0974e8ef73676b32a
  router.get('/emailVerification/email=:email&token=:token', async function(req, res) {
    const email = req.params.email;
    const token = req.params.token;

    let user = await db.getWebUser(email);
    if (
      user &&
      user.emailAuthToken === token &&
      user.authStatus !== process.nmns.AUTH_STATUS.EMAIL_VERIFICATED
    ) {
      await db.updateWebUser(email, { authStatus: process.nmns.AUTH_STATUS.EMAIL_VERIFICATED });
      req.logIn(user, function() {
        res.redirect('/index');
      });
      return;
    }

    res.redirect('/index');
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
        emailSender.sendTempPasswordEmail(email, password);

        res.sendStatus(200);
        return;
      }
    }

    res.redirect('/index');
  });

  router.get('/addNotice/title=:title&&contents=:contents', async (req, res) => {
    let title = req.params.title;
    let contents = req.params.contents;
    try {
      if (!title || !contents) {
        throw 'title 혹은 contents가 없습니다';
      }

      let moment = require('moment');
      let notice = {
        email: 'notice',
        id: moment().format('YYYYMMDDHHmmssSSS'),
        registeredDate: moment().format('YYYYMMDDHHmm'),
        title: title,
        contents: contents
      };

      await newDb.addNotice(notice);
    } catch (e) {
      logger.error(e);
    }

    res.redirect('/home');
  });

  router.get('/web_cancel/key=:reservationKey&&email=:email', async (req, res) => {
    let id = req.params.reservationKey;
    let email = req.params.email;

    let returnMsg = '예약취소실패';
    let contents = '예약정보가 없습니다.';

    try {
      if (!id || !email) throw '아이디 또는 이메일이 없습니다';

      let reservation = await newDb.getReservation(email, id);
      if (reservation.status === process.nmns.RESERVATION_STATUS.RESERVED) {
        let user = await db.getWebUser(email);

        reservation.status = process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED;
        reservation.cancelDate = moment().format('YYYYMMDD');

        if (!await newDb.saveReservation(reservation)) {
          throw `예약취소를 실패했습니다.\n${util.formatPhone(
            user.alrimTalkInfo.callbackPhone
          )}으로 전화나 카톡으로 취소하시기 바랍니다.`;
        }

        //알림톡 전송
        await alrimTalk.sendReservationCancelNotify(user, reservation);
        returnMsg = '예약취소완료';
        contents = '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.';

        //Push
        let msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시 mm분')}`;
        if (reservation.start.endsWith('00')) {
          msg = `${moment(reservation.start, 'YYYYMMDDHHmm').format('M월 D일 h시')}`;
        }
        msg += ' 예약이 취소되었습니다.';
        let push = {
          id: moment().format('YYYYMMDDHHmmssSSS'),
          title: '예약취소알림',
          body: msg,
          data: {
            type: 'cancel reserv',
            id: reservation.id,
            manager: reservation.manager
          },
          isRead: false
        };

        let socket = process.nmns.ONLINE[email];
        if (socket) {
          push.isRead = true;
          await socket.sendPush(push);
        }

        await newDb.addPush({
          email: email,
          title: push.title,
          contents: msg,
          data: push.data,
          isRead: push.isRead
        });
      } else {
        returnMsg = '취소할 수 없는 예약';
        contents = '이미 취소됐거나 삭제된 예약입니다.';
      }
    } catch (e) {
      returnMsg = '예약취소실패';
      if (typeof e === 'string') {
        contents = e;
      } else {
        contents = '예약정보가 없습니다.';
      }
      logger.error(e);
    }

    return render(res, cancelView, { title: returnMsg, contents: contents });
  });

  let fileNameFunction = function(req, file, cb) {
    let email = req.body.email;
    let extension = path.extname(file.originalname);
    let fileName = email + moment().format('YYYYMMDDHHmmssSSS') + extension;
    file.filename = fileName;
    cb(null, fileName);
  };
  let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads');
    },
    filename: fileNameFunction
  });
  if (process.env.NODE_ENV == process.nmns.MODE.PRODUCTION) {
    let AWS = require('aws-sdk');
    AWS.config.update({
      region: 'ap-northeast-2',
      endpoint: null
    });
    let s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    storage = require('multer-s3')({
      s3: s3,
      bucket: 'file.washow.co.kr',
      key: fileNameFunction,
      acl: 'public-read-write'
    });
  }

  let upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
  }).single('logo');

  /**
     * 회원가입 요청 처리
     */
  router.post('/signup', upload, async function(req, res) {
    let status = false,
      message;
    try {
      let data = req.body;
      let email = data.email;
      let password = data.password;

      //email validation
      if (!emailValidator.validate(email)) {
        throw `이메일 주소가 올바르지 않습니다. 정확한 이메일 주소를 입력해주세요.`;
      }

      if (data.snsType) {
        if (data.snsLinkId) {
          let snsLink = await db.getSnsLink(data.snsLinkId);
          if (snsLink) {
            throw `이미 ${snsLink.snsType === 'NAVER'?'네이버':'카카오'} 계정으로 가입되어 있습니다.`;
          }
        }
        data.authStatus = process.nmns.AUTH_STATUS.EMAIL_VERIFICATED;
      } else {
        //password strength check
        let strenthCheck = util.passwordStrengthCheck(password);
        if (strenthCheck.result === false) {
          throw strenthCheck.message;
        }
        data.emailAuthToken = require('js-sha256')(email);
      }

      //기존 사용자 체크
      if (await db.getWebUser(email)) {
        throw '이 이메일 주소로 가입된 계정이 이미 존재합니다.';
      }

      if (req.file) {
        data.logoFileName = req.file.filename;
      }
      let newUser = db.newWebUser(data);
      if (data.useYn === 'Y') {
        if (!data.callbackPhone || !util.phoneNumberValidation(data.callbackPhone)) {
          throw `휴대폰 번호가 올바르지 않습니다. 다시한 번 확인해주세요.`;
        }
        newUser.alrimTalkInfo = {
          useYn: 'Y',
          callbackPhone: data.callbackPhone,
          cancelDue: data.cancelDue || '',
          notice: data.notice || ''
        };
      }

      if (await db.setWebUser(newUser)) {
        if (!data.snsType) {
          emailSender.sendEmailVerification(email, data.emailAuthToken);
        }
        if (data.kakaotalk) {
          let kakaoUser = await db.getUser(data.kakaotalk);
          if (kakaoUser) {
            kakaoUser.email = email;
            db.saveUser(kakaoUser);
          }
        }
        if (data.snsType) {
          await db.setSnsLink(data);
          req.logIn(newUser, function() {
            return sendResponse(res, true);
          });
        }else{
          res.cookie('email', email);
          status = true;
          message = '회원가입성공';
        }
      }
    } catch (e) {
      status = false;
      logger.error(e);
      if (typeof e === 'string') {
        message = e;
      } else {
        message = '시스템 오류가 발생했습니다.\\n support@washow.co.kr로 연락주시면 바로 조치하겠습니다.';
      }
    }
    return sendResponse(res, status, message);
  });

  router.get('/signout', (req, res) => {
    if (req.user) {
      let email = req.user.email;
      res.cookie('email', email);
      req.logout();
      req.session.destroy(function(err) {
        if (err) {
          logger.log('fail to destroy session: ', err);
        }
        res.redirect('/home');
      });
    } else {
      res.redirect('/home');
    }
  });

  router.get('/form-tester', (req, res) => {
    res.render('form-tester.html', {
      title: 'Form Tester'
    });
  });

  router.post('/form-tester', (req, res) => {
    upload(req, res, function(err) {
      if (err) {
        console.log(err);
      }
      console.log(req.body);
      console.log(req.file);

      var str = 'Your name is ' + req.body.name + ' and your nickname is ' + req.body.nickname;
      res.send(str);
    });
  });

  /*****
   * SPA
   */
  router.get('/test', async function (req, res) {
    render(res, require('../client/template/test'));
  });
  router.get('/', async function (req, res) {
    render(res, homeView);
  });
  router.post('/', async function(req, res){
    let contact = req.body.contact;
    let view = req.body.view;
    render(res, homeView, {view: view, contact: contact});
  });
  router.post('/search', async function(req, res){
    let contact = req.body.contact;
    let list = await newDb.getNoShow(contact);

    render(res, searchView, {noShowList : list, contact: contact});
  });

  router.get('/search/contact=:contact', async function(req, res){
    let contact = req.params.contact;
    let list = await newDb.getNoShow(contact);

    render(res, searchView, {noShowList : list, contact: contact});
  });
  router.post('/add', async function(req, res){
    let noShow = req.body;
    let status = true, message = null;
    try{
      await newDb.addNoShow('soonsm@gmail.com', noShow.phone, noShow.noShowDate, noShow.noShowCase);
    }catch(e){
      status = false;
      message = '노쇼를 추가하지 못했습니다. 잠시 후 이용 바랍니다.';
    }

    await res.json({status: status, message : message});
  });

  return router;
};