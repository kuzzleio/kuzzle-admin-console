describe('Document List', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        date: {
          type: 'date'
        },
        value: {
          type: 'integer'
        },
        value2: {
          type: 'integer'
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

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to set and persist the listViewType param accessing a collection', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.url().should('contain', 'listViewType=list')
  })

  it('Should show list items when viewType is set to list', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="DocumentList-item"]').should('exist')
  })

  it('Should be able to set and persist the listViewType param when switching the list view', function() {
    cy.waitOverlay()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.wait(500)
    cy.get('[data-cy="CollectionDropdown-column"]').click()
    cy.url().should('contain', 'listViewType=column')
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.wait(500)
    cy.get('[data-cy="CollectionDropdown-list"]').click()
    cy.url().should('contain', 'listViewType=list')
  })

  it('Should remember the list view settings when navigating from one collection to another', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/anothercollection/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.get('[data-cy="CollectionDropdown-column"]').click()
    cy.get(`[data-cy="IndexBranch-toggle--${indexName}"]`).click()
    cy.wait(500)
    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.wait(500)
    cy.get(`[data-cy=Treeview-item--${collectionName}]`).click()
    cy.url().should('contain', 'listViewType=column')
    cy.get('[data-cy="DocumentList-Column"]')

    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.url().should('contain', 'listViewType=list')
    cy.get('[data-cy="DocumentList-item"]').should('exist')
  })

  it('Should handle collections with more than 10k documents', () => {
    const documents = []
    for (let i = 200; i > 0; i--) {
      documents.push({
        body: {
          date: Date.now(),
          value: i,
          value2: i + i
        }
      })
    }
    for (let i = 50; i > 0; i--) {
      cy.request(
        'POST',
        `${kuzzleUrl}/${indexName}/${collectionName}/_mWrite?refresh=wait_for`,
        { documents }
      )
    }

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains('of 10001 total items')
    cy.get('[data-cy=DocumentList-exceedESLimitMsg]').should('exist')
  })

  it('Should handle the column view properly', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        jsonObject: {
          foo: 'bar'
        }
      }
    )
    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.wait(500)
    cy.contains(collectionName)

    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.wait(500)
    cy.get('[data-cy="CollectionDropdown-column"]').click()
    cy.url().should('contain', 'listViewType=column')

    cy.get('[data-cy="SelectField"]').click()
    cy.get('[data-cy="SelectField--date"]').click({ force: true })
    cy.get('[data-cy="ColumnViewHead--Date"]').should('exist')
    cy.get('[data-cy="SelectField"]').click()
    cy.get('[data-cy="SelectField--date"]').click({ force: true })
    cy.get('[data-cy="ColumnViewHead--Date"]').should('not.exist')
    cy.get('[data-cy="SelectField"]').click()
    cy.get('[data-cy="SelectField--value"]').click({ force: true })
    cy.get('[data-cy="SelectField"]').click()
    cy.get('[data-cy="SelectField--value2"]').click({ force: true })
    cy.get('[data-cy="ColumnViewHead--Value"]').should('exist')
    cy.get('[data-cy="ColumnViewHead--Value2"]').should('exist')
  })

  it.skip('Should handle the time series view properly', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/myId/_create`,
      {
        date: '2019-01-21',
        value: 10,
        value2: 4
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/myId2/_create`,
      {
        date: '2019-02-21',
        value: 24,
        value2: 56
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/myId3/_create`,
      {
        date: '2019-03-21',
        value: 20,
        value2: 10
      }
    )

    cy.visit('/')
    cy.get('[data-cy="AntiGlitchOverlay"]').should('not.be.visible')

    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)

    cy.get(
      '.card-panel > .DocumentsPage-filtersAndButtons > .col > .ListViewButtons > .ListViewButtons-btn:nth-child(4)'
    ).click()
    cy.get('.col > .col > .col > .Autocomplete > input').click()
    cy.get(
      '.col > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result'
    ).click()
    cy.get(
      '.TimeSeriesValueSelector > .row > .col > .Autocomplete > input'
    ).click()
    cy.get(
      '.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)'
    ).click()
    cy.get('.TimeSeriesColorPickerBtn').click({ force: true, multiple: true })
    cy.get(
      '.TimeSeriesColorPicker:nth-child(3) > .vc-chrome-body > .vc-chrome-controls > .vc-chrome-sliders > .vc-chrome-hue-wrap > .vc-hue > .vc-hue-container'
    ).click({ force: true })
    cy.get(
      '.card-panel > .row > .DocumentList-timeseries > .DocumentList-materializeCollection > .col'
    ).click()
    cy.get(
      '.TimeSeriesValueSelector > .row > .col > .Autocomplete > input'
    ).click()
    cy.get(
      '.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result'
    ).click()
    cy.get(
      '.TimeSeriesValueSelector > .row > .col > .Autocomplete > input'
    ).click()
    cy.get(
      '.card-panel > .row > .DocumentList-timeseries > .DocumentList-materializeCollection > .col'
    ).click()
    cy.get(
      '.col > .TimeSeriesValueSelector > .row:nth-child(2) > .col > .far'
    ).click()
    cy.get('.col > .TimeSeriesValueSelector > .row > .col > .far').click()
  })
})

describe('Document update/replace', () => {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'
  const documentId = 'myId'

  beforeEach(() => {
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create`,
      {
        foo: 'bar',
        more: 'moar'
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to update a document', () => {
    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)

    cy.get('[data-cy="DocumentList-item"]').should('be.visible')
    cy.get(`[data-cy="DocumentListItem-update--${documentId}"]`).click()

    cy.get('.ace_text-input').should('be.visible')
    cy.wait(2000)

    cy.get('[data-cy="JSONEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .type(`{selectall}{backspace}`, {
        delay: 400,
        force: true
      })
      .type(
        `{
      "foo":"changed"`,
        {
          force: true
        }
      )
    cy.get('[data-cy="DocumentUpdate-btn"]').click({ force: true })

    cy.request(
      'GET',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}`
    ).then(res => {
      expect(res.body.result._source.foo).to.be.equals('changed')
      expect(res.body.result._source.more).to.be.equals('moar')
    })
  })

  it('should replace a document', () => {
    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)

    cy.get('[data-cy="DocumentList-item"]').should('be.visible')
    cy.get(`[data-cy="DocumentListItem-update--${documentId}"]`).click()

    cy.get('.ace_text-input').should('be.visible')
    cy.wait(2000)

    cy.get('.ace_line')
      .contains('{')
      .click({ force: true })
    cy.get('textarea.ace_text-input')
      .type(`{selectall}{backspace}`, {
        delay: 400,
        force: true
      })
      .type(
        `{
      "foo":"changed"`,
        {
          force: true
        }
      )
    cy.get('[data-cy="DocumentReplace-btn"]').click({ force: true })
    cy.wait(1000)
    cy.get('[data-cy="DocumentList-item"]').should('be.visible')

    cy.request(
      'GET',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}`
    ).then(res => {
      expect(res.body.result._source.foo).to.be.equals('changed')
      expect(res.body.result._source.more).to.be.undefined // eslint-disable-line no-unused-expressions
    })
  })

  it('Should be able edit a document on column view', function() {
    cy.waitOverlay()
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)

    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-column"]').click()
    cy.wait(500)
    cy.get(`[data-cy="ColumnView-table-edit-btn--${documentId}"]`).click()
    cy.wait(500)
    cy.contains('Edit document')
  })
})
