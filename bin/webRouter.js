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

module.exports = router;