[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)


# kuzzle Back-office

> This Kuzzle back office allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration.

# Releases mapping
| Back-office  | Kuzzle |
|---|---|
| 2.0.0 | 1.0.0-RC9 |
| 1.1.0 | 1.0.0-RC7 |
| 1.0.0 | 1.0.0-RC6 |


# About Kuzzle
For UI and connected objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time, search, high-level features, etc).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# How to use it

This Back-office is a static front-end application. All calls to Kuzzle are made directly in the browser. **This is why your Kuzzle Proxy IP and Websocket port (default 7512) must be accessible from everywhere if you want to use this Back-office.**

You can check the last version of Back-office here: [kuzzle-backoffice](http://kuzzle-backoffice.netlify.com) (or if you're using Kuzzle through SSL, you can use the version [https](https://kuzzle-backoffice.netlify.com/))

For installing the Back-office on your own host, follow next steps.

## Use the BO on your server
You can run the Back-Office with:
```
$ npm install -g kuzzle-backoffice
$ kuzzle-backoffice start
Back-Office available at http://localhost:3000
```

You can start the BO on a different port
```
$ kuzzle-backoffice start -p 8080
Back-Office available at http://localhost:8080
```

## Contributing to this project
This project includes a development-mode, with hot-reload. To start the back-office in development-mode:
```
$ npm run install_deps
$ npm run dev
```

The BO is now accessible at the following URL: [http://localhost:3000](http://localhost:3000)