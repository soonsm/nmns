'use strict';

const
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json());

const
    message = require('./bin/message'),
    kakaoEventHandler = require('./bin/kakaoEventHandler')
    ;

// app.set('views engine', 'pug');

/*
app.get('/', function (req, res) {
    res.render('reservationCancel.pug', { title: '예약취소안내', message: '예약취소완료', contents: '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.' })
});*/

app.get('/keyboard', (req, res)=>{
    res.status(200).json(message.homeKeyboard);
});

app.get('/cancel/key=:reservationKey', (req, res)=>{
    kakaoEventHandler.cancelReservation(req.params.reservationKey, res);
});

app.post('/message', (req, res)=>{
    let body = req.body;
    let userKey = body.user_key;
    let type = body.type;
    let content = body.content;

    console.log('/message: ' + JSON.stringify(body));

    //Common Validation(각 항목이 있는지, type은 text인지 등)
    if(userKey === undefined || userKey === null || type === undefined || type === null || type !== 'text'){
        res.status(403);
        return;
    }

    kakaoEventHandler.messageHandler(userKey, content, res);
});


app.post('/friend', (req, res)=>{
   let body = req.body;
   let userKey = body.user_key;

   console.log('/friend: ' + JSON.stringify(body));

   if(userKey){
       kakaoEventHandler.friendAddHandler(userKey, res);
   }else{
       res.status(403);
   }
});

app.delete('/friend/:user_key', (req, res)=>{
   let userKey = req.params.user_key;

    console.log('/friend delete: ' + userKey);

   if(userKey){
       kakaoEventHandler.friendDelHandler(userKey, res);
   }else{
       res.status(403);
   }
});

// Sets server port and logs message on success
app.listen(process.env.PORT || 8088, () => console.log('nmns is listening'));