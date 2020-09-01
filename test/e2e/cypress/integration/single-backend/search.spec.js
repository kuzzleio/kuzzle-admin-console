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
          type: 'text',
          fielddata: true,
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
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
          type: 'keyword',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/marchesini/_create?refresh=wait_for`,
      {
        firstName: 'Luca',
        lastName: 'Marchesini',
        job: 'Blockchain as a Service'
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('perists the Quick Search query in the URL', function () {
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
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="QuickFilter-input"]').type('Keylogger', { delay: 60 })
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
    // cy.get('[data-cy=LoginAsAnonymous-Btn]').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('job')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Blockchain', {
      delay: 60
    })
    cy.get('.BasicFilter-submitBtn').click()
    cy.url().should('contain', 'active=basic')
    cy.url().should('contain', 'attribute')
    cy.url().should('contain', 'job')
    cy.url().should('contain', 'contains')
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
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="QuickFilter-input"]').type('Keylogger', { delay: 250 })
    cy.wait(250)
    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.url().should('not.contain', 'Keylogger')
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 2)

    cy.get(`[data-cy=Treeview-item--${collectionName}]`).click()
    cy.url().should('contain', 'Keylogger')
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 1)
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
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('job')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Keylogger', {
      delay: 60
    })
    cy.get('[data-cy=BasicFilter-submitBtn]').click()

    cy.get('[data-cy="DocumentListItem"]').should('have.length', 1)

    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.url().should('not.contain', 'Keylogger')
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 2)

    cy.get(`[data-cy=Treeview-item--${collectionName}]`).click()
    cy.url().should('contain', 'Keylogger')
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 1)
    cy.get('[data-cy="QuickFilter-displayActiveFilters"]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').should(
      'have.value',
      'job'
    )
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').should(
      'have.value',
      'Keylogger'
    )
  })

  it('refreshes search when the Search button is hit twice', function () {
    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(`${collectionName}`)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('job')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Blockchain', {
      delay: 60
    })
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 1)

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
    cy.get('[data-cy="QuickFilter-displayActiveFilters"]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 2)
  })

  it('resets the search query but not the list view type, when the RESET button is hit', function () {
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
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="QuickFilter-input"]').type('Keylogger', { delay: 60 })

    cy.url().should('contain', 'Keylogger')
    cy.get('[data-cy="DocumentListItem"]').should('have.length', 1)

    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy=CollectionDropdown-column]').click()
    cy.get('[data-cy="ColumnView-table"] tbody tr').should('have.length', 1)

    cy.get('[data-cy="QuickFilter-resetBtn"]').click()

    cy.url().should('not.contain', 'Keylogger')
    cy.url().should('contain', 'listViewType=column')
    cy.get('[data-cy="ColumnView-table"] tbody tr').should('have.length', 2)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('job')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Keylogger')
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy="ColumnView-table"] tbody tr').should('have.length', 1)

    cy.get('[data-cy="QuickFilter-displayActiveFilters"]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-resetBtn"]').click()
    cy.url().should('not.contain', 'Keylogger')
    cy.url().should('contain', 'listViewType=column')
    cy.get('[data-cy="ColumnView-table"] tbody tr').should('have.length', 2)
  })

  it('sorts the results when sorting is selected in the basic filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/maret/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/juelle/_create?refresh=wait_for`,
      {
        firstName: 'Nicolas',
        lastName: 'Juelle',
        job: 'CSS Level: Expert !important'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/bouthinon/_create?refresh=wait_for`,
      {
        firstName: 'Alexandre',
        lastName: 'Bouthinon',
        job: 'From scratch All the Things!'
      }
    )

    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('job')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Blockchain', {
      delay: 60
    })
    cy.get('[data-cy=BasicFilter-submitBtn]').click()

    cy.get('[data-cy="QuickFilter-displayActiveFilters"]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-sortAttributeSelect"]').select('lastName')
    cy.get('[data-cy="BasicFilter-sortOrderSelect"]').select('desc')
    cy.get('.BasicFilter-submitBtn').click()

    cy.get('[data-cy="DocumentListItem"]').should(function ($el) {
      expect($el.first()).to.contain('maret')
      expect($el.last()).to.contain('marchesini')
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
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-rawTab"]').click()
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
        "match_phrase_prefix": {
        "job": "Blockchain"{downarrow}{downarrow}{downarrow}{downarrow},
        "sort": {
        "lastName": "desc"
        }`,
        {
          force: true
        }
      )

    cy.get('[data-cy="RawFilter-submitBtn"]').click()

    cy.get('[data-cy="DocumentListItem"]').should(function ($el) {
      expect($el.first()).to.contain('Maret')
      expect($el.last()).to.contain('Marchesini')
    })
  })

  it('transforms a search query from basic filter to raw filter', function () {
    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-basicTab"]').click()

    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('firstName')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('bar', {
      delay: 60
    })
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy="QuickFilter-displayActiveFilters"]').click()
    cy.get('[data-cy="Filters-rawTab"]').click()
    cy.get('.ace_content')
      .should('contain', 'query')
      .and('contain', 'must')
      .and('contain', 'match_phrase_prefix')
      .and('contain', 'bar')
  })

  it.skip('should show aggregations in search result when aggregations are specified in the raw filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'bar'
      }
    )

    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-rawTab"]').click()

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

    cy.get('[data-cy="RawFilter-submitBtn"]').click()

    cy.get('[data-cy="DocumentListItem"]').should(function ($el) {
      expect($el.first()).to.contain('Aggregations')
    })
  })

  it.skip('should not show aggregations in search result when no aggregations are specified in the raw filter', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'bar'
      }
    )

    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-rawTab"]').click()

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

    cy.get('[data-cy="RawFilter-submitBtn"]').click()
  })

  it('should properly paginate search results', () => {
    const docCount = 50
    const documents = []
    for (let i = 0; i < docCount; i++) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)

    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()

    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('firstName')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('Dummy')
    cy.get('[data-cy=BasicFilter-sortAttributeSelect]').select('lastName')

    cy.get('[data-cy=BasicFilter-submitBtn]').click()

    cy.get('[data-cy=DocumentList-pagination] [aria-posinset=4]').click()

    cy.contains('dummy-40')
    cy.contains('dummy-41')
    cy.contains('dummy-42')
    cy.url().should('contain', 'from=30')
  })
  it('should add my search in history', () => {
    const docCount = 10
    const documents = []
    for (let i = 0; i < docCount * 2; i += 2) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('lastName')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('4')
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy=QuickFilter-displayActiveFilters]').click()
    cy.get('[data-cy=Filters-historyTab]').click()
    cy.get('[data-cy="FilterHistoryItem--0"]')
  })
  it('Should be able to see previous searches in the search history.', () => {
    const docCount = 10
    const documents = []
    for (let i = 0; i < docCount * 2; i += 2) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )
    for (let i = 0, item = 0; i < 10; i += 2, item++) {
      cy.visit(`/#/data/${indexName}/${collectionName}`)
      cy.get('[data-cy=QuickFilter-optionBtn]').click()
      cy.get('[data-cy=Filters-basicTab]').click()
      cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('lastName')
      cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type(i)
      cy.get('[data-cy=BasicFilter-submitBtn]').click()
      cy.get('[data-cy=QuickFilter-displayActiveFilters]').click()
      cy.get('[data-cy=Filters-historyTab]').click()
      cy.get('[data-cy="FilterHistoryItem--' + item + '"]')
      cy.get('[data-cy="Filters-close"]').click()
      cy.get('[data-cy="QuickFilter-resetBtn"]').click()
    }
  })
  it('should be able to add a filter to favorite', () => {
    const docCount = 10
    const documents = []
    for (let i = 0; i < docCount * 2; i += 2) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('lastName')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('1')
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy=QuickFilter-displayActiveFilters]').click()
    cy.get('[data-cy=Filters-historyTab]').click()
    cy.get('[data-cy="FilterHistoryItem--0"]')
    cy.get('[data-cy="FilterHistoryItem-Add-Favorite--0"]').click()
    cy.get('[data-cy=Filters-favoriteTab]').click()
    cy.get('[data-cy="FilterFavoriItem--0"]')
  })
  it('should display message for empty favorite or history', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-historyTab]').click()
    cy.contains("You haven't performed any search yet.")
    cy.get('[data-cy=Filters-favoriteTab]').click()
    cy.contains("You don't have any favorite filters.")
  })
  it('should be able to remove a favorite filter', () => {
    const docCount = 10
    const documents = []
    for (let i = 0; i < docCount * 2; i += 2) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('lastName')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type('1')
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.get('[data-cy=QuickFilter-displayActiveFilters]').click()
    cy.get('[data-cy=Filters-historyTab]').click()
    cy.get('[data-cy="FilterHistoryItem--0"]')
    cy.get('[data-cy="FilterHistoryItem-Add-Favorite--0"]').click()
    cy.get('[data-cy=Filters-favoriteTab]').click()
    cy.get('[data-cy="FilterFavoriItem--0"]')
    cy.get('[data-cy="FilterFavoriItem-Remove--0"]').click()
    cy.get('[data-cy="FilterFavoriItem--0"]').should('not.exist')
    cy.contains("You don't have any favorite filters.")
  })
  it('should be able to perform search from history', () => {
    const docCount = 10
    const documents = []
    for (let i = 0; i < docCount * 2; i += 2) {
      documents.push({
        _id: `dummy-${i}`,
        body: {
          firstName: 'Dummy',
          lastName: `Clone-${i}`,
          job: 'Blockchain as a Service'
        }
      })
    }
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
      {
        documents
      }
    )
    for (let i = 0, item = 0; i < 10; i += 2, item++) {
      cy.visit(`/#/data/${indexName}/${collectionName}`)
      cy.get('[data-cy=QuickFilter-optionBtn]').click()
      cy.get('[data-cy=Filters-basicTab]').click()
      cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('lastName')
      cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type(i)
      cy.get('[data-cy=BasicFilter-submitBtn]').click()
      cy.get('[data-cy=QuickFilter-displayActiveFilters]').click()
      cy.get('[data-cy=Filters-historyTab]').click()
      cy.get('[data-cy="FilterHistoryItem--' + item + '"]')
      cy.get('[data-cy="Filters-close"]').click()
      cy.get('[data-cy="QuickFilter-resetBtn"]').click()
    }
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-historyTab]').click()
    cy.get('[data-cy="FilterHistoryItem-Search-Favorite--0"]').click()
    cy.contains('dummy-0')
    cy.contains('dummy-10')
    cy.contains('dummy-9').should('not.exist')
  })

  it('should be able to display the range field correctly', function () {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'bar'
      }
    )

    cy.visit('/')
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-operator"]').select('Range')
    cy.get(`[data-cy="BasicFilter-operator-Range-Value1"]`).invoke('innerWidth').should('be.gt', 100);
    cy.get(`[data-cy="BasicFilter-operator-Range-Value2"]`).invoke('innerWidth').should('be.gt', 100);
  })
})
