module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },

  devServer: {
    disableHostCheck: true
  },

  publicPath: '/kuzzle-v2/',

  configureWebpack: {
    devtool: 'source-map'
  },

  css: {
    loaderOptions: {
      scss: {
        data: `
          @import "src/assets/variables.scss";
        `
      }
    }
  }
}
