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

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    sender: message.sender,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
  console.log(sideBarTemplate)
  const html = Mustache.render(sideBarTemplate, { room, users })
  document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', message => {
  const html = Mustache.render(locationMessageTemplate, {
    sender: message.sender,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
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

socket.emit('join', { username, room }, error => {
  //socket.emit('sendMessage', message)

  if (error) {
    alert(error)
    location.href = '/'
  }
})
