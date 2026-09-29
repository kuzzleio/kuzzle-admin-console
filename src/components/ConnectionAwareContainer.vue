<template>
  <div class="ConnectionAwareContainer h-full">
    <template v-if="connecting">
      <div v-if="!showOfflineSpinner" data-cy="AntiGlitchOverlay" class="AntiGlitchOverlay" />
      <offline-spinner
        v-if="showOfflineSpinner"
        data-cy="App-offline"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </template>
    <template v-else>
      <error-page
        v-if="kuzzleError"
        data-cy="App-connectionError"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
      <router-view
        v-else
        data-cy="App-online"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </template>
    <!--
      L'état de la connexion n'est pas une notification : il ne dit pas qu'un
      événement a eu lieu, il dure tant que la coupure dure. C'est un bandeau,
      hors de la pile des toasts (ADR-0058). Il garde son `id` : deux
      commandes Cypress s'y accrochent. Sa teinte est mêlée à `card`, comme
      celle d'un toast : il flotte au-dessus du contenu (E-03).
    -->
    <Alert
      v-if="offlineVisible"
      id="offline-toast"
      class="fixed top-4 left-1/2 z-(--z-toast) w-auto max-w-[calc(100vw-2rem)] -translate-x-1/2 bg-[color-mix(in_oklab,var(--color-warning)_15%,var(--color-card))] shadow-menu"
      variant="warning"
    >
      <p class="m-0 font-semibold">Offline</p>
      <p class="m-0">It looks like your Kuzzle instance is currently unreachable</p>
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { pageTitle } from '../services/pageTitle';
import { antiGlitchOverlayTimeout } from '../utils';
import { Alert } from '@/components/ui/alert';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';

import OfflineSpinner from './Common/Offline.vue';
import ErrorPage from './Error/KuzzleErrorPage.vue';

defineEmits<{
  (e: 'environment::create', id?: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const route = useRoute();
const router = useRouter();

const offlineVisible = ref(false);
const showOfflineSpinner = ref(false);

const kuzzleError = computed(() => kuzzleStore.errorFromKuzzle);
const connecting = computed(() => kuzzleStore.connecting);

function initListeners(): void {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    return;
  }
  kuzzle.on('networkError', (error) => {
    logger.error(`ConnectionAwareContainer:kuzzle.on('networkError'): ${error.message}`);
  });
  kuzzle.addListener('connected', async () => {
    kuzzleStore.connecting = false;
    kuzzleStore.online = true;

    logger.debug('ConnectionAwareContainer::initializing auth upon connection...');
    try {
      await authStore.init();
    } catch (error) {
      const { code, id, message } = caught(error);
      logger.error(
        `ConnectionAwareContainer:initializing auth: "${message}" - code: ${code} - id: ${id}`,
      );
      if (id === 'api.process.incompatible_sdk_version' && error instanceof Error) {
        return kuzzleStore.onConnectionError(error);
      }
    }
    authenticationGuard();
  });
  kuzzle.addListener('reconnected', () => {
    kuzzleStore.connecting = false;
    kuzzleStore.online = true;

    logger.debug('ConnectionAwareContainer::checking token after reconnection...');
    authStore.checkToken();
  });
  kuzzle.addListener('disconnected', () => {
    logger.debug('ConnectionAwareContainer::backend went offline...');
    kuzzleStore.online = false;
  });
}

function removeListeners(): void {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    return;
  }
  kuzzle.removeAllListeners('networkError');
  kuzzle.removeAllListeners('connected');
  kuzzle.removeAllListeners('reconnected');
  kuzzle.removeAllListeners('disconnected');
}

function checkConnection(): void {
  offlineVisible.value = kuzzleStore.online === false && kuzzleStore.connecting === false;
}

function updatePageTitle(): void {
  document.title = pageTitle(route, kuzzleStore.currentEnvironment?.name);
}

async function onEnvironmentSwitch(): Promise<void> {
  logger.debug('ConnectionAwareContainer::environmentSwitched');
  authStore.tokenValid = false;

  updatePageTitle();
  removeListeners();
  initListeners();
  try {
    await kuzzleStore.connectToCurrentEnvironment();
  } catch (error) {
    logger.error(`ConnectionAwareContainer:onEnvironmentSwitch: ${caught(error).message}`);
  }
}

async function authenticationGuard(): Promise<void> {
  logger.debug('ConnectionAwareContainer::authentication guard');
  if (route.meta.skipLogin) {
    return;
  }
  if (route.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    logger.debug('ConnectionAwareContainer::not authenticated');
    router.push({
      name: 'Login',
      query: { to: typeof route.name === 'string' ? route.name : undefined },
    });
  }
}

/*
 * Les observateurs sont déclarés dans l'ordre de l'option `watch` d'origine :
 * ceux qui sont `immediate` partent à la création, l'un après l'autre, et
 * l'ordre décide de qui branche les écouteurs du SDK en premier.
 */
watch(
  () => route.path,
  () => {
    authenticationGuard();
  },
);

watch(
  () => kuzzleStore.$kuzzle,
  (instance) => {
    if (!instance) {
      return;
    }
    removeListeners();
    initListeners();
  },
  { immediate: true },
);

watch(
  () => kuzzleStore.currentId,
  async () => {
    try {
      await onEnvironmentSwitch();
    } catch (error) {
      logger.error(`ConnectionAwareContainer:currentEnvironmentWatch: ${caught(error).message}`);
    }
  },
  { immediate: true },
);

watch(
  () => kuzzleStore.online,
  () => {
    checkConnection();
  },
  { immediate: true },
);

watch(
  connecting,
  (val) => {
    showOfflineSpinner.value = val;
    setTimeout(() => {
      showOfflineSpinner.value = true;
    }, antiGlitchOverlayTimeout);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  removeListeners();
});
</script>

<style>
.AntiGlitchOverlay {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: color-mix(in srgb, var(--background) 80%, transparent);
  z-index: 10;
}
</style>
