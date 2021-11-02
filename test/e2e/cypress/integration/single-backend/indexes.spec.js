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
    cy.get('[data-cy="CreateIndexModal-name"] input').type(indexName, {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.contains(indexName)
  })

  it('Should show visual feedback when creating invalid index', () => {
    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"').click()
    cy.get('[data-cy="CreateIndexModal-name"] input').type(' ', {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannot be empty'
    )
    cy.get('[data-cy="CreateIndexModal-name"] input').type('s', {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannot start with a whitespace'
    )
    cy.get('[data-cy="CreateIndexModal-name"] input').type('{selectall}A', {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannot contain uppercase letters'
    )
    cy.get('[data-cy="CreateIndexModal-name"] input').type('{selectall}asd#', {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannnot contain invalid chars'
    )
  })

  it('Should not allow to create the same index twice', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"')
      .should('be.visible')
      .click()
    cy.get('[data-cy="CreateIndexModal-name"] input').type(indexName, {
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

  it('Should be able to bulk delete some indexes', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}1/_create`)
    cy.request('POST', `http://localhost:7512/${indexName}2/_create`)

    cy.visit('/')
    cy.waitOverlay()

    cy.get(`[data-cy=IndexesPage-checkbox--${indexName}1]`).click({
      force: true
    })
    cy.get(`[data-cy=IndexesPage-checkbox--${indexName}2]`).click({
      force: true
    })

    cy.get(`[data-cy=IndexesPage-bulkDelete--btn]`).click()

    cy.get('[data-cy="BulkDeleteIndexModal-input-confirmation"').type(
      'DELETE',
      { force: true }
    )
    cy.get('[data-cy="BulkDeleteIndexModal-deleteBtn"]').click()

    cy.get('.IndexesPage').should('not.contain', `${indexName}1`)
    cy.get('.IndexesPage').should('not.contain', `${indexName}2`)
  })
})
