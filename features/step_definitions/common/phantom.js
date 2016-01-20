module.exports = function () {
  this.World = require('../../support/world.js').World;

  this.Given(/^I go to the login page$/, function () {
    return this.visit('#/login');
  });

  this.Then(/^I have a login button$/, function() {
    //this.browser.waitForElementByCss('button[type="submit"]', 5000, function(err, el) {
    //  if (err) {
    //    callback.fail();
    //  } else {
    //    this.browser.takeScreenshot(function (error, screenshot) {
    //      // console.log("screenshot taken", error, screenshot);
    //      fs.writeFile('logo.png', screenshot, 'base64', function(err){
    //        if (err) throw err
    //        console.log('File saved.')
    //        callback();
    //      });
    //      // this.browser.quit();
    //    });
    //  }
    //}.bind(this));

    return this.browser.waitForElementByCss('button[type="submit"]', 5000)
      .then(() => {
        return this.takeScreenshot('login-button');
      })
  });
};
