import Login from './components/Login'
import Home from './components/Home'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component: Home,
      auth: true
    },
    '/login': {
      name: 'Login',
      component: Login
    }
  })

  // router.beforeEach(function (transition) {
  //   if (transition.to.auth && !userStore.isAuthenticated()) {
  //     transition.redirect('/login')
  //   }
  //   else {
  //     transition.next();
  //   }
  // })
  return router
}
