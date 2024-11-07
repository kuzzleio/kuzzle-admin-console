import Vue from 'vue';
// WARNING - if we import the index.d.ts from the logger package,
// we get a type error. Stay in touch with the package and
// fix this whenever it gets updated
import { LogLevels } from 'vuejs-logger/dist/enum/log-levels';
import type { ILoggerOptions } from 'vuejs-logger/dist/interfaces/logger-options';
import VueLogger from 'vuejs-logger/dist/vue-logger';
const isProduction = import.meta.env.NODE_ENV === 'production';

const loggerOptions: ILoggerOptions = {
  isEnabled: true,
  logLevel: isProduction ? LogLevels.ERROR : LogLevels.DEBUG,
  stringifyArguments: false,
  showLogLevel: false,
  showMethodName: false,
  separator: '|',
  showConsoleColors: true,
};

Vue.use(VueLogger, loggerOptions);
