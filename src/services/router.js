import Vue from 'vue'
import VueRouter from 'vue-router'
import createRoutes from '../routes/index'

Vue.use(VueRouter)

export default createRoutes(new VueRouter())
