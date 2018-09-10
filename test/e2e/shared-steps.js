module.exports = {
  openCreateEnvModalIfExists: async page => {
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
  },
  createEnvironment: async (page, name, host, port, colorIndex) => {
    // Create environment
    // ============================================
    await page.waitForSelector('.CreateEnvironment-name')

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
      timeout: 2000
    })
    await page.click('.Environment-SubmitButton')
  }
}
