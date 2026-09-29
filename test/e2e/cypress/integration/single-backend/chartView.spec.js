describe('Chart view', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'
  const documentId = 'testdocument'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        battery: {
          type: 'integer'
        },
        temperature: {
          type: 'integer'
        },
        payloadDate: {
          type: 'date'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create?refresh=wait_for`,
      {
        battery: 42,
        temperature: 21,
        payloadDate: 1607346551070
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('should be able to switch to the chart view', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)


    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"').click()


    cy.get('[data-cy="TimeSeriesView-container"')
  })

  it('should be able to let user select a date field', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)


    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"').click()


    cy.get('[data-cy="timeseriesView-dateSelector"').select('payloadDate')
  })

  it('should be able to let user select a value field and show the chart', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)


    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"').click()


    cy.get('[data-cy="timeseriesView-dateSelector"').select('payloadDate')

    cy.get('[data-cy="timeSeries-item"').click()

    cy.contains('battery')
    cy.contains('temperature')

    cy.get('[data-cy="autocomplete-item--battery"').click()
    cy.get('[data-cy="timeSeries-chart"')
  })

  // Les champs d'un résultat de recherche sont sous `_source` : lus sur le
  // document, ils valaient `null`, et le graphique restait vide sans qu'aucun
  // test le voie. Deux points, pour qu'une courbe ait un segment.
  it('should draw one line per value', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/second/_create?refresh=wait_for`,
      { battery: 40, temperature: 23, payloadDate: 1607350151070 }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="CollectionDropdownView"').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"').click()

    cy.get('[data-cy="timeseriesView-dateSelector"').select('payloadDate')

    cy.get('[data-cy="timeSeries-item"').click()
    cy.get('[data-cy="autocomplete-item--battery"').click()
    cy.get('[data-cy="timeSeries-item"').click()
    cy.get('[data-cy="autocomplete-item--temperature"').click()

    cy.get('[data-cy="timeSeries-chart"] path.apexcharts-line')
      .should('have.length', 2)
      .each($path => {
        expect($path.attr('d')).to.match(/L ?\d/)
      })
  })
})
