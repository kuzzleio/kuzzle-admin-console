[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)


# kuzzle Admin Console

> This Kuzzle Admin Console allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration.

# Releases mapping
| Admin Console  | Kuzzle |
|---|---|
| 2.0.0 | 1.0.0-RC9 |
| 1.1.0 | 1.0.0-RC7 |
| 1.0.0 | 1.0.0-RC6 |


# About Kuzzle
For UI and connected objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time, search, high-level features, etc).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# How to use it

This Admin Console is a static front-end application. All calls to Kuzzle are made directly in the browser. **This is why your Kuzzle Proxy IP and Websocket port (default 7512) must be accessible from everywhere if you want to use this Admin Console.**

You can check the last version of Admin Console here: [Admin Console](http://console.kuzzle.io) (or if you're using Kuzzle through SSL, you can use the [https](https://console.kuzzle.io) version)

For installing the Admin Console on your own host, follow next steps.

## Use the BO on your server


## Contributing to this project
This project includes a development-mode, with hot-reload. To start the Admin Console in development-mode:
```
$ npm run install_deps
$ npm run dev
```

The BO is now accessible at the following URL: [http://localhost:3000](http://localhost:3000)
