import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: 'test/e2e/cypress/fixtures',
  screenshotsFolder: 'test/e2e/failed-test/',
  videosFolder: 'test/e2e/videos',
  projectId: 'qnb41a',
  viewportHeight: 800,
  viewportWidth: 1400,
  defaultCommandTimeout: 60000,
  pageLoadTimeout: 60000,
  // Une poignée de tests sont instables quand la suite s'enchaîne : les saisies
  // clavier simulées dans les composants tiers (Ace, vue-form-generator)
  // utilisent des délais fixes et peuvent perdre une frappe sous charge.
  // Cf. docs/MIGRATION.md § 5.1, G-001.
  //
  // Le retry retire ce bruit du signal CI sans masquer l'instabilité : Cypress
  // rapporte le nombre de tentatives, donc un test qui ne passe qu'au second
  // essai reste visible. Ce n'est pas le correctif, c'est le garde-fou en
  // attendant de remplacer les attentes à durée fixe par des attentes sur
  // assertion.
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:8080',
    specPattern: 'test/e2e/cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'test/e2e/cypress/support/index.js',
    experimentalRunAllSpecs: true,
  },
})
