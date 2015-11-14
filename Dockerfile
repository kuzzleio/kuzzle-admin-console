FROM kuzzleio/bo-base
MAINTAINER Kuzzle <support@kuzzle.io>

ADD ./ /var/app/

RUN cd /var/app && \
    npm install && \
    bower install --allow-root --config.interactive=false