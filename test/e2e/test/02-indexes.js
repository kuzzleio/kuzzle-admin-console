const world = require('../world')
const expect = require('expect.js')
const sharedSteps = require('../shared-steps')
const utils = require('../utils.js')

describe('Indexes and Collections', function() {
  beforeEach(async () => {
    const indexes = await world.kuzzle.listIndexesPromise()
    indexes.forEach(index =>
      world.kuzzle.queryPromise(
        { index, controller: 'index', action: 'delete' },
        {}
      )
    )
  })

  it('[VISUAL] Indexes page (empty state)', async () => {
    const screenshotName = 'data.indexes.empty'
    const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)

    const page = await world.getPage()
    await page.goto(world.url)

    await sharedSteps.logInAsAnonymous(page)

    await page.screenshot({
      path: currentScreenshotPath
    })

    await utils.compareScreenshot(screenshotName)
  })

  it('[VISUAL] Indexes page (one index)', async () => {
    const indexName = 'testindex'
    const screenshotName = 'data.indexes.oneindex'
    const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)

    const page = await world.getPage()
    await page.goto(world.url)

    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await page.waitForSelector(`.IndexBoxed[title=${indexName}]`, {
      timeout: 2000
    })

    await page.screenshot({
      path: currentScreenshotPath
    })

    await utils.compareScreenshot(screenshotName)
  })

  it('Should properly create an index', async () => {
    const indexName = 'testindex'
    const page = await world.getPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await page.waitForSelector(`.IndexBoxed[title=${indexName}]`, {
      timeout: 2000
    })

    // Check that one .IndexBoxed-name element exists that contains indexName
    const createdIdxEl = await page.$$eval('.IndexBoxed-name', elements => {
      return Array.from(elements).find(el => el.innerHTML === 'testindex') // indexName constant seems to be out of the closure here
    })
    expect(createdIdxEl).not.to.be(undefined)
  })

  it('Should not allow to create the same index twice', async () => {
    const indexName = 'sameindex'
    const page = await world.getPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await page.waitForSelector(`.IndexBoxed[title=${indexName}]`, {
      timeout: 2000
    })
    await sharedSteps.createIndex(page, indexName)
    await page.waitForSelector('.CreateIndexModal-error', { timeout: 2000 })
  })

  it('Should properly delete an index', async () => {
    const indexName = 'testindex'
    const page = await world.getPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)

    await page.waitForSelector(`.IndexBoxed[title=${indexName}]`, {
      timeout: 2000
    })
    await page.click(`.IndexBoxed[title=${indexName}] .IndexBoxed-dropdown`)

    await page.waitForSelector(
      `.IndexBoxed[title=${indexName}] .IndexDropdown-delete`,
      { timeout: 2000 }
    )
    await page.click(`.IndexBoxed[title=${indexName}] .IndexDropdown-delete`)

    // Create a watchdog to wait for the index to be really deleted
    const indexIsDeleted = page.waitForFunction(
      `document.querySelector('.IndexBoxed[title=${indexName}]') === null`,
      { timeout: 5000 }
    )

    await page.waitForSelector('.IndexDeleteModal-name', { timeout: 2000 })
    await page.type('.IndexDeleteModal-name', indexName)
    await page.click('.IndexDeleteModal-deleteBtn')

    // Await the watchdog condition
    await indexIsDeleted
  })
})
