[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![codecov.io](http://codecov.io/github/kuzzleio/sdk-javascript/coverage.svg?branch=master)](http://codecov.io/github/kuzzleio/sdk-javascript?branch=master) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)


Official Kuzzle Javascript SDK 
======

This SDK version requires Kuzzle v0.12 or higher.

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

You can access the Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)

* [SDK Documentation](#sdk-documentation)
* [Installation](#installation)
  * [NodeJS](#nodejs)
    * [Basic usage](#basic-usage-node)
  * [Javascript](#javascript)
    * [Basic usage](#basic-usage-js)
* [Building manually](#building-manually)
* [License](#license)

## SDK Documentation

The complete SDK documentation is available [here](http://kuzzleio.github.io/sdk-documentation)

## Installation

This SDK can be used either in NodeJS or in a browser.

### NodeJS

```
npm install kuzzle-sdk --save
```

#### <a name="basic-usage-node"></a> Basic usage

```javascript
var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle = new Kuzzle('http://foobar:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocument(myDoc, function(error, response) {
    if (error) {
      // handle error...
    }
    /*
    'response' is a KuzzleDocument object
    */
});

// In NodeJS version, you can also use Promise by suffixing functions with "Promise"
kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocumentPromise(myDoc)
  .then(response => {
    /*
    'response' is a KuzzleDocument object
    */
  })
  .catch(error => {
    // handle error here
  });
});
```

### Javascript

You can install this SDK with [Bower](http://bower.io/).
```
bower install kuzzle-sdk --save
```

```html
<!-- Don't forget to include socketio before kuzzle -->
<script type="text/javascript" src="bower_components/socket.io-client/socket.io.js"></script>
<script type="text/javascript" src="bower_components/kuzzle-sdk/dist/kuzzle.min.js"></script>
```

#### <a name="basic-usage-js"></a> Basic usage

```javascript
var
  kuzzle = new Kuzzle('http://foobar:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocument(myDoc, function(error, response) {
    if (error) {
      // handle error...
    }
    /*
    'response' is a KuzzleDocument object
    */
});
```

## Building manually

Clone this github repository and run ``grunt``. A ``dist`` directory will be created, containing a plain browserified version of this SDK, and a minified version.

## License

[Apache 2](LICENSE.md)
