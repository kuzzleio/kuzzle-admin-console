import { expect } from 'chai'
const createRoutesInjector = require('inject?../vuex/modules/auth/getters!../../../src/routes/index')
import VueRouter from 'vue-router'

describe('Router login redirect', () => {
  it('should redirect to login page', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: true } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(false)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go({name: 'Home'})
    expect(transition.redirect.calledWith('/login')).to.be.ok
  })

  it('should not go to login because user already logged', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), from: { path: '/' }, to: {path: '/login', auth: true} }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.redirect.calledWith('/login')).to.not.be.ok
  })

  it('should go to the transition', () => {
    let vueRouter = new VueRouter()
    let transition = { redirect: sinon.spy(), next: sinon.spy(), to: { auth: false } }

    vueRouter.beforeEach = (f) => {
      f(transition)
    }

    const createRoutes = createRoutesInjector({
      '../vuex/modules/auth/getters': {
        isAuthenticated: sinon.stub().returns(true)
      }
    })

    createRoutes.default(vueRouter)
    vueRouter.go('/login')
    expect(transition.next.called).to.be.true
  })
})
