var
  index = require('./controllers/index'),
  storage = require('./controllers/storage'),
  login = require('./controllers/login'),
  user = require('./controllers/user');

module.exports = {

  initRoutes: function (app) {
    app.use('/', index);
    app.use('/storage', storage);
    app.use('/login', login);
    app.use('/user', user);
  }

};
