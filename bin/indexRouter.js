'use strict';
const
    router = require('express').Router(),
    emailValidator = require('email-validator'),
    passwordValidator = require('password-validator'),
    db = require('./webDb');

module.exports = function(passport){


    router.get('/index', function (req, res) {
        console.log('index cookie', req.cookies.errorMessage);
        res.clearCookie('errorMessage');
        res.marko(require('../client/template/index'), {type:"signin", email:req.cookies.email, message:req.cookies.errorMessage});
    });

    router.post("/signup", async function(req, res){
        let data = req.body;
        let email = data.email;
        let password = data.password;
        let passwordRepeat = data.passwordRepeat;

        let error = {
            type: 'signup',
            email: email,
            message : null
        };

        //email validation
        if(!emailValidator.validate(email)){
            //email validation fail
            error.message = '올바른 이메일 형식이 아닙니다.';
            return res.marko(require('../client/template/index'), error);
        }

        //password validation
        if(password !== passwordRepeat){
            error.message = '비밀번호와 비밀번호 확인 값이 같지 않습니다.';
            return res.marko(require('../client/template/index'), error);
        }

        //password strength check
        var schema = new passwordValidator();
        schema
            .is().min(8)                                    // Minimum length 8
            .is().max(30)                                  // Maximum length 30
            .has().digits()                                 // Must have digits
            .has().symbols();                               // Must have symbols

        const passwordFailRules = schema.validate(password, { list: true });
        if(passwordFailRules && passwordFailRules.length > 0){
            //password strength check fail
            let passwordMessages = {
                min: '길이제한 8글자 이상',
                max: '길이제한 30글자 이하',
                digits: '숫자포함',
                symbols: '특수문자 포함'
            }
            let errorMessage = '입력하신 비밀번호는 다음의 조건을 만족해야 합니다.(';
            for(var i=0; i<passwordFailRules.length; i++){
                errorMessage += passwordMessages[passwordFailRules[i]];
                if(i < passwordFailRules.length-1){
                    errorMessage += ', ';
                }
            }
            errorMessage += ')';
            error.message = errorMessage;
            return res.marko(require('../client/template/index'), error);

        }

        //기존 사용자 체크
        let user = await db.getWebUser(email);
        if(user){
            error.message = '이미 존재하는 사용자입니다.';
            return res.marko(require('../client/template/index'), error);
        }

        user = await db.signUp({email: email, password: password});

        if(user){
            //로그인처리
            req.logIn(user, () => res.redirect("/"));
            res.redirect("/");
        }else{
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
    router.post("/signin", function(req, res){
        console.log(req.body);
        let email = req.body.email;
        res.cookie('email', email);
        passport.authenticate('local', (err,user,info)=>{
            req.logIn(user, function(err) {
                if (err) {
                    res.cookie('errorMessage', info.message);
                    res.redirect("/index");
                    return;
                }
                //로그인 성공
                res.redirect("/");
            });

        })(req,res);
    });

    router.get("/signout", (req,res) => {
        req.logout();
        res.redirect('/');
    })

    router.get("/", function(req, res){//main calendar page
      if(req.user){
          res.marko(require('../client/template/main'), {user:req.user});
      }else{
          //로그인 되지 않은 상태이므로 index page로 이동
          res.redirect("/index");
      }
    });

    return router;
};