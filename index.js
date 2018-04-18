
const express = require('express')
const path = require('path')
const app = express();
const  server = require("http").createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) =>
    res.sendFile(__dirname +'/index.html'));


server.listen(PORT);


let messages = [];
let users = {};

io.on('connection', function(socket){


    socket.on('setUsername', function(data, fn) {

        if(users[socket.id]){
            fn(false);
        }else{
            fn(true);

            users[socket.id] = {
                nickname : data.nickname,
                connection_id : socket.id
            };
            let message = {
                action : true,
                connection_id : socket.id,
                nickname : data.nickname,
                message : data.nickname + ' joined the room'
            };
            messages.push(message);
            io.sockets.emit('updatePublicMessages', message);

            io.sockets.connected[socket.id].emit('updateCurrentUser', { nickname : data.nickname, connection_id : socket.id });

            io.sockets.emit('listOfUsers',Object.keys(users).map(key => users[key]));
        }

    });

    socket.on('loadAllMessages', function(data, fn) {
        io.sockets.emit('allMessages', messages);
    });


    socket.on('sendUserMessage', function(data, fn) {
        let message = {
            action : false,
            connection_id : users[socket.id].id,
            nickname : users[socket.id].nickname,
            message : data
        };
        messages.push(message);
        io.sockets.emit('updatePublicMessages', message);

        fn(true);
    });


    // socket.on('loadmessage', function(data, fn) {
    //     console.log('MESSAGE LOAD DAW');
    //     io.sockets.emit('broadcast', messages);
    // });

    // socket.on('connecting', function(reas) {
    //     console.log('received to pare q connect', data);
    // });


    socket.on('disconnecting', (reason) => {

        if(users[socket.id]){
            let message = {
                action : true,
                connection_id : users[socket.id].connection_id,
                nickname : users[socket.id].nickname,
                message : users[socket.id].nickname + ' left the room'
            };
            messages.push(message);
            delete users[socket.id];
            io.sockets.emit('updatePublicMessages', message);
            io.sockets.emit('listOfUsers',Object.keys(users).map(key => users[key]));
        }


    });




});

