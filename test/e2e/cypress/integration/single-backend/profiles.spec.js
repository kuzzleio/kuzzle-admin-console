const kuzzleUrl = 'http://localhost:7512'

describe('Profiles', () => {
  beforeEach(function() {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
    cy.setCookie('telemetry', 'false')
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
    cy.get('[data-cy=ProfileFilters-filterAppliedPill]').should('not.exist')

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

  it('Should be able to paginate profiles', () => {
    const profileId = 'dummy'
    for (let i = 0; i < 14; i++) {
      cy.request(
        'POST',
        `${kuzzleUrl}/profiles/${profileId}_${i}/_create?refresh=wait_for`,
        {
          policies: [{ roleId: 'default' }]
        }
      )
    }

    cy.visit('/#/security/profiles')
    cy.contains('Profiles')
    cy.get('[data-cy=ProfileItem]').should('have.length', 17)
    cy.get('[data-cy=perPageSelector]').select('10')
    cy.get('[data-cy=ProfileItem]').should('have.length', 10)
    cy.get(
      '[data-cy="ProfileManagement-pagination"] .page-link[aria-posinset="2"]'
    ).click()
    cy.get('[data-cy=ProfileItem]').should('have.length', 7)
    cy.url().should('contain', 'from=10')
  })

  it('Should be able to interact with the links of the page', () => {
    const profileId = 'anonymous'
    cy.visit('/#/security/profiles')
    cy.contains('Profiles')
    cy.get('[data-cy="ProfilesManagement-createBtn"]').click()
    cy.url().should('contain', 'security/profiles/create')

    cy.visit('/#/security/profiles')
    cy.contains('Profiles')

    cy.get(`[data-cy="ProfileListItem-update--${profileId}"]`).click()
    cy.url().should('contain', `security/profiles/${profileId}`)
  })

  it('Should render a visual feedback and prevent submitting when input is not valid', () => {
    cy.waitOverlay()
    cy.visit('/#/security/profiles/create')
    cy.contains('Create a new profile')

    cy.get('[data-cy="ProfileCreateOrUpdate-id"] input').type(' ', {
      force: true
    })

    cy.get('[data-cy="ProfileCreateOrUpdate-id"] .invalid-feedback').should(
      'contain',
      'This field cannot contain just whitespaces'
    )

    cy.get('[data-cy="ProfileCreateOrUpdate-id"] input').clear({ force: true })

    cy.get('[data-cy="ProfileCreateOrUpdate-id"] .invalid-feedback').should(
      'contain',
      'This field cannot be empty'
    )

    cy.get('[data-cy=ProfileCreateOrUpdate-createBtn]').click()
    cy.wait(1000)
    cy.location().should(location => {
      expect(location.hash).to.equal('#/security/profiles/create')
    })

    cy.get('[data-cy="ProfileCreateOrUpdate-id"] input').type(
      '{selectall}validprofile',
      {
        force: true
      }
    )

    cy.get('[data-cy="ProfileCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .clear({ force: true })
      .type(`SuM UNV4L1d jayZON Kood`)

    cy.get('[data-cy=ProfileCreateOrUpdate-createBtn]').click()
    cy.wait(1000)
    cy.location().should(location => {
      expect(location.hash).to.equal('#/security/profiles/create')
    })
  })

  it('Should be able to create a new profile', () => {
    const profileId = 'dummy'
    cy.waitOverlay()
    cy.visit('/#/security/profiles/create')
    cy.wait(2000)

    cy.get('[data-cy="ProfileCreateOrUpdate-id"]').type(profileId)

    cy.get('[data-cy="ProfileCreateOrUpdate-jsonEditor"] .ace_line').should(
      'be.visible'
    )

    cy.get('[data-cy="ProfileCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .clear({ force: true })
      .type(
        `{
"rateLimit": 100,
"policies": [{
"roleId": "default"`,
        {
          delay: 200,
          force: true
        }
      )
    cy.get('[data-cy="ProfileCreateOrUpdate-createBtn"]').click()
    cy.contains(profileId)
  })

  it('Should be able to update an existing profile', () => {
    const profileId = 'dummy'
    cy.request(
      'POST',
      `${kuzzleUrl}/profiles/${profileId}/_create?refresh=wait_for`,
      {
        policies: [{ roleId: 'default' }]
      }
    )
    cy.visit(`/#/security/profiles/${profileId}`)

    cy.get('[data-cy="ProfileCreateOrUpdate-jsonEditor"] .ace_line').should(
      'be.visible'
    )

    cy.get('[data-cy="ProfileCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .clear({ force: true })
      .type(
        `{selectall}{
"policies": [{
"roleId": "admin"`,
        {
          delay: 200,
          force: true
        }
      )
    cy.get('[data-cy="ProfileCreateOrUpdate-updateBtn"]').click()
    cy.url().should('not.contain', profileId)
    cy.contains(profileId)
    cy.wait(1000)
    cy.request('GET', `${kuzzleUrl}/profiles/${profileId}`).should(response => {
      expect(response.body.result._source).to.deep.include({
        policies: [{ roleId: 'admin' }]
      })
    })
  })
})
