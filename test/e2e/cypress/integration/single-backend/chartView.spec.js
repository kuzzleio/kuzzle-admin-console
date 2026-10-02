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

    cy.initLocalEnv()
  })

  function openChartView() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"]').click()

    cy.get('[data-cy="TimeSeriesView-container"]').should('be.visible')
  }

  function addValue(field) {
    cy.get('[data-cy="timeSeries-item"]').click()
    cy.get(`[data-cy="autocomplete-item--${field}"]`).click()
    cy.get(`[data-cy="timeSeries-item--${field}"]`).should('exist')
  }

  it('should be able to switch to the chart view', function() {
    openChartView()
  })

  it('should be able to let user select a date field', function() {
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')
  })

  it('should be able to let user select a value field and show the chart', function() {
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')

    cy.get('[data-cy="timeSeries-item"]').click()

    cy.contains('battery')
    cy.contains('temperature')

    cy.get('[data-cy="autocomplete-item--battery"]').click()
    cy.get('[data-cy="timeSeries-chart"]')
  })

  it('should be able to plot several values at once', function() {
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')

    addValue('battery')
    addValue('temperature')

    cy.get('[data-cy="timeSeries-item--battery"]').should('exist')
    cy.get('[data-cy="timeSeries-item--temperature"]').should('exist')
    cy.get('[data-cy="timeSeries-chart"]').should('be.visible')
  })

  // Les champs d'un résultat de recherche sont sous `_source` : lus sur le
  // document, ils valaient `null`, et le graphique restait vide sans qu'aucun
  // test le voie (G-101). Deux points, pour qu'une courbe ait un segment.
  it('should draw one line per value', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/second/_create?refresh=wait_for`,
      { battery: 40, temperature: 23, payloadDate: 1607350151070 }
    )
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')
    addValue('battery')
    addValue('temperature')

    cy.get('[data-cy="timeSeries-chart"] path.apexcharts-line')
      .should('have.length', 2)
      .each($path => {
        expect($path.attr('d')).to.match(/ L /)
      })
  })

  it('should be able to remove a value from the chart', function() {
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')

    addValue('battery')
    addValue('temperature')

    cy.get('[data-cy="timeSeries-item--battery"]')
      .find('[data-cy="TimeSeriesItem-removeBtn"]')
      .click()

    cy.get('[data-cy="timeSeries-item--battery"]').should('not.exist')
    cy.get('[data-cy="timeSeries-item--temperature"]').should('exist')
  })

  it('should be able to change the color of a plotted value', function() {
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')

    addValue('battery')

    // Le sélecteur natif s'ouvre hors du DOM : Cypress ne peut pas le piloter.
    // On pose la valeur comme le navigateur le ferait à sa fermeture, et on
    // vérifie ce qui en sort — la couleur persistée de la série.
    cy.get('[data-cy="timeSeries-item--battery"]')
      .find('[data-cy="TimeSeriesItem-colorPicker"]')
      .invoke('val', '#ff0000')
      .trigger('input')
      .trigger('change')

    cy.window().should((win) => {
      const config = JSON.parse(win.localStorage.getItem('timeSeriesViewConfig'))
      const numbers = config[indexName][collectionName].numbers
      expect(numbers.find((n) => n.name === 'battery').color).to.equal('#ff0000')
    })
  })

  // ApexCharts écrit le nom des séries en `innerHTML` (légende, info-bulle) :
  // un nom de champ du mapping s'exécutait chez qui ouvrait le graphique.
  it('should render a field name as text, not as HTML', function() {
    const htmlField = '<img src=x onerror=window.__xss=1>'

    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: { [htmlField]: { type: 'integer' } }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/second/_create?refresh=wait_for`,
      { battery: 40, [htmlField]: 3, payloadDate: 1607350151070 }
    )
    openChartView()

    cy.selectOption('[data-cy="timeseriesView-dateSelector"]', 'payloadDate')
    addValue('battery')
    addValue(htmlField)

    cy.get('[data-cy="timeSeries-chart"] .apexcharts-legend-text')
      .should('have.length', 2)
      .last()
      .should('have.text', htmlField)
    cy.get('[data-cy="timeSeries-chart"] img').should('not.exist')
    cy.window().its('__xss').should('be.undefined')
  })

  it('should not offer the chart view on a collection without any integer field', function() {
    const textOnlyCollection = 'textonlycollection'

    cy.request('PUT', `${kuzzleUrl}/${indexName}/${textOnlyCollection}`, {
      properties: {
        firstName: {
          type: 'keyword'
        }
      }
    })

    cy.visit(`/#/data/${indexName}/${textOnlyCollection}`)

    cy.get('[data-cy="CollectionDropdownView"]').click()
    // `aria-disabled` et non la classe `disabled` : celle-ci venait de
    // bootstrap-vue, qui la posait sans rien annoncer (G-024).
    cy.get('[data-cy="CollectionDropdown-TimeSeries"]').should(
      'have.attr',
      'aria-disabled',
      'true'
    )
  })
})
