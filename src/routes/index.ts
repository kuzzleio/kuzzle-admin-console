import Vue from 'vue';
import KeplerCompanion from 'kepler-companion';
import VueRouter from 'vue-router';
import type { Store } from 'vuex';

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
import {
  KKuzzleActionsTypes,
  KKuzzleGettersTypes,
  type RootState,
  StoreNamespaceTypes,
} from '@/store';
import DataSubRoutes from './children/data';
import SecuritySubRoutes from './children/security';

Vue.use(VueRouter);

export default function createRoutes(log, store: Store<RootState>) {
  const environmentsGuard = async (from, to, next) => {
    log.debug('Router:EnvironmentsGuard');

    try {
      store.dispatch(`${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.LOAD_ENVIRONMENTS}`);
    } catch (error) {
      log.error(
        'Something went wrong while loading the connections. The JSON content saved in the LocalStorage seems to be malformed.',
      );
      log.error(error.message);
    }

    const hasEnvironment =
      store.getters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.HAS_ENVIRONMENT}`];
    const currentEnvironment =
      store.getters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.CURRENT_ENVIRONMENT}`];
    const isCurrentEnvironmentValid =
      store.getters[
        `${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.IS_CURRENT_ENVIRONMENT_VALID}`
      ];

    if (hasEnvironment) {
      log.debug('Has environments');

      if (!currentEnvironment) {
        log.debug('No environment selected');
        return next({ name: 'SelectEnvironment' });
      }
      if (!isCurrentEnvironmentValid) {
        log.debug('Current environment is not valid');
        return next({
          name: 'EditEnvironment',
          params: { id: store.state.kuzzle.currentId },
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
        beforeEnter: async (from, to, next) => {
          await store.dispatch(
            `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.LOAD_ENVIRONMENTS}`,
          );
          next();
        },
        props: true,
        component: CreateEnvironmentPage,
      },
      {
        path: '/edit-connection/:id',
        name: 'EditEnvironment',
        beforeEnter: async (from, to, next) => {
          await store.dispatch(
            `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.LOAD_ENVIRONMENTS}`,
          );
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
        beforeEnter: async (from, to, next) => {
          await store.dispatch(
            `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.LOAD_ENVIRONMENTS}`,
          );
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
