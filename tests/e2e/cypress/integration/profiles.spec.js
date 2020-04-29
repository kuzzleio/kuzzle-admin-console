describe('Profiles', function() {
  const kuzzleUrl = 'http://localhost:7512'

  beforeEach(() => {
    cy.request('POST', 'http://localhost:7512/admin/_resetSecurity')

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

  it('should show correctly profiles list', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')

    cy.visit(`/#/security/profiles`)

    cy.contains('anonymous')
    cy.contains('default')
    cy.contains('admin')
  })

  it('should create a profile', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')

    cy.visit('/#/security/profiles')

    cy.get('[data-cy="CreateProfile-btn"]').click()
    cy.get(
      '.col > .card-content > #document > .ace_scroller > .ace_content'
    ).should('be.visible')
    cy.wait(2000)

    cy.get('input[id="id"]').type('chef')

    cy.get('.ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .type(`{selectall}{backspace}`, {
        delay: 400,
        force: true
      })
      .type(
        `{
          "policies": [
            {
              "roleId": "admin"
            }
          ]
        }`,
        {
          force: true
        }
      )

    cy.get('[data-cy="CreateDocument-btn"]').click()
    cy.wait(2000)
    cy.contains('chef')
  })

  it('should update a profile', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')

    cy.visit('/#/security/profiles')

    cy.get('div[data-cy="ProfileItem-admin"] .fa-pencil-alt').click({
      force: true,
      multiple: true
    })

    cy.get(
      '.col > .card-content > #document > .ace_scroller > .ace_content'
    ).should('be.visible')
    cy.wait(2000)

    cy.get('.ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('textarea.ace_text-input')
      .type(`{selectall}{backspace}`, {
        delay: 400,
        force: true
      })
      .type(
        `{
          "rateLimit": 42,
          "policies": [
            {
              "roleId": "admin"
            }
          ]
        }`,
        {
          force: true
        }
      )

    cy.get('[data-cy="UpdateDocument-btn"]').click()
    cy.wait(2000)

    cy.get('.CrudlDocument').should('be.visible')

    cy.request('GET', `${kuzzleUrl}/profiles/admin`).then(res => {
      expect(res.body.result._source.rateLimit).to.be.equals(42)
    })
  })
})
