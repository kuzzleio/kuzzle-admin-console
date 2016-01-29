var
  assert = require('assert'),
  world = require('../../support/world.js');

module.exports = function () {
  this.Given(/^I am on browse data page$/, function (callback) {
    browser
      .url('/#/' + world.index + '/storage/browse')
      .call(callback);
  });
  this.Given(/^I am on browse data page with an wrong index$/, function (callback) {
    browser
      .url('/#/notexist/storage/browse')
      .call(callback);
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

  this.When(/^I click on add document button$/, function (callback) {
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

   this.Given(/^I am on page for create document$/, function (callback) {
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
      .url('/#/' + world.index + '/storage/' + world.collection + '/'+ id)
      .waitForVisible('form fieldset', 1000)
      .call(callback)
  });

  this.Then(/^I choose the collection "([^"]*)"$/, function (collection, callback) {
    browser
      .waitForVisible('collections-drop-down-search .dropdown-toggle', 1000)
      .pause(500)
      .click('collections-drop-down-search .dropdown-toggle')
      .pause(500)
      .waitForVisible('collections-drop-down-search  ul li:last-child a', 1000)
      .click('collections-drop-down-search ul li:last-child a')
      .call(callback);
  });

  this.When(/^I click on link to access to "([^"]*)" full document page$/, function (id, callback) {
    browser
      .waitForVisible('documents-inline #' + id + ' .full-view', 1000)
      .click('documents-inline #' + id + ' .full-view')
      .call(callback);
  });

  this.Then(/^the current URL corresponds to the "([^"]*)" full document page$/, function (id, callback) {
    browser
      .waitForVisible('.edit-id')
      .getUrl()
      .then(url => {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/storage/' + world.collection + '/' + id);
      })
      .call(callback);
  });

  this.Then(/^I click on edit-inline button of "([^"]*)" document$/, function (id, callback) {
    browser
      .waitForVisible('documents-inline #' + id + ' .edit-inline', 1000)
      .click('documents-inline #' + id + ' .edit-inline')
      .call(callback);
  });

  this.Then(/^a text area for document "([^"]*)" is displayed$/, function (id, callback) {
    browser
      .waitForVisible('documents-inline #' + id + ' json-edit textarea', 1000)
      .getText('documents-inline #' + id + ' json-edit .ace_scroller .ace_text-layer .ace_line:nth-child(2)')
      .then(text => {
        assert.equal(text, '"username": "'+ id +'",');
      })
      .call(callback);
  });

  this.Then(/^I click on add attribute button$/, function (callback) {
    browser
      .click('add-attribute button')
      .call(callback);
  });

  this.Then(/^I add the new attribute$/, function (callback) {
    browser
      .click('.modal-footer .add-attribute')
      .call(callback);
  });
};
