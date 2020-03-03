describe('404 page', function() {
  beforeEach(() => {
    // create environment
    const validEnvName = 'valid'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [validEnvName]: {
          name: validEnvName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: 'anonymous'
        }
      })
    )
  })

  it('shows when browsing to an unexisting index and has a valid link to the home page', function() {
    cy.visit(`/#/data/foo`)
    cy.contains('404 not found')

    cy.get('.404BackToHome-link')
  })

  it('shows when browsing to an unexisting collection and has a valid link to the home page', function() {
    cy.visit(`/#/data/foo/bar`)
    cy.contains('404 not found')

    cy.get('.404BackToHome-link')
  })
})
