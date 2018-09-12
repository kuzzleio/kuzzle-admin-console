// General setup for mocha test suite
// ===================================
const fs = require('fs')
const path = require('path')
const world = require('../world')
const utils = require('../utils')
let browser

before('Test environment setup...', async function() {
  if (!fs.existsSync(utils.visualRegressionPaths.current)) {
    fs.mkdirSync(utils.visualRegressionPaths.current)
  }

  if (!fs.existsSync(utils.visualRegressionPaths.diff)) {
    fs.mkdirSync(utils.visualRegressionPaths.diff)
  }

  if (!fs.existsSync(world.failScreenshotPath)) {
    fs.mkdirSync(world.failScreenshotPath)
  }

  browser = await world.getBrowser()
  await world.getPage()
})

after('Test environment teardown...', async function() {
  await browser.close()
  world.kuzzle.disconnect()
})

afterEach('Take screenshot if test failed', async function() {
  if (this.currentTest.state === 'failed') {
    const page = await world.getPage()
    const screenshotName = `e2e-fail-${Date.now()}.png`
    const screenshotPath = path.join(world.failScreenshotPath, screenshotName)
    try {
      await page.screenshot({
        path: screenshotPath
      })
    } catch (error) {
      console.log(error)
    }
    if (process.env.CI) {
      try {
        utils.sendToCloudinary(screenshotPath)
      } catch (error) {
        console.log(error)
      }
    }
  }
})
