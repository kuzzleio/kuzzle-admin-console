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

    cy.get('[data-cy="CreateIndexModal-name"] input').clear({ force: true })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannot be empty'
    )

    cy.get('[data-cy="CreateIndexModal-name"] input').type(' ', {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-name"] .invalid-feedback').should(
      'contain',
      'This field cannot contain just whitespaces'
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

  it('Should be able to bulk delete more indexes than one request allows', () => {
    // Kuzzle transmet à Elasticsearch une ligne HTTP qui nomme chaque index :
    // au-delà de 4 096 octets, il refuse l'ensemble (#965). 40 noms de 100
    // caractères la dépassent.
    const names = Array.from({ length: 40 }, (_, i) =>
      `bulk${String(i).padStart(2, '0')}`.padEnd(100, 'x')
    )
    names.forEach(name => {
      cy.request('POST', `http://localhost:7512/${name}/_create`)
    })

    cy.visit('/')
    cy.waitOverlay()

    names.forEach(name => {
      cy.get(`[data-cy=IndexesPage-checkbox--${name}]`).click({ force: true })
    })
    cy.get(`[data-cy=IndexesPage-bulkDelete--btn]`).click()
    cy.get('[data-cy="BulkDeleteIndexModal-input-confirmation"]').type(
      'DELETE',
      { force: true }
    )
    cy.get('[data-cy="BulkDeleteIndexModal-deleteBtn"]').click()

    cy.get('[data-cy=IndexesPage-checkbox--bulk39' + 'x'.repeat(94) + ']').should(
      'not.exist'
    )
    cy.request('GET', 'http://localhost:7512/_list')
      .its('body.result.indexes')
      .should(indexes => {
        expect(indexes.filter(index => index.startsWith('bulk'))).to.be.empty
      })
  })
})
