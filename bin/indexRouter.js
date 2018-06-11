'use strict';

const
  router = require('express').Router(),
  webHandler = require('./webHandler')
;

router.get('/index', function (req, res) {
  res.marko(require('../client/template/index'), { title: '예약취소안내', message: '예약취소완료', contents: '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.' });//TODO : add user email from cookie
});

router.post("/signup", function(req, res){
  res.redirect("/");//not implemented. redirected to using get method
});

router.post("/signin", function(req, res){
  res.redirect("/");//not implemented. redirected using get method
});

router.get("/", function(req, res){//main calendar page
  res.redirect("/index");//not implemented
});
module.exports = router;