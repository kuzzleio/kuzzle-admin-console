[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)

# Kuzzle Admin Console

> The Kuzzle Admin Console allows you to manage your Kuzzle instance. Use it to administer your data, subscriptions and Kuzzle configuration.

# About Kuzzle

Kuzzle is an open-source backend solution that comes equipped with out-of-the-box features to enable real-time collaboration, geofencing, security, and other advanced functionality.

Kuzzle provides a secure API which can be accessed through a large selection of protocols such as REST, Websocket or Message Queuing.

# Using Kuzzle Admin Console

The Kuzzle Admin Console is a static front-end client which runs in your web browser and connects to Kuzzle. This means that your Kuzzle installation must be accessible from the computer running the Kuzzle Admin Console. To connect to Kuzzle you will need to provide your Kuzzle installation host (name or IP) and the port (default: 7512).

You can get the latest version of the Kuzzle Admin Console [here](http://console.kuzzle.io) (or if you're using Kuzzle through SSL, you can use the [https](https://console.kuzzle.io) version)

To get a working copy of the Kuzzle Admin Console on your computer, follow these instructions:

- `wget https://dl.kuzzle.io/kuzzle-admin-console.tar.gz` : Download and extract the latest version of the Kuzzle Admin Console
- `tar xf kuzzle-admin-console.tar.gz` : Extract it
- Open the file `dist/index.html` in your favorite web browser, you're done!

# Tests

To run all the tests, just type

```
npm test
```

This executes both unit and end-to-end tests. To run only the unit-tests, run

```
npm run unit
```

To run the end-to-end tests in headless mode, run

```
npm run e2e
```

To run the end-to-end tests in headful mode, run

```
npm run dev
npm run e2e-local
```

Please refer to the CONTRIBUTING file to learn more about how to write code and tests for this project.
