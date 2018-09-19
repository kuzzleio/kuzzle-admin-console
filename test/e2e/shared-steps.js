const world = require('./world')
const utils = require('./utils')

class SharedSteps {
  async openCreateEnvModalIfExists(page) {
    try {
      await utils.waitForSelector(page, '.EnvironmentsSwitch > .btn-flat')
      await utils.click(page, '.EnvironmentsSwitch > .btn-flat')

      await utils.waitForSelector(page, '.EnvironmentsSwitch-newConnectionBtn')
      await utils.click(page, '.EnvironmentsSwitch-newConnectionBtn')
    } catch (error) {}
  }
  async createEnvironment(page, name, host, port, colorIndex) {
    // Create environment
    // ============================================
    await utils.waitForSelector(page, '.CreateEnvironment-name')

    if (name) {
      await page.type('.CreateEnvironment-name', name)
    }
    if (host) {
      await page.type('.CreateEnvironment-host', host)
    }
    if (port) {
      await page.type('.CreateEnvironment-port', port)
    }
    if (colorIndex) {
      await utils.click(
        page,
        `.CreateEnvironment-colorBtns div:nth-child(${colorIndex}) div.color`
      )
    }

    await utils.waitForSelector(page, '.Environment-SubmitButton')
    await utils.click(page, '.Environment-SubmitButton')
  }
  async connectToValidEnvironment(page) {
    const validEnvName = 'kuzzle'
    const validEnvHost = world.isLocal ? 'localhost' : 'kuzzle'

    await this.openCreateEnvModalIfExists(page)
    await this.createEnvironment(page, validEnvName, validEnvHost)
    await this.isConnected(page)
  }
  async isLoggedIn(page) {
    try {
      await utils.waitForSelector(page, '.App-loggedIn')
      return true
    } catch (error) {
      return false
    }
  }
  async isConnected(page) {
    try {
      await utils.waitForSelector(page, '.App-connected', 10000)
      return true
    } catch (error) {
      return false
    }
  }
  async logInAsAnonymous(page) {
    if (!(await this.isConnected(page))) {
      await this.connectToValidEnvironment(page)
    }
    if (!(await this.isLoggedIn(page))) {
      await utils.waitForSelector(page, '.LoginAsAnonymous-Btn')
      await utils.click(page, '.LoginAsAnonymous-Btn')
      await this.isLoggedIn(page)
    }
  }
  async createIndex(page, name) {
    await utils.waitForSelector(page, '.IndexesPage-createBtn')
    await utils.click(page, '.IndexesPage-createBtn')

    await utils.waitForSelector(page, '.CreateIndexModal-name')
    await page.type('.CreateIndexModal-name', name)

    await utils.waitForSelector(page, '.CreateIndexModal-createBtn')
    await utils.click(page, '.CreateIndexModal-createBtn')

    await page.waitForFunction(
      () => {
        return (
          document.querySelector('.CreateIndexModal .modal-content') === null
        )
      },
      {
        timeout: 2000
      }
    )
  }
}

module.exports = new SharedSteps()
