'use strict';

const
  db = require('./webDb');

module.exports = function(server, sessionMiddleware){
  var io = require('socket.io')(server);
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  io.on('connection', async function(socket){

    var email = socket.request.session.passport.user;
    console.log('socket io email:', email);


    socket.on("get reservationList", async function(){
      socket.emit("get reservationList", await db.getReservationList(email));
    });

    socket.on("get staffList", async function(){
      socket.emit("get staffList", await db.getStaffList(email));
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
}

//TODO: polling handling
//TODO: dynamodb session
//TODO: passport.socketio