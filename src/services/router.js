import Vue from 'vue'
import VueRouter from 'vue-router'
import createRoutes from '../routes'

Vue.use(VueRouter)

export default createRoutes(new VueRouter())
