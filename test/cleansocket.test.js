const path = require('path')
const test = require('tap').test
const net = require('net')
const cleansocket = require('..')
const fork = require('child_process').fork
const domain = require('domain')


test('no file, should be fine', function (t) {
  const nothing = filepath('not-a-file')
  cleansocket(nothing, function (err, file) {
    t.same(file, nothing, 'no file exists')
    t.end()
  })
})

test('a normals files', function (t) {
  const normal = filepath('normal-file.txt')
  const directory = filepath('some-directory')

  t.plan(2)

  cleansocket(normal, function (err) {
    t.same(err.name, 'FileExists', 'file exists, is a file')
  })

  cleansocket(directory, function (err) {
    t.same(err.name, 'FileExists', 'file exists, is a directory')
  })
})

test('dead socket', function (t) {
  const dead = filepath('dead.socket')
  makeDeadSocket(function () {
    cleansocket(dead, function (err, file) {
      t.same(file, dead, 'socket is dead')
      t.end()
    })
  })
})

test('alive socket', function (t) {
  const live = filepath('live.socket')
  makeLiveSocket(function (server) {
    server.on('error', function (err) {
      console.log('whaaaaaaaaaaaaaat')
    })

    cleansocket(live, function (err, file) {
      t.same(err.name, 'SocketNotDead', 'error, socket not dead')
      server.close()
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
      // noop
    }).listen(socket('live.socket'))
  server.unref()
  server.on('listening', function () {
    callback(server)
  })
}
