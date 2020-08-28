describe('Collection management with multi-backend', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.task('doco', { version: '1', docoArgs: ['down'] })
    cy.task('doco', { version: '2', docoArgs: ['down'] })
    cy.wait(3000)
  })
  it('Should disable delete collections for KUZZLE V1', () => {
    cy.task('doco', {
      version: '1',
      docoArgs: ['up'],
    })
    cy.waitForService(`http://localhost:7512`)
    cy.request(
      'POST',
      `http://localhost:7512/${indexName}/_create`
    )
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit(`/#/data/`)
    cy.wait(500)
    cy.visit(`/#/data/${indexName}/`)
    cy.get(`[data-cy="CollectionList-delete--${collectionName}"]`).should('not.exist')
  })
})
