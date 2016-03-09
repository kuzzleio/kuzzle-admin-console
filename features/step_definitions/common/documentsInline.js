var
  assert = require('assert');

module.exports = function () {
  this.Then(/^I have a list with "([\d]*)" element[s]?$/, function (count, callback) {
    browser
      .isExisting('documents-inline .documents')
      .then(isExisting => {
        if (!isExisting) {
          if (parseInt(count) === 0) {
            callback();
          }
          else {
            callback('Expected to find ' + count + ' elements');
          }
        }
        else {
          browser
            .elements('documents-inline .documents')
            .then(elements => {
              assert.equal(elements.value.length, parseInt(count),
                'Expected to find ' + count + ' elements, found ' + elements.value.length);
            })
            .call(callback);
        }
      })
      
  });

  this.Then(/^I have a list with at least "([\d]*)" element[s]?$/, function (count, callback) {
    browser
      .waitForVisible('documents-inline .documents', 1000)
      .elements('documents-inline .documents')
      .then(elements => {
        assert(elements.value.length >= parseInt(count),
          'Expected to find at least ' + count + ' elements, found ' + elements.value.length);
      })
      .call(callback);
  });
};
