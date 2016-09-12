import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../helper'

let ProfileItemInjector = require('!!vue?inject!../../../../../../src/components/Security/Profiles/ProfileItem')
let ProfileItem
let sandbox = sinon.sandbox.create()

describe('Profile item', () => {
  let vm

  before(() => {
    ProfileItem = ProfileItemInjector({
      '../../Materialize/Dropdown': mockedComponent,
      '../../../directives/json-formatter.directive': mockedDirective
    })

    vm = new Vue({
      template: '<profile-item v-ref:item :document="profile"></profile-item>',
      components: { ProfileItem },
      data () {
        return {
          profile: {
            id: 'profile-id'
          }
        }
      }
    }).$mount()

    sandbox.stub(vm.$refs.item, '$dispatch')
  })

  describe('Methods', () => {
    it('should toggle collapsed variable', () => {
      vm.$refs.item.toggleCollapse()
      expect(vm.$refs.item.collapsed).to.be.equal(false)

      vm.$refs.item.toggleCollapse()
      expect(vm.$refs.item.collapsed).to.be.equal(true)
    })

    it('should correctly emit event on notifyCheckboxClick', () => {
      vm.$refs.item.notifyCheckboxClick()

      expect(vm.$refs.item.$dispatch.calledWith('checkbox-click', 'profile-id')).to.equal(true)
    })

    it('should correctly emit event on deleteDocument', () => {
      vm.$refs.item.deleteDocument()

      expect(vm.$refs.item.$dispatch.calledWith('delete-document', 'profile-id')).to.equal(true)
    })

    it('should redirect on right route on update', () => {
      vm.$refs.item.$router = {go: sandbox.stub()}
      vm.$refs.item.update()

      expect(vm.$refs.item.$router.go.calledWithMatch({name: 'SecurityProfilesUpdate', params: {id: 'profile-id'}})).to.equal(true)
    })
  })
})
