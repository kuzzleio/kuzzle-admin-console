var
  index = require('./controllers/index'),
  storage = require('./controllers/storage'),
  schema = require('./controllers/schema'),
  collection = require('./controllers/collection');

module.exports = {

  initRoutes: function (app) {
    app.use('/', index);
    app.use('/storage', storage);
    app.use('/schema', schema);
    app.use('/collection', collection);
  }

};