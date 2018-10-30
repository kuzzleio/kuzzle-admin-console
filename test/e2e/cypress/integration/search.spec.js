describe('Search', function() {
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

  it('perists the Quick Search query in the URL', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type('Keylogger', { delay: 60 })
    cy.url().should('contain', 'quick=Keylogger')
    cy.url().should('contain', 'active=quick')
  })

  it('persists the Basic Search query in the URL', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.BasicFilter-query input[placeholder=Attribute]').type('job')
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Blockchain')
    cy.get('.BasicFilter-submitBtn').click()
    cy.url().should('contain', 'active=basic')
    cy.url().should('contain', 'attribute')
    cy.url().should('contain', 'job')
    cy.url().should('contain', 'match')
    cy.url().should('contain', 'Blockchain')
  })

  it('remembers the Quick Search query across collections', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })

    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Nicolas',
      lastName: 'Juelle',
      job: 'CSS Level: Expert !important'
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Alexandre',
      lastName: 'Bouthinon',
      job: 'From scratch All the Things!'
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type('Keylogger', { delay: 60 })
    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()
    cy.url().should('not.contain', 'Keylogger')
    cy.get('.DocumentListItem').should('have.length', 2)

    cy.get('.Treeview-root .tree-item')
      .contains(collectionName)
      .click()
    cy.url().should('contain', 'Keylogger')
    cy.get('.DocumentListItem').should('have.length', 1)
  })

  it('remembers the Basic Search query across collections', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })

    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Nicolas',
      lastName: 'Juelle',
      job: 'CSS Level: Expert !important'
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Alexandre',
      lastName: 'Bouthinon',
      job: 'From scratch All the Things!'
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.BasicFilter-query input[placeholder=Attribute]').type('job')
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Keylogger')
    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentListItem').should('have.length', 1)

    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()
    cy.url().should('not.contain', 'Keylogger')
    cy.get('.DocumentListItem').should('have.length', 2)

    cy.get('.Treeview-root .tree-item')
      .contains(collectionName)
      .click()
    cy.url().should('contain', 'Keylogger')
    cy.get('.DocumentListItem').should('have.length', 1)
  })

  it('refreshes search when the Search button is hit twice', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(`${collectionName}`)
    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.BasicFilter-query input[placeholder=Attribute]').type('job')
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Blockchain')
    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentListItem').should('have.length', 1)

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })
    cy.wait(1500)

    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentListItem').should('have.length', 2)
  })

  it('when the RESET button is hit, the search query is reset but not the list view type', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type('Keylogger', { delay: 60 })

    cy.url().should('contain', 'Keylogger')
    cy.get('.DocumentListItem').should('have.length', 1)

    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 1)

    cy.get('.QuickFilter-resetBtn').click()

    cy.url().should('not.contain', 'Keylogger')
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 2)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.BasicFilter-query input[placeholder=Attribute]').type('job')
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Keylogger')
    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentBoxItem').should('have.length', 1)

    cy.get('.BasicFilter-resetBtn').click()
    cy.url().should('not.contain', 'Keylogger')
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 2)
  })
})
