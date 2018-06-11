'use strict';

const
    express = require('express'),
    router = express.Router(),
    webHandler = require('./webHandler')
;

router.get('/getNoShow/:phone', async function(req, res){
    let phone = req.params.phone;
    res.status(200).json(await webHandler.getNoShow(phone));
});

router.post('/addNoShow', async function(req, res){
    let body = req.body;
    let phone = body.phone;
    res.status(200).json(await webHandler.addNoShow(phone));
});

router.get('/', function (req, res) {
    res.marko(require('../client/template/index'), { title: '예약취소안내', message: '예약취소완료', contents: '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.' })
});

module.exports = router;