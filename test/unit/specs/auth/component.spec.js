import Login from '../../../../src/components/Login'

describe('Login.vue', () => {
  it('should render correct contents', () => {
    expect(Login.data().username).to.be.null
    expect(Login.data().password).to.be.null
    expect(Login.vuex.actions.doLogin).to.be.defined
  })
})
