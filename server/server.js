import express from 'express';
import path from 'path';
import cors from 'cors';

import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateMessage,generateLocationMessage } from './utils/message.js';
import { isRealString } from './utils/isRealString.js';
import { Users } from './utils/users.js';
import { Rooms } from './utils/rooms.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.join(__dirname, '/../public');
const app = express();
const port = 3000;

const server = http.createServer(app);
const io = new Server(server);

const corsOptions = {
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = new Users()
let rooms = new Rooms()

io.on("connection", (socket) => {
  console.log("user connected")
  socket.emit('updateRoomsList', rooms.getRoomsList());
  socket.on("join", (params, callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }
    socket.join(params.room);

    users.removeUser(socket.id);
    rooms.addRoom(socket.id, params.room)

    const usersInRoom = users.getUserList(params.room);
    const roomsOwner = usersInRoom.length === 0;

    let isUser = users.addUser(socket.id, params.name, params.room, roomsOwner);
    if(isUser.error) {
      return callback('Such name has already taken');
    }
    io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}!`));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));
    callback();
  })

  socket.on("createMessage", (message, callback) => {
    let user = users.getUser(socket.id)
    if(user && isRealString(message.text)) {
      io.to(user.room).emit("newMessage", generateMessage(user.name, message.text))
    }
    callback();
  })

  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id)
    if(user) {
      io.to(user.room).emit("newLocationMessage", generateLocationMessage(user.name, coords.lat, coords.lng))
    }
  })

  socket.on('removeUser', (userIdToRemove) => {
    let removedUser = users.getUser(userIdToRemove);
  
    if (removedUser) {
      users.removeUser(userIdToRemove);
  
      io.to(userIdToRemove).emit('userRemoved', {
        message: 'You were removed from the room.',
        redirect: '/'
      });
  
      io.to(removedUser.room).emit('updateUsersList', users.getUserList(removedUser.room));
    }
  });
  

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    let theRoom = rooms.removeRoom(socket.id)
    if(user){
      io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
      io.to(theRoom).emit('updateRoomsList', rooms.getRoom(socket.id));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))
    }
  })
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
