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

// Gestion de session (ADR-0057). L'horloge de la page est remplacée par
// `cy.clock` pour `setInterval` et `Date` seulement : la surveillance du token
// tourne toutes les 20 s et rafraîchit à 30 s de l'expiration, et les tests
// avancent le temps au lieu de l'attendre. `setTimeout` reste réel : Vue, le
// SDK et les nouvelles tentatives du rafraîchissement s'en servent.
//
// Pas de grand saut par `cy.tick` : il ferait tourner d'un coup le heartbeat
// du SDK, qui croirait la connexion morte. On déplace l'heure
// (`setSystemTime`), puis on fait passer un seul tick de la surveillance.
describe('Session', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const clockedFunctions = ['setInterval', 'clearInterval', 'Date']
  const watchdogTick = 20 * 1000

  const envToken = win =>
    JSON.parse(win.localStorage.getItem('environments'))[validEnvName].token

  const createAdmin = () => {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/_createFirstAdmin`, {
      content: {},
      credentials: { local: admin }
    })
  }

  const loginAsAdmin = (expiresIn = '1h') =>
    cy
      .request('POST', `${kuzzleUrl}/_login/local?expiresIn=${expiresIn}`, admin)
      .then(({ body }) => body.result.jwt)

  // `/#/data` redirige vers la liste des index une fois chargée : une session
  // perdue pendant cette redirection renvoie à l'écran de connexion, par le
  // garde d'authentification, et non à la popup (G-084). On attend la page.
  const visitData = () => {
    cy.visit('/#/data')
    cy.get('[data-cy="App-loggedIn"]')
    cy.get('[data-cy="IndexesPage-createBtn"]').should('be.visible')
  }

  beforeEach(() => {
    cy.setCookie('telemetry', 'false')
    createAdmin()
  })

  it('Should refresh the token of a session opened with credentials', () => {
    cy.initLocalEnv(2, null)
    cy.clock(Date.now(), clockedFunctions)
    cy.visit('/')
    cy.get('[data-cy="Login-username"]').type(admin.username)
    cy.get('[data-cy="Login-password"]').type(admin.password)
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.get('[data-cy="App-loggedIn"]')

    cy.window().then(win => {
      const token = envToken(win)
      expect(token).to.be.a('string')

      // `doLogin` demande un token de 2 h : 25 s avant l'expiration, le tick
      // suivant de la surveillance doit le rafraîchir.
      cy.clock().then(clock => clock.setSystemTime(Date.now() + 2 * 60 * 60 * 1000 - 45 * 1000))
      cy.tick(watchdogTick)
      cy.window().should(w => expect(envToken(w)).to.not.equal(token))
    })
    cy.get('[data-cy="Modal-tokenExpired"]').should('not.exist')
  })

  it('Should ask to log in again, in place, when the token cannot be refreshed', () => {
    loginAsAdmin('40s').then(jwt => {
      cy.initLocalEnv(2, jwt)
      cy.clock(Date.now(), clockedFunctions)
      visitData()

      // L'utilisateur n'existe plus : le rafraîchissement échoue, sans que
      // Kuzzle ait prévenu la connexion (`_logout` l'aurait fait).
      cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
      cy.tick(watchdogTick)

      cy.get('[data-cy="Modal-tokenExpired"]', { timeout: 15000 }).should('be.visible')
      cy.url().should('contain', '/#/data')
    })
  })

  it('Should notice a revoked token when the tab comes back', () => {
    loginAsAdmin().then(jwt => {
      cy.initLocalEnv(2, jwt)
      visitData()

      // Même cas que ci-dessus, vu au retour sur l'onglet et non au tick.
      cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
      cy.document().then(doc => doc.dispatchEvent(new Event('visibilitychange')))

      cy.get('[data-cy="Modal-tokenExpired"]').should('be.visible')
      cy.url().should('contain', '/#/data')
    })
  })

  it('Should adopt a token refreshed by another tab', () => {
    loginAsAdmin().then(jwt => {
      cy.initLocalEnv(2, jwt)
      visitData()

      // Un autre onglet rafraîchit la session et écrit le nouveau token.
      // Kuzzle invalide l'ancien après son délai de grâce
      // (`security.jwt.gracePeriod`, 1 s) : sans adoption, la requête qui
      // suit partirait avec un token mort.
      //
      // Pas dans la seconde de l'émission : Kuzzle rendrait le même token,
      // et l'invaliderait avec « l'ancien » (G-093).
      cy.wait(1100)
      cy.request({
        method: 'POST',
        url: `${kuzzleUrl}/_refreshToken`,
        headers: { authorization: `Bearer ${jwt}` }
      }).then(({ body }) => {
        cy.window().then(win => {
          const environments = JSON.parse(win.localStorage.getItem('environments'))
          environments[validEnvName].token = body.result.jwt
          const newValue = JSON.stringify(environments)
          win.localStorage.setItem('environments', newValue)
          win.dispatchEvent(new win.StorageEvent('storage', { key: 'environments', newValue }))
        })
      })
      cy.wait(2000)

      cy.get('[data-cy="IndexesPage-createBtn"]').click()
      cy.get('[data-cy="CreateIndexModal-name"]').type('adoptedindex')
      cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
      cy.get('[data-cy="IndexesPage-name--adoptedindex"]').should('be.visible')
      cy.get('[data-cy="Modal-tokenExpired"]').should('not.exist')
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
