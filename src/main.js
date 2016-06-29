import Vue from 'vue'
import router from './services/router'
import App from './App'

Vue.config.debug = true

router.start(App, 'body')
