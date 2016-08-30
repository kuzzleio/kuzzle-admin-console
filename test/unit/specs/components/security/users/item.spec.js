import Vue from 'vue'
import UserItem from '../../../../../../src/components/Security/Users/UserItem'
import VueRouter from 'vue-router'
import { mockedComponent } from '../../../helper'

let router

describe('UserItem component', () => {
  let $vm
  let sandbox = sinon.sandbox.create()
  let $dispatch

  beforeEach(() => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<user-item v-ref:useritem :document="user"></user-item>',
      components: { UserItem },
      data () {
        return {
          user: {
            id: 'kuzzle-bo-admin',
            content: {
              clearPassword: 'test',
              profileIds: [
                'kuzzle-bo-1',
                'kuzzle-bo-2'
              ],
              username: 'kuzzle-bo-admin'
            }
          }
        }
      }
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/': {
        name: 'UserItem',
        component: TestComponent
      },
      '/security/profiles': {
        name: 'SecurityProfilesList',
        component: mockedComponent
      },
      '/security/profiles/:id': {
        name: 'SecurityProfilesUpdate',
        component: mockedComponent
      }
    })

    router.start(App, 'body')
    router.go('/')

    $vm = router.app.$refs.routerview.$refs.useritem
    $dispatch = sandbox.stub($vm, '$dispatch')
  })

  afterEach(() => sandbox.restore())

  it('should show correct itemContent', () => {
    expect($vm.itemContent).to.deep.equal({
      username: 'kuzzle-bo-admin'
    })

    Vue.set($vm.document.content, 'customProperty', 'customValue')

    expect($vm.itemContent).to.deep.equal({
      username: 'kuzzle-bo-admin',
      customProperty: 'customValue'
    })
  })

  it('should show filtered profile list', () => {
    expect($vm.profileList).to.deep.equal([
      'kuzzle-bo-1',
      'kuzzle-bo-2'
    ])

    $vm.document.content.profileIds.push(
      'kuzzle-bo-3',
      'kuzzle-bo-4',
      'kuzzle-bo-5',
      'kuzzle-bo-6'
    )
    expect($vm.profileList).to.deep.equal([
      'kuzzle-bo-1',
      'kuzzle-bo-2',
      'kuzzle-bo-3',
      'kuzzle-bo-4',
      'kuzzle-bo-5'
    ])
  })

  it('should correctly collapse when told to', () => {
    expect($vm.collapsed).to.equal(true)

    $vm.toggleCollapse()
    expect($vm.collapsed).to.equal(false)
  })

  it('should correctly emit event on notifyCheckboxClick', () => {
    $vm.notifyCheckboxClick()

    expect($dispatch.calledWith('checkbox-click', 'kuzzle-bo-admin')).to.equal(true)
  })

  it('should correctly emit event on deleteDocument', () => {
    $vm.deleteDocument()

    expect($dispatch.calledWith('delete-document', 'kuzzle-bo-admin')).to.equal(true)
  })
})
