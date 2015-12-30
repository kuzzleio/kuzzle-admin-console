var
  request = require('request'),
  c = require('./features/support/config.js'),
  kuzzleUrl = 'http://' + c.kuzzleHost + ':' + c.kuzzlePort,
  POLL_TIMEOUT = 3;

var pokePoll = function () {
  request({
    method: 'GET',
    uri: kuzzleUrl + '/api/v1.0/'
    }, (error, response, body) => {
      if (error){
        console.log('Still no one on ' + kuzzleUrl + ': ' + error + '. Retrying in ' + POLL_TIMEOUT + ' seconds.');
        setTimeout(pokePoll, POLL_TIMEOUT * 1000);
      } else {
        console.log('Got someone on ' + response.request.uri.href + ': ' + response.statusCode);
        process.exit(0);
      }
    });
}

pokePoll();
