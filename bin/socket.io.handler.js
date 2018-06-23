'use strict';

const
  db = require('./webDb');

module.exports = function(server){
  var io = require('socket.io').listen(server);

  io.on('connection', async function(socket){
    socket.on("get info", function(msg){
      console.log(msg);
      console.log("get info call");
      socket.emit("get info", "test");
    });
    var user = socket.request.user;
    console.log(user);
    console.log("aaa hi");
    socket.broadcast.emit("hi");
  });
}