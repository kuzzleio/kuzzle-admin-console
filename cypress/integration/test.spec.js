describe('My First Test', function() {
  it('Opens the Admin Console', function() {
    cy.visit('localhost:3000')
    cy.contains('Create a Connection')
    cy.get('.CreateEnvironment-name').type('local', {
      force: true
    })
    cy.get('.CreateEnvironment-host').type('localhost', {
      force: true
    })
    cy.get('.Environment-SubmitButton').click()
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.get('.IndexesPage-createBtn').click()
    cy.get('.CreateIndexModal-name').type('test', {
      force: true
    })
    cy.get('.CreateIndexModal-createBtn').click()
    cy.contains('test')
  })
})
