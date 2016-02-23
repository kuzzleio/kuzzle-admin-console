var
  assert = require('assert'),
  wdioWrappers = require('../../support/wdioWrappers.js'),
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
  this.Given(/^I go to collection browse page$/, function (callback) {
    browser
      .url('/#/' + world.index + '/collection/browse')
      .call(callback);
  });
  this.When(/^I click on add document button$/, function (callback) {
    browser
      .click('[ng-controller="StorageBrowseDocumentsCtrl"] .create button')
      .call(callback);
  });
  this.When(/^I click on the cog$/, function (callback) {
    browser
      // This is quite worrying: I have to click on the deepest element if I
      // want something to happen.
      .click('.select-collection cog-options-collection span.dropdown small.dropdown')
      .call(callback);
  });

  this.Then(/^the current URL corresponds to the add document page$/, function (callback) {
    browser
      .waitForVisible('.edit-id')
      .getUrl()
      .then(url => {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/storage/' + world.collections[0] + '/add');
      })
      .call(callback);
  });

  this.Given(/^I am on page for create document$/, function (callback) {
     browser
       .url('/#/' + world.index + '/storage/' + world.collections[0] + '/add')
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

  this.When(/^I go to the page for edit document "([^"]*)"$/, function (id, callback) {
    browser
      .url('/#/' + world.index + '/storage/' + world.collections[0] + '/'+ id)
      .waitForVisible('form fieldset', 10000)
      .pause(1500)
      .call(callback);
  });

  this.Then(/^I am on page for edit document "([^"]*)"$/, function (id, callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/' + world.index + '/storage/' + world.collections[0] + '/'+ id;
        var urlRegexp = new RegExp(expectedUrl, 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
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
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/storage/' + world.collections[0] + '/' + id);
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

  this.Then(/^I am on collection browse page$/, function (callback) {
    browser
      .waitForVisible('.storage-browse .create', 1000)
      .getUrl()
      .then(url => {
        assert(url,  world.baseUrl + '/#/' + world.index + '/collection/browse');
      })
      .call(callback);
  });

  this.Then(/^I click on the first collection in browse document page$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('span.collection-name:first-of-type', 1000)
      .click('span.collection-name:first-of-type')
      .call(callback);
  });

  this.Given(/^I am on browse document page$/, function (callback) {
    browser
      .url('/#/' + world.index + '/storage/' + world.collections[0])
      .call(callback);
  });

  this.Then(/^I ?(do not)? see the "([^"]*)" menu item$/, function (not, itemName, callback) {
    browser
      .waitForVisible('.select-collection cog-options-collection .dropdown-menu', 1000)
      .getText('.select-collection cog-options-collection .dropdown-menu li')
      .then(text => {
        if (not) {
          assert(!wdioWrappers.queryMatchesText(itemName, text),
            'Expected not to find menu item' + itemName + ', but found one.');
        } else {
          assert(wdioWrappers.queryMatchesText(itemName, text),
            'Expected to find menu item' + itemName + ', but found none.');
        }
      })
      .call(callback);
  });

  this.Then(/^I ?(do not)? see the cog$/, function (not, callback) {
    browser
      .elements('.select-collection cog-options-collection')
      .then(elements => {
        if (not) {
          assert(elements.value.length === 0,
            'Expected not to find the cog, but found one.');
        } else {
          assert(elements.value.length !== 0,
            'Expected to find the cog, but found none.');
        }
      })
      .call(callback);
  });

  this.Then(/^I click on collection "([^"]+)"$/, function (collectionName, callback) {
    var selectedCollection = null;

    browser
      .waitForVisible('collections-drop-down-search .dropdown-menu', 1000)
      .getText('collections-drop-down-search .dropdown-menu #collection-' + collectionName + ' a')
      .then(text => {
        selectedCollection = text;
      })
      .click('collections-drop-down-search .dropdown-menu #collection-' + collectionName + ' a')
      .pause(200)
      .getText('collections-drop-down-search .dropdown-toggle')
      .then(text => {
        assert.equal(
          text,
          selectedCollection,
          'Expected the button text to match the selected collection (' + selectedCollection + '), found ' + text
        );
      })
      .call(callback);
  });

  this.Then(/^I do not see the add document button$/, function (callback) {
    browser
      .isExisting('[ng-controller="StorageBrowseDocumentsCtrl"] .create button')
      .then(function(isExisting) {
        assert(!isExisting, 'Add document button must not be displayed');
      })
      .call(callback);
  });

  this.Then(/^I do not see the edit pencil of the document in position "([^"]*)"$/, function (position, callback) {
    browser
      .isExisting('[ng-controller="StorageBrowseDocumentsCtrl"] document-toolbar span.edit-inline')
      .then(function(isExisting) {
        assert(!isExisting, 'Document edit pencil must not be displayed');
      })
      .call(callback);
  });

  this.Then(/^I do not see the cogwheel of the document in position "([^"]*)"$/, function (position, callback) {
    browser
      .isExisting('[ng-controller="StorageBrowseDocumentsCtrl"] document-toolbar span.dropdown-toggle')
      .then(function(isExisting) {
        assert(!isExisting, 'Document cogwheel must not be displayed');
      })
      .call(callback);
  });

  this.Then(/^I do not see the Add Collection button$/, function (callback) {
    browser
      .elements('.create .btn-collection-add')
      .then(elements => {
        assert(elements.value.length === 0,
          'Expected not to find the Add collection button, but found one.');
      })
      .call(callback);
  });
};
