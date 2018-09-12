const world = require('./world')

class SharedSteps {
  async openCreateEnvModalIfExists(page) {
    try {
      await page.waitForSelector('.EnvironmentsSwitch > .btn-flat', {
        timeout: world.defaultWaitElTimeout
      })
      await page.click('.EnvironmentsSwitch > .btn-flat')

      await page.waitForSelector('.EnvironmentsSwitch-newConnectionBtn', {
        timeout: world.defaultWaitElTimeout
      })
      await page.click('.EnvironmentsSwitch-newConnectionBtn')
    } catch (error) {}
  }
  async createEnvironment(page, name, host, port, colorIndex) {
    // Create environment
    // ============================================
    await page.waitForSelector('.CreateEnvironment-name', {
      timeout: world.defaultWaitElTimeout
    })

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
      await page.click(
        `.CreateEnvironment-colorBtns div:nth-child(${colorIndex}) div.color`
      )
    }

    await page.waitForSelector('.Environment-SubmitButton', {
      timeout: world.defaultWaitElTimeout
    })
    await page.click('.Environment-SubmitButton')
  }
  async connectToValidEnvironment(page) {
    const validEnvName = 'kuzzle'
    const validEnvHost = world.isLocal ? 'localhost' : 'kuzzle'

    await this.openCreateEnvModalIfExists(page)
    await this.createEnvironment(page, validEnvName, validEnvHost)
  }
  async isLoggedIn(page) {
    try {
      await page.waitForSelector('.App-loggedIn', {
        timeout: world.defaultWaitElTimeout
      })
      return true
    } catch (error) {
      return false
    }
  }
  async isConnected(page) {
    try {
      await page.waitForSelector('.App-connected', {
        timeout: world.defaultWaitElTimeout
      })
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
      await page.waitForSelector('.LoginAsAnonymous-Btn', {
        timeout: world.defaultWaitElTimeout
      })
      await page.click('.LoginAsAnonymous-Btn')
    }
  }
  async createIndex(page, name) {
    await page.waitForSelector('.IndexesPage-createBtn', {
      timeout: world.defaultWaitElTimeout
    })
    await page.click('.IndexesPage-createBtn')

    await page.waitForSelector('.CreateIndexModal-name', {
      timeout: world.defaultWaitElTimeout
    })
    await page.type('.CreateIndexModal-name', name)

    await page.waitForSelector('.CreateIndexModal-createBtn', {
      timeout: world.defaultWaitElTimeout
    })
    await page.click('.CreateIndexModal-createBtn')
  }
}

module.exports = new SharedSteps()
