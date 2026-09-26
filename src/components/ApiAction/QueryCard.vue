<template>
  <div class="flex h-full flex-col gap-3">
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
          :disabled="!isQueryValid(jsonQuery)"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
          @click="performQuery"
        >
          <i class="fas fa-rocket" aria-hidden="true" />
          RUN
        </Button>
        <Button
          :data-cy="`api-actions-save-button-${tabIdx}`"
          :disabled="!isQueryValid(jsonQuery)"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
          variant="outline"
          @click="saveQuery"
        >
          <i class="fas fa-save" aria-hidden="true" />
          SAVE
        </Button>
      </div>
    </div>

    <ResizablePanelGroup class="QueryLayout min-h-0 flex-1" @resize="onPaneResize">
      <ResizablePanel
        class="QueryLayout-sidebarWrapper h-full overflow-auto"
        :style="paneWidth ? { width: paneWidth } : { width: '50%' }"
        data-cy="QueryLayout-sidebarWrapper"
      >
        <Card class="h-full">
          <CardContent class="flex h-full min-h-0 flex-col">
            <json-editor
              :id="`queryEditorWrapper-${tabIdx}`"
              :ref="`queryEditorWrapper-${tabIdx}`"
              class="min-h-0 flex-1"
              :content="jsonQuery"
              :data-cy="`api-actions-query-JSONEditor-${tabIdx}`"
              @change="queryBodyChange"
            />
          </CardContent>
        </Card>
      </ResizablePanel>

      <ResizableHandle data-cy="sidebarResizer" label="Resize the query editor" />

      <ResizablePanel class="QueryLayout-contentWrapper h-full flex-1 overflow-auto">
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
  data() {
    return {
      isFullScreen: false,
      jsonQuery: '{}',
      /* Largeur de l'éditeur, en pixels : la moitié du groupe par défaut. */
      paneWidth: '',
      editedQuery: {
        controller: null,
        action: null,
        body: {},
      },
    };
  },
  computed: {
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
    onPaneResize(width) {
      this.paneWidth = `${width}px`;
    },
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    saveQuery() {
      this.$emit('saveQuery', this.tabIdx);
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
