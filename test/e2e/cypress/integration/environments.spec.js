const fmt = require('../../../../src/utils').formatForDom
const hexrgb = require('hex-rgb')

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

  it('is able to delete an environment', function() {
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
    cy.get('.EnvironmentDeleteModal-submit').click()
    cy.contains('Create a Connection')
  })

  it('is able to set the color of an environment', function() {
    cy.visit('/')
    cy.get('.CreateEnvironment-name').type('local', {
      force: true
    })
    cy.get('.CreateEnvironment-host').type('localhost', {
      force: true
    })
    cy.get(`.CreateEnvironment-colorBtns div:nth-child(3) div.color`)
      .as('colorEl')
      .click()
    
    cy.wait(500)
    cy.get('.Environment-SubmitButton').click()
    cy.get('.LoginAsAnonymous-Btn').click()

    cy.get('.navbar-fixed > nav').should($nav => {
      const env = JSON.parse(localStorage.getItem('environments')).local
      const c = hexrgb(env.color)
      expect($nav.attr('style')).to.equal(
        `background-color: rgb(${c.red}, ${c.green}, ${c.blue});`
      )
    })
  })

  it('is able to create an invalid environment and switch back to the valid one', function() {
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

    cy.get('.CreateEnvironment-name').type(invalidEnvName, {
      force: true
    })
    cy.get('.CreateEnvironment-host').type('invalid-host', {
      force: true
    })
    cy.get('.Environment-SubmitButton').click()

    cy.contains('Kuzzle does not respond')

    cy.get('.EnvironmentsSwitch > .btn-flat').click()
    cy.get(`.EnvironmentsSwitch-env[data-env=env_${fmt(validEnvName)}]`).click()

    cy.get('.App-connected')
  })

  it('should import environment', () => {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('.CreateEnvironment-import').click({
      force: true
    })

    cy.fixture('environment.json').then(fileContent => {
      cy.get('input[type=file').upload(
        { fileContent, fileName:'environment.json', mimeType: 'application/json' },
        { subjectType: 'input' })
    })
  })
})
