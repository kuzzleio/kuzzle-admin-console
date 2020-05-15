// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import 'cypress-file-upload'

/**
 * Workaround to make file upload functional with Cypress...
 * Usage:
 * const file = {
 *   name: 'environment.json',
 *   type: 'application/json',
 *   content: JSON.stringify(fileJson)
 * }
 * cy.uploadFile('input[type=file]', file)
 */
Cypress.Commands.add('uploadFile', (inputFileSelector, file) => {
  cy.get(inputFileSelector).then(subject => {
    const el = subject[0]
    const testFile = new File([file.content], file.name, {
      type: file.type
    })
    const dataTransfer = new DataTransfer()

    dataTransfer.items.add(testFile)
    el.files = dataTransfer.files

    const events = ['change']
    const eventPayload = {
      bubbles: true,
      cancelable: true,
      detail: dataTransfer
    }

    events.forEach(e => {
      const event = new CustomEvent(e, eventPayload)
      Object.assign(event, { dataTransfer })

      subject[0].dispatchEvent(event)
    })
  })
})
