/*
Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js
*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from
const users = []        //to hold user objects [{name:'str',socket:socket object},{}...]

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

function getUserIndex(userName) {
  let i = 0
  while (i < users.length && users[i].name !== userName.trim()) i++
  return (i < users.length) ? i : -1
}

function getUserList(str) {
  //input : str = a list of user names separated by comma, e.g. 'username1, username 2,...'
  //return: an array of valid user objects built from str 
  //        or an empty array if none of them are correct user name
  const ui = [] 
  const arr = str.split(',')
  for (let i in arr) {
    const index = getUserIndex(arr[i])
    if (index >= 0) ui.push(users[index])
  }
  return ui
}

function removeUser(userName) {
  let i = 0
  while (i < users.length && users[i].name !== userName) i++
  if (i < users.length) {
    //remove user from users array
    users.splice(i,1)

    //notify existing users
    for (i in users)
      users[i].socket.emit('userDisconnected',{name:userName,msg:'just left'})
  }
}

//validate username, if the name already 
//exists emit connect_error back to client
//otherwise accept new connection
io.use((socket,next) => {
  const userName = socket.handshake.auth.userName
  if (getUserIndex(userName) >= 0) { 
    return next(new Error('User name already exists. Please choose another name'))
  }
  socket.userName = userName
  next()
})

io.on('connection', function(socket) {
  console.log(socket.userName + ' connected')

  //notify existing users on new user connection
  for (let i in users) {
    users[i].socket.emit('newUser',{name:socket.userName,msg:'just joined'})
  }

  //add new user to users list
  const user = {name:socket.userName,socket:socket}
  users.push(user)

  socket.on('clientSays', function(data) {
    //client data object: {name:sender name, msg: message to send}
    //server data object: {name:sender name, msg: message to send, mode: public or private}

    let userList = users
    let msg = data.msg
    let mode = 'public'

    //parse message if this is for a (group) private chat
    let i = data.msg.indexOf(':')
    if (i > 0) { 
      let ui= getUserList(data.msg.slice(0,i) )
      if (ui.length>0){
        mode = 'private'
        userList = ui        
        userList.push(users[getUserIndex(data.name)]) //add sender to userList
        msg = data.msg.slice(i+1).trim()
      }
    }

    //send message to relevant users
    for (let i in userList) {
      userList[i].socket.emit('serverSays', {name:data.name,msg:msg,mode:mode})
    }

  })

  socket.on('userDisconnect', function(data) {
    // console.log(data.name + ' disconnected')
    // removeUser(data.name)
    socket.disconnect(true)
  })

  socket.on('disconnect', function(reason) {
    //event emitted when a client close browser
    console.log(socket.userName + ' disconnected')
    removeUser(socket.userName)
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test on localhost:`)
console.log(`  http://localhost:${PORT} or`)
console.log(`  http://localhost:${PORT}/index.html`)
// console.log(`To Test on Openstack:`)
// console.log(`  http://???:${PORT} or`)
// console.log(`  http://???:${PORT}/index.html`)
