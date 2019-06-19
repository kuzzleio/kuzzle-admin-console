import Vue from 'vue'
import VueLogger from 'vuejs-logger'

const isProduction = process.env.NODE_ENV === 'production'

const loggerOptions = {
  isEnabled: true,
  logLevel: isProduction ? 'error' : 'debug',
  stringifyArguments: false,
  showLogLevel: false,
  showMethodName: false,
  separator: '|',
  showConsoleColors: true
}

Vue.use(VueLogger, loggerOptions)
