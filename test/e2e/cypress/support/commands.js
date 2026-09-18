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
import 'cypress-wait-until'

Cypress.Commands.add('waitOverlay', () => {
  cy.visit('/')
  cy.wait(antiGlitchOverlayTimeout + 50)
})

Cypress.Commands.add(
  'initLocalEnv',
  (backendVersion = 2, token = 'anonymous', port = 7512, envName = 'valid') => {
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [envName]: {
          name: envName,
          color: 'darkblue',
          host: 'localhost',
          ssl: false,
          port,
          backendMajorVersion: backendVersion,
          token
        }
      })
    )
    sessionStorage.setItem('currentEnv', envName)
  }
)

Cypress.Commands.add('skipOnBackendVersion', version => {
  const currentEnvName = sessionStorage.getItem('currentEnv')
  const currentEnv = JSON.parse(localStorage.getItem('environments'))[
    currentEnvName
  ]

  if (currentEnv.backendMajorVersion === version) {
    const ctx = cy.state('runnable').ctx
    ctx.skip()
  }
})

Cypress.Commands.add('skipUnlessBackendVersion', version => {
  const currentEnvName = sessionStorage.getItem('currentEnv')
  const currentEnv = JSON.parse(localStorage.getItem('environments'))[
    currentEnvName
  ]

  if (currentEnv.backendMajorVersion !== version) {
    const ctx = cy.state('runnable').ctx
    ctx.skip()
  }
})

Cypress.Commands.add('goOffline', () => {
  return cy.log('Going offline')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.enable',
      });
    })
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: true,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    });
});

Cypress.Commands.add('goOnline', () => {
  return cy.log('Going online')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: false,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    });
});

// ***********************************************************
// Ancrages de test couplés à bootstrap-vue
//
// Ces commandes isolent les rares sélecteurs qui dépendent du markup généré
// par bootstrap-vue plutôt que d'un attribut `data-cy` que nous contrôlons.
// Bootstrap-vue disparaît en phase 2 du chantier de modernisation
// (cf. docs/MIGRATION.md) : quand ce sera le cas, il n'y aura que ce bloc à
// reprendre, pas les 17 specs.
// ***********************************************************

/**
 * Message de validation d'un champ de formulaire.
 * Rendu par `<b-form-group :invalid-feedback>` dans une div `.invalid-feedback`
 * sur laquelle nous ne pouvons pas poser d'attribut.
 *
 * @param {string} parentSelector sélecteur du groupe de formulaire parent
 */
Cypress.Commands.add('invalidFeedback', (parentSelector) => {
  return cy.get(`${parentSelector} .invalid-feedback`);
});

/**
 * Bouton de suppression d'un tag rendu par `<b-form-tags>`.
 *
 * @param {string} title libellé du tag à supprimer
 */
Cypress.Commands.add('removeFormTag', (title) => {
  return cy.get(`.b-form-tag[title="${title}"] > .b-form-tag-remove`);
});
