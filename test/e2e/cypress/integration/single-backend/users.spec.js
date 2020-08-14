describe('Users', function() {
  const kuzzleUrl = 'http://localhost:7512'

  before(function() {
    cy.request('PUT', `${kuzzleUrl}/users/_mapping`, {
      properties: {
        name: { type: 'text' }
      }
    })
  })

  beforeEach(function() {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('Should be able to search users via the quick search', () => {
    const kuids = ['dummy', 'goofy']
    kuids.forEach(kuid => {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (${kuid})`
          },
          credentials: {
            local: {
              username: kuid,
              password: 'test'
            }
          }
        }
      )
    })
    cy.visit('/#/security/users')
    cy.contains(kuids[0])
    cy.contains(kuids[1])
    cy.get('[data-cy=QuickFilter-input]').type(kuids[1])
    cy.wait(1000)
    cy.get('[data-cy="UserList-items"').should('contain', kuids[1])
    cy.get('[data-cy="UserList-items"').should('not.contain', kuids[0])
  })

  it('Should be able to search users via the advanced search', () => {
    const kuids = ['dummy', 'goofy']
    kuids.forEach(kuid => {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (${kuid})`
          },
          credentials: {
            local: {
              username: kuid,
              password: 'test'
            }
          }
        }
      )
    })
    cy.visit('/#/security/users')
    cy.contains(kuids[0])
    cy.contains(kuids[1])
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-basicTab]').click()
    cy.get('[data-cy="BasicFilter-attributeSelect--0.0"]').select('name')
    cy.get('[data-cy="BasicFilter-valueInput--0.0"]').type(kuids[1])
    cy.get('[data-cy=BasicFilter-submitBtn]').click()
    cy.contains(kuids[1])
    cy.get('[data-cy="UserList-items"').should('not.contain', kuids[0])
  })

  it('Should be able to search users via the raw JSON search', () => {
    const kuids = ['dummy', 'goofy']
    kuids.forEach(kuid => {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (${kuid})`
          },
          credentials: {
            local: {
              username: kuid,
              password: 'test'
            }
          }
        }
      )
    })
    cy.visit('/#/security/users')
    cy.contains(kuids[0])
    cy.contains(kuids[1])
    cy.get('[data-cy=QuickFilter-optionBtn]').click()
    cy.get('[data-cy=Filters-rawTab]').click()

    cy.get('#rawsearch .ace_line').should('be.visible')
    cy.wait(1000)

    cy.get('#rawsearch .ace_line').click({ force: true })
    cy.get('textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"query": { 
"bool": {
"must": {
"match_phrase_prefix": {
"name": "Dummy User (${kuids[1]})"{downarrow}{downarrow}{downarrow}{downarrow}
}`,
        {
          force: true
        }
      )

    cy.get('[data-cy="RawFilter-submitBtn"]').click()

    cy.contains(kuids[1])
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuids[0])
  })

  it('Should be able to delete a user', function() {
    const kuid = 'dummy'
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: {
        profileIds: ['default'],
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })
    cy.visit('/#/security/users')

    cy.contains(kuid)
    cy.get(`[data-cy=UserListItem-delete--${kuid}]`).click()

    cy.contains(`Do you really want to delete ${kuid}`)
    cy.get('[data-cy=ModalDeleteUsers-submitBtn]').click()

    cy.wait(2000)
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuid)
    cy.contains('No user is defined')
  })

  it('Should be able to bulk delete users via the checkbox and bulk button', function() {
    const kuids = ['dummy', 'goofy']
    kuids.forEach(kuid => {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (${kuid})`
          },
          credentials: {
            local: {
              username: kuid,
              password: 'test'
            }
          }
        }
      )
    })
    cy.visit('/#/security/users')
    cy.contains(kuids[0])
    cy.contains(kuids[1])
    cy.get(`[data-cy="UserListItem-checkbox--${kuids[0]}"]`).click({
      force: true
    })
    cy.get(`[data-cy="UserListItem-checkbox--${kuids[1]}"]`).click({
      force: true
    })
    cy.get('[data-cy="UserList-bulkDeleteBtn"]').click()
    cy.contains('Do you really want to delete 2 users?')

    cy.get('[data-cy=ModalDeleteUsers-submitBtn]').click()

    cy.wait(2000)
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuids[0])
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuids[1])
    cy.contains('No user is defined')
  })

  it('Should be able to bulk delete users via the toggle-all and bulk button', function() {
    const kuids = ['dummy', 'goofy']
    kuids.forEach(kuid => {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (${kuid})`
          },
          credentials: {
            local: {
              username: kuid,
              password: 'test'
            }
          }
        }
      )
    })
    cy.visit('/#/security/users')
    cy.contains(kuids[0])
    cy.contains(kuids[1])
    cy.get('[data-cy="UserList-toggleAllBtn"]').click()
    cy.get('[data-cy="UserList-bulkDeleteBtn"]').click()
    cy.contains('Do you really want to delete 2 users?')

    cy.get('[data-cy=ModalDeleteUsers-submitBtn]').click()

    cy.wait(2000)
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuids[0])
    cy.get('[data-cy="UserList-items"]').should('not.contain', kuids[1])
    cy.contains('No user is defined')
  })

  it('Should be able to interact with the links of the page', () => {
    const kuid = 'dummy'
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: {
        profileIds: ['default'],
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })
    cy.visit('/#/security/users')
    cy.contains(kuid)
    cy.get('[data-cy="UsersManagement-createBtn"]').click()
    cy.url().should('contain', 'security/users/create')

    cy.visit('/#/security/users')
    cy.contains(kuid)
    cy.get('[data-cy="UsersDropdown"]').click()
    cy.get('[data-cy="UsersDropdown-editMapping"]').click()
    cy.url().should('contain', 'security/users/custom-mapping')

    cy.visit('/#/security/users')
    cy.contains(kuid)
    cy.get(`[data-cy="UserListItem-update--${kuid}"]`).click()
    cy.url().should('contain', `security/users/${kuid}`)
  })

  it('Should be able to paginate the users', () => {
    for (let i = 0; i < 14; i++) {
      cy.request(
        'POST',
        `${kuzzleUrl}/users/user-${i}/_create?refresh=wait_for`,
        {
          content: {
            profileIds: ['default'],
            name: `Dummy User (user-${i})`
          },
          credentials: {
            local: {
              username: `user-${i}`,
              password: 'test'
            }
          }
        }
      )
    }
    cy.visit('/#/security/users')
    cy.get('[data-cy=UserItem]').should('have.length', 10)

    cy.get(
      '[data-cy="UserManagement-pagination"] .page-link[aria-posinset="2"]'
    ).click({force: true})
    cy.get('[data-cy=UserItem]').should('have.length', 4)
    cy.url().should('contain', 'from=10')
  })

  it('Should be able to create a new user with custom KUID', () => {
    const kuid = 'trippy'
    const credentials = {
      username: 'trippy',
      password: 'martinez'
    }

    cy.visit(`/#/security/users/create`)
    cy.get('[data-cy=UserBasic-kuid]').type(kuid)
    cy.get('[data-cy="UserProfileList-select"]').select('admin')

    cy.get('[data-cy=CredentialsSelector-local-username]').type(
      `{selectall}${credentials.username}`
    )
    cy.get('[data-cy=CredentialsSelector-local-password]').type(
      `{selectall}${credentials.password}`
    )

    cy.get('#UserUpdate-customTab___BV_tab_button__').click()
    cy.get('[data-cy="UserCustomContent-jsonEditor"] .ace_line').should(
      'be.visible'
    )
    cy.get(
      '[data-cy="UserCustomContent-jsonEditor"] .ace_line:first-child'
    ).click({
      force: true
    })
    cy.get('[data-cy="UserCustomContent-jsonEditor"] textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"super_important_field": "LOL"`,
        {
          force: true
        }
      )

    cy.get('[data-cy="UserUpdate-submit"]').click({force: true})
    cy.get(`[data-cy=UserItem-${kuid}--toggle]`).click()
    cy.get('[data-cy=UserItem]').should('contain', '"admin"')
    cy.get('[data-cy=UserItem]').should('contain', 'super_important_field')
    cy.get('[data-cy=UserItem]').should('contain', '"LOL"')

    cy.get('[data-cy="MainMenu-logoutBtn"]').click()

    cy.get('[data-cy="Login-username"]').type(credentials.username)
    cy.get('[data-cy="Login-password"]').type(credentials.password)
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
  })

  it('Should be able to create a new user with auto-generated KUID', () => {
    const credentials = {
      username: 'trippy',
      password: 'martinez'
    }

    cy.visit(`/#/security/users/create`)
    cy.get('[data-cy="UserProfileList-select"]').select('admin')

    cy.get('[data-cy=CredentialsSelector-local-username]').type(
      `{selectall}${credentials.username}`
    )
    cy.get('[data-cy=CredentialsSelector-local-password]').type(
      `{selectall}${credentials.password}`
    )

    cy.get('[data-cy="UserUpdate-submit"]').click({force: true})
    cy.get('[data-cy=UserItem]').should('have.length', 1)
  })

  it('Should be able to update a user', () => {
    const kuid = 'dummy'
    const newCredentials = {
      username: 'trippy',
      password: 'martinez'
    }
    const profileIdPrefix = 'p-'
    const profileIds = []
    for (let i = 0; i < 14; i++) {
      cy.request(
        'POST',
        `${kuzzleUrl}/profiles/${profileIdPrefix}_${i}/_create?refresh=wait_for`,
        {
          policies: [{ roleId: 'default' }]
        }
      )
      profileIds.push(`${profileIdPrefix}_${i}`)
    }
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: {
        profileIds: ['default', ...profileIds],
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })
    cy.visit(`/#/security/users/${kuid}`)
    cy.contains(`Edit user - ${kuid}`)

    profileIds.forEach(id => {
      cy.get(`[data-cy="UserProfileList-badge--${id}"]`).should('be.visible')
    })

    cy.get('[data-cy=UserProfileList-default--delete]').click()
    cy.get('[data-cy="UserProfileList-select"]').select('admin')

    cy.get('[data-cy=CredentialsSelector-local-username]').type(
      `{selectall}${newCredentials.username}`
    )
    cy.get('[data-cy=CredentialsSelector-local-password]').type(
      `{selectall}${newCredentials.password}`
    )

    cy.get('#UserUpdate-customTab___BV_tab_button__').click()
    cy.get('[data-cy="UserCustomContent-jsonEditor"] .ace_line').should(
      'be.visible'
    )
    cy.get(
      '[data-cy="UserCustomContent-jsonEditor"] .ace_line:first-child'
    ).click({
      force: true
    })
    cy.get('[data-cy="UserCustomContent-jsonEditor"] textarea.ace_text-input')
      .should('be.visible')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"super_important_field": "LOL"`,
        {
          force: true
        }
      )

    cy.get('[data-cy="UserUpdate-submit"]').click({force: true})
    cy.get(`[data-cy=UserItem-${kuid}--toggle]`).click()
    cy.get('[data-cy=UserItem]').should('contain', '"admin"')
    cy.get('[data-cy=UserItem]').should('contain', 'super_important_field')
    cy.get('[data-cy=UserItem]').should('contain', '"LOL"')

    cy.get('[data-cy="MainMenu-logoutBtn"]').click()

    cy.get('[data-cy="Login-username"]').type(newCredentials.username)
    cy.get('[data-cy="Login-password"]').type(newCredentials.password)
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.get('[data-cy="App-loggedIn"]')
  })

  it('Should update the user mapping successfully', function() {
    cy.visit('/#/security/users/custom-mapping')

    cy.get('[data-cy="EditUserMapping-JSONEditor"] .ace_line').should(
      'be.visible'
    )

    cy.get('[data-cy="EditUserMapping-JSONEditor"] .ace_line')
      .contains('{')
      .click({ force: true })
    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"address": {
"type": "text"
`,
        {
          force: true
        }
      )

    cy.get('[data-cy="EditUserMapping-submitBtn"]').click()
    cy.contains('Users')
  })

  it('Should display a user with a lot of profiles', () => {
    const profileIdPrefix = 'dummy'
    const profileIds = []
    const kuid = 'dummy'

    for (let i = 0; i < 14; i++) {
      cy.request(
        'POST',
        `${kuzzleUrl}/profiles/${profileIdPrefix}_${i}/_create?refresh=wait_for`,
        {
          policies: [{ roleId: 'default' }]
        }
      )
      profileIds.push(`${profileIdPrefix}_${i}`)
    }
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: {
        profileIds,
        name: 'Dummy User'
      },
      credentials: {
        local: {
          username: 'dummy',
          password: 'test'
        }
      }
    })
    cy.visit('/#/security/users')

    profileIds.forEach(profileId => {
      cy.contains(profileId)
    })
  })
})
