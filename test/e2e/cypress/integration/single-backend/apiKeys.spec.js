// Clés d'API (ADR-0070) : celles d'un utilisateur, par `security`, et les
// siennes, par `auth`. Le jeton n'est montré qu'une fois et ne doit rester
// nulle part : la spec vérifie aussi qu'il authentifie, puis plus après la
// révocation.
describe('API keys', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const password = 'test'

  const createUser = (kuid, profileIds = ['default']) =>
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: { profileIds },
      credentials: { local: { username: kuid, password } }
    })

  const createApiKey = (kuid, description, expiresIn = -1) =>
    cy
      .request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/api-keys/_create?refresh=wait_for&expiresIn=${expiresIn}`,
        { description }
      )
      .then(({ body }) => body.result)

  const whoAmI = token =>
    cy.request({
      url: `${kuzzleUrl}/_me`,
      headers: { authorization: `Bearer ${token}` },
      failOnStatusCode: false
    })

  const loginAs = kuid =>
    cy
      .request('POST', `${kuzzleUrl}/_login/local`, { username: kuid, password })
      .then(({ body }) => cy.initLocalEnv(2, body.result.jwt))

  beforeEach(function() {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.initLocalEnv()
    cy.setCookie('telemetry', 'false')
  })

  it('Should create an API key for a user, and show its token only once', () => {
    createUser('dummy')
    cy.visit('/#/security/users')
    cy.get('[data-cy="UserListItem-apiKeys--dummy"]').click()
    cy.get('[data-cy="UserApiKeys-kuid"]').should('contain', 'dummy')
    cy.get('[data-cy="ApiKeyList-empty"]').should('be.visible')

    cy.get('[data-cy="ApiKeyList-createBtn"]').click()
    cy.get('[data-cy="CreateApiKey-expiration"]').should('contain', '90 days')
    cy.get('[data-cy="CreateApiKey-submit"]').click()
    cy.invalidFeedback('[data-cy="CreateApiKey"]').should(
      'contain',
      'A description is required'
    )
    cy.get('[data-cy="CreateApiKey-description"]').type('CI deploy')
    cy.get('[data-cy="CreateApiKey-submit"]').click()

    cy.get('[data-cy="CreateApiKey-token"]')
      .invoke('text')
      .then(text => {
        const token = text.trim()
        expect(token).to.match(/^kapikey-/)

        // Ni Échap, ni la croix : le jeton reste à l'écran jusqu'au bouton.
        cy.get('body').type('{esc}')
        cy.get('[data-cy="CreateApiKey-token"]').should('be.visible')
        cy.get('[data-cy="CreateApiKey"] [data-slot="dialog-close"]').should('not.exist')
        cy.get('[data-cy="CreateApiKey-done"]').click()
        cy.get('[data-cy="CreateApiKey"]').should('not.exist')

        cy.get('[data-cy="ApiKeyList-table"]')
          .should('contain', 'CI deploy')
          .and('contain', 'in 3 months')
          .and('not.contain', token)
        cy.window().then(win => {
          const stored = JSON.stringify({ ...win.localStorage }) + JSON.stringify({ ...win.sessionStorage })
          expect(stored).not.to.contain(token)
        })

        whoAmI(token).its('body.result._id').should('equal', 'dummy')
      })
  })

  it('Should warn about a key without expiration', () => {
    createUser('dummy')
    cy.visit('/#/security/users/dummy/api-keys')
    cy.get('[data-cy="ApiKeyList-createBtn"]').click()
    cy.get('[data-cy="CreateApiKey-noExpirationWarning"]').should('not.exist')
    cy.selectOption('[data-cy="CreateApiKey-expiration"]', 'No expiration')
    cy.get('[data-cy="CreateApiKey-noExpirationWarning"]').should('be.visible')
    cy.get('[data-cy="CreateApiKey-description"]').type('forever')
    cy.get('[data-cy="CreateApiKey-submit"]').click()
    cy.get('[data-cy="CreateApiKey-done"]').click()
    cy.get('[data-cy="ApiKeyList-expiration"]').should('contain', 'Never')
  })

  it('Should list expired keys, and filter by description', () => {
    createUser('dummy')
    createApiKey('dummy', 'short-lived', '1s')
    createApiKey('dummy', 'long-lived', '30d')
    cy.wait(1500)
    cy.visit('/#/security/users/dummy/api-keys')
    cy.contains('[data-cy="ApiKeyList-table"] tr', 'short-lived').should('contain', 'Expired')
    cy.contains('[data-cy="ApiKeyList-table"] tr', 'long-lived').should('not.contain', 'Expired')

    cy.get('[data-cy="ApiKeyList-filter"]').type('long')
    cy.get('[data-cy="ApiKeyList-table"]')
      .should('contain', 'long-lived')
      .and('not.contain', 'short-lived')
    cy.get('[data-cy="ApiKeyList-filter"]').clear().type('nothing like this')
    cy.get('[data-cy="ApiKeyList-noMatch"]').should('be.visible')
  })

  it('Should revoke an API key', () => {
    createUser('dummy')
    createApiKey('dummy', 'to revoke').then(({ _id, _source }) => {
      whoAmI(_source.token).its('status').should('equal', 200)

      cy.visit('/#/security/users/dummy')
      cy.get('[data-cy="UserUpdate-apiKeys"]').click()
      cy.get(`[data-cy="ApiKeyList-revoke--${_id}"]`).click()
      cy.get('[data-cy="RevokeApiKey"]').should('contain', 'to revoke')
      cy.get('[data-cy="RevokeApiKey-submit"]').click()
      cy.get('[data-cy="RevokeApiKey"]').should('not.exist')
      cy.get('[data-cy="ApiKeyList-empty"]').should('be.visible')

      whoAmI(_source.token).its('status').should('equal', 401)
    })
  })

  it('Should manage my own API keys from the session menu', () => {
    createUser('dummy', ['admin'])
    loginAs('dummy')
    cy.visit('/')
    cy.get('[data-cy="SessionBar-user"]').click()
    cy.get('[data-cy="SessionBar-myApiKeys"]').click()
    cy.url().should('contain', '/api-keys')

    cy.get('[data-cy="ApiKeyList-createBtn"]').click()
    cy.get('[data-cy="CreateApiKey-description"]').type('my script')
    cy.get('[data-cy="CreateApiKey-submit"]').click()
    cy.get('[data-cy="CreateApiKey-token"]')
      .invoke('text')
      .then(text => {
        cy.get('[data-cy="CreateApiKey-done"]').click()
        cy.get('[data-cy="ApiKeyList-table"]').should('contain', 'my script')
        whoAmI(text.trim()).its('body.result._id').should('equal', 'dummy')
      })
  })

  it('Should not offer API keys to a user who is not allowed to manage them', () => {
    cy.request('PUT', `${kuzzleUrl}/roles/apiKeysLess?refresh=wait_for`, {
      controllers: {
        auth: { actions: { '*': true, createApiKey: false, searchApiKeys: false, deleteApiKey: false } },
        server: { actions: { '*': true } },
        index: { actions: { list: true } },
        security: { actions: { searchUsers: true, getUser: true, getUserMapping: true } }
      }
    })
    cy.request('PUT', `${kuzzleUrl}/profiles/apiKeysLess?refresh=wait_for`, {
      policies: [{ roleId: 'apiKeysLess' }]
    })
    createUser('limited', ['apiKeysLess'])
    loginAs('limited')

    cy.visit('/#/security/users')
    cy.get('[data-cy="UserList-items"]').should('contain', 'limited')
    cy.get('[data-cy="UserListItem-apiKeys--limited"]').should('not.exist')
    cy.get('[data-cy="SessionBar-user"]').click()
    cy.get('[data-cy="SessionBar-logoutBtn"]').should('be.visible')
    cy.get('[data-cy="SessionBar-myApiKeys"]').should('not.exist')
    cy.get('body').type('{esc}')

    cy.visit('/#/security/users/limited/api-keys')
    cy.contains('You are not allowed to access this list')
  })

  it('Should not offer my API keys to an anonymous session', () => {
    cy.visit('/')
    cy.get('[data-cy="SessionBar-user"]').click()
    cy.get('[data-cy="SessionBar-logoutBtn"]').should('be.visible')
    cy.get('[data-cy="SessionBar-myApiKeys"]').should('not.exist')
  })
})
