describe('API Actions - query', function() {
  const kuzzleUrl = 'http://localhost:7512'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to perform a query', () => {
    const indexName = "testindex"
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": "${indexName}"`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-run-button-0"]').click()
    cy.get('.data-cy-api-actions-toast-header')

    cy.request('GET', `${kuzzleUrl}/${indexName}/_exists`)
    .should((response) => {
      expect(response.body.result).to.equals(true)
    })
  })

  it('Should display the query status and response', () => {
    const indexName = "testindex"
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.wait(500)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": "${indexName}"`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-run-button-0"]').click()

    cy.get('[data-cy="api-actions-response-status-0"]').should('contain', '200')
    cy.get('[data-cy="api-actions-response-JSONEditor-0"]')
    .should('contain', '"error": null')
    .should('contain', '"action": "create"')
    .should('contain', '"controller": "index"')
    .should('contain', '"collection": null')
    .should('contain', `"index": "${indexName}"`)
    .should('contain', '"status": 200')
  })

  it('Should get a success toast after run valid query', () => {
    const indexName = "testindex"
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": "${indexName}"`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-run-button-0"]').click()
    cy.get('.data-cy-api-actions-toast-header').should('contain', 'Success')
  })

  it('Should get an error toast after run valid inquery', () => {
    const indexName = "testindex"
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": null`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-run-button-0"]').click()
    cy.get('.data-cy-api-actions-toast-header').should('contain', 'Error')
  })

  it('Should be able to set query controller using input', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-controller-input-0"]').type("index")
    cy.get('[data-cy="api-actions-query-JSONEditor-0"]')
    .should('contain', '"controller": "index"')
  })
  it('Should be able to set query action using input', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-action-input-0"]').type("create")
    cy.get('[data-cy="api-actions-query-JSONEditor-0"]')
    .should('contain', '"action": "create"')
  })

  it('Should be able to get query controllers available as options', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('#controllersList option')
    .should('have.length.of.at.least', 1)
  })

  it('Should be able to get query actions available as options', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-controller-input-0"]').type("index")
    cy.get('#actionsList option')
    .should('have.length.of.at.least', 1)
  })

  it('Should not display options if user has no rights (publicApi/openapi)', () => {
    cy.waitOverlay()
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
          server: {
            actions: {
              publicApi: false,
              openapi: false
            }
          }
        }
      }
    })
    cy.visit(`/#/api-action`)
    cy.get('#controllersList option').should('have.length', 0)
    cy.get('#actionsList option').should('have.length', 0)
  })
})

describe('API Actions - tabs and save', function() {
  const kuzzleUrl = 'http://localhost:7512'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to open a new tab', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('ul[role="tablist"] li')
    .should('have.length', 1)
    cy.get('[data-cy="api-actions-tab-plus"]').click()
    cy.get('ul[role="tablist"] li')
    .should('have.length', 2)
  })

  it('Should persist query by tabs', () => {
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`tab0`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-tab-plus"]').click()
    cy.get('[data-cy="api-actions-query-JSONEditor-1"]')
    .should('not.contain', 'tab0')
    cy.get('[data-cy="api-actions-tab-0"]').click()
    cy.get('[data-cy="api-actions-query-JSONEditor-0"]')
    .should('contain', 'tab0')
  })

  it('Should be able to save a new query', () => {
    const queryName = "createIndexToto"
    const envName = "valid"
    cy.clearLocalStorage('storedQueries')
    cy.waitOverlay()
    cy.visit(`/#/api-action`)
    cy.get('[data-cy="api-actions-query-JSONEditor-0"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": "toto"`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-save-button-0"]').click()
    cy.get('[data-cy="api-actions-modal-name-input"]')
    .click({force: true})
    .clear({ force: true })
    .type(queryName)
    cy.get('[data-cy="api-actions-modal-ok-button"]').click()
    cy.get(`[data-cy="api-actions-saved-query-${queryName}"]`)
    cy.window().then(
      window => {
        const storedQueries = JSON.parse(window.localStorage.getItem('storedQueries'))
        const queryIdx = storedQueries[envName].findIndex(e => e.name === queryName);
        expect(queryIdx).to.equals(0)
        expect(storedQueries[envName][queryIdx].query.controller).to.equals("index")
        expect(storedQueries[envName][queryIdx].query.action).to.equals("create")
        expect(storedQueries[envName][queryIdx].query.index).to.equals("toto")
      }
   );
  })

  it('Should be able to open a saved query', () => {
    const envName = 'valid'
    const queryName = "createIndexToto"
    const storedQueries = {
      [envName]: [
        {"query":{"controller":"index","action":"create","index": "toto"},"name": queryName}
      ]
    }
    localStorage.setItem('storedQueries', JSON.stringify(storedQueries))
    cy.waitOverlay()
    cy.visit(`/#/api-action`)

    cy.get(`[data-cy="api-actions-saved-query-${queryName}"]`).click()
    cy.get('[data-cy="api-actions-query-JSONEditor-1"]')
    .should('contain', '"controller": "index"')
    .should('contain', '"action": "create"')
    .should('contain', '"index": "toto"')
  })

  it('Should be able to run a saved query', () => {
    const envName = 'valid'
    const queryName = "createIndexToto"
    const indexName = 'toto'
    const storedQueries = {
      [envName]: [
        {"query":{"controller":"index","action":"create","index": indexName},"name": queryName}
      ]
    }
    localStorage.setItem('storedQueries', JSON.stringify(storedQueries))
    cy.waitOverlay()
    cy.visit(`/#/api-action`)

    cy.get(`[data-cy="api-actions-saved-query-${queryName}"]`).click()
    cy.get('[data-cy="api-actions-run-button-1"]').click()
    cy.get('.data-cy-api-actions-toast-header')

    cy.request('GET', `${kuzzleUrl}/${indexName}/_exists`)
    .should((response) => {
      expect(response.body.result).to.equals(true)
    })
  })

  it('Should be able to edit a saved query', () => {
    const envName = 'valid'
    const queryName = "createIndexToto"
    const indexName = 'toto'
    const indexName2 = 'titi'
    const storedQueries = {
      [envName]: [
        {"query":{"controller":"index","action":"create","index": indexName},"name": queryName}
      ]
    }
    localStorage.setItem('storedQueries', JSON.stringify(storedQueries))
    cy.waitOverlay()
    cy.visit(`/#/api-action`)

    cy.get(`[data-cy="api-actions-saved-query-${queryName}"]`).click()

    cy.get('[data-cy="api-actions-query-JSONEditor-1"] textarea.ace_text-input')
    .click({ force: true })
    .clear({ force: true })
    .type(`{
"controller": "index",
"action": "create",
"index": "${indexName2}"`, {
      delay: 200,
      force: true
    })
    cy.get('[data-cy="api-actions-save-button-1"]').click()

    cy.window().then(
      window => {
        const storedQueries = JSON.parse(window.localStorage.getItem('storedQueries'))
        const queryIdx = storedQueries[envName].findIndex(e => e.name === queryName);
        expect(storedQueries[envName][queryIdx].query.index).to.equals(indexName2)
      }
   );
  })

  it('Should be able to persist saved queries by environment', () => {
    const envName = 'valid'
    const envName2 = 'valid2'
    const queryName = "createIndexToto"
    const queryName2 = "createIndexTiti"
    const indexName = 'toto'
    const indexName2 = 'titi'
    const backendVersion = Cypress.env('BACKEND_VERSION') || 2
    const storedQueries = {
      [envName]: [
        {"query":{"controller":"index","action":"create","index": indexName},"name": queryName}
      ],
      [envName2]: [
        {"query":{"controller":"index","action":"create","index": indexName2},"name": queryName2}
      ]
    }
    localStorage.setItem('storedQueries', JSON.stringify(storedQueries))
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envName]: {
          name: envName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion,
          token: null
        },
        [envName2]: {
          name: envName2,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          backendMajorVersion: backendVersion,
          token: null
        }
      })
    )
    cy.waitOverlay()
    cy.visit(`/#/login`)
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(
      `[data-cy="EnvironmentSwitch-env_${envName}"]  > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.visit(`/#/api-action`)
    cy.get(`[data-cy="api-actions-saved-query-${queryName}"]`)

    cy.visit(`/#/login`)
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(
      `[data-cy="EnvironmentSwitch-env_${envName2}"]  > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })
    cy.get('[data-cy="LoginAsAnonymous-Btn"]').click()
    cy.visit(`/#/api-action`)
    cy.get(`[data-cy="api-actions-saved-query-${queryName2}"]`)
  })
})
