FROM kuzzleio/base
MAINTAINER Kuzzle <support@kuzzle.io>

COPY ./ /var/app
COPY ./docker-compose/scripts/run.sh /run.sh

RUN apt-get update && apt-get install -y \
      build-essential \
      git \
      g++ \
      rbenv \
      python \
    && npm install -g \
      bower \
      http-server \
    && npm install \
    && gem install sass --version 3.2.10 \
    && bower install --allow-root \
    && npm run build \
    && mv dist /tmp/dist && rm -rf /var/app/* && mv /tmp/dist /var/app \
    && chmod 755 /run.sh \
    && mv /run.sh /var/app \
    && apt-get clean \
    && apt-get remove -y \
      build-essential \
      g++ \
      rbenv \
      python \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
    
CMD ["/var/app/run.sh"]
