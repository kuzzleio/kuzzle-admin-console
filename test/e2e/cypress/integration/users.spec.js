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

  it('deletes a user successfully', function() {
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

    // TODO here
  })

  it('updates the user mapping successfully', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit('/#/security/users/custom-mapping')

    cy.get('#user-custom-data-mapping-editor .ace_line')
      .contains('},')
      .click({ force: true })
    cy.get('textarea.ace_text-input').type(`"address": {{}"type": "text"},`, {
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
