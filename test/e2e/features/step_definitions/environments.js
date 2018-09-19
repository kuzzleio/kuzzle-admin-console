const { Given, When, Then } = require('cucumber')
const expect = require('expect.js')
const utils = require('../../utils')

Given('I open the admin console with no environments', async function() {
  const envCount = await this.page.$$eval(
    '.EnvironmentsSwitch-env',
    envs => envs.length
  )
  expect(envCount).to.be(0)
})

When(/I create a new valid environment called (.*)/, async function(envName) {
  try {
    await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')
    await utils.click(this.page, '.EnvironmentsSwitch-newConnectionBtn')
  } catch (error) {}

  await utils.waitForSelector(this.page, '.CreateEnvironment-name')

  await this.page.type('.CreateEnvironment-name', envName)
  await this.page.type('.CreateEnvironment-host', this.kuzzleHostname)

  await utils.click(this.page, '.Environment-SubmitButton')
})

Then(/I should see (.*) in the environment dropdown/, async function(envName) {
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.waitForSelector(
    this.page,
    `.EnvironmentsSwitch-env[data-env="env_${envName}"]`
  )
})

Then(
  'The environment creation form is visible and well formed',
  async function() {
    const screenshotName = 'no-env.create'
    const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)
    await utils.waitForSelector(this.page, '.CreateEnvironmentPage')
    const createEnvForm = await this.page.$('.CreateEnvironmentPage')

    await utils.screenshot(createEnvForm, currentScreenshotPath)
    await utils.compareScreenshot(screenshotName)
  }
)

Then('I am connected to the selected environment', async function() {
  await utils.waitForSelector(this.page, '.App-connected', 10000)
})
