const kuzzleUrl = 'http://localhost:7512'
const indexName = 'testindex'
const collectionName = 'testcollection'
const LOCALSTORAGE_PREFIX = 'kuz-ac-settings'
const documentId = 'my-doc'
const mapCollectionName = 'mapcollectiontest'

describe('Document List', function() {
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
        },
        id: {
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
        job: 'Blockchain as a Service',
        id: 'Luca Marchesini'
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should default to List view if no settings are specified', function() {
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.DocumentsListView').should('exist')
  })

  it('Should show list items when viewType is set to list', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.DocumentListView-item').should('exist')
  })

  it('Should show the the _id even if collection has id field', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/documentId/_create?refresh=wait_for`,
      {
        firstName: 'Luca',
        lastName: 'Marchesini',
        job: 'Blockchain as a Service',
        id: 'Luca Marchesini'
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.DocumentListView-item').within(() => {
      cy.get('a').contains('documentId')
      cy.get('a')
        .not()
        .contains('Luca Marchesini')
    })
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
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
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
    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.get(`[data-cy=Treeview-item--${collectionName}]`).click()

    cy.url().should('contain', 'listViewType=column')
    cy.get('[data-cy="DocumentList-Column"]')

    cy.get('[data-cy=Treeview-item--anothercollection]').click()
    cy.url().should('contain', 'listViewType=list')
    cy.get('.DocumentsListView').should('exist')
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

  it('Should handle the map view properly for markers', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${mapCollectionName}`, {
      properties: {
        location: {
          type: 'geo_point'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc1/_create?refresh=wait_for`,
      {
        location: {
          lat: 1,
          lon: 1
        }
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc2/_create?refresh=wait_for`,
      {
        location: {
          lat: 2,
          lon: 2
        }
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc3/_create?refresh=wait_for`,
      {
        location: {
          lat: 3,
          lon: 3
        }
      }
    )
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${mapCollectionName}`,
      JSON.stringify({
        listViewType: 'map'
      })
    )

    cy.visit(`/#/data/${indexName}/${mapCollectionName}`)
    cy.wait(500)
    cy.contains(mapCollectionName)

    cy.get('[data-cy="mapView-map"').should('exist')

    cy.get('.leaflet-marker-pane .mapView-marker-default').should(
      'have.length',
      3
    )
    cy.get('.leaflet-marker-pane .mapView-marker-selected').should('not.exist')

    cy.get('[data-cy="mapView-no-document-card"').should('exist')
    cy.get('[data-cy="mapView-current-document-card"').should('not.exist')

    cy.get('.leaflet-marker-icon.documentId-mapViewTestDoc1').click({
      force: true
    })

    cy.get('[data-cy="mapView-no-document-card"').should('not.exist')
    cy.get('[data-cy="mapView-current-document-card"').should('exist')
    cy.get('[data-cy="mapView-current-document-id"').contains('mapViewTestDoc1')
    cy.get('.leaflet-marker-pane .mapView-marker-default').should(
      'have.length',
      2
    )
    cy.get('.leaflet-marker-pane .mapView-marker-selected').should('exist')
  })

  it('Should handle the map view properly for shapes', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${mapCollectionName}`, {
      properties: {
        location: {
          type: 'geo_point'
        },
        shapeLocation: {
          type: 'geo_shape',
          strategy: 'recursive'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc1/_create?refresh=wait_for`,
      {
        location: {
          lat: 43.64326358211144,
          lon: 3.831031442987847
        }
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc2/_create?refresh=wait_for`,
      {
        location: {
          lat: 43.664501944601604,
          lon: 3.871200201519735
        }
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc3/_create?refresh=wait_for`,
      {
        location: {
          lat: 43.67120723541598,
          lon: 3.9499927663322842
        }
      }
    )

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc4/_create?refresh=wait_for`,
      {
        shapeLocation: {
          type: 'circle',
          coordinates: [43.730096133858524, 3.915556507504015],
          radius: '1000m'
        }
      }
    )

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc5/_create?refresh=wait_for`,
      {
        shapeLocation: {
          type: 'polygon',
          coordinates: [
            [
              [43.60032923480691, 3.8878084393198136],
              [43.60356125105433, 3.9083219719888764],
              [43.59091188995088, 3.9090086174338654],
              [43.59144029485811, 3.8783241491108957],
              [43.60032923480691, 3.8878084393198136]
            ]
          ]
        }
      }
    )

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${mapCollectionName}/mapViewTestDoc6/_create?refresh=wait_for`,
      {
        shapeLocation: {
          type: 'multipolygon',
          coordinates: [
            [
              [
                [43.66015088601359, 3.839142054763717],
                [43.65959203746721, 3.8704273378510523],
                [43.64465643574373, 3.8730880889503876],
                [43.64596073192335, 3.8281128123035724],
                [43.66015088601359, 3.839142054763717]
              ]
            ],
            [
              [
                [43.71901833733811, 3.92913852182612],
                [43.715266485411206, 3.985942880878295],
                [43.69020926282012, 3.9893217296479504],
                [43.69517426144837, 3.9269220225309236],
                [43.71901833733811, 3.92913852182612]
              ],
              [
                [43.70829406483838, 3.9422358371159754],
                [43.70656068186119, 3.965451798017157],
                [43.69706558137606, 3.966759739476379],
                [43.70080864286678, 3.943652773696799],
                [43.70829406483838, 3.9422358371159754]
              ]
            ]
          ]
        }
      }
    )
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${mapCollectionName}`,
      JSON.stringify({
        listViewType: 'map'
      })
    )

    cy.visit(`/#/data/${indexName}/${mapCollectionName}`)
    cy.wait(500)
    cy.contains(mapCollectionName)

    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.wait(500)
    cy.get('[data-cy="CollectionDropdown-map"]').click()
    cy.url().should('contain', 'listViewType=map')

    cy.get('[data-cy="mapView-map"').should('exist')

    // markers well displayed
    cy.get('.leaflet-marker-pane .mapView-marker-default').should(
      'have.length',
      3
    )

    // shapes well displayed
    cy.get('.data-cy-shape').should('have.length', 4)
    cy.get('.data-cy-shape-selected').should('not.exist')

    // document card ok
    cy.get('[data-cy="mapView-no-document-card"').should('exist')
    cy.get('[data-cy="mapView-current-document-card"').should('not.exist')

    cy.get('.data-cy-shape-mapViewTestDoc4').click({
      force: true
    })

    cy.get('[data-cy="mapView-no-document-card"').should('not.exist')
    cy.get('[data-cy="mapView-current-document-card"').should('exist')
    cy.get('[data-cy="mapView-current-document-id"').contains('mapViewTestDoc4')
    cy.get('.data-cy-shape-selected').should('exist')
  })
})

describe('Document update/replace', () => {
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

    cy.get('.DocumentListView-item').should('be.visible')
    cy.get(`[data-cy="DocumentListItem-update--${documentId}"]`).click()

    cy.get('.ace_text-input').should('exist')
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

    cy.get('.DocumentListView-item').should('be.visible')
    cy.get(`[data-cy="DocumentListItem-update--${documentId}"]`).click()

    cy.get('.ace_text-input').should('exist')
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
    cy.get('.DocumentListView-item').should('be.visible')

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

describe.only('Realtime', () => {
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
        },
        id: {
          type: 'keyword'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create?refresh=wait_for`,
      {
        firstName: 'Luca',
        lastName: 'Marchesini',
        job: 'Blockchain as a Service',
        id: 'Luca Marchesini'
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Remembers auto-update settings through page reload', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('[data-cy="Autosync-icon"]').should('have.class', 'text-secondary')

    cy.get('[data-cy="Refresh-dropdown"] .dropdown-toggle').click()
    cy.wait(1000)
    cy.get('[data-cy="Autosync-toggle"]').click()
    cy.get('[data-cy="Autosync-icon"]').should(
      'not.have.class',
      'text-secondary'
    )

    cy.reload()
    cy.get('[data-cy="Autosync-icon"]').should(
      'not.have.class',
      'text-secondary'
    )
  })
  it('[auto-update OFF] Shows badges for pending notifications (List view)', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request(
      'PATCH',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_update?refresh=wait_for`,
      {
        firstName: 'Bombi',
        lastName: 'Bombi'
      }
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      'updated'
    )
    cy.request(
      'PUT',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_replace?refresh=wait_for`,
      {
        job: 'CSS selector'
      }
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      'replaced'
    )
    cy.request(
      'DELETE',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}?refresh=wait_for`
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      'deleted'
    )
  })
  it('[auto-update OFF] Refreshes list when Refresh button is hit', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request(
      'PATCH',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_update?refresh=wait_for`,
      {
        firstName: 'Bombi',
        lastName: 'Bombi'
      }
    )
    cy.get(
      `[data-cy=DocumentListItem-${documentId}] [data-cy="DocumentListItem-toggleCollapse"]`
    ).click()

    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      '"Luca"'
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      '"Marchesini"'
    )
    cy.get('[data-cy=Autosync-icon]').click()
    cy.get(
      `[data-cy=DocumentListItem-${documentId}] [data-cy="DocumentListItem-toggleCollapse"]`
    ).click()

    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      '"Bombi"'
    )
  })
  it('[auto-update ON] Automatically applies realtime-notifications (List view)', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      JSON.stringify({ autoSync: true })
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request(
      'PATCH',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_update?refresh=wait_for`,
      {
        firstName: 'Bombi',
        lastName: 'Bombi'
      }
    )
    cy.get(
      `[data-cy=DocumentListItem-${documentId}] [data-cy="DocumentListItem-toggleCollapse"]`
    ).click()

    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      '"Bombi"'
    )
    cy.request(
      'PUT',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_replace?refresh=wait_for`,
      {
        job: 'CSS selector'
      }
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should(
      'contain',
      '"CSS selector"'
    )
    cy.request(
      'DELETE',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}?refresh=wait_for`
    )
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should('not.exist')
  })
  it('Shows the new documents badge when new documents are added to the collection and refreshes when clicked (List View)', function() {
    cy.skipOnBackendVersion(1)
    const newDocId = 'new-doc'
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      null
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get(`[data-cy=DocumentListItem-${documentId}]`).should('exist')
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${newDocId}/_create?refresh=wait_for`,
      {
        firstName: 'Steve',
        lastName: 'Ballmer'
      }
    )
    cy.get('[data-cy="NewDocumentsBadge"]').click()
    cy.get(`[data-cy=DocumentListItem-${newDocId}]`).should('exist')
  })
  it('Shows the new documents badge when new documents are added to the collection and refreshes when clicked (Column View)', function() {
    cy.skipOnBackendVersion(1)
    const newDocId = 'new-doc'
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      JSON.stringify({ listViewType: 'column' })
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get(`[data-cy="ColumnItem-${documentId}-acColumnTableId"]`).should(
      'exist'
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${newDocId}/_create?refresh=wait_for`,
      {
        firstName: 'Steve',
        lastName: 'Ballmer'
      }
    )
    cy.get('[data-cy="NewDocumentsBadge"]').click()
    cy.get(`[data-cy="ColumnItem-${newDocId}-acColumnTableId"]`).should('exist')
  })
  it('[auto-update OFF] Shows badges for pending notifications (Column view)', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      JSON.stringify({ listViewType: 'column' })
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request(
      'PATCH',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_update?refresh=wait_for`,
      {
        firstName: 'Bombi',
        lastName: 'Bombi'
      }
    )
    cy.get(
      `[data-cy=ColumnItem-${documentId}-acColumnTableActions] .badge`
    ).should('contain', 'updated')

    cy.request(
      'PUT',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_replace?refresh=wait_for`,
      {
        job: 'CSS selector'
      }
    )
    cy.get(
      `[data-cy=ColumnItem-${documentId}-acColumnTableActions] .badge`
    ).should('contain', 'replaced')

    cy.request(
      'DELETE',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}?refresh=wait_for`
    )
    cy.get(
      `[data-cy=ColumnItem-${documentId}-acColumnTableActions] .badge`
    ).should('contain', 'deleted')
  })
  it('[auto-update ON] Automatically applies realtime-notifications (Column view)', function() {
    cy.skipOnBackendVersion(1)
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}:${indexName}/${collectionName}`,
      JSON.stringify({
        autoSync: true,
        listViewType: 'column',
        columnView: { fields: ['firstName', 'job'] }
      })
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request(
      'PATCH',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_update?refresh=wait_for`,
      {
        firstName: 'Bombi',
        lastName: 'Bombi'
      }
    )

    cy.get(`#col-${documentId}-firstName`).should('contain', 'Bombi')
    cy.request(
      'PUT',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_replace?refresh=wait_for`,
      {
        job: 'CSS selector'
      }
    )
    cy.get(`#col-${documentId}-job`).should('contain', 'CSS selector')
    cy.request(
      'DELETE',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}?refresh=wait_for`
    )
    cy.get(`col--${documentId}-acColumnTableId`).should('not.exist')
  })
})
