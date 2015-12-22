module.exports = function () {
  this.Then(/^I'm waiting ([\d]*) sec$/, function (time, callback) {
    setTimeout(() => {
      callback();
    }, parseInt(time) * 1000);
  });
};