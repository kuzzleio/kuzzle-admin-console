import { defineConfig } from 'cypress'

// Captures de la comparaison v4 / v5 (docs/comparaison-v4-v5/README.md).
// Même fichier contre les deux versions : `CAPTURES_VERSION` choisit le dossier
// de sortie, `--config baseUrl=…` la version photographiée.
const version = process.env.CAPTURES_VERSION ?? 'v5'

export default defineConfig({
  fixturesFolder: 'test/e2e/cypress/fixtures',
  screenshotsFolder: `test/e2e/captures/${version}`,
  video: false,
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 60000,
  // Pas de retry : un état qui ne s'atteint pas doit laisser un trou sur la
  // planche, pas une capture prise au deuxième essai dans un autre état.
  retries: 0,
  screenshotOnRunFailure: false,
  trashAssetsBeforeRuns: true,
  e2e: {
    setupNodeEvents(on) {
      // Electron headless ouvre une fenêtre de 1280×720 : plus petite que le
      // viewport, la capture est rognée et garde ses barres de défilement.
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'electron') {
          launchOptions.preferences.width = 1600
          launchOptions.preferences.height = 1100
        } else if (browser.family === 'chromium') {
          launchOptions.args.push('--window-size=1600,1100')
        }
        return launchOptions
      })
    },
    baseUrl: 'http://localhost:8080',
    specPattern: 'test/e2e/cypress/captures/captures.js',
    supportFile: 'test/e2e/cypress/support/index.js',
  },
})
