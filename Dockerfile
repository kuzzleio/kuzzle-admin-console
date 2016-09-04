FROM kuzzleio/bo-base:alpine
MAINTAINER Kuzzle <support@kuzzle.io>

ADD ./docker-compose /
ADD ./ /var/app

RUN cd /var/app && \
    npm install && \
    bower install --allow-root && \
    npm run build

RUN chmod 755 /*.sh
CMD ["/run-prod.sh"]