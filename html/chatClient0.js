//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page

function setupChatPage(mode) {
  switch (mode) {
    case 'connect_succeeded':
      document.getElementById('userName').className='valid'
      document.getElementById('userName').disabled = true
      document.getElementById('btnConnect').value = 'Disconnect'
      document.getElementById('status').textContent = ''

      document.getElementById('btnSend').disabled = false
      document.getElementById('btnClear').disabled = false

      document.getElementById('msgBox').disabled = false
      document.getElementById('msgBox').focus()
      break      
    case 'connect_failed':
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

function showMessage(msgFrom, msgContent, msgClass, chatMode) {
  if (msgContent === '') return

  msgClass = (chatMode === 'private') ? 'msg_private': msgClass

  const msgDiv = document.createElement('div')
        msgDiv.innerHTML = `<strong>${msgFrom}</strong>: ${msgContent}`
        msgDiv.className = msgClass

  document.getElementById('messages').appendChild(msgDiv)
}

socket.on('connectSucceeded',(data)=> {
  if (data.name === document.getElementById('userName').value) 
    setupChatPage('connect_succeeded') //setup chat page for new user
  else 
    showMessage('', data.name + ' ' + data.msg,'msg_server') //inform new user to the others
})

socket.on('connectFailed',(data) => {
  setupChatPage('connect_failed')  //clear user name for another try
  document.getElementById('status').textContent = data.msg
})

socket.on('serverSays', function(data) {
  const userName = document.getElementById('userName').value
  showMessage(data.name, data.msg,
              data.name === userName ? 'msg_own':'',
              data.mode)
})

socket.on('userDisconnected', function(data) {
  showMessage('', data.name + ' ' + data.msg,'msg_server')
})