<template>
  <!--
    Raccourcis de l'onglet : Ctrl/⌘ + Entrée lance la requête, Ctrl/⌘ + S
    l'enregistre, où que soit le focus dans l'onglet. Dans l'éditeur, Ace
    intercepte ces combinaisons avant qu'elles ne remontent jusqu'ici : il les
    reçoit comme commandes (`shortcuts`). Les boutons les annoncent par
    `aria-keyshortcuts` et leur `title`.
  -->
  <div
    class="flex flex-col gap-3 md:h-full"
    @keydown.ctrl.enter.exact.prevent="runFromKeyboard"
    @keydown.meta.enter.exact.prevent="runFromKeyboard"
    @keydown.ctrl.s.exact.prevent="saveFromKeyboard"
    @keydown.meta.s.exact.prevent="saveFromKeyboard"
  >
    <div class="flex flex-wrap items-center gap-2">
      <!--
        `b-tooltip` disait « The query is invalid. » sur trois cibles à la
        fois ; l'attribut `title` le dit sur les champs eux-mêmes, et le
        navigateur l'affiche sans directive.
      -->
      <div
        class="flex min-w-60 flex-1 items-stretch overflow-hidden rounded-sm border border-input"
      >
        <label
          class="flex items-center bg-muted px-3 font-sans text-sm text-muted-foreground"
          :for="`controller-input-${tabIdx}`"
          >Controller</label
        >
        <Input
          :id="`controller-input-${tabIdx}`"
          v-model="editedQuery.controller"
          class="rounded-none border-0"
          :data-cy="`api-actions-controller-input-${tabIdx}`"
          :disabled="!isQueryValid(jsonQuery)"
          list="controllersList"
          placeholder="Select or type your controller"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
        />
        <Button
          aria-label="Clear the controller"
          class="rounded-none"
          size="icon"
          variant="ghost"
          @click="editedQuery.controller = ''"
        >
          <i class="fas fa-times" aria-hidden="true" />
        </Button>
      </div>
      <datalist id="controllersList">
        <option v-for="controller of controllers" :key="`${tabIdx}-${controller}`">
          {{ controller }}
        </option>
      </datalist>

      <div
        class="flex min-w-60 flex-1 items-stretch overflow-hidden rounded-sm border border-input"
      >
        <label
          class="flex items-center bg-muted px-3 font-sans text-sm text-muted-foreground"
          :for="`action-input-${tabIdx}`"
          >Action</label
        >
        <Input
          :id="`action-input-${tabIdx}`"
          v-model="editedQuery.action"
          class="rounded-none border-0"
          :data-cy="`api-actions-action-input-${tabIdx}`"
          :disabled="!isQueryValid(jsonQuery)"
          list="actionsList"
          placeholder="Select or type your action"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
        />
        <Button
          aria-label="Clear the action"
          class="rounded-none"
          size="icon"
          variant="ghost"
          @click="editedQuery.action = ''"
        >
          <i class="fas fa-times" aria-hidden="true" />
        </Button>
      </div>
      <datalist id="actionsList">
        <option v-for="action of actions" :key="`${tabIdx}-${action}`">{{ action }}</option>
      </datalist>

      <!--
        `b-popover` rendait un panneau flottant pour deux liens. Le même
        contenu tient dans un `DropdownMenu`, qui est déjà là et sait se
        placer (ADR-0012).
      -->
      <DropdownMenu>
        <DropdownMenuTrigger
          :as="Button"
          aria-label="About custom queries"
          size="icon"
          variant="ghost"
        >
          <i class="fas fa-question-circle fa-lg" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="max-w-sm p-3 text-sm">
          Here, you'll be able to perform custom
          <a
            class="underline"
            href="https://docs.kuzzle.io/sdk/js/7/core-classes/kuzzle/query/"
            rel="noopener"
            target="_blank"
            >query <i class="fa fa-external-link-alt" aria-hidden="true"
          /></a>
          to Kuzzle following the
          <a
            class="underline"
            href="https://docs.kuzzle.io/core/2/api/payloads/request/"
            rel="noopener"
            target="_blank"
            >API Documentation <i class="fa fa-external-link-alt" aria-hidden="true" /></a
          >.
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="ml-auto flex gap-2">
        <Button
          :data-cy="`api-actions-run-button-${tabIdx}`"
          aria-keyshortcuts="Control+Enter Meta+Enter"
          :disabled="!isQueryValid(jsonQuery)"
          :title="
            isQueryValid(jsonQuery) ? `Run (${shortcutModifier} + Enter)` : 'The query is invalid.'
          "
          @click="performQuery"
        >
          <i class="fas fa-rocket" aria-hidden="true" />
          RUN
        </Button>
        <Button
          :data-cy="`api-actions-save-button-${tabIdx}`"
          aria-keyshortcuts="Control+S Meta+S"
          :disabled="!isQueryValid(jsonQuery)"
          :title="
            isQueryValid(jsonQuery) ? `Save (${shortcutModifier} + S)` : 'The query is invalid.'
          "
          variant="outline"
          @click="saveQuery"
        >
          <i class="fas fa-save" aria-hidden="true" />
          SAVE
        </Button>
      </div>
    </div>

    <!--
      Sous `md`, la requête passe au-dessus de la réponse, chacune sur 18 rem,
      et le groupe déborde dans la zone qui défile. Les `!` remplacent le
      style en ligne de `reka-ui` (G-099).
    -->
    <ResizablePanelGroup
      class="QueryLayout min-h-0 flex-1 max-md:flex-col! max-md:overflow-visible!"
      direction="horizontal"
    >
      <ResizablePanel
        class="QueryLayout-sidebarWrapper h-72 overflow-auto! max-md:flex-none! md:h-auto"
        data-cy="QueryLayout-sidebarWrapper"
        :default-size="50"
      >
        <Card class="h-full">
          <CardContent class="flex h-full min-h-0 flex-col">
            <json-editor
              :id="`queryEditorWrapper-${tabIdx}`"
              :ref="`queryEditorWrapper-${tabIdx}`"
              class="min-h-0 flex-1"
              :content="jsonQuery"
              :data-cy="`api-actions-query-JSONEditor-${tabIdx}`"
              :shortcuts="editorShortcuts"
              @change="queryBodyChange"
              @shortcut="onEditorShortcut"
            />
          </CardContent>
        </Card>
      </ResizablePanel>

      <ResizableHandle
        v-if="sideBySide"
        aria-label="Resize the query editor"
        data-cy="sidebarResizer"
        with-handle
      />

      <ResizablePanel class="QueryLayout-contentWrapper min-h-72 overflow-auto! md:min-h-0">
        <ResponseCard :tab-idx="tabIdx" :response="response" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script>
import _ from 'lodash';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useSideBySide } from '@/composables/useSideBySide';

import ResponseCard from '@/components/ApiAction/ResponseCard.vue';
import jsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'QueryCard',
  components: {
    jsonEditor,
    ResponseCard,
    Button,
    Card,
    CardContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    Input,
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  },
  props: {
    query: {},
    tabIdx: {},
    api: {},
    openapi: {},
    response: {},
  },
  setup() {
    return { sideBySide: useSideBySide() };
  },
  data() {
    return {
      isFullScreen: false,
      jsonQuery: '{}',
      editedQuery: {
        controller: null,
        action: null,
        body: {},
      },
    };
  },
  computed: {
    /* Le modificateur que l'utilisateur a sous les doigts, pour le `title`. */
    editorShortcuts() {
      return {
        run: { mac: 'Command-Enter', win: 'Ctrl-Enter' },
        save: { mac: 'Command-S', win: 'Ctrl-S' },
      };
    },
    shortcutModifier() {
      return /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl';
    },
    controllers() {
      return this.api ? Object.keys(this.api) : [];
    },
    actions() {
      if (!this.api) {
        return [];
      }
      const currentController = this.editedQuery.controller;
      return currentController && this.api[currentController]
        ? Object.keys(this.api[currentController])
        : [];
    },
  },
  watch: {
    editedQuery: {
      deep: true,
      handler(value) {
        this.$emit('queryChanged', { query: value, tabIdx: this.tabIdx });
      },
    },
    'editedQuery.controller': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery);
        if (value !== tmp.controller) {
          tmp.controller = value;
          this.jsonQuery = JSON.stringify(tmp, null, 2);
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
        }
      },
    },
    'editedQuery.action': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery);
        if (value !== tmp.action) {
          tmp.action = value;
          this.jsonQuery = JSON.stringify(tmp, null, 2);
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
          this.loadQueryParams();
        }
      },
    },
  },
  mounted() {
    this.editedQuery = JSON.parse(JSON.stringify(this.query));
    this.jsonQuery = JSON.stringify(this.editedQuery, null, 2);
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    saveQuery() {
      this.$emit('saveQuery', this.tabIdx);
    },
    onEditorShortcut(name) {
      if (name === 'run') {
        this.runFromKeyboard();
      } else if (name === 'save') {
        this.saveFromKeyboard();
      }
    },
    runFromKeyboard() {
      if (this.isQueryValid(this.jsonQuery)) {
        this.performQuery();
      }
    },
    saveFromKeyboard() {
      if (this.isQueryValid(this.jsonQuery)) {
        this.saveQuery();
      }
    },
    performQuery() {
      this.$emit('performQuery', this.tabIdx);
    },
    loadQueryParams() {
      const query = JSON.parse(JSON.stringify(this.editedQuery));
      const api = _.get(this.api, `${query.controller}.${query.action}`, null);
      if (!api) {
        const obj = {
          controller: query.controller,
          action: query.action,
          body: {},
        };
        this.jsonQuery = JSON.stringify(obj, null, 2);
        this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
        return;
      }
      const path = api.http[0].url;
      const verb = api.http[0].verb.toLowerCase();
      const openApiPath = path.replaceAll(/:[^,/]+/g, (m) => `{${m.replace(':', '')}}`);

      const params = _.get(this.openapi, `${openApiPath}.${verb}.parameters`, null);
      if (params) {
        for (const param of params) {
          query[param.name] = '';
        }
      }
      const body = _.get(this.openapi, `${openApiPath}.${verb}.requestBody`, null);
      if (body && body.content['application/json']) {
        const prefilledBody = body.content['application/json'].schema.properties;
        for (const key of Object.keys(prefilledBody)) {
          switch (prefilledBody[key].type) {
            case 'string':
              query.body[key] = '';
              break;
            case 'number':
            case 'integer':
              query.body[key] = 0;
              break;
            case 'boolean':
              query.body[key] = false;
              break;
            case 'array':
              query.body[key] = [];
              break;
            case 'object':
              query.body[key] = {};
              break;
            default:
              query.body[key] = '';
          }
        }
      }
      this.jsonQuery = JSON.stringify(query, null, 2);
      this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
    },
    queryBodyChange($event) {
      this.jsonQuery = $event;
      if (this.isQueryValid($event)) {
        this.editedQuery = JSON.parse($event);
      }
    },
    isQueryValid(query) {
      if (!query) {
        return false;
      }
      try {
        JSON.parse(query);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
</script>
