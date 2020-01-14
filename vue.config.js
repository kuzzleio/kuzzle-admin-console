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

  publicPath: process.env.DEPLOY_PATH,

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
