// General setup for mocha test suite
// ===================================
const fs = require('fs')
const path = require('path')
const world = require('../world')
const utils = require('../utils')

before('Test environment setup...', async function() {
  const currentPath = path.join(
    utils.visualRegressionPaths.base,
    utils.visualRegressionPaths.current
  )
  if (!fs.existsSync(currentPath)) {
    fs.mkdirSync(currentPath)
    fs.chmodSync(currentPath, 0o777)
  }

  const diffPath = path.join(
    utils.visualRegressionPaths.base,
    utils.visualRegressionPaths.diff
  )
  if (!fs.existsSync(diffPath)) {
    fs.mkdirSync(diffPath)
    fs.chmodSync(diffPath, 0o777)
  }

  if (!fs.existsSync(world.failScreenshotPath)) {
    fs.mkdirSync(world.failScreenshotPath)
    fs.chmodSync(world.failScreenshotPath, 0o777)
  }
})

after('Test environment teardown...', async function() {
  world.kuzzle.disconnect()
  await world.close()
})

afterEach('Take screenshot if test failed', async function() {
  if (this.currentTest.state === 'failed') {
    const page = await world.getCurrentPage()
    const screenshotName = `e2e-fail-${Date.now()}.png`
    const screenshotPath = path.join(world.failScreenshotPath, screenshotName)
    try {
      await utils.screenshot(page, screenshotPath)

      if (process.env.TRAVIS) {
        console.log('====================================')
        console.log('Sending screenshots to Cloudinary...')
        console.log('====================================')
        await utils.sendToCloudinary(
          screenshotPath,
          `admin-console-test-fail-${Date.now()}`,
          [`travis-${process.env.TRAVIS_BUILD_NUMBER}`]
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
})
