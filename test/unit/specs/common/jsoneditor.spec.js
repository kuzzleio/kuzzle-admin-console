import Vue from 'vue'
import JsonEditor from '../../../../src/components/Common/JsonEditor'

describe('Json editor tests', () => {
  let vm = {}
  let sandbox = sinon.sandbox.create()
  let aceSetValueSpy = sandbox.spy()
  let updateFullSpy = sandbox.spy()

  before(() => {
    vm = new Vue({
      template: '<div><json-editor v-ref:jsoneditor id="editor"></json-editor></div>',
      components: { JsonEditor }
    }).$mount()

    vm.$refs.jsoneditor.editor = {
      getSession () {
        return {
          setValue: aceSetValueSpy
        }
      },
      renderer: {
        updateFull: updateFullSpy
      },
      getValue: sinon.stub()
    }
  })

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('getJson', () => {
      it('should return null when an error occured on parse', () => {
        vm.$refs.jsoneditor.editor.getValue = sandbox.stub().returns('{toto}: tutu}')

        expect(vm.$refs.jsoneditor.getJson()).to.be.equal(null)
      })

      it('should return the parsed value in editor', () => {
        vm.$refs.jsoneditor.editor.getValue = sandbox.stub().returns('{"toto": "tutu"}')

        expect(vm.$refs.jsoneditor.getJson()).to.be.deep.equal({toto: 'tutu'})
      })
    })
  })

  describe('Watchers', () => {
    describe('Content', () => {
      it('should do nothing if there is no content', () => {
        vm.$refs.jsoneditor.content = null

        expect(aceSetValueSpy.calledOnce).to.be.equal(false)
      })

      it('should set editor value when content is changed', () => {
        vm.$refs.jsoneditor.content = {toto: 'tutu'}

        Vue.nextTick(() => {
          expect(aceSetValueSpy.calledWith(JSON.stringify({toto: 'tutu'}, null, 2))).to.be.equal(true)
        })
      })
    })
  })

  describe('Events', () => {
    it('should call updateFull on json-editor-refresh event', () => {
      vm.$broadcast('json-editor-refresh')
      expect(updateFullSpy.calledOnce).to.be.equal(true)
    })
  })
})
