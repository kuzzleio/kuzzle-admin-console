describe('Collection management', function () {
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

  it('is able to create a realtime collection and access it', function () {
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.visit(`/#/data/${indexName}/create`)

    cy.get(
      '.col > .row > .Mapping-realtimeOnly > label > #realtime-collection'
    ).check('on', { force: true })
    cy.get('div > .row > .col > .Mapping-name > label').click({ force: true })
    cy.get('div > .row > .col > .Mapping-name > #collection-name').type(
      'testcollection'
    )
    cy.get('.col > .Mapping > .row > .col > .Mapping-submitBtn').click({
      force: true
    })
    cy.get('.card > .card-title > .col > .fluid-hover > .name').click({
      force: true
    })
    cy.contains(collectionName)
    cy.contains('You did not subscribe yet')
  })
})
