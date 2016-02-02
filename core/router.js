var
  index = require('./controllers/index'),
  storage = require('./controllers/storage'),
  collection = require('./controllers/collection'),
  realtime = require('./controllers/realtime'),
  login = require('./controllers/login'),
  indexes = require('./controllers/indexes'),
  dashboard = require('./controllers/dashboard');

module.exports = {

  initRoutes: function (app) {
    app.use('/', index);
    app.use('/storage', storage);
    app.use('/collection', collection);
    app.use('/realtime', realtime);
    app.use('/login', login);
    app.use('/indexes', indexes);
    app.use('/dashboard', dashboard);
  }

};
