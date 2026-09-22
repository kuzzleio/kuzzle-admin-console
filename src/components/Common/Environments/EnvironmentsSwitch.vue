<template>
  <DropdownMenu
    class="EnvironmentSwitch"
    :class="blendColor ? 'EnvironmentSwitch--blendColor' : ''"
  >
    <!--
      `blendColor` : fond translucide sur la barre colorée du menu principal.
      La couleur vient de `EnvColor--*`, un reste de l'ancienne charte ; ce
      blanc translucide s'en ira avec elle, pas avant.
    -->
    <DropdownMenuTrigger
      :as="Button"
      :class="[
        'tw:max-w-full tw:justify-between tw:gap-2',
        block ? 'tw:w-full' : '',
        blendColor ? 'tw:border-transparent tw:bg-white/40 tw:text-white tw:hover:bg-white/60' : '',
      ]"
      data-cy="EnvironmentSwitch"
      variant="outline"
    >
      <span class="tw:truncate">
        <template v-if="currentEnvironment">
          <i
            v-if="!isValidEnvironment(currentEnvironment)"
            class="fas fa-exclamation-triangle tw:text-destructive"
            aria-hidden="true"
          />
          {{ currentEnvironment.name }}
        </template>
        <template v-else>Select a connection</template>
      </span>
      <i class="fas fa-caret-down" aria-hidden="true" />
    </DropdownMenuTrigger>

    <DropdownMenuContent :align="right ? 'end' : 'start'" class="tw:max-h-[98vh] tw:overflow-auto">
      <!--
        Une connexion, c'est une action (s'y rendre) et deux actions annexes
        (éditer, supprimer). `b-dropdown-item` les empilait dans le même `<a>`,
        donc des zones cliquables imbriquées dans un lien. Ici l'élément de
        menu ne porte que le nom, et les deux icônes sont des boutons à côté.
      -->
      <div
        v-for="(env, index) in sortObject(environments)"
        :key="env.name"
        class="EnvironmentSwitch-env tw:flex tw:items-center tw:gap-1 tw:pr-2"
      >
        <DropdownMenuItem
          class="tw:min-w-0 tw:flex-1"
          :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}`"
          @select="isValidEnvironment(env) ? switchEnv(index) : $emit('environment::create', index)"
        >
          <span class="EnvironmentSwitch-env-name tw:block tw:min-w-0 tw:max-w-[250px]">
            <span class="tw:block tw:truncate">
              {{ env.name }}
              <i
                v-if="!isValidEnvironment(env)"
                class="fas fa-exclamation-triangle tw:text-destructive"
                aria-hidden="true"
              />
            </span>
            <span class="tw:block tw:truncate tw:text-xs tw:text-muted-foreground">{{
              env.host
            }}</span>
          </span>
        </DropdownMenuItem>

        <Button
          :aria-label="`Edit connection ${env.name}`"
          :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-edit`"
          size="icon"
          variant="ghost"
          @click="$emit('environment::create', index)"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          :aria-label="`Delete connection ${env.name}`"
          class="tw:text-destructive"
          :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-delete`"
          size="icon"
          variant="ghost"
          @click="$emit('environment::delete', index)"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        data-cy="EnvironmentSwitch-newConnectionBtn"
        @select="$emit('environment::create')"
      >
        Create new connection
      </DropdownMenuItem>
      <DropdownMenuItem
        as="a"
        data-cy="export-environments"
        download="connections.json"
        :href="exportUrl"
      >
        Export all
      </DropdownMenuItem>
      <DropdownMenuItem @select="$emit('environment::importEnv')">Import</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script>
import { markRaw } from 'vue';
import { mapValues, omit } from 'lodash';
import { mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useKuzzleStore } from '@/stores';
import { formatForDom, sortObject } from '@/utils';
import { isValidEnvironment } from '@/validators';

export default {
  name: 'EnvironmentSwitch',
  components: {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  },
  props: {
    blendColor: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: true,
    },
    right: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    return {
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
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['currentEnvironment']),
    exportUrl() {
      const envWitoutToken = mapValues(this.kuzzleStore.environments, (e) => omit(e, 'token'));

      const blob = new Blob([JSON.stringify(envWitoutToken)], {
        type: 'application/json',
      });

      return URL.createObjectURL(blob);
    },
    environments() {
      return this.kuzzleStore.environments;
    },
  },
  methods: {
    isValidEnvironment,
    async switchEnv(id) {
      try {
        await this.kuzzleStore.setCurrentEnvironment(id);
        this.$emit('environmentSwitched');
      } catch (error) {
        this.$log.error(error);
        if (error.code) {
          await this.kuzzleStore.onConnectionError(error);
        }
      }
    },
    sortObject,
    formatForDom,
  },
};
</script>
