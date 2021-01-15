<template>
  <Multipane
    class="DataLayout-vertical Custom-resizer-vertical"
    layout="vertical"
  >
    <div
      class="DataLayout-sidebarWrapper-vertical"
      data-cy="DataLayout-sidebarWrapper"
    >
      <QueryList
        :savedQueries="savedQueries"
        :currentQueryName="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper-vertical">
      <b-container fluid>
        <b-row align-v="stretch">
          <b-col cols="12">
            <InfoAlert />
          </b-col>
          <b-col cols="12" v-if="loading"> </b-col>
          <b-col cols="12" v-else>
            <b-card no-body>
              <b-tabs card content-class="mt-3">
                <b-tab
                  v-for="(tabContent, tabIdx) of tabs"
                  :key="`query-${tabIdx}-${tabContent.name}`"
                  :active="currentTabIdx === tabIdx"
                  @click.prevent=""
                  title-link-class="px-3 py-0 h-100 titleItem"
                >
                  <template #title>
                    <b-row
                      align-v="center"
                      class="tabTitle"
                      v-b-tooltip.hover
                      :title="tabContent.name"
                    >
                      <b-col
                        cols="9"
                        class=" text-left py-3 pointer"
                        @click="setCurrentTab(tabIdx)"
                      >
                        <span>
                          {{ formatTabName(tabContent) }}
                        </span>
                      </b-col>
                      <b-col cols="3" class="py-3">
                        <i
                          class="fas fa-times pointer"
                          @click="closeTab(tabIdx)"
                        />
                      </b-col>
                    </b-row>
                  </template>
                  <QueryCard
                    :query="tabContent.query"
                    :tabIdx="tabIdx"
                    :controllers="controllers"
                    :actions="actions"
                    :indexes="indexes"
                    :collections="collections"
                    :api="api"
                    :openapi="openapi"
                    @saveQuery="saveQuery"
                    @queryChanged="queryChanged"
                    @performQuery="performQuery"
                  />
                  <ResponseCard :response="tabContent.response" />
                </b-tab>
                <template #tabs-end>
                  <b-row align-v="center" class="px-3" @click.prevent="newTab">
                    <b-col cols="12" class="text-center my-3 pointer">
                      <b>+</b>
                    </b-col>
                  </b-row>
                </template>
              </b-tabs>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <SaveQueryModal
      :isQueryNameValid="isQueryNameValid"
      @storeNewQuery="storeNewQuery"
    />
  </Multipane>
</template>

<script>
import InfoAlert from '@/components/ApiAction/InfoAlert'
import ResponseCard from '@/components/ApiAction/ResponseCard'
import SaveQueryModal from '@/components/ApiAction/SaveQueryModal'
import QueryList from '@/components/ApiAction/QueryList'
import QueryCard from '@/components/ApiAction/QueryCard'

import { Multipane, MultipaneResizer } from 'vue-multipane'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { truncateName } from '@/utils'

export default {
  components: {
    Multipane,
    MultipaneResizer,
    ResponseCard,
    InfoAlert,
    QueryCard,
    SaveQueryModal,
    QueryList
  },
  data() {
    return {
      tabs: [],
      currentTabIdx: 0,
      api: null,
      openapi: null,
      loading: true,
      savedQueries: [],
      newSaveTabIdx: null
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
    storage() {
      return this.$store.direct.getters.index.indexes
    },
    indexes() {
      return this.storage.map(i => i.name)
    },
    collections() {
      if (!this.currentQueryIndexName) {
        return []
      }
      const index = this.storage.find(
        i => i.name === this.currentQueryIndexName
      )
      return index && index.collections
        ? index.collections.map(c => c.name)
        : []
    },
    controllers() {
      return this.api ? Object.keys(this.api) : []
    },
    actions() {
      if (!this.tabs[this.currentTabIdx]) {
        return []
      }
      const currentController = this.tabs[this.currentTabIdx].query.controller
      return currentController && this.api[currentController]
        ? Object.keys(this.api[currentController])
        : []
    },

    emptyTab() {
      return {
        query: {
          controller: null,
          action: null,
          body: {}
        },
        saved: false,
        name: '',
        response: '',
        savedIdx: null
      }
    },
    currentQueryBody() {
      if (!this.tabs[this.currentTabIdx]) {
        return null
      }
      return this.tabs[this.currentTabIdx].body
    },
    currentQueryName() {
      if (!this.tabs[this.currentTabIdx]) {
        return null
      }
      return this.tabs[this.currentTabIdx].name
    }
  },
  methods: {
    formatTabName(tabContent) {
      let name = tabContent.name ? tabContent.name : 'New query'
      name = truncateName(name, 11)
      name += tabContent.saved ? '' : ' *'
      return name
    },
    queryChanged({ query, tabIdx }) {
      if (this.tabs[tabIdx].query.index !== query.index) {
        this.lazyFetchCollections(query.index)
      }
      const savedIdx = this.tabs[tabIdx].savedIdx
      if (savedIdx !== null) {
        this.tabs[tabIdx].saved = _.isEqual(
          this.savedQueries[savedIdx].query,
          query
        )
      }
      this.tabs[tabIdx].query = _.clone(query)
    },
    setCurrentTab(tabIdx) {
      this.currentTabIdx = tabIdx
    },
    closeTab(tabIdx) {
      if (this.currentTabIdx === tabIdx) {
        if (this.currentTabIdx > 0) {
          this.currentTabIdx = tabIdx - 1
        } else {
          this.currentTabIdx = 0
        }
      } else if (this.currentTabIdx > tabIdx) {
        this.currentTabIdx = this.currentTabIdx - 1
      }
      this.tabs.splice(tabIdx, 1)
    },
    async fetchIndexList() {
      try {
        await this.$store.direct.dispatch.index.fetchIndexList()
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while fetching the indexes list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    deleteSavedQuery(savedQueryIdx) {
      const tabIdx = this.tabs.findIndex(t => t.savedIdx === savedQueryIdx)
      if (tabIdx !== -1) {
        this.tabs[tabIdx].name = ''
        this.tabs[tabIdx].savedIdx = null
        this.tabs[tabIdx].saved = false
      }
      this.savedQueries.splice(savedQueryIdx, 1)
      this.storeQueriesToLocalStorage()
    },
    loadSavedQuery(savedQueryIdx) {
      if (!this.savedQueries[savedQueryIdx]) return
      const query = _.clone(this.savedQueries[savedQueryIdx])

      const tabIdx = this.tabs.findIndex(t => t.name === query.name)
      if (tabIdx !== -1) {
        this.currentTabIdx = tabIdx
        return
      }
      this.tabs.push(query)
      this.$nextTick(() => {
        const tabIdx = this.tabs.findIndex(t => t.name === query.name)
        this.$refs[`queryEditorWrapper-${tabIdx}`][0].setContent(query.body)
      })
      this.currentTabIdx = this.tabs.length - 1
    },
    isQueryNameValid(name) {
      if (name === '' || name === 'New Query') {
        return false
      }
      const nameSearch = this.savedQueries.find((q, index) => {
        if (this.currentQueryIndexName === index) {
          return false
        }
        return q.name === name
      })
      const nameAlreadyUsed = nameSearch !== undefined
      if (nameAlreadyUsed) {
        this.$bvToast.toast('Query name already used.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      return !nameAlreadyUsed
    },
    storeNewQuery(name) {
      this.tabs[this.newSaveTabIdx].name = name
      this.tabs[this.newSaveTabIdx].saved = true
      const tab = _.clone(this.tabs[this.newSaveTabIdx])
      this.savedQueries.push(tab)
      this.tabs[this.newSaveTabIdx].savedIdx = this.savedQueries.length - 1
      this.newSaveTabIdx = null
      this.storeQueriesToLocalStorage()
      this.$bvToast.toast('Query successfully saved.', {
        title: 'Info',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        appendToast: true
      })
    },
    saveQuery(tabIdx) {
      const tab = this.tabs[tabIdx]
      const storedQueryIdx = this.savedQueries.findIndex(
        q => q.name === tab.name
      )
      if (storedQueryIdx !== -1) {
        this.savedQueries[storedQueryIdx].query = _.clone(tab.query)
        this.tabs[tabIdx].saved = true
        this.storeQueriesToLocalStorage()
        this.$bvToast.toast('Query successfully saved.', {
          title: 'Info',
          variant: 'info',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      } else {
        this.newSaveTabIdx = tabIdx
        this.$bvModal.show('modal-save-query')
      }
    },
    loadStoredQueriesFromLocalStorage() {
      const storedQueries = localStorage.getItem('storedQueries')
      if (!storedQueries) {
        return
      }
      this.savedQueries = JSON.parse(storedQueries)[
        this.currentEnvironment.name
      ].map((q, idx) => {
        q.response = ''
        q.saved = true
        q.savedIdx = idx
        return q
      })
    },
    storeQueriesToLocalStorage() {
      let storedQueries = JSON.parse(localStorage.getItem('storedQueries'))
      if (!storedQueries) {
        storedQueries = {}
      }
      const queriesToStore = _.clone(this.savedQueries)
      storedQueries[this.currentEnvironment.name] = queriesToStore.map(q => {
        delete q.response
        delete q.saved
        delete q.savedIdx
        return q
      })
      localStorage.setItem('storedQueries', JSON.stringify(storedQueries))
    },
    async performQuery(tabIdx) {
      const query = _.clone(this.tabs[tabIdx].query)
      let response = {}

      try {
        response = await this.wrapper.query(query)
        this.$bvToast.toast('Query successfully played.', {
          title: 'Success',
          variant: 'success',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
        await this.fetchApi()
      } catch (error) {
        response = {
          ...error,
          message: error.message,
          stack: error.stack,
          kuzzleStack: error.kuzzleStack
        }
        this.$bvToast.toast('An error occured while playing query.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      this.tabs[tabIdx].response = response
    },
    newTab() {
      let newTab = _.clone(this.emptyTab)
      this.tabs.push(newTab)
      this.currentTabIdx = this.tabs.length - 1
    },
    async getKuzzleOpenApi() {
      try {
        const openApi = await this.wrapper.query({
          controller: 'server',
          action: 'openapi'
        })
        this.openapi = openApi.paths
      } catch (error) {
        this.$log.error(error)
      }
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.wrapper.query({
          controller: 'server',
          action: 'publicApi'
        })
        this.api = publicApi.result
      } catch (error) {
        this.$log.error(error)
      }
    },
    async lazyFetchCollections(indexName) {
      if (!indexName) {
        return
      }
      if (this.storage.find(i => i.name === indexName && !i.collections)) {
        const index = this.$store.direct.getters.index.getOneIndex(indexName)
        await this.$store.direct.dispatch.index.fetchCollectionList(index)
      }
    },
    async fetchApi() {
      await this.getKuzzlePublicApi()
      await this.fetchIndexList()
    }
  },
  async mounted() {
    await this.fetchApi()
    await this.getKuzzleOpenApi()
    this.loading = true
    this.loadStoredQueriesFromLocalStorage()
    this.newTab()
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
::v-deep .card-title {
  margin-bottom: 0px;
}
::v-deep .titleItem {
  min-width: 200px;
  border: 1px solid #d5d5d5 !important;
}

.backgroundCard {
  background-color: $light-grey-color;
}

.DataLayout-vertical {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.DataLayout-sidebarWrapper-vertical {
  min-width: $sidebar-width;
  width: $sidebar-width;
  height: 100%;
  z-index: 1;
}

.DataLayout-contentWrapper-vertical {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
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
