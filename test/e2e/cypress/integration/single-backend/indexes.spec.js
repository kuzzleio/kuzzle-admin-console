describe('Indexes', () => {
  beforeEach(() => {
    // reset all the indexes
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')

    cy.initLocalEnv()
  })

  it('Should be able to create a new index', () => {
    const indexName = 'testindex'

    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"]').click()
    cy.get('[data-cy="CreateIndexModal-name"] input').type(indexName, {
      force: true
    })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.contains(indexName)
  })

  it('Should show visual feedback when creating invalid index', () => {
    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"]').click()

    cy.get('[data-cy="CreateIndexModal-name"] input').clear({ force: true })
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    cy.invalidFeedback('[data-cy="CreateIndexModal-name"]').should(
      'contain',
      'This field cannot be empty'
    )

    cy.get('[data-cy="CreateIndexModal-name"] input').type(' ', {
      force: true
    })
    cy.invalidFeedback('[data-cy="CreateIndexModal-name"]').should(
      'contain',
      'This field cannot contain just whitespaces'
    )

    cy.get('[data-cy="CreateIndexModal-name"] input').type('s', {
      force: true
    })
    cy.invalidFeedback('[data-cy="CreateIndexModal-name"]').should(
      'contain',
      'This field cannot start with a whitespace'
    )

    cy.get('[data-cy="CreateIndexModal-name"] input').type('{selectall}A', {
      force: true
    })
    cy.invalidFeedback('[data-cy="CreateIndexModal-name"]').should(
      'contain',
      'This field cannot contain uppercase letters'
    )

    cy.get('[data-cy="CreateIndexModal-name"] input').type('{selectall}asd#', {
      force: true
    })
    cy.invalidFeedback('[data-cy="CreateIndexModal-name"]').should(
      'contain',
      'This field cannnot contain invalid chars'
    )
  })

  it('Should not allow to create the same index twice', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.waitOverlay()

    cy.get('[data-cy="IndexesPage-createBtn"]')
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

    cy.get('[data-cy="DeleteIndexModal-name"]').type(indexName, { force: true })
    cy.get('[data-cy="DeleteIndexModal-deleteBtn"]').click()

    cy.get('[data-cy=IndexesPage]').should('not.contain', indexName)
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

    cy.get('[data-cy="BulkDeleteIndexModal-input-confirmation"]').type(
      'DELETE',
      { force: true }
    )
    cy.get('[data-cy="BulkDeleteIndexModal-deleteBtn"]').click()

    cy.get('[data-cy=IndexesPage]').should('not.contain', `${indexName}1`)
    cy.get('[data-cy=IndexesPage]').should('not.contain', `${indexName}2`)
  })

  // Le tri des colonnes n'a jamais eu de spec : il est couvert ici AVANT d'être
  // réécrit sans `b-table` (ADR-0011, décision 4).
  it('Should be able to sort the indexes by name', () => {
    const indexes = ['charlieindex', 'alphaindex', 'bravoindex']
    indexes.forEach(name =>
      cy.request('POST', `http://localhost:7512/${name}/_create`)
    )

    cy.waitOverlay()

    cy.get('[data-cy=IndexesPage] table tbody tr').should('have.length', 3)

    cy.get('[data-cy=IndexesPage] table thead th')
      .contains('Name')
      .click()
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(0)
      .should('contain', 'alphaindex')
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(2)
      .should('contain', 'charlieindex')

    cy.get('[data-cy=IndexesPage] table thead th')
      .contains('Name')
      .click()
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(0)
      .should('contain', 'charlieindex')
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(2)
      .should('contain', 'alphaindex')
  })

  it('Should be able to sort the indexes by collection count', () => {
    cy.request('POST', 'http://localhost:7512/oneindex/_create')
    cy.request('PUT', 'http://localhost:7512/oneindex/collectiona')

    cy.request('POST', 'http://localhost:7512/threeindex/_create')
    cy.request('PUT', 'http://localhost:7512/threeindex/collectiona')
    cy.request('PUT', 'http://localhost:7512/threeindex/collectionb')
    cy.request('PUT', 'http://localhost:7512/threeindex/collectionc')

    cy.waitOverlay()

    // Le compte n'est connu que des index dont les collections ont été
    // chargées : c'est le dépliement dans l'arbre qui les charge.
    cy.get('[data-cy=IndexBranch-toggle--oneindex]').click()
    cy.get('[data-cy=IndexBranch-toggle--threeindex]').click()

    cy.get('[data-cy=IndexesPage-name--oneindex]')
      .parents('tr')
      .should('contain', '1')
    cy.get('[data-cy=IndexesPage-name--threeindex]')
      .parents('tr')
      .should('contain', '3')

    cy.get('[data-cy=IndexesPage] table thead th')
      .contains('Collections')
      .click()
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(0)
      .should('contain', 'oneindex')

    cy.get('[data-cy=IndexesPage] table thead th')
      .contains('Collections')
      .click()
    cy.get('[data-cy=IndexesPage] table tbody tr')
      .eq(0)
      .should('contain', 'threeindex')
  })
})
