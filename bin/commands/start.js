const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const defaultPort = 3000

// Listen
module.exports = function start (port, options) {
  const serve = serveStatic('dist', {'index': ['index.html']})
  const server = http.createServer(function onRequest (req, res) {
    serve(req, res, finalhandler(req, res))
  })

  const _port = options ? port : defaultPort

  server.listen(_port || defaultPort)
  console.log(`Backoffice available at http://localhost:${_port || defaultPort}`)
}
