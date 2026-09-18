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

// Fenêtre pendant laquelle on vérifie qu'une navigation n'a PAS lieu.
//
// Asserter un négatif — « on est resté sur la même page » — demande une fenêtre
// de temps, et c'est le seul cas où une durée fixe reste justifiée côté specs
// (cf. ADR-0006). Une assertion instantanée serait vraie AVANT même que
// l'application ait eu le temps de naviguer à tort : le test passerait quoi
// qu'il arrive, y compris le jour où le formulaire laisserait passer une valeur
// invalide. Cypress n'a pas d'assertion de stabilité native.
//
// La durée est donc nommée et bornée ici, et n'est jamais écrite en clair dans
// une spec.
const NAVIGATION_GRACE_MS = 1000

/**
 * Vérifie qu'on est sur `hash` et qu'on y reste.
 *
 * La comparaison porte sur le chemin seul : les paramètres de requête peuvent
 * changer sans qu'on ait quitté la page (`#/login` devient `#/login?to=Indexes`
 * quand on sélectionne un environnement). Ce qu'on veut prouver, c'est qu'il
 * n'y a pas eu de navigation, pas que l'URL est restée identique au caractère
 * près.
 *
 * @param {string} hash chemin attendu, par ex. `#/security/roles/create`
 */
Cypress.Commands.add('shouldStayOn', hash => {
  const assertPath = () =>
    cy.location('hash').should(actual => {
      expect(actual.split('?')[0]).to.equal(hash)
    })

  assertPath()
  // eslint-disable-next-line no-restricted-syntax -- durée assumée, cf. ci-dessus
  cy.wait(NAVIGATION_GRACE_MS)
  assertPath()
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
