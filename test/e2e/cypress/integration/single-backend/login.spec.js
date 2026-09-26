const admin = {
  username: 'admin',
  password: 'pass'
}
const validEnvName = 'valid'
describe('Login', function() {
  beforeEach(() => {
    cy.initLocalEnv(2, null)
    cy.setCookie('telemetry', 'false')
  })

  it('Should be able to login as anonymous', () => {
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
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
            backendMajorVersion: 2,
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
    cy.initLocalEnv(2, null, 7512, envName)
    cy.visit('/')
    cy.url().should('contain', '/#/login')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(`[data-cy="EnvironmentSwitch-env_${envName}"]`).click()
    cy.shouldStayOn('#/login')
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
            backendMajorVersion: 2,
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
      cy.url().should('contain', '/#/login')
    })
  })
})

describe('Telemetry', function() {
  // Aucune requête ne doit atteindre le vrai service : on bouchonne kepler et
  // on compte les appels.
  beforeEach(() => {
    cy.initLocalEnv(2, null)
    cy.intercept('POST', 'https://kepler.app.kuzzle.io/**', {
      statusCode: 200,
      body: {}
    }).as('telemetry')
  })

  // La console écrit le cookie avec `JSON.stringify` : `telemetry="false"`.
  // Un second cookie placé après lui est le cas d'un vrai navigateur.
  it('Should not send telemetry once disabled, even with other cookies', () => {
    cy.setCookie('telemetry', '"false"')
    cy.setCookie('other', 'value')
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
    cy.contains('Usage telemetry').should('not.exist')
    cy.get('@telemetry.all').should('have.length', 0)
  })

  it('Should send telemetry once accepted, even with other cookies', () => {
    cy.setCookie('telemetry', '"true"')
    cy.setCookie('other', 'value')
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
    cy.contains('Usage telemetry').should('not.exist')
    cy.wait('@telemetry')
  })

  // Le bandeau attend un choix : pas de croix pour le fermer sans répondre
  // (E-09). Répondre le retire.
  it('Should ask for a telemetry choice without a close button', () => {
    cy.clearCookie('telemetry')
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.contains('[data-slot="toast"]', 'Usage telemetry')
      .should('be.visible')
      .find('[data-slot="toast-close"]')
      .should('not.exist')
    cy.contains('[data-slot="toast"] button', 'Disable telemetry').click()
    cy.contains('Usage telemetry').should('not.exist')
  })

  // Le format qu'utilisent les specs : sans guillemets.
  it('Should not send telemetry when the cookie is a bare false', () => {
    cy.setCookie('telemetry', 'false')
    cy.visit('/')
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
    cy.get('@telemetry.all').should('have.length', 0)
  })
})

describe('No administrator warning', function() {
  // Masqué par défaut sur localhost (`NO_ADMIN_WARNING_HOSTS`) : on le
  // réactive sur la connexion, comme la capture C16.
  it('Should link to the signup page and explain its dismiss button', () => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')
    cy.initLocalEnv(2, 'anonymous').then(() => {
      const environments = JSON.parse(localStorage.getItem('environments'))
      environments.valid.hideAdminWarning = false
      localStorage.setItem('environments', JSON.stringify(environments))
    })
    cy.setCookie('telemetry', '"false"')
    cy.visit('/#/data')
    cy.contains('[data-slot="toast"]', 'Your Kuzzle has no administrator user')
      .as('toast')
      .should('be.visible')
    cy.get('@toast')
      .contains('a', 'that you create one.')
      .should('have.attr', 'href', '#/signup')
    cy.get('@toast')
      .contains('button', 'Ok, got it')
      .should('have.attr', 'title')
      .and('contain', "Don't show this toast again")
  })
})
