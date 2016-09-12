[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)


# kuzzle Back-office

> This Kuzzle back office allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration with many boards for analytics.

# Releases mapping
| Back-office  | Kuzzle |
|---|---|
| 1.0.0 | 1.0.0-RC6 |


# About Kuzzle
For UI and connected objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time, search, high-level features, etc).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# Installation

This Back-office is a front-end application. All calls to Kuzzle are made directly in the browser. **This is why your Kuzzle Proxy IP and Websocket port (default 7511) must be accessible from everywhere if you want to use this Back-office.**

## With Docker
### I want to use the all-in-one recipe
The easiest way to deploy the Kuzzle stack is by using the `docker-compose.yml` file at the root directory of this project. But you can also create your own `docker-compose` in order to change ports or something else.

```
$ docker pull kuzzleio/backoffice
$ BACKOFFICE_PORT=3000 docker-compose up
```

>Where `BACKOFFICE_PORT` _(default: 3000)_ corresponding to the port for accessing to the Back-office.

After a while, you can access to `http://<your-ip>:3000`.

### I just want to run the Back-office
If you already have a Kuzzle stack running somewhere, be sure your Kuzzle Proxy IP and Websocket port (default 7511) is open and accessible from everywhere.

```
$ docker pull kuzzleio/backoffice
$ docker run -p 3000:3000 -e "BACKEND_HOST=<BACKEND_HOST>" kuzzleio/backoffice
```
>Where `BACKEND_HOST` _(default: localhost)_ is the Kuzzle Proxy IP. You can also override `BACKEND_IOPORT` _(default: 7512)_ and `BACKEND_WSPORT` _(default: 7513)_ corresponding to Proxy sockets ports and `BACKOFFICE_PORT` _(default: 3000)_ corresponding to the port for accessing to the Back-office.

## Without Docker
Be sure to have node v4.4 and bower installed.

```
$ git clone https://github.com/kuzzleio/kuzzle-backoffice
$ npm install
$ bower install
```

At this point you can choose whether to run with the embed server or without:

### With the embed server
```
$ BACKEND_HOST=<BACKEND_HOST> npm run prod
```
>Where `BACKEND_HOST` _(default: localhost)_ is the Kuzzle Proxy IP. You can also override `BACKEND_IOPORT` _(default: 7512)_ and `BACKEND_WSPORT` _(default: 7513)_ corresponding to Proxy sockets ports and `BACKOFFICE_PORT` _(default: 3000)_ corresponding to the port for accessing to the Back-office.

You can now access `http://<back-office-ip>:<BACKOFFICE_PORT>`

### Without the server
You can choose to only build the `dist/` folder and access it with your own server:
```
$ BACKEND_HOST=<BACKEND_HOST> npm run build
```
>Where `BACKEND_HOST` _(default: localhost)_ is the Kuzzle Proxy IP. You can also override `BACKEND_IOPORT` _(default: 7512)_ and `BACKEND_WSPORT` _(default: 7513)_ corresponding to Proxy sockets port.

The `dist` folder is now generated. In order to let this folder be accessible from your browser without CSRF error, you have to create a server web (like with nginx).
