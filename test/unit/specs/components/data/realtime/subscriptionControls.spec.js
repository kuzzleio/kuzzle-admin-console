import Vue from 'vue'
import SubscriptionControls from '../../../../../../src/components/Data/Realtime/SubscriptionControls'
import store from '../../../../../../src/vuex/store'

describe('SubscriptionControls tests', () => {
  let vm

  beforeEach(() => {
    vm = new Vue({
      template: `<div>
          <subscription-controls 
            :warning="warning"
            v-ref:controls>
          </subscription-controls>
        </div>`,
      components: { SubscriptionControls },
      replace: false,
      store: store,
      data () {
        return {
          warning: {message: '', count: 0, lastTime: null, info: false}
        }
      }
    }).$mount()
  })

  it('toggleSubscription: should dispach realtime-toggle-subscription event', () => {
    vm.$refs.controls.$dispatch = sinon.spy()

    vm.$refs.controls.toggleSubscription()

    expect(vm.$refs.controls.$dispatch.calledWith('realtime-toggle-subscription')).to.be.ok
  })

  it('clear: should dispach realtime-clear-messages event', () => {
    vm.$refs.controls.$dispatch = sinon.spy()

    vm.$refs.controls.clear()

    expect(vm.$refs.controls.$dispatch.calledWith('realtime-clear-messages')).to.be.ok
  })
})
