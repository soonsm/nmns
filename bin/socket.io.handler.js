'use strict';

const
    db = require('./webDb');

module.exports = function(express){
    var server = require('http').Server(express);
    var io = require('socket.io')(server);

    /*server.listen(port, () => {
        console.log('socket.io Server listening at port %d', port);
    });
*/
    io.on('connection', async function(socket){
        socket.on("get info", function(msg){
           console.log(msg);
           console.log("get info call");
           socket.broadcast.emit("get info", "test");
        });
        var user = socket.request.user;
        console.log(user);
        console.log("aaa hi");
        socket.broadcast.emit("hi");
    });
}