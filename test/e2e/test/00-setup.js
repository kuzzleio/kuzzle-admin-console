// General setup for mocha test suite
// ===================================

const world = require('../world')
let browser

before('Getting browser and page...', async function() {
  browser = await world.getBrowser()
  await world.getPage()
})

after('Close browser', async function() {
  await browser.close()
  world.kuzzle.disconnect()
})
