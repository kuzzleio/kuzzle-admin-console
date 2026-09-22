<template>
  <nav
    :class="`MainMenu EnvColor--${currentEnvironmentColor} tw:flex tw:min-h-[var(--navbar-height)] tw:flex-wrap tw:items-center tw:gap-x-2 tw:px-2`"
    aria-label="Main"
  >
    <a class="logo tw:shrink-0" href="#">
      <!--
        `v-b-tooltip.hover` doublait l'attribut `title` que le navigateur
        affiche déjà. La directive part avec bootstrap-vue, le titre reste.
      -->
      <img
        alt="Kuzzle.io"
        class="tw:h-12 tw:px-12 tw:py-1"
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
      class="tw:ml-auto tw:text-white tw:sm:hidden"
      size="icon"
      variant="ghost"
      @click="expanded = !expanded"
    >
      <i class="fas fa-bars" aria-hidden="true" />
    </Button>

    <div
      id="nav-collapse"
      class="tw:w-full tw:flex-col tw:items-stretch tw:gap-2 tw:py-2 tw:sm:flex tw:sm:w-auto tw:sm:flex-1 tw:sm:flex-row tw:sm:items-center tw:sm:py-0"
      :class="expanded ? 'tw:flex' : 'tw:hidden'"
    >
      <ul
        class="tw:flex tw:list-none tw:flex-col tw:gap-1 tw:pl-0 tw:sm:flex-row tw:sm:items-center"
      >
        <li v-for="section of sections" :key="section.route">
          <router-link
            :aria-current="isCurrent(section) ? 'page' : undefined"
            :class="[
              'tw:block tw:px-3 tw:py-2 tw:text-white',
              isCurrent(section) ? 'tw:opacity-100' : 'tw:opacity-50 tw:hover:opacity-75',
            ]"
            :to="{ name: section.route }"
            >{{ section.label }}</router-link
          >
        </li>

        <li>
          <DropdownMenu>
            <DropdownMenuTrigger
              :as="Button"
              class="tw:text-white tw:opacity-50 tw:hover:opacity-75"
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
                <i :class="feedback.icon" class="tw:mr-2 tw:w-4" aria-hidden="true" />
                {{ feedback.text }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>

      <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:sm:ml-auto">
        <b
          class="MainMenu-username tw:max-w-[250px] tw:truncate tw:text-white"
          :title="currentUserName"
          >{{ currentUserName }}</b
        >
        <span class="tw:text-white">on</span>
        <environment-switch
          class="MainMenu-envSwitch tw:max-w-[250px]"
          :blend-color="true"
          :block="false"
          @environment::importEnv="importEnv"
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment"
        />
        <Button
          class="tw:text-white"
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
