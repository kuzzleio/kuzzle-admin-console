describe('Login', function() {
  it('is able to login as anonymous', () => {
    const validEnvName = 'valid'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [validEnvName]: {
          name: validEnvName,
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
    localStorage.setItem('lastConnectedEnv', validEnvName)

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.App-loggedIn')
  })
})
