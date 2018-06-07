[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)


# kuzzle Admin Console

> This Kuzzle Admin Console allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration.

# About Kuzzle
For UI and connected objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time, search, high-level features, etc).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# How to use it

The Admin Console is a static front-end client, executed by your web browser, and using the Kuzzle Backend API. This means that your Kuzzle Backend IP address and network port (default: 7512) must be reachable from the computer executing the Admin Console.

You can get the latest version of Admin Console here: [Admin Console](http://console.kuzzle.io) (or if you're using Kuzzle through SSL, you can use the [https](https://console.kuzzle.io) version)

To get a working copy of the Admin Console on your computer, follow these steps:

 - `wget https://dl.kuzzle.io/kuzzle-admin-console.tar.gz` : Download and extract the latest version of the Admin Console
 - `tar xf kuzzle-admin-console.tar.gz` : Extract it
 - Open the file `dist/index.html` in your favorite web browser, you're done !

## Contributing to this project

To start the Admin Console in development-mode with hot-reload:

```
$ npm run install_deps
$ npm run dev
```

The Admin Console is now accessible at the following URL: http://localhost:3000
