var
  assert = require('assert'),
  world = require('../../support/world.js');

module.exports = function () {
  this.Given(/^I am on browse data page for a ?(bad)* collection$/, function (bad, callback) {
    if (bad) {
      browser
        .url('/#/fakeindex/storage/browse/' + world.collection)
        .call(callback);
    }
    else {
      browser
        .url('/#/' + world.index + '/storage/browse/' + world.collection)
        .call(callback);
    }
  });

  this.Then(/^I have a list with "([\d]*)" elements$/, function (count, callback) {
    browser
      .waitForVisible('documents-inline .row', 1000)
      .elements('documents-inline .document-id')
      .then(elements => {
        assert.equal(elements.value.length, parseInt(count), 'Must have ' + count + ' elements, get ' + elements.value.length)
      })
      .call(callback);
  });

  this.When(/^I click on create document button$/, function (callback) {
    browser
      .click('[ng-controller="StorageBrowseDocumentsCtrl"] .create button')
      .call(callback);
  });

  this.Then(/^the current URL corresponds to the add document page$/, function (callback) {
    browser
      .waitForVisible('.edit-id')
      .getUrl()
      .then(url => {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/storage/' + world.collection + '/add');
      })
      .call(callback);
  });

   this.Given(/^I am on document full view's route$/, function (callback) {
     browser
       .url('/#/' + world.index + '/storage/' + world.collection + '/add')
       .call(callback);
   });

  this.Then(/^I have an id input$/, function (callback) {
    browser
      .waitForVisible('[ng-controller="StorageFullCtrl"] input[ng-model="document.id"]', 1000)
      .call(callback);
  });

   this.Then(/^I have a form with fieldset "([^"]*)" with field "([^"]*)"$/, function (fieldset, field, callback) {
     browser
       .waitForVisible('[ng-controller="StorageFullCtrl"] fieldset input[ng-model="model[\'' + fieldset + '\'][\''+ field + '\']"]', 1000)
       .call(callback);
   });


  this.Then(/^I delete the last element in list and I cancel$/, function (callback) {
    browser
      .waitForVisible('documents-inline :last-child .panel .edit.dropdown-toggle', 1000)
      .click('documents-inline :last-child .panel .edit.dropdown-toggle')
      .click('documents-inline :last-child .panel .delete-document')
      .waitForVisible('documents-inline :last-child .panel .cancel-delete-document', 1000)
      .click('documents-inline :last-child .panel .cancel-delete-document')
      .call(() => {
        // wait 5sec because we buffer delete for 5sec
        setTimeout(() => {
          callback();
        }, 6000);
      });
  });

  this.Then(/^I delete the last element in list$/, function (callback) {
    browser
      .waitForVisible('documents-inline :last-child .panel .edit.dropdown-toggle', 1000)
      .click('documents-inline :last-child .panel .edit.dropdown-toggle')
      .click('documents-inline :last-child .panel .delete-document')
      .call(() => {
        // wait 5sec because we buffer delete for 5sec
        setTimeout(() => {
          callback();
        }, 6000);
      });
  });

  this.Then(/^I am on page for edit document "([^"]*)"$/, function (id, callback) {
    browser
      .pause(1000)
      .url('/#/' + world.index + '/storage/' + world.collection + '/'+ id)
      .pause(1000)
      .getHTML('body', function(html) {console.log(html)})
      .waitForVisible('form fieldset', 1000)
      .call(callback)
  });
};
