const kuzzleUrl = 'http://localhost:7512'

describe('Profiles', () => {
  beforeEach(function() {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
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

  it('Should be able to delete a profile', () => {
    const profileId = 'dummy'
    cy.request(
      'POST',
      `${kuzzleUrl}/profiles/${profileId}/_create?refresh=wait_for`,
      {
        policies: [{ roleId: 'default' }]
      }
    )
    cy.visit('/#/security/profiles')
    cy.contains('Profiles')
    cy.get(`[data-cy=ProfileListItem-delete--${profileId}]`).click()
    cy.get('[data-cy=ModalDeleteProfiles-submitBtn]').click()
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', profileId)
  })

  it('Should be able to filter profiles', () => {
    const profileId = 'dummy'
    cy.request(
      'POST',
      `${kuzzleUrl}/profiles/${profileId}/_create?refresh=wait_for`,
      {
        policies: [{ roleId: 'default' }]
      }
    )
    cy.visit('/#/security/profiles')
    cy.contains('Profiles')

    cy.get('[data-cy="ProfileFilters-roleSelect"] > button').click({
      force: true
    })
    cy.get('[data-cy="RoleSelect--default"]').click()
    cy.get('[data-cy=ProfileFilters-filterAppliedPill]').should('be.visible')
    cy.get('[data-cy="ProfileList-items"]').should('contain', profileId)
    cy.get('[data-cy="ProfileList-items"]').should('contain', 'default')
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', 'admin')
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', 'anonymous')

    cy.get('[data-cy="ProfileFilters-resetBtn"]').click()
    cy.get('[data-cy=ProfileFilters-filterAppliedPill]').should(
      'not.be.visible'
    )

    cy.get('[data-cy="ProfileFilters-roleSelect"] > button').click({
      force: true
    })
    cy.get('[data-cy="RoleSelect--anonymous"]').click()
    cy.get('[data-cy=ProfileFilters-filterAppliedPill]').should('be.visible')
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', profileId)
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', 'default')
    cy.get('[data-cy="ProfileList-items"]').should('not.contain', 'admin')
    cy.get('[data-cy="ProfileList-items"]').should('contain', 'anonymous')
  })
})
