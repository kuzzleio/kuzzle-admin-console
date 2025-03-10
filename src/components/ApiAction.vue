<template>
  <Multipane class="DataLayout-vertical Custom-resizer-vertical" layout="vertical">
    <div class="DataLayout-sidebarWrapper-vertical" data-cy="DataLayout-sidebarWrapper">
      <QueryList
        :saved-queries="savedQueries"
        :current-query-name="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper-vertical">
      <b-container fluid class="h-100">
        <b-row align-v="stretch" class="h-100">
          <b-col v-if="loading" cols="12" />
          <b-col v-else cols="12">
            <b-card no-body class="px-0 h-100">
              <b-tabs card content-class="px-0 mt-3 tabsHeight">
                <b-tab
                  v-for="(tabContent, tabIdx) of tabs"
                  :key="`query-${tabIdx}-${tabContent.name}`"
                  :active="currentTabIdx === tabIdx"
                  class="px-2 py-0"
                  title-link-class="px-3 py-0 titleItem"
                  @click.prevent=""
                >
                  <template #title>
                    <b-row
                      v-b-tooltip.hover
                      align-v="center"
                      class="tabTitle"
                      :data-cy="`api-actions-tab-${tabIdx}`"
                      :title="tabContent.name"
                    >
                      <b-col cols="9" class="text-left py-3 pointer" @click="setCurrentTab(tabIdx)">
                        <span>
                          {{ formatTabName(tabContent) }}
                        </span>
                      </b-col>
                      <b-col cols="3" class="py-3">
                        <i class="fas fa-times pointer" @click="closeTab(tabIdx)" />
                      </b-col>
                    </b-row>
                  </template>
                  <QueryCard
                    class="px-0"
                    :query="tabContent.query"
                    :tab-idx="tabIdx"
                    :api="api"
                    :openapi="openapi"
                    :response="tabContent.response"
                    @saveQuery="saveQuery"
                    @queryChanged="onQueryChanged"
                    @performQuery="performQuery"
                  />
                </b-tab>
                <template #tabs-end>
                  <b-row align-v="center" class="px-3" @click.prevent="addNewTab">
                    <b-col cols="12" class="text-center my-3 pointer">
                      <b data-cy="api-actions-tab-plus">+</b>
                    </b-col>
                  </b-row>
                </template>
              </b-tabs>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <SaveQueryModal :is-query-name-valid="isQueryNameValid" @storeNewQuery="storeNewQuery" />
  </Multipane>
</template>

<script>
import _ from 'lodash';
import { mapState } from 'pinia';
import { Multipane, MultipaneResizer } from 'vue-multipane';

import { useAuthStore, useKuzzleStore } from '@/stores';
import { truncateName } from '@/utils';

import QueryCard from '@/components/ApiAction/QueryCard.vue';
import QueryList from '@/components/ApiAction/QueryList.vue';
import SaveQueryModal from '@/components/ApiAction/SaveQueryModal.vue';

export default {
  components: {
    Multipane,
    MultipaneResizer,
    QueryCard,
    SaveQueryModal,
    QueryList,
  },
  data() {
    return {
      tabs: [],
      currentTabIdx: 0,
      showAlert: true,
      api: null,
      openapi: null,
      loading: true,
      savedQueries: [],
      newSaveTabIdx: null,
    };
  },
  computed: {
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
      this.$bvToast.toast(
        'This view remains functional but you will not be able to select controllers and actions in the selectors.',
        {
          title: 'Unable to fetch the API action list.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        },
      );
    }
    if (this.currentEnvironment.backendMajorVersion > 1 && this.canGetOpenApi) {
      await this.getKuzzleOpenApi();
    } else {
      this.$bvToast.toast(
        'This view remains functional but you will not be able to select controllers and actions in the selectors.',
        {
          title: 'Unable to fetch the API action list.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        },
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
        this.$bvModal.show('modal-save-query');
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
      let response = {};

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
        this.$bvToast.toast(
          'This view remains functional but you will not be able to select controllers and actions in the selectors.',
          {
            title: 'Unable to fetch the API action list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true,
          },
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
        this.$bvToast.toast(
          'This view remains functional but you will not be able to select controllers and actions in the selectors.',
          {
            title: 'Unable to fetch the API action list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true,
          },
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss';

::v-deep .tabsHeight {
  height: calc(100% - 100px) !important;
}

::v-deep .card-title {
  margin-bottom: 0px;
}
::v-deep .titleItem {
  min-width: 200px;
  border: 1px solid #d5d5d5 !important;
}
::v-deep .tab-pane {
  height: 100%;
}
::v-deep .tabs {
  height: 100%;
}
.backgroundCard {
  background-color: variables.$light-grey-color;
}

.DataLayout-vertical {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.DataLayout-sidebarWrapper-vertical {
  min-width: variables.$sidebar-width;
  width: variables.$sidebar-width;
  height: 100%;
  z-index: 1;
}

.DataLayout-contentWrapper-vertical {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: variables.$content-gutter;
}

.Custom-resizer-vertical > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  padding: 3px;
  border: 1px solid #ccc;
  box-shadow: 2px 0px 5px -2px rgba(112, 112, 112, 1);
  &:before {
    display: block;
    content: '';
    width: 1px;
    height: 50px;
    position: absolute;
    top: 45%;
    left: 50%;
    border-left: 1px solid #aaa;
  }
  &:hover {
    &:before {
      border-color: #777;
      background-color: #f5f5f5;
    }
  }
}
</style>
