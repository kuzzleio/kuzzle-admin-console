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
          color: '#002835',
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
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/create`)

    cy.get('.Mapping-name').click()
    cy.get('#collection-name').type(collectionName, { force: true })
    cy.get('.Mapping-realtimeOnly label').click()
    cy.get('.Mapping-submitBtn').click()

    cy.get('.Treeview-root .tree-item')
      .contains(collectionName)
      .click()

    cy.contains(collectionName)
    cy.contains('You did not subscribe yet')
  })
})
