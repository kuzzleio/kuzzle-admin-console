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
      .url('/#/realtime')
      .call(callback);
  });

  this.Then(/^I click on the collection selector$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('drop-down-search .dropdown-toggle', 1000)
      .click('drop-down-search .dropdown-toggle')
      .call(callback)
  });

  this.Given(/^I click on a collection$/, function (callback) {
    browser
      .waitForVisible('drop-down-search .dropdown-toggle', 1000)
      .click('drop-down-search ul li:last-child a')
      .call(callback)
  });

  this.Given(/^I subscribe to the collection events$/, function (callback) {
    browser
      .click('.filters button.btn-subscribe')
      .call(callback)
  });

  // this.Given(/^I unsubscribe from the collection$/, {timeout: 20 * 1000}, function (callback) {
  //   this.browser.pressButton('.filters button.btn-unsubscribe', callback);
  // });
  //
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
        assert.equal(response.value.length, 0, "The message log is not empty");
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
      .call(callback)
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
      .call(callback)
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
      .call(callback)
  });

  this.Then(/^I receive the notification about the volatile message$/, function (callback) {
    browser
      .getText('messages ul.message-list li.message-item:last-child span.message-volatile')
      .then(text => {
        assert.equal(text, 'Received volatile message');
      })
      .call(callback)
  });

  this.Then(/^I receive the notification about the new user joining the room$/, function (callback) {
    browser
      .waitForExist('messages ul.message-list li.message-item:last-child span.message-user', 2000)
      .getText('messages ul.message-list li.message-item:last-child span.message-user')
      .then(text => {
        assert.equal(text, 'A new user is listening to this room');
      })
      .call(callback)
  });

  this.Then(/^I receive the notification about the user leaving the room$/, function (callback) {
    browser
      .waitForExist('messages ul.message-list li.message-item:last-child span.message-user', 2000)
      .getText('messages ul.message-list li.message-item:last-child span.message-user')
      .then(text => {
        assert.equal(text, 'A user exited this room');
      })
      .call(callback)
  });

  this.Given(/^I create a persistent document$/, function (callback) {
    var url = world.kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection + '/_create';

    world.kuzzle
      .dataCollectionFactory(world.collection)
      .createDocumentPromise('toto', testDocument)
      .then((response) => {
        console.log(response);
        // assert(response.result, 'Expected Kuzzle response to contain a result');
        world.currentDocumentId = response._id;
        callback();
      })
      .catch((error) => {
        console.log(error);
      });

    // request({
    //   method: 'POST',
    //   uri: url,
    //   body: testDocument,
    //   json: true
    // }, (error, response, body) => {
    //   if (error) {
    //     throw new Error('Error creating new document on  '+ url + ': ' + error);
    //   }
    //
    //   world.currentDocumentId = body.result._id;
    //
    //   setTimeout(() => {
    //     callback();
    //   }, 1000);
    // });
  });

  this.Given(/^I publish a volatile message$/, function (callback) {
    var url = world.kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection;

    request({
      method: 'POST',
      uri: url,
      body: testDocument,
      json: true
    }, (error, response, body) => {
      if (error) {
        throw new Error('Error publishing volatile message on  '+ url + ': ' + error);
      }

      setTimeout(() => {
        callback();
      }, 1000);
    });
  });

   this.Given(/^I update a persistent document$/, function (callback) {
     assert(world.currentDocumentId, 'Expected to have the id of the current document');

     var url = world.kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection + '/' + world.currentDocumentId;

     request({
       method: 'PUT',
       uri: url,
       body: updatedTestDocument,
       json: true
       }, error => {
         if (error) {
           throw new Error('Error updating new document on  '+ url + ': ' + error);
         }

         setTimeout(() => {
           callback();
         }, 1000);
       });
   });

  this.Given(/^I delete a persistent document$/, function (callback) {
    assert(world.currentDocumentId, 'Expected to have the id of the current document');

    var url = world.kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection + '/' + world.currentDocumentId;

    request({
      method: 'DELETE',
      uri: url
      }, (error, response, body) => {
        if (error) {
          throw new Error('Error deleting new document on  '+ url + ': ' + error);
        }

        setTimeout(() => {
          callback();
        }, 1000);
      });
  });

  this.Given(/^Someone subscribes to my room$/, function (callback) {
    world.currentRoom = world.kuzzle.dataCollectionFactory(world.collection).subscribe({}, function (error, result) {});

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
};
