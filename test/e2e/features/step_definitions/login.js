const { When, Then } = require('cucumber')
const utils = require('../../utils')

When('I login as anonymous', async function() {
  await utils.click(this.page, '.LoginAsAnonymous-Btn')
})

Then('I am logged in', async function() {
  await utils.waitForSelector(this.page, '.App-loggedIn')
})
