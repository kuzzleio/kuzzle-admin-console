const fmt = require('../../../../src/utils').formatForDom

describe('Environments', function() {
  this.beforeEach(() => {})

  it('is able to create a new environment', function() {
    const newEnvName = 'local'
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('.CreateEnvironment-name').type(newEnvName, {
      force: true
    })
    cy.get('.CreateEnvironment-host').type('localhost', {
      force: true
    })
    cy.get('.Environment-SubmitButton').click()
    // cy.get('.LoginAsAnonymous-Btn').click()
    // cy.get('.IndexesPage-createBtn').click()
    // cy.get('.CreateIndexModal-name').type('test', {
    //   force: true
    // })
    // cy.get('.CreateIndexModal-createBtn').click()
    // cy.contains('test')
    cy.get(`.EnvironmentsSwitch-env[data-env=env_${fmt(newEnvName)}]`)
  })

  it.only('is able to delete an environment', function() {
    const envToDeleteName = 'local'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envToDeleteName]: {
          name: envToDeleteName,
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
    localStorage.setItem('lastConnectedEnv', envToDeleteName)
    cy.visit('/')
    cy.get('.EnvironmentsSwitch > .btn-flat').click()
    cy.get(
      `.EnvironmentsSwitch-env[data-env=env_${fmt(
        envToDeleteName
      )}] > i.fa-trash`
    ).click()
    cy.get('.EnvironmentDeleteModal-envName').type(envToDeleteName)
    cy.get('div > #delete-env > .modal-footer > span > .btn').click()
    cy.contains('Create a Connection')
  })
})
