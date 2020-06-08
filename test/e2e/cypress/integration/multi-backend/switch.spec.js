describe('Skip between two backends', () => {
  beforeEach(() => {
    cy.task('doco', { version: '1', docoArgs: ['down'] })
    cy.task('doco', { version: '2', docoArgs: ['down'] })
    cy.wait(3000)
  })

  it.skip('Should raise doco task', () => {
    cy.task('doco', { version: '2', docoArgs: ['up'] })
    cy.task('doco', { version: '1', docoArgs: ['up'], port: '7513' })
    cy.pollingRequest('http://localhost:7513')
  })

  it('Should be able to switch between two backends v1', () => {
    const indexName = 'testindex'
    const backends = [
      {
        name: 'local',
        port: 7512
      },
      {
        name: 'another',
        port: 7513
      }
    ]

    backends.forEach(backend => {
      cy.task('doco', {
        version: '1',
        docoArgs: ['up'],
        port: backend.port,
        stackPrefix: backend.name
      })
      cy.pollingRequest(`http://localhost:${backend.port}`)
      cy.request(
        'POST',
        `http://localhost:${backend.port}/${indexName}${backend.name}/_create`
      )
    })
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [backends[0].name]: {
          name: backends[0].name,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: backends[0].port,
          backendMajorVersion: 1,
          token: 'anonymous'
        },
        [backends[1].name]: {
          name: backends[1].name,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: backends[1].port,
          backendMajorVersion: 1,
          token: 'anonymous'
        }
      })
    )
    localStorage.setItem('currentEnv', backends[0].name)

    cy.visit('/')
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.get(`[data-cy=IndexesPage-name--testindex${backends[0].name}]`).should(
      'be.visible'
    )
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get(
      `[data-cy="EnvironmentSwitch-env_${backends[1].name}"]  > .EnvironmentSwitch-env-name`
    ).click({
      force: true
    })
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.get(`[data-cy=IndexesPage-name--testindex${backends[1].name}]`).should(
      'be.visible'
    )

    backends.forEach(backend => {
      cy.task('doco', {
        version: '1',
        docoArgs: ['down'],
        port: backend.port,
        stackPrefix: backend.name
      })
      cy.wait(3000)
    })
  })
})
