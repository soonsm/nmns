'use strict';
const
    router = require('express').Router(),
    db = require('./webDb');

module.exports = function(passport){


    router.get('/index', function (req, res) {
        res.marko(require('../client/template/index'), {type:"signin", email:"ksm@test.com", message:"test입니다."});//TODO : add user email from cookie
    });

    router.post("/signup", async function(req, res){
        let data = req.body;
        let email = data.email;
        let password = data.password;
        let passwordRepeat = data.passwordRepeat;

        let error = {
            message : null
        };

        /*
        TODO: 입력값 검증
        이메일 검증
        비밀번호 및 비밀번호 확인 공란 체크, 길이 체크, 문자 체크
         */

        if(password !== passwordRepeat){
            error.message = '비밀번호와 비밀번호 확인 값이 같지 않습니다.';
            res.status(200).json(error);
        }

        let user = await db.signUp({email: email, password: password});

        if(user){
            //로그인처리
            req.logIn(user, () => res.redirect("/"));
        }else{
            error.message = '시스템 오류가 발생했습니다.\n nomorenoshow@gmail.com으로 연락주시면 바로 조치하겠습니다.';
            res.status(200).json(error);
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
        //req.cookies.email = req.body.email;
        passport.authenticate('local', (err,user,info)=>{
            req.logIn(user, function(err) {
                if (err) {
                    res.marko(require('../client/template/index'), {type:"signin", email:req.body.email, message:info});
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
          //TODO: 로그인 된 상태이므로 main calendar page rendering
          //TODO: 밑에 res.marko는 내가 테스트하느라 한거고 태호가 캘린더 페이지 만들면 그걸로 바꿔
          res.marko(require('../client/template/main'), {user:req.user});
      }else{
          //로그인 되지 않은 상태이므로 index page로 이동
          res.redirect("/index");
      }
    });

    return router;
};