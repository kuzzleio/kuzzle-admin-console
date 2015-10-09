[![Join the chat at https://gitter.im/kuzzleio/kuzzle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/kuzzleio/kuzzle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<p align=center> ![logo](docs/images/logo.png)

# Kuzzle BO

This Kuzzle back office allow to manage your Kuzzle. You can manage in real-time your data, subscriptions and configuration with many boards for analytics.

# About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc;).

Kuzzle features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.

Kuzzle uses [Elasticsearch filter DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-filters.html) (see [filters syntax](docs/filters.md) for more details) as filtering language, [RabbitMQ](https://www.rabbitmq.com/) to manage queues and [Redis](http://redis.io/) to manage filters cache.

# Installation


# Running Tests

    $ npm test
Because functional tests need to be done in a running Kuzzle environment, it is recommended to run these tests from a Kuzzle container.

Using Compose:

```
    $ docker-compose -f docker-compose/test.yml up
```

This command will pop all the stack for running Kuzzle, then execute unit test and functional test. When all tests are done, containers are destroyed.

Using a Vagrant virtual machine:

    $ vagrant ssh -c 'docker-compose -f docker-compose/test.yml up'

You may also run unit and functional tests separately, or with additional arguments.
For more information, check the [unit testing](test/README.md) and the [functional testing](features/README.md) documentation.


# Contributing to Kuzzle

See [contributing documentation](./CONTRIBUTING.md)

# License

Kuzzle is published under [Apache 2 License](LICENSE.md).
