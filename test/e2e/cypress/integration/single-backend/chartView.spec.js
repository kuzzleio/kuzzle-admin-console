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
