const { setWorldConstructor, setDefaultTimeout } = require('cucumber')
// const Kuzzle = require('kuzzle-sdk')
const puppeteer = require('puppeteer')

function CustomWorld() {
  this.isLocal = process.env.e2eLocal !== undefined

  const baseOpts = {
    args: ['--no-sandbox'],
    dumpio: process.env.show_console_output !== undefined
  }
  const localDevOpts = {
    headless: false,
    slowMo: 120
  }

  this.browser = puppeteer.launch(
    this.isLocal ? Object.assign(baseOpts, localDevOpts) : baseOpts
  )

  this.url = process.env.e2eLocal
    ? 'http://localhost:3000'
    : 'http://adminconsole:3000'
}

setDefaultTimeout(60 * 1000)
setWorldConstructor(CustomWorld)
