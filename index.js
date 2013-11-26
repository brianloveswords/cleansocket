const fs = require('fs')
const net = require('net')
const format = require('./format')

module.exports = safesocket.bind(safesocket)

function safesocket(file, done) {
  function checkExists(next) {
    fs.exists(file, function (exists) {
      if (!exists)
        return done(null, file)
      return next()
    })
  }

  function checkType(next) {
    fs.stat(file, function (err, stats) {
      if (!stats.isSocket())
        return done(new FileExistsError(file, stats))
      return next()
    })
  }

  function checkActive(next) {
    const socket = net.connect({path: file}, function () {
      socket.destroy()
      socket.removeAllListeners()
      return done(new SocketNotDead(file))
    })

    socket.on('error', function (err) {
      return next(null, file)
    })
  }

  function removeFile() {
    fs.unlink(file, function (err) {
      if (err) return done(err)
      done(null, file)
    })
  }

  run([
    checkExists,
    checkType,
    checkActive,
    removeFile,
  ])
}

function FileExistsError (file, stats) {
  const msg = 'File %s exists and is not a socket file'
  const err = new Error(format(msg, file))
  err.stack = fixStack(err)
  err.name = err.code = 'FileExists'
  err.filename = file
  err.stats = stats
  return err
}

function SocketNotDead (file) {
  const msg = 'Socket %s is still accepting connections'
  const err = new Error(format(msg, file))
  err.stack = fixStack(err)
  err.name = err.code = 'SocketNotDead'
  return err
}


function fixStack(err) {
  const lines = err.stack.split('\n')
  const first = lines[0]
  return [first].concat(lines.slice(2)).join('\n')
}

function run(functions) {
  var idx = 0
  function next() {
    functions[idx++](next)
  }; next()
}
