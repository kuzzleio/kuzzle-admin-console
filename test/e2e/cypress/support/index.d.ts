/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Waits for the anti-glitch overlay to fade out.
     */
    waitOverlay(): Chainable<Element>

    /**
     * Initializes the connection to the local Kuzzle backend
     * @param backendVersion The version of the local Kuzzle instance
     * @example cy.initLocalEnv(2)
     */
    initLocalEnv(backendVersion: string): Chainable<Element>
  }
}
