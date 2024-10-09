import KeplerCompanion from 'kepler-companion';
import VueRouter from 'vue-router';

import PageNotFound from '../components/404.vue';
import ApiAction from '../components/ApiAction.vue';
import CreateEnvironmentPage from '../components/Common/Environments/CreateEnvironmentPage.vue';
import SelectEnvironmentPage from '../components/Common/Environments/SelectEnvironmentPage.vue';
import ConnectionAwareContainer from '../components/ConnectionAwareContainer.vue';
import DataLayout from '../components/Data/Layout.vue';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import ResetPassword from '../components/ResetPassword.vue';
import SecurityLayout from '../components/Security/Layout.vue';
import Signup from '../components/Signup.vue';
import telemetryCookies from '../services/telemetryCookies';
import { useKuzzleStore } from '@/stores';
import DataSubRoutes from './children/data';
import SecuritySubRoutes from './children/security';

export default function createRoutes(log) {
  const environmentsGuard = async (_from, _to, next) => {
    const kuzzleStore = useKuzzleStore();
    log.debug('Router:EnvironmentsGuard');

    try {
      kuzzleStore.loadEnvironments();
    } catch (error) {
      log.error(
        'Something went wrong while loading the connections. The JSON content saved in the LocalStorage seems to be malformed.',
      );

      log.error((error as Error).message);
    }

    if (kuzzleStore.hasEnvironment) {
      log.debug('Has environments');

      if (kuzzleStore.currentEnvironment == null) {
        log.debug('No environment selected');
        return next({ name: 'SelectEnvironment' });
      }
      if (!kuzzleStore.isCurrentEnvironmentValid) {
        log.debug('Current environment is not valid');
        return next({
          name: 'EditEnvironment',
          params: { id: kuzzleStore.currentId },
        });
      }
      return next();
    } else {
      log.debug('No environments');

      return next({ name: 'CreateEnvironment' });
    }
  };

  const router = new VueRouter({
    routes: [
      {
        path: '/create-connection',
        name: 'CreateEnvironment',
        beforeEnter: async (_from, _to, next) => {
          const kuzzleStore = useKuzzleStore();
          kuzzleStore.loadEnvironments();

          next();
        },
        props: true,
        component: CreateEnvironmentPage,
      },
      {
        path: '/edit-connection/:id',
        name: 'EditEnvironment',
        beforeEnter: async (_from, _to, next) => {
          const kuzzleStore = useKuzzleStore();
          kuzzleStore.loadEnvironments();

          next();
        },
        props: (route) => ({
          id: route.params.id,
        }),
        component: CreateEnvironmentPage,
      },
      {
        path: '/select-connection',
        name: 'SelectEnvironment',
        beforeEnter: async (_from, _to, next) => {
          const kuzzleStore = useKuzzleStore();
          kuzzleStore.loadEnvironments();

          next();
        },
        component: SelectEnvironmentPage,
      },
      {
        path: '/',
        beforeEnter: environmentsGuard,
        component: ConnectionAwareContainer,
        children: [
          {
            path: '/login',
            name: 'Login',
            component: Login,
          },
          {
            path: '/reset-password/:token',
            name: 'ResetPassword',
            component: ResetPassword,
            meta: {
              skipLogin: true,
            },
            props: true,
          },
          {
            path: '/signup',
            name: 'Signup',
            component: Signup,
            meta: {
              skipLogin: true,
            },
          },
          {
            path: '/',
            component: Home,
            meta: {
              requiresAuth: true,
            },
            children: [
              {
                path: '/',
                name: 'Data',
                redirect: '/data',
                component: DataLayout,
                children: DataSubRoutes,
              },
              {
                path: '/security',
                redirect: '/security/users',
                name: 'Security',
                component: SecurityLayout,
                children: SecuritySubRoutes,
              },
              {
                path: '/api-action',
                name: 'ApiAction',
                component: ApiAction,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        name: '404',
        beforeEnter: environmentsGuard,
        component: PageNotFound,
      },
    ],
  });

  const analytics = new KeplerCompanion();
  router.afterEach((to, _) => {
    const shouldAddTelemetry = !(
      telemetryCookies.get() === null || telemetryCookies.get() === 'false'
    );

    if (shouldAddTelemetry) {
      analytics
        .add({
          action: to.name as string,
          product: 'admin-console',
          version: __APP_VERSION__,
          tags: {
            environment: window.location.hostname,
          },
        })
        .catch(() => {});
    }
  });

  return router;
}
