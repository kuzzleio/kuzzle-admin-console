<template>
  <div class="toast-error" v-toaster></div>
  <router-view></router-view>
</template>

<script>
import {} from './assets/global.scss'
import Toaster from './directives/Materialize/toaster.directive'

window.jQuery = window.$ = require('jquery')
require('imports?$=jquery!materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false,
  directives: [Toaster]
}
</script>
