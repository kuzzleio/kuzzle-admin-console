var assert = require('assert');

module.exports = function () {
  this.Given(/^I shut down the Kuzzle server$/, function (callback) {
    browser
      // WARNING - this step is incomplete since this method is not
      // supported by GhostDriver. We still need to find a way to
      // shut down / start Kuzzle via Cucumber JS.

      // .setNetworkConnection({type: 1})
      .call(callback);
  });

  this.Then(/^I get a disconnection notification$/, function (callback) {
    browser
      .pause(1000)
      .waitForVisible('.ui-notification h3')
      .getText('.ui-notification h3')
      .then(text => {
        assert.equal(text, 'Houston, we have a problem.');
      })
      .call(callback);
    });
};
