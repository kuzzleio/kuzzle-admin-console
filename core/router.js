var
  index = require('./controllers/index'),
  storage = require('./controllers/storage'),
  login = require('./controllers/login');

module.exports = {

  initRoutes: function (app) {
    app.use('/', index);
    app.use('/storage', storage);
    app.use('/login', login);
  }

};
