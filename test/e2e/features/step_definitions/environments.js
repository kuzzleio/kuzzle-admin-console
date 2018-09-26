const { Given, When, Then } = require('cucumber')
const expect = require('expect.js')
const utils = require('../../utils')
const fmt = require('../../../../src/utils').formatForDom

Given('I open the admin console with no environments', async function() {
  const envCount = await this.page.$$eval(
    '.EnvironmentsSwitch-env',
    envs => envs.length
  )
  expect(envCount).to.be(0)
})

When(
  /I create a new (in)?valid environment called (\w*)( with color )?(\d?)/,
  async function(invalid, envName, withColor, colorIndex) {
    const kuzzleHost = invalid === 'in' ? 'invalid' : this.kuzzleHostname
    try {
      await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')
      await utils.click(this.page, '.EnvironmentsSwitch-newConnectionBtn')
    } catch (error) {}

    await utils.waitForSelector(this.page, '.CreateEnvironment-name')

    await this.page.type('.CreateEnvironment-name', envName)
    await this.page.type('.CreateEnvironment-host', kuzzleHost)

    if (colorIndex) {
      await utils.click(
        this.page,
        `.CreateEnvironment-colorBtns div:nth-child(${colorIndex}) div.color`
      )
    }

    await utils.click(this.page, '.Environment-SubmitButton')
  }
)

When(/I delete the environment called (.*)/, async function(envName) {
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  utils.wait(this.page, 1000)
  await utils.click(
    this.page,
    `.EnvironmentsSwitch-env[data-env=env_${fmt(envName)}] > i.fa-trash`
  )

  await utils.click(this.page, '.EnvironmentDeleteModal-envName')
  await this.page.type('.EnvironmentDeleteModal-envName', envName)
  await utils.click(
    this.page,
    'div > #delete-env > .modal-footer > span > .btn'
  )
})

When(/I switch to the (\w*) environment/, async function(envName) {
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.wait(this.page, 1000)
  await utils.click(
    this.page,
    `.EnvironmentsSwitch-env[data-env=env_${fmt(envName)}]`
  )
})

Then(/I should see (.*) in the environment dropdown/, async function(envName) {
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.waitForSelector(
    this.page,
    `.EnvironmentsSwitch-env[data-env="env_${envName}"]`
  )
})

Then(/I should not see (.*) in the environment dropdown/, async function(
  envName
) {
  // await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.selectorIsNotPresent(
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

Then('I am not connected to Kuzzle', async function() {
  await utils.waitForSelector(this.page, '.App-errored', 10000)
})

Then(
  /I should see that the navbar has the background color (.*)/,
  async function(color) {
    await utils.waitForSelector(this.page, 'nav')
    const headerColor = await this.page.$eval(
      'nav',
      node => node.style.backgroundColor
    )
    expect(headerColor).to.be.eql(color)
  }
)
