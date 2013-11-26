const path = require('path')
const test = require('tap').test
const net = require('net')
const safesocket = require('..')
const fork = require('child_process').fork

test('no file, should be fine', function (t) {
  const nothing = filepath('not-a-file')
  safesocket(nothing, function (err, file) {
    t.same(file, nothing)
    t.end()
  })
})

test('a normals files', function (t) {
  const normal = filepath('normal-file.txt')
  const directory = filepath('some-directory')

  t.plan(2)

  safesocket(normal, function (err) {
    t.same(err.name, 'FileExists')
  })

  safesocket(directory, function (err) {
    t.same(err.name, 'FileExists')
  })
})

test('dead socket', function (t) {
  const dead = filepath('dead.socket')
  makeDeadSocket(function () {
    safesocket(dead, function (err, file) {
      t.same(file, dead)
      t.end()
    })
  })
})

test('alive socket', function (t) {
  const live = filepath('live.socket')
  makeLiveSocket(function () {
    safesocket(live, function (err, file) {
      t.same(err.name, 'SocketNotDead')
      t.end()
    })
  })
})


function filepath(file) {
  return path.join(__dirname, 'files', file)
}

function socket(file) {
  const fs = require('fs')
  try {
    fs.unlinkSync(filepath(file))
  } catch(e){}
  return filepath(file)
}

function makeDeadSocket(callback) {
  const script = fork(path.join(__dirname, 'deadsocket.js'))
  script.on('message', function () {
    script.kill('SIGKILL')
    setTimeout(callback, 500)
  })
}

function makeLiveSocket(callback) {
  const server =
    net.createServer(function (socket) {
      socket.write('oh hey')
      socket.end()
    }).listen(socket('live.socket'))
  server.unref()
  server.on('listening', callback)
}
