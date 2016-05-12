[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-bo.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-bo)
[![Join the chat at https://gitter.im/kuzzleio/kuzzle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/kuzzleio/kuzzle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![logo](https://raw.githubusercontent.com/kuzzleio/kuzzle/master/docs/images/logo.png)

# Kuzzle BO

(Works with Kuzzle version beta)

This Kuzzle back office allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration with many boards for analytics.

![image](https://raw.githubusercontent.com/kuzzleio/kuzzle-bo/master/docs/images/metrics.png)
---
![image](https://raw.githubusercontent.com/kuzzleio/kuzzle-bo/master/docs/images/realtime.png)
---
![image](https://raw.githubusercontent.com/kuzzleio/kuzzle-bo/master/docs/images/realtime.png)

# About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc;).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# Installation

## With docker, from scratch

You can use the default `docker-compose.yml` which will run all Kuzzle stack and the BO.

    $ docker pull kuzzleio/bo
    $ docker-compose up

If you want to customize which service to launch or if you don't want to clone the repo, you can create your own docker-compose.yml file.
If you want to communicate with Kuzzle in Stomp or AMQ, you probably want to add a service rabbitMQ.

**Note:** For more information about how to install Kuzzle, you can check [this documentation](https://github.com/kuzzleio/kuzzle/blob/master/docs/installation.md)

## With docker with an already running Kuzzle

You can run the back office using the Kuzzle BO image with a link to your Kuzzle instance

    $ docker pull kuzzleio/bo
    $ docker run --link my-kuzzle-container-name:kuzzle -p 3000:3000 kuzzleio/bo

Where `my-kuzzle-container-name` is the container name where your Kuzzle is running. If you are in trouble for get your container name you can retrieve it with

    $ docker ps | grep kuzzleio/kuzzle

The container name is in the last column.

## Without docker with an already running Kuzzle

### Prerequisites

* A properly installed [nodeJs](https://nodejs.org/en/download/package-manager/) **version 4** or upper
* Last version of [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
* Last version of [RubyGems](https://rubygems.org/pages/download)

### First step

You'll need to clone the back-office repository then install the dependencies and compile the css files:

	$ git clone https://github.com/kuzzleio/kuzzle-bo.git && cd kuzzle-bo
	$ npm install
	$ bower install --config.interactive=false
	$ npm run build

### Second step

Launch the back-office server:

	$ npm start

or launch it with [pm2](http://pm2.keymetrics.io/)

  # if pm2 is not installed on your system...
  $ sudo npm install -g pm2
	$ pm2 start ./bin/www --name 'kuzzle-bo'

**Note:**
* If you want to debug, you also have to expose the port 8080
* For more information about how to install Kuzzle, you can check [this documentation](https://github.com/kuzzleio/kuzzle/blob/master/docs/installation.md)

# Running Tests

    $ npm test

Because functional tests need to be done in a running Kuzzle environment, it is recommended to run these tests from a Kuzzle container.

Using Compose:

```
    $ docker pull kuzzleio/bo
    $ docker-compose -f docker-compose/test.yml up
```

# Contributing to Kuzzle

See [contributing documentation](./CONTRIBUTING.md)

# License

Kuzzle is published under [Apache 2 License](LICENSE.md).
