const world = require('../world')
const expect = require('expect.js')
const sharedSteps = require('../shared-steps')

describe('Manage environments', function() {
  this.timeout(world.defaultTestTimeout)

  afterEach('Take screenshot if test failed', async function() {
    if (this.currentTest.state === 'failed') {
      const page = await world.getPage()
      await page.screenshot({ path: './test-error.png', type: 'png' })
    }
  })

  it('should be able to create a new environment', async () => {
    const page = await world.getPage()
    const newEnvName = 'local'
    const newEnvHost = world.isLocal ? 'localhost' : 'kuzzle'

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, newEnvName, newEnvHost)

    // Check new environment exists
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat')
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector(`#EnvironmentsSwitch-env_${newEnvName}`, {
      timeout: 3000
    })
  })

  it('should be able to delete an environment', async () => {
    const envToDeleteName = 'toDelete'
    const envToDeleteHost = world.isLocal ? 'localhost' : 'kuzzle'
    const page = await world.getPage()

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, envToDeleteName, envToDeleteHost)

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

  it('Should be able to create an invalid environment and switch back to the valid one', async () => {
    const invalidEnvName = 'invalid'
    const invalidEnvHost = 'invalid-host'
    const validEnvName = 'valid'
    const validEnvHost = world.isLocal ? 'localhost' : 'kuzzle'
    const page = await world.getPage()

    await page.goto(world.url)

    // Create a valid environment
    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, validEnvName, validEnvHost)

    // Create an invalid environment
    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, invalidEnvName, invalidEnvHost)

    // Select the invalid environment
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat')
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector(`#EnvironmentsSwitch-env_${invalidEnvName}`, {
      timeout: 2000
    })
    await page.click(`#EnvironmentsSwitch-env_${invalidEnvName}`)

    // Select the valid environment
    await page.waitForSelector('.EnvironmentsSwitch > .btn-flat')
    await page.click('.EnvironmentsSwitch > .btn-flat')

    await page.waitForSelector(`#EnvironmentsSwitch-env_${validEnvName}`, {
      timeout: 2000
    })
    await page.click(`#EnvironmentsSwitch-env_${validEnvName}`)

    // Now verify that we see a Login as Anonymous button
    const foundLoginAsAnonymousButton = await page.$$(`.LoginAsAnonymous-Btn`)
    expect(foundLoginAsAnonymousButton.length).to.be.above(0)
  })

  it('Properly sets a color for the environment', async () => {
    const page = await world.getPage()
    const newEnvName = 'colored'
    const newEnvHost = world.isLocal ? 'localhost' : 'kuzzle'
    const newEnvColorIdx = 3

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)

    // Get the color of the box that will be clicked
    await page.waitForSelector(
      `.CreateEnvironment-colorBtns div:nth-child(${newEnvColorIdx}) div.color`
    )
    const selectedColor = await page.$eval(
      `.CreateEnvironment-colorBtns div:nth-child(${newEnvColorIdx}) div.color`,
      node => node.style.backgroundColor
    )

    // Create the environment with the given color
    await sharedSteps.createEnvironment(
      page,
      newEnvName,
      newEnvHost,
      undefined,
      newEnvColorIdx
    )

    // Log in to the Admin Console
    await page.waitForSelector('.LoginAsAnonymous-Btn')
    await page.click('.LoginAsAnonymous-Btn')

    // Check the background color of the navbar is the selected one
    await page.waitForSelector('nav')
    const headerColor = await page.$eval(
      'nav',
      node => node.style.backgroundColor
    )
    expect(headerColor).to.be.eql(selectedColor)
  })
})
