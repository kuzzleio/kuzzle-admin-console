const { Before, BeforeAll, After, AfterAll } = require('cucumber')
const puppeteer = require('puppeteer')
const Kuzzle = require('kuzzle-sdk')

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

Before(async function() {
  this.kuzzle = await instantiateKuzzle(this.kuzzleHostname)
  this.browser = await puppeteer.launch(this.puppeteerOpts)
  this.page = await this.browser.newPage()
  await this.page.setViewport({ width: 1400, height: 900 })
})

BeforeAll(async function() {})

AfterAll(async function() {})

After(async function() {
  this.kuzzle.disconnect()
  await this.page.close()
  await this.browser.close()
})
