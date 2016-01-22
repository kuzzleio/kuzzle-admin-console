var
  assert = require('assert'),
  world = require('../../support/world.js');

module.exports = function () {
  this.Given(/^I am on browse data page for a collection$/, function (callback) {
    browser
      .url('/#/storage/browse/' + world.collection)
      .call(callback);
  });

  this.Then(/^I have a list with "([\d]*)" elements$/, function (count, callback) {
    browser
      .waitForVisible('documents-inline', 1000)
      .saveScreenshot('./features/errorShots/test.png')
      .elements('documents-inline .document-id')
      .then(elements => {
        assert.equal(elements.value.length, parseInt(count), 'Must have ' + count + ' elements, get ' + elements.value.length)
      })
      .call(callback);
  });

  //this.When(/^I click on create document button$/, function (callback) {
  //  browser
  //    .click('[ng-controller="StorageBrowseDocumentsCtrl"] .create button')
  //    .call(callback);
  //});
  //
  //this.Then(/^I am on url corresponding to document full view's route$/, function () {
  //  this.browser.assert.url(this.baseUrl + '#/storage/' + this.collection + '/add');
  //
  //  browser
  //    .getUrl()
  //    .then(url => {
  //
  //    })
  //});
  //
  // this.Given(/^I am on document full view's route$/, function (callback) {
  //   this.visit('#/storage/' + this.collection + '/add', callback);
  // });
  //
  // this.Then(/^I have an id input$/, function () {
  //   this.browser.assert.element('[ng-controller="StorageFullCtrl"] input[ng-model="document.id"]');
  // });
  //
  // this.Then(/^I have a form with fieldset "([^"]*)" with fields "([^"]*)"$/, function (fieldset, fields) {
  //   fields = fields.split(',');
  //
  //   fields.forEach(field => {
  //     this.browser.assert.elements('[ng-controller="StorageFullCtrl"] fieldset input[ng-model="model[\'' + fieldset + '\'][\''+ field + '\']"]');
  //   });
  // });
  //
  // this.Then(/^I have inputs "([^"]*)"$/, function (fields) {
  //   fields = fields.split(',');
  //
  //   fields.forEach(field => {
  //     this.browser.assert.element('[ng-controller="StorageFullCtrl"] input[id="' + field + '"]');
  //   });
  // });
  //
  // this.Then(/^I delete the last element in list and I cancel$/, {timeout: 20 * 1000}, function (callback) {
  //   this.browser.clickLink('documents-inline :last-child .panel .delete-document', () => {
  //     // directly after delete, click on cancel
  //     this.browser.clickLink('documents-inline :last-child .panel .cancel-delete-document', () => {
  //       setTimeout(() => {
  //         callback();
  //       }, 5000); // wait 5sec because we buffer delete for 5sec
  //     });
  //   });
  // });
  //
  // this.Then(/^I delete the last element in list$/, {timeout: 20 * 1000}, function (callback) {
  //   this.browser.clickLink('documents-inline :last-child .panel .delete-document', () => {
  //     setTimeout(() => {
  //       callback();
  //     }, 5000); // wait 5sec because we buffer delete for 5sec
  //   })
  // });
  //
  // this.Then(/^I am on page for edit document "([^"]*)"$/, {timeout: 20 * 1000}, function (id, callback) {
  //   this.visit('#/storage/' + this.collection + '/'+ id, callback);
  // });
};
