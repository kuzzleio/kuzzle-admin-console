describe('404 page', function() {
  beforeEach(() => {
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
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
    // La page des documents ne se rend pas sous le 404 (#964).
    cy.get('.DocumentList').should('not.exist')
  })
})
