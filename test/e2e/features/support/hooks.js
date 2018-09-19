const { Before, BeforeAll, After, AfterAll } = require('cucumber')
const fs = require('fs')
const Kuzzle = require('kuzzle-sdk')
const path = require('path')
const puppeteer = require('puppeteer')
const utils = require('../../utils')

const failScreenshotPath = `${__dirname}/../../failed-tests`

const instantiateKuzzle = async host => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line
    new Kuzzle(host, (err, kuzzle) => {
      if (err) {
        reject(err)
        return
      }
      resolve(kuzzle)
    })
  })
}

BeforeAll(async function() {
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

  if (!fs.existsSync(failScreenshotPath)) {
    fs.mkdirSync(failScreenshotPath)
    fs.chmodSync(failScreenshotPath, 0o777)
  }
})

Before(async function() {
  this.kuzzle = await instantiateKuzzle(this.kuzzleHostname)
  this.browser = await puppeteer.launch(this.puppeteerOpts)
  this.page = await this.browser.newPage()
  await this.page.setViewport({ width: 1400, height: 900 })
  await this.page.goto(this.url)
})

AfterAll(async function() {})

After(async function(testCase) {
  // console.log(JSON.stringify(testCase))
  if (testCase.result.status !== 'passed') {
    const screenshotName = `e2e-fail-${Date.now()}.png`
    const screenshotPath = path.join(failScreenshotPath, screenshotName)

    console.log('Taking local screenshot...')
    await utils.screenshot(this.page, screenshotPath)

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
  }
  this.kuzzle.disconnect()
  await this.page.close()
  await this.browser.close()
})
