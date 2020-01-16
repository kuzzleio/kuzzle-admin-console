const fmt = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

describe('Environments', function () {
  this.beforeEach(() => { })

  it('is able to create a new environment', function () {
    const newEnvName = 'local'
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-name"]').type(newEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get(`.EnvironmentsSwitch-env[data-env=env_${fmt(newEnvName)}]`)
  })

  it('is able to delete an environment', function () {
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
    cy.get('.row > .col > .EnvironmentsSwitch > .btn-flat > .fa').click()

    cy.get('.EnvironmentsSwitch-env:nth-child(1) > .delete').click({
      force: true
    })

    cy.get('[data-cy="EnvironmentDeleteModal-envName"]').type(envToDeleteName)
    cy.get('[data-cy="EnvironmentDeleteModal-submit"]').click({ force: true })
    cy.contains('Create a Connection')
  })

  it('is able to set the color of an environment', function () {
    cy.visit('/')
    cy.get('[data-cy="CreateEnvironment-name"]').type('local', {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy="EnvColor--green"]')
      .as('colorEl')
      .click()

    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.wait(1000)
    cy.get('.LoginAsAnonymous-Btn').click()

    cy.get('.navbar-fixed > nav').should($nav => {
      expect($nav.attr('class')).to.contain('EnvColor--green')
    })
  })

  it('is able to create an invalid environment and switch back to the valid one', function () {
    const validEnvName = 'valid'
    const invalidEnvName = 'invalid'
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
    localStorage.setItem('lastConnectedEnv', validEnvName)

    cy.visit('/')

    cy.get('.EnvironmentsSwitch > .btn-flat').click()
    cy.get('.EnvironmentsSwitch-newConnectionBtn').click()

    cy.get('[data-cy="CreateEnvironment-name"]').type(invalidEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('invalid-host', {
      force: true
    })
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').click()

    cy.contains('Unable to connect to kuzzle server')

    cy.get('.EnvironmentsSwitch > .btn-flat').click()
    cy.get(`.EnvironmentsSwitch-env[data-env=env_${fmt(validEnvName)}]`).click()

    cy.get('[data-cy="App-connected"]')
  })

  it('should import environment', () => {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-import"]').click({
      force: true
    })

    cy.fixture('environment.json').then(fileContent => {
      cy.get('input[type=file').upload(
        {
          fileContent,
          fileName: 'environment.json',
          mimeType: 'application/json'
        },
        { subjectType: 'input' }
      )
    })
  })
})
