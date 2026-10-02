const admin = {
  username: 'admin',
  password: 'pass'
}
const validEnvName = 'valid'
describe('Login', function() {
  beforeEach(() => {
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'), null)
    cy.setCookie('telemetry', 'false')
  })

  it('Should be able to login as anonymous', () => {
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
  })

  // Depuis la page de création du premier admin, « Login as Anonymous » mène à
  // Data sans recharger la page : `$router.go()` ne prend qu'un nombre, et
  // l'objet qu'il recevait valait un rechargement.
  it('Should login as anonymous from the signup page, without a reload', () => {
    cy.visit('/#/signup')
    cy.get('[data-cy="Signup-submitBtn"]')
    cy.window().then(win => {
      win.__signupPage = true
    })
    // Les deux boutons de la page portent `LoginAsAnonymous-Btn` : le libellé
    // désigne le bon.
    cy.contains('button', 'Login as Anonymous').click()
    cy.get('[data-cy="App-loggedIn"]')
    cy.url().should('contain', '/data')
    cy.window().its('__signupPage').should('equal', true)
  })

  it('Should be able to login as an existing user', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    cy.request('POST', 'http://localhost:7512/_createFirstAdmin', {
      content: {},
      credentials: {
        local: {
          username: admin.username,
          password: admin.password
        }
      }
    })

    cy.visit('/')
    cy.contains('Login')

    cy.get('[data-cy="Login-username"]').type(admin.username)
    cy.get('[data-cy="Login-password"]').type(admin.password)
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
  })

  it('Should be able to create the first administrator', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')

    cy.visit('/')
    cy.get('[data-cy="NoAdminWarning-link"]').click()
    cy.contains('Create an Admin Account')
    cy.get('[data-cy="Signup-username"]').type(admin.username)
    cy.get('[data-cy="Signup-password1"]').type(admin.password)
    cy.get('[data-cy="Signup-password2"]').type(admin.password)
    cy.get('[data-cy="Signup-submitBtn"]').click()
    cy.contains('Connected to')
    cy.get('[data-cy="Login-username"]').type(admin.username)
    cy.get('[data-cy="Login-password"]').type(admin.password)
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
  })

  it('Should be able to login without losing context when token expires', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')
    cy.request('POST', 'http://localhost:7512/_createFirstAdmin', {
      content: {},
      credentials: {
        local: {
          username: admin.username,
          password: admin.password
        }
      }
    })
    cy.request('POST', 'http://localhost:7512/_login/local', {
      username: admin.username,
      password: admin.password
    }).then(response => {
      expect(response.body.result).to.have.property('jwt')
      localStorage.setItem(
        'environments',
        JSON.stringify({
          [validEnvName]: {
            name: validEnvName,
            color: 'darkblue',
            host: 'localhost',
            ssl: false,
            port: 7512,
            backendMajorVersion: Cypress.env('BACKEND_VERSION') || 2,
            token: response.body.result.jwt
          }
        })
      )

      cy.visit('/')
      cy.contains('Indexes')
      cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')

      cy.get('[data-cy=IndexesPage-createBtn]').click()
      cy.get('[data-cy=CreateIndexModal-name]').type('newindex')
      cy.get('[data-cy=CreateIndexModal-createBtn]').click()
      cy.contains('Sorry, your session has expired')

      cy.get('[data-cy=LoginAsAnonymous-Btn]').click()
      cy.get('[data-cy=CreateIndexModal-createBtn]').click()
      cy.get('[data-cy=IndexesPage-name--newindex]').should('be.visible')
    })
  })

  it('Should be redirected to login when attempting to access the app without authentication', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    cy.visit('/')
    cy.url().should('contain', '/#/login')
    cy.visit('/#/data')
    cy.url().should('contain', '/#/login')
  })

  it('Should stay on the login page after selecting the same environment', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    const envName = 'local'
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'), null, 7512, envName)
    cy.visit('/')
    cy.url().should('contain', '/#/login')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${envName}"]`).click()
    cy.wait(700)
    cy.url().should('contain', '/#/login')
  })

  it('Should be able to disconnect from a token expired session', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    cy.request('POST', 'http://localhost:7512/admin/_resetDatabase')
    cy.request('POST', 'http://localhost:7512/_createFirstAdmin?_id=admin', {
      content: {},
      credentials: {
        local: {
          username: admin.username,
          password: admin.password
        }
      }
    })
    cy.request('POST', 'http://localhost:7512/_login/local', {
      username: admin.username,
      password: admin.password
    }).then(response => {
      expect(response.body.result).to.have.property('jwt')
      localStorage.setItem(
        'environments',
        JSON.stringify({
          [validEnvName]: {
            name: validEnvName,
            color: 'darkblue',
            host: 'localhost',
            ssl: false,
            port: 7512,
            backendMajorVersion: Cypress.env('BACKEND_VERSION') || 2,
            token: response.body.result.jwt
          }
        })
      )

      cy.visit('/')
      cy.contains('Indexes')
      cy.request(
        'DELETE',
        `http://localhost:7512/users/${admin.username}/tokens`
      )

      cy.get('[data-cy=MainMenu-logoutBtn]').click()
      cy.wait(700)
      cy.url().should('contain', '/#/login')
    })
  })
})

// Sessions OpenID. Le backend de test n'a pas de stratégie
// Keycloak : les requêtes du SDK sont relevées au niveau du WebSocket, et
// `auth:login` en stratégie `keycloak` y reçoit, si on la donne, une réponse
// avec les en-têtes voulus au lieu de partir vers Kuzzle.
const isKeycloakLogin = request =>
  request.controller === 'auth' && request.action === 'login' && request.strategy === 'keycloak'

const watchWebSocket = keycloakHeaders => ({
  onBeforeLoad(win) {
    win.__kuzzleRequests = []
    const send = win.WebSocket.prototype.send
    win.WebSocket.prototype.send = function(data) {
      let request
      try {
        request = JSON.parse(data)
      } catch {
        return send.call(this, data)
      }
      win.__kuzzleRequests.push(request)

      if (keycloakHeaders && isKeycloakLogin(request)) {
        setTimeout(() =>
          this.onmessage({
            data: JSON.stringify({
              room: request.requestId,
              requestId: request.requestId,
              status: 200,
              error: null,
              result: {},
              headers: keycloakHeaders
            })
          })
        )
        return
      }
      return send.call(this, data)
    }
  }
})

const storedEnv = win => JSON.parse(win.localStorage.getItem('environments'))[validEnvName]

describe('OpenID session', function() {
  beforeEach(() => {
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'), null)
    cy.setCookie('telemetry', 'false')
  })

  const loginWithKeycloak = () => {
    cy.get('[data-cy="Login-submitBtn-strategy"] button').click()
    cy.get('[data-cy="Login-submitBtn-strategy-keycloak"]').click()
  }

  it('Should not reopen the Keycloak session of another environment', () => {
    cy.then(() => {
      const environments = JSON.parse(localStorage.getItem('environments'))
      environments.other = {
        ...environments[validEnvName],
        name: 'other',
        openidSessionId: 'session-of-other'
      }
      localStorage.setItem('environments', JSON.stringify(environments))
    })
    cy.visit('/', watchWebSocket())
    cy.get('[data-cy="Login-username"]').should('be.visible')
    cy.window()
      .its('__kuzzleRequests')
      .should(requests => expect(requests.filter(isKeycloakLogin)).to.have.length(0))
  })

  // On ne sait pas à quel environnement l'ancienne clé appartenait : elle
  // est supprimée, pas reprise.
  it('Should drop the OpenID session key shared by all environments', () => {
    cy.then(() => localStorage.setItem('openid-sessionId', 'legacy-session'))
    cy.visit('/', watchWebSocket())
    cy.get('[data-cy="Login-username"]').should('be.visible')
    cy.window().should(win => {
      expect(win.localStorage.getItem('openid-sessionId')).to.equal(null)
      expect(storedEnv(win)).to.not.have.property('openidSessionId')
      expect(win.__kuzzleRequests.filter(isKeycloakLogin)).to.have.length(0)
    })
  })

  it('Should keep the Keycloak session in its environment', () => {
    cy.visit('/', watchWebSocket({ keycloak: 'session-of-valid', location: '/#/login' }))
    loginWithKeycloak()
    cy.window().should(win => {
      expect(storedEnv(win)).to.include({ openidSessionId: 'session-of-valid' })
      expect(win.localStorage.getItem('openid-sessionId')).to.equal(null)
    })
  })

  // Sans en-tête, la console écrivait `'undefined'` comme `sessionId` et
  // redirigeait vers `undefined`.
  it('Should display an error when Keycloak returns no session', () => {
    cy.visit('/', watchWebSocket({}))
    loginWithKeycloak()
    cy.get('.LoginForm-error').should('contain', 'did not return a session to open')
    cy.url().should('contain', '/#/login').and('not.contain', 'undefined')
    cy.window().should(win => expect(storedEnv(win).openidSessionId).to.equal(null))
  })
})
