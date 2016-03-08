var
  express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  router = require('./core/router'),
  exphbs  = require('express-handlebars'),
  app = express(),
  webpack = require('webpack'),
  config = require('./webpack.config'),
  compiler = webpack(config);

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  contentBase: './src',
  stats: {
    colors: true,
    chunks: false
  }
});

var hotMiddleware = require('webpack-hot-middleware')(compiler);
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' });
    cb();
  });
});

// handle fallback for HTML5 history API
// app.use(require('connect-history-api-fallback')());
// serve webpack bundle output
app.use(devMiddleware);
// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// // view engine setup
app.engine('.hbs', exphbs({
  defaultLayout: null,
  layoutsDir: 'core/views/layouts',
  partialsDir: ['core/views/partials'],
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'core', 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src')));

// Init routes and controllers
router.initRoutes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log(
  `
              ▄▄▄▄▄      ▄███▄      ▄▄▄▄
           ▄█████████▄▄█████████▄▄████████▄
          ██████████████████████████████████
           ▀██████████████████████████████▀
            ▄███████████████████████████▄
          ▄███████████████████████████████▄
         ▀█████████████████████████████████▀
           ▀██▀        ▀██████▀       ▀██▀
                  ██     ████    ██
                        ▄████▄
                        ▀████▀
                          ▀▀
                  `
);
console.log(`
███████████████████████████████████████████████████████
██     KUZZLE BO IS NOW READY (Default port 3000)    ██
███████████████████████████████████████████████████████`);

module.exports = app;
