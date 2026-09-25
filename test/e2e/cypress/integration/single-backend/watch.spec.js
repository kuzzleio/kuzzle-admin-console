describe('Watch', () => {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
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

    cy.initLocalEnv()
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
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .click()
      // Le libellé ne bascule qu'une fois `realtime.subscribe()` résolue :
      // c'est le signal que la souscription est établie. Publier avant, c'est
      // publier dans le vide — le message part, personne ne l'écoute encore.
      .should('contain', 'Unsubscribe')

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
    cy.get('.ace_content .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"equals": {
"firstName": "Luca"`,
        {
          force: true
        }
      )
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .click()
      .should('contain', 'Unsubscribe')

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
    cy.get('[data-cy="Watch-subscribeBtn"]').should('contain', 'Unsubscribe')
  })

  it('Should show the pill when filters are active but not visible', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('.ace_content .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
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
    cy.get('[data-cy="Watch-filterAppliedPill"]').should('be.visible')
  })

  it('Should properly clear notifications without unsubscribing', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .click()
      .should('contain', 'Unsubscribe')

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'Luca'
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'Corona'
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'virus'
    })
    cy.get('[data-cy="Notification"]').should('have.length', 3)
    cy.get('[data-cy="Watch-clearNotifications"]').click()
    cy.get('[data-cy="Notification"]').should('have.length', 0)
  })

  it('Should properly reset filters and unsubscribe without clearing the notifications', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('.ace_content .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
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
    cy.get('[data-cy="Watch-filterAppliedPill"]').should('be.visible')
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .click()
      .should('contain', 'Unsubscribe')

    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_publish`, {
      firstName: 'Luca'
    })
    cy.get('[data-cy="Notification"]').should('have.length', 1)
    cy.get('[data-cy="Watch-resetBtn"]').click()
    cy.get('[data-cy="Notification"]').should('have.length', 1)
    cy.get('[data-cy=Watch-filtersPill]').should('not.exist')
  })

  it('Should limit the number of displayed notifications', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-subscribeBtn"]')
      .click()
      .should('contain', 'Unsubscribe')

    for (let i = 0; i < 60; i++) {
      cy.request(
        'POST',
        `${kuzzleUrl}/${indexName}/${collectionName}/_publish`,
        {
          firstName: 'Luca'
        }
      )
    }
    cy.get('[data-cy="Notification"]').should('have.length', 50)
    cy.get('[data-cy="Watch-alert"]')
      .should('be.visible')
      .should('contain', 'Older notifications are discarded')
  })

  it('Should not be able to subscribe when JSON filter contains errors', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('.ace_content .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"equals": {
"firstName": Luca`,
        {
          force: true
        }
      )
    cy.get('[data-cy="Watch-subscribeBtn"]').should('be.disabled')
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="Watch-filterErrorPill"]').should('be.visible')
  })

  it('Shoud remember JSON filter when it is toggled', () => {
    cy.visit(`/#/data/${indexName}/${collectionName}/watch`)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('[data-cy="JSONEditor"]').should('be.visible')
    cy.get('.ace_content .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
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

    // Le test vérifie que le filtre survit à un repli/dépli : il faut donc que
    // le repli soit effectif avant de redéplier, sinon on ne teste rien.
    // L'éditeur est retiré du DOM au repli, pas masqué — d'où `not.exist`.
    cy.get('[data-cy="JSONEditor"]').should('not.exist')

    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    cy.get('.ace_content').should('contain', '"firstName": "Luca"')
  })
})
