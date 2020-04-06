const fmt = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

describe('Environments', function() {
  this.beforeEach(() => {
    localStorage.removeItem('environments')
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
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`)
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
          token: null
        },
        [envNames[1]]: {
          name: envNames[1],
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
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

    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(
      `[data-cy="EnvironmentSwitch-env_${fmt(
        reachableEnvName
      )}"]  > .EnvironmentSwitch-env-name`
    ).click()

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
    cy.get('[data-cy="EnvironmentSwitch"]').click()
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

  it('Should be able to import environments', () => {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-import"]').click({
      force: true
    })

    cy.fixture('environment.json').then(fileJson => {
      const blob = JSON.stringify(fileJson)

      // WTF insane logic to upload a JSON file LOL
      cy.get('input[type=file]').then(subject => {
        const el = subject[0]
        const testFile = new File([blob], 'environment.json', {
          type: 'application/json'
        })
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(testFile)
        el.files = dataTransfer.files

        const events = ['change']
        const eventPayload = {
          bubbles: true,
          cancelable: true,
          detail: dataTransfer
        }

        events.forEach(e => {
          const event = new CustomEvent(e, eventPayload)
          Object.assign(event, { dataTransfer })

          subject[0].dispatchEvent(event)
        })
      })

      cy.get('[data-cy="Environment-found"]').should(
        'contain',
        'Found 2 connections'
      )
      cy.wait(200)
      cy.get('[data-cy="EnvironmentImport-submitBtn"]').click()
      cy.contains('Select Kuzzle')
    })
  })

  it('Should display a toast when environment list is malformed', () => {
    localStorage.setItem('environments', `{   Som3 m@l4rm3D CODEZ jayzon}}]}`)
    cy.visit('/')
    cy.contains('Ooops! Something went wrong while loading the connections.')
    cy.url().should('contain', 'create-connection')
  })
})
