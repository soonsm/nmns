'use strict';

const
    db = require('./webDb');

module.exports = function(express){
    var server = require('http').createServer(app);
    var io = require('../..')(server);
    var port = 8089;

    server.listen(port, () => {
        console.log('socket.io Server listening at port %d', port);
    });

    io.on('connection', async function(socket){
        var user = socket.request.user;
        console.log(user);
    });
}