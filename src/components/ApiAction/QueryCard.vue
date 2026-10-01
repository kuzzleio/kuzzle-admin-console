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
          :model-value="editedQuery.controller ?? undefined"
          class="rounded-none border-0"
          :data-cy="`api-actions-controller-input-${tabIdx}`"
          :disabled="!isQueryValid(jsonQuery)"
          list="controllersList"
          placeholder="Select or type your controller"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
          @update:model-value="editedQuery.controller = String($event)"
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
          :model-value="editedQuery.action ?? undefined"
          class="rounded-none border-0"
          :data-cy="`api-actions-action-input-${tabIdx}`"
          :disabled="!isQueryValid(jsonQuery)"
          list="actionsList"
          placeholder="Select or type your action"
          :title="isQueryValid(jsonQuery) ? '' : 'The query is invalid.'"
          @update:model-value="editedQuery.action = String($event)"
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
            <JsonEditor
              :id="`queryEditorWrapper-${tabIdx}`"
              ref="queryEditor"
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

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

import type {
  ApiQuery,
  OpenApiPaths,
  PublicApi,
  QueryResponse,
} from '@/components/ApiAction/types';
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
import JsonEditor from '@/components/Common/JsonEditor.vue';

const props = defineProps<{
  api: PublicApi | null;
  openapi: OpenApiPaths | null;
  query: ApiQuery;
  response: QueryResponse;
  tabIdx: number;
}>();

const emit = defineEmits<{
  (e: 'performQuery', tabIdx: number): void;
  (e: 'queryChanged', payload: { query: ApiQuery; tabIdx: number }): void;
  (e: 'saveQuery', tabIdx: number): void;
}>();

const sideBySide = useSideBySide();
const queryEditor = useTemplateRef<InstanceType<typeof JsonEditor>>('queryEditor');

const jsonQuery = ref('{}');
const editedQuery = ref<ApiQuery>({
  controller: null,
  action: null,
  body: {},
});

const editorShortcuts = {
  run: { mac: 'Command-Enter', win: 'Ctrl-Enter' },
  save: { mac: 'Command-S', win: 'Ctrl-S' },
};
/* Le modificateur que l'utilisateur a sous les doigts, pour le `title`. */
const shortcutModifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl';

const controllers = computed(() => (props.api ? Object.keys(props.api) : []));
const actions = computed(() => {
  if (!props.api) {
    return [];
  }
  const currentController = editedQuery.value.controller;
  return currentController && props.api[currentController]
    ? Object.keys(props.api[currentController])
    : [];
});

function isQueryValid(query: string): boolean {
  if (!query) {
    return false;
  }
  try {
    JSON.parse(query);
    return true;
  } catch {
    return false;
  }
}

function setEditorContent(content: string): void {
  jsonQuery.value = content;
  queryEditor.value?.setContent(content);
}

function loadQueryParams(): void {
  const query: ApiQuery = JSON.parse(JSON.stringify(editedQuery.value));
  const api =
    query.controller !== null && query.action !== null
      ? props.api?.[query.controller]?.[query.action]
      : undefined;
  if (!api) {
    setEditorContent(
      JSON.stringify({ controller: query.controller, action: query.action, body: {} }, null, 2),
    );
    return;
  }
  // Une action sans route HTTP (`realtime:subscribe`…) n'a rien à préremplir.
  const route = api.http?.[0];
  if (!route) {
    return;
  }
  const verb = route.verb.toLowerCase();
  const openApiPath = route.url.replaceAll(/:[^,/]+/g, (m) => `{${m.replace(':', '')}}`);
  const operation = props.openapi?.[openApiPath]?.[verb];

  for (const param of operation?.parameters ?? []) {
    query[param.name] = '';
  }
  /*
   * Seules les actions d'une app ou d'un plugin peuvent décrire leur corps :
   * Kuzzle sert leur définition en OpenAPI 3 (`scope=app`), copiée de la
   * route telle quelle. Celle du cœur (`scope=kuzzle`) est en Swagger 2.0 et
   * ne décrit aucun corps, ni `requestBody` ni paramètre `in: body` : pour ses
   * actions, le corps reste vide (#1110).
   */
  const jsonBody = operation?.requestBody?.content['application/json'];
  if (jsonBody) {
    // Une requête saisie sans `body` ne se préremplit pas, comme avant.
    const body = query.body;
    if (!body) {
      return;
    }
    const prefilledBody = jsonBody.schema.properties;
    for (const key of Object.keys(prefilledBody)) {
      switch (prefilledBody[key].type) {
        case 'string':
          body[key] = '';
          break;
        case 'number':
        case 'integer':
          body[key] = 0;
          break;
        case 'boolean':
          body[key] = false;
          break;
        case 'array':
          body[key] = [];
          break;
        case 'object':
          body[key] = {};
          break;
        default:
          body[key] = '';
      }
    }
  }
  setEditorContent(JSON.stringify(query, null, 2));
}

watch(
  editedQuery,
  (value) => {
    emit('queryChanged', { query: value, tabIdx: props.tabIdx });
  },
  { deep: true },
);
watch(
  () => editedQuery.value.controller,
  (value) => {
    const tmp = JSON.parse(jsonQuery.value);
    if (value !== tmp.controller) {
      tmp.controller = value;
      setEditorContent(JSON.stringify(tmp, null, 2));
    }
  },
);
watch(
  () => editedQuery.value.action,
  (value) => {
    const tmp = JSON.parse(jsonQuery.value);
    if (value !== tmp.action) {
      tmp.action = value;
      setEditorContent(JSON.stringify(tmp, null, 2));
      loadQueryParams();
    }
  },
);

onMounted(() => {
  editedQuery.value = JSON.parse(JSON.stringify(props.query));
  jsonQuery.value = JSON.stringify(editedQuery.value, null, 2);
});

function saveQuery(): void {
  emit('saveQuery', props.tabIdx);
}
function performQuery(): void {
  emit('performQuery', props.tabIdx);
}
function runFromKeyboard(): void {
  if (isQueryValid(jsonQuery.value)) {
    performQuery();
  }
}
function saveFromKeyboard(): void {
  if (isQueryValid(jsonQuery.value)) {
    saveQuery();
  }
}
function onEditorShortcut(name: string): void {
  if (name === 'run') {
    runFromKeyboard();
  } else if (name === 'save') {
    saveFromKeyboard();
  }
}

function queryBodyChange(value: string): void {
  jsonQuery.value = value;
  if (isQueryValid(value)) {
    editedQuery.value = JSON.parse(value);
  }
}
</script>
