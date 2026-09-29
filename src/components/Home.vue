<template>
  <!-- Rail à gauche à partir de `md`, barre en haut en dessous (ADR-0048). -->
  <div class="Home m-0 flex h-full flex-col md:flex-row">
    <!--
      Lien d'évitement : au clavier, on saute le rail pour aller au contenu.
      Un bouton et non `<a href="#main">` : le routeur est en mode hash, et
      l'ancre changerait de route au lieu de déplacer le focus.
    -->
    <button
      class="sr-only cursor-pointer border-0 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-skip-link) focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:shadow-menu focus:ring-2 focus:ring-ring"
      type="button"
      @click="skipToContent"
    >
      Skip to content
    </button>
    <div class="Home-menuWrapper shrink-0 md:h-full">
      <main-menu
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </div>

    <div class="flex min-h-0 min-w-0 grow flex-col">
      <session-bar />
      <main
        id="main"
        class="Home-routeWrapper min-h-0 min-w-0 grow overflow-hidden outline-none"
        data-cy="App-loggedIn"
        tabindex="-1"
      >
        <main-spinner v-if="authInitializing" />
        <router-view v-else />
      </main>
    </div>

    <!--
      Monté à l'ouverture seulement : la session expire le plus souvent
      pendant qu'une autre modale est ouverte, et un portail de `reka-ui` rend
      son contenu là où il a été monté dans `<body>`. Monté avec `Home`, il
      passait sous cette modale (G-091).
    -->
    <Dialog
      v-if="tokenExpiredIsOpen"
      :open="tokenExpiredIsOpen"
      @update:open="tokenExpiredIsOpen = $event"
    >
      <DialogContent data-cy="Modal-tokenExpired">
        <DialogHeader>
          <DialogTitle>Sorry, your session has expired</DialogTitle>
        </DialogHeader>
        <login-form />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/composables/useToast';
import { useAuthStore, useKuzzleStore } from '@/stores';

import LoginForm from './Common/Login/Form.vue';
import MainMenu from './Common/MainMenu.vue';
import MainSpinner from './Common/MainSpinner.vue';
import SessionBar from './Common/SessionBar.vue';

defineEmits<{
  (e: 'environment::create', id?: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const toast = useToast();

const tokenExpiredIsOpen = ref(false);

const authInitializing = computed(() => authStore.initializing);

watch(
  () => authStore.tokenValid,
  (val) => {
    setTimeout(() => {
      tokenExpiredIsOpen.value = !val;
    }, 500);
  },
);

function onTokenExpired(): void {
  // Arrête aussi la surveillance du token : il n'y a plus rien à
  // rafraîchir, et la popup de reconnexion prend le relais (ADR-0057).
  authStore.loseSession();
}

// Le SDK v6 (backend v1) émet `(error, request)`, le SDK v7 émet
// `{ error, request }` (G-105). L'écouteur est enregistré sur l'un ou
// l'autre : il lit les deux formes. La charge est facultative pour le type de
// `removeListener`, qui déclare des écouteurs sans argument.
function onQueryError(payload?: { error?: { id?: string }; id?: string }): void {
  if (kuzzleStore.currentEnvironment?.backendMajorVersion === 1) {
    switch (payload?.id) {
      case 'security.token.invalid':
        onTokenExpired();
        break;
      default:
        break;
    }
  } else {
    switch (payload?.error?.id) {
      case 'security.token.expired':
        onTokenExpired();
        break;
      default:
        break;
    }
  }
}

/*
 * L'avertissement est un toast persistant avec une action, poussé dans la
 * zone unique (ADR-0020). `b-toast` le gardait monté en permanence et
 * l'affichait par son `id` ; ici il n'existe que s'il a lieu d'être.
 */
function hideNoAdminWarning(): void {
  kuzzleStore.updateEnvironment({
    id: kuzzleStore.currentId,
    environment: {
      ...kuzzleStore.currentEnvironment,
      hideAdminWarning: true,
    },
  });

  /* Rien à masquer : l'action ferme le toast. */
}

function skipToContent(): void {
  document.getElementById('main')?.focus();
}

function displayNoAdminWarning(): void {
  if (authStore.adminAlreadyExists) {
    return;
  }
  if (kuzzleStore.currentEnvironment?.hideAdminWarning) {
    return;
  }
  toast.show({
    actions: [
      {
        label: 'Ok, got it',
        handler: hideNoAdminWarning,
        title: "Don't show this toast again for the current environment",
      },
    ],
    autoHideAfter: null,
    link: { href: '#/signup', label: 'that you create one.' },
    message: 'Your Kuzzle has no administrator user. It is strongly recommended',
    title: 'Warning!',
    variant: 'info',
  });
}

onMounted(() => {
  kuzzleStore.$kuzzle?.on('tokenExpired', onTokenExpired);
  kuzzleStore.$kuzzle?.on('queryError', onQueryError);
  displayNoAdminWarning();
});

onBeforeUnmount(() => {
  // `removeListener` retire la fonction qu'on lui passe, et rien sans elle
  // (G-103).
  kuzzleStore.$kuzzle?.removeListener('tokenExpired', onTokenExpired);
  kuzzleStore.$kuzzle?.removeListener('queryError', onQueryError);
});
</script>
