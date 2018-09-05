const puppeteer = require('puppeteer')
;(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  await page.setViewport({ width: 1920, height: 983 })

  await page.goto('http://backoffice:3000/#/login')

  await page.waitForSelector(
    '.environment > .row > .col > .input-field > #env-name'
  )

  await page.screenshot({ path: '/app/output/step1.png' })

  await page.click('.environment > .row > .col > .input-field > #env-name')

  await page.type(
    '.environment > .row > .col > .input-field > #env-name',
    'local'
  )

  await page.type('.environment > .row > .col > .input-field > #host', 'kuzzle')

  await page.type('.environment > .row > .col > .input-field > #port', '7512')

  await page.type('.environment > .row > .col > .input-field > #ssl', 'on')

  await page.waitForSelector('.row > .col > .row > .col > .waves-effect')
  await page.click('.row > .col > .row > .col > .waves-effect')

  await page.screenshot({ path: '/app/output/step3.png' })

  await browser.close()
})()
