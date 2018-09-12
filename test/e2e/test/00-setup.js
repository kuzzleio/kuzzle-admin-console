// General setup for mocha test suite
// ===================================
const fs = require('fs')
const world = require('../world')
const utils = require('../utils')
let browser

before('Getting browser and page...', async function() {
  if (!fs.existsSync(utils.visualRegressionPaths.current)) {
    fs.mkdirSync(utils.visualRegressionPaths.current)
  }

  if (!fs.existsSync(utils.visualRegressionPaths.diff)) {
    fs.mkdirSync(utils.visualRegressionPaths.diff)
  }

  browser = await world.getBrowser()
  await world.getPage()
})

after('Close browser', async function() {
  await browser.close()
  world.kuzzle.disconnect()
})
