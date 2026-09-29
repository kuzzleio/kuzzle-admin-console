describe('Reset Password', () => {
  it('Should render visual feedback and prevent submitting when input is invalid', () => {
    cy.initLocalEnv()
    cy.visit('/#/reset-password/anonymous')

    cy.get('[data-cy=ResetPassword-password]').type(' ', { force: true })
    cy.get('[data-cy="ResetPassword-password--group"]').should(
      'contain',
      'Password must not be empty'
    )

    cy.get('[data-cy=ResetPassword-password]').type('{selectall}password', {
      force: true
    })
    cy.get('[data-cy=ResetPassword-password2]').type('{selectall}different', {
      force: true
    })
    cy.get('[data-cy="ResetPassword-password2--group"]').should(
      'contain',
      'Passwords do not match'
    )

    cy.get('[data-cy=ResetPassword-submitBtn]').click()
    cy.url().should('contain', '/#/reset-password/anonymous')
  })

  it('Should accept a confirmation that matches the password', () => {
    cy.initLocalEnv()
    cy.visit('/#/reset-password/anonymous')

    // Tout sauf « password » : `sameAs('password')` comparait la
    // confirmation à cette chaîne, et la spec précédente la tapait (G-102).
    cy.get('[data-cy=ResetPassword-password]').type('s3cret-Passphrase', {
      force: true
    })
    // Le message doit d'abord apparaître : sans lui, `not.contain` passerait
    // avant même que la validation ait tourné.
    cy.get('[data-cy=ResetPassword-password2]').type('s3cret', { force: true })
    cy.get('[data-cy="ResetPassword-password2--group"]').should(
      'contain',
      'Passwords do not match'
    )
    cy.get('[data-cy=ResetPassword-password2]').type('-Passphrase', {
      force: true
    })
    cy.get('[data-cy="ResetPassword-password2--group"]').should(
      'not.contain',
      'Passwords do not match'
    )
  })
})
