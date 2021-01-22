describe('Reset Password', () => {
  it('Should render visual feedback and prevent submitting when input is invalid', () => {
    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
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
})
