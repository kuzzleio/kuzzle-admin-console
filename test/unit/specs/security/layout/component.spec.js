import Vue from 'vue'
import SecurityLayout from '../../../../../src/components/Security/Layout'
import VueRouter from 'vue-router'
import SecurityRoutes from '../../../../../src/routes/securityRoutes'

describe('Security layout display', () => {
  it('should render correct contents', () => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><security-layout></security-layout></div>',
      components: { SecurityLayout },
      replace: false
    })

    let router = new VueRouter()
    router.map(SecurityRoutes)

    router.start(App, 'body')

    expect(router.app.$el.querySelectorAll('aside ul li')[0].querySelector('a').textContent).to.equal('Users')
    expect(router.app.$el.querySelectorAll('aside ul li')[1].querySelector('a').textContent).to.equal('Profiles')
    expect(router.app.$el.querySelectorAll('aside ul li')[2].querySelector('a').textContent).to.equal('Roles')
  })
})
