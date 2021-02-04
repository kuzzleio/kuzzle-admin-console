# Kuzzle Admin Console

> The Kuzzle Admin Console allows you to manage your Kuzzle instances. It allows you to manage your data, subscriptions and security (users, profiles and roles).

## About Kuzzle

Kuzzle is an open-source backend solution shipping out-of-the-box features like real-time subscriptions, geofencing, security, and advanced search.

Kuzzle provides a secure API which can be accessed through a wide range of protocols such as REST, Websocket or Message Queuing.

## About the Admin Console

The Kuzzle Admin Console is a web application that connects to your Kuzzle instances. This means that your Kuzzle stack must be accessible from the computer running the Kuzzle Admin Console. To connect to Kuzzle you will need to provide your Kuzzle host (name or IP) and the port (default: 7512).

## Hosted Console

We host a running Admin Console [here](http://console.kuzzle.io) (or if you're using Kuzzle through SSL, you can use the [https](https://console.kuzzle.io) version), but you can also build your own local copy (see below).

## Local build

To build the Kuzzle Admin Console on your computer, follow these instructions:

- `git clone https://github.com/kuzzleio/kuzzle-admin-console` (clone this repository)
- `npm install` (install dependencies)
- `npm run build` : (build the Admin Console)
- Serve the `dist` directory via your favorite HTTP server (e.g. `http-server dist`)
- Access the served files in your favorite browser
