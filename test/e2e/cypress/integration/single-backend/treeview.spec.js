describe('Treeview', () => {
  beforeEach(() => {
    // reset all the indexes
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })
  function movePiece(name, x, y) {
    cy.get(name)
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', x, y, { force: true })
      .trigger('mouseup', { force: true })
  }

  it('Should show the index and collection tree', () => {
    const indexName = 'testindex'
    const collectionName = 'testcollection'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)
    cy.request('PUT', `http://localhost:7512/${indexName}/${collectionName}`)
    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/${collectionName}`)


    cy.get(`[data-cy=Treeview-item-index--${indexName}]`).click()
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
    cy.get(`[data-cy=Treeview-item-index--${indexes[1]}]`).should('be.visible')
    cy.get(`[data-cy=Treeview-item-index-link--${indexes[1]}]`).click()
    cy.wait(500)
    cy.get('[data-cy=Treeview-filter]').type(collections[1])
    cy.get(`[data-cy=Treeview-item-index--${indexes[1]}]`).should('be.visible')

    cy.get(`[data-cy=Treeview-item--${collections[1]}]`).should('be.visible')

    cy.get('[data-cy=Treeview-filter]').type(`{selectall}${indexes[0]}`)
    cy.get(`[data-cy=Treeview-item-index--${indexes[0]}]`).should('be.visible')
  })

  it('Should be able to resize the LeftBar', () => {
    cy.get(`[data-cy=DataLayout-sidebarWrapper]`).should(
      'not.have.attr',
      'style'
    )
    movePiece(`[data-cy=sidebarResizer]`, 40, 200)
    cy.get(`[data-cy=DataLayout-sidebarWrapper]`).should(
      'have.css',
      'width',
      '287px'
    )
    cy.get(`[data-cy=DataLayout-sidebarWrapper]`).should('have.attr', 'style')
    movePiece(`[data-cy=sidebarResizer]`, 240, 200)
    cy.get(`[data-cy=DataLayout-sidebarWrapper]`).should('have.attr', 'style')
  })
})
