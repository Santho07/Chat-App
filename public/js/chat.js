const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {
  
  // New messages element
  const $newMessage = $messages.lastElementChild
  
  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //visible height
  const visibleHeight = $messages.offsetHeight

  //height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled? 
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    sender: message.sender,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
  document.querySelectorAll('.message__name').forEach(e => {
    if (e.textContent == username) {
      e.style.color = 'blue'
    }
    if (e.textContent == 'System') {
      e.style.color = 'red'
    }
  })
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, { room, users })
  document.querySelector('#sidebar').innerHTML = html
  document.getElementById(`${username}`).style.color = 'cyan' //color current username 
})

socket.on('locationMessage', message => {
  const html = Mustache.render(locationMessageTemplate, {
    sender: message.sender,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
  
  //color names
  document.querySelectorAll('.message__name').forEach(e => {
    if (e.textContent == username) {
      e.style.color = 'blue'
    }
    if (e.textContent == 'System') {
      e.style.color = 'red'
    }
  })
  autoscroll()
})

$messageForm.addEventListener('submit', e => {
  e.preventDefault()

  const message = e.target.elements.message.value
  if (!message) return
  $messageFormButton.setAttribute('disabled', 'disabled')
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (error) {
      return console.error(error)
    }
    console.log('Message delivered!')
  })
})

$sendLocationButton.addEventListener('click', () => {
  $sendLocationButton.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by this browser')
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position.coords.latitude, position.coords.longitude)
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log('Location shared!')
        $sendLocationButton.removeAttribute('disabled')
      }
    )
  })
})

socket.emit('join', {username, room }, error => {
  //socket.emit('sendMessage', message)
  if (error) {
    alert(error)
    location.href = '/'
  }
})
