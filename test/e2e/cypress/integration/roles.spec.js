describe('Roles', () => {
  const kuzzleUrl = 'http://localhost:7512'
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

  it('Should be able to interact with the links in the page', () => {
    cy.visit('#/security/roles')
    cy.contains('Roles')

    cy.get('[data-cy=RolesManagement-createBtn]').click()
    cy.url().should('contain', '#/security/roles/create')

    cy.visit('#/security/roles')
    cy.get('[data-cy=RoleItem-update--default]').click()
    cy.url().should('contain', '/#/security/roles/default')
  })

  it('Should be able to search roles by controller', () => {
    const roleId = 'dummy'
    cy.request('POST', `${kuzzleUrl}/roles/${roleId}/_create`, {
      controllers: {
        document: {
          actions: {
            get: true,
            mGet: true,
            search: true
          }
        }
      }
    })
    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.contains(roleId)
    cy.get('[data-cy="RoleFilters-searchBar"]').type('document{enter}')
    cy.get('[data-cy=RolesFilters-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('contain', roleId)

    cy.get('.b-form-tag[title=document] > .b-form-tag-remove').click()
    cy.get('[data-cy="RoleFilters-searchBar"]').type('security{enter}')
    cy.get('[data-cy=RolesFilters-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleId)
  })

  it('Should be able to delete a role', () => {
    const roleId = 'dummy'
    cy.request('POST', `${kuzzleUrl}/roles/${roleId}/_create`, {
      controllers: {
        document: {
          actions: {
            get: true,
            mGet: true,
            search: true
          }
        }
      }
    })
    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.contains(roleId)
    cy.get(`[data-cy=RoleItem-delete--${roleId}]`).click()
    cy.get('[data-cy=ModalDeleteRoles-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleId)
  })

  it('Should be able to bulk delete roles via the checkbox and bulk button', () => {
    const roleIds = ['dummy', 'trippy']
    cy.request('POST', `${kuzzleUrl}/roles/${roleIds[0]}/_create`, {
      controllers: {
        document: {
          actions: {
            get: true,
            mGet: true,
            search: true
          }
        }
      }
    })
    cy.request('POST', `${kuzzleUrl}/roles/${roleIds[1]}/_create`, {
      controllers: {
        security: {
          actions: {
            createUser: true
          }
        }
      }
    })

    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.contains(roleIds[0])
    cy.contains(roleIds[1])
    cy.get(`[data-cy=RoleItem-checkbox--${roleIds[0]}]`).click({ force: true })
    cy.get(`[data-cy=RoleItem-checkbox--${roleIds[1]}]`).click({ force: true })
    cy.get('[data-cy=UserList-bulkDeleteBtn]').click()
    cy.get('[data-cy=ModalDeleteRoles-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleIds[0])
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleIds[1])
  })

  it('Should be able to paginate the roles', () => {
    const rolePrefix = 'dummy'
    for (let i = 0; i < 14; i++) {
      cy.request('POST', `${kuzzleUrl}/roles/${rolePrefix}_${i}/_create`, {
        controllers: {
          security: {
            actions: {
              createUser: true
            }
          }
        }
      })
    }
    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.get('[data-cy="RoleItem"]').should('have.length', 10)
    cy.get(
      '[data-cy="RolesManagement-pagination"] .page-link[aria-posinset="2"]'
    ).click()
    cy.get('[data-cy="RoleItem"]').should('have.length', 7)
  })
})
