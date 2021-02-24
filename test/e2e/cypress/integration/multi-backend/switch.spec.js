describe('Switch between two backends', () => {
  beforeEach(() => {
    cy.task('doco', { version: '1', docoArgs: ['down'] })
    cy.task('doco', { version: '2', docoArgs: ['down'] })
    cy.wait(3000)
  })

  function switchBackend(backends) {
    const indexName = 'testindex'

    backends.forEach(backend => {
      cy.task('doco', {
        version: backend.version,
        docoArgs: ['up', '-d'],
        port: backend.port,
        stackPrefix: backend.name
      })
      cy.waitForService(`http://localhost:${backend.port}`)
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
          backendMajorVersion: backends[0].version,
          token: 'anonymous'
        },
        [backends[1].name]: {
          name: backends[1].name,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: backends[1].port,
          backendMajorVersion: backends[1].version,
          token: 'anonymous'
        }
      })
    )
    localStorage.setItem('currentEnv', backends[0].name)

    cy.visit('/')
    cy.wait(5000)
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

    cy.wait(5000)
    cy.get('[data-cy=App-online]').should('be.visible')
    cy.get(`[data-cy=IndexesPage-name--testindex${backends[1].name}]`).should(
      'be.visible'
    )

    backends.forEach(backend => {
      cy.task('doco', {
        version: backend.version,
        docoArgs: ['down'],
        port: backend.port,
        stackPrefix: backend.name
      })
      cy.waitForService(`http://localhost:${backend.port}`, 'down')
    })
  }
  it('Should be able to switch between two backends v1', () => {
    const backends = [
      {
        name: 'local',
        port: 7512,
        version: 1
      },
      {
        name: 'another',
        port: 7513,
        version: 1
      }
    ]
    switchBackend(backends)
  })
  it('Should be able to switch between two backends v2', () => {
    const backends = [
      {
        name: 'local',
        port: 7512,
        version: 2
      },
      {
        name: 'another',
        port: 7513,
        version: 2
      }
    ]
    switchBackend(backends)
  })
  it('Should be able to switch between two backends of different versions', () => {
    const backends = [
      {
        name: 'local',
        port: 7512,
        version: 1
      },
      {
        name: 'another',
        port: 7513,
        version: 2
      }
    ]
    switchBackend(backends)
  })
})
