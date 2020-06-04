describe('Indexes', () => {
  beforeEach(() => {
    // reset all the indexes
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to create a new index', () => {
    const indexName = 'testindex'

    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"').click()
    cy.get('[data-cy="CreateIndexModal-name"]').type(indexName, {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.contains(indexName)
  })

  it('Should not allow to create the same index twice', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"')
      .should('be.visible')
      .click()
    cy.get('[data-cy="CreateIndexModal-name"]').type(indexName, {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.get('[data-cy="CreateIndexModal-alert"]').should('be.visible')
    cy.get('[data-cy="CreateIndexModal-alert"]').should(
      'contain',
      'already exists'
    )
  })

  it('Should be able to delete an index', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.waitOverlay()

    cy.get(`[data-cy=IndexesPage-delete--${indexName}]`).click()

    cy.get('[data-cy="DeleteIndexModal-name"').type(indexName, { force: true })
    cy.get('[data-cy="DeleteIndexModal-deleteBtn"]').click()

    cy.get('.IndexesPage').should('not.contain', indexName)
  })

  it('Should be able to autofocus index search', () => {
    cy.request('POST', 'http://localhost:7512/nyc-open-data/_create')
    cy.request('POST', 'http://localhost:7512/iot-data/_create')

    cy.waitOverlay()

    cy.get('body').type('n{enter}')

    cy.url().should('contain', 'nyc-open-data')
    cy.contains('nyc-open-data')
    cy.contains('This index has no collections.')
  })
})
