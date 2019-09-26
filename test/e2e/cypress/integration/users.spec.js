describe('Users', function() {
  const kuzzleUrl = 'http://localhost:7512'

  before(function() {
    cy.request('PUT', `${kuzzleUrl}/users/_mapping`, {
      properties: {
        name: { type: 'keyword' }
      }
    })
  })

  beforeEach(function() {
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

  it('deletes a user successfully via the dropdown menu', function() {
    const kuid = 'dummy'
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create`, {
      content: {
        profileIds: ['default'],
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit('/#/security/users')

    cy.get('.UserItem')
      .contains(kuid)
      .parent()
      .siblings('.UserItem-actions')
      .children('.UserItem-dropdown')
      .click()
      .contains('Delete')
      .click()

    cy.contains(`Do you really want to delete ${kuid}`)
    cy.contains('sure!').click()

    cy.wait(2000)
    cy.get('.CommonList').should('not.contain', kuid)
  })

  it('deletes a user successfully via the checkbox and bulk delete button', function() {
    const kuid = 'dummy'
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create`, {
      content: {
        profileIds: ['default'],
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit('/#/security/users')

    cy.get('[id="checkbox-dummy"]').click({force: true})
    cy.get('.BulkActions')
      .contains('Delete')
      .click()

    cy.contains(`Do you really want to delete 1 documents`)
    cy.contains('sure!').click()

    cy.wait(2000)
    cy.get('.CommonList').should('not.contain', kuid)
  })

  it('updates the user mapping successfully', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit('/#/security/users/custom-mapping')

    cy
    .get('#user-custom-data-mapping-editor .ace_line')
    .should('be.visible')

    cy.get('#user-custom-data-mapping-editor .ace_line')
      .contains('{')
      .click({ force: true })
    cy.get('textarea.ace_text-input')
    .clear({force: true})
    .type(`{{}"address": {{}"type": "text"},`, {
      force: true
    })

    cy.get('.UserCustomMappingEditor-submit').click()
    cy.contains('User Management')
  })

  it('receives an error when trying to update the mapping for an existing field', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit('/#/security/users/custom-mapping')

    cy.get('#user-custom-data-mapping-editor .ace_line')
      .contains('keyword')
      .click({ force: true })
    cy.get('textarea.ace_text-input').type(`{ctrl}{rightarrow}{backspace}`, {
      force: true
    })
    cy.get('textarea.ace_text-input').type(`text`, {
      force: true
    })
    cy.get('.UserCustomMappingEditor-submit').click()
    cy.contains('Can not change type of field')
  })
})
