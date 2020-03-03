describe('Collection management', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)

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
          token: null
        }
      })
    )
  })

  it('is able to create a realtime collection and access it', function() {
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.visit(`/#/data/${indexName}/create`)
    cy.contains('Create a new collection')

    cy.get('[data-cy="CollectionCreateOrUpdate-realtimeOnly"]').click({
      force: true
    })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').click({ force: true })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').type(collectionName)
    cy.get('[data-cy="CollectionCreateOrUpdate-submit"]').click({
      force: true
    })
    cy.get(`[data-cy="CollectionList-name--${collectionName}"]`).click()
    cy.contains(collectionName)
    cy.contains('You did not subscribe yet')
  })

  it('is able to delete a collection', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.visit(`/#/data/${indexName}/`)

    cy.get(`[data-cy="CollectionList-delete--${collectionName}"]`).click()
    cy.get('[data-cy="DeleteCollectionPrompt-confirm"]').type(collectionName)
    cy.get('[data-cy="DeleteCollectionPrompt-OK"]').click()
    cy.should('not.contain', collectionName)
  })
})
