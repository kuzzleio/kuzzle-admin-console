var kuzzleInjector = require('inject!../../../../src/services/kuzzle')

describe.only('Kuzzle Service', () => {
  let connect = sinon.stub()

  beforeEach(() => {
    kuzzleInjector({
      'kuzzle-sdk/dist/kuzzle': sinon.stub().returns({
        connect
      }),
      '../../config': {},
      'bluebird': {}
    })
  })

  it('properly falls back to socket.io when WebSocket is not available', () => {
    var window = {}
    window.WebSocket = undefined

    expect(window.kuzzle).to.not.be.null
  })
})
