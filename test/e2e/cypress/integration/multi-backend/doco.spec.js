describe.skip('docker-compose plugin', () => {
  it('Should raise doco task', () => {
    cy.task('doco', { version: '2', docoArgs: ['up'] })
    cy.task('doco', { version: '1', docoArgs: ['up'], port: '7513' })
    cy.pollingRequest('http://localhost:7513')
  })
})
