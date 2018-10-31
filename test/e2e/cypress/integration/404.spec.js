describe('404 page', function() {
  beforeEach(() => {
    // create environment
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
  })

  it('shows when browsing to an unexisting collection and has a valid link to the home page', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/foo/bar`)
    cy.contains('404 not found')

    cy.get('.404BackToHome-link').click()
    cy.contains('Indexes')
  })
})
