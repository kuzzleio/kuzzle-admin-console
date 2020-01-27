describe('Watch', () => {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

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
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
  })

  it('Should properly set basic filter', () => {
    const firstName = 'Luca'
    cy.visit('/')
    cy.get('[data-cy=LoginAsAnonymous-Btn]').click()
    cy.get('.IndexesPage').should('be.visible')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.CollectionTabs--watch').click()
    cy.get('.QuickFilter-chipLabel').click()
    cy.get('.BasicFilter-andBlock .BasicFilter--key')
      .click()
      .type('firstName{downarrow}{enter}')
    cy.get('.BasicFilter-andBlock .BasicFilter--value')
      .click()
      .type(firstName)
    cy.get('.BasicFilter-submitBtn').click()

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Keylogger as a Service'
      }
    )

    cy.get('.Notification').should('not.exist')

    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/_create?refresh=wait_for`,
      {
        firstName: 'Luca',
        lastName: 'Marchesini',
        job: 'Blockchain as a Service'
      }
    )

    cy.get('.Notification').should('exist')
  })
})
