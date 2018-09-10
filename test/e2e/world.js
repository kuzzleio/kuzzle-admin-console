const puppeteer = require('puppeteer')

let browser

module.exports = {
  getBrowser: async () => {
    if (!browser) {
      const isLocal = false
      const baseOpts = {
        args: ['--no-sandbox'],
        defaultViewport: { width: 1920, height: 983 },
        dumpio: true
      }
      const localDevOpts = {
        executablePath: '/usr/bin/chromium-browser',
        headless: false,
        slowMo: 120
      }
      browser = await puppeteer.launch(
        isLocal ? Object.assign(baseOpts, localDevOpts) : baseOpts
      )
    }
    return browser
  }
}
