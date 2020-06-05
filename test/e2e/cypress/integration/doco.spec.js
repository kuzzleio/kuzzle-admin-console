describe('docker-compose plugin', () => {
  it('Should raise doco task', () => {
    cy.task('doco', { version: '2', docoArgs: ['up'] })
    cy.pollingRequest('http://localhost:7512')
  })
})
