const users = []
String.prototype.toTitleCase = function () {
  return this.toLowerCase()
    .split(' ')
    .map(function (word) {
      return word[0].toUpperCase() + word.substr(1)
    })
    .join(' ')
}
const addUser = ({ id, username, room }) => {
  username = username.trim().toTitleCase()
  room = room.trim().toTitleCase()
  //validate wheather they are empty
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    }
  }
  //check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username
  })
  if (existingUser) {
    return {
      error: 'Username name already exists',
    }
  }
  //store user
  const user = { id, username, room }
  users.push(user)

  return { user }
}
const removeUser = id => {
  const index = users.findIndex(user => user.id === id)
  if (index != -1) {
    return users.splice(index, 1)[0]
  }
}
const getUser = id => {
  const user = users.find(user => user.id === id)
  return user
}
const getUsersInRoom = room => {
  return users.filter(user => user.room === room.toTitleCase())
}
module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
}

/*
//Testing
addUser({
  id: 22,
  username: 'Andrew',
  room: 'South pilly',
})

const res = addUser({
  id: 33,
  username: 'drew',
  room: 'South pilly',
})
console.log(getUser(22))
console.log(getUsersInRoom('South pilly')); */
