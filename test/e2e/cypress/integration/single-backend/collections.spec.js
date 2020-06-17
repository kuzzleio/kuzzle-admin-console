describe('Collection management', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to create a collection and access it', function() {
    cy.visit(`/#/data/${indexName}/create`)
    cy.get('.CollectionCreate').should('be.visible')

    cy.get('[data-cy="CollectionCreateOrUpdate-realtimeOnly"]').click({
      force: true
    })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').click({ force: true })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').type(collectionName)
    cy.get('[data-cy="CollectionCreateOrUpdate-submit"]').click({
      force: true
    })
    cy.get(`[data-cy="CollectionList-name--${collectionName}"]`).click({force: true})
    cy.contains(collectionName)
  })

  it('Should be able to update a collection', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      dynamic: 'true'
    })
    cy.visit(`/#/data/${indexName}/${collectionName}/edit`)
    cy.get('[data-cy="JSONEditor"] textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"firstName": {
"type": "keyword"`,
        {
          force: true
        }
      )
    cy.get('[data-cy=CollectionCreateOrUpdate-submit]').click()
    cy.get(`[data-cy="CollectionList-edit--${collectionName}"]`).click()
    cy.get('[data-cy="JSONEditor"]')
      .should('contain', '"firstName": {')
      .should('contain', '"type": "keyword"')
  })

  it('Should be able to clear a collection', () => {
    const documentId = 'newDoc'
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      dynamic: 'true'
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create`,
      {
        message: '...in a bottle...'
      }
    )
    cy.wait(1000)
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(documentId)
    cy.get('[data-cy="CollectionDropdown"]').click()
    cy.get('[data-cy="CollectionDropdown-clear"]').click()
    cy.get('[data-cy="CollectionClearModal-collectionName"]').type(
      collectionName
    )
    cy.get('[data-cy="CollectionClearModal-submit"]').click()
    cy.contains('This collection is empty')
  })

  it('is able to delete a collection', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit(`/#/data/`)
    cy.wait(500)
    cy.visit(`/#/data/${indexName}/`)

    cy.get(`[data-cy="CollectionList-delete--${collectionName}"]`).click()
    cy.get('[data-cy="DeleteCollectionPrompt-confirm"]').type(collectionName)
    cy.get('[data-cy="DeleteCollectionPrompt-OK"]').click()
    cy.should('not.contain', collectionName)
  })

  it('is able to fetch collections when index change', function() {
    cy.request('POST', `${kuzzleUrl}/anotherindex/_create`)
    cy.request('PUT', `${kuzzleUrl}/anotherindex/foo`)

    cy.visit(`/#/data/`)
    cy.wait(500)
    cy.visit(`/#/data/${indexName}/`)

    cy.get('[data-cy="Treeview-item-index--anotherindex"]').click()
    cy.get('[data-cy="CollectionList-table"]').contains('foo')
  })

  it('Should be able to autofocus collection search', () => {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/foobar`)

    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/`)
    cy.wait(500)

    cy.get('body').type('f{enter}')

    cy.url().should('contain', 'foobar')
    cy.contains('foobar')
    cy.contains('This collection is empty')
  })
})
