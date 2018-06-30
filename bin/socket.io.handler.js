'use strict';

const db = require('./webDb');
const moment = require('moment');

const GetReservationList = 'get reserv';
const GetManagerList = 'get manager';

module.exports = function(server, sessionMiddleware){
  var io = require('socket.io')(server);
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  io.on('connection', async function(socket){

    var email = socket.request.session.passport.user;
    console.log('socket io email:', email);


    socket.on(GetReservationList, async function(data){
      console.log(data);
        let status = true;
        let message = null;
        if(!data || !data.start || !data.end){
            message = '예약정보 조회에 필요한 데이터가 없습니다.({"start":${조회 시작 일자, string, YYYYMMDDHHmm}, "end":${조회 종료 일자, string, YYYYMMDDHHmm}})'
            status = false;
        }
        if(!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()){
            message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
            status = false;
        }
        socket.emit(GetReservationList, makeResponse(status, await db.getReservationList(email, data.start, data.end), message));
    });

    socket.on(GetManagerList, async function(){
        let managerList = await db.getStaffList(email);
      socket.emit(GetManagerList, makeResponse(true, managerList));
    });


    /*
    socket.on("get info", function(msg){
      console.log(msg);
      console.log("get info call");
      socket.emit("get info", "test");
    });
    var user = socket.request.session.passport.user;
    console.log(user);
    console.log("aaa hi");
    socket.broadcast.emit("hi");
    */
  });
};

const makeResponse = function(status, data, message){
  return {
      type: 'response',
      status: status,
      message: message,
      data: data
  };
}

//TODO: polling handling
//TODO: dynamodb session
//TODO: passport.socketio
//TODO: queryfilter