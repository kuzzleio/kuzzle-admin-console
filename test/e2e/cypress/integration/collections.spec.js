describe('Collection management', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)

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

  it('is able to create a realtime collection and access it', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.visit(`/#/data/${indexName}/create`)

    cy.get(
      '.IndexBoxed:nth-child(1) > .card > .card-title > .col > .fluid-hover > .IndexBoxed-name'
    ).click()
    cy.get('.row > .card-panel > .row > .col > .btn').click()
    cy.get('.col > .row > .Mapping-realtimeOnly > label > span').click()
    cy.get(
      '.col > .row > .Mapping-realtimeOnly > label > #realtime-collection'
    ).check('on')
    cy.get('div > .row > .col > .Mapping-name > label').click()
    cy.get('div > .row > .col > .Mapping-name > #collection-name').type(
      'testcollection'
    )
    cy.get('.col > .Mapping > .row > .col > .Mapping-submitBtn').click()
    cy.get('.card > .card-title > .col > .fluid-hover > .name').click()
    cy.contains(collectionName)
    cy.contains('You did not subscribe yet')
  })
})
