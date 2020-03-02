const fmt = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

describe('Environments', function() {
  this.beforeEach(() => {
    localStorage.removeItem('environments')
  })

  it('is able to create a new environment', function() {
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
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`)
  })

  it('is able to delete an environment', function() {
    const envToDeleteName = 'local'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envToDeleteName]: {
          name: envToDeleteName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
    localStorage.setItem('lastConnectedEnv', envToDeleteName)
    cy.visit('/')
    cy.contains('Connected to')
    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(`[data-cy="EnvironmentSwitch-env_${envToDeleteName}-delete"]`).click(
      {
        force: true
      }
    )

    cy.get('[data-cy="EnvironmentDeleteModal-envName"]').type(envToDeleteName)
    cy.get('[data-cy="EnvironmentDeleteModal-submit"]').click({ force: true })
    cy.contains('Create a Connection')
  })

  it('is able to set the color of an environment', function() {
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
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()

    cy.get('nav').should($nav => {
      expect($nav.attr('class')).to.contain('EnvColor--green')
    })
  })

  it('is able to create an unreachable environment and switch back to the reachable one', function() {
    const reachableEnvName = 'reachable'
    const unreachableEnvName = 'unreachable'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [reachableEnvName]: {
          name: reachableEnvName,
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
    localStorage.setItem('lastConnectedEnv', reachableEnvName)

    cy.visit('/')
    cy.contains('Connected to')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-newConnectionBtn"]').click()

    cy.get('[data-cy="CreateEnvironment-name"]').type(unreachableEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('unreachable-host', {
      force: true
    })
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').click()

    cy.contains('Connecting to Kuzzle')
    cy.get('[data-cy="App-offline"]')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(reachableEnvName)}"]`).click()

    cy.get('[data-cy="App-online"]')
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

  it('should display toast when environment list is malformed', () => {
    localStorage.setItem('environments', `{   Som3 m@l4rm3D CODEZ jayzon}}]}`)
    cy.visit('/')
    cy.contains('Ooops! Something went wrong while loading the connections.')
    cy.url().should('contain', 'create-connection')
  })
})
