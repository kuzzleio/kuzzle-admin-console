import Focus from '../../../../src/directives/focus.directive'
import Vue from 'vue'

describe('Focus directive', () => {
  it('should trigger focus on the element on bind', (done) => {
    Focus.el = {
      focus: sinon.spy()
    }
    Focus.bind()
    Vue.nextTick(() => {
      expect(Focus.el.focus.called).to.be.ok
      done()
    })
  })
})
