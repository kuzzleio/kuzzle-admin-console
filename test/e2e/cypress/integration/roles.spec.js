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

  it('Should be able to search roles by controller', () => {})

  it('Should be able to delete a role', () => {})

  it('Should be able to bulk delete roles via the checkbox and bulk button', () => {})

  it('Should be able to paginate the roles', () => {})
})
