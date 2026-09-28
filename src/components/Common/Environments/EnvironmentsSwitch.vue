<template>
  <div class="EnvironmentSwitch inline-block">
    <DropdownMenu v-model:open="menuOpen">
      <!--
      `blendColor` : sur le rail, dont le fond est la couleur de la connexion
      (ADR-0048), la pastille assombrit ce fond au lieu de l'éclaircir : le
      texte blanc garde son contraste sur toutes les couleurs (ADR-0049).
      `iconOnly` : rail replié, le déclencheur n'est plus qu'une icône, mais
      le menu reste le même et le nom de la connexion est annoncé.
    -->
      <DropdownMenuTrigger
        :as="Button"
        :aria-label="
          iconOnly
            ? `Connection: ${currentEnvironment ? currentEnvironment.name : 'none'}`
            : undefined
        "
        :class="[
          'max-w-full gap-2',
          iconOnly ? 'justify-center' : 'justify-between',
          block ? 'w-full' : '',
          blendColor ? 'border-white/30 bg-black/20 text-white hover:bg-black/30' : '',
        ]"
        data-cy="EnvironmentSwitch"
        :size="iconOnly ? 'icon' : 'default'"
        :title="iconOnly && currentEnvironment ? currentEnvironment.name : undefined"
        variant="outline"
      >
        <i v-if="iconOnly" class="fas fa-plug" aria-hidden="true" />
        <template v-else>
          <span class="truncate">
            <template v-if="currentEnvironment">
              <i
                v-if="!isValidEnvironment(currentEnvironment)"
                class="fas fa-exclamation-triangle text-destructive"
                aria-hidden="true"
              />
              <span v-if="!isValidEnvironment(currentEnvironment)" class="sr-only">
                Invalid connection:
              </span>
              {{ currentEnvironment.name }}
            </template>
            <template v-else>Select a connection</template>
          </span>
          <i class="fas fa-caret-down" aria-hidden="true" />
        </template>
      </DropdownMenuTrigger>

      <DropdownMenuContent :align="right ? 'end' : 'start'">
        <!--
        Une connexion, c'est une action (s'y rendre) et deux actions annexes
        (éditer, supprimer). `b-dropdown-item` les empilait dans le même `<a>`,
        donc des zones cliquables imbriquées dans un lien. Ici l'élément de
        menu ne porte que le nom, et les deux icônes sont des boutons à côté.
        N'étant pas des `DropdownMenuItem`, ils ferment le menu eux-mêmes :
        la modale qu'ils ouvrent passerait sinon sous le panneau (ADR-0018
        § 2, E-04 de la comparaison v4 / v5).
      -->
        <div
          v-for="(env, index) in sortObject(environments)"
          :key="env.name"
          class="EnvironmentSwitch-env flex items-center gap-1 pr-2"
        >
          <DropdownMenuItem
            class="min-w-0 flex-1"
            :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}`"
            @select="
              isValidEnvironment(env) ? switchEnv(index) : $emit('environment::create', index)
            "
          >
            <span class="EnvironmentSwitch-env-name block min-w-0 max-w-[250px]">
              <span class="block truncate">
                {{ env.name }}
                <i
                  v-if="!isValidEnvironment(env)"
                  class="fas fa-exclamation-triangle text-destructive"
                  aria-hidden="true"
                />
              </span>
              <span class="block truncate text-xs text-muted-foreground">{{ env.host }}</span>
            </span>
          </DropdownMenuItem>

          <Button
            :aria-label="`Edit connection ${env.name}`"
            :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-edit`"
            size="icon"
            variant="ghost"
            @click="(closeMenu(), $emit('environment::create', index))"
          >
            <i class="fa fa-pencil-alt" aria-hidden="true" />
          </Button>
          <Button
            :aria-label="`Delete connection ${env.name}`"
            class="text-destructive"
            :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-delete`"
            size="icon"
            variant="ghost"
            @click="(closeMenu(), $emit('environment::delete', index))"
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
  </div>
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
    iconOnly: {
      type: Boolean,
      default: false,
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
      menuOpen: false,
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
    // Le nom de l'événement reste écrit en toutes lettres dans le template :
    // `check:dom-emits` ne sait pas suivre un nom calculé (ADR-0029).
    closeMenu() {
      this.menuOpen = false;
    },
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
