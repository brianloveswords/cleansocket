const net = require('net')
const server = net.createServer(function(socket){
  socket.pipe(socket)
})
server.listen('echo.sock')
