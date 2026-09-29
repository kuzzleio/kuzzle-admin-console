<template>
  <!--
    Sous `md`, la liste passe au-dessus des onglets, comme l'arbre de Data ;
    les `!` remplacent le style en ligne de `reka-ui` (G-099).
  -->
  <ResizablePanelGroup class="ApiActionLayout max-md:flex-col!" direction="horizontal">
    <ResizablePanel
      class="DataLayout-sidebarWrapper max-h-[35vh] overflow-auto! max-md:flex-none! md:max-h-none"
      data-cy="DataLayout-sidebarWrapper"
      :default-size="sidebarWidth"
      size-unit="px"
    >
      <QueryList
        :saved-queries="savedQueries"
        :current-query-name="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      />
    </ResizablePanel>

    <ResizableHandle
      v-if="sideBySide"
      aria-label="Resize the saved queries list"
      data-cy="sidebarResizer"
      with-handle
    />

    <ResizablePanel class="DataLayout-contentWrapper min-h-0 overflow-auto!">
      <!-- Le padding dans un enfant, comme dans Data (G-099). -->
      <div class="box-border p-2 md:h-full md:p-4">
        <Card v-if="!loading" class="md:h-full">
          <Tabs v-model="currentTab" class="min-h-0 md:h-full" :unmount-on-hide="false">
            <!--
              `b-tabs` avait un slot `#tabs-end` pour le bouton « + ». La
              primitive n'en a pas : la barre et le bouton sont composés ici,
              là où l'on sait ce que ce bouton fait (ADR-0017).

              `overflow-x-auto` force `overflow-y: auto`, et le repère de l'onglet
              actif déborde d'1 px (`-mb-px`) : une barre de défilement verticale
              apparaissait. `pb-px` loge ce pixel dans la barre, `overflow-y-hidden`
              écarte toute autre cause (E-13 de la comparaison v4 / v5).
            -->
            <div ref="tabBar" class="flex items-center border-b border-border px-2">
              <TabsList class="min-w-0 flex-1 overflow-x-auto overflow-y-hidden border-b-0 pb-px">
                <TabsTrigger
                  v-for="(tabContent, tabIdx) of tabs"
                  :key="`query-${tabIdx}-${tabContent.name}`"
                  :data-cy="`api-actions-tab-${tabIdx}`"
                  aria-keyshortcuts="Delete"
                  :title="tabContent.name"
                  :value="String(tabIdx)"
                  @keydown.delete.prevent="closeTabFromKeyboard(tabIdx)"
                >
                  <span class="max-w-40 truncate">{{ formatTabName(tabContent) }}</span>
                  <!--
                    Un bouton de fermeture dans l'onglet serait un contrôle
                    imbriqué dans un autre (`nested-interactive`), et un bouton à
                    côté serait un enfant du `tablist` qui n'est pas un onglet.
                    La croix est donc réservée à la souris ; au clavier, Suppr
                    ferme l'onglet, comme le prévoit le motif ARIA du *tablist*,
                    et `aria-keyshortcuts` l'annonce.
                  -->
                  <span
                    aria-hidden="true"
                    class="-mr-1 inline-flex size-6 items-center justify-center rounded-sm opacity-60 hover:bg-muted hover:opacity-100"
                    :data-cy="`api-actions-tab-close-${tabIdx}`"
                    @click.stop="closeTab(tabIdx)"
                  >
                    <i class="fas fa-times" />
                  </span>
                </TabsTrigger>
              </TabsList>

              <Button
                aria-label="Add a tab"
                class="shrink-0"
                data-cy="api-actions-tab-plus"
                size="icon"
                variant="ghost"
                @click="addNewTab"
              >
                <b>+</b>
              </Button>
            </div>

            <!--
              `:unmount-on-hide="false"` sur `Tabs` : chaque onglet porte un
              éditeur Ace dont la saisie n'est remontée au parent que lorsqu'elle
              est un JSON valide. Un panneau démonté perdrait la saisie en cours
              — ce que `b-tabs`, qui gardait tout monté, ne faisait pas
              (ADR-0021).
            -->
            <TabsContent
              v-for="(tabContent, tabIdx) of tabs"
              :key="`query-content-${tabIdx}-${tabContent.name}`"
              class="min-h-0 p-3"
              :value="String(tabIdx)"
            >
              <QueryCard
                :api="api"
                :openapi="openapi"
                :query="tabContent.query"
                :response="tabContent.response"
                :tab-idx="tabIdx"
                @saveQuery="saveQuery"
                @queryChanged="onQueryChanged"
                @performQuery="performQuery"
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ResizablePanel>

    <SaveQueryModal
      v-model:open="saveQueryOpen"
      :is-query-name-valid="isQueryNameValid"
      @storeNewQuery="storeNewQuery"
    />
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import type { Kuzzle } from 'kuzzle-sdk-v7';
import _ from 'lodash';

import type {
  ApiQuery,
  ApiTab,
  OpenApiPaths,
  PublicApi,
  QueryResponse,
} from '@/components/ApiAction/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSideBySide } from '@/composables/useSideBySide';
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { cssPixels, truncateName } from '@/utils';

import QueryCard from '@/components/ApiAction/QueryCard.vue';
import QueryList from '@/components/ApiAction/QueryList.vue';
import SaveQueryModal from '@/components/ApiAction/SaveQueryModal.vue';

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const toast = useToast();
const sideBySide = useSideBySide();

const tabBar = useTemplateRef<HTMLDivElement>('tabBar');

const saveQueryOpen = ref(false);
const tabs = ref<ApiTab[]>([]);
const currentTabIdx = ref(0);
/* Largeur initiale de la liste des requêtes sauvegardées, en pixels. */
const sidebarWidth = cssPixels('--sidebar-width');
const api = ref<PublicApi | null>(null);
const openapi = ref<OpenApiPaths | null>(null);
const loading = ref(true);
const savedQueries = ref<ApiTab[]>([]);
const newSaveTabIdx = ref<number | null>(null);

const API_LIST_UNAVAILABLE = [
  'Unable to fetch the API action list.',
  'This view remains functional but you will not be able to select controllers and actions in the selectors.',
] as const;

/*
 * `Tabs` désigne un onglet par une valeur, pas par un rang (ADR-0017).
 * Le reste du composant raisonne en index : la conversion vit ici, à un
 * seul endroit.
 */
const currentTab = computed({
  get: () => String(currentTabIdx.value),
  set: (value: string) => {
    currentTabIdx.value = Number(value);
  },
});

const currentQueryName = computed(() => tabs.value[currentTabIdx.value]?.name ?? null);

/* Le SDK de la connexion courante. Appelé dans un `try` : son absence y est
   une erreur comme une autre. */
function sdk(): Kuzzle {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

function emptyTab(): ApiTab {
  return {
    query: {
      controller: null,
      action: null,
      body: {},
    },
    saved: false,
    name: '',
    response: '',
    savedIdx: null,
  };
}

function formatTabName(tabContent: ApiTab): string {
  let name = tabContent.name ? tabContent.name : 'New API action';
  name = truncateName(name, 11);
  name += tabContent.saved ? '' : ' *';
  return name;
}

function onQueryChanged({ query, tabIdx }: { query: ApiQuery; tabIdx: number }): void {
  const savedIdx = tabs.value[tabIdx].savedIdx;
  if (savedIdx !== null && savedIdx !== undefined) {
    tabs.value[tabIdx].saved = _.isEqual(savedQueries.value[savedIdx].query, query);
  }
  tabs.value[tabIdx].query = JSON.parse(JSON.stringify(query));
}

function closeTab(tabIdx: number): void {
  if (currentTabIdx.value === tabIdx) {
    if (currentTabIdx.value > 0) {
      currentTabIdx.value = tabIdx - 1;
    } else {
      currentTabIdx.value = 0;
    }
  } else if (currentTabIdx.value > tabIdx) {
    currentTabIdx.value = currentTabIdx.value - 1;
  }
  tabs.value.splice(tabIdx, 1);
}

/* L'onglet fermé avait le focus : il passe à celui qui prend sa place,
   ou au bouton « + » s'il n'en reste aucun. */
async function closeTabFromKeyboard(tabIdx: number): Promise<void> {
  closeTab(tabIdx);
  await nextTick();
  const target = tabs.value.length
    ? `[data-cy="api-actions-tab-${currentTabIdx.value}"]`
    : '[data-cy="api-actions-tab-plus"]';
  tabBar.value?.querySelector<HTMLElement>(target)?.focus();
}

function storeQueriesToLocalStorage(): void {
  const envName = kuzzleStore.currentEnvironment?.name;
  if (envName === undefined) {
    return;
  }
  const storedQueries: Record<string, unknown> =
    JSON.parse(localStorage.getItem('storedQueries') ?? 'null') ?? {};
  const queriesToStore: Array<Record<string, unknown>> = JSON.parse(
    JSON.stringify(savedQueries.value),
  );
  storedQueries[envName] = queriesToStore.map((q) => {
    delete q.response;
    delete q.saved;
    delete q.savedIdx;
    return q;
  });
  localStorage.setItem('storedQueries', JSON.stringify(storedQueries));
}

function loadStoredQueriesFromLocalStorage(): void {
  const storedQueries = localStorage.getItem('storedQueries');
  if (!storedQueries) {
    return;
  }
  const jsonStoreQueries = JSON.parse(storedQueries);
  const envName = kuzzleStore.currentEnvironment?.name;
  if (envName === undefined || !jsonStoreQueries[envName]) {
    return;
  }
  savedQueries.value = jsonStoreQueries[envName].map((q: ApiTab, idx: number) => {
    q.response = '';
    q.saved = true;
    q.savedIdx = idx;
    return q;
  });
}

function deleteSavedQuery(savedQueryIdx: number): void {
  const tabIdx = tabs.value.findIndex((t) => t.savedIdx === savedQueryIdx);
  if (tabIdx !== -1) {
    tabs.value[tabIdx].name = '';
    tabs.value[tabIdx].savedIdx = null;
    tabs.value[tabIdx].saved = false;
  }
  savedQueries.value.splice(savedQueryIdx, 1);
  /* Les rangs suivants reculent d'un cran : un onglet ne doit pas désigner
     une requête qui n'existe plus (G-110). */
  for (const tab of tabs.value) {
    if (tab.savedIdx !== null && tab.savedIdx > savedQueryIdx) {
      tab.savedIdx -= 1;
    }
  }
  savedQueries.value.forEach((query, idx) => {
    query.savedIdx = idx;
  });
  storeQueriesToLocalStorage();
}

function loadSavedQuery(savedQueryIdx: number): void {
  if (!savedQueries.value[savedQueryIdx]) return;
  const query: ApiTab = JSON.parse(JSON.stringify(savedQueries.value[savedQueryIdx]));
  const tabIdx = tabs.value.findIndex((t) => t.name === query.name);
  if (tabIdx !== -1) {
    currentTabIdx.value = tabIdx;
    return;
  }
  tabs.value.push(query);
  currentTabIdx.value = tabs.value.length - 1;
}

function isQueryNameValid(name: string): boolean {
  if (name === '' || name === 'New Query') {
    return false;
  }
  return !savedQueries.value.some((q) => q.name === name);
}

function storeNewQuery(name: string): void {
  const tabIdx = newSaveTabIdx.value;
  if (tabIdx === null) {
    return;
  }
  tabs.value[tabIdx].name = name;
  tabs.value[tabIdx].saved = true;
  tabs.value[tabIdx].savedIdx = savedQueries.value.length;
  const tab: ApiTab = JSON.parse(JSON.stringify(tabs.value[tabIdx]));
  savedQueries.value.push(tab);
  newSaveTabIdx.value = null;
  storeQueriesToLocalStorage();
}

function saveQuery(tabIdx: number): void {
  const tab = tabs.value[tabIdx];
  const storedQueryIdx = savedQueries.value.findIndex((q) => q.name === tab.name);
  if (storedQueryIdx !== -1) {
    savedQueries.value[storedQueryIdx].query = JSON.parse(JSON.stringify(tab.query));
    tabs.value[tabIdx].saved = true;
    storeQueriesToLocalStorage();
  } else {
    newSaveTabIdx.value = tabIdx;
    saveQueryOpen.value = true;
  }
}

async function performQuery(tabIdx: number): Promise<void> {
  const query = JSON.parse(JSON.stringify(tabs.value[tabIdx].query));
  let response: QueryResponse;

  try {
    response = await sdk().query(query);
  } catch (error) {
    const { field } = caught(error);
    response = {
      ...(typeof error === 'object' && error !== null ? error : {}),
      message: field('message'),
      stack: field('stack'),
      kuzzleStack: field('kuzzleStack'),
    };
  }
  tabs.value[tabIdx].response = response;
}

function addNewTab(): void {
  tabs.value.push(emptyTab());
  currentTabIdx.value = tabs.value.length - 1;
}

/* `server:openapi` rend le document OpenAPI tel quel, sans `result`, quoi
   qu'en dise le type du SDK. */
function openApiPaths(response: object): OpenApiPaths {
  const paths = Reflect.get(response, 'paths');
  return typeof paths === 'object' && paths !== null ? paths : {};
}

async function getKuzzleOpenApi(): Promise<void> {
  try {
    const openApiKuzzle = await sdk().query({
      controller: 'server',
      action: 'openapi',
      scope: 'kuzzle',
    });
    const openApiApp = await sdk().query({
      controller: 'server',
      action: 'openapi',
      scope: 'app',
    });
    openapi.value = { ...openApiPaths(openApiApp), ...openApiPaths(openApiKuzzle) };
  } catch (error) {
    logger.error(error);
    toast.warning(...API_LIST_UNAVAILABLE);
  }
}

async function getKuzzlePublicApi(): Promise<void> {
  try {
    const publicApi = await sdk().query<{ controller: string; action: string }, PublicApi>({
      controller: 'server',
      action: 'publicApi',
    });
    api.value = publicApi.result;
  } catch (error) {
    logger.error(error);
    toast.warning(...API_LIST_UNAVAILABLE);
  }
}

onMounted(async () => {
  loading.value = true;
  if (authStore.canGetPublicApi) {
    await getKuzzlePublicApi();
  } else {
    toast.warning(...API_LIST_UNAVAILABLE);
  }
  if ((kuzzleStore.currentEnvironment?.backendMajorVersion ?? 0) > 1 && authStore.canGetOpenApi) {
    await getKuzzleOpenApi();
  } else {
    toast.warning(...API_LIST_UNAVAILABLE);
  }
  loadStoredQueriesFromLocalStorage();
  addNewTab();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
/* Les règles de `vue-multipane` (`.Custom-resizer-vertical`, les variantes
 * `-vertical` du layout) et de `b-tabs` (`.tab-pane`, `.tabs`, `.tabsHeight`,
 * `.card-title`, `.titleItem`) sont parties avec leurs bibliothèques
 * (ADR-0017, ADR-0021) : plus aucun élément ne portait ces classes. */
.backgroundCard {
  background-color: var(--muted);
}
</style>
