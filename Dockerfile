FROM kuzzleio/bo-base:alpine
MAINTAINER Kuzzle <support@kuzzle.io>

ADD ./ /var/app

RUN cd /var/app && \
    npm install && \
    bower install --allow-root && \
    npm run build && \
    rm -rf node_modules && \
    npm install http-server

CMD ["npm", "start"]