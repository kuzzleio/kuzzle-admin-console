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
    cy.get('[data-cy="RoleCreateOrUpdate-updateBtn"]').click()
    cy.contains(roleId)
    cy.wait(1000)
    cy.request('GET', `${kuzzleUrl}/roles/${roleId}`).should(response => {
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
})
