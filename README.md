[![codecov](https://codecov.io/gh/kuzzleio/kuzzle-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/kuzzleio/kuzzle-backoffice)


# kuzzle Back-office

> This Kuzzle back office allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration with many boards for analytics.

# Releases mapping
| Back-office  | Kuzzle |
|---|---|
| 1.1.0 | 1.0.0-RC7 |
| 1.0.0 | 1.0.0-RC6 |


# About Kuzzle
For UI and connected objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time, search, high-level features, etc).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

# How to use it

This Back-office is a static front-end application. All calls to Kuzzle are made directly in the browser. **This is why your Kuzzle Proxy IP and Websocket port (default 7511) must be accessible from everywhere if you want to use this Back-office.**

You can check the last version of Back-office here: [kuzzle-backoffice](http://kuzzle-backoffice.netlify.com) (or if you're using Kuzzle through SSL, you can use the version [https](https://kuzzle-backoffice.netlify.com/))

For installing the Back-office on your own host, follow next steps.

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
$ docker run -p 3000:3000 -e "BACKOFFICE_PORT=3000" kuzzleio/backoffice
```
>`BACKOFFICE_PORT` _(default: 3000)_ corresponding to the port for accessing to the Back-office.

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
$ npm run build && BACKOFFICE_PORT=3000 npm start
```
>`BACKOFFICE_PORT` _(default: 3000)_ corresponding to the port for accessing to the Back-office.

You can now access `http://<back-office-ip>:<BACKOFFICE_PORT>`

### Without the server
You can choose to only build the `dist/` folder and access it with your own server:
```
$ npm run build
```

The `dist` folder is now generated. You can either open the `index.html` file or in order to prevent CSRF error, you can create a web server (like with nginx).