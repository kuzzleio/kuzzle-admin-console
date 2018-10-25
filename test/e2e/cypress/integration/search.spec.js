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

  it('refreshes search when the Search button is hit twice', function () {
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
})