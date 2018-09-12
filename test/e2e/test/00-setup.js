// General setup for mocha test suite
// ===================================
const fs = require('fs')
const path = require('path')
const world = require('../world')
const utils = require('../utils')
let browser

before('Test environment setup...', async function() {
  const currentPath = path.join(
    utils.visualRegressionPaths.base,
    utils.visualRegressionPaths.current
  )
  if (!fs.existsSync(currentPath)) {
    fs.mkdirSync(currentPath)
  }

  const diffPath = path.join(
    utils.visualRegressionPaths.base,
    utils.visualRegressionPaths.diff
  )
  if (!fs.existsSync(diffPath)) {
    fs.mkdirSync(diffPath)
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

      if (process.env.CI) {
        console.log('====================================')
        console.log('Sending screenshots to Cloudinary...')
        console.log('====================================')
        utils.sendToCloudinary(
          screenshotPath,
          `admin-console-test-fail-${Date.now()}`
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
})
