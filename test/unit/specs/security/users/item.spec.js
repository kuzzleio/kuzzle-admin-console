import Vue from 'vue'
import UserItem from '../../../../../src/components/Security/Users/UserItem'
import VueRouter from 'vue-router'

let router
let user = {
  'id': 'kuzzle-bo-admin',
  'content': {
    clearPassword: 'test',
    profilesIds: [
      'kuzzle-bo-1',
      'kuzzle-bo-2'
    ],
    username: 'kuzzle-bo-admin'
  }
}

describe.only('UserItem component', () => {
  let $vm
  let sandbox = sinon.sandbox.create()
  let $emit

  beforeEach(() => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<user-item v-ref:useritem v-bind:user="user"></user-item>',
      components: { UserItem },
      data () {
        return {
          user: user
        }
      }
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/': {
        name: 'UserItem',
        component: TestComponent
      },
      '/security/profile': {
        name: 'SecurityProfilesList',
        component: TestComponent
      },
      '/security/profile/:id': {
        name: 'SecurityProfileDetail',
        component: TestComponent
      }
    })

    router.start(App, 'body')
    router.go('/')

    $vm = router.app.$refs.routerview.$refs.useritem
    $emit = sandbox.stub($vm, '$emit')
  })

  afterEach(() => sandbox.restore())

  it('should show correct itemContent', () => {
    expect($vm.itemContent).to.deep.equal({
      username: 'kuzzle-bo-admin'
    })

    Vue.set(user.content, 'customProperty', 'customValue')

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

    user.content.profilesIds.push(
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

    expect($emit.calledWith('checkbox-click', 'kuzzle-bo-admin')).to.equal(true)
  })
})
