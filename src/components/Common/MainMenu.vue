<template>
  <nav
    :class="`MainMenu EnvColor--${currentEnvironmentColor} flex min-h-[var(--navbar-height)] flex-wrap items-center gap-x-2 px-2`"
    aria-label="Main"
  >
    <a class="logo shrink-0" href="#">
      <!--
        `v-b-tooltip.hover` doublait l'attribut `title` que le navigateur
        affiche déjà. La directive part avec bootstrap-vue, le titre reste.
      -->
      <img
        alt="Kuzzle.io"
        class="h-12 px-12 py-1"
        src="~../../assets/logo-white.svg"
        :title="`Admin Console v${adminConsoleVersion} (${adminConsoleCommitHash})`"
      />
    </a>

    <!--
      `b-navbar-toggle` + `b-collapse` : un bouton qui déplie le menu sous le
      point de rupture `sm`. Le repli est porté par `hidden`/`flex` plutôt que
      par une classe d'état, et le bouton annonce `aria-expanded`.
    -->
    <Button
      aria-controls="nav-collapse"
      :aria-expanded="expanded ? 'true' : 'false'"
      aria-label="Toggle navigation"
      class="ml-auto text-white sm:hidden"
      size="icon"
      variant="ghost"
      @click="expanded = !expanded"
    >
      <i class="fas fa-bars" aria-hidden="true" />
    </Button>

    <div
      id="nav-collapse"
      class="w-full flex-col items-stretch gap-2 py-2 sm:flex sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:py-0"
      :class="expanded ? 'flex' : 'hidden'"
    >
      <ul class="flex list-none flex-col gap-1 pl-0 sm:flex-row sm:items-center">
        <li v-for="section of sections" :key="section.route">
          <router-link
            :aria-current="isCurrent(section) ? 'page' : undefined"
            :class="[
              'block px-3 py-2 text-white',
              isCurrent(section) ? 'opacity-100' : 'opacity-50 hover:opacity-75',
            ]"
            :to="{ name: section.route }"
            >{{ section.label }}</router-link
          >
        </li>

        <li>
          <DropdownMenu>
            <DropdownMenuTrigger
              :as="Button"
              class="text-white opacity-50 hover:opacity-75"
              variant="ghost"
            >
              Feedback
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

      <div class="flex flex-wrap items-center gap-2 sm:ml-auto">
        <b class="MainMenu-username max-w-[250px] truncate text-white" :title="currentUserName">{{
          currentUserName
        }}</b>
        <span class="text-white">on</span>
        <environment-switch
          class="MainMenu-envSwitch max-w-[250px]"
          :blend-color="true"
          :block="false"
          @environment::importEnv="importEnv"
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment"
        />
        <Button
          class="text-white"
          data-cy="MainMenu-logoutBtn"
          size="icon"
          title="Logout"
          variant="ghost"
          @click="doLogout"
        >
          <i class="logout fas fa-power-off" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </nav>
</template>

<script>
import { markRaw } from 'vue';
import { mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Environments/EnvironmentsSwitch.vue';

export default {
  name: 'MainMenu',
  components: {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    EnvironmentSwitch,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      /*
       * `DropdownMenuTrigger` prend le composant en prop `as`, pas son nom.
       * `markRaw` et non `Object.freeze` : Vue met en cache le constructeur
       * sur les options du composant, et un objet gelé le lui interdit
       * (G-032).
       */
      Button: markRaw(Button),
      expanded: false,
      feedbackOptions: [
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
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['hasSecurityRights', 'user']),
    sections() {
      return [
        { label: 'Data', route: 'Data', segment: '/data' },
        {
          label: 'Security',
          route: 'Security',
          segment: '/security',
          visible: this.hasSecurityRights,
        },
        { label: 'API Action', route: 'ApiAction', segment: '/api-action' },
      ].filter((section) => section.visible !== false);
    },
    currentEnvironmentColor() {
      return this.kuzzleStore.currentEnvironment?.color;
    },
    currentUserName() {
      if (!this.user) {
        return 'Not authenticated';
      }
      if (this.user.id === -1) {
        return 'Anonymous';
      }
      if (this.user.params && this.user.params.name) {
        return this.user.params.name;
      }
      return this.user.id;
    },
    adminConsoleVersion() {
      return __APP_VERSION__;
    },
    adminConsoleCommitHash() {
      return __COMMIT_HASH__;
    },
  },
  methods: {
    isCurrent(section) {
      return this.$route.path.includes(section.segment);
    },
    async doLogout() {
      try {
        await this.authStore.doLogout();
      } catch (error) {
        this.$log.error(error);
      } finally {
        this.$router.push({ name: 'Login' });
      }
    },

    editEnvironment(id) {
      this.$emit('environment::create', id);
    },
    importEnv() {
      this.$emit('environment::importEnv');
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id);
    },
  },
};
</script>
