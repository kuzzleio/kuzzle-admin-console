import KeplerCompanionModule from 'kepler-companion';
import { createRouter, createWebHashHistory } from 'vue-router';

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
import type { Logger } from '@/plugins/logger';
import { useKuzzleStore } from '@/stores';
import DataSubRoutes from './children/data';
import SecuritySubRoutes from './children/security';

// `kepler-companion` est du CommonJS compilé par TypeScript : la classe est dans
// `exports.default`, avec le drapeau `__esModule`. Vite 5 lisait ce drapeau et
// rendait la classe ; Vite 8 suit la sémantique de Node dans un paquet
// `"type": "module"` et rend `module.exports`, soit `{ default: classe }`.
// Le repli couvre les deux. Voir G-067.
const KeplerCompanion =
  (KeplerCompanionModule as unknown as { default?: typeof KeplerCompanionModule }).default ??
  KeplerCompanionModule;

export default function createRoutes(log: Logger) {
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

  /*
   * `createWebHashHistory` reprend le mode par défaut de `vue-router` 3, que
   * la console n'avait jamais eu à nommer : toutes ses URL sont en `/#/…`, y
   * compris dans les 17 specs et dans les liens que les utilisateurs ont mis
   * en favori. Changer d'historique ici serait un changement d'URL déguisé en
   * migration.
   */
  const router = createRouter({
    history: createWebHashHistory(),
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
        // `vue-router` 4 n'a plus de joker `'*'` : une route attrape-tout est
        // un paramètre de chemin nommé, répété.
        path: '/:pathMatch(.*)*',
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
