'use strict';

require('marko/node-require');

const
    express = require('express'),
    markoExpress = require('marko/express'),
    body_parser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash'),
    session = require('express-session'),
    app = express(),
    morgan = require("morgan");
    
const
    message = require('./bin/message'),
    kakaoEventHandler = require('./bin/kakaoEventHandler'),
    indexRouter = require('./bin/indexRouter'),
    noShowRouter = require('./bin/noShowRouter')
;

// app.set('views engine', 'pug');
//app.set('views', __dirname + '/views'); //<-- 아래에서 안먹혀서 제외처리하고 수정
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

//static file은 session 설정 필요없으므로 위로 이동
app.use(express.static(__dirname + '/client/static'));

//enable res.marko(template, data);
app.use(markoExpress());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:false}));

//flash && session setting
app.use(session({secret: "cats", resave: false, saveUninitialized: false }));
app.use(require('cookie-parser')());
app.use(flash());

//Passport configure
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd'
    },
    function(username, password, done) {
        if(username === 'ksm'){
            if(password === 'asd'){
                return done(null, {email: 'ksm', pwd: 'asd'});
            }else{
                return done(null, false, { message: 'Incorrect password.' });
            }
        }else{
            return done(null, false, { message: 'Incorrect username.' });
        }
    }
));
passport.serializeUser(function(user, cb) {
    cb(null, user.email);
});

passport.deserializeUser(function(id, cb) {
    if(id === 'ksm'){
        return cb(null, {email: 'ksm', pwd: 'asd'});
    }else{
        return cb({msg: 'no user'});
    }
});

//요청 로깅
app.use(morgan("combined"));

//세션 관리
app.use(passport.initialize());
app.use(passport.session());

//Web request router
app.use('/', indexRouter);
app.use('/noShow', noShowRouter);

//Login Test
//email이나 pwd 항목이 없으면 "message":"Missing credentials"
app.post('/login', (req, res)=>{
    passport.authenticate('local', (err,user,info)=>{
        if(err){
            res.status(404).json(err);
        }
        if(user){
            res.status(200).json(user);
        }else{
            res.status(200).json(info);
        }
    })(req,res);
});

app.get('/a', function (req, res) {
    res.marko(require('./client/template/reservationCancel'), { title: '예약취소안내', message: '예약취소완료', contents: '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.' })
});

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
var server = app.listen(process.env.PORT || 8088, process.env.IP || "0.0.0.0", () => console.log('nmns is listening at ' + server.address().address + " : " + server.address().port));