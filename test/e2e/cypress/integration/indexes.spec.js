describe('Indexes', () => {
  beforeEach(() => {
    // reset all the indexes
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')

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

  it('is able to create a new index', () => {
    const indexName = 'testindex'

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage-createBtn').click()
    cy.get('.CreateIndexModal-name').type(indexName, {
      force: true
    })
    cy.get('.CreateIndexModal-createBtn').click()
    cy.contains(indexName)
  })

  it('does not allow to create the same index twice', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage-createBtn')
    .should('be.visible')
    .click()
    cy.get('.CreateIndexModal-name').type(indexName, {
      force: true
    })
    cy.get('.CreateIndexModal-createBtn').click()
    cy.contains('An error has occurred')
  })

  it('is able to delete an index', () => {
    const indexName = 'testindex'
    cy.request('POST', `http://localhost:7512/${indexName}/_create`)

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()

    cy.get(`.IndexBoxed[title=${indexName}] .IndexBoxed-dropdown`).click()
    cy.get(`.IndexBoxed[title=${indexName}] .IndexDropdown-delete`).click()

    cy.get('.IndexDeleteModal-name').type(indexName, { force: true })
    cy.get('.IndexDeleteModal-deleteBtn').click()

    cy.get('.IndexesPage').should('not.contain', indexName)
  })
})
