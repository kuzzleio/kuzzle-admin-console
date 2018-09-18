const expect = require('expect.js')
const world = require('../world')
const sharedSteps = require('../shared-steps')
const utils = require('../utils')
const fmt = require('../../../src/utils').formatForDom

describe('Manage environments', function() {
  it('should be able to create a new environment', async () => {
    const page = await world.getPage()
    const newEnvName = 'local'
    const newEnvHost = world.isLocal ? 'localhost' : 'kuzzle'

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, newEnvName, newEnvHost)

    // Check new environment exists
    await utils.waitForSelector(page, '.EnvironmentsSwitch > .btn-flat')
    await utils.click(page, '.EnvironmentsSwitch > .btn-flat')

    await utils.wait(page, 1000)
    await utils.waitForSelector(
      page,
      `.EnvironmentsSwitch-env[data-env=env_${fmt(newEnvName)}]`
    )
  })

  it('should be able to delete an environment', async () => {
    const envToDeleteName = 'toDelete'
    const envToDeleteHost = world.isLocal ? 'localhost' : 'kuzzle'
    const page = await world.getPage()

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)
    await sharedSteps.createEnvironment(page, envToDeleteName, envToDeleteHost)

    // Now delete it
    await utils.waitForSelector(page, '.EnvironmentsSwitch > .btn-flat')
    await utils.click(page, '.EnvironmentsSwitch > .btn-flat')

    utils.wait(page, 1000)
    await utils.click(
      page,
      `.EnvironmentsSwitch-env[data-env=env_${fmt(
        envToDeleteName
      )}] > i.fa-trash`
    )

    await utils.waitForSelector(page, '.EnvironmentDeleteModal-envName')
    await utils.click(page, '.EnvironmentDeleteModal-envName')

    await page.type('.EnvironmentDeleteModal-envName', envToDeleteName)

    await utils.waitForSelector(
      page,
      'div > #delete-env > .modal-footer > span > .btn'
    )
    await utils.click(page, 'div > #delete-env > .modal-footer > span > .btn')

    // Now verify the environment is no more present
    const foundEnvironment = await page.$(
      `.EnvironmentsSwitch-env[data-env=env_${fmt(envToDeleteName)}]`
    )
    expect(foundEnvironment).to.eql(null)
  })

  it('Properly sets a color for the environment', async () => {
    const page = await world.getPage()
    const newEnvName = 'colored'
    const newEnvHost = world.isLocal ? 'localhost' : 'kuzzle'
    const newEnvColorIdx = 3

    await page.goto(world.url)

    await sharedSteps.openCreateEnvModalIfExists(page)

    // Get the color of the box that will be clicked
    await utils.waitForSelector(
      page,
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
    await utils.waitForSelector(page, '.LoginAsAnonymous-Btn')
    await utils.click(page, '.LoginAsAnonymous-Btn')

    // Check the background color of the navbar is the selected one
    await utils.waitForSelector(page, 'nav')
    const headerColor = await page.$eval(
      'nav',
      node => node.style.backgroundColor
    )
    expect(headerColor).to.be.eql(selectedColor)
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

    // Select the valid environment
    await utils.waitForSelector(page, '.EnvironmentsSwitch > .btn-flat')
    await utils.click(page, '.EnvironmentsSwitch > .btn-flat')

    await utils.waitForSelector(
      page,
      `.EnvironmentsSwitch-env[data-env=env_${fmt(validEnvName)}]`
    )
    await utils.wait(page, 1000)
    await utils.click(
      page,
      `.EnvironmentsSwitch-env[data-env=env_${fmt(validEnvName)}]`
    )

    // Now verify that we are connected to a valid environment
    const isConnected = await sharedSteps.isConnected(page)
    expect(isConnected).to.be(true)
  })
})
