var
  index = require('./controllers/index'),
  persistence = require('./controllers/persistence');

module.exports = {

  initRoutes: function (app) {
    app.use('/', index);
    app.use('/persistence', persistence);
  }

};