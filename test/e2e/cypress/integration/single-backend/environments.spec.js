const fmt = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

const backendVersion = 2
describe('Environments', function() {
  this.beforeEach(() => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    localStorage.removeItem('environments')
    cy.setCookie('telemetry', 'false')
    cy.goOnline();
  })

  this.afterEach(() => {
    cy.goOnline();
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    // La primitive `DropdownMenu` ne rend son panneau que lorsqu'il est
    // ouvert, là où `b-dropdown` gardait ses éléments dans le DOM en
    // permanence : la liste des connexions se lit menu ouvert.
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`).should('be.visible')
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
          token: null,
          hideAdminWarning: true
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.invalidFeedback('#env-name')
      .should('be.visible')
      .should('contain', `An environment with the same name already exists`)
  })

  it('Should render a visual feedback and prevent submitting when input is not valid', () => {
    cy.visit('/#/create-connection/')
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
    cy.invalidFeedback('[data-cy="CreateEnvironment-port--group"]').should('not.exist')

    cy.get('[data-cy=Environment-SubmitButton]').click()
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
          token: null,
          hideAdminWarning: true
        },
        [envNames[1]]: {
          name: envNames[1],
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion || 2,
          token: null,
          hideAdminWarning: true
        }
      })
    )
    sessionStorage.setItem('currentEnv', envNames[0])
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvColor--green"]')
      .as('colorEl')
      .click()

    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get('[data-cy="EnvironmentSwitch"]').should('be.visible').click()

    cy.get(
      `[data-cy=EnvironmentSwitch-env_local] > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })

    // `sessionStorage.setItem` hors d'un `cy.then()` s'exécute à l'évaluation du
    // corps du test, donc AVANT toutes les commandes ci-dessus — et non ici, où
    // il est écrit. On le remet dans la file pour qu'il s'applique bien après la
    // sélection de l'environnement.
    cy.then(() => {
      sessionStorage.setItem('currentEnv', envName)
    })

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
          token: null,
          hideAdminWarning: true
        }
      })
    )
    sessionStorage.setItem('currentEnv', reachableEnvName)

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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
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

    cy.contains('Something went wrong while connecting to Kuzzle')
    cy.get('[data-cy="App-connectionError"]')

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
          token: null,
          hideAdminWarning: true
          // missing backendMajorVersion
        }
      })
    )
    cy.visit('/')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-env_malformedEnv"]').click()

    cy.contains('Update Connection')
    // `is-invalid` était une classe Bootstrap posée par `b-form-select` ;
    // la primitive `Select` déclare l'état par `aria-invalid` (G-024).
    cy.get('[data-cy="CreateEnvironment-backendVersion"]').should(
      'have.attr',
      'aria-invalid',
      'true'
    )
  })

  it('Should display a toast when the backend goes down and hide it when the backend goes up again', { browser: '!firefox' }, () => {
    cy.initLocalEnv(backendVersion)
    cy.visit('/')
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.goOffline();
    cy.expectOfflineToast();
    cy.goOnline();
    cy.expectNoOfflineToast();
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy=EnvironmentCreateModal-submit]').click()
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.contains('Connected to')
  })

  it('Should redirect to the edit environment page when the app opens and the current environment is malformed', () => {
    const envName = 'malformed'
    const backendVersion = 2
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envName]: {
          name: envName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          hideAdminWarning: true
        }
      })
    )
    sessionStorage.setItem('currentEnv', envName)
    cy.visit('/')
    cy.contains('Edit a Connection')
    // `cy.contains('v2.x')` trouvait une <option> que `b-form-select` rendait
    // même fermée : l'environnement est malformé, il n'a justement pas de
    // version. L'assertion porte maintenant sur l'état réel du champ — aucune
    // version choisie, donc le placeholder (G-033).
    cy.get('[data-cy=CreateEnvironment-backendVersion]').should(
      'contain',
      'Select version'
    )
    cy.url().should('contain', `/#/edit-connection/${envName}`)
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvColor--green"]')
      .as('colorEl')
      .click()

    cy.get('[data-cy="Environment-SubmitButton"]').click()
    cy.get('[data-cy="EnvironmentSwitch"]').should('be.visible').click()

    cy.get(
      `[data-cy=EnvironmentSwitch-env_localEnvTestTabTitle] > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })

    // `sessionStorage.setItem` hors d'un `cy.then()` s'exécute à l'évaluation du
    // corps du test, donc AVANT toutes les commandes ci-dessus — et non ici, où
    // il est écrit. On le remet dans la file pour qu'il s'applique bien après la
    // sélection de l'environnement.
    cy.then(() => {
      sessionStorage.setItem('currentEnv', 'localEnvTestTabTitle')
    })

    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()

    cy.title().should('contain', 'localEnvTestTabTitle')
  })

})

describe('Import and export environments', function() {
  this.beforeEach(() => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    localStorage.removeItem('environments')
    cy.setCookie('telemetry', 'false')
  })

  it('Should be able to import environments', function() {
    cy.visit('/')
    cy.contains('Create a Connection')
    cy.get('[data-cy="CreateEnvironment-import"]').click()
    cy.contains('Import Connection')

    cy.get('[data-cy="EnvironmentImport-fileInput"]').selectFile('test/e2e/cypress/fixtures/environment.json', {
      force: true
    })
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

    cy.get('[data-cy="EnvironmentImport-fileInput"]').selectFile('test/e2e/cypress/fixtures/image.jpg', {
      force: true
    })
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
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="Environment-SubmitButton"]').click()

    cy.url().should('contain', 'login')
    cy.get(`[data-cy="EnvironmentSwitch"]`).click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(newEnvName)}"]`).should('be.visible')
    cy.get(`[data-cy="EnvironmentSwitch-newConnectionBtn"]`).click()

    cy.get('[data-cy="CreateEnvironment-name"]').type(secondEnvName, {
      force: true
    })
    cy.get('[data-cy="CreateEnvironment-host"]').type('localhost', {
      force: true
    })
    cy.selectOption(
      '[data-cy=CreateEnvironment-backendVersion]',
      `v${backendVersion}.x`
    )
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').click()
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${fmt(secondEnvName)}"]`).should('be.visible')

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
        `{"${newEnvName}":{"name":"${newEnvName}","color":"darkblue","host":"localhost","port":7512,"ssl":false,"backendMajorVersion":${backendVersion},"hideAdminWarning":true},"${secondEnvName}":{"name":"${secondEnvName}","color":"darkblue","host":"localhost","port":7512,"ssl":false,"backendMajorVersion":${backendVersion},"hideAdminWarning":true}}`
      )
  })
})
