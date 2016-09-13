import store from '../../../../../../src/vuex/store'
import Vue from 'vue'
import {mockedComponent} from '../../../helper'

let JsonFormItemProfileIdsInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItemProfileIds')

describe('JsonFormItemProfileIds tests', () => {
  let sandbox = sinon.sandbox.create()
  let JsonFormItemProfileIds
  let vm
  let setPartialSpy = sandbox.stub()
  let value
  let content
  let searchProfilesPromise

  let initComponent = (error) => {
    if (error) {
      searchProfilesPromise = sandbox.stub().returns(Promise.reject(new Error()))
    } else {
      searchProfilesPromise = sandbox.stub().returns(Promise.resolve({profiles: [{id: 'admin'}, {id: 'default'}]}))
    }

    JsonFormItemProfileIds = JsonFormItemProfileIdsInjector({
      '../../../services/kuzzle': {
        security: {
          searchProfilesPromise
        }
      },
      '../../../vuex/modules/data/actions': {
        setPartial: setPartialSpy
      },
      'vue-multiselect': mockedComponent
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><json-form-item-profile-ids v-ref:jsonformitem :content="content" full-name="foo"></json-form-item-profile-ids></div>',
      components: {JsonFormItemProfileIds},
      replace: false,
      store: store,
      data () {
        return {
          value,
          content
        }
      }
    }).$mount('body')
  }

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('setProfileIds tests', () => {
      it('should set a new profileIds array', () => {
        initComponent()
        vm.$refs.jsonformitem.setProfileIds(['default', 'admin'])
        expect(setPartialSpy.calledWith('profileIds', ['default', 'admin']))
      })
    })
  })

  describe('ready', () => {
    it('should get all the profiles', (done) => {
      content = ['admin-bo']
      initComponent()
      setTimeout(() => {
        expect(searchProfilesPromise.called).to.be.ok
        expect(vm.$refs.jsonformitem.profiles).to.deep.equals(['admin', 'default'])
        expect(setPartialSpy.called).to.be.ok
        done()
      }, 0)
    })
  })

  describe('watch', () => {
    describe('value', () => {
      it('should trigger mutation setPartial', () => {
        initComponent()
        vm.$refs.jsonformitem.content = 'foo'
        Vue.nextTick(() => {
          expect(setPartialSpy.called).to.be.ok
        })
      })
    })
  })
})
