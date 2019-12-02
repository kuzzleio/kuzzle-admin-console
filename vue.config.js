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

  configureWebpack: {
    devtool: 'source-map'
  },

  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "src/assets/variables.scss";
        `
      }
    }
  }
}
