// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    browser
    .url('http://localhost:3000')
      .waitForElementVisible('#loginForm', 5000)
      .assert.elementCount('input', 2)
      .end()
  }
}
