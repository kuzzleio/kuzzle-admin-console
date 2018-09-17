const { Given, When, Then } = require('cucumber')
const utils = require('../../utils')

Given('I open the admin console with no environments', async function() {
  await this.page.goto(this.url)
})

When('I create a new environment called local', async function() {
  const newEnvHost = this.isLocal ? 'localhost' : 'kuzzle'

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

  await this.page.type('.CreateEnvironment-name', 'local')

  await this.page.type('.CreateEnvironment-host', newEnvHost)

  // await this.page.type('.CreateEnvironment-port', '7512')

  await utils.waitForSelector(this.page, '.Environment-SubmitButton', {
    timeout: this.defaultWaitElTimeout
  })
  await utils.click(this.page, '.Environment-SubmitButton')
})

Then('I should see local in the environment dropdown', async function() {
  await utils.waitForSelector(this.page, '.EnvironmentsSwitch > .btn-flat')
  await utils.click(this.page, '.EnvironmentsSwitch > .btn-flat')

  await utils.waitForSelector(this.page, `#EnvironmentsSwitch-env_local`)
})
