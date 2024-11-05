import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: 'test/e2e/cypress/fixtures',
  screenshotsFolder: 'test/e2e/failed-test/',
  videosFolder: 'test/e2e/videos',
  projectId: 'qnb41a',
  viewportHeight: 800,
  viewportWidth: 1400,
  defaultCommandTimeout: 60000,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:8080',
    specPattern: 'test/e2e/cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'test/e2e/cypress/support/index.js',
    experimentalRunAllSpecs: true,
  },
})
