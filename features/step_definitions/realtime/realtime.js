var
  request = require('request'),
  assert = require('assert'),
  Kuzzle = require('kuzzle-sdk'),
  fixtures = require('../../fixtures.json'),
  world = require('../../support/world.js'),
  testDocument = {
    type: 'testDocument',
    text: 'yo!'
  },
  updatedTestDocument = {
    type: 'updatedTestDocument',
    text: 'Hi!'
  };

module.exports = function () {
  this.Given(/^I go to the realtime page$/, function (callback) {
    browser
      .url('/#/' + world.index + '/realtime')
      .call(callback);
  });

  this.Then(/^I click on the collection selector$/, function (callback) {
    browser
      .waitForVisible('collections-drop-down-search .dropdown-toggle', 1000)
      .pause(1000)
      .click('collections-drop-down-search .dropdown-toggle')
      .call(callback);
  });

  this.Given(/^I click on a collection$/, function (callback) {
    var selectedCollection = null;

    browser
      .waitForVisible('collections-drop-down-search .dropdown-menu', 1000)
      .getText('collections-drop-down-search .dropdown-menu li:last-child a')
      .then(text => {
        selectedCollection = text;
      })
      .click('collections-drop-down-search .dropdown-menu li:last-child a')
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

  this.Given(/^I subscribe to the collection events$/, function (callback) {
    browser
      .waitForVisible('.filters button.btn-subscribe', 1000)
      .click('.filters button.btn-subscribe')
      .call(callback);
  });

  this.Given(/^I unsubscribe from the collection$/, function (callback) {
    browser
      .waitForVisible('.filters button.btn-unsubscribe', 1000)
      .click('.filters button.btn-unsubscribe')
      .call(callback);
  });

  this.Then(/^I am subscribed$/, function (callback) {
    browser
      .waitForText('messages ul.message-list li.message-item:last-child code.document-id', 500)
      .getText('messages ul.message-list li.message-item:last-child code.document-id')
      .then(text => {
        assert.equal(text, world.collection);
      })
      .call(callback);
  });

  this.Given(/^I clear the message log$/, function (callback) {
    browser
      .click('messages button.btn-clear')
      .call(callback);
  });

  this.Then(/^The message log is empty$/, function (callback) {
    browser
      .elements('messages ul.message-list li.message-item')
      .then((response) => {
        assert.equal(response.value.length, 0, 'The message log is not empty');
      })
      .call(callback);
  });

  this.Then(/^I receive the notification that the document is being created$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    browser
      .getText('messages ul.message-list li.message-item:first-child span.message-pending')
      .then(text => {
        assert.equal(text, 'Creating new document');
      })
      .call(callback);
  });

  this.Then(/^I receive the notification that the document has been created$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    browser
      .getText('messages ul.message-list li.message-item:last-child span.message-created-updated-doc')
      .then(text => {
        assert.equal(text, 'Created new document');
      })
      .getText('messages ul.message-list li.message-item:last-child code.document-id')
      .then(text => {
        assert.equal(text, world.currentDocumentId);
      })
      .call(callback);
  });

  this.Then(/^I receive the notification that the document has been updated$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    browser
      .getText('messages ul.message-list li.message-item:last-child span.message-created-updated-doc')
      .then(text => {
        assert.equal(text, 'Updated document');
      })
      .getText('messages ul.message-list li.message-item:last-child code.document-id')
      .then(text => {
        assert.equal(text, world.currentDocumentId);
      })
      .call(callback);
  });

  this.Then(/^I receive the notification that the document is being deleted$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    browser
      .getText('messages ul.message-list li.message-item:first-child span.message-pending')
      .then(text => {
        assert.equal(text, 'Deleting document');
      })
      .call(callback);
  });

  this.Then(/^I receive the notification that the document has been deleted$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    browser
      .getText('messages ul.message-list li.message-item:last-child span.message-deleted-doc')
      .then(text => {
        assert.equal(text, 'Deleted document');
      })
      .getText('messages ul.message-list li.message-item:last-child code.document-id')
      .then(text => {
        assert.equal(text, world.currentDocumentId);
      })
      .call(callback);
  });

  this.Then(/^I receive the notification about the volatile message$/, function (callback) {
    browser
      .getText('messages ul.message-list li.message-item:last-child span.message-volatile')
      .then(text => {
        assert.equal(text, 'Received volatile message');
      })
      .call(callback);
  });

  this.Then(/^I receive the notification about the new user joining the room$/, function (callback) {
    browser
      .waitForExist('messages ul.message-list li.message-item:last-child span.message-user', 2000)
      .getText('messages ul.message-list li.message-item:last-child span.message-user')
      .then(text => {
        assert.equal(text, 'A new user is listening to this room');
      })
      .call(callback);
  });

  this.Then(/^I receive the notification about the user leaving the room$/, function (callback) {
    browser
      .waitForExist('messages ul.message-list li.message-item:last-child span.message-user', 2000)
      .getText('messages ul.message-list li.message-item:last-child span.message-user')
      .then(text => {
        assert.equal(text, 'A user exited this room');
      })
      .call(callback);
  });

  this.Given(/^I create a persistent document$/, function (callback) {
    world.kuzzle
      .dataCollectionFactory(world.collection)
      .createDocumentPromise(testDocument)
      .then((response) => {
        world.currentDocumentId = response.id;
        callback();
      })
      .catch((error) => {
        console.log('Error creating new document', error);
        callback.fail();
      });
  });

  this.Given(/^I publish a volatile message$/, function (callback) {
    world.kuzzle
      .dataCollectionFactory(world.collection)
      .publishMessage(world.currentDocumentId, testDocument);

      setTimeout(() => {
        callback();
      }, 200);
  });

   this.Given(/^I update a persistent document$/, function (callback) {
     assert(world.currentDocumentId, 'Expected to have the id of the current document');

     world.kuzzle
       .dataCollectionFactory(world.collection)
       .updateDocumentPromise(world.currentDocumentId, updatedTestDocument)
       .then((response) => {
         callback();
       })
       .catch((error) => {
         console.log('Error updating document', error);
         callback.fail();
       });
   });

  this.Given(/^I delete a persistent document$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    world.kuzzle
      .dataCollectionFactory(world.collection)
      .deleteDocumentPromise(world.currentDocumentId)
      .then((response) => {
        callback();
      })
      .catch((error) => {
        console.log('Error deleting document', error);
        callback.fail();
      });
  });

  this.Given(/^Someone subscribes to my room$/, function (callback) {
    world.currentRoom = world.kuzzle.dataCollectionFactory(world.index, world.collection).subscribe({}, function (error, result) {});

    setTimeout(() => {
      callback();
    }, 1000);
  });

  this.Given(/^Someone unsubscribes from the room$/, function (callback) {
    world.currentRoom.unsubscribe();

    setTimeout(() => {
      this.currentRoom = null;
      callback();
    }, 200);
  });

  this.Given(/^I can not see filter form$/, function (callback) {
    callback.pending();
  });

  this.Given(/^I can not see publish form$/, function (callback) {
    callback.pending();
  });
};
