//const socket = io('http://' + window.document.location.host)
const socket = io({autoConnect:false}) // prevent automatic connect to server

function setupChatPageFor(layout) {
  switch (layout) {
    case 'new_connection':
      document.getElementById('userName').className='valid'
      document.getElementById('userName').disabled = true
      document.getElementById('btnConnect').value = 'Disconnect'
      document.getElementById('status').textContent = ''

      document.getElementById('btnSend').disabled = false
      document.getElementById('btnClear').disabled = false

      document.getElementById('msgBox').disabled = false
      document.getElementById('msgBox').focus()
      break      
    case 'failed_connection':
      document.getElementById('userName').value = ''
      document.getElementById('userName').className='invalid'
      break
    case 'disconnect':
      document.getElementById('userName').disabled = false
      document.getElementById('btnConnect').value = 'Connect'

      document.getElementById('btnSend').disabled = true
      document.getElementById('btnClear').disabled = true

      document.getElementById('msgBox').disabled = true
      document.getElementById('messages').innerHTML = ''
      break
  } 
}

function showMessage(from, msgContent, msgClass, chatMode) {
  if (msgContent === '') return

  msgClass = (chatMode === 'private') ? 'msg_private': msgClass

  const msgDiv = document.createElement('div')
        msgDiv.innerHTML = `<strong>${from}</strong>: ${msgContent}`
        msgDiv.className = msgClass

  document.getElementById('messages').appendChild(msgDiv)
}

socket.on('connect', (data) => {
  //setup chat page and acknowledge succesful connection to new user
  setupChatPageFor('new_connection') 
  showMessage('', document.getElementById('userName').value + ' successfully connected','msg_server')
})

socket.on('newUser',(data)=> {
  //notify existing users on new user connection
  showMessage('', data.name + ' ' + data.msg,'msg_server') 
})

socket.on('connect_error',(err) => {
  console.log(err)
  setupChatPageFor('failed_connection')  //clear user name for another try
  document.getElementById('status').textContent = err
})

socket.on('serverSays', function(data) {
  const userName = document.getElementById('userName').value
  showMessage(data.name, data.msg,
              data.name === userName ? 'msg_self':'',
              data.mode)
})

socket.on('userDisconnected', function(data) {
  showMessage('', data.name + ' ' + data.msg,'msg_server')
})