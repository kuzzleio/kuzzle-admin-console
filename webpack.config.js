'use strict';

// Modules
var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var DEVELOPMENT = 'dev';
var ENV = process.env.NODE_ENV;
var DEV_SERVER_PORT = 3000;
var BASE_CONTENT_PATH = './src';
var isProd = ENV !== DEVELOPMENT;

module.exports = function makeWebpackConfig () {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {};

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Embed the webpack hot reload clients in development mode.
   */
  config.entry = isProd ? {
    app: BASE_CONTENT_PATH + '/javascripts/app.js'
  } : {
    app: [
      /**
       * Use this if you serve your content with WebpackDevServer
       * (either from binary script or with Node.js API)
       */
      // 'webpack/hot/dev-server',
      /**
       * Use this if you serve your content with the webpack-hot-middleware
       * you embedded in your Express.js server.
       */
      'webpack-hot-middleware/client',
      BASE_CONTENT_PATH + '/javascripts/app.js'
    ]
  };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
  config.output = {
    // Absolute output directory
    path: __dirname + '/dist',

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: isProd ? '/' : 'http://localhost:' + DEV_SERVER_PORT + '/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: /*isProd ? '[name].[hash].js' :*/ '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: /*isProd ? '[name].[hash].js' :*/ '[name].bundle.js'
  };

  config.resolve = {
    extensions: ['', '.js', '.vue']
  };

  config.resolveLoader = {
    root: path.join(__dirname, 'node_modules')
  };

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */

  // Initialize module
  config.module = {
    preLoaders: [{
      test: /\.js$/, // include .js files
      exclude: /node_modules/, // exclude any and all files in the node_modules folder
      loaders: ['eslint-loader']
    }],
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }, {
      // JS LOADER
      // Reference: https://github.com/babel/babel-loader
      // Transpile .js files using babel-loader
      // Compiles ES6 and ES7 into ES5 code
      // Reference: https://github.com/jeffling/ng-annotate-webpack-plugin
      // Add angular-injector annotations before minification
        test: /\.js$/,
        loaders: ['ng-annotate', 'babel'],
        exclude: /node_modules/
      }, {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
      // CSS LOADER
      // Reference: https://github.com/webpack/css-loader
      // Allow loading css through js
      //
      // Reference: https://github.com/postcss/postcss-loader
      // Postprocess your css with PostCSS plugins
        test: /\.css$/,
      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      // Extract css files in production builds
      //
      // Reference: https://github.com/webpack/style-loader
      // Use style-loader in development.
      // loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss')
        loaders: ['style', 'css']
      }, {
      // ASSET LOADER
      // Reference: https://github.com/webpack/file-loader
      // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
      // Rename the file using the asset hash
      // Pass along the updated reference to your code
      // You can add here any file extension you want to get copied to your output
        test: /\.(png|jpg|jpeg|gif|svg|ttf|eot)$/,
        loader: 'file'
      }, {
      // HTML LOADER
      // Reference: https://github.com/webpack/raw-loader
      // Allow loading html through js
        test: /\.html$/,
        loader: 'raw'
      },
      // font-awesome specific loaders
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }]
  };

  // We want to emit errors in development mode because the HMR will show
  // the errrors directly in the browser. We don't want errors to make
  // the build fail.
  config.eslint = {
    configFile: './.eslintrc'
  };

  if (isProd) {
    config.eslint.failOnError = true;
  }

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer-core
   * Add vendor prefixes to your css
   */
  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({KUZZLE_URL: JSON.stringify(process.env.KUZZLE_URL)})
    /**
     * We'll use the HtmlWebpackPlugin once all the module dependencies are
     * expressed as require() calls.
     */
    // new HtmlWebpackPlugin({
    //   template: './src/index.html',
    //   inject: 'body'
    // }),
    // new ExtractTextPlugin('[name].[hash].css', {disable: !isProd})
  ];

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin(),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: __dirname + '/src'
      }])
    );
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    contentBase: BASE_CONTENT_PATH,
    stats: 'minimal',
    port: DEV_SERVER_PORT,
    host: '0.0.0.0',
    proxy: {
      '/api/*': {
        target: 'http://localhost:3001/',
        secure: false,
        rewrite: function(req) {
          req.url = req.url.replace(/^\/api/, '');
        }
      }
    }
  };

  return config;
}();
