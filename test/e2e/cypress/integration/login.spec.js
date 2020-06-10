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
    cy.get('[data-cy="NoAdminAlert-link"]').click()
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
})
