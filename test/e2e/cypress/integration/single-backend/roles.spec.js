describe('Roles', () => {
  const kuzzleUrl = 'http://localhost:7512'
  beforeEach(function() {
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)

    cy.request('POST', `${kuzzleUrl}/_createFirstAdmin`, {
      content: {},
      credentials: {
        local: {
          username: 'admin',
          password: 'pass'
        }
      }
    })
    cy.initLocalEnv()
    cy.setCookie('telemetry', 'false')
  })

  afterEach(() => {
    cy.request('POST', `${kuzzleUrl}/_login/local`, {
      username: 'admin',
      password: 'pass'
    }).then(response => {
      const token = response.body.result.jwt

      cy.request({
        method: 'PUT',
        url: `${kuzzleUrl}/roles/anonymous`,
        body: {
          controllers: {
            '*': {
              actions: {
                '*': true
              }
            }
          }
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  })

  it('Should render a visual feedback and prevent submitting when input is not valid', () => {
    cy.waitOverlay()
    cy.visit('/#/security/roles/create')
    cy.contains('Create a new role')
    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor--dangerIcon"]').should('not.exist')

    cy.get('[data-cy="RoleCreateOrUpdate-createBtn"]').click()
    cy.invalidFeedback('[data-cy="RoleCreateOrUpdate-id"]').should(
      'contain',
      'This field cannot be empty'
    )

    cy.get('[data-cy="RoleCreateOrUpdate-id"] input').type(' ', {
      force: true
    })

    cy.invalidFeedback('[data-cy="RoleCreateOrUpdate-id"]').should(
      'contain',
      'This field cannot contain just whitespaces'
    )

    cy.get('[data-cy="RoleCreateOrUpdate-id"] input').type(
      '{selectall}{backspace}',
      {
        force: true
      }
    )

    cy.invalidFeedback('[data-cy="RoleCreateOrUpdate-id"]').should(
      'contain',
      'This field cannot be empty'
    )

    cy.get('[data-cy=RoleCreateOrUpdate-createBtn]').click()
    cy.shouldStayOn('#/security/roles/create')

    cy.get('[data-cy="RoleCreateOrUpdate-id"] input').type('{selectall}valid', {
      force: true
    })

    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .clear({ force: true })
      .type(`SuM UNV4L1d jayZON Kood`)

    // Le JSON invalide est refusé ET le formulaire le dit (#1027, porté de
    // #1092) : avant, le bouton semblait ne rien faire.
    let createRequestCount = 0
    cy.intercept('**/roles/valid*', () => {
      createRequestCount += 1
    })
    cy.get('[data-cy=RoleCreateOrUpdate-createBtn]').click()
    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor--dangerIcon"]')
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('contain.text', 'Invalid JSON')
    cy.shouldStayOn('#/security/roles/create')
    cy.then(() => {
      expect(createRequestCount).to.equal(0)
    })
  })

  it('Should be able to create a new role', () => {
    const roleId = 'dummy'
    cy.visit('/#/security/roles/create')
    cy.get('[data-cy="RoleCreateOrUpdate-id"]').type(roleId)

    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor"] .ace_line').should(
      'be.visible'
    )

    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .clear({ force: true })
      .type(
        `{
"controllers": {
"document": {
"actions": {
"get": true,
"search": true`,
        {
          force: true
        }
      )
    cy.get('[data-cy="RoleCreateOrUpdate-createBtn"]').click()
    cy.contains(roleId)
  })

  it('Should be able to update an existing role', () => {
    const roleId = 'dummy'
    cy.request('POST', `${kuzzleUrl}/roles/${roleId}/_create`, {
      controllers: {
        document: {
          actions: {
            search: true
          }
        }
      }
    })
    cy.visit(`/#/security/roles/${roleId}`)
    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor"] .ace_line').should(
      'be.visible'
    )

    cy.get('[data-cy="RoleCreateOrUpdate-jsonEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .clear({ force: true })
      .type(
        `{selectall}{
"controllers": {
"document": {
"actions": {
"get": true,
"search": true`,
        {
          delay: 200,
          force: true
        }
      )
    cy.get('[data-cy="RoleCreateOrUpdate-updateBtn"]').click({ force: true })
    cy.contains(roleId)
    cy.expectBackend(`${kuzzleUrl}/roles/${roleId}`, response => {
      expect(response.body.result._source).to.deep.include({
        controllers: {
          document: {
            actions: {
              get: true,
              search: true
            }
          }
        }
      })
    })
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
    cy.request(
      'POST',
      `${kuzzleUrl}/roles/${roleId}/_create?refresh=wait_for`,
      {
        controllers: {
          document: {
            actions: {
              get: true,
              mGet: true,
              search: true
            }
          }
        }
      }
    )
    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.contains(roleId)
    cy.get('[data-cy="RoleFilters-searchBar"]').type('document{enter}')
    cy.get('[data-cy="RoleList-list"]').should('contain', roleId)

    // Le bouton dit qu'il retire, pas seulement quelle étiquette (ADR-0054).
    cy.removeFormTag('document')
      .should('have.attr', 'aria-label', 'Remove document')
      .and('not.have.attr', 'aria-labelledby')
    cy.removeFormTag('document').click()
    cy.get('[data-cy="RoleFilters-searchBar"]').type('security{enter}')
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleId)
  })

  it('Should edit controller tags from the keyboard', () => {
    cy.visit('#/security/roles')
    cy.contains('Roles')
    // Pas de coupe à la virgule, espaces retirés, doublon refusé.
    cy.get('[data-cy="RoleFilters-searchBar"]').type('auth,index{enter}  document {enter}')
    cy.get('[data-slot="tags-input-item"][title="auth,index"]').should('exist')
    cy.get('[data-slot="tags-input-item"][title="document"]').should('exist')
    cy.get('[data-cy="RoleFilters-searchBar"]').type('document{enter}')
    cy.get('[data-slot="tags-input-item"]').should('have.length', 2)
    cy.get('[data-cy="RoleFilters-searchBar"]').clear()

    // Retour arrière sur un champ vide désigne la dernière étiquette, puis la
    // retire.
    cy.get('[data-cy="RoleFilters-searchBar"]').type('{backspace}')
    cy.get('[data-slot="tags-input-item"][title="document"]').should(
      'have.attr',
      'data-state',
      'active'
    )
    cy.get('[data-cy="RoleFilters-searchBar"]').type('{backspace}')
    cy.get('[data-slot="tags-input-item"]').should('have.length', 1)
    cy.get('[data-slot="tags-input-item"][title="auth,index"]').should('exist')
  })

  it('Should be able to delete a role', () => {
    const roleId = 'dummy'
    cy.request(
      'POST',
      `${kuzzleUrl}/roles/${roleId}/_create?refresh=wait_for`,
      {
        controllers: {
          document: {
            actions: {
              get: true,
              mGet: true,
              search: true
            }
          }
        }
      }
    )
    cy.visit('#/security/roles')
    cy.contains('Roles')
    cy.contains(roleId)
    cy.get(`[data-cy=RoleItem-delete--${roleId}]`).click()
    cy.get('[data-cy=ModalDeleteRoles-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleId)
  })

  it('Should be able to bulk delete roles via the checkbox and bulk button', () => {
    const roleIds = ['dummy', 'trippy']
    cy.request(
      'POST',
      `${kuzzleUrl}/roles/${roleIds[0]}/_create?refresh=wait_for`,
      {
        controllers: {
          document: {
            actions: {
              get: true,
              mGet: true,
              search: true
            }
          }
        }
      }
    )
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

  it('Should not leave another role checked after deleting a checked one', () => {
    const roleIds = ['dummy', 'trippy']
    for (const roleId of roleIds) {
      cy.request(
        'POST',
        `${kuzzleUrl}/roles/${roleId}/_create?refresh=wait_for`,
        { controllers: { document: { actions: { get: true } } } }
      )
    }
    cy.visit('#/security/roles')
    cy.contains(roleIds[0])
    cy.contains(roleIds[1])
    cy.get(`[data-cy=RoleItem-checkbox--${roleIds[0]}]`).click({ force: true })
    cy.get(`[data-cy=RoleItem-delete--${roleIds[0]}]`).click()
    cy.get('[data-cy=ModalDeleteRoles-submitBtn]').click()
    cy.get('[data-cy="RoleList-list"]').should('not.contain', roleIds[0])

    // Les lignes étaient indexées par `document.id`, absent : toutes avaient
    // la même clé, et la ligne suivante héritait de la case cochée de la
    // ligne supprimée (G-113). La sélection oublie aussi le rôle supprimé.
    cy.get('[data-cy^=RoleItem-checkbox--]').should('not.be.checked')
    cy.get('[data-cy=UserList-bulkDeleteBtn]').should('be.disabled')
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
    cy.get('[data-cy="RoleItem"]').should('have.length', 17)
    cy.selectOption('[data-cy=perPageSelector]', 10)
    cy.get('[data-cy="RoleItem"]').should('have.length', 10)
    cy.paginationPage('[data-cy="RolesManagement-pagination"]', 2).click({ force: true })
    cy.get('[data-cy="RoleItem"]').should('have.length', 7)
  })

  it('Should be able to revoke anonymous rights', () => {
    cy.request('POST', `${kuzzleUrl}/_login/local`, {
      username: 'admin',
      password: 'pass'
    }).then(loginResponse => {
      const token = loginResponse.body.result.jwt
      localStorage.setItem(
        'environments',
        JSON.stringify({
          testEnv: {
            name: 'testEnv',
            color: 'darkblue',
            host: 'localhost',
            ssl: false,
            port: 7512,
            backendMajorVersion: 2,
            token: token
          }
        })
      )

      sessionStorage.setItem('currentEnv', 'testEnv')

      cy.visit('#/security/roles')

      cy.get('[data-cy="RolesManagement-revokeAnonymous"]').click()
      cy.get('[data-cy="revokeAnonymous-modal"] button')
        .contains('OK')
        .click()

      cy.expectBackend(
        {
          method: 'GET',
          url: `${kuzzleUrl}/roles/anonymous`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        getRoleResponse => {
          // security:restrictDefaultRights réapplique la configuration standard
          // du backend : pas de joker `*`, seules les actions listées passent.
          expect(getRoleResponse.body.result._source.controllers).to.eql({
            auth: {
              actions: {
                checkToken: true,
                getCurrentUser: true,
                getMyRights: true,
                login: true
              }
            },
            server: {
              actions: {
                publicApi: true,
                openapi: true
              }
            }
          })
        }
      )

      cy.request({
        method: 'GET',
        url: `${kuzzleUrl}/roles/default`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).should(getRoleResponse => {
        expect(getRoleResponse.body.result._source.controllers).to.eql({
          auth: {
            actions: {
              checkToken: true,
              getCurrentUser: true,
              getMyRights: true,
              logout: true,
              updateSelf: true
            }
          },
          server: {
            actions: {
              publicApi: true
            }
          }
        })
      })
    })
  })
})
