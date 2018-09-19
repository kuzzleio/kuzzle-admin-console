const puppeteer = require('puppeteer')
const Kuzzle = require('kuzzle-sdk')

let browser
let page
let kuzzle = new Kuzzle(process.env.e2eLocal ? 'localhost' : 'kuzzle')

const getBrowser = async () => {
  const isLocal = process.env.e2eLocal !== undefined
  const baseOpts = {
    args: ['--no-sandbox'],
    dumpio: process.env.show_console_output !== undefined,
    slowMo: 120
  }
  const localDevOpts = {
    headless: false,
    slowMo: 120
  }
  if (browser) {
    await browser.close()
  }
  browser = await puppeteer.launch(
    isLocal ? Object.assign(baseOpts, localDevOpts) : baseOpts
  )
  return browser
}

const getNewPage = async () => {
  if (page) {
    await page.close()
  }
  const browser = await getBrowser()
  page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 900 })
  return page
}

const close = async () => {
  await page.close()
  await browser.close()
}

module.exports = {
  getNewPage,
  getCurrentPage: () => page,
  close,
  isLocal: process.env.e2eLocal !== undefined,
  kuzzle,
  defaultTestTimeout: 900000,
  defaultWaitElTimeout: process.env.waitElTimeout || 3000,
  failScreenshotPath: `${__dirname}/failed-tests`,
  url: process.env.e2eLocal
    ? 'http://localhost:3000'
    : 'http://adminconsole:3000'
}
