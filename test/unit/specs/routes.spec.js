import { expect } from 'chai'
const createRoutesInjector = require('inject!../../../src/routes')
import VueRouter from 'vue-router'

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    './vuex/getters': {
      isAuthenticated () {
        return false
      }
    }
  })

  it('should redirect to login page', () => {
    createRoutes.default(vueRouter)
    vueRouter.go('/')
    expect(transition.redirect.calledWith('/login')).to.be.ok
  })
})

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: false } }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    './vuex/getters': {
      isAuthenticated () {
        return true
      }
    }
  })

  it('should go to the transition', () => {
    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.next.called).to.be.true
  })
})

describe('Router test', () => {
  let vueRouter = new VueRouter()
  let transition = { redirect: sinon.spy(), next: sinon.spy(), from: { name: 'Home' }, to: {name: 'Login'} }

  vueRouter.beforeEach = (f) => {
    f(transition)
  }

  const createRoutes = createRoutesInjector({
    './vuex/getters': {
      isAuthenticated () {
        return true
      }
    }
  })

  it('should not go to login because user already logged', () => {
    createRoutes.default(vueRouter)
    vueRouter.go({name: 'Login'})
    expect(transition.redirect.calledWith('Home')).to.be.ok
  })
})
