//KEY CODES

// const RIGHT_ARROW = 39
// const LEFT_ARROW = 37
// const UP_ARROW = 38
// const DOWN_ARROW = 40
const ENTER_KEY = 13

function handleKeyDown(event) {
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

function connectAs() {
  //validate user name
  const user = document.getElementById('userName')
  if (document.getElementById('btnConnect').value === 'Connect') {
    const regUserName = /^[a-zA-Z][a-zA-Z0-9]*$/

    if (user.value.length != 0 && regUserName.test(user.value))  {
        user.className = 'valid'
        socket.auth = {userName:user.value}
        socket.connect()
    } else {
        user.value = ''
        user.className = 'invalid'
        document.getElementById('status').innerHTML = '\
                Error: User name must start with a letter, \
                followed by letters or digits. <br> \
                Special characters and spaces are not allowed.'
    }
  } else {
    //disconnect user from chat server
    socket.emit('userDisconnect',{name:user.value}) 
    setupChatPageFor('disconnect')
  }
}

function sendMessage() {
  const message = document.getElementById('msgBox').value.trim()
  if(message === '') return
  const userName = document.getElementById('userName').value
  socket.emit('clientSays', {name: userName, msg: message})
  document.getElementById('msgBox').value = ''
}

function clearMessage() {
  document.getElementById('messages').innerHTML = ''
}