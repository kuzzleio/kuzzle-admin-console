describe('Watch', () => {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'
  const filter = {
    equals: {
      firstName: 'Luca'
    }
  }

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        firstName: {
          type: 'text',
          fielddata: true,
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        job: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        lastName: {
          type: 'keyword',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        }
      }
    })

    // create environment
    const validEnvName = 'valid'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [validEnvName]: {
          name: validEnvName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: 'anonymous'
        }
      })
    )
    localStorage.setItem('currentEnv', validEnvName)
  })

  it('Should subscribe without filters and receive all notifications', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .should('contain', 'Subscribe')
      .click()
      .should('contain', 'Unsubscribe')

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      message: 'This is a notification'
    })

    cy.get('[data-cy="Notification"]').should(
      'contain',
      'Volatile notification'
    )

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      message: 'This is another notification'
    })

    cy.get('[data-cy="Notification"]').should('have.length', 2)
  })

  it('Should display last notification', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-subscribeBtn"]').click()

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      message: 'This is a notification'
    })

    cy.get('[data-cy="Watch-latestNotification"]').should(
      'contain',
      'This is a notification'
    )

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      message: 'This is another notification'
    })

    cy.get('[data-cy="Watch-latestNotification"]').should(
      'contain',
      'This is another notification'
    )
  })

  it('Should subscribe with filters and receive only matching notifications', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('#rawsearch .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"equals": {
"firstName": "Luca"`,
        {
          force: true
        }
      )
    cy.get('[data-cy="Watch-subscribeBtn"]').click()

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'Luca'
    })

    cy.get('[data-cy="Notification"]').should('have.length', 1)

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'Corona'
    })

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'virus'
    })

    cy.get('[data-cy="Notification"]').should('have.length', 1)
  })

  it.only('Should show the pill when filters are active but not visible', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('#rawsearch .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"equals": {
"firstName": "Luca"`,
        {
          force: true
        }
      )
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="Watch-filtersPill"]').should('be.visible')
  })

  it('Should properly clear notifications without unsubscribing', () => {})

  it('Should properly reset filters and unsubscribe without clearing the notifications', () => {})

  it('Should limit the number of displayed notifications', () => {})

  it('Should show a warning message when notifications are too frequent', () => {})
})
