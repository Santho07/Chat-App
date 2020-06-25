const path = require('path')
const morgan = require('morgan')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users.js')

const app = express()
app.use(morgan('dev'))
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', socket => {
  console.log('New Websocket Connection')
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options })
      
    if (error) {
      return callback(error)
    }
    socket.join(user.room)
      
    socket.emit('message', generateMessage(`Welcome Mr.${user.username}`, 'System'))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, user.username))
    
    io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
    callback()
  })
    
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()
    if (filter.isProfane(message)) {
      return callback('Profinity is not allowed')
    }
    const user = getUser(socket.id)
    io.to(user.room).emit('message', generateMessage(message, user.username))
    callback()
  })
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    const url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
    io.to(user.room).emit('locationMessage', generateLocationMessage(url, user.username))
    callback()
  })
    
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
        io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, 'System'))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    }
  })
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
