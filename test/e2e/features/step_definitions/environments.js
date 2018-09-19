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
    await utils.waitForSelector(this.page, '.EnvironmentsSwitch > .btn-flat')
    await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

    await utils.waitForSelector(
      this.page,
      '.EnvironmentsSwitch-newConnectionBtn'
    )
    await utils.click(this.page, '.EnvironmentsSwitch-newConnectionBtn')
  } catch (error) {}

  await utils.waitForSelector(this.page, '.CreateEnvironment-name')

  await this.page.type('.CreateEnvironment-name', envName)
  await this.page.type('.CreateEnvironment-host', this.kuzzleHostname)

  await utils.waitForSelector(this.page, '.Environment-SubmitButton')
  await utils.click(this.page, '.Environment-SubmitButton')
})

Then(/I should see (.*) in the environment dropdown/, async function(envName) {
  await utils.waitForSelector(this.page, '.EnvironmentsSwitch > .btn-flat')
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.waitForSelector(
    this.page,
    `.EnvironmentsSwitch-env[data-env="env_${envName}"]`
  )
})
