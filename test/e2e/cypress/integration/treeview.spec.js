describe('Treeview', () => {
  beforeEach(() => {
    // reset all the indexes
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')

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
          token: 'anonymous'
        }
      })
    )
    localStorage.setItem('currentEnv', validEnvName)
  })

  it('Should show the index and collection tree', () => {
    const indexName = 'testindex'
    const collectionName = 'testcollection'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)
    cy.request('PUT', `http://localhost:7512/${indexName}/${collectionName}`)
    cy.waitOverlay()

    cy.get(`[data-cy=Treeview-item-index--${indexName}]`).should('be.visible')
    cy.get(`[data-cy=IndexBranch-toggle--${indexName}]`).click()
    cy.get(`[data-cy=Treeview-item--${collectionName}]`).should('be.visible')
  })

  it('Should be able to filter indexes and collections', () => {
    const indexes = ['totoindex', 'lolindex']
    const collections = ['foocollection', 'barcollection']

    for (let i = 0; i < 2; i++) {
      cy.request('POST', `http://localhost:7512/${indexes[i]}/_create`)
      cy.request('PUT', `http://localhost:7512/${indexes[i]}/${collections[i]}`)
    }
    cy.waitOverlay()

    cy.get('[data-cy=Treeview-filter]').type(collections[1])
    cy.get(`[data-cy=Treeview-item-index--${indexes[1]}]`).should('be.visible')
    cy.get(`[data-cy=Treeview-item--${collections[1]}]`).should('be.visible')

    cy.get('[data-cy=Treeview-filter]').type(`{selectall}${indexes[0]}`)
    cy.get(`[data-cy=Treeview-item-index--${indexes[0]}]`).should('be.visible')
  })
})
