const net = require('net')
const safesocket = require('..')

const _listen = net.Server.prototype.listen

net.Server.prototype.listen = function listen(path) {
  const self = this
  const args = arguments

  if (!isString(path))
    return _listen.apply(self, args)

  safesocket(path, function (err, file) {
    if (err) return self.emit('error', err)
    return _listen.apply(self, args)
  })
}

function isString(str) {
  return (typeof str == 'string' && isNaN(Number(str)))
}
