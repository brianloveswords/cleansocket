# cleansocket [![Build Status](https://secure.travis-ci.org/brianloveswords/cleansocket.png?branch=master)](http://travis-ci.org/brianloveswords/cleansocket)

Cleans up old sockets before listening on them.

When trying to listen on a socketfile, a server will emit an `EADDRINUSE` error even if the socket is no longer alive. @dshaw [came up with a rad solution](https://gist.github.com/dshaw/9f93cdcd3a77b9142e51) but it still doesn't check to see if the socket is dead before blowing it away.

`cleansocket` ensures that the file is indeed a socket and that it's not still listening for connections before it deletes the file. It also provides a way to override all `.listen()` methods so it does this automatically.

## Install

```bash
$ npm install cleansocket
```
## Example

```js
const cleansocket = require('cleansocket')
const net = require('net')
const server = net.createServer(function(socket){
  socket.pipe(socket)
})

cleansocket('/tmp/echo.sock', function(error, socketfile) {
  // if the file was unable to be removed for some reason, there would
  // be an error. Otherwise the original filename is returned
  server.listen(socketfile)
})
```

You can also globally hijack all `.listen()` functions:

```js
require('cleansocket/listen')

const net = require('net')
const server = http.createServer()
server.on('request', function(req, res){
  req.pipe(res)
})

// will call `cleansocket` before trying to listen. Add an `error`
// listener to server to catch and deal with any errors
server.listen('/tmp/http-echo.sock')
```

## Errors


#### <code>FileExists</code>

Emitted if the file exists and is **not** a socket. The following properties are added to the error in addition to the standard ones:

* `stats`: An [fs.Stats](http://nodejs.org/api/fs.html#fs_class_fs_stats) object.
* `filename`: Name of the file

#### <code>SocketNotDead</code>

Emitted when the file is a socket, but it is still accepting connections.


## License

MIT

```
Copyright (c) 2013 Brian J. Brennan

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```