<template>
  <!--
    Rail de navigation (ADR-0048). Il porte la couleur de la connexion
    (`EnvColor--*`) : `darkblue`, la couleur par défaut, est le bleu Kuzzle du
    rail du DS. Vertical à partir de `md`, barre horizontale en dessous.
  -->
  <nav
    aria-label="Main"
    :class="[
      `MainMenu EnvColor--${currentEnvironmentColor}`,
      'flex flex-wrap items-center gap-x-2 px-2 text-white',
      'min-h-[var(--navbar-height)] md:h-full md:flex-col md:flex-nowrap md:items-stretch md:gap-0 md:px-0 md:py-3',
      collapsed ? 'md:w-[var(--rail-collapsed-width)]' : 'md:w-[var(--rail-width)]',
    ]"
    :data-collapsed="collapsed ? 'true' : 'false'"
  >
    <router-link class="logo shrink-0 md:px-4 md:pb-4" :to="{ name: 'Data' }">
      <!--
        `v-b-tooltip.hover` doublait l'attribut `title` que le navigateur
        affiche déjà. La directive part avec bootstrap-vue, le titre reste.
      -->
      <img
        alt="Kuzzle.io"
        :class="['h-12 px-4 py-1 md:px-0', collapsed ? 'md:hidden' : '']"
        src="~../../assets/logo-white.svg"
        :title="`Admin Console v${adminConsoleVersion} (${adminConsoleCommitHash})`"
      />
      <!-- Rail replié : la marque carrée, le logo horizontal n'y tient pas. -->
      <img
        v-if="collapsed"
        alt="Kuzzle.io"
        class="mx-auto hidden size-8 md:block"
        src="~../../assets/logo-white-vertical.png"
        :title="`Admin Console v${adminConsoleVersion} (${adminConsoleCommitHash})`"
      />
    </router-link>

    <!--
      `b-navbar-toggle` + `b-collapse` : un bouton qui déplie le menu sous le
      point de rupture `md`. Le repli est porté par `hidden`/`flex` plutôt que
      par une classe d'état, et le bouton annonce `aria-expanded`.
    -->
    <Button
      aria-controls="nav-collapse"
      :aria-expanded="expanded ? 'true' : 'false'"
      aria-label="Toggle navigation"
      class="ml-auto text-white hover:bg-white/10 hover:text-white focus-visible:ring-white focus-visible:ring-offset-0 md:hidden"
      size="icon"
      variant="ghost"
      @click="expanded = !expanded"
    >
      <i class="fas fa-bars" aria-hidden="true" />
    </Button>

    <div
      id="nav-collapse"
      class="w-full flex-col items-stretch gap-2 py-2 md:flex md:min-h-0 md:flex-1 md:gap-0 md:py-0"
      :class="expanded ? 'flex' : 'hidden'"
    >
      <ul class="flex list-none flex-col gap-1 pl-0 md:gap-0">
        <li v-for="section of sections" :key="section.route">
          <router-link
            :aria-current="isCurrent(section) ? 'page' : undefined"
            :class="[itemClasses, isCurrent(section) ? activeItemClasses : hoverItemClasses]"
            :title="collapsed ? section.label : undefined"
            :to="{ name: section.route }"
          >
            <i :class="['fas w-5 shrink-0 text-center', section.icon]" aria-hidden="true" />
            <span :class="collapsed ? 'md:sr-only' : ''">{{ section.label }}</span>
          </router-link>
        </li>

        <li>
          <DropdownMenu>
            <DropdownMenuTrigger
              :class="[itemClasses, hoverItemClasses, 'w-full border-0 bg-transparent text-left']"
              :title="collapsed ? 'Feedback' : undefined"
            >
              <i class="fas fa-comments w-5 shrink-0 text-center" aria-hidden="true" />
              <span :class="collapsed ? 'md:sr-only' : ''">Feedback</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                v-for="feedback of feedbackOptions"
                :key="`feedback-${feedback.text}`"
                as="a"
                :href="feedback.url"
                rel="noopener"
                target="_blank"
              >
                <i :class="feedback.icon" class="mr-2 w-4" aria-hidden="true" />
                {{ feedback.text }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>

      <!--
        Pied de rail : la connexion, et le repli. La connexion est
        l'information la plus importante du pied — c'est elle qui dit « local »
        ou « production » : elle a son libellé, et reste accessible rail
        replié, par une icône qui ouvre le même menu. L'utilisateur et la
        déconnexion sont dans la barre de session (ADR-0055).
      -->
      <div
        class="flex flex-wrap items-center gap-2 md:mt-auto md:flex-col md:flex-nowrap md:items-stretch md:gap-1 md:pt-4"
      >
        <div :class="['min-w-0 md:px-5 md:pb-2', collapsed ? 'md:px-3' : '']">
          <span
            :class="[
              'hidden text-label font-bold uppercase text-white/90',
              collapsed ? '' : 'md:block md:pb-1',
            ]"
            >Connection</span
          >
          <environment-switch
            class="MainMenu-envSwitch max-w-full"
            :blend-color="true"
            :block="true"
            :icon-only="collapsed"
            @environment::importEnv="importEnv"
            @environment::create="editEnvironment"
            @environment::delete="deleteEnvironment"
          />
        </div>
        <button
          :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
          :class="[
            itemClasses,
            hoverItemClasses,
            'hidden cursor-pointer border-0 bg-transparent text-white/90 md:flex',
          ]"
          data-cy="MainMenu-collapseBtn"
          type="button"
          @click="toggleCollapsed"
        >
          <i
            :class="[
              'fas w-5 shrink-0 text-center',
              collapsed ? 'fa-angle-double-right' : 'fa-angle-double-left',
            ]"
            aria-hidden="true"
          />
          <span :class="collapsed ? 'sr-only' : ''">Collapse navigation</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Environments/EnvironmentsSwitch.vue';

// État replié du rail, retenu par navigateur (ADR-0048).
const COLLAPSED_KEY = 'kuz-ac-rail-collapsed';

interface Section {
  icon: string;
  label: string;
  route: string;
  segment: string;
  visible?: boolean;
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

const emit = defineEmits<{
  (e: 'environment::create', id: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const route = useRoute();

const collapsed = ref(readCollapsed());
const expanded = ref(false);
const feedbackOptions = [
  {
    text: 'Talk with our community',
    url: 'http://join.discord.kuzzle.io/',
    icon: 'fab fa-discord',
  },
  {
    text: 'Ask a question',
    url: 'https://stackoverflow.com/questions/ask?tags=kuzzle&title=[Admin%20Console]',
    icon: 'fab fa-stack-overflow',
  },
  {
    text: 'Fill an issue',
    url: 'https://github.com/kuzzleio/kuzzle-admin-console/issues/new/choose',
    icon: 'fab fa-github',
  },
];

const sections = computed((): Section[] =>
  [
    { icon: 'fa-database', label: 'Data', route: 'Data', segment: '/data' },
    {
      icon: 'fa-shield-alt',
      label: 'Security',
      route: 'Security',
      segment: '/security',
      visible: authStore.hasSecurityRights,
    },
    { icon: 'fa-terminal', label: 'API Action', route: 'ApiAction', segment: '/api-action' },
  ].filter((section: Section) => section.visible !== false),
);

/*
 * Éléments du rail (DESIGN.md, « Navigation ») : survol fuchsia à 20 % et
 * filet de 3 px à gauche, élément actif en fuchsia plein. Sous `md`, la
 * barre horizontale garde des éléments compacts.
 */
const itemClasses = computed((): string =>
  [
    'flex items-center gap-3 px-3 py-2 font-sans text-ui font-medium text-white',
    'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset',
    'md:px-5 md:py-2.5',
    collapsed.value ? 'md:justify-center md:px-0' : '',
  ].join(' '),
);
const hoverItemClasses = 'hover:bg-primary/20 hover:shadow-[inset_3px_0_0_var(--color-primary)]';
// Fuchsia profond (texte blanc à 5:1, le fuchsia clair n'atteint que 3,9)
// et un filet blanc : l'élément actif reste lisible sur un rail rouge ou
// magenta, où le fond seul se confondrait avec la couleur de connexion.
const activeItemClasses =
  'bg-(--rail-active) font-bold shadow-[inset_3px_0_0_var(--rail-active-rule)]';
const currentEnvironmentColor = computed(() => kuzzleStore.currentEnvironment?.color);
const adminConsoleVersion = __APP_VERSION__;
const adminConsoleCommitHash = __COMMIT_HASH__;

function toggleCollapsed(): void {
  collapsed.value = !collapsed.value;
  try {
    localStorage.setItem(COLLAPSED_KEY, collapsed.value ? 'true' : 'false');
  } catch {
    // Stockage indisponible (navigation privée) : l'état vaut pour la session.
  }
}

function isCurrent(section: Section): boolean {
  return route.path.includes(section.segment);
}

function editEnvironment(id: string): void {
  emit('environment::create', id);
}

function importEnv(): void {
  emit('environment::importEnv');
}

function deleteEnvironment(id: string): void {
  emit('environment::delete', id);
}
</script>
