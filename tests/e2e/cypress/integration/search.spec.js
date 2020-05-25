describe('Search', function () {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create?refresh=wait_for`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        firstName: {
          type: 'text'
        },
        job: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        lastName: {
          type: 'keyword'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Luca',
        lastName: 'Marchesini',
        job: 'Blockchain as a Service'
      }
    )

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

  it('persists the Quick Search query in the URL', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type('Keylogger', { delay: 60 })
    cy.url().should('contain', 'quick=Keylogger')
    cy.url().should('contain', 'active=quick')
  })

  it('persists the Basic Search query in the URL', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-optionBtn').click()
    cy.get(
      '.BasicFilter-orBlock > .BasicFilter-andBlock > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.BasicFilter-andBlock > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(6)'
    ).click()
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Blockchain', {
      delay: 60
    })
    cy.get('.BasicFilter-submitBtn').click()
    cy.url().should('contain', 'active=basic')
    cy.url().should('contain', 'attribute')
    cy.url().should('contain', 'job')
    cy.url().should('contain', 'match')
    cy.url().should('contain', 'Blockchain')
  })

  it('remembers the Quick Search query across collections', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )

    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/anothercollection/_create?refresh=wait_for`,
      {
        firstName: 'Nicolas',
        lastName: 'Juelle',
        job: 'CSS Level: Expert !important'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/anothercollection/_create?refresh=wait_for`,
      {
        firstName: 'Alexandre',
        lastName: 'Bouthinon',
        job: 'From scratch All the Things!'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type('Keylogger', { delay: 250 })
    cy.wait(250)
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

  it('remembers the Basic Search query across collections', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )

    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/anothercollection/_create?refresh=wait_for`,
      {
        firstName: 'Nicolas',
        lastName: 'Juelle',
        job: 'CSS Level: Expert !important'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/anothercollection/_create?refresh=wait_for`,
      {
        firstName: 'Alexandre',
        lastName: 'Bouthinon',
        job: 'From scratch All the Things!'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get(
      '.BasicFilter-orBlock > .BasicFilter-andBlock > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.BasicFilter-andBlock > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(6)'
    ).click()
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Keylogger', {
      delay: 60
    })
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
    cy.get('.BasicFilter-query input[placeholder=Attribute]').should(
      'have.value',
      'job'
    )
    cy.get('.BasicFilter-query input[placeholder=Value]').should(
      'have.value',
      'Keylogger'
    )
  })

  it('refreshes search when the Search button is hit twice', function () {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(`${collectionName}`)
    cy.get('.QuickFilter-optionBtn').click()
    cy.get(
      '.BasicFilter-orBlock > .BasicFilter-andBlock > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.BasicFilter-andBlock > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(6)'
    ).click()
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Blockchain', {
      delay: 60
    })
    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentListItem').should('have.length', 1)

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.wait(1500)

    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentListItem').should('have.length', 2)
  })

  it('resets the search query but not the list view type, when the RESET button is hit', function () {
    const searchTerm = 'Adrien'
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.QuickFilter-searchBar input').type(searchTerm, { delay: 60 })

    cy.url().should('contain', searchTerm)
    cy.get('.DocumentListItem').should('have.length', 1)

    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 1)

    cy.get('.QuickFilter-resetBtn').click()

    cy.url().should('not.contain', searchTerm)
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 2)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get(
      '.BasicFilter-orBlock > .BasicFilter-andBlock > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.BasicFilter-andBlock > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(5)'
    ).click()
    cy.get('.BasicFilter-query input[placeholder=Value]').type(searchTerm)
    cy.get('.BasicFilter-submitBtn').click()
    cy.get('.DocumentBoxItem').should('have.length', 1)

    cy.get('.BasicFilter-resetBtn').click()
    cy.url().should('not.contain', searchTerm)
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
    cy.get('.DocumentBoxItem').should('have.length', 2)
  })

  it('sorts the results when sorting is selected in the basic filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Nicolas',
        lastName: 'Juelle',
        job: 'CSS Level: Expert !important'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Alexandre',
        lastName: 'Bouthinon',
        job: 'From scratch All the Things!'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get(
      '.BasicFilter-orBlock > .BasicFilter-andBlock > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.BasicFilter-andBlock > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(6)'
    ).click()
    cy.get('.BasicFilter-query input[placeholder=Value]').type('Blockchain', {
      delay: 60
    })

    cy.get(
      '.BasicFilter-sortBlock > .row > .col > .Autocomplete > .validate'
    ).click()
    cy.get(
      '.block-content > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(2)'
    ).click()
    cy.get('.BasicFilter-sortingValue')
      .click()
      .contains('desc')
      .click()

    cy.get('.BasicFilter-submitBtn').click()

    cy.get('.DocumentListItem').should(function ($el) {
      expect($el.first()).to.contain('Maret')
      expect($el.last()).to.contain('Marchesini')
    })
  })

  it('sorts the results when sorting is specfied in the raw filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Nicolas',
        lastName: 'Juelle',
        job: 'CSS Level: Expert !important'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Alexandre',
        lastName: 'Bouthinon',
        job: 'From scratch All the Things!'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.tab.col')
      .contains('JSON')
      .click()

    cy.get('#rawsearch .ace_line').should('be.visible')
    cy.wait(1000)

    cy.get('#rawsearch .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
      "query": { 
      "bool": {
      "must": {
      "prefix": {
      "lastName": "Mar"{downarrow}{downarrow}{downarrow}{downarrow},
      "sort": {
      "lastName": "desc"
      }`,
        {
          force: true
        }
      )

    cy.get('.RawFilter-submitBtn').click()

    cy.get('.DocumentListItem').should(function ($el) {
      expect($el.first()).to.contain('Maret')
      expect($el.last()).to.contain('Marchesini')
    })
  })

  it('transforms a search query from basic filter to raw filter', function () {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.BasicFilter-query input[placeholder=Attribute]').type('foo', {
      delay: 60
    })
    cy.get('.BasicFilter-query input[placeholder=Value]').type('bar', {
      delay: 60
    })
    cy.get('.BasicFilter-submitBtn').click()

    cy.get('#raw').click()
    cy.get('.ace_content')
      .should('contain', 'query')
      .and('contain', 'must')
      .and('contain', 'prefix')
      .and('contain', 'bar')
  })

  it('should show aggregations in search result when aggregations are specified in the raw filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'bar'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.tab.col')
      .contains('JSON')
      .click()

    cy.get('#rawsearch .ace_line').should('be.visible')

    cy.get('#rawsearch .ace_line')
      .contains('{')
      .click({ force: true })
    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
      "query": {},
      "aggregations": {
        "my_aggs": {
          "terms": {
            "field": "firstName"
          `,
        {
          force: true
        }
      )

    cy.get('.RawFilter-submitBtn').click()

    cy.get('.DocumentListItem').should(function ($el) {
      expect($el.first()).to.contain('Aggregations')
    })
  })

  it('should not show aggregations in search result when no aggregations are specified in the raw filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'bar'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.QuickFilter-optionBtn').click()
    cy.get('.tab.col')
      .contains('JSON')
      .click()

    cy.get('#rawsearch .ace_line').should('be.visible')

    cy.get('#rawsearch .ace_line')
      .contains('{')
      .click({ force: true })
    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
        "query": {}`,
        {
          force: true
        }
      )

    cy.get('.RawFilter-submitBtn').click()
  })
})
