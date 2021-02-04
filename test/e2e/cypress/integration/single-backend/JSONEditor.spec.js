describe('JSON Editor', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should show that there is an error when the input is syntactically invalid', function() {
    cy.visit(`/#/data/${indexName}/create`)
    cy.get('.CollectionCreate').should('be.visible')

    cy.get('[data-cy="JSONEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('[data-cy="JSONEditor"] textarea.ace_text-input')
      .clear({ force: true })
      .type(`INVALID JSON`, {
        delay: 200,
        force: true
      })

    cy.get('[data-cy="JSONEditor"] .ace_gutter-active-line').should(
      'have.class',
      'ace_error'
    )
  })
})
