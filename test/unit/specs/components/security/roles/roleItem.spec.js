import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../helper'

let RoleItemInjector = require('!!vue?inject!../../../../../../src/components/Security/Roles/RoleItem')
let RoleItem
let sandbox = sinon.sandbox.create()

describe('Role item', () => {
  let vm
  let $dispatch

  before(() => {
    RoleItem = RoleItemInjector({
      '../../Materialize/Dropdown': mockedComponent,
      '../../../directives/json-formatter.directive': mockedDirective('jsonFormatter'),
      '../../../directives/title.directive': mockedDirective('title'),
      '../../../services/userAuthorization': {
        canEditRole: sandbox.stub().returns(true),
        canDeleteRole: sandbox.stub().returns(true)
      }
    })

    vm = new Vue({
      template: '<role-item v-ref:item :document="role"></role-item>',
      components: { RoleItem },
      data () {
        return {
          role: {
            id: 'role-id'
          }
        }
      }
    }).$mount()

    $dispatch = sandbox.stub(vm.$refs.item, '$dispatch')
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

      expect(vm.$refs.item.$dispatch.calledWith('checkbox-click', 'role-id')).to.equal(true)
    })

    it('should correctly emit event on deleteDocument', () => {
      vm.$refs.item.deleteDocument()

      expect(vm.$refs.item.$dispatch.calledWith('delete-document', 'role-id')).to.equal(true)
    })

    it('should redirect on right route on update', () => {
      vm.$refs.item.$router = {go: sandbox.stub()}
      vm.$refs.item.update()

      expect($dispatch.calledWithMatch('common-list::edit-document', 'SecurityRolesUpdate', 'role-id')).to.equal(true)
    })
  })
})
