<template>
  <ResizablePanelGroup class="ApiActionLayout" @resize="saveNewPaneSize">
    <ResizablePanel
      class="DataLayout-sidebarWrapper h-full overflow-auto"
      :style="paneSize ? { width: paneSize } : { width: 'var(--sidebar-width)' }"
      data-cy="DataLayout-sidebarWrapper"
    >
      <QueryList
        :saved-queries="savedQueries"
        :current-query-name="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      />
    </ResizablePanel>

    <ResizableHandle data-cy="sidebarResizer" label="Resize the saved queries list" />

    <ResizablePanel class="DataLayout-contentWrapper h-full flex-1 overflow-auto p-4">
      <Card v-if="!loading" class="h-full">
        <Tabs v-model="currentTab" class="h-full min-h-0">
          <!--
            `b-tabs` avait un slot `#tabs-end` pour le bouton « + ». La
            primitive n'en a pas : la barre et le bouton sont composés ici,
            là où l'on sait ce que ce bouton fait (ADR-0017).
          -->
          <div class="flex items-center border-b border-border px-2">
            <TabsList class="min-w-0 flex-1 overflow-x-auto border-b-0">
              <TabsTrigger
                v-for="(tabContent, tabIdx) of tabs"
                :key="`query-${tabIdx}-${tabContent.name}`"
                :data-cy="`api-actions-tab-${tabIdx}`"
                :title="tabContent.name"
                :value="String(tabIdx)"
              >
                <span class="max-w-40 truncate">{{ formatTabName(tabContent) }}</span>
                <!--
                  Fermer un onglet était une icône dans le titre : un `<i>`
                  cliquable posé dans un lien. C'est un bouton à côté.
                -->
                <span
                  :aria-label="`Close the tab ${tabContent.name}`"
                  class="cursor-pointer opacity-60 hover:opacity-100"
                  role="button"
                  tabindex="0"
                  @click.stop="closeTab(tabIdx)"
                  @keydown.enter.stop.prevent="closeTab(tabIdx)"
                >
                  <i class="fas fa-times" aria-hidden="true" />
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
            `force-mount` : chaque onglet porte un éditeur Ace dont la saisie
            n'est remontée au parent que lorsqu'elle est un JSON valide. Un
            panneau démonté perdrait la saisie en cours — ce que `b-tabs`, qui
            gardait tout monté, ne faisait pas (ADR-0021).
          -->
          <TabsContent
            v-for="(tabContent, tabIdx) of tabs"
            :key="`query-content-${tabIdx}-${tabContent.name}`"
            class="min-h-0 p-3"
            force-mount
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
    </ResizablePanel>

    <SaveQueryModal
      v-model:open="saveQueryOpen"
      :is-query-name-valid="isQueryNameValid"
      @storeNewQuery="storeNewQuery"
    />
  </ResizablePanelGroup>
</template>

<script>
import _ from 'lodash';
import { mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { truncateName } from '@/utils';

import QueryCard from '@/components/ApiAction/QueryCard.vue';
import QueryList from '@/components/ApiAction/QueryList.vue';
import SaveQueryModal from '@/components/ApiAction/SaveQueryModal.vue';

export default {
  components: {
    Button,
    Card,
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    QueryCard,
    SaveQueryModal,
    QueryList,
  },
  data() {
    return {
      saveQueryOpen: false,
      tabs: [],
      currentTabIdx: 0,
      /* Largeur de la liste des requêtes sauvegardées, en pixels. */
      paneSize: '',
      showAlert: true,
      api: null,
      openapi: null,
      loading: true,
      savedQueries: [],
      newSaveTabIdx: null,
    };
  },
  computed: {
    /*
     * `Tabs` désigne un onglet par une valeur, pas par un rang (ADR-0017).
     * Le reste du composant raisonne en index : la conversion vit ici, à un
     * seul endroit.
     */
    currentTab: {
      get() {
        return String(this.currentTabIdx);
      },
      set(value) {
        this.setCurrentTab(Number(value));
      },
    },
    ...mapState(useKuzzleStore, ['$kuzzle', 'currentEnvironment']),
    ...mapState(useAuthStore, ['canGetPublicApi', 'canGetOpenApi']),
    emptyTab() {
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
    },
    currentQueryBody() {
      if (!this.tabs[this.currentTabIdx]) {
        return null;
      }
      return this.tabs[this.currentTabIdx].body;
    },
    currentQueryName() {
      if (!this.tabs[this.currentTabIdx]) {
        return null;
      }
      return this.tabs[this.currentTabIdx].name;
    },
  },
  async mounted() {
    this.loading = true;
    if (this.canGetPublicApi) {
      await this.getKuzzlePublicApi();
    } else {
      this.$toast.warning(
        'Unable to fetch the API action list.',
        'This view remains functional but you will not be able to select controllers and actions in the selectors.',
      );
    }
    if (this.currentEnvironment.backendMajorVersion > 1 && this.canGetOpenApi) {
      await this.getKuzzleOpenApi();
    } else {
      this.$toast.warning(
        'Unable to fetch the API action list.',
        'This view remains functional but you will not be able to select controllers and actions in the selectors.',
      );
    }
    this.loadStoredQueriesFromLocalStorage();
    this.addNewTab();
    this.loading = false;
  },
  methods: {
    closeAlert() {
      this.showAlert = false;
    },
    formatTabName(tabContent) {
      let name = tabContent.name ? tabContent.name : 'New API action';
      name = truncateName(name, 11);
      name += tabContent.saved ? '' : ' *';
      return name;
    },
    onQueryChanged({ query, tabIdx }) {
      const savedIdx = this.tabs[tabIdx].savedIdx;
      if (savedIdx !== null && savedIdx !== undefined) {
        this.tabs[tabIdx].saved = _.isEqual(this.savedQueries[savedIdx].query, query);
      }
      this.tabs[tabIdx].query = JSON.parse(JSON.stringify(query));
    },
    saveNewPaneSize(width) {
      this.paneSize = `${width}px`;
    },
    setCurrentTab(tabIdx) {
      this.currentTabIdx = tabIdx;
    },
    closeTab(tabIdx) {
      if (this.currentTabIdx === tabIdx) {
        if (this.currentTabIdx > 0) {
          this.currentTabIdx = tabIdx - 1;
        } else {
          this.currentTabIdx = 0;
        }
      } else if (this.currentTabIdx > tabIdx) {
        this.currentTabIdx = this.currentTabIdx - 1;
      }
      this.tabs.splice(tabIdx, 1);
    },
    deleteSavedQuery(savedQueryIdx) {
      const tabIdx = this.tabs.findIndex((t) => t.savedIdx === savedQueryIdx);
      if (tabIdx !== -1) {
        this.tabs[tabIdx].name = '';
        this.tabs[tabIdx].savedIdx = null;
        this.tabs[tabIdx].saved = false;
      }
      this.savedQueries.splice(savedQueryIdx, 1);
      this.storeQueriesToLocalStorage();
    },
    loadSavedQuery(savedQueryIdx) {
      if (!this.savedQueries[savedQueryIdx]) return;
      const query = JSON.parse(JSON.stringify(this.savedQueries[savedQueryIdx]));
      const tabIdx = this.tabs.findIndex((t) => t.name === query.name);
      if (tabIdx !== -1) {
        this.currentTabIdx = tabIdx;
        return;
      }
      this.tabs.push(query);
      this.currentTabIdx = this.tabs.length - 1;
    },
    isQueryNameValid(name) {
      if (name === '' || name === 'New Query') {
        return false;
      }
      const nameSearch = this.savedQueries.find((q, index) => {
        if (this.currentQueryIndexName === index) {
          return false;
        }
        return q.name === name;
      });
      const nameAlreadyUsed = nameSearch !== undefined;
      return !nameAlreadyUsed;
    },
    storeNewQuery(name) {
      this.tabs[this.newSaveTabIdx].name = name;
      this.tabs[this.newSaveTabIdx].saved = true;
      this.tabs[this.newSaveTabIdx].savedIdx = this.savedQueries.length;
      const tab = JSON.parse(JSON.stringify(this.tabs[this.newSaveTabIdx]));
      this.savedQueries.push(tab);
      this.newSaveTabIdx = null;
      this.storeQueriesToLocalStorage();
    },
    saveQuery(tabIdx) {
      const tab = this.tabs[tabIdx];
      const storedQueryIdx = this.savedQueries.findIndex((q) => q.name === tab.name);
      if (storedQueryIdx !== -1) {
        this.savedQueries[storedQueryIdx].query = JSON.parse(JSON.stringify(tab.query));
        this.tabs[tabIdx].saved = true;
        this.storeQueriesToLocalStorage();
      } else {
        this.newSaveTabIdx = tabIdx;
        this.saveQueryOpen = true;
      }
    },
    loadStoredQueriesFromLocalStorage() {
      const storedQueries = localStorage.getItem('storedQueries');
      if (!storedQueries) {
        return;
      }
      const jsonStoreQueries = JSON.parse(storedQueries);
      if (!jsonStoreQueries[this.currentEnvironment.name]) {
        return;
      }
      this.savedQueries = jsonStoreQueries[this.currentEnvironment.name].map((q, idx) => {
        q.response = '';
        q.saved = true;
        q.savedIdx = idx;
        return q;
      });
    },
    storeQueriesToLocalStorage() {
      let storedQueries = JSON.parse(localStorage.getItem('storedQueries'));
      if (!storedQueries) {
        storedQueries = {};
      }
      const queriesToStore = JSON.parse(JSON.stringify(this.savedQueries));
      storedQueries[this.currentEnvironment.name] = queriesToStore.map((q) => {
        delete q.response;
        delete q.saved;
        delete q.savedIdx;
        return q;
      });
      localStorage.setItem('storedQueries', JSON.stringify(storedQueries));
    },
    async performQuery(tabIdx) {
      const query = JSON.parse(JSON.stringify(this.tabs[tabIdx].query));
      let response;

      try {
        response = await this.$kuzzle.query(query);
      } catch (error) {
        response = {
          ...error,
          message: error.message,
          stack: error.stack,
          kuzzleStack: error.kuzzleStack,
        };
      }
      this.tabs[tabIdx].response = response;
    },
    addNewTab() {
      const newTab = JSON.parse(JSON.stringify(this.emptyTab));
      this.tabs.push(newTab);
      this.currentTabIdx = this.tabs.length - 1;
    },
    async getKuzzleOpenApi() {
      try {
        const openApiKuzzle = await this.$kuzzle.query({
          controller: 'server',
          action: 'openapi',
          scope: 'kuzzle',
        });
        const openApiApp = await this.$kuzzle.query({
          controller: 'server',
          action: 'openapi',
          scope: 'app',
        });
        this.openapi = { ...openApiApp.paths, ...openApiKuzzle.paths };
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Unable to fetch the API action list.',
          'This view remains functional but you will not be able to select controllers and actions in the selectors.',
        );
      }
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.$kuzzle.query({
          controller: 'server',
          action: 'publicApi',
        });
        this.api = publicApi.result;
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Unable to fetch the API action list.',
          'This view remains functional but you will not be able to select controllers and actions in the selectors.',
        );
      }
    },
  },
};
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
