module.exports = function () {
  this.When(/^I'm waiting for the element with class "([^"]*)"$/, function (cssClass, callback) {
    browser
      .waitForVisible('.' + cssClass, 1000)
      .call(callback);
  });

  this.When(/^I'm waiting ([\d]*) sec$/, function (time, callback) {
    setTimeout(() => {
      callback();
    }, parseInt(time) * 1000);
  });
};
