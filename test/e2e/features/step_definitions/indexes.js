const { Given, When, Then } = require('cucumber')
const expect = require('expect.js')
const utils = require('../../utils')

Given('I have no indexes', async function() {
  const indexCount = await this.page.$$eval('.IndexBoxed', envs => envs.length)
  expect(indexCount).to.be(0)
})

When(/I create a new index called (.*)/, async function(name) {
  await utils.click(this.page, '.IndexesPage-createBtn')

  await utils.waitForSelector(this.page, '.CreateIndexModal-name')
  await this.page.type('.CreateIndexModal-name', name)

  await utils.click(this.page, '.CreateIndexModal-createBtn')

  await this.page.waitForFunction(
    () => {
      return document.querySelector('.CreateIndexModal .modal-content') === null
    },
    {
      timeout: 2000
    }
  )
})

Then(/I can see the (.*) index in the list/, async function(name) {
  await this.page.waitForFunction(
    indexName =>
      document.querySelectorAll(`.IndexBoxed[title="${indexName}"]`).length ===
      1,
    {},
    name
  )
})
