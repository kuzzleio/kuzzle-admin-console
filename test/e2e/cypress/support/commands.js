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
import { antiGlitchOverlayTimeout } from '../../../../src/utils.ts'
import axios from 'axios'

Cypress.Commands.add('waitOverlay', () => {
  cy.visit('/')
  cy.wait(antiGlitchOverlayTimeout + 50)
})

Cypress.Commands.add(
  'initLocalEnv',
  (backendVersion = 2, token = 'anonymous') => {
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
          backendMajorVersion: backendVersion,
          token
        }
      })
    )
    localStorage.setItem('currentEnv', validEnvName)
  }
)

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })
}

async function poll(url) {
  for (let i = 15; i > 0; i--) {
    try {
      const r = await axios.get(url)
      if (r) {
        console.log('response is present')
        console.log(r)
        return
      }
    } catch (error) {
      console.error(error)
      await wait(3000)
    }
  }
  throw new Error('Service is unreachable')
}

Cypress.Commands.add('pollingRequest', url => {
  return poll(url)
})
