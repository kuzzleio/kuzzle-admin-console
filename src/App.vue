<template>
  <div v-toaster></div>
  <router-view></router-view>
</template>

<script>
import {} from './assets/global.scss'

window.jQuery = window.$ = require('jquery')
require('imports?$=jquery!materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false
}
</script>
