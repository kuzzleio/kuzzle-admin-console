const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const path = require('path')
const defaultPort = 3000

// Listen
module.exports = function start (port, options) {
  const serve = serveStatic(path.join(__dirname, '../../dist'))
  const server = http.createServer(function onRequest (req, res) {
    serve(req, res, finalhandler(req, res))
  })

  const _port = options ? port : defaultPort

  server.listen(_port || defaultPort)
  console.log(`Back-Office available at http://localhost:${_port || defaultPort}`)
}
