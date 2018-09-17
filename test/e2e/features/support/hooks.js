const log = require('why-is-node-running')
const { Before, After, AfterAll } = require('cucumber')

Before(async function() {
  const browser = await this.browser
  this.page = await browser.newPage()
  await this.page.setViewport({ width: 1400, height: 900 })
})

After(async function() {
  await this.page.close()
  const browser = await this.browser
  await browser.close()
})

AfterAll(function() {
  console.error('AFTERALLLLLLLL')
  log()
})
