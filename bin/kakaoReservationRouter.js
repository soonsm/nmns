'use strict';

const
    message = require('./message'),
    router = require('express').Router();

router.get('/keyboard', (req, res)=>{
    res.status(200).json({
        'type': 'buttons',
        'buttons': ['예약하기','예약변경하기']
    });
});

router.post('/friend', (req, res)=>{
    res.status(200).send('SUCCESS');
});

router.delete('/friend/:user_key', (req, res)=>{
    res.status(200).send('SUCCESS');
});

module.exports = router;