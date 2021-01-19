const fmt = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

const backendVersion = Cypress.env('BACKEND_VERSION') || 2
describe('Environments', function() {
  this.beforeEach(() => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    localStorage.removeItem('environments')
  })

  this.afterEach(() => {
    cy.request({
      method: 'PUT',
      url: 'http://localhost:7512/roles/anonymous',
      body: {
        controllers: {
          '*': {
            actions: {
              '*': true
            }
          }
        }
      }
    })
  })

  it('Should be able to create a new environment', function() {
    const newEnvName = 'local'
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-name"]').type(newEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`)
  })

  it('Should not be able to create an environment with the same name of an existing one', () => {
    const localEnvName = 'local'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [localEnvName]: {
          name: localEnvName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion,
          token: null
        }
      })
    )
    cy.visit('/')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy=EnvironmentSwitch-newConnectionBtn]').click()
    cy.get('[data-cy="CreateEnvironment-name"]').type(localEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.get('#input-env-name-feedback')
      .should('be.visible')
      .should('contain', `An environment with the same name already exists`)
  })

  it('Should render a visual feedback and prevent submitting when input is not valid', () => {
    cy.visit('/create-connection/')
    cy.get('[data-cy="CreateEnvironment-name"]').type(' ', {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-name--group"]').should(
      'contain',
      'You must enter a non-empty environment name'
    )

    cy.get('[data-cy="CreateEnvironment-host"]').type(' ', {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host--group"]').should(
      'contain',
      'You must enter a non-empty host name'
    )

    cy.get('[data-cy="CreateEnvironment-host"]').type(
      '{selectall}invalid host ',
      {
        force: true
      }
    )
    cy.get('[data-cy="CreateEnvironment-host--group"]').should(
      'contain',
      'Must be a valid host name'
    )

    cy.get('[data-cy=CreateEnvironment-port]').type('{selectall} tralala')
    cy.get(
      '[data-cy="CreateEnvironment-port--group"] .invalid-feedback'
    ).should('not.exist')

    cy.get('[data-cy=Environment-SubmitButton]').click()
    cy.get('[data-cy="CreateEnvironment-backendVersion--group"]').should(
      'contain',
      'You must select a backend version'
    )
    cy.url().should('contain', '/create-connection/')
  })

  it('Should be able to delete environments', function() {
    const envNames = ['local', 'another']
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envNames[0]]: {
          name: envNames[0],
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion || 2,
          token: null
        },
        [envNames[1]]: {
          name: envNames[1],
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion || 2,
          token: null
        }
      })
    )
    localStorage.setItem('currentEnv', envNames[0])
    cy.visit('/')
    cy.contains('Connected to')
    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(`[data-cy="EnvironmentSwitch-env_${envNames[0]}-delete"]`).click({
      force: true
    })

    cy.get('[data-cy="EnvironmentDeleteModal-envName"]').type(envNames[0])
    cy.get('[data-cy="EnvironmentDeleteModal-submit"]').click({ force: true })
    cy.contains('Please select a Kuzzle instance to connect to')

    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(`[data-cy="EnvironmentSwitch-env_${envNames[1]}-delete"]`).click({
      force: true
    })
    cy.get('[data-cy="EnvironmentDeleteModal-envName"]').type(envNames[1])
    cy.get('[data-cy="EnvironmentDeleteModal-submit"]').click({ force: true })

    cy.contains('Create a Connection')
  })

  it('Should be able to set the color of an environment', function() {
    const envName = 'local'
    cy.visit('/')
    cy.get('[data-cy="CreateEnvironment-name"]').type(envName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvColor--green"]')
      .as('colorEl')
      .click()

    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.wait(500)
    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(
      `[data-cy=EnvironmentSwitch-env_local] > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })
    cy.wait(1000)
    localStorage.setItem('currentEnv', envName)
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()

    cy.get('nav').should($nav => {
      expect($nav.attr('class')).to.contain('EnvColor--green')
    })
  })

  it('Should be able to create an unreachable environment and switch back to the reachable one', function() {
    const reachableEnvName = 'reachable'
    const unreachableEnvName = 'unreachable'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [reachableEnvName]: {
          name: reachableEnvName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion,
          token: null
        }
      })
    )
    localStorage.setItem('currentEnv', reachableEnvName)

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
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').click()

    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(
      `[data-cy=EnvironmentSwitch-env_${fmt(
        unreachableEnvName
      )}] > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })

    cy.contains('Connecting to Kuzzle')
    cy.get('[data-cy="App-offline"]')
    cy.wait(2000)

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(
      `[data-cy="EnvironmentSwitch-env_${fmt(
        reachableEnvName
      )}"]  > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })

    cy.get('[data-cy="App-online"]')
  })

  it('Should be able to update an environment', () => {
    const envNames = ['local', 'another']
    const hosts = ['localhost', '123.123.123.123']
    const ports = [7512, 7514]
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envNames[0]]: {
          name: envNames[0],
          color: 'darkblue',
          host: hosts[0],
          ssl: false,
          port: ports[0],
          backendMajorVersion: backendVersion,
          token: null
        }
      })
    )
    localStorage.setItem('currentEnv', envNames[0])
    cy.visit('/')
    cy.contains('Connected to')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[0])}-edit"]`).click()

    cy.get('[data-cy=CreateEnvironment-name]').type(`{selectall}${envNames[1]}`)
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.wait(1000)
    cy.get('[data-cy="EnvironmentSwitch"]')
      .should('be.visible')
      .click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[1])}`)

    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[1])}-edit`).click()
    cy.get('[data-cy=CreateEnvironment-host]').type(`{selectall}${hosts[1]}`)
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.contains('Connecting to Kuzzle at')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[1])}-edit`).click()
    cy.get('[data-cy=CreateEnvironment-host]').type(`{selectall}${hosts[0]}`)
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.contains('Connected to')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[1])}-edit`).click()
    cy.get('[data-cy=CreateEnvironment-port]').type(`{selectall}${ports[1]}`)
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.contains('Connecting to Kuzzle at')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(envNames[1])}-edit`).click()
    cy.get('[data-cy=CreateEnvironment-port]').type(`{selectall}${ports[0]}`)
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.contains('Connected to')
  })

  it('Should open edit modal when an environment is malformed', () => {
    localStorage.setItem(
      'environments',
      JSON.stringify({
        ['malformedEnv']: {
          name: 'malformedEnv',
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
          // missing backendMajorVersion
        }
      })
    )
    cy.visit('/')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-env_malformedEnv"]').click()

    cy.contains('Update Connection')
    cy.get('[data-cy="CreateEnvironment-backendVersion"]').should($select => {
      expect($select.attr('class')).to.contain('is-invalid')
    })
  })

  it('Should display a spinner when connecting to an unavailable backend and connect automatically whe the backend is up', () => {
    cy.initLocalEnv(backendVersion)
    cy.task('doco', { version: backendVersion, docoArgs: ['down'] })
    cy.wait(5000)
    cy.visit('/')
    cy.get('[data-cy=App-offline]')
      .should('be.visible')
      .should('contain', 'Connecting to Kuzzle')
    cy.task('doco', { version: backendVersion, docoArgs: ['up'] })
    cy.waitForService('http://localhost:7512')
    cy.get('[data-cy=App-online]').should('be.visible')
  })

  it('Should display a toast when the backend goes down and hide it when the backend goes up again', () => {
    cy.initLocalEnv(backendVersion)
    cy.task('doco', { version: backendVersion, docoArgs: ['up'] })
    cy.waitForService('http://localhost:7512')
    cy.visit('/')
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.task('doco', { version: backendVersion, docoArgs: ['down'] })
    cy.wait(3000)
    cy.get('.toast-header')
      .should('be.visible')
      .should('contain', 'Offline')
    cy.task('doco', { version: backendVersion, docoArgs: ['up'] })
    cy.waitForService('http://localhost:7512')
    cy.get('.toast-header').should('not.exist')
  })

  it('Should see an error when specifying the wrong backend version and should be able to fix it', () => {
    const wrongBackendVersion = backendVersion === 2 ? 1 : 2
    cy.initLocalEnv(wrongBackendVersion)
    cy.visit('/')
    cy.get('[data-cy=App-connectionError]')
      .should('be.visible')
      .should('contain', 'Incompatible SDK client.')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_valid-edit"]`).click()
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.contains('Connected to')
  })

  it('Should redirect to the edit environment page when the app opens and the current environment is malformed', () => {
    const envName = 'malformed'
    const backendVersion = Cypress.env('BACKEND_VERSION') || 2
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envName]: {
          name: envName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512
        }
      })
    )
    localStorage.setItem('currentEnv', envName)
    cy.visit('/')
    cy.contains('Edit a Connection')
    cy.contains('You must select a backend version')
    cy.url().should('contain', `/#/edit-connection/${envName}`)
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy=Environment-SubmitButton]').click()

    cy.url().should('contain', 'login')
  })

  it('Should be able to set the tab title of an environment', function() {
    const envName = 'localEnvTestTabTitle'
    cy.visit('/')
    cy.get('[data-cy="CreateEnvironment-name"]').type(envName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvColor--green"]')
      .as('colorEl')
      .click()

    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.wait(500)
    cy.get('[data-cy="EnvironmentSwitch"]').click()

    cy.get(
      `[data-cy=EnvironmentSwitch-env_localEnvTestTabTitle] > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })
    cy.wait(1000)
    localStorage.setItem('currentEnv', 'localEnvTestTabTitle')
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()

    cy.title().should('eq', 'localEnvTestTabTitle')
  })
})

describe('Import and export environments', () => {
  it('Should be able to import environments', function() {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-import"]').click()
    cy.contains('Import Connection')

    cy.get('[data-cy="EnvironmentImport-fileInput"]')
      .attachFile(
        {
          filePath: 'environment.json',
          mimeType: 'application/json'
        },
        { subjectType: 'input', force: true }
      )
      .trigger('change')
    cy.get('[data-cy=EnvironmentImport-ok]')
      .should('exist')
      .should('contain', 'Found 2 connections')
    cy.get('[data-cy=EnvironmentImport-submitBtn]').click()

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy=EnvironmentSwitch-env_localhost]').should('exist')
    cy.get('[data-cy=EnvironmentSwitch-env_uat]').should('exist')
    cy.get(
      '[data-cy=EnvironmentSwitch-env_uat] .fa-exclamation-triangle'
    ).should('exist')
  })

  it('Should display an error when trying to import a file with the wrong extension', () => {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-import"]').click()
    cy.contains('Import Connection')

    cy.get('[data-cy="EnvironmentImport-fileInput"]')
      .attachFile(
        {
          filePath: 'image.jpg',
          mimeType: 'image/jpeg'
        },
        { subjectType: 'input', force: true }
      )
      .trigger('change')
    cy.get('[data-cy=EnvironmentImport-err]')
      .should('exist')
      .should('contain', 'Uploaded file type (image/jpeg) is not supported.')
  })

  it('Should be able to export environments', function() {
    const newEnvName = 'exportedEnv'
    const secondEnvName = 'secondExportedEnv'
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-name"]').type(newEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`)

    cy.get(`[data-cy="EnvironmentSwitch"]`).click()
    cy.get(`[data-cy="EnvironmentSwitch-newConnectionBtn"]`).click()

    cy.get('[data-cy="CreateEnvironment-name"]').type(secondEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.get('[data-cy=CreateEnvironment-backendVersion]').select(
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(secondEnvName)}"]`)

    // test filename
    cy.get('[data-cy="export-environments"]').should(
      'have.attr',
      'download',
      `connections.json`
    )

    // test file content
    cy.get('[data-cy="export-environments"]')
      .then(
        anchor =>
          new Cypress.Promise(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', anchor.prop('href'), true)
            xhr.responseType = 'blob'
            xhr.onload = () => {
              if (xhr.status === 200) {
                const blob = xhr.response
                const reader = new FileReader()
                reader.onload = () => {
                  resolve(reader.result)
                }
                reader.readAsText(blob)
              }
            }
            xhr.send()
          })
      )
      .should(
        'equal',
        `{"${newEnvName}":{"name":"${newEnvName}","color":"darkblue","host":"localhost","port":7512,"ssl":false,"backendMajorVersion":${backendVersion}},"${secondEnvName}":{"name":"${secondEnvName}","color":"darkblue","host":"localhost","port":7512,"ssl":false,"backendMajorVersion":${backendVersion}}}`
      )
  })

  it('Should be able to switch to a reachable environment without lazy loading sequence error', function() {
    localStorage.setItem(
      'environments',
      JSON.stringify({
        ['env1']: {
          name: 'env1',
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion,
          token: null
        }
      })
    )

    cy.request({
      method: 'PUT',
      url: 'http://localhost:7512/roles/anonymous',
      body: {
        controllers: {
          '*': {
            actions: {
              '*': true
            }
          },
          index: {
            actions: {
              list: false
            }
          }
        }
      }
    })

    cy.visit('/')

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-env_env1"]').click()
    cy.wait(1000)
    cy.get('body')
      .contains('Something went wrong while fetching the indexes list.')
      .should('not.visible')
  })
})
