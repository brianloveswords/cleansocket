const net = require('net')
const server =
  net.createServer(function () {})
  .listen(socket('dead.socket'))
server.unref()

function filepath(file) {
  const path = require('path')
  return path.join(__dirname, 'files', file)
}
function socket(file) {
  const fs = require('fs')
  try {
    fs.unlinkSync(filepath(file))
  } catch(e){}
  return filepath(file)
}
process.send('ready')
