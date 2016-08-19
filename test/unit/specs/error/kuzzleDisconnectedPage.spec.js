import Vue from 'vue'
import { mockedComponent } from '../helper'
import store from '../../../../src/vuex/store'

let KuzzleDisconnectedPageInjector = require('!!vue?inject!../../../../src/components/Error/KuzzleDisconnectedPage')

describe('KuzzleDisconnectedPage component', () => {
  let vm
  let sandbox = sinon.sandbox.create()
  let setConnection = sandbox.stub()
  let removeListener = sandbox.stub()
  let KuzzleDisconnectedPage

  const mockInjector = (testedEvent) => {
    KuzzleDisconnectedPage = KuzzleDisconnectedPageInjector({
      '../../services/kuzzle': {
        host: 'toto',
        wsPort: 8888,
        addListener: (event, cb) => {
          if (testedEvent === event) {
            cb()
          }
        },
        removeListener
      },
      '../../vuex/modules/common/kuzzle/actions': {
        setConnection
      },
      './KuzzleDisconnected': mockedComponent
    })

    document.body.insertAdjacentHTML('afterbegin', '<app></app>')
    vm = new Vue({
      template: '<div><kuzzle-disconnected-page v-ref:disconnected></kuzzle-disconnected-page></div>',
      components: {
        KuzzleDisconnectedPage
      },
      store: store
    })
  }

  afterEach(() => sandbox.restore())

  describe('Ready', () => {
    it('should init host and port', () => {
      mockInjector('fakeevent')
      vm.$mount('app')

      expect(vm.$refs.disconnected.host).to.be.equal('toto')
      expect(vm.$refs.disconnected.port).to.be.equal(8888)
    })

    it('should init listeners on reconnect', () => {
      mockInjector('reconnected')
      vm.$router = {go: sandbox.stub(), _children: {push: sandbox.stub()}}
      vm.$mount('app')

      expect(setConnection.calledWith(store, true)).to.be.equal(true)
      expect(vm.$router.go.calledWithMatch({name: 'Home'})).to.be.equal(true)
    })

    it('should init listeners on connected', () => {
      mockInjector('connected')
      vm.$router = {go: sandbox.stub(), _children: {push: sandbox.stub()}}
      vm.$mount('app')

      expect(setConnection.calledWith(store, true)).to.be.equal(true)
      expect(vm.$refs.disconnected.$router.go.calledWithMatch({name: 'Home'})).to.be.equal(true)
    })
  })

  describe('destroyed', () => {
    it('should init host and port', () => {
      mockInjector('fakeevent')
      vm.$mount('app')
      vm.$destroy()

      expect(removeListener.calledWith('reconnected')).to.be.equal(true)
      expect(removeListener.calledWith('connected')).to.be.equal(true)
    })
  })
})
