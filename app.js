'use strict';

if(!global.nmns){
    global.nmns = {};
}

require('./bin/logger');
require('./bin/constant');

const logger = global.nmns.LOGGER;

process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == process.nmns.MODE.PRODUCTION ) ? process.nmns.MODE.PRODUCTION : process.nmns.MODE.DEVELOPMENT;
if (process.env.NODE_ENV == process.nmns.MODE.PRODUCTION) {
    global.nmns.cdn = 'https://cdn.nomorenoshow.co.kr';
    logger.info("Production Mode");
} else if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
    global.nmns.cdn = '';
    logger.info("Development Mode");
}


require('marko/node-require');

const
    express = require('express'),
    favicon = require('express-favicon'),
    Server = require("http").Server,
    markoExpress = require('marko/express'),
    body_parser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash'),
    session = require('express-session'),
    app = express(),
    server = Server(app),
    compression = require('compression'),
    morgan = require("morgan"),
    cookieParser = require('cookie-parser');
    
const
    message = require('./bin/message'),
    kakaoEventHandler = require('./bin/kakaoEventHandler'),
    indexRouter = require('./bin/indexRouter'),
    noShowRouter = require('./bin/noShowRouter'),
    db = require('./bin/webDb')
;

//compression
app.use(compression());

//favicon
app.use(favicon(__dirname + '/client/static/nmns/img/favicon.ico'));

//static file은 session 설정 필요없으므로 위로 이동
app.use(express.static(__dirname + '/client/static'));

//enable res.marko(template, data);
app.use(markoExpress());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:false}));

//cookie parser
app.use(cookieParser());

//flash && session setting
const DynamoStore = require('connect-dynamodb-session')(session);
let optionForDynamoStroe = {
    region: 'ap-northeast-2',
    tableName: 'SessionTable',
    cleanupInterval: 0, // session is not expired unless log-out
    autoCreate: true
};
if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
    optionForDynamoStroe.endpoint = "http://localhost:8000"
}
let sessionStore = new DynamoStore(optionForDynamoStroe);



app.use(session({secret: "rilahhuma", resave: false, saveUninitialized: false,
    store: sessionStore }));
app.use(flash());

//Passport configure
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(username, password, done) {
        let user = await db.getWebUser(username);
        if(user){
            if(password === user.password){
                return done(null, {email: user.email, password: user.password});
            }else{
                return done(null, false, { message: '비밀번호가 잘못되었습니다.' });
            }
        }else{
            return done(null, false, { message: '등록되지 않은 사용자입니다.' });
        }
    }
));
passport.serializeUser(function(user, cb) {
    cb(null, user.email);
});

passport.deserializeUser(async function(id, cb) {
    let user = await db.getWebUser(id);
    if(user){
        return cb(null, user);
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
app.use('/', indexRouter(passport));
app.use('/noShow', noShowRouter);

app.get('/keyboard', (req, res)=>{
    res.status(200).json(message.homeKeyboard);
});

app.get('/cancel/key=:reservationKey', async (req, res)=>{
    kakaoEventHandler.cancelReservation(req.params.reservationKey, res);
});

app.post('/message', (req, res)=>{
    let body = req.body;
    let userKey = body.user_key;
    let type = body.type;
    let content = body.content;

    logger.info('/message: ' + JSON.stringify(body));

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

   logger.info('/friend: ' + JSON.stringify(body));

   if(userKey){
       kakaoEventHandler.friendAddHandler(userKey, res);
   }else{
       res.status(403);
   }
});

app.delete('/friend/:user_key', (req, res)=>{
   let userKey = req.params.user_key;

    logger.info('/friend delete: ' + userKey);

   if(userKey){
       kakaoEventHandler.friendDelHandler(userKey, res);
   }else{
       res.status(403);
   }
});

app.get('*', function(req, res){
    res.redirect("/");
});


//socket.io.handler
require('./bin/socket.io.handler')(server, sessionStore, passport, cookieParser);

// Sets server port and logs message on success
server.listen(process.env.PORT || 8088, process.env.IP || "0.0.0.0", () => logger.info('nmns is listening at ' + server.address().address + " : " + server.address().port));
