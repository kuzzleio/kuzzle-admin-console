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

## Contributing to this project

To start the Kuzzle Admin Console in development-mode with hot-reload run the following commands:

```
$ npm run install_deps
$ npm run dev
```

The Kuzzle Admin Console will then be accessible at the following URL: http://localhost:3000
