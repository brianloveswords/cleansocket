const debug = require('../listen')

const path = require('path')
const test = require('tap').test
const net = require('net')
const http = require('http')

test('hijacking: normal port', function (t) {
  const server =
    http.createServer(function () {})
  server.listen(0)

  server.on('listening', function () {
    console.log(this.address().port)
    t.pass('okay good, listening')
    t.end()
    server.close()
  })
})

test('hijacking: socket', function (t) {
  const server = http.createServer()
  const other = http.createServer()
  const socket = filepath('hijacked.socket')

  server.listen(socket)

  server.on('listening', function () {
    t.pass('good, listening')

    other.listen(socket)

    other.on('error', function (err) {
      t.same(err.name, 'SocketNotDead')
      t.end()

      server.close()
    })
  })

})

function filepath(file) {
  return path.join(__dirname, 'files', file)
}
