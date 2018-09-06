const puppeteer = require('puppeteer')

describe('Manage environments', () => {
  let browser, page

  before(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    page = await browser.newPage()
  })

  after(async () => {
    await browser.close()
  })

  afterEach(async () => {
    await page.screenshot({ path: '/app/output/test-end.png' })
  })

  it('should create a new environment', async () => {
    await page.setViewport({ width: 1920, height: 983 })

    await page.goto('http://backoffice:3000/#/login')

    await page.waitForSelector(
      '.environment > .row > .col > .input-field > #env-name'
    )

    await page.click('.environment > .row > .col > .input-field > #env-name')

    await page.type(
      '.environment > .row > .col > .input-field > #env-name',
      'local'
    )

    await page.type(
      '.environment > .row > .col > .input-field > #host',
      'kuzzle'
    )

    await page.type('.environment > .row > .col > .input-field > #ssl', 'on')

    await page.waitForSelector('.row > .col > .row > .col > .waves-effect')
    await page.click('.row > .col > .row > .col > .waves-effect')
  })
})
