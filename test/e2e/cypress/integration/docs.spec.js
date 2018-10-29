describe('Documents', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Luca',
      lastName: 'Marchesini',
      job: 'Blockchain as a Service'
    })

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

  it('sets and persists the listViewType param accessing a collection', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.url().should('contain', 'listViewType=list')
  })

  it('shows list items when viewType is set to list', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.DocumentList-list .collection-item')
      .children()
      .should('have.class', 'DocumentListItem')
  })

  it('sets and persists the listViewType param when switching the list view', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.ListViewButtons-btn[title~="list"]').click()
    cy.url().should('contain', 'listViewType=list')
  })

  it('shows boxed items when viewType is set to boxes', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
  })

  it('remembers the list view settings when navigating from one collection to another', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()

    cy.get('.Treeview-root .tree-item')
      .contains(collectionName)
      .click()
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')

    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()
    cy.url().should('contain', 'listViewType=list')
    cy.get('.DocumentList-list .collection-item')
      .children()
      .should('have.class', 'DocumentListItem')
  })
})
