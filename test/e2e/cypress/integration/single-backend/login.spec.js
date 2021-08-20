const admin = {
  username: 'admin',
  password: 'pass'
}
const validEnvName = 'valid'
describe('Login', function() {
  beforeEach(() => {
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'), null)
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
            backendMajorVersion: Cypress.env('BACKEND_VERSION') || '2',
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
            backendMajorVersion: Cypress.env('BACKEND_VERSION') || '2',
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
