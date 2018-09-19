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

    const page = await world.getNewPage()
    await page.goto(world.url)

    await sharedSteps.logInAsAnonymous(page)

    await utils.waitForSelector(page, '.IndexesPage')
    const indexes = await page.$('.IndexesPage')

    await utils.screenshot(indexes, currentScreenshotPath)
    await utils.compareScreenshot(screenshotName)
  })

  it('[VISUAL] Indexes page (one index)', async () => {
    const indexName = 'testindex'
    const screenshotName = 'data.indexes.oneindex'
    const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)

    const page = await world.getNewPage()
    await page.goto(world.url)

    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await utils.waitForSelector(page, `.IndexBoxed[title=${indexName}]`)

    const indexes = await page.$('.IndexesPage')

    await utils.screenshot(indexes, currentScreenshotPath)
    await utils.compareScreenshot(screenshotName)
  })

  it('Should properly create an index', async () => {
    const indexName = 'testindex'
    const page = await world.getNewPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await utils.waitForSelector(page, `.IndexBoxed[title=${indexName}]`)

    // Check that one .IndexBoxed-name element exists that contains indexName
    const createdIdxEl = await page.$$eval('.IndexBoxed-name', elements => {
      return Array.from(elements).find(el => el.innerHTML === 'testindex') // indexName constant seems to be out of the closure here
    })
    expect(createdIdxEl).not.to.be(undefined)
  })

  it('Should not allow to create the same index twice', async () => {
    const indexName = 'sameindex'
    const page = await world.getNewPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)
    await utils.waitForSelector(page, `.IndexBoxed[title=${indexName}]`)
    try {
      await sharedSteps.createIndex(page, indexName)
    } catch (error) {
      await utils.waitForSelector(page, '.CreateIndexModal-error')
    }
  })

  it('Should properly delete an index', async () => {
    const indexName = 'testindex'
    const page = await world.getNewPage()

    await page.goto(world.url)
    await sharedSteps.logInAsAnonymous(page)
    await sharedSteps.createIndex(page, indexName)

    await utils.waitForSelector(page, `.IndexBoxed[title=${indexName}]`)
    await utils.click(
      page,
      `.IndexBoxed[title=${indexName}] .IndexBoxed-dropdown`
    )

    await utils.waitForSelector(
      page,
      `.IndexBoxed[title=${indexName}] .IndexDropdown-delete`
    )
    await utils.click(
      page,
      `.IndexBoxed[title=${indexName}] .IndexDropdown-delete`
    )

    await utils.waitForSelector(page, '.IndexDeleteModal-name')
    await page.type('.IndexDeleteModal-name', indexName)
    await utils.click(page, '.IndexDeleteModal-deleteBtn')
    await utils.wait(page, 2000)

    const selector = `.IndexBoxed[title="${indexName}"]`
    await page.waitForFunction(
      selector => document.querySelector(selector) === null,
      { timeout: world.defaultWaitElTimeout },
      selector
    )
  })
})
