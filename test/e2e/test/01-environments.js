const world = require('../world')
const expect = require('expect.js')

describe('Manage environments', function() {
  this.timeout(30000)

  afterEach('Take screenshot if test failed', async function() {
    if (this.currentTest.state === 'failed') {
      const page = await world.getPage()
      await page.screenshot({ path: './test-error.png', type: 'png' })
    }
  })

  it('should be able to create a new environment', async () => {
    const newEnvName = 'local'
    const page = await world.getPage()

    await page.goto(world.url)

    openCreateEnvModalIfExists(page)

    // Create environment
    // ============================================
    await page.waitForSelector('.CreateEnvironment-name')

    await page.type('.CreateEnvironment-name', newEnvName)
    await page.type('.CreateEnvironment-host', 'localhost')

    await page.waitForSelector('.CreateEnvironmentPage-createBtn')
    await page.click('.CreateEnvironmentPage-createBtn')

    // Check new environment exists
    // ============================================
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat')
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector(`#EnvironmentsSwitch-env_${newEnvName}`, {
      timeout: 3000
    })
  })

  it('should be able to delete an environment', async () => {
    const envToDeleteName = 'toDelete'
    const page = await world.getPage()

    await page.goto(world.url)

    openCreateEnvModalIfExists(page)

    await page.waitForSelector('#env-name')
    await page.type('#env-name', envToDeleteName)
    await page.type('#host', 'kuzzle')

    try {
      await page.waitForSelector('.CreateEnvironmentPage-createBtn', {
        timeout: 1000
      })
      await page.click('.CreateEnvironmentPage-createBtn')
    } catch (error) {
      await page.waitForSelector('.EnvironmentsCreateModal-submit', {
        timeout: 1000
      })
      await page.click('.EnvironmentsCreateModal-submit')
    }

    // Now delete it
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat')
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector(
      `#EnvironmentsSwitch-env_${envToDeleteName} > i.fa-trash`,
      { timeout: 2000 }
    )
    await page.click(`#EnvironmentsSwitch-env_${envToDeleteName} > i.fa-trash`)

    await page.waitForSelector('.EnvironmentDeleteModal-envName')
    await page.click('.EnvironmentDeleteModal-envName')

    await page.type('.EnvironmentDeleteModal-envName', envToDeleteName)

    await page.waitForSelector(
      'div > #delete-env > .modal-footer > span > .btn'
    )
    await page.click('div > #delete-env > .modal-footer > span > .btn')

    // Now verify the environment is no more present
    const foundEnvironment = await page.$(
      `#EnvironmentsSwitch-env_${envToDeleteName}`
    )
    expect(foundEnvironment).to.eql(null)
  })
})

const openCreateEnvModalIfExists = async page => {
  try {
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat', {
      timeout: 1000
    })
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector('.EnvironmentsSwitch-newConnectionBtn', {
      timeout: 1000
    })
    await page.click('.EnvironmentsSwitch-newConnectionBtn')
  } catch (error) {}
}
