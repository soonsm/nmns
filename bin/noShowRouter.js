'use strict';

const
    router = require('express').Router(),
    webHandler = require('./webHandler')
;

router.get('/', async function(req, res){
    let phone = req.body.phone;
    res.status(200).json(await webHandler.getNoShow(phone));
});

router.post('/', async function(req, res){
    let body = req.body;
    let phone = body.phone;
    res.status(200).json(await webHandler.addNoShow(phone));
});

router.delete("/", async function(req, res){
    res.status(501);//not implemented
});

module.exports = router;